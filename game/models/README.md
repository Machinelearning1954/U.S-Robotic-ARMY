# Custom game models (Tripo3D)

Drop `.glb` models in this folder and reference them in `manifest.json` to
replace the game's built-in placeholder meshes:

| Role        | Used for                              | Auto-scaled to |
|-------------|---------------------------------------|----------------|
| `unit`      | your four robotic ground units        | 2.6 m          |
| `drone`     | hostile aerial drones                 | 1.5 m          |
| `objective` | a prop at the center of capture zones | 3.5 m          |

Two ways to get models:

1. **Tripo3D Studio** — generate at <https://studio.tripo3d.ai> (text or image
   to 3D), download as GLB, save it here, and set `"file"` in `manifest.json`.
2. **Tripo3D API** — from the repo root:
   ```bash
   export TRIPO_API_KEY=tsk_...   # from https://platform.tripo3d.ai
   python tripo_integration/generate_asset.py \
       --prompt "quadruped military robot, olive drab armor" --role unit
   ```
   This generates the model, downloads the GLB here, and updates the manifest.

Per-model tuning in `manifest.json`: `scale` multiplies the auto-fit size,
`rotateY` (degrees) fixes models that face sideways, `yOffset` (meters) nudges
them vertically. Models load when the game is served over HTTP; from `file://`
the game silently uses its built-in meshes.
