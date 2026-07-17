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
deterministically from a seeded PRNG, so each one has a stable layout. Rendering
does camera-follow with world-bounds clamping, faux-height building shading,
radial-gradient glow for emitters and the player, sweeper vision cones, a
particle system for neutralize bursts, and a live minimap.
