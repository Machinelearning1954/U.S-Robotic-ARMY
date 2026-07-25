# Jamaica NPC Culture & Behavior System

> **FICTIONAL VIDEO GAME CONTENT.** The island-wide NPC design for the PAUDC
> universe (`JAMAICA_ISLAND_WORLD.md`). Ground rules, stated up front: grounded and
> **respectful** — everyday Jamaican life rendered with warmth, not caricature; Patois
> written naturally and legibly; no real people; underground archetypes handled the
> way the rest of this package handles crime (consequences and satire, never
> glorification, per the BII ledger and Gains Trade precedents); and **no real gang,
> police unit, or agency is named or depicted — all fictional** (the BII and invented
> factions carry that weight).

## 1. Archetypes by region

| Region | Daily cast | Distinct figures |
|---|---|---|
| **Kingston urban** | shopkeepers, street vendors, route-taxi and bus drivers, office workers, students, dock workers, mechanics | selector (sound system), studio musicians, ital cook, domino kings |
| **Rural parishes** | farmers (cane/banana/coffee), market sellers, craftspeople, elders on verandas, schoolchildren in uniform | rafters, drum makers, bee keepers, revival church congregations |
| **Resort coast** | hotel staff, tour guides, bar staff, entertainers, lifeguards, boat operators | dive masters, wedding planners, hair braiders, jet-ski touts |
| **Fishing villages** | fishermen, net menders, fish scalers, ice-truck drivers | the beach elder who names the weather before the radio does |
| **Mountains** | coffee estate workers, trail guides, radio-tower techs | the Maroon-heritage storyteller (treated with historical respect) |
| **Underground** *(fictional factions only)* | Barometer Syndicate cells, fixers, fence operators, a corrupt permit clerk | never ambient set-dressing — each is a mission-significant character with consequences attached |

## 2. Behavior layers

### 2.1 Daily routines (the clock drives the world — v0.22's cycle island-wide)
- **05:00–08:00** fishermen out before light; market stalls build; school streams form.
- **08:00–16:00** work loops (fields, docks, offices, shops); midday heat lull —
  shade-seeking, cold-jelly vendors peak.
- **16:00–20:00** market wind-down, beach hour, domino tables fill, cookshops smoke.
- **20:00–02:00** nightlife by region: Kingston lawns and clubs, resort strips,
  rural quiet except Friday/Saturday sound systems.
- **Sunday:** church morning (best clothes, slow roads), family cook, beach afternoon.
- Regional phase offsets: Kingston runs late, the country runs early, resorts run on
  tourist time.

### 2.2 Social interaction sets
- Greetings and small talk; bargaining at stalls (a real minigame hook — the
  Butcher's dynamic pricing generalizes); joke-and-story clusters; impromptu
  football; domino slams that draw crowds; dance circles when a sound system runs.
- Group formations: corner links, bar clusters, veranda courts, beach cricket.

### 2.3 Environmental reactions
- **Rain:** vendors sheet their stalls in seconds; taxis fill; verandas crowd.
- **Storm warning (SC ladder):** boarding-up behavior, fishing fleet hauls out,
  supermarkets surge, radios come out — the whole island performs the forecast.
- **Heat:** shade migration, sea baths, patience shortens at noon.
- **Sirens/gunshots (fictional-faction events):** civilians clear honestly — no
  bystander gawking loops; children are pulled indoors first.
- **Festivals:** streets close, food lines triple, everyone's reputation checks soften.
- **Fast traffic close by:** pedestrians hustle clear of a vehicle passing near them
  at speed, then settle back to a stroll — **live in the prototype (v0.34)**: ambient
  foot traffic loops the sidewalks island-wide and scatters on proximity, no
  bystander-gawking loop, matching the "sirens/gunshots" rule above.

### 2.4 Player-reaction model (reputation-driven)
Four ambient stances — **friendly / curious / wary / hostile** — selected by:
`stance = f(region norms, time of day, player Watch Level, OnWatch fame tier, local
reputation tag)`. Reputation tags earned by deeds: **Protector** (helped in a storm,
fed people — NPCs greet first, discounts, tips), **Troublemaker** (BII stars, wrecked
stalls — prices up, kids called in), **Outsider** (new region default — polite
distance until a favor lands), **Local** (the earned end-state — nicknames, shortcuts
shared, missions offered).

## 3. Language & voice

Patois rendered naturally, mixed with standard English by speaker and setting —
legible to non-speakers, never mocked. Example lines (fictional speakers):

- **Greeting:** "Wah gwaan, boss? Long time mi nuh see yuh 'bout."
- **Market bargaining:** "Two hundred fi dat? Mi wi gi yuh one-fifty an' wi done." /
  "Yuh a rob mi, but gwaan — tek it."
- **Route taxi:** "Small up yuhself! One more can hol'." / "Driva, easy nuh — road wet."
- **Bar/party:** "Selector a mash up di place tonight!" / "One more round, den mi gone."
- **Rural veranda:** "Rain a come — mi knee tell mi before di radio."
- **Storm prep:** "Batten dung good, yuh hear? Dis one nuh play."
- Voice direction: warmth default; humor is quick and dry; elders speak slower and
  get the best lines (Auntie Blades set the standard — see the Character Bible's
  dialogue voice guide, which this extends).

## 4. AI structure (behavior trees per class)

Shared skeleton: `Idle ↔ Work ↔ Social` core loop, interrupted by
`React(event) → {Observe | Assist | Flee | Hide | Defend}` and resumed with memory.

- **Urban:** dense schedule graph, commute nodes, high social-interrupt rate;
  flee = indoors/vehicle; assist = crowd-forms-around-incident.
- **Rural:** long work states, veranda social anchor, weather-interrupt priority;
  flee = homestead; strong memory (rural NPCs remember the player longest).
- **Tourism:** shift-based work states, scripted-hospitality social layer that
  drops when the player is a known Troublemaker; evacuation drills on SC-2+.
- **Underground (fictional factions):** patrol/lookout states, suspicion meter
  instead of open hostility, `Fight` only inside mission logic — ambient crime
  spectacle is not simulated (tone rule).
- **Event reactions** (festival, police-raid *(fictional BII operations)*, storm
  landfall): global blackboard broadcasts; each class has a scripted response set,
  so the island reacts as one organism.
- Engine mapping: Godot behavior trees / UE5 StateTree; the prototype's stalker,
  brawler, and traffic loops are the first three nodes of this system already live.

## 5. Culture & event calendar

- **Music:** reggae/dancehall as ambient radio + physical sound systems (lawns with
  real crowd AI); live bands at resorts; church choirs Sunday morning.
- **Food:** jerk stands (smoke visible from the road — a navigation landmark),
  cookshops, patty shops, market produce — plugs into Fort Flavor's economy.
- **Calendar:** weekday/weekend rhythms; **festival days** (independence-season
  street parades, seasonal Regatta Royale, Friday Fireside → YARDCLASH night);
  **storm season** overriding everything (SC ladder). Every event shifts routines,
  dialogue pools, prices, and mission availability.

## 6. Mission-design hooks

- **Who gives missions:** vendors (supply runs), fishermen (reef escorts), selectors
  (sound-system logistics), elders (find-someone stories), hotel managers
  (discreet-problem arcs), the fictional BII (ledger workoffs), PAUDC canon cast.
- **Who reacts:** reputation tags gate greetings, prices, tips, and whether crowds
  shelter or expose the player during chases.
- **Who changes over time:** named recurring NPCs per district (the domino king, the
  net mender, the patty-shop owner) track player history across acts — the island's
  memory is the long-game reward.

> All fictional. Cultural texture is reference-based and respectful; factions,
> police, and every named character are invented.


## Ambient NPC weather reaction (live in the prototype, v0.75)

A small "smarter, more realistic NPCs" beat: when a **storm** rolls in (press `R`),
ambient pedestrians **pick up the pace and hurry for cover** (~1.9x their stroll
speed), settling back to a relaxed walk once the skies clear. It layers on top of
the existing reactive behaviors (scatter from a fast passing vehicle, the BII
"unsolicited attention" report if the player tails someone too long) so street
life reads as reacting to the world, not just looping a path. Fully original
ambient behavior; no real person depicted.

## The Big Yard — First Sunday (family homestead, live in the prototype, v1.52)

The warmest place on the island, and the deliberate opposite of the Static Hour's
cold booth. On flat ground north of the harbour (**90, 140**) sits a three-
generation family compound where **Sunday dinner never ends**:

- **Who's there:** **Granny at the pot** (the white-clad elder tending the fire),
  **elders rocking on the veranda**, a full set of **aunties, uncles and parents**
  standing round the table and the stove, four adults deep in a **dominoes** game on
  the green table, and a **yard full of pickney and cousins** — five kids running
  little loops after a red ball. Warm string lights, a speaker drifting music notes,
  a table piled with dishes (rice & peas, curry, plantain, callaloo, festival,
  sorrel).
- **What it does:** walk in on foot and the family **welcomes and claims you** — you
  eat and you're made **IRIE** (calm hands: the wanted meter cools twice as fast) and
  **WELL FED** (the small speed boost). First visit **+30**; after that every visit
  re-greets you in patois and keeps you irie. This is the game's thesis made a
  landmark: *family warmth is your strength.* It's also the antidote pole to the
  psych-thriller — the Static Hour's grip is what the Yard exists to break.
- **Boundary:** entirely warm and non-lethal; a celebration of big family-oriented
  Jamaican life. All figures are generic original NPCs (no real person depicted),
  every mesh built from primitives, patois lines written original for the world.
