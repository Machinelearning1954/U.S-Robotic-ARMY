# PAUDC — Game Design Package

> **FICTIONAL VIDEO GAME CONTENT.** Everything in this directory is invented
> worldbuilding for an open-world action game inspired by GTA 6, set at the fictional
> **Port Antonio Unified Defense Complex (PAUDC)** in a fictionalized Jamaica. No real
> military installations, systems, procedures, schools, or people are depicted. Each
> document carries its own disclaimer and the package's standing content-boundary
> rules live in the base design doc.

## Documents

| File | Contents |
|---|---|
| [`PAUDC_Base_Design.md`](PAUDC_Base_Design.md) | **The world bible.** The seven zones, departments, fictional tech, GTA 6 design-language alignment, 150 GB install spec, YARDCLASH fighting minigame, content boundaries. Read this first. |
| [`PAUDC_Story_Campaign.md`](PAUDC_Story_Campaign.md) | Three-act campaign *"Every Storm Has a Name"* — 14 missions plus side chains, introducing the antagonist Barometer Syndicate ("The Weathermen") and resolving the Numbers Station / Maroon Thunder threads. |
| [`PAUDC_Character_Bible.md`](PAUDC_Character_Bible.md) | Character sheets for the main cast (Auntie Blades, base command, the YARDCLASH roster and more), dialogue voice guide, and rival faction sketches. |
| [`PAUDC_Map.svg`](PAUDC_Map.svg) | Stylized in-game pause-menu map of the base and peninsula. |
| [`PAUDC_Map_Layout.md`](PAUDC_Map_Layout.md) | Spatial design: zone connections, travel routes and times, rank-gated access rings, streaming boundaries, landmark photo spots. |
| [`PAUDC_Game_Systems.md`](PAUDC_Game_Systems.md) | Systems design: rank ladder, four specialization trees, economy, OnWatch clout loop, Watch Level & Standing, Storm Condition gameplay, live-event calendar. |
| [`PAUDC_Culinary_Academy.md`](PAUDC_Culinary_Academy.md) | The Tichfield Culinary Academy ("Fort Flavor") — cooking school hub, recipe/buff system, the curry goat questline, food economy and events. |
| [`PAUDC_Wildlife_Butcher.md`](PAUDC_Wildlife_Butcher.md) | Wildlife ecosystem and the Blue Mountain Butcher & Market — stylized capture/processing loop, Butcher skill tree, hygiene minigame, dynamic pricing, black-market risk lever. |
| [`PAUDC_Psych_Thriller.md`](PAUDC_Psych_Thriller.md) | **"The Static Hour"** — the optional psychological-thriller arc extending the Numbers Station thread: the Presence you can't fight, the Paranoia meter, an unreliable-narrator set-piece and its twist, all non-lethal by rule. |
| [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) | How the project ships legally: no leaked Rockstar code ever, the prototype→engine ladder, Godot 4 next / UE5 later, FiveM gamemode option, legal study resources. |

## Playable prototypes

[`../game/3d.html`](../game/3d.html) — **PAUDC 3D: Neon Harbor v0.16**, a fully 3D
WebGL prototype (Three.js inlined, opens in any browser): vertex-colored island
terrain generated from the same Port Antonio-traced coastline, drivable amphibious
jeep with chase camera, water, stars, palm forests, glowing zone beacons, the Vault
with its teal door — and the full three-mission chain: the recon tour of all eight
districts, **Croc Wrangler** (relocate Miss Snappy, Ol' Boots and The Barrister from
the eastern wetland to the west-shore sanctuary), and **Low & Slow** (run the curry
goat pot from Fort Flavor to The Ear in 90 seconds without dunking it). Delivering
hot earns the **Well Fed** buff (+12% top speed) — the Section 10 needs system,
carrot-not-stick, live in-game. v0.3 adds the ninth district **Silver Springs**
(glowing terrace pools + the Polytech campus), the **OnWatch clout** counter paying
out on every objective, and the **Chromelab Grade** photo-real display mode
(`C` key or the GRADE button — filmic tone mapping, warmer light, deeper draw;
graded splashdown clips pay double clout). v0.4 is the graphics pass: real-time
soft shadows that follow the player, vertex-animated swell on the sea with live
specular, a night-sky dome with a visible moon, wet-sand waterline shading, lit
cottage windows, and a denser palm forest with varied heights — Chromelab Grade now
defaults ON. v0.5 adds true post-processing bloom in Grade mode (neon, beacons
and pools genuinely glow), twin spotlight headlight cones, denser terrain, and the
AI-pipeline Mudfish mesh (image-to-3D GLB) that live-loads as the player vehicle
where the network allows. v0.6 adds Pelican Key as the tenth district and
device-tier auto-detection (ULTRA/HIGH/BASE for PC / iPhone 16 & Fold 6 class /
older phones). v0.7 adds true planar water reflections on ULTRA (the whole neon
island mirrors in the sea in Grade mode) and the first BII infraction: sustained
donuts trigger "Excessive Style, Vehicular" — a watch star plus a small clout
payout. v0.8 adds the Reef School fishing act (sonar spots, three red snapper,
hold class at the pier for the INSTRUCTOR title) and the **Marlin GX** — an
original luxury SUV parked at The Strip; walk up and press `E` to swap rides
(faster on land, hates water — the Mudfish stays the amphibious workhorse).
v0.10 adds the missing GTA staple: a live **circular radar** bottom-left (island
shape, all ten districts, your heading, the objective and your parked ride) and a
full-screen **pause map** on `M` / the MAP button with every district labeled.
v0.11 adds **Beach Bootcamp** — in free roam after the Reef School, three fitness
stations glow on the Palm Line sand; hold form at each to complete the set (3/3
earns the COACH title), the in-game fitness-coaching career. v0.12 adds a third
ride — the **Nighthawk streetbike** (park near it and press `E` to swap, now a
three-vehicle ring) — and a **first-person rider POV** camera (`V`), trained on
the Cyberpunk POV-motorbike showcase. v0.13 adds **Storm mode** (`R` or the
STORM button) — trained on the Cyberpunk rainy-neon night-drives: camera-following
rain, darker storm sky and fog, dimmed moon, boosted wet-neon bloom, and glossier
water; toggles back to clear skies. v0.14 adds the **Green Cross** — a licensed
medical wellness dispensary (fictional brand) on the Palm Line: once you're
Instructor and Coach, its green beacon opens in free roam; drive up and hold steady
to fill your script and gain the **IRIE** buff, which cools your BII Watch Level
twice as fast. It's the legal, clinical counterpoint to the Gains Trade snake-oil —
carrot, never stick. v0.15 adds **The Static Hour** (`T` or the THRLLR button) — the
playable slice of the psychological-thriller arc: the world goes cold and
claustrophobic, the numbers-station whisper-line ticks across the screen, and **The
Presence** (a matte-black figure with dim red eyes) trails you, gaining ground when
you slow down. A **Paranoia vignette** closes in the nearer and darker it gets; drive
into any lit district to make the static lift. Let it fill and you come to back at the
harbor, unharmed — the arc's non-lethal rule, live. See
[`PAUDC_Psych_Thriller.md`](PAUDC_Psych_Thriller.md). v0.16 is the **Trailer
Grade** film stack — the GTA-6-trailer look, layered onto Chromelab Grade:
animated film grain, a teal-orange split-tone (warm highlights, cool shadows),
a saturation/contrast lift, a natural lens vignette, and an anamorphic lens
streak across the moon. Toggles with the grade (`C`).


[`../game/index.html`](../game/index.html) — **PAUDC: Neon Harbor v0.1**, a
self-contained top-down browser prototype (open the file in any browser). Drive the
amphibious Mudfish Mk-0 around an island whose coastline is traced from the real
Port Antonio geography (twin harbors, Navy Island, Folly Point — everything on it
fictional), complete the Open House tour, relocate three crocs, and run the curry
goat delivery. Keyboard (WASD/arrows + Space) and touch supported.

[`../game/ISLAND_BUILD.md`](../game/ISLAND_BUILD.md) — **Island of Jamaica 3D**,
the larger WebGPU sandbox build (the user's flagship vision): full island, on-foot
+ driving, A* police pursuit, dual protagonists, day/night, radio, save system —
same universe as PAUDC, at a bigger scale. See the note for how it maps to canon,
the content-boundary reconciliation it needs, and how to land the exact file.

## Canon quick facts

- **Install target:** 150 GB, budgeted by asset category.
- **Antagonists:** the Barometer Syndicate — smugglers who strike only when the
  Storm Condition ladder is falling.
- **Recruitment stat:** a live world-stat raised by viral OnWatch clips *and* by
  feeding NPCs from Fort Flavor.
- **Weekly rhythm:** Friday Fireside cook-off → YARDCLASH fight night; seasonal
  Regatta Royale and Storm Season events.
