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
