# U.S. Robotic ARMY — Frontline Defense

A browser-based defense game for the U.S. Robotic ARMY project. You command an
autonomous robotic ground unit holding the line against waves of hostile drones.

## Play

Open `index.html` in any modern browser — no build step or dependencies.

| Key | Action |
| --- | --- |
| ← → or A / D | Move unit |
| SPACE | Fire |
| S | Call in a Navy SEAL fire team |
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

## Integrated media feeds

The in-game **Intel Briefing** screen embeds two external videos as switchable
recon feeds:

- **Feed A** — YouTube:
  ["GTA 5 Enhanced UPDATED Ray Tracing RTX 4090 4K Graphics Gameplay"](https://youtu.be/Zp9qozA2bzQ?si=psHQLoz6JmDDCwPN),
  via the privacy-enhanced `youtube-nocookie.com` player.
- **Feed B** — Instagram:
  [reel `DaxLfgoNQI2`](https://www.instagram.com/reel/DaxLfgoNQI2/), via
  Instagram's official `/embed/` player in portrait format. (Instagram only
  serves embeds for public posts; a private or deleted reel shows a login
  prompt instead.)
- **Feed C** — YouTube:
  ["U.S. Navy SEALs — The Russian Oil Rig Hostage Rescue Operation (Modern Warfare 2 Remastered, 8K)"](https://youtu.be/4dBjwxVKDrY?si=Bu9FoZasZ1LFRiho),
  the tactics reference for the in-game SEAL fire-team support.
- **Feed D** — YouTube:
  [video `DhomTNmvJ2c`](https://youtu.be/DhomTNmvJ2c?si=GneqX9j3gXw2jShx),
  shown as the auxiliary command feed.

## Navy SEAL fire-team support

Press **S** during a mission to call in a two-operator Navy SEAL fire team.
The operators fast-rope in on your flanks, automatically engage the nearest
drones with aimed covering fire for about seven seconds (their rounds score
like yours), then exfil. The HUD tracks their status: `SEALS READY (S)` →
`SEALS ON STATION` → `SEALS EXFIL <n>s` while the 18-second cooldown runs.

The briefing is available from the main menu, the pause menu, and the
game-over screen, or by pressing **B** at any time (gameplay pauses while it
is open). Iframes are created only when the briefing opens and are removed
when it closes, so nothing loads from YouTube or Instagram until asked for.
Direct "Open on YouTube / Instagram" links sit alongside the embeds.
