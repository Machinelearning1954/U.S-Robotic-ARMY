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

### 4.4 The Re-Render Queue — Chromelab AI Enhancement

Trained on the real 2025-26 wave of AI video tools (generate-and-enhance platforms
that denoise, deblur, upscale and "cinematize" raw footage), OnWatch gets a
production pipeline — all of it an invented in-world service:

- **Raw clips bank automatically.** Big filmable moments (splashdowns, Yard wins,
  storm stunts) save a **RAW CLIP** alongside their instant clout.
- **The Chromelab Re-Render Queue** at Silver Springs Polytech is the island's AI
  enhancement studio: hand in raw clips and the lab's "re-render" pass — denoise,
  deblur, filmic regrade, upscale — reposts them **enhanced**, paying bonus clout
  per clip. Fiction-side it's students training their models on your footage;
  gameplay-side it's a banked-reward loop that gives stunt players a reason to
  visit the tech campus.
- **The authenticity slider (the satire).** Push enhancement past "clean-up" into
  full AI gloss and viewers start flagging clips **"NUH REAL!"** — over-glazed
  clips earn more clout up front but risk a flag that halves the payout and dings
  your Standing with the *keep-it-raw* crowd. The meta-joke is current: the feed
  rewards polish and punishes fakery, and the line moves every week.
- **Boundary note:** the Chromelab queue is a fictional in-game service; no real
  AI product is depicted or named in-world. (Production-side, AI video tools are
  listed as legitimate trailer/pre-viz options in the graphics research doc.)

### 4.5 Downsides of Fame

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

---

## 11. The Field Kit — Loadout System (No Infinite Pockets)

GTA 6 is reported to be replacing the classic "carry the whole armory" model with
a limited loadout wheel. PAUDC adopts the same design pattern — original take,
fictional gear — because it makes every choice before a mission matter and it
feeds our existing systems.

### The Kit Wheel
Before deploying, the player builds a **Field Kit** at their locker (barracks,
apartment, or Mudfish trunk). The kit is what the radial wheel holds in the
field — nothing else comes along:

| Slot | Holds (all fictional/stylized) | Example picks |
|---|---|---|
| **Sidearm** | one compact service piece | standard-issue "Peacekeeper" (stylized, sci-fi dressed) |
| **Primary** | one long tool — combat *or* trade | training rifle prop, net launcher, capture snare |
| **Thrown** | one pouch | **Dazzler** ("duppy flash") stun-dazzle puck, smoke, chaff foil |
| **Melee** | one | cutlass (ceremonial pattern), wrench, towel (YARDCLASH challenge item) |
| **Gadget** | one | scout drone, Duppy Cloak charge, Chromelab camera rig |
| **Utility** | trade gear | croc snare, cook pot rack, butcher cooler, repair kit |
| **Pocket** | consumables | two Fort Flavor dishes, energy tea |

- **Swap at lockers, not mid-fight.** Lockers live in every district hub; the
  Mudfish trunk is a mobile mini-locker with two swap charges per in-game day.
- **Kits are builds.** Saved presets — "Wrangler", "Cook Run", "Storm Watch",
  "YARDCLASH Night" — one tap to switch at any locker. Spec-tree perks add slot
  upgrades (deeper Pocket for cooks, second Utility for butchers).
- **Weight is felt, not counted.** No encumbrance spreadsheet: heavy Primary
  picks slightly slow sprint and swim — readable, arcade, honest.

### Hard Knock — the breach mechanic
The reported GTA 6 flashbang-breach loop, PAUDC-flavored and kept **stylized and
non-graphic**: during Storm Condition responses, base security runs **Hard
Knocks** on Barometer Syndicate strongpoints. Player kits a **Dazzler** —
a fictional stun-dazzle puck that pops like a camera flash and rings like a
steelpan note. Toss it through the door and the game gives a two-second
slow-motion entry window where opponents are staggered (hands up, stumbling —
never gore). It's an arcade timing beat, not a tactics simulator: the room
layouts are fictional, the procedure is three button presses, and the reward is
style points on the OnWatch clip, not realism.

- Dazzlers are loud and bright: every use off-mission raises Watch Level.
- Blue Mountain Butcher stocks a **Gator-Grade Dazzler** variant that also
  works as a wildlife deterrent — the wrangler's non-lethal panic button.

*Boundary note: slots and gear stay fictional or genre-generic; no real weapon
models, specs, or tactical procedure are referenced — see the content boundaries
in the base design doc.*

---

## 12. The BII & the Infraction Ledger — Who Watches the Watch Level

Trained on the community's favorite pastime — cataloguing every petty crime in
the GTA 6 trailer — PAUDC gets a full infraction taxonomy and someone to enforce
it: the **Bureau of Island Investigations (BII)**, a fictional, slightly
overdressed federal-flavored agency that opened a two-desk office above the
Pelican Key post office after the Barometer Syndicate's stateside money surfaced.
Suits in the tropics, sweating through procedure. They are the *comedy* of law
enforcement; base security remains the muscle.

### The Infraction Ledger (what feeds Watch Level)
All fictional, all stylized — severity in ★:

| Infraction (in-world name) | Real-world genre trope | ★ |
|---|---|---|
| **Road Manners Advisory** | jaywalking | ☆ (warning only — the BII agent writes it down, nobody cares) |
| **Undignified Transit** | riding on roofs, standing through sunroofs | ★ |
| **Excessive Style, Vehicular** | donuts, wheelies, drifting the Strip | ★ |
| **Unlicensed Regatta** | street (sea) racing | ★★ |
| **Creative Parking** | stopping on the causeway | ★ |
| **Brandishing a Kitchen Implement** | the hammer-auntie special | ★★ |
| **Dress Code Violation, Gross** | indecent exposure ("the Key Man Clause") | ★★ |
| **Declining an Invitation** | evading arrest | +★ on top of anything |
| **Services, Theft of** | dine-and-dash at Fort Flavor | ★★ |
| **The Whole Charge Sheet** | armed robbery of a Syndicate front | ★★★★ (mission content only) |

- **The OnWatch irony is the system:** every infraction that raises Watch Level
  also pays clout — the island loves a show. The BII confiscates clout... never.
  They subpoena the clips as evidence and accidentally make them go viral again.
- **Decay:** stars fade after a clean minute; sleeping (Well Rested) clears one
  extra; a YARDCLASH appearance resets petty stars ("community service").
- **In the prototype (v0.7):** four ledger entries are playable. Sustained
  donuts trigger *Excessive Style, Vehicular* (★); idling on the harbor pier
  earns *Creative Parking* (★); holding speed at sea earns *Unlicensed Regatta*
  (★★); and at three stars the BII "would like a word" — keep speeding for
  *Declining an Invitation* (+★). Stars decay clean; every infraction still
  pays clout, because the island loves a show.

### The Job Prep loop (trained on classic heist structure)
Big missions against the Syndicate use the genre's proven three-beat prep:
**plan** (the board at the safehouse — routes, photos, tactical arrows),
**source** (boat, truck, drone, kit — Field Kit lockers and Butcher/Polytech
contacts), **scope** (drive-by with the Chromelab camera rig, clocking
entrances). Then the Hard Knock. Prep choices change the execution mission —
skipping a source beat means improvising mid-job.

---

## 13. Likkle Oracle & the Quatrefold — OnWatch Gets a Voice and a Hinge

### Likkle Oracle (the island's AI chatbot)
The ORACLE Table's public-facing likkle sibling: a **Patois-speaking AI chat
assistant** living inside every OnWatch phone, co-maintained by DFS signal
students and the Chromelab. It is the game's diegetic helper — tutorials,
mission dispatch, weather warnings and flavor, all in character:

- "Weather Eye seh SC-3 a come. Move de boat dem, star."
- "Reef School Friday. Bring patience an' bait."
- "BII a watch yuh. Park nice."

Rules: Likkle Oracle never breaks fiction, never lectures, and its Patois
follows the character bible's dialogue guide (respectful, written with care,
reviewed — never mock-accent). Players can mute it; it sulks about it on the
weekly recap, which is the joke.

**The sky-writer:** Likkle Oracle rents the island's banner plane. A little
prop plane flies circuits over the twin bays towing glowing banner messages —
event calls, storm notices, pure vibes. *Live in the prototype (v0.9): watch
the sky.*

### The Quatrefold ("de quattie")
The Polytech's four-panel folding phone — the island's answer to the folding
wave, and the canonical OnWatch hardware:

| Fold state | Mode |
|---|---|
| **Palm** (folded) | Likkle Oracle chat, clips feed, clout ticker |
| **Book** (2 panels) | live map + compass |
| **Spread** (3 panels) | Snapper Scope sonar, drone feeds, YARDCLASH bets |
| **Table** (4 panels flat) | mini ORACLE planning board — the Job Prep loop runs here |

Design note: the real-world target spec already includes folding phones
(Galaxy Z Fold class); the HUD stays responsive across squarish unfolded
aspect ratios so quad-fold hardware, when it arrives, is already served.

---

## 14. The Gains Trade — Snake Oil, Satirized

The island has a gray market for "performance." PAUDC plays it the way the
genre always has — as **satire with consequences**, and with every substance
100% invented:

### The products (all fictional, all glowing suspiciously)
- **Duppy Juice** — a teal serum sold from a gym locker "by a friend of a
  friend." Promises YARDCLASH power. Delivers 90 seconds of sprint boost,
  then **the Wobbles** (aim sway, jelly legs) for twice as long.
- **Anansi Oil** — "eight limbs of strength, star." Grip buff for climbing;
  your palms glow, which is terrible for stealth and everyone can see it.
- **Iron Elixir "New Weigh-Up"** — a subscription wellness scam advertised on
  OnWatch with testimonials from accounts created last Tuesday. Takes your
  canteen credits, mails you a pamphlet.

### The mechanics (the joke is that honesty wins)
- Every serum is **strictly worse than the kitchen**: the Well Fed and Well
  Rested buffs from Fort Flavor food and real sleep are stronger, last longer,
  and have no crash. The med bay's Chief Medical Officer says it plainly:
  *"Nuh tek nutten yuh cyaan pronounce."*
- **YARDCLASH runs the Scanner** on fight night — glow in the veins means
  disqualification and a week of Standing loss. The crowd boos the cheat, and
  the boo is recorded and posted by OnWatch automatically.
- Selling earns the BII ledger's **"Unlicensed Apothecary"** (★★); buying just
  earns the Wobbles and public embarrassment.
- **Story hook — "Snake Oil":** an Act 2 side chain traces the serum supply
  through the Pelican Key hotels to a Barometer Syndicate front lab in Rust
  Quay. Shutting it down converts the gym-locker dealer into Fort Flavor's
  most annoying protein-shake evangelist.

*Boundary note: no real supplement, peptide, hormone or medication is named or
depicted anywhere in this game; no real-world usage, sourcing or dosing
information exists in canon. The satire targets the scam economy, not any real
product — and the game's answer is always the curry goat.*

---

## 15. The Green Cross — Licensed Medical Wellness Dispensary

The fictionalized Jamaica of PAUDC has a **legal, licensed medical-cannabis
program**, the way the real island pioneered a regulated framework. In-game it's
the **Green Cross** — a fictional-brand storefront clinic on the Palm Line, white
walls and a glowing green cross, sitting in the same "carrot, never stick" wellness
family as **Well Fed** (§10). It is deliberately the *legal, clinical* counterpoint
to the Gains Trade snake-oil (§14): a prescription counter, not a gym-locker deal.

### How it plays (already live in the 3D prototype)
- The Green Cross opens up in **free roam**, once you've earned the Instructor and
  Coach titles — its green beacon appears on the Palm Line and on the radar.
- Drive up, hold steady, and the counter **fills your script**. You collect a
  licensed medical batch and gain the **IRIE** buff.
- **IRIE (calm hands):** a wellness/steadiness bonus. Your **BII Watch Level cools
  off twice as fast** (§5 heat bleeds off in 30s instead of 60s), and filling the
  script immediately eases one Watch star. It reads on the HUD next to WELL FED.
  Pure carrot — you're never *required* to visit, nothing bad happens if you skip it.

### The framing rules (content boundary)
- **Licensed and medical, always.** Everything is presented through a regulated
  dispensary with a prescription counter and a fictional brand — consistent with the
  fictionalized island's legal program. No street dealing, no trafficking loop, no
  sourcing, growing, dosing or preparation information exists in canon.
- **No real product or strain is named**, and there is no depiction of use beyond
  "collected a licensed batch → gained a calm buff." The mechanic is a wellness
  pickup, kept non-glamorized and abstract.
- It sits **opposite** the Gains Trade: the Green Cross is the honest, legal,
  regulated path (a real buff, no crash), while the snake-oil serums are the scam.
  The design point is the same as the food economy — the legitimate option wins.
- **Rating:** genre-standard for an M-rated open-world title and treated with the
  same restraint as the rest of the package — stylized, satirical where it's funny,
  clinical where it's medical, never instructional.

---

> All systems above are fictional game mechanics. Tone rule stands: cinematic and
> playful — power fantasy, not procedure manual.
