# U.S. Robotic Army — Reel Defense

A self-contained HTML5 Canvas arcade game. You command a ground battle robot
and hold the line against five escalating waves of enemy drones.

The Instagram reel is integrated directly into the game:

- **Briefing screen** — a **live GTA VI countdown** (Vice City neon styling)
  ticks down in real time to the release date shown in the reel,
  **November 19, 2026**, above the embedded "Field Report" reel.
- **End screen** — the reel is offered again as a post-mission replay.

Reel: <https://www.instagram.com/reel/DayWHhDOIG3/>

## Play

Just open `index.html` in a browser — no build step, no dependencies.

```bash
# or serve it locally
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

| Key            | Action |
| -------------- | ------ |
| `←` / `→` or `A` / `D` | Move |
| `Space`        | Fire   |
| `P`            | Pause  |

On touch devices, tap the left or right half of the play area to move and
auto-fire.

## Gameplay

- Survive **5 waves** of drones — each wave adds more, faster, tougher enemies.
- Shoot drones for points (`10 × wave` each); clearing a wave grants a bonus.
- Your **hull** starts at 100%. It takes damage when drones reach the base
  line, ram you, or hit you with fire. Reach 0% and the base is overrun.

## How the reel is embedded

The reel uses Instagram's official embed (`embed.js` + `blockquote.instagram-media`),
which renders the real reel client-side in the browser. If it ever fails to
load (e.g. offline), a direct link to Instagram is shown as a fallback.

## Files

```
index.html      # screens: briefing (with reel), game, end (with reel)
css/style.css   # military-green UI theme + responsive layout
js/game.js      # game engine: input, waves, entities, collisions, render
```
