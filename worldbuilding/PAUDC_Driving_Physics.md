# Driving Physics — Full Model Specification

> **FICTIONAL VIDEO GAME CONTENT.** The driving-physics module for the PAUDC/Jamaica
> island world. Arcade-forward with simulation-grade underpinnings — the GTA lineage:
> readable at 20 km/h, thrilling at 200. The v0.24 prototype ships the surface-grip
> core; the full model below is the engine-rung target.

## 0. One canon rule first: keep left

Jamaica drives on the **left**. All traffic AI, lane graphs, junction rules, and
oncoming-headlight drama are left-hand. (Live in the prototype: ring-road commuters
hold the left side of the carriageway.)

## 1. Core forces model

Per-vehicle rigid body with: engine force curve (torque falls past peak),
aerodynamic drag (v²), rolling resistance (surface-dependent), brake force split
front/rear, and handbrake as rear-grip cut (the drift lever). Integration at fixed
120 Hz physics tick, interpolated render.

## 2. Tire friction + surface interaction

**Friction-circle-lite:** longitudinal and lateral grip share one budget — braking
deep into a corner steals turning grip (understeer you can feel and learn).

| Surface | Grip | Notes |
|---|---|---|
| Asphalt (ring road, highways) | 1.15 | the fast line; live in v0.24 |
| Grass / scrub | 0.95 | baseline off-road |
| Sand (beach band) | 0.80 | slows and slides; live |
| Dirt / Cockpit tracks | 0.85 | loose, throttle-steerable |
| Wet asphalt | ×0.78 | the slickest thing on the island; live |
| Other surfaces in rain | ×0.90 | live |
| Water | hull model | amphibious canon: separate accel/vmax per ride; live since v0.1 |

**The Reef Runner — a dedicated speedboat, live in the prototype (v0.68).** Up to
now the only way onto the water was an amphibious *land* vehicle in hull mode; the
Reef Runner is the first purpose-built **boat** — moored on the shoreline, boarded
on foot with **E** like any ride. Its stats invert the land cars: high water
accel/top-speed, near-useless on tar (it's a boat). Up on plane it throws a
**twin wake spray** that scales with speed. An original craft — no real make,
model, or brand depicted.

**The Blue Serenity — a moored superyacht, live in the prototype (v0.68/69).** A
destination for the Reef Runner: cruise out to a big original superyacht anchored
offshore — multi-deck hull, a sundeck **pool** and loungers, a **helipad** with a
small chopper (rotor idling). Pull alongside on the water and hold a beat for a
one-time **+50** "five-star life, island style." No real yacht, brand, or person
depicted; it's an invented vessel and a reason to take the boat somewhere.

## 3. Weather-based modifiers

- **Rain/storm (SC ladder):** grip multipliers above, longer braking, headlight
  glare on wet roads (render), aquaplane risk above 80 km/h in standing water.
- **Heat (midday):** minor tire-pressure grip dip on asphalt — a flavor knob, ±3%.
- **Hurricane events:** crosswind force vector on high-profile vehicles; debris as
  physics obstacles. (Engine rung.)

## 4. Suspension + weight distribution

Per-axle spring/damper with anti-roll; weight transfer under braking (nose dive =
more front grip), acceleration (squat), and cornering (roll). Vehicle personality
lives here: the Mudfish is soft/long-travel (forgiving off-road, wallowy on tar),
the Marlin GX stiff and planted, the Nighthawk lean-based (counter-steer model,
low-side if you chop throttle mid-lean).

## 5. Damage specification (non-lethal rule applies)

Cosmetic stages (scuffs → panels → smoke) plus performance effects only: bent
steering (constant yaw bias), cooling damage (power fade), wheel damage (grip loss
one corner). **No fuel-fire death spiral** — a dead vehicle limps at 20% power to a
repair shop. Repairs cost credits; the BII ledgers reckless totaling as an
infraction ("Creative Depreciation").

## 6. AI driving integration

Traffic, route taxis, and the BII interceptor run the **same surface-grip model**
with a skill scalar (0.6 commuters, 0.85 taxis, 1.0 interceptor): AI cars genuinely
slow in rain, slide on sand, and lose the player where grip logic says they should
— the escape valve is physics, not scripting. (Prototype: interceptor land/water
speed split is this rule's first slice.)

**Flag a Ride — live in the prototype (v0.46).** The genre-standard "commandeer
a passing car" beat, played courtesy-first: on foot, press **J** near a moving
traffic car and it's yours — no violence depicted, just a flagged-down swap
("no hard feelings," per the toast). The commuter steps out of the loop
permanently and joins your garage as a real, ownable ride with its own
mid-tier stats (a regular street car: no amphibious hull, moderate accel/top
speed); the ambient traffic pool thins by exactly one car per flag-down, same
economy of scarcity as everything else the island tracks.

## 7. Region-specific behavior (one island, many roads)

- **Kingston urban:** stop-go grids, junction discipline, taxi assertiveness high.
- **North-coast highway:** high-speed cruise, overtaking on straights.
- **Blue Mountain switchbacks:** engine-braking matters; brake fade on long
  descents (temperature model); mist reduces AI speed.
- **Cockpit/rural:** loose surfaces, single-track courtesy stops, goats have
  right of way (wildlife module).
- **PAUDC base:** speed-governed zones, ledger enforcement.

> All fictional; tuned for fun first, plausibility second, in the open-world
> arcade tradition.


## Wave Dart + the Raft-Up (live in the prototype, v0.97)

**The Wave Dart** — an original teal-and-gold personal watercraft moored by the
Bali shallows: board with **E** like any ride. Fastest hull on the bay (out-runs
the Reef Runner on water), and genuinely hopeless on land — beach it and walk.

**The Raft-Up** — four boats anchored gunwale-to-gunwale off the shallows, party
on every deck: crowds bouncing, festoon lights glowing, hulls bobbing out of
phase. Idle nearby (Wave Dart recommended) for a one-time **+25** — *"mind di
wake, captain."*

- **Origin:** a GTA 6 fan clip (jet ski through a boat-party flotilla at sunset).
  Per Rule Zero nothing of that game is depicted — original watercraft, original
  raft-up, the island's own skyline; only the *activity* was kept, made original
  as asked.


## Osprey LMX — endurance prototype (live in the prototype, v1.05)

Parked on the Vellum promenade where the yachts can admire it: an **original
endurance-prototype hypercar** — low white tub, wraparound dark canopy, shark
fin, twin-pylon rear wing, teal chevron over a gold pinstripe (the island
colorway, no works livery). Board with **E** like any ride. **The fastest thing
on tar in the game** (tops the Marlin GX), and proudly allergic to water — beach
it and you're swimming home.

- **Origin:** an AI reel of a real marque's Le Mans hypercar posed on a marina
  dock. The brand, grille signature, and works livery are **not** depicted (no
  real makes, per the rules); only the endurance-prototype silhouette-as-idea
  was kept, rebuilt original in island colors.


## Skyline Mode — hover kits & holo windshields (live, v1.13)

The fleet's leapfrog feature: the Don's workshop has retrofitted the island's
cars with **hover kits**. Press **B** in any car (not the bike, boat, or jet
ski — they have their own souls) and the ride **lifts off**: four teal hover
pads glowing underneath, cruising at altitude over terrain and **straight
across open water, bone dry**, wheels down anywhere with another tap of B.
While airborne a **holographic windshield** floats ahead of the glass — a
translucent teal readout panel with ticker lines, the hover kit's HUD. First
lift-off pays **+30**: *"the road was a suggestion."* Kit state ends when you
step out; the unlock is saved.

- **Origin:** a GTA 6 sports-car roster infographic. Per Rule Zero none of
  Rockstar's fictional brands, names, or designs are used — the island's fleet
  was already fully original — so the request's second half became the feature:
  capabilities that roster doesn't have. Invented tech, no real or third-party
  brands, non-lethal as ever.


## The Flying Fish — hydrofoil hypercar (live in the prototype, v1.20)

The island's answer to "what if the bay were a road": an original **hydrofoil
hypercar** parked on the Harbor Watch waterfront. Low wedge shell with a gold
spine stripe, vertical light blades at the nose, ember bars aft — and under the
tub, twin carbon struts carrying reef-green **foil blades**. Board it with E
like any ride. On tar it's a proper hypercar; drive it straight off the
seawall and it **rides the foils** — near-full speed on open water (wacc 34 /
wmax 36 where ordinary cars crawl at 2), twin spray jets fanning off the
foils that scale with your speed. Skim 60 metres and the island pays **+25 —
"the bay turned highway"** (saved, with your lifetime skim distance).

- **Boundary:** the source reel showed a real manufacturer's concept car
  skimming a marina. The make, badge, and design language are **not** depicted
  (Rule Zero — no real brands); the Flying Fish is an original shape named for
  the island fish that actually flies. It also plays nice with the existing
  splashdown-clip bonus — hit the water fast and OnWatch buys the clip.
