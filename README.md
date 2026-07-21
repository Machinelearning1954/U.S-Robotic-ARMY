# U.S. Robotic ARMY

A browser-based 3D tactical game where robotic ground units secure objectives
on battlefields reconstructed from real video by
[LingBot-Map](https://github.com/robbyant/lingbot-map).

## Play

No build step. Either open `game/index.html` directly in a browser (plays the
bundled *Training Grounds* map), or serve the repo to load other maps:

```bash
python -m http.server 8000
# → http://localhost:8000/game/index.html
# → http://localhost:8000/game/index.html?map=<scene>   (any map in game/maps/)
```

**Controls:** left-click selects a robot (or keys 1–4), right-click issues a
move order, drag orbits the camera, wheel zooms, and Space plays a recon
flyover along the map's reconstruction camera path. Capture all three
objectives by holding them for 5 seconds each while fending off hostile drone
waves; lose every unit and the mission fails.

## LingBot-Map integration

LingBot-Map is a feed-forward 3D foundation model that reconstructs point
clouds and camera poses from streaming video at ~20 FPS. This repo integrates
it as the game's map pipeline: film any real scene, reconstruct it, and play
on it.

- `lingbot_map_integration/export_game_map.py` — runs LingBot-Map inference on
  a video or image folder (or converts an exported `.ply`) and writes a game
  map: point-cloud terrain, walkable heightfield, camera flyover path, and
  auto-placed spawns/objectives.
- `lingbot_map_integration/make_demo_map.py` — dependency-free procedural map
  generator used to create the bundled demo map.
- `game/` — the Three.js game; loads any `usra-map-v1` map from `game/maps/`.

See [`lingbot_map_integration/README.md`](lingbot_map_integration/README.md)
for the full pipeline and map format.

## Tripo3D integration

Unit, drone, and objective models can be AI-generated with
[Tripo3D](https://studio.tripo3d.ai) instead of the built-in placeholder
meshes. Either generate in Tripo Studio and drop the GLB into `game/models/`
(see [`game/models/README.md`](game/models/README.md)), or use the API
end-to-end:

```bash
export TRIPO_API_KEY=tsk_...   # from https://platform.tripo3d.ai
python tripo_integration/generate_asset.py \
    --prompt "quadruped military robot, olive drab armor, game asset" --role unit
python tripo_integration/generate_asset.py \
    --prompt "menacing red combat quadcopter drone" --role drone
```

`generate_asset.py` creates the Tripo task, polls it, downloads the GLB into
`game/models/`, and updates `manifest.json`. The game auto-scales each model
to gameplay size and falls back to its procedural meshes when a model is
missing, so custom assets are always optional.

## Repository layout

```
game/                     # the game (open index.html to play)
  js/main.js              # gameplay: units, drones, objectives, rendering
  maps/                   # usra-map-v1 maps (.json + embedded .js)
  models/                 # optional Tripo3D-generated GLB assets
lingbot_map_integration/  # LingBot-Map → game map pipeline
tripo_integration/        # Tripo3D → game asset generator
```
