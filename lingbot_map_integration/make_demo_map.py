#!/usr/bin/env python3
"""Generate a procedural demo battlefield map in the U.S. Robotic ARMY map format.

This produces the same JSON structure that export_game_map.py emits from real
LingBot-Map reconstructions, so the game can be developed and played without a
GPU or model checkpoint. No third-party dependencies required.

Usage:
    python make_demo_map.py --out ../game/maps/training_grounds --name "Training Grounds"
"""

import argparse
import json
import math
import random


def terrain_height(x, z):
    """Layered sine 'noise' heightfield, in meters."""
    h = 0.0
    h += 1.8 * math.sin(x * 0.055 + 1.3) * math.cos(z * 0.047 - 0.7)
    h += 0.9 * math.sin(x * 0.13 - 2.1) * math.sin(z * 0.11 + 0.4)
    h += 0.35 * math.sin(x * 0.31 + z * 0.27)
    # Flatten a central corridor so units can maneuver
    corridor = math.exp(-((x * 0.03) ** 2))
    return h * (1.0 - 0.55 * corridor)


def height_color(y, slope):
    """Muted military palette: dust, olive, concrete grey on slopes."""
    if slope > 0.55:
        base = (118, 112, 104)  # rock/concrete
    elif y > 1.2:
        base = (128, 122, 96)   # dry ridge
    elif y < -0.8:
        base = (96, 104, 82)    # low wet ground
    else:
        base = (110, 116, 88)   # olive field
    j = random.randint(-8, 8)
    return tuple(max(0, min(255, c + j)) for c in base)


def build_map(name, size=90.0, target_points=32000, seed=7):
    random.seed(seed)
    half = size / 2.0
    positions, colors = [], []

    # Ground point cloud
    n_ground = int(target_points * 0.82)
    for _ in range(n_ground):
        x = random.uniform(-half, half)
        z = random.uniform(-half, half)
        y = terrain_height(x, z)
        eps = 0.6
        slope = abs(terrain_height(x + eps, z) - y) + abs(terrain_height(x, z + eps) - y)
        r, g, b = height_color(y, slope)
        positions += [round(x, 2), round(y, 2), round(z, 2)]
        colors += [r, g, b]

    # Ruined structures: hollow box shells of points
    n_structs = 14
    for _ in range(n_structs):
        cx = random.uniform(-half * 0.8, half * 0.8)
        cz = random.uniform(-half * 0.8, half * 0.8)
        if abs(cx) < 8 and abs(cz) < 20:
            continue  # keep the corridor clear
        w = random.uniform(3, 7)
        d = random.uniform(3, 7)
        h = random.uniform(2.5, 6)
        base_y = terrain_height(cx, cz)
        shade = random.randint(95, 135)
        for _ in range(420):
            face = random.randint(0, 3)
            fy = base_y + random.uniform(0, h)
            if face == 0:
                px, pz = cx - w / 2, cz + random.uniform(-d / 2, d / 2)
            elif face == 1:
                px, pz = cx + w / 2, cz + random.uniform(-d / 2, d / 2)
            elif face == 2:
                px, pz = cx + random.uniform(-w / 2, w / 2), cz - d / 2
            else:
                px, pz = cx + random.uniform(-w / 2, w / 2), cz + d / 2
            if random.random() < 0.25 and fy - base_y > h * 0.55:
                continue  # battle damage: missing chunks near the top
            positions += [round(px, 2), round(fy, 2), round(pz, 2)]
            c = shade + random.randint(-10, 10)
            colors += [c, c, max(0, c - 6)]

    # Height grid for unit movement (ground only, analytic)
    nx = nz = 96
    cell = size / (nx - 1)
    heights = []
    for iz in range(nz):
        for ix in range(nx):
            gx = -half + ix * cell
            gz = -half + iz * cell
            heights.append(round(terrain_height(gx, gz), 2))

    # A simple "recon flight" camera path down the corridor
    camera_path = []
    for i in range(40):
        t = i / 39.0
        cx = math.sin(t * math.pi * 2) * 6.0
        cz = -half * 0.9 + t * size * 0.9
        camera_path.append([round(cx, 2), round(terrain_height(cx, cz) + 4.0, 2), round(cz, 2)])

    return {
        "format": "usra-map-v1",
        "name": name,
        "source": "procedural",
        "units": "meters",
        "positions": positions,
        "colors": colors,
        "heightGrid": {
            "nx": nx, "nz": nz,
            "minX": -half, "minZ": -half,
            "cell": cell,
            "heights": heights,
        },
        "cameraPath": camera_path,
        "spawns": {
            "player": [[-6, -half * 0.82], [0, -half * 0.86], [6, -half * 0.82], [0, -half * 0.78]],
            "enemy": [[-10, half * 0.8], [10, half * 0.8], [0, half * 0.86]],
            "objectives": [[0, -half * 0.35], [-14, 6], [12, half * 0.45]],
        },
    }


def write_map(map_data, out_base):
    json_path = out_base + ".json"
    js_path = out_base + ".js"
    with open(json_path, "w") as f:
        json.dump(map_data, f, separators=(",", ":"))
    # JS wrapper so the game can load the map from file:// without fetch/CORS
    with open(js_path, "w") as f:
        f.write("window.EMBEDDED_MAP = ")
        json.dump(map_data, f, separators=(",", ":"))
        f.write(";\n")
    return json_path, js_path


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="../game/maps/training_grounds",
                    help="Output path base (writes <out>.json and <out>.js)")
    ap.add_argument("--name", default="Training Grounds")
    ap.add_argument("--size", type=float, default=90.0, help="Map side length in meters")
    ap.add_argument("--points", type=int, default=32000, help="Approx point count")
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()

    m = build_map(args.name, size=args.size, target_points=args.points, seed=args.seed)
    jp, sp = write_map(m, args.out)
    n = len(m["positions"]) // 3
    print(f"Wrote {jp} and {sp} ({n} points)")


if __name__ == "__main__":
    main()
