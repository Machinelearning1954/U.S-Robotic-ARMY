# U.S-Robotic-ARMY

Robotics perception project. This repository is organized as a series of capability
modules; the current module adds real-time 3D scene understanding.

## Modules

| Module | Description |
|--------|-------------|
| [`3d-mapping/`](3d-mapping/) | Streaming 3D scene reconstruction from ordinary RGB video using [LingBot-Map](https://github.com/Robbyant/lingbot-map), a feed-forward 3D foundation model. Produces camera poses, dense depth, and world-space point clouds at ~20 FPS without depth hardware. |

## Getting started

See [`3d-mapping/README.md`](3d-mapping/README.md) for installation and usage. The
short version:

```bash
cd 3d-mapping
bash setup_lingbot_map.sh          # clone LingBot-Map, install deps, fetch checkpoint
python run_reconstruction.py --video /path/to/video.mp4
```

## License

This repository is licensed under the terms in [LICENSE](LICENSE). LingBot-Map is a
third-party project released under the Apache License 2.0.
