# PAUDC Game Systems — Progression, Economy & Live World

> **FICTIONAL VIDEO GAME CONTENT.** This document describes invented gameplay
> systems for an open-world action game set at the fictional Port Antonio Unified
> Defense Complex (PAUDC). Nothing here depicts real military organizations, systems,
> procedures, or facilities. All ranks, technologies, vehicles, currencies, and events
> below are pure fiction created for entertainment. Companion doc to
> `PAUDC_Base_Design.md` — that file is canon; this file expands it.

---

## 1. Rank & Progression System

The base opens **ring by ring** as you rank up. Rank is the master key: it gates
physical zone access, vehicle tiers, quarters, and mission strata. Rank never
decays — Standing (Section 6) is the meter that punishes bad behavior, not rank.

### 1.1 XP Sources

| Source | XP Flavor | Notes |
|---|---|---|
| Crucible trials (obstacle, marksmanship-minigame, squad wargames) | Grind XP | Repeatable, diminishing daily returns |
| Faction missions (story + department contracts) | Mission XP | Biggest single chunks |
| Skyfence defense events | Event XP | Scales with waves survived |
| OnWatch viral clips | Clout XP | Converts at 10:1 — fame is a slow burn |
| YARDCLASH wins | Combatives XP | Doubled on Friday nights |
| Regatta Royale / seasonal events | Festival XP | Time-limited multipliers |
| Mentoring a lower-rank player through a trial | Squad XP | Both players earn; anti-boost capped |

### 1.2 The Rank Ladder

The four canonical stages (Outsider → Recruit → Operator → Commander) expand into
nine playable grades:

| Grade | Title | Ring Access | Unlocks |
|---|---|---|---|
| 0 | **Outsider** | None — checkpoint gates, public beach, leaderboard billboard | Can spectate YARDCLASH from the fence; can apply at the Recruitment Pavilion |
| 1 | **Candidate** | Crucible (Zone 6) day access only | Machete Course trials, loaner PT uniform, bus pass to the gate |
| 2 | **Recruit** | Palm Line (Zone 7) + Crucible | Barracks bunk (shared), beat-up patrol jeep, Lagoon Club entry, canteen credit account opened |
| 3 | **Specialist** | Chosen specialization zone (Ironbeach / Strip / Crucible depth / The Ear) | First spec-tree node, department contact missions, jet-ski or scout-drone loaner |
| 4 | **Operator** | All outer zones, escorted Vault lobby | Tier-2 vehicles, private barracks room in the glass tower, squad leadership in wargames |
| 5 | **Senior Operator** | Skyfence (Zone 2) consoles, Maroon Thunder well deck | Tier-3 vehicles, Skyfence event hosting, customizable quarters (ocean view) |
| 6 | **Warrant** | The Ear full campus, cable car priority | KINGFISHER intel subscriptions, Hummingbird permanent issue, cross-spec second tree at half rate |
| 7 | **Vault Officer** | Vault interior (Zone 1), Cathedral floor | Tier-4 vehicles, ORACLE Table mission-select access, story command missions |
| 8 | **Commander** | Everywhere, blast doors open on approach | Personal Vault office (visually upgrades with reputation), callsign painted on an SV-77 Duppy, HARDSHELL suit requisition, can launch base-defense events for other players |

### 1.3 What Rank Physically Changes

- **Doors and gates literally open.** Ring gates scan you and grind aside; guards
  salute at Operator+, and MP patrols wave your vehicle through instead of stopping it.
- **Quarters upgrade path:** shared bunk → private room → ocean-view suite → Vault
  office. Each is a customizable interior and a fast-travel anchor.
- **Vehicle tiers map one-to-one to grade bands** (canon: 40+ faction garage):
  Tier 1 jeeps/jet-skis (Recruit), Tier 2 patrol boats/light rotorcraft (Operator),
  Tier 3 corvette helm shifts/SV-77 co-pilot (Senior), Tier 4 Duppy pilot-in-command,
  Big Auntie, HARDSHELL (Vault Officer/Commander).
- **Mission strata:** contracts (Recruit) → department chains (Specialist) → story
  operations (Operator+) → command-your-own-events (Commander).

---

## 2. Specialization Trees

At Specialist grade you pick one of four trees at the Recruitment Pavilion. Warrant
grade unlocks a second tree at half XP rate. Each tree is 8 nodes; nodes 1–4 are
linear, 5–8 branch by playstyle. All tech is deliberately sci-fi.

### 2.1 Reef Sharks — Sea (9th Littoral Squadron, Ironbeach)

1. **Wet Entry** — Jet-ski and rigid raider handling bonus; boats spawn at any pier.
2. **Salvage Rat** — Extended dive lungs; wreck-dive loot tables improve.
3. **Wake Discipline** — Boat damage resistance in storm swell; no wipeouts on wakes.
4. **Interdictor** — Smuggler-chase missions unlock; grappling-line boarding of moving boats.
5. **Reef Ghost** — Duppy Cloak retrofit for small craft: 8-second shimmer stealth on water.
6. **Corvette Ticket** — Helm the stealth patrol corvette in squad missions.
7. **Storm Pilot** — Sea vehicles usable up to SC-2; rescue-swimmer side missions open.
8. **Well Deck Boss** — Drive anything straight into the Maroon Thunder at speed; carrier-launched mission starts.

### 2.2 Duppy Riders — Air (88th Aerospace Wing, The Strip)

1. **First Solo** — Hummingbird scout drone permanent issue; first-person FPV racing.
2. **Gorge Runner** — Aerobatics trial course unlocked; low-altitude XP multiplier.
3. **Crew Chief** — Ride-along gunner seat in the SV-77; Big Auntie cargo-bay squad drops.
4. **Tilt Rating** — SV-77 Duppy co-pilot certification; VTOL hover assists.
5. **Ghost Wing** — Duppy Cloak airborne: brief shimmer-stealth on approach runs.
6. **Night Strip** — Runway lights sync to your approach; night airdrop missions open.
7. **Storm Ferry** — Fly the dramatic SC-3 mass-evacuation launches; storm-window landings.
8. **Pilot in Command** — Full SV-77 solo authority; your callsign stenciled on the fuselage.

### 2.3 The Crucible — Ground Combat (1st Special Candidate School)

1. **Machete Grad** — Sprint-vault-crawl movement suite; obstacle-course gold times count double.
2. **Yard Hands** — YARDCLASH grapple layer unlocked outside the Yard (takedowns in missions).
3. **Mock-Town Rat** — Urban wargame maps open; door-breach minigame.
4. **Night Nav** — The haunted colonial-ruins course; low-light vision tuning, fear events don't shake aim.
5. **Pressure Made** — Pressure Dome weather-arena training: zero accuracy loss in rain.
6. **Squad Voice** — Command NPC fireteams in wargames and defense events.
7. **Blades' Favorite** — Auntie Blades duet takedowns; her one-liners buff nearby squad morale (real stat).
8. **HARDSHELL Candidate** — Early exo-rig trial access; loud, chunky, glorious.

### 2.4 DFS — Signals (Directorate of Far Signals, The Ear)

1. **Ear Trainee** — Signal-triangulation minigame; pirate-radio collectibles ping on minimap.
2. **Dome Pass** — KINGFISHER Array basic feed: enemy convoy routes visible 60s ahead.
3. **Decoder Ring** — Encrypted-broadcast puzzles; Numbers Station story thread opens.
4. **Drone Whisperer** — Hijack rival Stormjack drones mid-flight for 10 seconds.
5. **Cold Listener** — Watch Level rises 25% slower for you and your squad on infiltrations.
6. **Static Choir** — Deployable jammer bubble: blinds cameras and NPC radios inside it.
7. **Weather Eye** — Storm Condition changes telegraphed to you 10 minutes early; storm-loot forecasts.
8. **Kingfisher Clearance** — Full ORACLE-fed world intel layer; the masked champion's questline concludes here.

---

## 3. Economy — Canteen Credits vs. World Cash

Two currencies, deliberately firewalled:

- **World cash ($)** — the open-world economy: civilian shops, cars, safehouses,
  everything off-base. Earned everywhere. Spends everywhere *except* faction gear.
- **Canteen credits (₡)** — the base's internal scrip. Earned only through faction
  activity: mission payouts, trial medals, YARDCLASH purses, Skyfence event bonuses,
  selling salvage to the Mudfish. Spends only on base.

**No exchange window.** You cannot buy credits with cash — faction gear must be
*earned*, which keeps the recruitment fantasy honest. (The gray market disagrees;
see 3.3.)

### 3.1 Earn Loops

| Loop | Currency | Cadence |
|---|---|---|
| Department contracts | ₡ + XP | Daily rotation, 3 per department |
| Crucible trial medals | ₡ | Repeatable; first-gold bonuses weekly |
| YARDCLASH ladder & side bets | ₡ | Friday nights pay double |
| Salvage dives → Mudfish buyback | ₡ | Storm surges reseed wreck loot |
| Off-base story/heist content | $ | Core open-world loop |
| OnWatch sponsorships (high clout) | $ | Fame pays in civilian money, not credits |

### 3.2 Spend Loops & Vendors

- **The Exchange (Palm Line):** uniforms, cosmetics, quarters furniture, YARDCLASH
  fight shorts and victory dances.
- **Mudfish Garage (Ironbeach):** vehicle mods, storm-weathering kits, Duppy Cloak
  charge cells, HARDSHELL maintenance.
- **DFS Dome Kiosk (The Ear):** intel subscriptions, minimap upgrades, decoder charms.
- **Lagoon Club:** rounds for your squad (temporary morale buffs), sound-system
  song requests, renting the open-air cinema for a squad screening.
- **Food Row:** stat snacks — jerk plates buff stamina regen, festival specials give
  event-specific perks.

### 3.3 The Gray Market — Private Wattson's Jerk Stand

Canon comedy made mechanical: a private runs an **unlicensed jerk-chicken stand out
of a guard shack**, and it is the base's only cash-to-credits leak.

- Accepts **world cash** — the only vendor inside the wire that does.
- Sells slightly-better stat food, "fell off a pallet" cosmetics, and — at high
  trust — small bundles of canteen credits at a brutal exchange rate.
- **Risk:** buying there while MPs patrol nearby costs Standing if spotted. The stand
  relocates weekly; finding it is a soft scavenger hunt broadcast in coded language
  on the base radio ("smoke on the ridge tonight, soldiers").
- **Storm rule:** at SC-2 the stand becomes the base's illicit morale hub and prices
  triple. During Storm Season it sells the rarest festival cosmetics in the game.

---

## 4. OnWatch — The Clout System

The base is always filming (canon 8.3). OnWatch is the fictional in-game social app
that converts spectacle into a live world stat.

### 4.1 Filmable Moments → Clout

Any spectacular act performed **in a public zone within sight of NPCs, seawall
livestreamers, or OnWatch camera drones** generates a clip with a clout score:

- Base score = stunt rarity × audience size × zone visibility.
- Multipliers: golden hour (×1.25), during a live event (×1.5), storm conditions
  (×2 — chaos footage always trends), first-ever on the server (×3, "Original" tag).
- Failures count too: a botched obstacle run or a jet-ski faceplant earns "blooper
  clout" — half value, but it stacks with no daily cap. The island loves a fool.

### 4.2 Viral Thresholds

| Tier | Clips reach... | Effect |
|---|---|---|
| **Local** | Base feed | Small ₡ tips, NPCs reference the clip in barks |
| **Parish** | Port Antonio town | Recruitment stat +, town NPCs recognize you |
| **Island** | Whole map | Sponsorship cash offers, "clip of the week" cinema eligibility |
| **Legend** | Permanent | Clip loops on the leaderboard billboard outside the gate; unique title |

### 4.3 Recruitment World-Stat Effects

Enlistment numbers are a **live world stat** fed by aggregate player clout:

- High recruitment: more NPC recruits at the Crucible, cheaper Exchange cosmetics,
  extra Skyfence crews during defense events (events get easier), fuller Friday crowds
  (YARDCLASH hype meters charge faster).
- Low recruitment: departments post desperation contracts at boosted ₡ rates,
  Auntie Blades gets meaner, the base radio runs guilt-trip recruitment ads.

### 4.4 Downsides of Fame

- **Rival-faction attention:** at Island tier, rival scouts begin appearing in your
  open-world sessions — ambushes on your known routes, Stormjack drones shadowing
  your flights, attempts to film *you* failing for their own counter-propaganda feed.
- **Paparazzi drones** swarm high-clout players in public zones, ruining stealth
  approaches (a DFS Static Choir bubble clears them).
- **Clout is a heat map:** the more famous you are, the faster your Watch Level rises
  when you go somewhere you shouldn't — everyone recognizes your face.

---

## 5. Watch Level — Intruder Heat (Non-Enlisted / Rogue)

Separate from civilian wanted stars. Applies to Outsiders inside the perimeter and
enlisted players who go rogue. Fictional game mechanic only.

| Level | Name | Trigger Examples | Base Response |
|---|---|---|---|
| W0 | **Unnoticed** | Public zones, normal behavior | None |
| W1 | **Flagged** | Loitering at ring gates, camera crossing | Polite MP escort toward the exit; no penalty if you comply |
| W2 | **Tracked** | Slipping an escort, restricted-door attempts | MP patrol vehicles converge; KINGFISHER pings your position every 30s |
| W3 | **Hunted** | Breaching a restricted ring, theft, assault | Armed response teams, dog patrols, gates seal ring by ring |
| W4 | **Spotlit** | Vehicle theft, reaching inner rings | SV-77 Duppy gunship spotlight; Skyfence perimeter turrets go active-deterrent |
| W5 | **Lockdown** | Vault breach attempt | Blast doors seal, HARDSHELL response squad, base-wide alarm; escape becomes its own mission |

**Decay:** W1–W2 fade in minutes out of sight; W3+ requires leaving the peninsula or
a DFS-flavored "records scrub" purchasable in town at painful cash prices. Enlisted
players caught rogue at W3+ are busted to the bottom of their Standing band.

---

## 6. Standing — The Discipline Meter (Enlisted)

For enlisted players, Watch Level inverts into **Standing**: a 0–100 discipline meter.
Infractions cost Standing instead of triggering stars.

| Band | Range | State | Effects |
|---|---|---|---|
| **Exemplary** | 90–100 | Parade-ground perfect | +10% ₡ on all payouts, salutes, first pick of daily contracts |
| **Good** | 70–89 | Normal soldier life | Baseline; no modifiers |
| **Watchlisted** | 40–69 | On the sergeant's radar | Auntie Blades extra-duty minigames (mop the Dome, paint the seawall) to climb back; gray-market prices rise for you |
| **Restricted** | 15–39 | Confined pending review | Inner-ring access suspended one grade, Tier 3+ vehicles impounded, no YARDCLASH entry |
| **Discharge Review** | 0–14 | One boot out the door | A redemption mission chain ("The Long Walk") or busted to Recruit ring access until served |

**Costs:** joyriding a forklift through the parade ground (−10), jerk-stand purchase
witnessed (−5), friendly-fire in wargames (−8), missing a Storm Condition muster (−15),
going rogue W3+ (drop to Restricted floor). **Gains:** contracts (+2), event
completions (+5), extra-duty minigames (+3 each), Storm Season heroics (+20).

Standing never touches rank — you keep what you earned; you just can't use all of it
while the sergeant is watching.

---

## 7. Storm Condition System (SC-4 → SC-1)

The public Storm Condition ladder visibly reconfigures the entire base. Weather is a
systems driver, not set dressing.

| | SC-4 (Clear) | SC-3 (Watch) | SC-2 (Warning) | SC-1 (Landfall) |
|---|---|---|---|---|
| **Visuals** | Teal neon, full activity | Amber accents mix in, shutters checked | Amber storm lighting, Palm Line boards up, petals lock | Red-alert lighting, power flickers zone by zone, horizontal rain |
| **Air** | Full flight ops, aerobatics course open | Storm-ferry mass launches (spectacle + Duppy Rider missions) | Grounded except Storm Pilot/Storm Ferry certified | All grounded; Hummingbirds only, and barely |
| **Sea** | All craft, races, dives | Small-craft advisories; dive loot bonus (churned seabed) | Storm Pilot certified only; rescue-swimmer missions spawn | Harbor sealed; Maroon Thunder rides it out as a lit fortress |
| **Missions** | Full board | Prep contracts appear (convoy reloads, shutter crews) at +25% ₡ | Defense and rescue missions dominate; rival raids likelier | Storm Season live-event beats: defend in howling rain |
| **Economy** | Baseline | Mudfish storm-kit sales spike | Food Row closes; jerk stand triples prices; salvage market frozen | All vendors closed except emergency canteen; post-storm salvage jackpot queued |
| **Systems** | — | Weather Eye players get 10-min early warnings | Watch Level responses slower (MPs are busy); stealth players' window | Skyfence locked shut; Standing muster call — miss it, −15 |

**Post-storm (return to SC-4):** a 2-hour golden window — wreck dives reseeded with
rare salvage, debris-clearing contracts at double ₡, blooper-clout bonanza as NPCs
film the cleanup chaos.

---

## 8. Live Cadence — Daily & Weekly Calendar

### 8.1 Daily Rhythm

- **06:00 — Reveille:** contract board refresh; sunrise photo multiplier at The Ear.
- **12:00 — Noon Gun:** flash trial at the Crucible (one attempt, big ₡).
- **18:00 — Colors:** base-wide golden-hour clout multiplier begins.
- **20:00 — Night Ops:** night-nav course opens; runway lights sync to base radio.
- **Rolling:** Skyfence defense events trigger off the live rival-faction stat.

### 8.2 Weekly Calendar

| Day | Event |
|---|---|
| **Monday** | "Fresh Meat Monday" — new-recruit trial bonuses; mentors earn double Squad XP |
| **Tuesday** | Mudfish Surplus — vehicle mod discounts; salvage buyback +20% |
| **Wednesday** | DFS Broadcast Night — new decoder puzzle chain drops island-wide |
| **Thursday** | Wargame Night — mock-town squad PvP; Standing bonuses for clean play |
| **Friday** | **YARDCLASH Night** — the Pressure Dome becomes the Yard; ladder matches, side bets, weekly Yard Rankings posted, reigning champ's custom entrance |
| **Saturday** | **Regatta Royale** (monthly, first Saturday) — Navy vs. Air Wing jet-ski and boat races; otherwise Lagoon Club sound-system dance and clip-of-the-week cinema vote |
| **Sunday** | Family Day — Palm Line festivals, cricket, dominoes tournaments; Watch Level decays faster (even the MPs are at the beach) |

### 8.3 Seasonal Windows

- **Storm Season (in-fiction hurricane months):** elevated SC-3/SC-2 frequency, the
  "Storm Season" live-event chain, exclusive storm-weathered vehicle liveries, and
  the jerk stand's legendary festival cosmetics.
- **Numbers Station windows:** the ghost broadcast goes live at irregular real-world
  times; DFS players with Weather Eye and Decoder Ring get first crack.
- **Maroon Thunder deployments:** quarterly spectacle — the carrier departs and
  returns, temporarily shifting Ironbeach's mission table to expeditionary contracts.

---

## 9. System Interlocks (Design Notes)

- **Clout ↔ Watch Level:** fame makes infiltration harder; DFS tree counters it.
- **Storm ↔ Economy:** every SC shift moves prices and loot; Weather Eye players
  play the market.
- **Standing ↔ Rank:** rank is permanent, Standing is behavioral — keeps the power
  fantasy intact while giving misbehavior real teeth.
- **YARDCLASH ↔ everything:** the Friday Yard is where economy (bets), clout (drone
  footage), recruitment (crowd size), and the roster's storylines converge — the
  weekly heartbeat of the base.

---

## 10. Needs — Our Answer to the Hunger/Sleep Debate

The genre-wide question ("should a GTA-style game make you eat and sleep?") gets a
firm PAUDC ruling: **carrot, never stick.** The cons of survival mechanics are real —
they slow fast-paced play, frustrate casual players, and fight the freedom-and-chaos
core of the genre. But the pros (immersion, planning, roleplay) are worth keeping.
So the default game has **no hunger or fatigue penalties, ever** — only bonuses:

### Well Fed (food = buffs, already canon)
Eating is always optional and always positive. A Fort Flavor plate, a Food Row
snack, or a market meal grants **Well Fed**: stamina regen, swim speed, storm
resistance, or YARDCLASH hype gain depending on the dish (see the Culinary Academy
doc). Quality tier scales duration — a Granny-Approved curry goat is the best buff
food in the game. Skip eating entirely and nothing bad happens; you're just not
buffed.

### Well Rested (sleep = banked bonus)
Sleeping at your bunk, apartment, or a hotel banks **Well Rested**: +25% faction XP
for the next 90 real minutes of play, plus a free daily gear repair. It's the
classic rested-bonus pattern — it rewards players who log off in a bed and punishes
no one. Sleep is never required and never interrupts anything.

### Field Rations Mode (the opt-in hardcore toggle)
For roleplay servers and immersion players, an optional toggle adds visible hunger
and stamina meters with soft consequences (reduced sprint, aim sway — never death,
never forced interruptions mid-mission). It exists because the debate has two valid
sides; it defaults **off** because the base game is a power fantasy. **Ironman Tour**
leaderboards track completions with the toggle on — hardcore players get bragging
rights instead of making everyone else eat on a timer.

### Why this is the right call for PAUDC specifically
The food economy is one of this game's hearts — Fort Flavor, the Blue Mountain
Butcher, Food Row. Making food *mandatory* would turn the island's best content
into a chore; keeping it *rewarding* makes players seek it out because they want
to. The curry goat quest matters because the pot is worth carrying — not because a
meter is empty.

> All systems above are fictional game mechanics. Tone rule stands: cinematic and
> playful — power fantasy, not procedure manual.
