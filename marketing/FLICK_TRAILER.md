# PAUDC: Neon Harbor — Flick trailer package

A ready-to-animate promo, built to feed straight into **Flick** (Creatorberry, MIT) on your
own machine. Flick turns a transcript + scene plan into scene-by-scene Remotion animations;
this file **is** that input, written from the actual game so the scenes are true to it.

> **Why this lives here and not "installed":** Flick can't run in the cloud session that built
> the game — `/plugin` isn't available there, and its first run pulls Remotion, FFmpeg, Whisper
> and yt-dlp behind a live network, which the session's egress proxy blocks. Run Flick **locally**:
> `/plugin marketplace add Creatorberry/flick` → `/plugin install flick@flick` → `/flick`, then
> point it at this file (or at a screen-capture of the game).

**Format:** 60s, 9:16 vertical (Reels / TikTok / Shorts). For a 16:9 YouTube cut, keep the same
beats and reframe — the scene list notes safe-area for both. Bundled SFX match the on-screen
action; **no music track** (Flick's default, and it keeps the cut copyright-clean).

**Provenance guardrails for the animator (do NOT break these — the game's whole selling point):**
no GTA/other-game IP, no real brands (no NVIDIA/RTX, no car marques), no real weapons, non-lethal
framing only, real places stay fictional. Everything below is original to the game.

---

## Voiceover / caption script (timed)

| Time | On screen | VO / caption |
|---|---|---|
| 0:00–0:04 | Neon harbour at dusk, slow push over the water | "Every open-world game hands you a gun." |
| 0:04–0:07 | Hard cut: the Dazzler stuns, nobody falls | "This one doesn't." |
| 0:07–0:10 | Title card: **PAUDC — NEON HARBOR** | "Neon Harbor. Non-lethal. Open world." |
| 0:10–0:16 | Water montage: swell → turquoise shallows → a wake tearing across | "An ocean with real waves, real depth, real wake." |
| 0:16–0:20 | The Surge: sea climbs the shore, the light-wall rises to break it | "A sea that can rise — and a wall that answers it." |
| 0:20–0:25 | Wrist scout lifts off, holo feed unfolds; "NO ID · TERRAIN ONLY" visible | "Eyes in the sky that watch WITH you — never at you." |
| 0:25–0:31 | The Big Yard: three generations, pot on the fire, kids running | "A whole island that feels lived-in." |
| 0:31–0:36 | Night: the Listening Booth, The Double flickers in the glass | "And after dark, it gets under your skin." |
| 0:36–0:42 | Quick-cuts: beach volley rally, teppan flare, wash bay foam, cliff overlook | "Play football on the sand. Cook on the iron. Wash the salt off your ride." |
| 0:42–0:48 | Rides montage: hydrofoil, jet-car afterburner, the water-limo skimming | "Ten ways to move. Land, sea, and the space between." |
| 0:48–0:54 | Sky clinic flown in by tilt-rotor; the current farm; the sunline beam | "A future that heals and powers, instead of harming." |
| 0:54–0:58 | Sunset over the harbour, protagonist on the overlook | "One island. One file. Yours to explore." |
| 0:58–1:00 | Logo + "Play in any browser." | "PAUDC: Neon Harbor." |

---

## Scene plan (Flick scene-by-scene — mirror these as named Remotion scenes)

```json
{
  "project": "paudc-neon-harbor-trailer",
  "aspect": "9:16",
  "duration_s": 60,
  "no_music": true,
  "scenes": [
    {"name": "hook-no-gun",      "t": [0.0, 7.0],  "beat": "genre subversion — gun vs Dazzler", "sfx": "low drone, then soft chime on stun"},
    {"name": "title-card",       "t": [7.0, 10.0], "beat": "logo reveal", "sfx": "neon hum swell"},
    {"name": "water-showcase",   "t": [10.0, 20.0],"beat": "waves, depth, wake, surge + wall", "sfx": "swell, spray, deep boom on surge"},
    {"name": "scout-doctrine",   "t": [20.0, 25.0],"beat": "wrist drone + holo feed, watches-with-you", "sfx": "servo, soft telemetry blips"},
    {"name": "living-island",    "t": [25.0, 31.0],"beat": "Big Yard family warmth", "sfx": "fire crackle, distant laughter"},
    {"name": "psych-turn",       "t": [31.0, 36.0],"beat": "night, the Booth, The Double", "sfx": "static, single heartbeat"},
    {"name": "activities",       "t": [36.0, 42.0],"beat": "volley / teppan / wash bay / overlook", "sfx": "ball thwack, sizzle, water jet"},
    {"name": "rides",            "t": [42.0, 48.0],"beat": "vehicle montage", "sfx": "engines, afterburner whoosh"},
    {"name": "future-humane",    "t": [48.0, 54.0],"beat": "sky clinic / current farm / sunline", "sfx": "rotor, energy hum"},
    {"name": "close-logo",       "t": [54.0, 60.0],"beat": "sunset overlook, logo, CTA", "sfx": "warm pad resolve"}
  ]
}
```

## Capturing footage for Flick (if you feed video instead of transcript)

Record each beat in-game (desktop, `?fresh=1`, graphics on OVERKILL, benchmark HUD **off**):
water at the reef, `U` for the surge, `J` for the scout, the Big Yard at dusk, the Booth at
night (`T`), the overlook at sunset. 8–12s per clip is plenty — Flick re-times them to the plan.

*Trailer copy and scene plan are original to this project. This document is not the game and
ships no third-party code; Flick runs locally and its `flick-output/` stays git-ignored.*
