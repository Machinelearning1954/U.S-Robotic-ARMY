# GLB prop pipeline

The 3D mode can replace its procedural stand-ins with real 3D models. Drop a
`.glb` into `src/assets/props/` with the right name and it loads on the next
district build — no code changes. Missing files are fine; the procedural
versions keep rendering.

| File | Replaces | Scaled to |
| --- | --- | --- |
| `src/assets/props/emitter.glb` | harmonic emitter hardware (under the glow) | 26 units |
| `src/assets/props/vesper.glb` | the player figure | 34 units |
| `src/assets/props/sweeper.glb` | Meridian sweeper drone body | 24 units |
| `src/assets/props/car.glb` | ambient street traffic | 34 units |
| `src/assets/props/ped.glb` | pedestrians | 18 units |
| `src/assets/props/lamp.glb` | street lamp posts | 30 units |
| `src/assets/props/hovercar.glb` | luxury sky hovercars | 60 units |

Every visible entity in 3D mode now routes through this prop table — drop in
GLBs and the whole city upgrades from procedural primitives to real models.

Models are auto-rescaled and recentered (largest dimension → target size,
feet at y=0), so any reasonable export works. The loader
(`src/js/glb.js`, ~180 lines, zero dependencies) handles static GLB meshes
with embedded baseColor textures — exactly what image-to-3D services emit.
Add new prop slots in the `PROPS` table at the top of `src/js/render3d.js`.

## Making props with FastAPI-TRIPOSR (local GPU)

[FastAPI-TRIPOSR](https://github.com/tianyilt/FastAPI-TRIPOSR) wraps the
TripoSR image-to-3D model in a small API — ~2s per model on a decent GPU:

```bash
# inside your TripoSR checkout, with app.py from FastAPI-TRIPOSR
pip install fastapi uvicorn python-multipart
uvicorn app:app --host 0.0.0.0 --port 8000

curl -X POST http://localhost:8000/generate-3d-model/ \
  -H 'Content-Type: application/json' \
  -d '{"image_paths": ["emitter-concept.png"], "remove_bg": true,
       "foreground_ratio": 0.85, "save_format": "glb",
       "output_dir": "out", "render": false}'

cp out/emitter-concept/mesh.glb <repo>/src/assets/props/emitter.glb
```

Best inputs: one object, centered, plain background, three-quarter view,
soft even lighting (product-photography style). Generate concept images
with any image model, or photograph a real object.

## Making props with Higgsfield (hosted, no GPU needed)

From a Claude session with the Higgsfield MCP connected:
`generate_image` (a clean prop shot as above) → `generate_3d` with
`model: image_to_3d`, `should_texture: true`, passing the image job id →
download the `.glb` from the job result and commit it to
`src/assets/props/`.

## Why not full character rigs yet

The loader is static-mesh only. A rigged, animated Vesper (walk/sprint
cycles) needs three's full `GLTFLoader` + `AnimationMixer` — that's the next
step on the Tier 1 roadmap in `docs/REALISM.md`.
