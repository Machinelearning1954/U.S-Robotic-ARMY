# Transit System — Ferries, Route Taxis, Buses & Boats

> **FICTIONAL VIDEO GAME CONTENT.** The transit module for the PAUDC/Jamaica island
> world. Design rule: transit is *content*, not a loading screen — every mode is a
> physical vehicle in the world, interruptible, and full of NPC life. Fast travel
> exists, but you watch the island go by.

## The modes

| Mode | Coverage | Character |
|---|---|---|
| **Route taxis** | everywhere; the backbone | shared cars on fixed corridors, "small up yuhself" capacity rules, drivers with opinions; hail from any stand or roadside |
| **Country buses** | parish trunk roads | slow, cheap, scenic; roof cargo; the social deck — NPC conversations run long here |
| **The Harbour Hopper ferry** | coastal moorings | *(live in the prototype, v0.25)* loops the bay buoys on a fixed schedule; free deck passage; the storm-condition ladder cancels sailings at SC-2 |
| **Coasters/knutes (small boats)** | fishing beaches ↔ reef | rentable; the Reef School's fleet; hurricane-season haul-out behavior |
| **JUTC-class metro buses** *(fictional operator)* | Kingston core | dense urban headways, bus lanes, pickpocket mission surface |
| **The Coastal Line** | three inland stations, elevated viaduct | *(live in the prototype, v0.38)* a commuter train on its own concrete-pillar track, free deck passage, dwells at each station before departing |
| **Domestic air** | two airports (fictional operators) | scheduled hops MoBay ↔ Kingston; the flyover as fast travel with a view |
| **PAUDC shuttle** | base ring (canon) | rank-gated stops, the commute where campaign gossip happens |

## How fast travel works

- **Stands are physical:** walk to a yellow taxi sign, wait a beat, and the ride
  happens (prototype: hold 2 s on foot → carried to the next stand on the route).
- **Time passes, world persists:** transit advances the clock; weather can reroute
  or cancel (ferries first — canon storm logic).
- **Interruptible:** any leg can become a mission (roadblock, a passenger's story,
  a Weathermen tail). Transit seeds encounters instead of skipping them.
- **Costs:** street-cash fares by distance; free base shuttle; ferry free by
  harbourmaster decree (a running canon joke — nobody remembers why).

## NPC integration

Vehicles run the traffic physics (driving-physics doc §6) and the left-hand rule;
drivers are NPC-culture characters with routine tables; passengers board/alight at
stands on schedule — the transit network is the NPC economy's circulatory system
(economy doc §5: the vans *are* the supply chain).

## Prototype status (v0.25)

- **Harbour Hopper:** a crewed ferry looping the three bay moorings (the sonar-buoy
  line), dwelling at each; board on foot with `E` while docked, ride the deck (the
  boat genuinely carries you), step off with `E` — swim ashore if you disembark
  early, captain's amusement implied.
- **Route-taxi stands** at Palm Line, The Strip, and Silver Springs: hold on foot
  at the sign and you're run to the next stand on the loop.
- **The Coastal Line (v0.38):** three elevated stations — Palm Line Halt, Crucible
  Junction, Ear Terminus — linked by a viaduct on concrete pillars. Board on foot
  with `E` while a train is docked, ride it the same way as the Harbour Hopper
  (the game hides the rider model for this one rather than clipping it through
  the elevated floor — a rendering choice, not a design one), step off with `E`
  at any station.
- **Harbor Drop (v0.49):** the Plantin Airways Island Hop gains an exit row.
  Mid-flight, press **P** to bail out under an orange canopy — steer with
  A/D on the descent and aim for **The Drop Ring**, a neon target laid out
  by the airfield. Center it and the first bullseye pays +40 clout;
  after that it's bragging rights and clean landings. Miss and the toast
  tells you by how many metres. A pure spectacle-traversal beat in the
  open-world skydiving tradition — invented airline, invented ring, and
  the non-lethal floor holds: there is no fall damage, only paperwork-free
  touchdowns.
- Engine rung adds: schedules on the world clock, fares, bus lines, boat rental,
  and the airport hop.

> All fictional. Operators, schedules, and vehicles are invented; the texture is
> the island's real transit culture rendered with affection.


## Green Cross Air Ambulance — VTOL medevac (live in the prototype, v0.76)

A flying ambulance parked at the **Green Cross** medical bay: an original **VTOL
medevac** in the island's black-green-and-gold flag livery (the gold-saltire motif),
a green medical cross on the hull, twin tilt-rotor nacelles that idle on the pad.
Walk up on foot for a one-time **+25** ("fueled and flight-ready, medevac on
standby"). Purely **humanitarian and non-lethal** — no weapons, no armament; it's
a rescue aircraft, consistent with the game's non-lethal floor. Original craft, no
real aircraft or operator depicted; the flag motif is the same island colorway the
Don wears.


## Green Cross Ground Ambulance — drivable rescue van (live in the prototype, v0.77)

The road counterpart to the air medevac: a **boardable ground ambulance** parked at
the Green Cross bay. Original van in the island flag colorway (green band, gold
stripe), green medical crosses on both flanks, a red/blue light bar. Board it on
foot with **E** like any ride; mid-tier road stats, no water hull (it's a van).
**Weaponless and humanitarian** — a rescue vehicle, consistent with the game's
non-lethal floor. Original craft; no real ambulance, operator, or livery depicted
beyond the island's own colorway.


## Sky Rigger — seal a hull panel mid-flight (live in the prototype, v0.81)

A daredevil stunt bolted onto the **Plantin Airways Island Hop** (the fictional
flag-carrier, transit doc above). Board the Hop at the airfield, and once it's
airborne press **X** to climb out onto the fuselage and **seal a loose hull panel
against the slipstream** — the Don's robotics-vet party trick (`PAUDC_Character_Bible.md`
§2.0). The wind constantly tries to peel your grip away; **tap X** to brace and keep
your hold while a repair meter fills over a few seconds. Seal it and you bank clout
(**+35 first time — SKY RIGGER unlocked**, +20 after, plus a Chromelab Grade bonus).

- **Emphatically non-lethal — there is no fall damage.** If your grip runs out you're
  simply **hauled back into the cabin, no harm done**, and can try the brace again;
  the flight continues either way. It sits inside the same non-lethal floor as the
  Harbor Drop (no death states, ever).
- **Origin:** built from an AI-generated reel captioned *"is he really fixing a jet
  mid-flight?"* The clip depicted a **real military aircraft**, which the game's rules
  don't allow (no real aircraft, no weapons) — so only the *idea* was kept, the
  wing-walk repair stunt, and rebuilt on PAUDC's **own fictional airliner**. No real
  aircraft, operator, weapon, or procedure is depicted; it's pure island spectacle.
- It shares the Island Hop with the **Harbor Drop** (press **P** to bail out under a
  canopy instead) — two very different ways to leave, or work on, the same plane.


## The Sea Puss — Reef School research submersible (live in the prototype, v0.84)

The Reef School's own **unarmed research submersible**, moored at a green buoy in
the southern bay: board it on foot with **E** like the ferry, and it runs a
**periscope-depth dive tour** over the bay's wreck field — hull awash, conning
tower and wooden observation deck above the chop, glowing viewports, a gentle
porpoise bob. As it passes over each sunken site the **sonar calls the wreck
shadow below** ("logged for the dive board" — the same wrecks you can free-dive).
First ride pays **+25**; step off with **E** at any station ("mind the swim").

- **Science boat, not a warship.** No weapons, no torpedoes, no combat systems —
  a research vessel in Reef School green, consistent with the non-lethal floor.
- **Boundary:** the source reel advertised "the world's deadliest submarine" with
  military spec callouts. The deadly half is **not** depicted — no real submarine,
  class, weapons system, or specification. Only the wonder of *riding a submarine*
  was kept, rebuilt as the island's own little science sub.
