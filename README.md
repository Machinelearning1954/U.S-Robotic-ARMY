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
- **Procedural audio** (WebAudio, zero asset files) — rain/wind beds that
  follow the weather, thunder after lightning, a resonance hum that tracks
  the scanner, exposure-driven tension drone, pings, footsteps, alert
  stingers, and radio squelch that ducks the ambience. `M` to mute.
