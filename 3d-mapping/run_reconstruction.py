#!/usr/bin/env python3
"""Run LingBot-Map streaming 3D reconstruction with project presets.

Thin wrapper around the upstream demo (lingbot-map/demo.py) so common runs
need only a video/image path. Anything after `--` is passed through to the
upstream demo unchanged, e.g.:

    python run_reconstruction.py --video seq.mp4 -- --use_sdpa
"""

import argparse
import glob
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
UPSTREAM_DEMO = os.path.join(HERE, "lingbot-map", "demo.py")
CKPT_DIR = os.path.join(HERE, "checkpoints")


def find_checkpoint(explicit: str | None) -> str:
    if explicit:
        if not os.path.isfile(explicit):
            sys.exit(f"Checkpoint not found: {explicit}")
        return explicit
    candidates = sorted(glob.glob(os.path.join(CKPT_DIR, "**", "*.pt"), recursive=True))
    if not candidates:
        sys.exit(
            f"No .pt checkpoint found under {CKPT_DIR}. "
            "Run setup_lingbot_map.sh first or pass --model-path."
        )
    if len(candidates) > 1:
        print(f"Multiple checkpoints found, using {candidates[0]}", file=sys.stderr)
    return candidates[0]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--video", help="Path to input video file")
    source.add_argument("--images", help="Path to folder of input images")
    parser.add_argument("--model-path", help="Path to a .pt checkpoint (default: auto-detect in ./checkpoints)")
    parser.add_argument("--fps", type=int, default=10, help="Frame sampling rate for video input (default: 10)")
    parser.add_argument("--mask-sky", action="store_true", help="Mask sky regions (outdoor scenes; needs onnxruntime)")
    parser.add_argument(
        "--preset",
        choices=["streaming", "long"],
        default="streaming",
        help="'streaming' for normal sequences, 'long' for >3000 frames (windowed mode)",
    )
    parser.add_argument("--low-memory", action="store_true", help="Offload to CPU and reduce scale frames for small GPUs")
    args, passthrough = parser.parse_known_args()
    if passthrough and passthrough[0] == "--":
        passthrough = passthrough[1:]

    if not os.path.isfile(UPSTREAM_DEMO):
        sys.exit(f"Upstream demo not found at {UPSTREAM_DEMO}. Run setup_lingbot_map.sh first.")

    cmd = [sys.executable, UPSTREAM_DEMO, "--model_path", find_checkpoint(args.model_path)]

    if args.video:
        cmd += ["--video_path", args.video, "--fps", str(args.fps)]
    else:
        cmd += ["--image_folder", args.images]

    if args.mask_sky:
        cmd += ["--mask_sky"]

    if args.preset == "long":
        cmd += [
            "--mode", "windowed",
            "--window_size", "128",
            "--overlap_keyframes", "16",
            "--keyframe_interval", "2",
        ]

    if args.low_memory:
        cmd += ["--offload_to_cpu", "--num_scale_frames", "2"]

    cmd += passthrough

    print("Running:", " ".join(cmd))
    raise SystemExit(subprocess.call(cmd))


if __name__ == "__main__":
    main()
