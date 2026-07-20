# Getting REZONANCE to "GTA 6-level" realism

A practical roadmap, from what ships in this repo today to the honest ceiling
of what a browser can do. Each tier is a real, buildable step — no magic.

## Tier 0 — shipped in this repo (procedural, zero assets)

The 3D mode (`V` in game, `src/js/render3d.js`) now runs a full
night-city realism pipeline, all generated in code:

- **PCF soft shadow mapping** from a moon key light whose shadow frustum
  follows the player, so buildings, cars, drones, and pedestrians all cast
  and catch shadows.
- **Wet-street planar reflections** — the lit city (window facades, street
  lamps, neon signs, car lights, the player) is mirrored below a translucent
  asphalt plane, with sharper "standing water" puddle patches. This is the
  single biggest "rainy AAA city at night" read.
- **512px procedural facades** with per-window color temperature (warm homes,
  cool offices, TV glow), half-drawn blinds, dark floors, ledges, storefront
  bands — plus a separate emissive map so only glass glows.
- **Procedural sky dome**: star field, moon with halo, drifting cloud murk.
- **Pooled dynamic lights**: the six street lamps and four car-headlight
  spotlights nearest the player carry real lights; everything else glows
  through emissives and bloom.
- **Atmosphere**: wind-slanted rain streaks, exponential fog, emitter
  sky-beams, drone scan cones in the air, blinking aircraft-warning beacons,
  flickering neon.
- **Post-processing**: threshold bloom (quarter-res separable blur),
  chromatic aberration, film grain, vignette, ACES tone mapping with
  lightning-driven exposure kicks, MSAA — with an auto quality governor
  that sheds the post chain and shadows on weak GPUs.

## Tier 1 — asset-based PBR (same engine, big visual jump)

The gap between "stylized" and "photoreal" is mostly *assets*, not code:

1. **GLTF/GLB props**: photoscanned or generated street furniture, vehicles,
   and a rigged player character with skeletal walk/sprint animation
   (Mixamo-style clips). Three.js loads these natively with `GLTFLoader`.
2. **Real PBR texture sets** (albedo/normal/roughness) for asphalt, concrete,
   and glass instead of canvas-painted maps — normal maps alone double the
   perceived detail under the existing lights.
3. **Screen-space ambient occlusion + TAA** (three.js `postprocessing`
   passes) to ground objects and stabilize the image in motion.
4. **Baked lightmaps / irradiance probes** for bounce light in the streets —
   offline global illumination quality at runtime cost of a texture fetch.
5. **LOD + impostors** so asset density can rise without killing frame rate.

## Tier 2 — WebGPU

Three.js's `WebGPURenderer` (and TSL node materials) unlocks compute-driven
rain/crowd simulation, clustered lighting (hundreds of real lights instead of
ten), and higher-quality AA — the technical foundation console games assume.
Same scene graph, so the Tier 0/1 work carries over.

## Tier 3 — the honest ceiling

Actual GTA 6 visuals (dynamic global illumination, film-quality characters,
micro-polygon geometry) are an AAA-engine feature set that no browser runtime
reaches natively today. The proven route to those pixels in a browser tab is
**pixel streaming**: run the scene in Unreal Engine 5 (Lumen + Nanite) on a
cloud GPU and stream the frames — exactly the model cloud-gaming services use
for GTA-class titles. If REZONANCE ever needs that jump, the game logic in
`game.js` (world sim, detection, weather) ports; the renderer is replaced
rather than upgraded.
