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

## Maas Jack — the Jack of All Trades (roadside NPC, live in the prototype, v1.53)

By the harbour town (**-40, 60**) stands **Maas Jack's** trade-stall — a counter
under a zinc awning with a backboard hung with the tools of a dozen trades: wrench,
comb, paintbrush, fishing rod, guitar, hammer, cook-pot. Maas Jack ("Maas" is the
Jamaican honorific) works behind it in his yellow hat, tool-arm bobbing, a spinning
"trade of the day" sign over the awning.

- **What it does:** pass by on foot and he claims every job on the island — one man,
  every trade. First meet **+25**; after that he calls out his services in patois on
  a loop ("Engine a gi' yuh trouble? Maas Jack fix it." / "Whatever yuh need, me is
  di Jack of all trades."). A warm bit of island street life and a nod to the
  everyman hustler.
- **Boundary:** the reference was a social "Jack of All Trades" handle; the embed
  carried only a profile name, no viewable frame, so nothing was copied and **no
  real person is depicted** — Maas Jack is an original character built from the
  generic idiom alone. All meshes from primitives; patois written original.

### Maas Jack — Trade Trials (interactive progression, v1.54)

Maas Jack is no longer just flavour: hang around his stall on foot and **he puts you
to work**, apprenticing you through one trade per session — **mechanic, barber,
carpenter, fisherman, sound-man** (+8 each, tracked as `tradesLearned` n/5). Learn
all five and you become the **MASTER OF ALL TRADES** (+40) — his spinning sign turns
gold to mark it. First meet still greets you (+25). The whole loop persists in the
save. It's the interactive payoff of the "Jack of All Trades" idea: not watching one
man do everything, but *becoming* him. Still an original character built from the
generic idiom only — no real person depicted.

## The Teppan — an island hibachi flat-top grill (live in the prototype, v1.56)

By the harbour town (**60, 80**) a chef works a big steel flat-top: shrimp, steak,
cracked egg, broccoli, onion rings, pepper, carrot and a noodle pile all sizzling at
once, steam pouring up, stools along the diner side, and every few seconds the
**onion-volcano flares** in orange flame. Walk up and the chef **plates you hot** —
you leave **WELL FED** (speed boost) and **IRIE** (calm hands). First serve **+25**;
after that it's "Order up! Eat while it hot, star." on a loop.

- **Where it fits:** joins the island's food-and-family warmth (the Big Yard's pot,
  Fort Flavor) as another place the world feeds you.
- **Boundary:** from a hibachi/teppanyaki cook clip; the real restaurant name on the
  plate is **out** (no real brand). Kept only the joy of the cook — an original
  island teppan counter, all ingredients and flames built from primitives, patois
  written original; no real person depicted. Non-lethal.

## Pedestrians get a skeleton (live in the prototype, v1.65)

Until now every pedestrian was **three static boxes** — one solid block for both legs — so
people *slid* around the island like chess pieces. Nothing reads as "fake" faster than a
human gliding with stiff legs, and it was the biggest remaining believability gap.

Each pedestrian is now **jointed**: hip → thigh → knee → shin → foot, and shoulder →
upper arm → elbow → forearm, plus a torso and a **neck that turns**. Pivot *groups* carry
the rotations with meshes hanging off them, so turning a joint swings everything below it,
exactly like a skeleton.

- **The cycle is driven by measured movement,** not by the AI's intended speed — each ped's
  actual distance covered per frame sets the stride, so legs always match the ground. No
  skating, no walking on the spot. Stride length and arm swing scale with speed.
- **Biomechanically checked, not eyeballed:** the tests assert legs swing in **opposition**
  (never both forward), knees **never hyperextend** forward, and arms **counter-swing**
  against the legs.
- **Idle is a separate state** — weight shifts, arms hang, a slow breath — so a stopped
  pedestrian doesn't freeze mid-stride.
- **They look at you.** Inside 9 units heads turn toward the player, then ease back. The
  cheapest trick there is for making a crowd feel aware of you.
- **Cost is bounded:** plain Euler rotations on pivot groups (no skinning, no bone
  matrices, **no assets**), the phase only advances for peds that are moving, and anything
  beyond 90 units stops animating entirely.

**Why this rather than AI-generated people:** image-to-3D produces an **unrigged** mesh with
no skeleton, so photoreal figures would slide around frozen — *worse* than stylised figures
that move correctly. It would also have reintroduced external binary assets (the very thing
fixed in v1.63) and unresolved likeness provenance for a game intended for sale. Motion,
not resolution, is what makes people read as people.

## v2.02 — STREET TALK: the island finds its voice

**Source & boundary:** the request was to integrate a Hugging Face large language model
(GLM-5.3-Flash) to "make the game better / optimise it." Declined as an integration: an LLM is
multi-gigabyte weights needing server or heavy-download inference, so shipping one inside the
single self-contained file would break the ZERO-external-requests guarantee that makes the game
sellable — and a text model cannot optimise a renderer regardless. What an LLM genuinely does is
*write*, so that capability was used the only way that fits: the dialogue was generated at
authoring time and **baked in as static data** — no download, no server, no runtime dependency,
self-containment fully intact.

**What it adds:** the island was visually alive but silent. Now, on foot, people you pass float
an overheard line in a speech bubble over their head — projected to screen from the speaker's
world position. Lines are original, patois-flavoured (consistent with the established NPC voice),
warm and communal, and the pool is composed to fit context: a generic bank, plus the current
time slice (morning/day/evening/night), plus rain lines when it's wet, plus district-specific
colour (weighted) for the ten zones. Overheard, not shouted — it only triggers between ~2 and
14 m, never for someone right on top of you, and never in photo mode. First overheard line +5.

**Doctrine:** every line is warm or practical — never a threat, never a real person or brand.
Consistent with the surveillance/community doctrine: the island talks WITH you.

Verification: dialogue bank populated (60+ lines), a line surfaces over a nearby neighbour on
foot. Sweep 47/47, zero page errors, zero external requests.
