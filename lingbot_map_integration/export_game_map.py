#!/usr/bin/env python3
"""Export a LingBot-Map 3D reconstruction as a U.S. Robotic ARMY game map.

LingBot-Map (https://github.com/robbyant/lingbot-map) reconstructs a 3D point
cloud and camera trajectory from streaming video. This script runs its
inference on your footage (drone flyover, bodycam, phone walk-through) and
converts the result into the game's "usra-map-v1" JSON format, so the
reconstructed real-world scene becomes the playable battlefield.

Two modes:

1. Direct inference (requires lingbot-map installed + CUDA GPU + checkpoint):
     python export_game_map.py --images path/to/frames --model /path/lingbot-map.pt \
         --out ../game/maps/my_scene --name "My Scene"
     python export_game_map.py --video flyover.mp4 --model /path/lingbot-map.pt \
         --out ../game/maps/my_scene --name "My Scene" --stride 3

2. PLY conversion (no GPU needed here — convert a point cloud you already
   exported from LingBot-Map's viewer or any other tool):
     python export_game_map.py --ply scene.ply --out ../game/maps/my_scene --name "My Scene"

Then play it:  open game/index.html via a local server and visit
               http://localhost:8000/game/index.html?map=my_scene

Install for direct inference (see the lingbot-map README for details):
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
    git clone https://github.com/robbyant/lingbot-map && pip install -e lingbot-map
"""

import argparse
import json
import math
import os
import struct
import sys
import warnings

import numpy as np


# --------------------------------------------------------------------- inference

def run_lingbot_inference(args):
    """Run LingBot-Map on a video/image folder. Returns (points Nx3, colors Nx3 uint8, cam_path Mx3)."""
    try:
        import torch
        from lingbot_map.utils.load_fn import load_and_preprocess_images
        from lingbot_map.utils.pose_enc import pose_encoding_to_extri_intri
    except ImportError as e:
        sys.exit(
            f"error: {e}\n"
            "Direct inference needs PyTorch and the lingbot-map package installed:\n"
            "  git clone https://github.com/robbyant/lingbot-map && pip install -e lingbot-map\n"
            "Alternatively export a .ply from LingBot-Map's viewer and use --ply (no GPU needed)."
        )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        print("warning: no CUDA GPU detected — LingBot-Map inference will be extremely slow", file=sys.stderr)

    frames_dir = args.images
    if args.video:
        frames_dir = extract_frames(args.video, args.stride)

    image_paths = sorted(
        os.path.join(frames_dir, f) for f in os.listdir(frames_dir)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )
    if args.images and args.stride > 1:
        image_paths = image_paths[:: args.stride]
    if not image_paths:
        sys.exit(f"error: no images found in {frames_dir}")
    print(f"loaded {len(image_paths)} frames")

    images = load_and_preprocess_images(image_paths).to(device)

    windowed = len(image_paths) > 320 or args.windowed
    if windowed:
        from lingbot_map.models.gct_stream_window import GCTStream
    else:
        from lingbot_map.models.gct_stream import GCTStream

    model = GCTStream()
    ckpt = torch.load(args.model, map_location=device)
    state_dict = ckpt.get("model", ckpt) if isinstance(ckpt, dict) else ckpt
    model.load_state_dict(state_dict, strict=False)
    model = model.to(device).eval()

    with torch.no_grad():
        if windowed:
            predictions = model.inference_windowed(images, output_device=device)
        else:
            predictions = model.inference_streaming(images, output_device=device)

    # World points: (S, H, W, 3) after squeezing the batch dim; confidence same shape
    world_points = predictions["world_points"].squeeze(0).cpu().numpy()
    conf = predictions["world_points_conf"].squeeze(0).cpu().numpy()
    imgs = predictions["images"].squeeze(0).cpu().numpy()  # (S, 3, H, W) in [0, 1]

    pts = world_points.reshape(-1, 3)
    cols = (np.transpose(imgs, (0, 2, 3, 1)).reshape(-1, 3) * 255).astype(np.uint8)
    mask = conf.reshape(-1) >= args.conf_threshold
    pts, cols = pts[mask], cols[mask]
    print(f"{len(pts)} points above confidence {args.conf_threshold}")

    # Camera trajectory from pose encodings
    cam_path = []
    try:
        extrinsic, _ = pose_encoding_to_extri_intri(predictions["pose_enc"], imgs.shape[-2:])
        extr = extrinsic.squeeze(0).cpu().numpy()  # (S, 3, 4) world-to-cam or cam-to-world
        for E in extr:
            R, t = E[:, :3], E[:, 3]
            # camera center: -R^T t for world-to-cam convention
            cam_path.append((-R.T @ t).tolist())
    except Exception as e:
        print(f"warning: could not extract camera path ({e})", file=sys.stderr)

    return pts, cols, np.array(cam_path) if cam_path else None


def extract_frames(video_path, stride):
    """Dump video frames to a temp folder with OpenCV."""
    try:
        import cv2
    except ImportError:
        sys.exit("error: --video requires opencv-python (pip install opencv-python), "
                 "or pre-extract frames with ffmpeg and use --images")
    out_dir = os.path.join(os.path.dirname(os.path.abspath(video_path)),
                           "_frames_" + os.path.splitext(os.path.basename(video_path))[0])
    os.makedirs(out_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    i = kept = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if i % max(stride, 1) == 0:
            cv2.imwrite(os.path.join(out_dir, f"{kept:06d}.jpg"), frame)
            kept += 1
        i += 1
    cap.release()
    print(f"extracted {kept} frames from {video_path} (stride {stride})")
    return out_dir


# --------------------------------------------------------------------------- ply

def read_ply(path):
    """Minimal PLY reader (ascii + binary_little_endian) for x,y,z[,r,g,b]."""
    with open(path, "rb") as f:
        if f.readline().strip() != b"ply":
            sys.exit(f"error: {path} is not a PLY file")
        fmt = None
        count = 0
        props = []
        in_vertex = False
        while True:
            line = f.readline().strip()
            if line.startswith(b"format"):
                fmt = line.split()[1].decode()
            elif line.startswith(b"element"):
                parts = line.split()
                in_vertex = parts[1] == b"vertex"
                if in_vertex:
                    count = int(parts[2])
            elif line.startswith(b"property") and in_vertex:
                parts = line.split()
                props.append((parts[2].decode(), parts[1].decode()))
            elif line == b"end_header":
                break

        names = [p[0] for p in props]
        if fmt == "ascii":
            data = np.loadtxt(f, max_rows=count)
            if data.ndim == 1:
                data = data[None]
            table = {n: data[:, i] for i, n in enumerate(names)}
        elif fmt == "binary_little_endian":
            fmt_map = {"float": "f", "float32": "f", "double": "d", "uchar": "B",
                       "uint8": "B", "int": "i", "uint": "I", "short": "h", "ushort": "H"}
            rec = "<" + "".join(fmt_map[p[1]] for p in props)
            size = struct.calcsize(rec)
            raw = f.read(size * count)
            rows = list(struct.iter_unpack(rec, raw))
            arr = np.array(rows)
            table = {n: arr[:, i] for i, n in enumerate(names)}
        else:
            sys.exit(f"error: unsupported PLY format {fmt}")

    pts = np.stack([table["x"], table["y"], table["z"]], axis=1).astype(np.float64)
    if all(k in table for k in ("red", "green", "blue")):
        cols = np.stack([table["red"], table["green"], table["blue"]], axis=1)
        if cols.max() <= 1.0:
            cols = cols * 255
        cols = cols.astype(np.uint8)
    else:
        cols = np.full((len(pts), 3), 150, np.uint8)
    print(f"read {len(pts)} points from {path}")
    return pts, cols


# -------------------------------------------------------------------- processing

def orient_y_up(pts, cam_path, up_axis):
    """Remap axes so gravity is -Y (the game is Y-up). LingBot-Map scenes are
    typically camera-convention (Y down, Z forward), so the default flips Y."""
    remaps = {
        "y": np.diag([1.0, 1.0, 1.0]),           # already Y-up
        "-y": np.diag([1.0, -1.0, -1.0]),        # Y-down (camera convention)
        "z": np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], float),   # Z-up
        "-z": np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], float),  # Z-down
    }
    R = remaps[up_axis]
    pts = pts @ R.T
    if cam_path is not None:
        cam_path = cam_path @ R.T
    return pts, cam_path


def clean_and_scale(pts, cols, cam_path, target_size):
    """Center the scene, drop far outliers, scale to a playable extent."""
    center = np.median(pts, axis=0)
    pts = pts - center
    if cam_path is not None:
        cam_path = cam_path - center

    r = np.linalg.norm(pts[:, [0, 2]], axis=1)
    keep = r <= np.percentile(r, 98)  # trim stray far points
    pts, cols = pts[keep], cols[keep]

    extent = np.percentile(np.abs(pts[:, [0, 2]]), 97) * 2
    scale = target_size / max(extent, 1e-6)
    pts = pts * scale
    if cam_path is not None:
        cam_path = cam_path * scale
    print(f"scene scaled x{scale:.3f} to ~{target_size:.0f} m across")

    # rest ground at y=0
    ground = np.percentile(pts[:, 1], 5)
    pts[:, 1] -= ground
    if cam_path is not None:
        cam_path[:, 1] -= ground
    return pts, cols, cam_path


def voxel_downsample(pts, cols, voxel, max_points):
    key = np.floor(pts / voxel).astype(np.int64)
    _, idx = np.unique(key, axis=0, return_index=True)
    while len(idx) > max_points:
        voxel *= 1.3
        key = np.floor(pts / voxel).astype(np.int64)
        _, idx = np.unique(key, axis=0, return_index=True)
    print(f"downsampled to {len(idx)} points (voxel {voxel:.2f} m)")
    return pts[idx], cols[idx]


def build_height_grid(pts, nx=96, nz=96):
    """Per-cell low-percentile height = walkable ground under clutter."""
    min_x, max_x = pts[:, 0].min(), pts[:, 0].max()
    min_z, max_z = pts[:, 2].min(), pts[:, 2].max()
    cell = max(max_x - min_x, max_z - min_z) / (nx - 1)
    heights = np.full(nx * nz, np.nan)
    ix = np.clip(((pts[:, 0] - min_x) / cell).astype(int), 0, nx - 1)
    iz = np.clip(((pts[:, 2] - min_z) / cell).astype(int), 0, nz - 1)
    flat = iz * nx + ix
    order = np.argsort(flat)
    flat_s, y_s = flat[order], pts[order, 1]
    bounds = np.searchsorted(flat_s, np.arange(nx * nz + 1))
    for c in range(nx * nz):
        lo, hi = bounds[c], bounds[c + 1]
        if hi > lo:
            heights[c] = np.percentile(y_s[lo:hi], 15)

    # fill empty cells by diffusion from neighbors
    grid = heights.reshape(nz, nx)
    for _ in range(nx + nz):
        nan = np.isnan(grid)
        if not nan.any():
            break
        padded = np.pad(grid, 1, constant_values=np.nan)
        stack = np.stack([padded[1:-1, :-2], padded[1:-1, 2:], padded[:-2, 1:-1], padded[2:, 1:-1]])
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)
            fill = np.nanmean(stack, axis=0)
        grid[nan] = fill[nan]
    grid = np.nan_to_num(grid, nan=0.0)

    return {
        "nx": nx, "nz": nz,
        "minX": float(min_x), "minZ": float(min_z),
        "cell": float(cell),
        "heights": [round(float(h), 2) for h in grid.reshape(-1)],
    }


def place_spawns(grid, cam_path):
    """Player spawns at the trajectory start, enemies at the end, objectives between.
    Falls back to map corners when no camera path is available."""
    nx, nz, cell = grid["nx"], grid["nz"], grid["cell"]
    min_x, min_z = grid["minX"], grid["minZ"]
    cx = min_x + (nx - 1) * cell / 2
    cz = min_z + (nz - 1) * cell / 2
    span = (nx - 1) * cell

    if cam_path is not None and len(cam_path) >= 4:
        p0, p1 = np.asarray(cam_path[0]), np.asarray(cam_path[-1])
        third = np.asarray(cam_path[len(cam_path) // 3])
        two_thirds = np.asarray(cam_path[2 * len(cam_path) // 3])
        mid = np.asarray(cam_path[len(cam_path) // 2])
        side = np.array([p1[2] - p0[2], 0, -(p1[0] - p0[0])])
        n = np.linalg.norm(side)
        side = side / n * span * 0.12 if n > 1e-6 else np.array([span * 0.12, 0, 0])
        player = [[p0[0] + dx, p0[2] + dz] for dx, dz in
                  [(-side[0], -side[2]), (0, 0), (side[0], side[2]), (-2 * side[0], -2 * side[2])]]
        enemy = [[p1[0] - side[0], p1[2] - side[2]], [p1[0], p1[2]], [p1[0] + side[0], p1[2] + side[2]]]
        objectives = [[third[0], third[2]], [mid[0] + side[0], mid[2] + side[2]], [two_thirds[0], two_thirds[2]]]
    else:
        q = span * 0.38
        player = [[cx - 4, cz - q], [cx, cz - q], [cx + 4, cz - q], [cx, cz - q + 4]]
        enemy = [[cx - q * 0.4, cz + q], [cx + q * 0.4, cz + q], [cx, cz + q]]
        objectives = [[cx, cz - q * 0.4], [cx - q * 0.5, cz + q * 0.15], [cx + q * 0.4, cz + q * 0.55]]

    rnd = lambda p: [round(float(p[0]), 2), round(float(p[1]), 2)]
    return {"player": [rnd(p) for p in player],
            "enemy": [rnd(p) for p in enemy],
            "objectives": [rnd(p) for p in objectives]}


# -------------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--images", help="Folder of frames to reconstruct with LingBot-Map")
    src.add_argument("--video", help="Video file to reconstruct with LingBot-Map")
    src.add_argument("--ply", help="Existing point-cloud .ply to convert (no GPU needed)")
    ap.add_argument("--model", help="Path to lingbot-map.pt checkpoint (required with --images/--video)")
    ap.add_argument("--out", required=True, help="Output base path, e.g. ../game/maps/my_scene")
    ap.add_argument("--name", default="Reconstructed Scene")
    ap.add_argument("--stride", type=int, default=2, help="Frame sampling interval")
    ap.add_argument("--conf-threshold", type=float, default=1.5, help="LingBot-Map confidence filter")
    ap.add_argument("--windowed", action="store_true", help="Force windowed inference (long sequences)")
    ap.add_argument("--up-axis", choices=["y", "-y", "z", "-z"], default="-y",
                    help="Which source axis points up (default -y: camera convention)")
    ap.add_argument("--target-size", type=float, default=90.0, help="Playable map extent in meters")
    ap.add_argument("--max-points", type=int, default=60000, help="Point budget after downsampling")
    ap.add_argument("--voxel", type=float, default=0.35, help="Initial downsample voxel size (m)")
    args = ap.parse_args()

    cam_path = None
    if args.ply:
        pts, cols = read_ply(args.ply)
        source = "lingbot-map"
    else:
        if not args.model:
            sys.exit("error: --model is required with --images/--video")
        pts, cols, cam_path = run_lingbot_inference(args)
        source = "lingbot-map"

    pts, cam_path = orient_y_up(pts, cam_path, args.up_axis)
    pts, cols, cam_path = clean_and_scale(pts, cols, cam_path, args.target_size)
    pts, cols = voxel_downsample(pts, cols, args.voxel, args.max_points)
    grid = build_height_grid(pts)
    spawns = place_spawns(grid, cam_path)

    map_data = {
        "format": "usra-map-v1",
        "name": args.name,
        "source": source,
        "units": "meters",
        "positions": [round(float(v), 2) for v in pts.reshape(-1)],
        "colors": [int(v) for v in cols.reshape(-1)],
        "heightGrid": grid,
        "cameraPath": [[round(float(v), 2) for v in p] for p in cam_path] if cam_path is not None else [],
        "spawns": spawns,
    }

    json_path = args.out + ".json"
    js_path = args.out + ".js"
    os.makedirs(os.path.dirname(os.path.abspath(json_path)), exist_ok=True)
    with open(json_path, "w") as f:
        json.dump(map_data, f, separators=(",", ":"))
    with open(js_path, "w") as f:
        f.write("window.EMBEDDED_MAP = ")
        json.dump(map_data, f, separators=(",", ":"))
        f.write(";\n")

    base = os.path.splitext(os.path.basename(json_path))[0]
    print(f"wrote {json_path} and {js_path}")
    print(f"play it: http://localhost:8000/game/index.html?map={base}")


if __name__ == "__main__":
    main()
