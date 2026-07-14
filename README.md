# U.S. Robotic ARMY — Frontline Defense

A browser-based defense game for the U.S. Robotic ARMY project. You command an
autonomous robotic ground unit holding the line against waves of hostile drones.

## Play

Open `index.html` in any modern browser — no build step or dependencies.

| Key | Action |
| --- | --- |
| ← → or A / D | Move unit |
| SPACE | Fire |
| P / ESC | Pause / resume |
| B | Open or close the intel briefing video |

## Integrated video

The game integrates the YouTube video
["GTA 5 Enhanced UPDATED Ray Tracing RTX 4090 4K Graphics Gameplay"](https://youtu.be/Zp9qozA2bzQ?si=psHQLoz6JmDDCwPN)
as the in-game **Intel Briefing** screen:

- Available from the main menu, the pause menu, and the game-over screen, or by
  pressing **B** at any time (gameplay pauses while the briefing is open).
- Embedded with the privacy-enhanced `youtube-nocookie.com` player; the iframe
  is only created when the briefing is opened and removed when it closes, so
  nothing loads from YouTube until the player asks for it.
- A direct "Open on YouTube" link is provided alongside the embed.
