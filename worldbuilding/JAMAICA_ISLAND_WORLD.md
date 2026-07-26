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


## The Eyrie — cliffside cave dwelling (live in the prototype, v1.26)

A hermit's lodge carved into a rock spire on the island's high ground: climb the
long **ladder** and press **E** to step inside a warm carved cave — a bed under
a red blanket, a wood stove with an ember glow and a flue, a table of cooking
pots, a hanging lantern, and a bright window looking out over the valley. Walk
to the bed and dwell to **rest**: the night passes to a clean dawn and a clear
head (calms paranoia, clears static, refills breath). First climb pays **+20**,
first rest **+15**; both persist in the save. Press **E** at the mouth to climb
back down.

- **Non-lethal, as ever:** there is no fall damage anywhere in the game — you
  always climb, never fall.
- **Boundary:** built from an AI-art reel of a cozy cliff cave. **No real place,
  brand, or person is depicted** — an original island landmark and interior,
  modelled from engine primitives like every other build.
- **Interior pockets note (for the record):** the cave interior is a separate
  world "pocket," and it is placed **inside the world movement clamp (±594 x,
  ±394 z)** so the player can actually walk to the bed — a lesson learned when
  the first placement sat outside the clamp and the player was pulled back to
  the boundary. Future interiors should stay inside those bounds.


## The Roadworks — a construction zone on the boulevard (live in the prototype, v1.30)

A stretch of torn-up harbour road under repair: a patch of raw asphalt, a line of
orange jersey barriers along the road edge, cones, a warning sign, a working
**excavator** (its boom and stick swing slowly, bucket digging), and a **hi-vis
crew** of four in yellow vests and hardhats. Roll or walk up; dwell on foot near
the crew for the foreman's wave-through — first visit **+15**, then rotating
site call-outs ("harbour road resurfacing… new drainage before storm season…
the island keeps building"). Saved.

- **Boundary:** built from a "GTA.6" fan reel of a torn-up beachfront boulevard.
  The **GTA branding and the "Vice Point" naming are not used** (Rockstar IP,
  Rule Zero). A roadworks scene is generic, non-lethal city life — the barriers,
  excavator, crew, and street are all original, invented for the island.


## The Skylanes & the Marina — "year 2150" (live in the prototype, v1.34)

Two original layers that give the harbour its future-city feel, straight from a
"traffic flies and luxury floats" vision:

- **The Skylanes:** a persistent stream of **ten flying craft** cruising elliptical
  lanes high over the district at dusk — sleek hulls, glowing cyan engines that
  pulse, each on its own orbit and speed. Ambient, always aloft. Stand downtown
  on foot and look up for a one-time **+20** ("year-2150 traffic streaming over
  the harbour — the island flies now").
- **The Marina:** a cluster of **eight moored luxury yachts** in two dock rows on
  the golden bay water, each with an underglow in a different neon, linked by
  timber docks. Come close for **+10** ("where luxury floats"). Both saved.

- **Boundary:** built from an AI futuristic-city reel — fully fiction-safe, no
  IP, no real place, no people, no weapons. Every craft, yacht, and dock is
  original, built from engine primitives.


## The Bamboo Raft — misty reed-inlet river phantom (live in the prototype, v1.37)

A quiet reed inlet on the shoreline: a **bamboo-pole raft** bobs on the water,
ringed by tall bamboo and reed stalks, with a **heron** working the shallows
nearby. On the raft, draped in foliage, kneels the **River Phantom** — a
naturalist blended into the reeds with a **monocular** to the mist. Stand on the
bank and dwell for **+20** ("counts the wild, never a soul"), then rotating
nature notes (a kingfisher takes a fish, dragonflies stitching the mist). Saved.

- **Boundary:** built from a "Bamboo River Phantom" reel — a ghillie **sniper**
  on a raft. The **rifle and the sniper/assassin framing are removed** (non-lethal
  floor), and the figure is re-cast per the island's watch doctrine: a wildlife
  watcher with a **monocular, not a weapon**, who observes the river's life and
  never a person. Original raft, reeds, heron, and figure.


## The Sail — original sail-tower on its own islet (live in the prototype, v1.39)

The harbour's new marquee landmark: an original **sail-shaped luxury tower** on
its own **artificial islet**, reached by a causeway. A tall billowing white
shell with a deep-blue glass front, a mast peak with a blinking red aviation
beacon, and a **cantilevered helipad with a gold "H"** — trimmed in the island's
green-and-gold colorway. A photo-mode magnet and a skyline signature. Come near
(walk the causeway, or arrive by boat) for **+20** ("luxury isn't a place; it's
the view"). Saved.

- **Boundary:** built from a Burj-Al-Arab-from-above reel. **The Burj Al Arab is
  a real, trademarked building and is NOT reproduced** — only the *archetype* of
  a sail-shaped hotel on a private islet was kept, rebuilt with original
  proportions and the island's own colorway. No real place or building depicted.


## The Future District batch — Welcome Plaza & Sea Tube (live in the prototype, v1.40)

Two builds from a trio of AI future-city reels (robot greeters in a grand
plaza / a golden holo street with glowing trees / an underwater city):

- **The Welcome Plaza:** a pale plaza pad at the district's edge where **two
  polished greeter robots** flank the walk — glowing visors, chest lights, and
  **waving arms** — under an animated **LED wall** scrolling greetings
  ("WELKOM · BIENVENIDO · AKWABA"), with six **glowing trees** lining the
  approach. Walk between the greeters for **+15**; the sign-off is doctrine:
  *"they hold the door, never the data."* Greet, never scan.
- **The Sea Tube:** on the seabed of the dive waters, a **glass transit tube**
  on legs with ring ribs, a **lit shuttle gliding** its length back and forth,
  ending at a **glass dome settlement** glowing warm on the sea floor.
  Free-dive down near the line (SPACE to dive) for **+20** — "the future runs
  underwater." A destination for the island's divers, near the wreck fields.

Both saved. Boundary: all three reels are AI concepts — no real place, brand,
person, or weapon; every structure and robot is original, from primitives.


## The Blue Range Dome — high-mountain robot grow-house (live in the prototype, v1.43)

Up on the island's high range (its fictionalized Blue Mountains — coffee
country), a **geodesic grow-dome**: a transparent shell with a wireframe
lattice, three hydroponic benches of greens, a row of **coffee shrubs with red
cherries**, and **three white robot arms** that sweep and tend the beds all day
— shoulder, elbow, and gripper articulating on their own rhythms. Walk in on
foot for **+20** ("the mountain feeds the harbour"), then rotating grower's-log
lines. Saved.

- **Boundary:** from a "what will humanity eat on Mars?" greenhouse reel. The
  Mars framing and the account's branding are excluded; the request re-rooted
  it **at home in the island's own mountains**. The robots are farming arms —
  nothing armed, nothing watching people. Original dome, benches, plants, and
  arms, from primitives.


## The Range Rescue — high-altitude medevac drone post (live in the prototype, v1.44)

Up in the Blue Range near the grow-dome: a white rescue hut with a green cross,
a marked drone pad, and a **six-rotor medevac drone** that runs a perpetual
supply cycle — spin-up, lift to altitude, fly the high line downslope, **lower a
yellow medical crate on a winch** into a gold drop ring, raise, return, land.
Rotors idle slow between runs and blur fast in flight. Dwell at the post for
**+20** ("supplies down, nobody armed"). Saved.

- **Boundary:** from a defense-account batch (armed troops with a rescue drone;
  a nuclear submarine; real flags — request asked to re-flag with Jamaican +
  American flags). The **weapons, the real militaries, and all real flags are
  excluded** — and re-flagging real hardware to other real nations is still
  real-nation military content, which this world doesn't do. Kept only the
  humanitarian kernel (the high-altitude medical drone), as Green Cross canon.
  The two masts fly the **island colourway and Alexandria's pennant** — the
  world's own stand-ins for the two-flag request, per the Twin Harbors Accord.


## The Reef Room — the Sail's underwater suite (live in the prototype, v1.46)

The Sail gets its signature room: a **DIVE LIFT hatch on the islet** drops you
into a warm concrete suite whose **entire east wall is glass into a living
reef** — nine coral heads, five fish crossing the pane in slow arcs, blue reef
light through the water, and a warm caustic shimmer playing on the ceiling. Low
platform bed with a rumpled duvet; a shelf niche with a vase. First descent
**+20**; **rest on the bed** to pass the night ("slept under the sea — woke to
fish crossing the glass", first rest **+15**). E at the door rides you back up.
Both saved. Interior pocket placed inside the world clamp (the v1.26 lesson).

- **Boundary:** from an underwater-bedroom concept reel — no real hotel, brand,
  or place; the suite, reef, and fish are original, from primitives.


## The Current Farm — the island's clean-energy district (live in the prototype, v1.48)

West of the district, the thing that powers all that neon: **four offshore wind
turbines** standing in the bay with blades turning, a **circular solar fan** —
three rings of tilted panels — around a faceted **grid tower** whose three
charge bands **pulse light upward** like current climbing. Walk to the tower's
base for **+20** — *"wind off the bay, sun off the fan, charge climbing the
tower. The neon runs clean; nothing burns."* Saved.

- **Boundary:** from a "futuristic cities" clean-energy reel; the real-place
  framing is fictionalized as always. Turbines, panels, and tower are original,
  from primitives. Purely civil infrastructure — the harbour's lights finally
  have a source.

## Anansi's Lantern — the settled sub, now a reef (live in the prototype, v1.50)

Out in the deep dive waters east of the harbour (around **150, -250**, on a seabed
about **17 units down**), a long dark hull has come to rest on the sand: **Anansi's
Lantern**, a retired **deep-survey submersible** that was deliberately sunk to seed
an artificial reef. Free-dive down to it (on foot, in the water, hold dive) and the
harbour marks the find — **+20**, once.

- **What's down there:** a capsule hull with a rounded bow and stern, a deck casing
  and conning-tower sail, a couple of masts, a four-bladed survey screw — and a
  **warm running lamp still burning** on the sail, throwing light into the dark. The
  **coral took it back**: reef blooms cling all along the hull, silt drifts around
  the base, and bubbles rise off the deck and fade as they climb. It reads exactly
  like the reel that inspired it — *a submarine settled onto the seabed* — but it is
  a wreck the sea made peaceful, not a machine at work.
- **Where it fits:** joins the underwater layer — the Sea Tube, the Reef Room, the
  coral tunnel — as a free-dive landmark for divers who go looking in the deep.
- **Boundary:** the reference was an **Operation Ivy Bells / USS Halibut** reel — a
  **real Navy submarine** on a **real Cold-War operation to tap undersea comms
  cables**. All of that is **out**: no real military vessel, no military framing, and
  **no surveillance** (the island watches *with* you, never *at* you — a spy sub that
  taps cables is the exact opposite of the doctrine). What's kept is only the *image*
  — a hull at rest on a dark seabed, a light still glowing, silt and bubbles. Ours is
  an original, retired **civil survey** submersible turned reef and dive attraction.
  No weapons, no tapping, no real names; every mesh built from primitives.

## The Skydock — a waterfront VTOL air-taxi pad (live in the prototype, v1.55)

On the harbour waterfront (**20, -90**), framed by three glass towers, sits **The
Skydock**: a raised circular landing pad with a glowing target ring and edge lights.
Overhead, an original luxury eVTOL air-taxi — **the Kestrel** — runs a 17-second
cycle: it drops vertically from between the towers, its four ducted fans glowing
harder as it nears the ground, a **downwash ring blooms on the surface** with spray
rising, it settles light on the pad, holds, then lifts off again. Stand near the pad
to clock it — **+20**, once.

- **Where it fits:** joins the Skylanes (overhead traffic) and the Marina as the
  luxury-future transit layer — the island "runs on wings now."
- **Boundary:** the reference was an AI reel of a **branded flying car** (an AMG
  badge / "AMG's rule since 1967" caption) descending to a **real Miami** waterfront.
  The real **brand**, the real **place**, and the **creator** are all out (Rule Zero;
  place fictionalised to our harbour). Kept only the spectacle — a vertical-landing
  air-taxi and its downwash. Non-lethal, no weapons; the Kestrel is an original
  craft, every mesh built from primitives.

## The Sunline — power beamed from orbit (live in the prototype, v1.57)

West of the harbour near the Current Farm (**-330, 60**), an orbital collector — two
big solar wings and a down-facing emitter — pours a **column of light** onto a ground
**rectenna** (a tilted receiving array on a stand with a glowing hub). Charge rings
run down the widening beam, and a **civilian endurance glider** — long thin solar
wings, a slim pod, no turret and no weapons — circles the column, panels aglow, the
craft that never has to land. Stand by the rectenna to clock it — **+20**, once.

- **Where it fits:** extends the Current Farm's clean-energy doctrine ("the neon runs
  clean; nothing burns") from the ground to the sky — the island now draws power from
  orbit.
- **Boundary:** the reference set was a solar-powered **military ISR/surveillance
  drone** charged from space, with soldiers, tactical optics, real-nation framing and
  a real startup/product name. All of that is **out** (no real military; the island
  watches *with* you, never *at* you; Rule Zero). Kept only the clean-energy kernel —
  power beamed from orbit to a civilian receiver and a weaponless endurance glider.
  Non-lethal, no surveillance; every mesh built from primitives.

## The Sky Clinic — a flown-in mountain field hospital (live in the prototype, v1.62)

High in the range at (**-250, 300**, ~45u up) a landing shelf is cut into the
mountain, ringed with lights. On a 30-second cycle a **heavy tilt-rotor lifter**
carries a **modular clinic** down on four sling cables, sets it on the pad, **unhooks**,
and climbs away — the ward arrives where no road goes. The module has doors, lit
windows, and a medical mark. Dwell on the shelf to clock it — **+25**, once.

- **Where it fits:** joins Range Rescue and the Blue Range Dome as the high-range
  humanitarian cluster. Non-lethal by nature: this is a machine that delivers care.
- **Boundary:** the reference was captioned as a national **army** "drone miracle" and
  carried a **national flag** on the fuselage, with soldiers below — all excluded (no
  real military, no real flags, real nations are never military actors here). The
  aircraft is original and carries **no armament of any kind**.
- **The Red Cross emblem is deliberately NOT reproduced.** The red cross on white is a
  protected emblem under the Geneva Conventions and belongs to the ICRC; reproducing it
  on a fictional vehicle would be both a legal and an ethical error. The module instead
  wears an **original teal cross with a pulse line**, drawn procedurally — verified at
  the pixel level to contain **zero** red-cross pixels.
