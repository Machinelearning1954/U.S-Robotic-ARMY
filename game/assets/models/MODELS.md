# AI-Generated 3D Models (Tripo3D Studio pipeline)

This folder is where the game loads its AI-generated 3D models from.
The game uses the tech from [Tripo3D Studio](https://studio.tripo3d.ai) —
AI text-to-3D and image-to-3D model generation — as its asset pipeline.

## How it works

1. Open **Tripo3D Studio** (https://studio.tripo3d.ai) and generate a model:
   - **Text to 3D** — e.g. `"US army combat mech robot, olive drab armor, game-ready"`.
   - **Image to 3D** — upload a photo of real-world hardware (a drone, a
     vehicle, a robot) and Tripo reconstructs it as a 3D mesh. This is what
     makes the game "real world": real photographed hardware becomes the
     in-game units.
2. In Tripo, export/download the model in **GLB** format (its default
   game-engine export). Low/medium poly with PBR texture works best.
3. Drop the `.glb` file into this folder (`game/assets/models/`).
4. Register it in [`manifest.json`](manifest.json) under one of the slots
   below.
5. Reload the game. The loader (`game/src/models.js`) auto-scales and
   grounds every model, so no manual rigging or resizing is needed.

## Model slots

| Slot           | Used for                          | In-game height |
| -------------- | --------------------------------- | -------------- |
| `player`       | Your controllable mech            | 3.2 m          |
| `enemy_drone`  | Fast kamikaze hover drones        | 1.6 m          |
| `enemy_walker` | Heavy ranged walker tanks         | 3.6 m          |

Example `manifest.json` once you've exported models from Tripo:

```json
{
  "player": "us_army_mech.glb",
  "enemy_drone": "attack_drone.glb",
  "enemy_walker": "walker_tank.glb"
}
```

Any slot left out of the manifest (or any GLB that fails to load) falls back
to a built-in procedural robot, so the game always runs.

## Suggested Tripo prompts

- `player`: *"US military bipedal combat mech, olive green armor plating,
  glowing green visor, arm-mounted cannon, game asset, low poly PBR"*
- `enemy_drone`: *"hostile quadcopter attack drone, dark red armor, single
  glowing red eye sensor, game asset"*
- `enemy_walker`: *"four-legged robotic walker tank with turret cannon,
  battle-worn dark red armor, game asset"*
