# Forge3D Studio — free-tier AI 3D studio clone

A self-contained, brand-neutral recreation of the free tier of an AI 3D
generation studio (functionally modeled on [Tripo3D Studio](https://studio.tripo3d.ai/)'s
free plan). Everything runs from static files — no build step, no server-side
code, no external network requests.

## Features (mirroring the free tier)

- **Featured model gallery** with live 3D previews, category / model-type /
  use-case filters (kept in the URL query string, like the original), and search.
- **Interactive 3D viewer** — orbit, zoom, auto-rotate, AR-capable via
  Google's `<model-viewer>` web component (vendored locally).
- **Text-to-3D and Image-to-3D generation panel** with style selection, a task
  queue with staged progress (Queued → Meshing → Texturing → Finishing), and
  generated results added to the gallery.
- **Free-plan credit system** — 600 credits/month, 25 per generation, persisted
  in `localStorage` with an automatic monthly reset.
- **GLB download** for every model, as on the free plan.

## Run it

Any static file server works:

```bash
cd 3d-studio
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening `index.html` via `file://` also works in browsers that allow module
scripts from file URLs; a local server is the reliable option.)

## What is real vs. simulated

The UI, gallery, viewer, filters, credits, and downloads are fully functional.
**Generation is simulated**: the pipeline stages run locally and the "generated"
result is drawn from the bundled sample models — there is no AI backend in a
static page. To make generation real, replace the `genBtn.onclick` handler in
`index.html` with a call to your backend of choice, e.g.:

- the official [Tripo API](https://platform.tripo3d.ai/) (has a free quota), or
- any image/text → GLB service you have access to.

The handler already produces `{name, src}` records for the gallery, so the only
change needed is swapping the simulated result for the URL of the returned GLB.

## Bundled assets

- `assets/vendor/model-viewer.min.js` — © Google, Apache 2.0, from the
  [`@google/model-viewer`](https://www.npmjs.com/package/@google/model-viewer) npm package (v3.5.0).
- `assets/models/*.glb` — sample models from
  [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)
  (Duck, Fox, CesiumMan, CesiumMilkTruck, DamagedHelmet, BrainStem); see that
  repository for individual model licenses.
