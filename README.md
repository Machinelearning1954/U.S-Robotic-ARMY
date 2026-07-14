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
| G | Toggle enhanced graphics mode |

## Enhanced graphics mode

Inspired by the ray-tracing showcase in the briefing video, the game ships with
an enhanced renderer (on by default, toggle with **G**):

- Wet-ground reflections below the defended line (a screen-space mirror pass)
- Glow/bloom on the unit, tracer rounds, drones, and explosions
  (canvas shadow blur plus additive particle blending)
- Twinkling parallax starfield and gradient sky
- Impact screen shake and a pulsing power core on the player unit

Note: real ray tracing is a renderer feature — it can't be imported from a
YouTube URL. The link's `Zp9qozA2bzQ` part is just the video's ID and `si=` is
a share-tracking token, so these effects are implemented natively in canvas.

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
