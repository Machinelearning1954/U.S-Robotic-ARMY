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
- Engine rung adds: schedules on the world clock, fares, bus lines, boat rental,
  and the airport hop.

> All fictional. Operators, schedules, and vehicles are invented; the texture is
> the island's real transit culture rendered with affection.
