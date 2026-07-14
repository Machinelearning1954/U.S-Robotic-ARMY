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
