# 3D Scene Reconstruction with LingBot-Map

This module integrates [LingBot-Map](https://github.com/Robbyant/lingbot-map) — a
feed-forward 3D foundation model for reconstructing scenes from streaming data —
as the 3D mapping backbone for this project.

## Why LingBot-Map

Most dense 3D reconstruction pipelines either require depth hardware (LiDAR,
RGB-D) or run slow iterative optimization (SfM / bundle adjustment). LingBot-Map
instead estimates **camera pose, dense depth, and world-space point maps directly
from ordinary RGB video** in a single feed-forward pass:

- **Geometric Context Transformer (GCT)** — unifies coordinate grounding, dense
  geometric cues, and long-range drift correction in one streaming architecture,
  via anchor context, a pose-reference window, and trajectory memory.
- **True streaming inference** — paged KV-cache attention gives stable ~20 FPS at
  518×378 resolution on sequences exceeding 10,000 frames, so it can run online
  on a moving platform rather than as an offline batch job.
- **State-of-the-art accuracy** — outperforms both prior streaming methods and
  iterative optimization approaches on KITTI, TUM-D, 7-Scenes, ETH3D,
  Tanks and Temples, Oxford Spires, VBR, and NRGBD benchmarks.
- **Permissive license** — Apache 2.0, released by the Robbyant team alongside
  LingBot-Depth, LingBot-VLA, and LingBot-World.

For a robot platform this means a single forward camera is enough to build and
maintain a live 3D map for navigation, obstacle avoidance, and scene analysis.

## Installation

Requirements: Linux, Python 3.10, NVIDIA GPU with CUDA 12.8 drivers.

The provided script clones the upstream repo, creates a conda environment,
installs PyTorch + LingBot-Map, and downloads a checkpoint:

```bash
bash setup_lingbot_map.sh                 # default: balanced "lingbot-map" checkpoint
bash setup_lingbot_map.sh lingbot-map-long   # variant for long sequences / large scenes
```

Manual steps, if you prefer:

```bash
conda create -n lingbot-map python=3.10 -y
conda activate lingbot-map
pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128
git clone https://github.com/Robbyant/lingbot-map.git
cd lingbot-map
pip install -e .
pip install --index-url https://pypi.org/simple flashinfer-python  # recommended backend
pip install -e ".[vis]"        # optional: interactive point-cloud viewer
pip install onnxruntime        # optional: sky masking (onnxruntime-gpu for speed)
```

### Checkpoints

Hosted on Hugging Face ([`robbyant/lingbot-map`](https://huggingface.co/robbyant/lingbot-map))
and ModelScope (`Robbyant/lingbot-map`):

| Checkpoint | Use case |
|------------|----------|
| `lingbot-map` | Balanced — the paper / benchmark version (default) |
| `lingbot-map-long` | Long sequences and large-scale scenes |
| `lingbot-map-stage1` | Stage-1 training checkpoint (research) |

## Usage

`run_reconstruction.py` wraps the upstream demo with presets suited to this
project. It accepts either a video file or a folder of images:

```bash
# Live-style streaming reconstruction from a video
python run_reconstruction.py --video /path/to/flyover.mp4

# From an image folder, with sky masking for outdoor scenes
python run_reconstruction.py --images /path/to/frames/ --mask-sky

# Long sequence (>3000 frames): windowed mode
python run_reconstruction.py --video /path/to/long.mp4 --preset long

# Limited GPU memory
python run_reconstruction.py --video /path/to/video.mp4 --low-memory
```

Under the hood this invokes `lingbot-map/demo.py`, whose streaming inference
(`model.inference_streaming`) or windowed inference (`model.inference_windowed`)
returns a predictions dictionary per sequence:

| Output | Meaning |
|--------|---------|
| `extrinsic` | Camera-to-world poses (3×4) per frame |
| `intrinsic` | Camera calibration per frame |
| `depth`, `depth_conf` | Dense depth map + confidence per frame |
| `world_points`, `world_points_conf` | World-space point map + confidence |
| `images` | Preprocessed input frames |

Poses and geometry can be fed to a downstream planner or fused into an occupancy
grid; the confidence maps are useful for filtering unreliable points before
fusion.

### Performance notes

- **FlashInfer** is the recommended attention backend; pass `--use_sdpa` to the
  upstream demo to fall back to PyTorch SDPA if FlashInfer is unavailable.
- For sequences longer than ~3000 frames use windowed mode
  (`--mode windowed --window_size 128 --overlap_keyframes 16`), which the
  `--preset long` option configures for you.
- On memory-constrained GPUs, `--low-memory` enables `--offload_to_cpu` and
  `--num_scale_frames 2`.

## Upstream reference

- Repo: https://github.com/Robbyant/lingbot-map
- Paper: *Geometric Context Transformer for Streaming 3D Reconstruction*
  (arXiv:2604.14141)

```bibtex
@article{chen2026geometric,
  title={Geometric Context Transformer for Streaming 3D Reconstruction},
  author={Chen, Lin-Zhuo and Gao, Jian and Chen, Yihang and Cheng, Ka Leong
    and Sun, Yipengjing and Hu, Liangxiao and Xue, Nan and Zhu, Xing and
    Shen, Yujun and Yao, Yao and Xu, Yinghao},
  journal={arXiv preprint arXiv:2604.14141},
  year={2026}
}
```
