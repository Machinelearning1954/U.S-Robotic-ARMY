# PAUDC — Development Roadmap & Legal Ground Rules

> How this project goes from design bible + browser prototypes to a real GTA-style
> game, using only legal, public tools. This file is binding guidance for all
> contributors.

---

## Rule Zero — no Rockstar code, ever

GTA 5/6 source code is proprietary to Rockstar Games (Take-Two Interactive).
Portions leaked online in 2022-2023; **using, sharing, or even studying that leaked
code is a copyright violation and is banned from this project.** Nothing in this
repository may derive from it. The same goes for ripped Rockstar assets (models,
textures, audio, map data). PAUDC is an *original* game inspired by a *genre* —
that distinction is what keeps this project shippable.

## Where we are (the ladder so far)

| Rung | Status | What it is |
|---|---|---|
| 0. Design bible | ✅ done | 9 docs in `worldbuilding/` — world, story, characters, systems, map |
| 1. 2D prototype | ✅ done | `game/index.html` — top-down island, 3 missions, canvas |
| 2. 3D prototype | ✅ done | `game/3d.html` — WebGL terrain, drivable jeep, zone beacons, full 3-mission chain + Well Fed buff |
| 3. Engine vertical slice | ⬜ next | One zone in a real engine, one great vehicle, one mission |
| 4. Expanded slice | ⬜ later | On-foot + vehicle, NPC traffic, YARDCLASH, wanted system |

## Three legal paths forward (pick per goal)

### Path A — Own engine, own game (the main road)
Build PAUDC as a standalone original game. **Recommendation for this project:**

- **Godot 4** for the next rung: free, open-source, lightweight, exports to web —
  meaning rung 3 can still ship as a click-a-link build like the prototypes. Best
  fit while the team is small.
- **Unreal Engine 5** when the target becomes AAA look (Lumen/Nanite open-world
  rendering): free until revenue thresholds, C++ + Blueprints, best-in-class
  open-world tooling. The right home for the eventual full island.
- Both have marketplaces with legal vehicle-physics kits, AI/traffic systems, and
  open-world starter kits — buying a driving model beats writing one for a small team.

Migration note: everything already built ports cleanly — the coastline/height
function in `game/3d.html` becomes a heightmap import, the zone layout doc is the
level-design brief, and the systems doc is the feature backlog.

### Path B — FiveM / alt:V multiplayer gamemode (the shortcut worth knowing)
FiveM and alt:V let people who own GTA 5 run custom multiplayer servers with
gamemodes scripted in Lua/C#/JavaScript — no source code involved, and Rockstar
acquired the FiveM team (Cfx.re) in 2023, legitimizing the ecosystem. A "PAUDC
roleplay server" (ranks, YARDCLASH nights, croc-wrangler jobs, Fort Flavor cooking
economy) could exist *inside* GTA 5's world as a server gamemode long before Path A
matures. Constraints: players must own GTA 5, Rockstar's/Cfx.re's terms apply, no
monetization outside their rules, and the world is Los Santos — our *systems* port,
our *island* doesn't.

### Path C — Study legally (fuel for Paths A & B)
- **GDC talks:** Rockstar engineers have publicly presented GTA V's rendering,
  streaming, and world design — search YouTube for "Rockstar GDC."
- **OpenRW:** an open-source reimplementation of the GTA III-era engine on GitHub —
  a legal codebase to learn open-world architecture from.
- **Script Hook V / OpenIV:** legitimate single-player modding tools; useful for
  understanding how GTA structures missions and assets without touching source.

## The mobile track — trained on the 2025 high-graphics mobile wave

The current crop of "realistic graphics" Android/iOS games proves a console look on
a phone is now table stakes, and they all get there the same few ways. Those
techniques (generalized — no engine code copied from anyone) become PAUDC's mobile
requirements:

- **Dynamic resolution + quality presets.** Render scale drops under load and the
  player gets an explicit HD/SD choice. *Already live in the prototype:* adaptive
  pixel-ratio stepping plus a new on-screen HD/SD toggle on touch devices.
- **Aggressive LOD and impostors.** Distant palms, buildings and NPCs become cheap
  stand-ins; only the district around the player is full-detail. Maps to our
  streaming-boundary plan in the map layout doc.
- **Short-session loops.** Top mobile games respect 5-minute sessions. PAUDC mobile
  leads with the loops that already fit that shape: a croc relocation, one delivery
  run, one YARDCLASH bout, a Fort Flavor cook.
- **Touch-first controls, controller optional.** The browser prototype is the
  testbed — touch buttons and gamepad support graduate with it into the engine build.
- **Install-size honesty.** The 150 GB flagship spec is PC/console. Mobile ships as
  **PAUDC: Neon Harbor Mobile** — an 8 GB companion build that streams one district
  at a time (ferry rides and gates mask the loads) plus the OnWatch companion app
  (clout feed, recruitment stat, YARDCLASH fight-night viewing) for off-island play.

Engine note: the chosen Path A engine (Godot 4, later UE5) exports to Android/iOS,
so the mobile track is a build target of the same project, not a second codebase.

## Decision for this repo

**Path A with Godot 4 is the next rung** (keeps the web-playable pipeline), with
UE5 as the graduation target and Path B held as a parallel option if the goal
shifts to "multiplayer community now." Path C feeds both continuously.
