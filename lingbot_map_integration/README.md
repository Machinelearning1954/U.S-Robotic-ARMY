# LingBot-Map → Game Integration

This folder bridges [LingBot-Map](https://github.com/robbyant/lingbot-map) — a
feed-forward 3D reconstruction model that turns streaming video into point
clouds and camera poses — and the U.S. Robotic ARMY game in `../game/`.

The pipeline: film a real scene (drone flyover, walk-through), let LingBot-Map
reconstruct it in 3D, export it with `export_game_map.py`, and the game uses the
reconstruction as its playable battlefield — terrain, unit navigation heights,
spawn points, and a recon-flyover path derived from the camera trajectory.

```
video / frames ──► LingBot-Map inference ──► point cloud + camera poses
                                                    │
                                        export_game_map.py
                                                    │
                                      game/maps/<scene>.json + .js
                                                    │
                                    game/index.html?map=<scene>
```

## Map format (`usra-map-v1`)

| Field        | Contents                                                              |
|--------------|-----------------------------------------------------------------------|
| `positions`  | Flattened `[x,y,z,…]` floats, meters, Y-up                            |
| `colors`     | Flattened `[r,g,b,…]` 0–255, one per point                            |
| `heightGrid` | 96×96 walkable-ground heightfield (per-cell 15th-percentile height)   |
| `cameraPath` | Reconstruction camera trajectory — drives the in-game recon flyover   |
| `spawns`     | `player` / `enemy` / `objectives` positions, auto-placed along the path |

Each map is written twice: `<name>.json` (fetched when served over HTTP via
`?map=<name>`) and `<name>.js` (a `window.EMBEDDED_MAP` wrapper so the game
also runs straight from `file://`).

## Usage

**A. Direct inference** (needs a CUDA GPU, the `lingbot_map` package, and a
model checkpoint — install per the LingBot-Map README):

```bash
python export_game_map.py --video flyover.mp4 --model /path/lingbot-map.pt \
    --out ../game/maps/my_scene --name "My Scene" --stride 3
# or from pre-extracted frames:
python export_game_map.py --images frames/ --model /path/lingbot-map.pt \
    --out ../game/maps/my_scene --name "My Scene"
```

Sequences longer than ~320 frames automatically use LingBot-Map's windowed
inference (`--windowed` forces it). `--conf-threshold` mirrors LingBot-Map's
confidence filter (default 1.5).

**B. Convert an existing point cloud** (no GPU needed — e.g. a `.ply` saved
from LingBot-Map's interactive viewer):

```bash
python export_game_map.py --ply scene.ply --out ../game/maps/my_scene --name "My Scene"
```

**C. Procedural demo map** (no dependencies at all — this is how the bundled
`training_grounds` map was made):

```bash
python make_demo_map.py --out ../game/maps/training_grounds --name "Training Grounds"
```

## What the exporter does

1. Runs LingBot-Map (`GCTStream.inference_streaming` / `inference_windowed`),
   filters points by `world_points_conf`, and recovers camera centers from
   `pose_enc` via `pose_encoding_to_extri_intri` — or reads your `.ply`.
2. Reorients to Y-up (`--up-axis`, default `-y` for camera convention),
   centers the scene, trims outliers, and scales it to a playable
   `--target-size` (default 90 m).
3. Voxel-downsamples to `--max-points` (default 60k) for smooth rendering.
4. Builds the walkable heightfield and auto-places spawns/objectives along the
   camera trajectory (start = your squad, end = hostiles).

## Playing a generated map

```bash
cd ..
python -m http.server 8000
# open http://localhost:8000/game/index.html?map=my_scene
```

Opening `game/index.html` directly from disk plays the bundled embedded map.
