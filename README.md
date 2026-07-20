# REZONANCE — Halcyon Bay

A neon-noir, top-down **signals-investigation** game that runs entirely in the
browser. No build step, no dependencies — open `index.html` and play.

> **This is a work of fiction.** Halcyon Bay, the Meridian Group, Vesper Kade,
> and everything else here are invented. Any resemblance to real people,
> organizations, or events is coincidental.

## The pitch

You play **Vesper Kade**, a burned signals-analyst working off the books. A
shadow contractor called the **Meridian Group** has salted the city with hidden
*harmonic emitters*. Sweep each district, triangulate each emitter by the
resonance it gives off, and neutralize it before the array locks — all while
staying out of the sightlines of Meridian's roaming **sweepers**.

## How to play

| Input | Action |
| --- | --- |
| `W A S D` / arrow keys | Move |
| `Shift` | Sprint (drains stamina) |
| `Space` | Pulse the resonance scanner |
| `E` | Neutralize an emitter when in range |
| `R` | OVERWATCH recon pass (once per district) — a Mach-3 bird flashes all live emitters onto the minimap |

- The **RESONANCE** meter climbs as you close on the nearest live emitter, and
  the screen-edge "tingle" sharpens with proximity — that's your detection cue.
- Pulse the scanner (`Space`) to send out a ring that briefly reveals nearby
  emitters.
- Stay out of the sweepers' vision cones. Getting spotted raises **EXPOSURE**;
  max exposure ends the run. So does the district timer running out.
- Clear every emitter in a district to advance. Three districts, escalating
  difficulty.

## Running it

Because it uses ES modules, serve it over HTTP rather than opening the file
directly:

```bash
# from the repo root
python3 -m http.server 8099
# then visit http://localhost:8099/index.html
```

## 3D mode

Press `V` in-game to switch to a true-3D WebGL camera (press again to return
to the 2.5D view). The same running game state — grid, emitters, sweepers,
traffic, pedestrians, weather — is mirrored into a Three.js scene running a
full night-city realism pipeline, all procedural:

- PCF soft shadows from a moon key light that follows the player
- wet-street planar reflections (the lit city mirrored under translucent
  asphalt, with sharper puddle patches)
- 512px facades with per-window color temperature, blinds, dark floors, and
  a storefront band; separate emissive map so only glass glows
- procedural sky dome (stars, moon halo, drifting cloud murk), exponential fog
- pooled dynamic lights: nearest street lamps + car headlight spotlights
- proportion-driven character figures: Vesper and the female pedestrians
  carry an hourglass build (wide hips, narrow waist, full thighs) from a
  shared procedural figure builder with per-pedestrian body variety
- neon signage with flicker, blinking rooftop beacons, emitter sky-beams,
  drone scan cones, wind-slanted rain streaks
- post chain: threshold bloom, chromatic aberration, film grain, vignette,
  ACES tone mapping (lightning overdrives the exposure), MSAA — with an auto
  quality governor that sheds post/shadows on weak GPUs

Three.js r170 is vendored at `src/vendor/three.module.js` (MIT — see
`src/vendor/THREE-LICENSE`), so the game remains fully self-contained. The
step-by-step plan for pushing further toward AAA ("GTA 6-level") fidelity —
GLTF PBR assets, SSAO/TAA, WebGPU, and the honest pixel-streaming ceiling —
lives in `docs/REALISM.md`.

## Project layout

```
index.html          # shell: title, how-to, game screens + HUD
src/css/style.css   # all styling (neon-noir theme, HUD, overlays)
src/js/
  main.js           # boot + screen navigation
  game.js           # engine: world gen, loop, physics, rendering
  world.js          # district definitions (size, emitters, sweepers, palette)
  input.js          # keyboard input with edge-detection
```

## Tech

Plain HTML + CSS + vanilla JS with the Canvas 2D API. Districts are generated
deterministically from a seeded PRNG, so each one has a stable layout.

The renderer is a GTA2-style 2.5D pipeline: buildings extrude away from the
screen center (a scale-about-center projection, so roofs stay axis-aligned),
with visible wall faces shaded per orientation, lit windows climbing the walls,
neon signage, and roof clutter (AC units, blinking antennas). On top of that:

- a dynamic night-lighting layer (street lamps, headlights, emitters and the
  player punch holes in the darkness)
- wet streets: puddles with neon reflection smears, rain, ground splashes
- ambient life: traffic with headlight cones and pedestrians under umbrellas
- post-processing: quarter-res bloom, film grain, vignette, and the
  resonance "tingle" that rims the screen as you near an emitter
- an adaptive quality governor that sheds grain → bloom → lighting refresh
  rate when the frame budget is tight, so it stays smooth on weak hardware

Systemic layer (all fictional, all procedural):

- **Weather cycle** — drizzle → rain → storm, with wind gusts that slant the
  rain, lightning, and storm interference that makes scanner readings jump
- **Compressed time-of-day** — each district runs dusk → deep night → pre-dawn
  as its timer drains, shifting ambient light and sky tint
- **Escalating detection** — sweepers go patrol → suspicious → alert → pursuit
  of your last known position; suspicion decays if you break line of sight
- **No hard fail at max exposure** — a 6-second lockdown opens instead: stay
  unseen and the run continues at reduced heat
- **Reactive world** — pedestrians bolt from sprinting players and loud
  sweepers, traffic brakes for you and pulls away again, birds scatter from
  sprints and scanner pings
- **Contextual radio** — Vesper's handler comments on district entry, kills,
  exposure spikes, storms, lockdowns, and the closing clock
- **Handler uplink hologram** — every radio message opens an animated
  holographic portrait of K, the handler: an original, fully procedural
  canvas drawing (signals analyst with headset, code rain, orange wireframe
  globe, hex reticle, glitch slices, LIVE indicator) inspired by a
  command-center reel by @nilu__kumari_mishra_2 (credited on the title
  screen); visible in both the 2.5D and 3D view modes
- **Procedural audio** (WebAudio, zero asset files) — rain/wind beds that
  follow the weather, thunder after lightning, a resonance hum that tracks
  the scanner, exposure-driven tension drone, pings, footsteps, alert
  stingers, and radio squelch that ducks the ambience. `M` to mute.
