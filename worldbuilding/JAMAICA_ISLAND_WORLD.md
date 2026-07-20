# Jamaica Island World — Full-Scale Open-World Specification

> **FICTIONAL VIDEO GAME CONTENT.** The whole-island expansion of the PAUDC
> universe: the fictionalized Jamaica the Port Antonio complex already lives in,
> now specified island-wide. Public geography (coastlines, mountains, towns,
> highways, waterfalls) is used as *reference* the way open-world games have always
> referenced real places. **Standing boundaries:** every military, police, and
> security element is invented (PAUDC replaces any real installation; no real
> facility, unit, or procedure appears); no real person or business is depicted
> (brands and venues are fictionalized); satellite/map sources are reference for
> shape and mood, never reproduced as assets.

## 1. Reference sources (geography and atmosphere only)

Public, legal reference for terrain and environment art direction:
- **NASA Worldview** (MODIS/VIIRS true color) — island-scale color, cloud behavior.
- **ESA Sentinel-2** — coastline shape, vegetation density bands, reef/water color.
- **USGS / SRTM elevation** — the heightmap basis (Blue Mountains to coastal plains).
- **NOAA GOES-East** — tropical weather rhythm for storm-system presets.
- OpenStreetMap (ODbL, with attribution) *only if* real road topology is imported;
  the default is hand-authored roads inspired by the real network.

Rule: reference informs **our** hand- and procedurally-authored assets. No imagery
is copied into the game.

## 2. Regions (real-scale, eight playable zones)

| Region | Anchor geography | Game identity |
|---|---|---|
| **Kingston & Port Royal** | harbor basin, Palisadoes spit | dense urban core: downtown grid, uptown hills, markets, docks, music halls |
| **Portmore & Spanish Town** | plains west of Kingston | commuter sprawl, historic old-capital quarter, drag strips |
| **Blue Mountains & the East** | 2,200 m ridge line, coffee terraces | switchback roads, mist, plantations, radio towers, **Port Antonio + PAUDC** (the fictional complex — our existing canon slots in here at real scale) |
| **North Coast: Ocho Rios** | falls, garden parishes | resort towns, waterfall parks, cruise piers |
| **North Coast: Montego Bay** | Sangster-inspired airport bay | second city: hip strip, yacht clubs, hillside great houses |
| **Negril & the West End** | seven-mile beach, cliffs | sunset cliffs, dive shacks, beach economy |
| **Cockpit Country** | karst dome maze | the wild interior: sinkholes, caves, hidden yards, no straight roads |
| **South Coast** | Mandeville plateau, Savanna-la-Mar plains, Treasure Beach | farmland (cane, banana, coffee), fishing villages, bauxite works, black-sand coves |

**POI class list** (each fictionalized in name where commerce is involved): waterfall
parks (Dunn's-River-class, Reach-Falls-class, YS-class), Blue-Lagoon-class coves,
Rio-Grande-class rafting rivers, Martha-Brae-class bamboo runs, great houses,
lighthouses (Negril, Folly, Lover's Leap classes), markets (Coronation-class),
sound-system lawns, fishing beaches, bauxite piers, two international airports
(fictional operators), cruise piers, cricket ovals, university campus.

## 3. Terrain & biomes

- **Heightmap:** SRTM-derived 1:1 island (~235 × 80 km) at 10 m base resolution,
  detail-tessellated near play areas. Blue Mountain Peak is the vertical landmark
  the whole east navigates by.
- **Biome bands** (drive vegetation + ground material): coastal sand/mangrove →
  dry-scrub south coast → cane/banana plains → wet limestone forest (Cockpit) →
  montane cloud forest (Blue Mountains) → reef/seagrass marine shelf.
- **Water:** reef-protected turquoise shelves on the north coast, deep-blue drops
  on the south, river systems (Rio Grande, Black River classes) navigable by raft
  and fishing boat.

## 4. Road graph & navigation

- **Spines:** Highway-2000-class toll expressway (south), North-Coast-Highway-class
  coastal artery, A1/A2/A3-class trunk roads crossing the interior.
- **Character roads:** Blue Mountain switchbacks (the driving-skill endgame),
  Cockpit rural tracks (off-road), beach lanes, market one-ways in Kingston.
- **Nav mesh layers:** vehicle (road-snapped), off-road (biome-cost-weighted),
  pedestrian (sidewalk/market/beach), marine (reef-aware boat lanes), air (two
  airport approaches + helipad network).
- Traffic density and speed limits per class; the existing prototype's ring-road
  system is the microcosm of this graph.

## 5. Fidelity spec (engine rung — UE5/Godot target)

The GTA-6-tier feature list maps to the engine rung (see `DEVELOPMENT_ROADMAP.md`
and `engine/MOBILE_RENDER_DOCTRINE.md`; the browser build stays the instant-play tier):
- Lumen-class real-time GI + reflections (water, wet asphalt, glass) — hardware RT
  where present, software fallback elsewhere.
- Nanite-class micro-geometry for limestone, foliage, zinc roofs, colonial brick.
- Volumetric tropical sky: cumulus banks off the north coast, haze bloom, god rays
  through mountain mist; humidity as a lighting parameter.
- PBR material library: cut limestone, corrugated zinc, painted concrete, cane
  field, red bauxite earth, wet sand, reef water.
- Foliage with subsurface scattering + wind (banana leaf, palm, bamboo).

## 6. Atmosphere & lighting presets

1. **Golden hour over Kingston** (default) — warm low light across the harbor.
2. **Sunrise over the Blue Mountains** — pink mist, coffee-terrace silhouettes.
3. **Midday Montego Bay** — hard tropical sun, turquoise bounce.
4. **Storm evening, north coast** — GOES-style squall wall riding in (feeds the
   existing Storm Condition system).
- The v0.22 day/night cycle in the prototype is this system's first rung.

## 7. Gameplay layout & mission hooks

- **Urban:** Kingston docks (smuggling interdiction chains), downtown markets
  (chase set-pieces), uptown hills (social missions).
- **Resort:** Montego Bay/Ocho Rios (undercover-in-paradise arcs, Regatta Royale
  scales up here).
- **Rural:** south-coast farm runs, fishing-village supply chains (the Low & Slow
  pattern island-wide).
- **Wild:** Cockpit Country as the endgame wilderness (Barometer Syndicate hideouts;
  the Static Hour arc's transmitter finale relocates its class of buoy here).
- **Mountains:** switchback time trials, radio-tower climbs, cloud-forest stealth.
- PAUDC (Port Antonio) remains the narrative heart; the island is its world.

## 8. Deliverable index

1. Region/district/POI spec — **this document** (§2, §7).
2. Asset list — biome vegetation sets, building kits per region (zinc-roof vernacular,
   colonial brick, resort modern), vehicle classes (route taxis, country buses,
   fishing boats, rafts + existing canon rides), signage (fictional brands), lighting
   props. Detailed per-kit lists live with the engine project when rung 3 starts.
3. Road graph + nav mesh — §4.
4. Weather/lighting profiles — §6 + Storm Condition ladder (systems doc §7).
5. Cinematic cameras — flyover (the GTA-6-trailer coastal sweep), switchback chase
   cam, market steadicam, storm-wall approach; POV ride cam already shipped (v0.12).
6. Mission hooks — §7.

## 9. Turf Standing — the island's own "gang war," fought with amps not guns

Fan discourse keeps asking Rockstar for San Andreas-style territorial gang
wars. PAUDC's answer to that design question, on-canon: **sound-clash
territory, not armed turf**. Jamaica's real sound-system culture — rival
crews competing for a district's ear, not its blood — is the authentic,
already-celebrated version of "whose colors fly here," and it's the one that
fits this game's non-lethal, courtesy-first design floor without touching a
real gang aesthetic or a real firearm.

- **The setup:** each of the ten districts starts under one of three
  fictional sound crews — **Wharf FM**, **Cutlass Sound**, **Tidewater
  Crew** — each with its own color, flown on a small banner at the
  district's beacon.
- **The flip:** stand your ground on foot, unarmed, near a rival-held
  beacon for 8 continuous seconds — you make your case, the block listens —
  and it flips permanently to **Your Signal**, the player's own colors.
  No fight, no gun; the contest is presence and nerve, the same "hold a
  beat" language the game already uses for the Static Hour's escape trigger
  and the Wheaton Night School's classes.
- **Live in the prototype (v0.37):** all ten beacons are flippable this way;
  a HUD readout tracks `TURF n/10`; each flip pays **+30 clout**, permanent
  once won (matches the recon tour's own one-way completion model).
- **Why not a literal gang-war system:** armed territorial conflict is
  exactly the real-world genre trope this package has declined to depict
  anywhere else (the Wanted System doc's non-lethal floor, YARDCLASH's
  folklore-fighter reframe of "underground fight club"). Sound clash is the
  same competitive-territory beat, minus the part that would break Rule Zero
  and the content-boundary mandate.

## 10. The Lotus Terraces — a Bali-inspired resort garden (live in the prototype, v0.56)

An island resort venue **inspired by** Balinese garden-temple architecture,
built entirely original: a tiered *meru*-style garden tower, a split
entry gate in the *candi bentar* silhouette, and a still **lotus pond**
with lily pads, set on a quiet coastal flat. It's the same move the whole
map makes with real geography — draw on a real place's *atmosphere*, then
build something invented rather than a replica.

- **Live now:** stand by the lotus pond on foot and hold a few seconds and
  the game banks a one-time **"serenity"** beat — *"the island keeps its
  calm," +30 clout*. The same "hold a beat" language as the Static Hour's
  escape and Turf Standing, reused for a moment of quiet instead of tension.
- **Content boundary:** Bali-*inspired*, not depicted. **No real temple,
  shrine, site, address, or location is copied or named** — the tower, gate,
  and pond are stylized original geometry, reimagined as a fictional island
  resort. Consistent with §0's "brands and venues are fictionalized" rule.

## 11. Gilded Bay — a Dubai-inspired waterfront district (live in the prototype, v0.64)

The island's answer to the Gulf-futurist skyline, built the same way §10 built
Bali: **inspired by, never copied**. On a clear stretch of south coast:

- **The Pinnacle** — the island's tallest structure, a telescoping needle
  tower with a glowing tip, visible from most of the map.
- **The Sailfin** — a sail-silhouette hotel on the point (a curved shell and
  mast in original proportions — an homage to a *shape language*, not a
  replica of any building).
- **The Window** — a golden frame on the shore that composes the harbor view.
- **Palm Cay** — a small palm-shaped islet in the bay, spine, fronds and
  crown, best seen from the air on the Island Hop.
- **The Bloom** — a fountain show on a shore basin: five animated jets that
  dance all day. Stand by the basin on foot for a few seconds and the game
  banks a one-time **+30** "caught the full show" beat.

**Content boundary:** every structure is original stylized geometry with an
invented name. **No real building, skyline, address, or site is replicated or
named** — this is the map's standing fictionalize-real-places rule (§0, §10)
applied to a second real-world inspiration.

> Fictional game world. Real-place names are geographic reference in the tradition of
> open-world games set in real regions; everything operational, commercial, military,
> or personal is invented.


## The Coral Tunnel — undersea glass line off the Bali gardens (live, v0.91)

From the shore of the island's **Bali garden estate** (the game's own invented
garden district — no real Bali is depicted), a **twin-bore glass undersea line** dives at paired
portal towers (gold cap one way, green the other) and runs four hundred metres
across the bay floor: two transparent tubes ringed in dark frames, one direction
of travel per bore (v0.94 matched the source render's twin tubes), resting
among the coral, with **eight glowing shuttles** streaming through it in both
directions like fireflies in a bottle. A wooden **viewing deck** with a brass
scope overlooks the dive point — linger there for a one-time **+20** and watch
the lights run the seabed. *"The reef never minds good neighbours."*

- **Boundary:** the source post was a real city's undersea road-tunnel project,
  national flag flying. The real city, project, and flag are **not** depicted —
  real places stay fictionalized in this world, and the request's "Bali" resolves
  to the island's own fictional Bali gardens, per the same rule that renamed
  every other real place. Civil infrastructure wonder only; nothing else kept.


## The Vellum — sculptural harbourfront galleries (live, v0.93)

On the strip between Gilded Bay and the Bali gardens: three pale sculptural
**monoliths** on a bollard-lit promenade, each pierced by one huge **glowing
aperture** — warm amber light breathing inside the cut stone, small dark figures
silhouetted against it, brighter as the dusk comes down. The island's gallery
quarter: art in the openings, sea at your back. Linger on the promenade for a
one-time **+20**: *"three stones with light inside."*

- **Origin:** an architecture concept render (sculptural waterfront pavilions
  with cut-out apertures) — rebuilt as original invented buildings; no real
  city, landmark, or architect's project depicted.


## The Trine — the triangle observation wheel (live, v1.06)

The waterfront's new signature landmark, original by geometry: not a wheel — a
**giant equilateral triangle**, turning slow as a Sunday on an A-frame above the
strip. Each of its three edges is lit in its own neon (teal, gold, pink), gold
hubs at the corners, and **six white-and-green gondolas ride the rim of the
triangle itself**, counter-rotating so they hang level through every corner.
Stand beneath it a moment for a one-time **+25**: *"the only three-cornered
wheel on any coast."*

- Invented landmark — no real attraction depicted. Born from a "make it a
  triangle instead of a circle" brief, which is exactly the kind of twist that
  makes a skyline ownable for marketing.


## Island One — the state flagship and her wing (live, v1.14)

Every so often the whole sky stands up straight: **Island One**, the island's
invented state flagship — cream hull, green band, black tail crossed with the
**gold saltire** — crosses high and stately, westbound, with **four festival
sportplanes riding a rigid diamond** around her, wingtip-true. The escorts are
built into the same formation frame, so their sync is perfect *by construction*;
the whole procession banks and breathes as one.

**Untouchable, twice over.** By canon the procession is ceremonial; by
construction nothing in the game can affect it — no system targets aircraft
here, because nothing on this island attacks anything. Stand under the crossing
for a one-time **+25**: *"the flagship and her wing, untouchable and exact."*

- **Origin:** an image of a real head-of-state aircraft under real fighter and
  bomber escort. The real aircraft, national livery, fighters, and bombers are
  **not** depicted — only the majesty of a flagship in formation was kept, and
  every plane in it is invented and unarmed.
