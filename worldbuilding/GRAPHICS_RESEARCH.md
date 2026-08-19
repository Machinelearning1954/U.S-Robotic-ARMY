# PAUDC — Graphics Ceiling Research (Browser + Mobile)

> Engineering notes for pushing the browser build as close to the GTA 6 look as
> physics allows, on the project's target devices. Compiled from a deep-research
> run (2026-07-05) that was **partially rate-limited** — findings below are
> labeled by verification status. Re-run the verification pass before treating
> unverified items as load-bearing.

## Target platforms (canon)

> Engine-rung PC hardware targets — the four PAUDC tiers (Minimum → Future-proof)
> mapped to the community-predicted GTA-6-class PC spec (July 2026), with example
> builds — live in [`../engine/PC_HARDWARE_TARGETS.md`](../engine/PC_HARDWARE_TARGETS.md).


| Tier | Devices | What they get |
|---|---|---|
| **ULTRA** | PC / desktop browsers | render scale up to 1.75x, 2048px shadows, full bloom, 380 palms |
| **HIGH** | iPhone 16 family (A18/A18 Pro), Galaxy Z Fold 6 class (Snapdragon 8 Gen 3), and newer | 1.5x render scale cap, 1024px shadows, bloom at reduced strength |
| **BASE** | older phones | 1x render scale, 512px shadows, no bloom, thinner vegetation |

Detection ships in `game/3d.html` (v0.6): desktop UA → ULTRA; mobile GPUs are
sniffed via `WEBGL_debug_renderer_info` (Apple GPU / A17-A18, Adreno 73x-8xx,
Immortalis, Mali-G715/725 → HIGH) with a devicePixelRatio+screen fallback
heuristic. The adaptive resolution scaler still steps render scale down under
sustained slow frames on every tier, so the tier is a starting point, not a bet.

## WebGPU vs WebGL2 (from the three.js manual — *unverified by panel; verify before migrating*)

- three.js's `WebGPURenderer` auto-falls back to a WebGL2 backend where WebGPU
  is missing, so one renderer can cover new PC browsers and older mobile Safari.
- Migrating requires rewriting custom shader code: `ShaderMaterial` /
  `onBeforeCompile` don't carry over — they must be ported to node materials/TSL.
- The WebGPU path replaces `EffectComposer` with a node-based post stack that has
  faster versions of common effects plus exclusives (SSGI, SSS, better DoF).
- three.js still labels `WebGPURenderer` experimental and notes some scenes run
  faster on `WebGLRenderer` — migration in 2026 is not an unconditional win.
- Major new rendering features target the WebGPU renderer only; WebGL renderer
  is maintenance-mode. Long-term headroom lives on the WebGPU path.

**Decision for this repo:** stay on WebGL2 for the single-file prototype (it must
run everywhere, including the sandboxed artifact); revisit WebGPURenderer at the
Godot/UE5 rung or if the prototype ever splits into a multi-file build.

## What's already implemented (v0.4-v0.6)

Soft PCF shadow maps with a player-following shadow camera; vertex-animated sea
with live normals; sky dome + moon disc; UnrealBloom + OutputPass on the Grade
path; filmic (ACES) tone mapping; twin spotlight headlights; instanced varied
palms; device tiers; adaptive resolution; HD/SD user preset.

## Next candidates (engineering rules of thumb — not yet panel-verified)

1. **Draw-call discipline first.** Mobile browser budgets are draw-call-bound
   long before triangle-bound; keep total calls low hundreds. Our scene is
   already ~30 calls — headroom exists for more props via instancing only.
2. **FXAA or SMAA pass** instead of MSAA when the composer owns the frame
   (MSAA doesn't apply to post targets on WebGL2).
3. **Texture memory** is the silent killer on foldables at high DPR — keep
   canvas-generated textures small (ours are ≤512px).
4. **GTA 6's look** (from published trailers/analysis) leans on global
   illumination, volumetric clouds/haze, and screen-space water reflections —
   the cheap imitations, in order of payoff: stronger height fog + haze banding,
   planar-ish water specular (done), bloom (done), color grade (done).

## Video-analysis findings (scene-by-scene, via hosted analyzer)

Three previously-unwatchable reference videos were decoded with a hosted
video-analysis service (2026-07-06):

- **GTA V Enhanced walkthrough:** long drives carry the storytelling (calls and
  texts pinned to the HUD while driving), and heists follow plan-board →
  source-vehicles/kit → scope-the-target. Adopted as the Job Prep loop
  (systems doc §12).
- **"Every crime in the GTA 6 trailer" short:** the petty-crime taxonomy players
  love cataloguing. Adopted as the BII Infraction Ledger (systems doc §12);
  donut detection shipped in v0.7.
- **Photoreal rainy-city driving showcase:** the look is wet asphalt + neon
  reflections + tunnel strobe lighting + heavy rain. Reflections shipped in
  v0.7 (planar water mirror on ULTRA); rain mode and tunnel lighting are the
  next two candidates on this list.

- **Cyberpunk 2077 POV motorbike showcase (path-traced, DreamPunk mod, RTX 5090):**
  the desktop fidelity ceiling — full path tracing + DLSS 4. Confirms the engine-rung
  targets (global illumination, dense night neon) and the value of a first-person
  POV ride; the POV camera shipped in v0.12. Path tracing stays an engine-rung goal
  (WebGL2 can't do it) per the render doctrine.

## Target-look sample videos (Higgsfield, canon-styled)

- [Mudfish night pier-drop, neon harbor](https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260705_223656_eaec74c3-2ee6-448a-9d5a-dcab8d524659.mp4) — the water/headlight/neon reference for the Grade look.
- [Golden-hour island flyover, ten districts](https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260705_223743_d5b26c81-af84-4c4c-a298-1325ba60ac5d.mp4) — the daylight/atmosphere target for the engine rung.
- [YARDCLASH Beast Night ring](https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260707_165638_8ee771de-476e-45bb-9f6b-9a2f3a017ce2.mp4) — the container-walled fight ring at night, a fighter mid-transformation into the Rolling Calf (original folklore beast, glowing eyes, dragging chain) facing a human boxer; crowd, sound system, jerk smoke through neon. The engine-rung target for Beast Night. Stylized, non-gory, original.
- [Storm-night pursuit on The Strip](https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260707_141743_7af6e47f-51ed-453d-85a1-d1db42eee289.mp4) — the GTA-6-bar recreation of the whole current playable loop in one shot: the teal-striped Mudfish through rain-soaked neon, wet-asphalt reflections, the BII interceptor flashing behind, left-hand traffic pulled over. This is the engine-rung target for Storm mode + pursuit together.
- [Plantin Airways island approach](https://d8j0ntlcm91z4.cloudfront.net/user_3DecqKTontO540o5h6oTceJuUaD/hf_20260707_101315_52aea64a-cabb-45f4-87ac-38bd2f800ea2.mp4) — the fictional flag carrier — canon name **Plantin Airways** (cream/orange/gold, violet tail, golden-plantain emblem) banking over the island at golden hour toward the coastal runway; the target look for the v0.27 Island Hop feature. Original livery, no real airline branding.

> These are AI-generated concept/target-look videos for art direction, not
> engine captures.

## AI video agents as production tools (trailers / pre-viz / target-look)

The 2025-26 crop of AI video platforms (Renoise-class "video agents" that
generate cinematic shots from prompts and enhance raw footage — denoise, deblur,
regrade, upscale; Higgsfield, already in our concept pipeline, is the same
category) are legitimate **production tools** for this project:

- **Target-look films & trailers:** generate canon-styled shots (like the two
  sample videos above) for art direction and marketing — always labeled as
  concept/AI, never passed off as engine captures.
- **Cutscene pre-viz:** block out campaign cinematics cheaply before any engine
  work; the *shipped* cutscenes are rendered in-engine from original assets.
- **Enhancement passes:** AI upscale/denoise of our own captures for promo use.
- **The rule stands:** these tools generate *original* content from our prompts
  and our footage. They are never used to launder someone else's IP into
  "original" assets — same Rule Zero logic as everywhere else.

In-world, this whole tool category is satirized as the **Chromelab Re-Render
Queue** (systems doc §4.4) — the island's AI enhancement studio that pays bonus
clout for enhanced clips and flags over-glazed ones "NUH REAL!".

## Shipped from this doc (v0.95)

- **Haze banding (candidate #4):** a horizon haze ring — an unlit vertical-gradient
  band just inside the far plane, immune to fog, riding with the player. Tinted
  toward the sun color at low sun (dawn/dusk warmth), thicker in rain, faint at
  night. The "cheap GI/atmosphere imitation" the doc called the top payoff.
- **Desktop MSAA:** hardware antialiasing now always on for desktop UAs including
  high-DPR/retina (previously only DPR<1.5); mobile keeps the DPR rule to save
  fill. Chosen over an FXAA pass because the inlined three.js build exposes no
  ShaderPass/ShaderMaterial to hang a custom AA shader on (candidate #2's spirit,
  different mechanism).
- Still open from the list: SMAA/FXAA proper (needs a build that exports
  ShaderPass), tunnel strobe lighting, more instanced props.

## Shipped from this doc (v1.15) — CPU-side optimization pass

- **Distance-gated decoration:** ten decorative animation loops (Kindred bots,
  Glass Reef fish, drill fins, Storm Walkers, the Trine, Light Ring strands,
  Ground Ear bars, Coral Tunnel shuttles, completed Sentry LEDs, Vellum glow)
  now sleep entirely when the player is beyond their sight radius (260–420u),
  waking instantly on approach. Frame cost of the decorated districts is now
  near-zero from across the island.
- **Zero per-frame allocations in the sky path:** the two `new THREE.Color`
  allocations per frame in `applySky`/haze replaced with a preallocated scratch
  color (GC pressure eliminated from the hottest loop).
- **Whale material cache:** the Glass Whale's per-frame `traverse` replaced
  with a one-time material cache.


## Shipped v1.21 — OVERKILL tier (Z now cycles Adaptive → Max → OVERKILL)

Request was "RTX 5090 32GB, 4K OVERKILL, DLSS ON". The honest engineering
answer: **vendor upscalers (DLSS/FSR/XeSS) are driver+hardware technology and
cannot exist inside browser WebGL** — no game file can turn them on. What a
monster GPU *can* do in a browser is the brute-force equivalent, so the Z key
now cycles three tiers:

| Tier | Pixel ratio | Shadows | Fog / camera far | Bloom |
|---|---|---|---|---|
| ADAPTIVE (default) | native, auto-downscaling | base | base | base |
| MAX FIDELITY | up to 2.5× device | 4096² | 1100 / 1400 | +0.22 |
| **OVERKILL** | **1.6× native, cap 3.5 — true supersampling (SSAA)** | **8192²** | **1400 / 1900** | +0.30 |

Supersampling renders *above* native resolution and downscales — crisper than
any AI upscaler, at honest GPU cost, which is exactly what "overkill" hardware
is for. The adaptive downscaler still guards weak machines: sustained slow
frames step resolution back down, so the tier can never trap a slow GPU.

Headless-verified: Z cycles 0→1→2→0 with pxr 1 → 1 → 1.6 → 1 (headless dpr=1),
maxFidelity flag tracks, legacy `setMaxFidelity(true)` maps to tier 1, zero
page errors.


## Shipped v1.22 — RT-style wet streets + micro-optimization pass

**Mirror puddles ("RTX ON" wet streets, honestly).** True ray tracing does not
exist in WebGL2 — what does is a planar Reflector: a genuine second render of
the scene mirrored about a plane (not a screen-space trick). v1.22 lazily
builds a 56×56 Reflector sheet that rides under the player on **wet asphalt**
— rain + asphalt + Max/OVERKILL tier — so the neon strip doubles into the
road exactly like the classic wet-streets showcase. It costs a second scene
render, so the adaptive tier never pays: no rain, no asphalt, or no high tier
→ the sheet is invisible and skips its render entirely.

**Micro-optimizations (same discipline as v1.15):**
- Bassline night-crowd dancers cache their ground height at build (they never
  move horizontally) — 8 fewer `height()` field lookups per frame at night.
- The Drone Loft caches its site height in a constant — one fewer `height()`
  per frame inside its 260u gate.
- `updateFlyFish` early-outs when you're not in the Flying Fish — no
  `isWater()` probe per frame for a parked car.

Headless-verified: puddle stays OFF in rain at adaptive tier (cost gate), ON
at Max tier on wet asphalt, OFF again when skies clear; night crowd and loft
hologram still animate off their cached heights; zero page errors.


## Shipped v1.29 — Performance HUD + anisotropic texture sharpening

Request came in as an RTX-5060 FPS-benchmark reel ("55 FPS / HIGH"). No real
GPU/brand names ship — the honest, original equivalents do:

- **Performance HUD (comma key):** an on-screen readout of live **FPS +
  frametime (ms)** and a **quality-tier badge** (ADAPTIVE / MAX FIDELITY /
  OVERKILL) that reflects the Z-key gfx tier — the game's own benchmark
  overlay. FPS colour-codes (green ≥50, amber ≥30, red below); the badge
  recolours per tier. Smoothed instantaneous FPS, updated ~5×/sec.
- **Anisotropic texture sharpening:** a one-time load pass sets max
  anisotropy on every mapped texture (73 in the current build), so ground,
  roads, and water stay crisp at grazing angles instead of blurring — a real,
  cheap clarity win at essentially no runtime cost.

Together with the existing tiers, the graphics-boost story is now: **Z** cycles
Adaptive→Max→OVERKILL (supersampling + 8K shadows, v1.21), wet-street mirror
puddles at Max+ (v1.22), and the **comma** HUD lets you watch the FPS/quality
tradeoff live like a benchmark.

Headless-verified: 73 textures upgraded at load; comma toggles the HUD (FPS +
ms + tier badge render); cycling Z flips the badge to OVERKILL; `st().fps`
populates; 0 page errors.


## Shipped v1.35 — Mobile playability (touch controls for phones)

Request framed as "a digital PS5 to run this on Android Fold 6 / iPhone 16."
Honest scope: you can't conjure console hardware, and you don't need to — WebGL
runs fine on those phones. What was actually missing was **playable touch
input**. The game already had movement pads and a coarse-pointer media query
that reveals them; it was missing the two make-or-break actions:

- **E button (board / enter / interact)** — dispatches a real key event so every
  existing keydown handler fires; without it you couldn't get into any of the
  11 vehicles or any building on a phone.
- **SPACE button (dive / hold)** — held via the keys map like movement, so
  free-diving works with a press-and-hold.

Both auto-appear on touch devices (thumb row above forward/back). The existing
mobile perf path is unchanged and adequate: MSAA off on mobile user-agents,
device-pixel-ratio capped, and the adaptive down-scaler protects weak frames —
so a Fold 6 / iPhone 16 runs it smoothly. Higher-end phones can still push the
Z-key tiers.

Headless-verified on an emulated phone (hasTouch, 412×915, DPR 3): the E, SPACE,
move, and foot buttons all render (display:block) under a coarse pointer; the E
button boards a vehicle; the SPACE button dives and releases back up; 0 errors.

## v1.58 — DEEP FOCUS: contact shadows + shadow polish

An audit of the render pipeline found the colour side already in good shape —
**ACES filmic tone mapping** (exposure 1.22), **sRGB output colour management**, and
**hardware-max anisotropic filtering** (16×) were all live. The remaining visual gap
was **grounding**: with a single directional light, rides read as though they float a
hair above the road, which is the classic tell that separates a hobby WebGL scene
from a shipped one.

**What was added**

- **Contact-shadow (ambient-occlusion) pools.** A procedurally drawn radial-gradient
  `CanvasTexture` quad is pooled under **every ride and under the player** (12 pools).
  Each frame the pool snaps to its object's ground position, inherits its heading, and
  responds to height: sitting down it's tight and dark (opacity ~0.5, scale 1.0); lift
  the object and it **fades and spreads** the way a real soft shadow does (measured
  0.50 → 0.14 opacity, 1.0 → 1.55 scale at 5 units up), vanishing entirely by ~7u.
  Pools only draw within 200u of the player and are slightly softer at night.
- **Shadow acne / peter-panning fix.** `normalBias 0.02` and `bias -0.0004` on the
  directional light clean up the shimmering self-shadowing the 260u shadow camera
  showed across flat ground.

**Cost:** one unlit, depth-write-disabled textured quad per object, culled by range —
no new lights, no extra render passes, no custom shaders (the inlined build has no
`ShaderPass`). It stacks on top of every existing tier, so Adaptive / Max Fidelity /
OVERKILL all get it.

**Verified headless (11/11):** tone mapping, exposure, normal-bias, sRGB + anisotropy
all confirmed; a pool exists per ride + player; pools render near the player; each
pool sits exactly under its object (dx/dz = 0.00); lifting fades and spreads it; the
rendered frame provably differs with the pass on vs off; 0 page errors.

## v1.59 — GROUNDCOVER: dense wind-swept grass field

**Target:** a AAA shooter's "ultimate graphics" showcase frame. Stripped to its
rendering techniques, the single feature carrying that frame is **dense ground
foliage** — grass over every open surface, moving in the wind, thinning into haze at
distance. Against it, this island's open ground was flat and bare.

**What was added**

A **single `InstancedMesh`** scatters thousands of grass tufts in **one draw call**,
following the player like a detail field:

- **Density.** 700 / 1,800 / **4,200** tufts by device tier, multiplied by the Z-key
  graphics tier — **9,240 on OVERKILL**. Blades are scattered with an inward-biased
  radial distribution (`r = u^0.62 · R`) so the near field, which is what the camera
  actually sees, stays thick instead of spreading thin across the whole disc.
- **Placement rules.** Every tuft snaps to terrain height and is rejected on water,
  on the wet-sand line (`h < 0.8`), and within ~6u of the road ribbon — so grass
  never grows through asphalt or out of the sea.
- **Wind.** A rolling window of ~420 tufts per frame is re-leaned each frame, giving
  every blade a few sway updates a second at bounded cost. Gusts breathe on a slow
  sine and stiffen in rain.
- **Travel.** Blades falling out of range are recycled ahead of the player on a
  per-frame budget; a **long jump** (fast travel, leaving an interior, a respawn)
  re-lays the whole field in one frame so the player never lands on bare ground.
- **Art.** The blade texture is drawn procedurally at runtime — nine tapered blades
  in deep greens with dry-straw variance, alpha-cut (`alphaTest 0.45`), anisotropy
  clamped to the device max, lit by the scene and receiving shadow.

**Cost:** one instanced draw call, no new lights and no custom shaders (the inlined
build has no `ShaderPass`). Density and reach fall back automatically on weaker tiers.

**Verified headless (10/10):** field populates (4,200 live); one InstancedMesh /
one draw call; **zero** blades in water, **zero** on the road, **zero** off terrain
height; the field recycles to follow a teleporting player (0 stragglers); wind
provably mutates the instance buffer; OVERKILL thickens 4,200 → 9,240 and extends
reach 40 → 52; the rendered frame provably differs with the field on vs off; 0 page
errors.

**Boundary:** the reference was a real, named commercial shooter. The game, its HUD,
weapons, kill objectives and branding are all **out** under Rule Zero — what was
taken is only the *rendering technique* (instanced ground foliage), which is a
standard graphics method, rebuilt from scratch with procedurally drawn art.

## v1.60 — SCATTER + BENCHMARK OVERLAY

**Target:** a GPU-comparison benchmark frame — dry terrain littered with stones and
scrub, under an overlay reporting average FPS, **1% low**, **0.1% low**, frametime
and hardware counters. Two separate asks live in that image: *more scene detail*, and
*the instrumentation to measure it*. Both were built.

### Stone & shingle scatter

The companion to v1.59's grass. With foliage but no litter, ground still reads
artificially clean. One more `InstancedMesh` (**one draw call**) scatters stones using
the same follow-the-player recycling:

- 220 / 700 / **1,500** stones by device tier × the Z-key tier — **2,600 on OVERKILL**
  — reaching further than the grass (42/58/**74**u, 96u at OVERKILL) since stones stay
  readable at distance.
- **Per-instance non-uniform scale + yaw**, composed straight into the instance matrix,
  so no two stones are alike (400/400 unique in a sample). ~10% roll as proper
  **boulders**, the rest as shingle.
- Each stone is **seated into** the terrain (sunk ~35% of its height), and rejected on
  water and within ~6u of the road ribbon.

### Benchmark overlay (comma key)

The FPS counter became a real bench readout — the numbers a mean framerate hides:

- **Average FPS + frametime**, and **1% low / 0.1% low** framerates computed from a
  rolling 900-frame time buffer (sorted worst-first; the percentile *frametime*
  inverted to FPS — the standard method).
- **Whole-frame draw calls and triangle count**, plus **render scale** and live
  **grass / stone** instance counts.
- **A correctness note worth keeping:** reading `renderer.info` naively reports only
  the composer's final fullscreen blit — **1 call, 2 triangles** — because three.js
  resets those counters on *every* pass. The overlay therefore sets
  `renderer.info.autoReset = false` while it's up and latches + clears the totals once
  per frame, so the figures cover the entire frame (measured **1,638 draw calls /
  495K triangles** at OVERKILL). `autoReset` is restored when the HUD is closed.
- Entirely original instrumentation read from our own renderer — **no hardware, vendor
  or product names** anywhere.

**Verified headless (13/13):** 1,500 live stones; one InstancedMesh / one draw call;
**zero** stones in water, **zero** on the road, **zero** floating above terrain;
per-instance variety confirmed (400/400 unique, boulders present but a minority); the
field follows a teleporting player with 0 stragglers; OVERKILL scales 1,500 → 2,600
and reach 74 → 96; the bench reports whole-frame totals (911 calls / 374K tris, not
the 1-call lie); 1% and 0.1% lows compute with 0.1% never above 1%; the overlay block
renders on screen; 0 page errors.

**Boundary:** the reference was a hardware-benchmark video for real, named consumer
GPUs and CPUs. No vendor, product, or model name appears in the game — the overlay
reports only our own renderer's numbers.

## v1.61 — LACQUER & LIGHT (and the honest ceiling)

### The ceiling, measured

Asked to reach "GTA 6 level," the engine was audited rather than guessed at. The
inlined three.js build is a **stripped bundle**, and the following are simply **absent**:

| Missing | What it rules out |
|---|---|
| `MeshStandardMaterial` / `MeshPhysicalMaterial` | **PBR** — no metalness/roughness rendering |
| `CubeTexture`, `PMREMGenerator`, `*ReflectionMapping` | **Environment reflections / IBL** |
| `ShaderPass`, `SSAOPass`, `SMAAPass` | **SSAO, SSR, TAA/upscaling, volumetric fog, any custom post FX** |
| `FogExp2`, `DataTexture` | exponential height fog, procedural data textures |

Available: Lambert / Phong / Basic materials, `EffectComposer` + `RenderPass` +
`UnrealBloomPass` + `OutputPass`, `Reflector`, `InstancedMesh`, `CanvasTexture`.
**Conclusion: true modern-AAA fidelity is not reachable on this engine** — it would
require replacing the inlined renderer with a full three.js build (a large, risky
migration across ~10.7k lines). Everything below is the honest remaining ceiling
*within* the current engine.

### (a) Specular paint — the biggest remaining gap

`MeshLambertMaterial` has **no specular term at all**, and 1,654 surfaces used it —
including every vehicle body. Nothing on a car could ever catch a highlight; paint
read as matte paper. Every ride's Lambert surfaces are now rebuilt as **Phong with
tuned specular + shininess** (48 materials converted, colours preserved), so bodywork
catches the sun, streetlights and neon and reads as lacquer over metal.

### (b) Night light shafts

Strong point lights now hang a soft additive cone (22 shafts), fading in only with
darkness and scaled by each lamp's own intensity, so lamps throw a **visible cone of
light** at night instead of merely brightening the ground. Peak opacity 0.16 — a
suggestion of haze, not a solid cone.

### (c) The bloom wash — a real bug this exposed

Screenshotting the night frame (rather than trusting the code) revealed the single
worst thing about this game's looks: **place-name labels never culled with distance**,
so every landmark on the island stacked into one overlapping wall of near-white text —
and being unlit and bright, it fed the bloom until the entire frame washed out to
white, worst at OVERKILL where bloom is strongest. Fixed in three parts: labels now
**fade with distance** (crisp inside 52u, gone by 150u), the text was **dimmed**
(`#a8ddd3`) and its glow softened so it sits under the bloom threshold, and sprites
were **scaled down** 46→36 wide. The frame went from an unreadable white sheet to a
legible night scene.

**Verified headless (11/11 + full regression sweep, 0 failures):** 48 materials
converted with **zero** Lambert left on any ride, all with specular + shininess and
original colours preserved (53 distinct hues); 22 shafts built; shafts **off** at
midday, **21 lit** at night, peak opacity 0.16; night frame provably changes; whole-
frame draw calls stay sane (~1,032 / 374K tris); 0 page errors. The regression sweep
(vehicles, afterburner, derby, palaver, audio, photo, save/load) still passes clean.

## v1.66 — GRAPHICS SETTINGS PANEL

Until now the whole graphics stack was **one key cycling three presets**. Fine for a demo,
not fine for a product: players expect to trade individual features for framerate on their
own hardware, and a settings screen is part of what makes a game feel shippable.

Open with the **GFX** chip (mouse/touch) or **F8**; arrow keys or a tap changes a row.
Eight independent settings, applied **live** and remembered between sessions:

| Setting | Options | What it really drives |
|---|---|---|
| RENDER SCALE | 0.75× – 1.6× | the renderer's pixel ratio (verified 0.75 → 1.6) |
| GRASS DENSITY | OFF / LOW / MEDIUM / ULTRA | instanced grass count (verified 4,200 → 0 → 4,200) |
| GROUND DETAIL | OFF / LOW / HIGH | instanced stone count (verified 0 → 1,500) |
| SHADOW QUALITY | OFF / 1024 – 8192 | real shadow-map resize, and can disable shadows entirely |
| WET REFLECTIONS | OFF / ON | the planar puddle reflector |
| POST FX (BLOOM) | OFF / LOW / HIGH | bloom pass enable + strength (verified 0 → 0.8) |
| LIGHT SHAFTS | OFF / ON | the v1.61 night light cones |
| PLACE LABELS | NEAR / NORMAL / FAR | label fade distance (verified 2 → 25 visible) |

Settings are stored under `paudc_gfx` and **re-applied on boot** — verified by reloading in
a fresh page and confirming the shadow map came back at 2048 with bloom at 0.3, not just
that the numbers were remembered.

**Verified headless (13/13):** every row is asserted against the system it controls rather
than against its own label — grass and stone instance counts, the actual shadow-map width,
the renderer's pixel ratio, the bloom pass's enabled/strength, visible label count — plus
storage round-trip, re-application after reload, and 0 page errors.

**Note on the reference:** the categories here (water/grass/lighting/reflection/shadow/post/
DoF/motion blur) are the generic vocabulary every renderer ships. Depth of field and motion
blur are **not** offered because this engine has no `ShaderPass` — they exist on the
`claude/engine-pbr-upgrade` branch and can be added to the panel if that branch is merged.

## v1.70 — GERSTNER SEA

The water was **three stacked sine waves**, which can only ever produce rolling hills: every
crest as round as every trough. Real water is asymmetric — **sharp crests, broad flat
troughs** — and that asymmetry is most of what makes a sea look like a sea.

Replaced with a **five-layer Gerstner** surface (swell → chop → ripple). Gerstner waves get
the asymmetry by displacing vertices **horizontally as well as vertically**, bunching them
toward the crest. Rest positions are cached once, since horizontal displacement means x/z can
no longer be read back from the mesh.

**Verified (6/6):** five layers active; real relief (−0.92 → +0.85); **crest bunching measured
at 0.19 mean / 0.36 max horizontal shift from rest** — the actual Gerstner signature; the sea
animates; vertices provably move in x/z, not only y; 0 page errors.

**A test-methodology note worth keeping.** The first version of this test asserted "more
vertices below the mean height ⇒ broader troughs." That metric is *invalid under Gerstner*:
horizontal bunching makes vertex sampling non-uniform (they crowd toward crests), so the
fraction measures sampling density, not wave shape — and it read 0.475, "failing" a sea that
was working correctly. Replaced with a direct measurement of displacement from rest. Third
time this session a test was wrong rather than the code; each one was fixed in the test rather
than by loosening the game.

## v1.72 — DEPTH-GRADED SEA

The reference was a **GTA VI vs GTA V** marketing comparison. All branding excluded; what was
useful was its own labelling of the difference — *"realistic oceans"* against *"simpler
water"* — and the top image makes the point plainly: bright turquoise shallows grading to
deep blue offshore.

This game's sea was **one flat teal across the entire map**, which is the single biggest tell
separating a toy ocean from a coastline. Real shallows are bright because light reaches the
sand and bounces back; the colour deepens toward near-black as the bottom drops away.

Water now carries **per-vertex colour baked from the actual seabed height** beneath each
point, so the gradient follows real bathymetry — reefs and sandbars glow, trenches go dark —
rather than being a painted-on pattern. It costs nothing at runtime because the seabed never
moves, and it layers under the v1.70 Gerstner displacement rather than replacing it.

**Verified (8/8):** the mesh carries a colour attribute and the material consumes it; a vertex
in 1.6 m of water reads **(0.24, 0.68, 0.71)** turquoise while one in 27 m reads **(0.02,
0.13, 0.26)** navy; a real gradient spans the map (green channel 0.13 → 0.86); the gradient
provably tracks depth rather than position; Gerstner waves still animate on top; 0 page errors.

## v1.75 — BUOYANCY & WAKES

v1.70 gave the sea real Gerstner waves, but **nothing floated on them**: boats stayed pinned to
a flat line while the water heaved underneath — which reads *worse* than having no waves at all,
because the eye sees the contradiction.

- **`seaWaveAt(x,z)` samples the same wave function analytically**, so a hull sits on the actual
  surface. Verified against the mesh itself: worst disagreement across 46 sampled vertices was
  **0.000**.
- **Attitude comes from the water, not a canned animation.** The hull pitches from the slope
  along its heading and rolls from the slope across its beam, sampled 2.6 m fore/aft and
  port/starboard, then eased so it doesn't jitter.
- **Wakes** are foam quads laid behind a moving vessel, spreading and fading as they age — and
  each one **re-samples the surface every frame**, so foam rides the swell instead of clipping
  through it. Back on land the hull eases level again.

**Verified (11/11):** sampler matches the mesh exactly; a vessel on water is buoyant and its hull
provably rises and falls (0.86 → 0.10); it pitches and rolls and the mesh rotation matches the
computed attitude; a moving vessel lays foam that sits on the surface; the wake **decays**
(0.505 → 0.459 → 0.414) once you stop laying it; it levels out on land; 0 page errors.

**Test note:** the wake check originally asserted "gone within 9 seconds" and failed — headless
sim time runs far slower than wall-clock, so that measured the harness, not the code. Rewritten
to assert monotonically falling opacity, which tests the actual decay.

## Regression sweep restored (`tests/regression-sweep.js`)

The original sweep lived only in scratch space and was lost when the container reset. Rebuilt
and now **committed to the repo** so it survives. 17 checks: st() shape, **zero external
requests**, vehicle roster, groundcover, rigged pedestrians, sea state, on-foot and swimming,
save/load round-trip, graphics settings actually biting, the benchmark, and the recent features
(surge, scout, volley, no third-party embeds). Run with
`npm i playwright-core && node tests/regression-sweep.js`.

## v1.76 — WATER FX: splashes on impact, rings in the rain

A water-feature comparison graphic (branding excluded) that was mostly a scorecard of work
already done — Gerstner waves (v1.70), buoyancy + wakes (v1.75), depth transparency (v1.72).
Two items on its GTA VI column were genuinely missing, and are now built:

- **Splashes / foam bursts:** a foam pool blooms where something hits the water — the player
  ducking under, a vessel entering the water, and bow spray thrown while running fast. Distinct
  from the trailing wake, which is a continuous track.
- **Rain rings:** while it rains, the surface near the camera dimples with expanding rings, the
  "dynamic effects" panel from the reference. Rings spawn only on water.

Both are cheap billboard pools that **re-sample the wave surface every frame**, so they ride the
real swell rather than sitting at a fixed height — the same fix the wakes use.

**Verified (8/8):** starts empty; a splash appears on the surface and fades; ducking under water
throws one; rain dimples the water and the rings sit on water riding the surface; rings clear
when the rain stops; 0 page errors. Full regression sweep still 17/17.

**Bug caught:** the splash/ring position was set once at spawn, but seaWaveAt is time-varying, so
they drifted off the moving surface within a frame — the test's on-surface assertion caught it.
Fixed by re-sampling y each frame. Also renamed a `ringT` timer that collided with the LightRing
feature's global (SyntaxError at load, caught before commit).

## v1.77 — OPTIMISATION: analytic water normals (measured 42% faster water update)

Profiled the per-frame cost and found the hot path: `water.geometry.computeVertexNormals()`
ran **every frame** at **~1.22 ms** — a full triangle traversal plus reallocation over 4,455
vertices, roughly 7% of a 60 fps budget spent recomputing water lighting normals.

Gerstner waves have a **closed-form surface normal** (GPU Gems). The wave loop already computes
`cos`/`sin` of each wave's phase to displace the vertex; the normal is a few multiply-adds on
those *same* values. So the normal is now accumulated **inline in the position loop** and
`computeVertexNormals()` is gone entirely.

**Measured, full-path A/B on the live 4,455-vertex mesh (80 iterations):**

| | old (loop + computeVertexNormals) | new (loop with inline normals) |
|---|---|---|
| per frame | **2.131 ms** | **1.234 ms** |

**0.90 ms saved per frame — a 42% cut to the water update**, ~5% of a 60 fps frame back. The
analytic normals are provably unit-length and up-facing (222 sampled, 0 bad). Verified the sea
still animates, shades and drives buoyancy correctly; full regression sweep 17/17.

### On "RTX-level" graphics — the honest limit, restated

The RTX brand name is not used anywhere in the game (Rule Zero, as with every real brand). The
feature people mean by it — **real-time ray-traced reflections** — is not possible in this
engine; it has no path-tracing and no `ShaderPass`. The closest achievable step is
**environment-mapped reflections**, which are already built and waiting on the
`claude/engine-pbr-upgrade` branch (v2.00). This release makes the water *faster*, not
ray-traced; those are different requests and only one of them is achievable here.
