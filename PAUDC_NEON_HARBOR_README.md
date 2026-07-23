# PAUDC: Neon Harbor

An original, fictional, **non-lethal open-world island game** — built as a single
self-contained WebGL file. Drive, fly, sail, swim, and explore a neon harbour
town; no firearms, no kill mechanics, no death screens. Every place, character,
vehicle, and system is invented.

> **Play:** open `game/3d.html` in any modern desktop browser. No install, no
> build step, no server — it's one file.

## Highlights

- **One-file WebGL2 engine** (three.js, inlined) — ~9,700 lines, no external
  assets. All 3D models are built from code primitives; all textures are drawn
  procedurally at runtime.
- **A living island** — day/night routines, ambient wildlife, a self-staging
  "spectacle director" (dolphin pods, rainbows, meteor watches, street music),
  weather, and NPC foot/vehicle traffic.
- **Ten drivable/flyable rides** — cars, a bike, a walker, boats, a jetski, an
  endurance prototype, a hydrofoil hypercar (the Flying Fish), and a
  jet-turbine road car with an afterburner (the Comet).
- **Dozens of landmarks & activities** — the Harbor Derby (playable football),
  the Palaver Table, the Trine wheel, the Needle test-run, the Sky Rigger
  in-flight repair, the Eyrie cliff cave, swimming & free-diving, the Beam Gate,
  photo mode, a procedural WebAudio engine, and more.
- **Graphics tiers** — press **Z** to cycle Adaptive → Max Fidelity → OVERKILL
  (true supersampling + high-res shadows); wet-street mirror reflections;
  anisotropic texture filtering; a live FPS + quality HUD (comma key).
- **Saves automatically** to your browser. Add `?fresh=1` to the URL for a clean
  start.

## Controls (desktop)

`WASD` move · `F` on-foot · `E` board / enter · `V` view · `SPACE` dive ·
`B` hover · `Z` graphics tier · `9` photo mode · `0` sound · `,` FPS HUD ·
`M` map · backtick opens the cheat console. Full key list shows in-game.

## What's in this repo

| Path | Contents |
|---|---|
| `game/3d.html` | **The game** — the shippable single file |
| `worldbuilding/*.md` | Design docs; every version carries a per-feature boundary note |
| `IP_PROVENANCE.md` | Originality inventory + pre-sale checklist (read this before selling) |

## Originality & licensing

Every asset is original and built from scratch — see `IP_PROVENANCE.md` for the
full inventory and the design rules ("Rule Zero") enforced across development:
no third-party game/film IP, no real people, no real brands, no real weapons or
military systems, real places fictionalised, non-lethal by design.

The engine (three.js) is MIT-licensed; its notice is kept inside `game/3d.html`
and must not be stripped. Choose and add your own copyright/licence line before
any commercial release, and have a games/IP attorney review the provenance
statement first. **This README and the provenance doc are not legal advice.**

---

*Built feature-by-feature from social-media inspiration, each reference passed
through an originality filter and headless-verified before shipping.*
