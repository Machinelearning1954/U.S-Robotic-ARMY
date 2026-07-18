# U.S. Robotic ARMY — Real World Ops

A browser-based **3D real-world combat game**: you pilot a U.S. Army combat
mech defending Sector 7 — an open outdoor environment with atmospheric sky,
sun and shadows, rolling terrain, buildings and vegetation — against
escalating waves of hostile drones and walker tanks.

Built with [Three.js](https://threejs.org), with an asset pipeline designed
around **[Tripo3D Studio](https://studio.tripo3d.ai)** AI 3D model
generation: photograph or describe real-world hardware, let Tripo generate a
game-ready mesh, and it becomes a unit in the game.

## Play it

The game is pure static HTML/JS — serve the `game/` folder with any static
server and open it in a modern browser:

```bash
cd game
python3 -m http.server 8080
# then open http://localhost:8080
```

(Or use `npx serve game`, VS Code Live Server, GitHub Pages, etc. Opening
`index.html` directly from disk won't work because browsers block module
imports and GLB fetches from `file://`.)

### Controls

| Input        | Action          |
| ------------ | --------------- |
| `W A S D`    | Move            |
| Mouse        | Aim / camera    |
| Left click   | Fire pulse cannon |
| `Shift`      | Sprint          |
| `Space`      | Jump            |
| `Esc`        | Release cursor / pause |

### Gameplay

- **Drones** swarm you and self-destruct at close range — shoot them down
  before they reach you (+1 point).
- **Walker tanks** shell you from distance and soak more damage (+3 points).
- Waves escalate indefinitely; survive as long as you can.

## Tripo3D — how the game becomes "real world"

The game loads AI-generated 3D models exported from Tripo3D Studio at
runtime:

1. In [Tripo3D Studio](https://studio.tripo3d.ai), generate a model from a
   **text prompt** or from a **photo of real hardware** (image-to-3D).
2. Export it as **GLB**.
3. Drop the file into `game/assets/models/` and register it in
   `manifest.json`.
4. Reload — the model is auto-scaled, grounded, and used for that unit.

Full instructions, model slots, and suggested prompts:
[`game/assets/models/MODELS.md`](game/assets/models/MODELS.md).

Until you add models, the game uses built-in procedural robots, so it is
fully playable out of the box.

## Audio design

The game ships a fully procedural **spatial audio engine**
(`game/src/audio.js`) modeled on AAA open-world audio pipelines — every sound
is synthesized at runtime with WebAudio, so there are zero audio files to
download:

- **HRTF 3D positioning** — drones, walker footfalls, hostile gunfire and
  explosions are placed in 3D with Web Audio `PannerNode` (HRTF panning
  model, inverse-distance rolloff), so headphone users can localize sounds
  above, behind, and beside them.
- **Doppler** — drone rotor pitch shifts with radial velocity toward the
  listener as they streak past.
- **Occlusion** — a line-of-sight test against buildings and rocks low-pass
  filters sound sources behind cover, leaving only a muffled rumble.
- **Convolution reverb** — a procedurally generated impulse response gives
  gunfire and explosions an outdoor echo tail.
- **Layered ambient bed** — wandering wind (filtered noise + LFO), distant
  low hum, and positional bird chirps that thin out as combat intensifies.
- **Physics-keyed Foley** — footsteps triggered by the movement cycle
  (heavier and faster when sprinting, with a sub-bass mech thump), plus a
  speed-tracked servo whine while moving.
- **Layered weapon sound** — each shot stacks a mechanical click, an energy
  discharge body, and a broadband crack with a reverb send.
- **Adaptive score, mixed in stems** — a tension pad is always faintly
  present; a sequenced action layer (kick / hats / bass) crossfades in as
  threat level rises, computed from hostile count and proximity.
- **Bus architecture with ducking** — music / ambience / sfx buses under a
  master compressor; explosions duck music and ambience sidechain-style.
- **Haptics** — explosions, hits, and weapon fire are mirrored to gamepad
  rumble (`vibrationActuator`) when a controller is connected.

## Project layout

```
game/
├── index.html            # entry point, HUD, start screen
├── src/
│   ├── main.js           # game loop, player control, camera, combat
│   ├── world.js          # sky, sun, terrain, buildings, vegetation
│   ├── models.js         # Tripo3D GLB loader + manifest pipeline
│   ├── robots.js         # procedural fallback robots
│   ├── enemies.js        # drone/walker AI and wave spawning
│   ├── effects.js        # tracers, sparks, explosions
│   └── audio.js          # spatial audio engine (HRTF, Doppler, occlusion…)
├── vendor/three/         # vendored Three.js (works fully offline)
└── assets/models/        # drop Tripo3D GLB exports here
    ├── manifest.json
    └── MODELS.md
```

No build step, no dependencies to install, no network needed at runtime —
Three.js is vendored into the repo.
