# Stealth Run — Vice City

A neon, synthwave arcade game where you pilot the **B-2 Spirit stealth bomber**
through a Vice City skyline, grabbing cash toward the **$2.1 billion** program
budget while dodging neon skyscrapers.

Built as a single, self-contained HTML5 canvas file — no build step, no
dependencies.

## Play

Open `game/index.html` in any modern browser, or serve the folder:

```bash
# from the repo root
python -m http.server 8000
# then visit http://localhost:8000/game/
```

## Controls

| Action | Input |
|--------|-------|
| Climb  | Hold **tap / click**, or **Space** / **▲** |
| Dive   | Release |

## Goal

- Fly through the gaps between the neon towers — each cleared pair is **+1 score**.
- Collect glowing **$** pickups; every one adds **$0.05B** to your budget.
- Reach **$2.1B** to fund the stealth program. Hit a tower or the ground and
  you're *Down Over Miami*.

Your best run is saved locally in the browser.
