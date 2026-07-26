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
