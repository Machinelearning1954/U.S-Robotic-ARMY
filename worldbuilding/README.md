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
| [`JAMAICA_ISLAND_WORLD.md`](JAMAICA_ISLAND_WORLD.md) | **The full-island expansion spec** — all of fictionalized Jamaica at real scale: eight regions, biomes from SRTM elevation reference, road graph, GTA-6-tier fidelity spec for the engine rung, lighting presets, mission hooks. PAUDC stays the narrative heart. |
| [`JAMAICA_NPC_CULTURE.md`](JAMAICA_NPC_CULTURE.md) | Island-wide **NPC culture & behavior system** — archetypes by region, clock-driven routines, reputation-based reactions (Protector/Troublemaker/Outsider/Local), natural Patois dialogue sets, behavior trees per class, cultural event calendar. Respectful and fiction-safe by rule. |
| [`PAUDC_Driving_Physics.md`](PAUDC_Driving_Physics.md) | The **driving-physics module** — keep-left canon, friction-circle grip model, surface table, weather modifiers, suspension personality per ride, non-lethal damage spec, AI integration, per-region road behavior. Surface grip is live in the prototype. |
| [`PAUDC_Economy.md`](PAUDC_Economy.md) | The **economy module** — regional profiles, shop categories, vendor behavior, dynamic pricing formula, inventory/supply chains, money flow, black-market risk ladder, tourism economy. Alexandria/Silver Springs resolve to our island districts. |
| [`PAUDC_Transit.md`](PAUDC_Transit.md) | The **transit module** — route taxis, country buses, the Harbour Hopper ferry, boats, domestic air, the base shuttle; fast travel as physical, interruptible content. Ferry + taxi stands are live in the prototype. |
| [`PAUDC_Combat_System.md`](PAUDC_Combat_System.md) | The **combat module** — the Field Kit arsenal extended (less-lethal-forward, fictional makes only), game-feel ballistics, melee generalized from YARDCLASH, AI combat behavior, non-lethal damage floor, de-escalation as the strongest verb. The Dazzler puck is live. |
| [`PAUDC_Dialogue_Voice.md`](PAUDC_Dialogue_Voice.md) | The **dialogue & voice module** — regional registers, conversation states, ambient chatter beds on the world clock, five player stances (de-escalation strongest), emotional delivery rules, mission dialogue framework, binding authenticity rules. |
| [`PAUDC_Wanted_System.md`](PAUDC_Wanted_System.md) | The **police/wanted module** — the satirical BII five-star ladder (Noted → The Full Apology), courtesy-first non-lethal philosophy, pursuit AI mapping, consequences table. Tier ★★★ is playable in the prototype. |
| [`PAUDC_Side_Activities.md`](PAUDC_Side_Activities.md) | The **side-activities module** — Half Court basketball, Nine Ball pool, Duppy Links mini-golf, and **The Mud Run** dirt-bike circuit (live in the prototype). Cage fighting is already covered by YARDCLASH Beast Night, not duplicated here. |
| [`PAUDC_Housing_Interiors.md`](PAUDC_Housing_Interiors.md) | The **housing & interiors module** — **Anchor Row**, the first ownable safehouse with a real enter/exit interior and a sleep-to-reset bed, live in the prototype. Property tiers, decoration, and NPC visits are spec'd for later. |
| [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) | How the project ships legally: no leaked Rockstar code ever, the prototype→engine ladder, Godot 4 next / UE5 later, FiveM gamemode option, legal study resources. |

## Playable prototypes

[`../game/3d.html`](../game/3d.html) — **PAUDC 3D: Neon Harbor v0.37**, a fully 3D
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
streak across the moon. Toggles with the grade (`C`). v0.17 fills the two
biggest missing GTA staples: **on-foot mode** (`F` / the FOOT button steps out —
the ride parks where it stands, you walk, swim, and turn in place; `E` boards
any parked ride; first-person `V` works on foot too) and **NPC traffic** — seven
amphibious commuter cars looping the district ring road with lit headlights and
tail-lights, so the island finally has other people on it. v0.18 makes YARDCLASH
playable: walk on foot into **the Yard** — the container-walled fight ring at the
Crucible — and **Beast Night** begins. Trade strikes with the challenger (`SPACE`
in range; back off before his wind-up flashes), fill the three-segment **Yard
Meter** with clean hands, and it doesn't fire a super — it **transforms you into
the Rolling Calf**, the chain-dragging bull duppy of Jamaican folklore: double
damage, faster on your feet, red eyes in the dark. Win for clout and the *Man
Beat Duppy* call; get counted out and you can walk right back in. The
transformation-fighter variant is canon in the base design doc (§10, Beast
Night) — genre pattern only, every form original folklore-fiction. v0.19 adds the
**Chromelab Re-Render Queue** — the AI-video-tool wave, satirized in-world: big
stunts (splashdowns, Yard wins) now bank a **RAW CLIP** alongside their clout;
carry them to the Chromelab at Silver Springs and hold, and the Polytech's AI
enhancer re-renders them for **+8 bonus clout per clip** (systems doc §4.4, with
the "NUH REAL!" over-glazing satire). v0.20 unifies the package into **one game
with one front door** ([`../game/index.html`](../game/index.html) is now the hub;
the classic top-down prototype moved to [`../game/2d.html`](../game/2d.html)) and
boosts the 3D night look: additive neon halos on every district beacon and the
Pelican sign, **lamp posts with warm light pools along the ring road** (real
point lights on ULTRA), 4K shadow maps on ULTRA — and the **GRIDFALL arcade
cabinet** in the Crucible rec room, where walking up on foot and pressing `E`
boots the U.S. Robotic Army campaign in-fiction. v0.21 is the **San Andreas
rung**: procedural textures everywhere (zero downloads — noise-detail ground,
window-grid building facades on the cottages, Pelican strip and Polytech,
asphalt with dashed centerlines), a real **ring road** laid in 61 terrain-hugging
chunks along the district loop the traffic already drives, and the walker
rebuilt with **arms and legs and a speed-scaled walk cycle**. The asset pipeline
for higher-res texture packs runs free on Kaggle's GPU tier
([`../pipeline/kaggle_asset_pipeline.ipynb`](../pipeline/kaggle_asset_pipeline.ipynb));
the roadmap documents every free cloud-GPU option and why the game itself never
needs one (it renders on the player's device). v0.22 gives the island **time**:
a full **day/night cycle** (8-minute day) with a live HUD clock — dawn breaks
pink over the harbor, noon is bright tropical daylight with long draw distance,
dusk burns orange, and night brings back the neon; stars, moon, and lens streak
fade with the light, `N` jumps time in 3-hour steps, and storm mode, the Static
Hour, and Chromelab Grade all compose with it. v0.23 gives the stars teeth: at
**★★★ the BII dispatches the Courtesy Interceptor** — a teal-striped cruiser with
a flashing light bar that hunts you down (fast on land, grudging at sea — the
harbor is a real escape valve), blips red/blue on the radar, freezes star decay
while the chase is on, and ends one of two ways: linger slow near it for the
**courtesy stop** (ledger cleared, −15 clout, "words were had") or hold real
distance to escape (stars cool to ★★). See
[`PAUDC_Wanted_System.md`](PAUDC_Wanted_System.md) for the full five-star ladder.
v0.24 is the **driving-physics + wildlife pass**: a live surface-grip model —
asphalt is the fast line (+8% top speed, sharper steering), sand drags and
slides, **wet asphalt in a storm is the slickest thing on the island** — with
the surface read out on the HUD; NPC traffic now **keeps left, Jamaica-style**;
and the first ambient wildlife is airborne: eight seabirds circling the coast
that scatter when you get close, half-roost in deep night, and empty the sky
entirely during storms and the Static Hour. v0.25 adds **transit**: the
**Harbour Hopper** — a crewed ferry looping the three bay moorings; walk aboard
with `E` while it's docked, ride the deck around the bay, step off anywhere —
and **route-taxi stands** at Palm Line, The Strip, and Silver Springs (hold at
the yellow sign on foot and you're run to the next stand, *"small up
yuhself"*). Fast travel that's part of the world, per
[`PAUDC_Transit.md`](PAUDC_Transit.md). v0.28 adds **Vault Drag**, the signature
heist chase: pull up slow beside the crate at The Vault and press `H` to hook
it — the BII dispatches instantly (★★★), your top speed drops while hauling,
and you drag it the length of the island to Pelican Key for a big clout payout.
Get caught mid-haul and the crate is seized — try again after a 90s cooldown.
Every system in the game shows up in one run: surfaces, traffic, weather, the
day/night cycle, the Dazzler, and the Courtesy Interceptor, all at once. See
[`PAUDC_Wanted_System.md`](PAUDC_Wanted_System.md). v0.29 doubles the wildlife
roster: nine **iguanas** bask along the ring road and scurry off if you get
within about 10 m (invisible at night and in storms, same as the roosting
gulls), and **sea turtles and dolphins** now loop the reef spots and the outer
coast — the dolphins genuinely leap on their circuit — spooking wider when a
boat closes in and sitting out the Static Hour along with the rest of the
island's animal life. v0.30 adds **Ol' Fathom** — a rare storm-season legend:
during the roughest storms something enormous breaks the surface of the
harbor for a few seconds, three curling limbs and a pair of dim eyes, then
it's gone. No fight, no threat — just a filmable moment that banks a raw
clip and a big clout spike, feeding straight into the Chromelab's "NUH REAL!"
debate (systems doc §4.4): the better the enhanced replay looks, the less
anyone on OnWatch believes it happened. v0.31 adds the **OBIE Billboard** in
Silver Springs — the Static Hour arc's key art (psych doc §9, "The Choir")
rendered in-world as an original, canvas-drawn ad panel: a luminous brain
haloed over rows of desk-lights, tagline "the coworker that never sleeps."
By day it's just startup signage; cross into the Static Hour and the panel
glitches to its true read — scanlines, "GOSPEL HOUR" bleeding through under
the OBIE mark. Linger near it while the Static holds and the game banks the
Act-2 reveal early: **"YOU SEE IT NOW — THE CHOIR WAS NEVER HIRING," +25
clout** — the whole game, you'd been scrolling past the villain. v0.32 adds
**The Mud Run** — a six-gate dirt-bike circuit on the NIGHTHAWK, out past
the wetland. Board the bike, roll up to the start gate, press `B` to go;
clear all six gates in order (no time limit but your own) for **+30 clout**,
or **+60** if you beat your own best. Dismount or swap rides mid-run and it
just quietly ends — no penalty, try again from the gate. See
[`PAUDC_Side_Activities.md`](PAUDC_Side_Activities.md) for the rest of the
island's downtime activities (Half Court, Nine Ball, Duppy Links) still on
the spec-only list. v0.33 closes the last uncovered module: **Anchor Row**,
the first real interior. Walk up to the house, press `E` to go inside — a
proper enclosed room (floor, walls, window, bed, wardrobe), not just an
exterior prop with a dwell timer. Walk to the bed and hold position to
sleep: time jumps to dawn, paranoia clears, and the Static Hour lifts if it
was running — a clean-slate reset, no clout attached. Press `E` again to
step back outside exactly where you left. See
[`PAUDC_Housing_Interiors.md`](PAUDC_Housing_Interiors.md) for the property-
tier/decoration/NPC-visit roadmap beyond this first house. v0.34 adds
**ambient foot traffic**: pedestrians now walk the sidewalks island-wide,
and a vehicle passing close at speed scatters them — a quick hustle clear,
then back to a stroll, no bystander-gawking loop
(`JAMAICA_NPC_CULTURE.md` §2.3). v0.35 gives the BII a new ledger entry:
**Unsolicited Attention**. Stay within arm's reach of the same pedestrian, on
foot, for 6+ straight seconds and it's stalking, not sightseeing — the local
bolts, Watch Level rises a star, and it's the ledger's one entry that pays
**no clout, only a −15 penalty** (`PAUDC_Game_Systems.md` §12). Every other
infraction on the books is the island laughing at victimless mischief; this
one is the game drawing a line — matches the culture doc's rule that
personality varies but dignity is constant. v0.36 gives the **MARLIN GX** a
widebody kit — fictional aftermarket flares, a front splitter, hood vents,
and a GT wing — plus its first-ever badge: an original teal fish emblem on
the nose, replacing any real manufacturer mark (the reference image was a
modded real-world car; the logo is ours, drawn from scratch, per Rule Zero).
v0.37 answers the fan-discourse question "should GTA 6 bring back San
Andreas-style gang wars" with PAUDC's own take: **Turf Standing**, sound-
clash territory instead of armed turf. Each of the ten districts starts
under one of three fictional sound crews (Wharf FM, Cutlass Sound,
Tidewater Crew); stand your ground on foot near a rival-held beacon for 8
seconds and it flips permanently to **Your Signal**, +30 clout, tracked on
the HUD as `TURF n/10`. See
[`JAMAICA_ISLAND_WORLD.md`](JAMAICA_ISLAND_WORLD.md) §9 for why sound clash
— not armed gang conflict — is the on-canon version of this design ask.
v0.26 arms the Field Kit: press `G` to
throw the **Dazzler puck** — the canon stun-dazzle tool — at whatever's
threatening you: a dazzled **Courtesy Interceptor** sits blinking for four
seconds (lights on, wheels off — your escape window) and a dazzled **Yard
challenger** loses his wind-up for three. Eight-second cooldown, 45 m range,
non-lethal to its core (see [`PAUDC_Combat_System.md`](PAUDC_Combat_System.md)).
And The Strip gets the **Wheaton Night School** — classes upstairs at the
Bassline club, an outside staircase past the pink marquee; attend on foot for
the CERTIFIED title (+20 clout, and the bass was the metronome). v0.27 puts
**Plantin Airways** in the sky — the island's fictional flag carrier (cream
fuselage, orange and gold stripes, violet tail with a golden plantain),
an original livery. The jet circles the island at altitude all day; walk
to the orange **PLANTIN AIRWAYS** kiosk by The Strip's runway and hold to board
the **Island Hop** — one full aerial lap of the island, window seat, then wheels
down back at the gate (+15 clout, *"soon come" was a promise*). Target-look
film in the graphics research doc.


[`../game/index.html`](../game/index.html) — **the front door**: a styled hub
that presents the whole package as one game with three doors (Neon Harbor 3D,
the GRIDFALL cabinet, the classic prototype).

[`../game/2d.html`](../game/2d.html) — **PAUDC: Neon Harbor v0.1**, a
self-contained top-down browser prototype (open the file in any browser). Drive the
amphibious Mudfish Mk-0 around an island whose coastline is traced from the real
Port Antonio geography (twin harbors, Navy Island, Folly Point — everything on it
fictional), complete the Open House tour, relocate three crocs, and run the curry
goat delivery. Keyboard (WASD/arrows + Space) and touch supported.

[`../game/army.html`](../game/army.html) — **U.S. Robotic Army — Campaign**, a
top-down 16-mission shooter built in a sibling session (imported from the
`claude/youtube-video-review-c8e876` branch; see [`../game/ARMY.md`](../game/ARMY.md)).
In canon it's **GRIDFALL**, the Crucible rec-room arcade cabinet — bootable from
inside the 3D game — now wearing the Trailer Grade film stack + CRT scanlines.
You are ARES-7, the last loyal combat android, retaking the automated defense
grid from a rogue AI: six weapons, drivable vehicles (E to board, hull armor,
ram damage), a GTA-style 1-5-star wanted level in the APC-heist epilogue, and a
"Field Footage" reel section. Fully self-contained, opens in any browser.

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
