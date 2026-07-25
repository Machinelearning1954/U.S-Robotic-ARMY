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
- **The re-render sweep — live in the prototype (v0.44).** Handing in clips now has
  a visual beat to match: a teal scan-bar sweeps the screen while the lab works,
  the same "watch it get cleaner in real time" idea the AI-enhancement demo wave
  trades on, built as an original screen-space effect (no tool's UI, footage, or
  branding is reproduced). It clears the moment the payout lands or you walk away.

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

**Storm Watch — live in the prototype (v0.50).** During a storm an **offshore
waterspout** forms out over the bay — a churning grey funnel drifting along the
water, visible from the seawall. It's a pure spectacle event in the open-world
tradition: stand at the waterline (on foot), look out to sea, and hold still a
few seconds to "film" it — the crowd gathers, OnWatch overpays for the clip
(+35 clout, one-time). No danger to the player and no damage system attached;
the funnel stays out over deep water and the whole beat is watch-and-capture,
not survive. Toggle a storm with `R` to bring it in. Entirely fictional
weather VFX — no real storm footage or real location is depicted.

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
| **Unsolicited Attention** | stalking / harassment — following a local too close, too long | ★ *(pays no clout — see below)* |

- **The OnWatch irony is the system:** every infraction that raises Watch Level
  also pays clout — the island loves a show. The BII confiscates clout... never.
  They subpoena the clips as evidence and accidentally make them go viral again.
- **The one exception:** **Unsolicited Attention** breaks the irony on purpose.
  Following a pedestrian too closely for too long isn't a stunt anyone's filming
  — it costs **−15 clout** outright, no viral upside, because harassing an NPC
  isn't content, it's just harassment. Every other infraction on this ledger is
  the island laughing at victimless mischief; this one is the game drawing a
  line. Matches the NPC culture doc's dignity rule (`JAMAICA_NPC_CULTURE.md`
  §2.4: *"personality varies, dignity is constant"*) and the non-lethal,
  de-escalation-rewarding design pillar running through the whole combat/wanted
  system. **Live in the prototype (v0.35):** stay within ~3.5 m of the same
  pedestrian, on foot, for 6+ continuous seconds and the BII takes the report —
  the pedestrian bolts, Watch Level rises a star, and clout drops immediately.
  A 20-second cooldown per pedestrian stops it from re-triggering on the walk
  away.
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

### The Field Medic Refresher — live in the prototype (v0.41)

A second, independent reason to linger at the Green Cross: hold position at the
clinic (on foot, unhurried) and a first-aid/anatomy refresher runs in the
background — **CERTIFIED, +25 clout**, one-time, no buff attached (the IRIE
pickup above is the wellness mechanic; this is flavor and a clout reward, and
the two don't interact). Kept deliberately abstract: the toast line is "know
your nervous system, keep steady hands" — no real clinical procedure, dosage,
or technique is depicted, same rule as the rest of this section. This is the
game's nod to basic first-aid literacy, not a simulation of medical training.
- **Rating:** genre-standard for an M-rated open-world title and treated with the
  same restraint as the rest of the package — stylized, satirical where it's funny,
  clinical where it's medical, never instructional.

---

> All systems above are fictional game mechanics. Tone rule stands: cinematic and
> playful — power fantasy, not procedure manual.


## 12. Cheat console — original codes (live in the prototype, v0.72)

A classic cheat-code console, built **entirely original** — the game's own code
words and its own vehicles, none of any real game's codes, car names, characters,
or branding. Press **`** (backtick) to open the console, type a code, ENTER to
run; while it's open a capture-phase key handler swallows input so the driving
controls never fire mid-type.

Codes: **MUDFISH / MARLIN / NIGHTHAWK / REEFRUN / FOOTIT** (spawn-and-board the
matching original ride at your feet), **STORM / STATIC** (toggle the weather /
the Static Hour), **MIDNIGHT / SUNUP** (jump the clock), **BUZZ** (+100 clout).
Unrecognized codes just report "no such code."

- **Boundary:** the reference image was a real game's copyrighted cheat sheet
  (its logo, characters, codes, and car names). **None of that is reproduced** —
  every code word and every spawnable vehicle here is PAUDC's own invention.


## 13. Field Conditioning Circuit — training across the map (live in the prototype, v0.73)

PAUDC's own invented conditioning program, an extension of the canon **Crucible**
(Section 2.3): five **training drill** stations scattered across the districts —
SPRINT LADDER, AGILITY GATES, STEADY-HANDS BEAM, ENDURANCE HAUL, and the SUMMIT
DRILL up at the hillside. Walk up to each on foot and hold the mark a few seconds
to clear it (**+15** apiece); clear all five and the circuit certifies you for a
**+60** bonus ("Conditioned").

- **Boundary:** the reference was a real U.S. military human-augmentation
  infographic (real branch/agency programs like TALOS, IVAS, N3, Safe Genes). **None
  of that is used** — no real program, agency, branch, exo-suit, neurotech, or
  gene-editing is depicted. These are generalized, invented *athletic* drills
  (sprint/agility/steadiness/endurance), non-lethal and courtesy-first like the rest
  of the game.


## Camera Drone — aerial clips for OnWatch (live in the prototype, v0.80)

A cinematography drone in the Don's robotics kit: press **I** on foot and an
original filming quadcopter lifts off, orbits overhead for a few seconds getting
the aerial shot, then banks an **OnWatch clip** — **+18 clout, or +30 when
Chromelab Grade is on** (the graded footage overperforms, same as splashdown
clips). 14-second cooldown; rotors and nav LEDs animate while it films.

- **It's a camera, not a weapon** — a gimbal drone that captures footage, nothing
  else, consistent with the non-lethal floor. It feeds the existing OnWatch/clout
  economy (the game's "film the stunt" loop) with a new *aerial* angle.
- **Origin:** a real camera-drone brand's reel ("movement without losing sight of
  the frame"); the brand and hardware are **not** depicted — this is an original
  quadcopter, and only the "aerial cinematography drone" idea was kept.


## The Future Island pack — four sights from the AR-city concepts (live, v0.82)

Four features built from a batch of AI-generated "future city" concepts, each made
original and folded into the island's non-lethal canon:

**The Kindred Court** — a garden plaza beside the Bali estate gardens where the
Don's old **care-companion units** (original fictional robots: white shells, teal
eyes, no brand) tend the island's elders — one offers a glass of cool water at the
bench, another walks a slow escort loop arm-in-arm around the court. Stand with
them a moment for a one-time **+25** ("dem remember yuh, Don"). It's the gentle
half of the Don's robotics-vet legacy made visible: care robotics, no weapons,
nothing harmed.

**The Glass Whale** — a translucent light-sculpture whale swimming a slow loop
**above the Neon Strip**, an in-world AR art installation. It shimmers faint by
day and glows after dark; stand under it as it passes for a one-time **+20**
("big fish, no water").

**The Star School** — a holo-orrery pedestal by the Wheaton Night School: walk up
and it projects the island's **own invented four wanderer-stars**, slow-orbiting
holograms taught in night class. One-time **+20**. No real agency, spacecraft, or
program depicted — it's the island's fictional sky.

**The Reef Sentry Line** — three stilt-mounted sensor masts in the shallows,
blinking amber until you climb out and tune each by hand (**+8** apiece, **+15**
when the line sings). They watch **storms and wildlife** — waterspout warnings and
croc-drift pings for the harbor. *They watch weather, not people.*

- **Boundary:** the sentry line's source post was about a **real national
  border-surveillance system** (real name, real border, armed patrols) — none of
  that is depicted. The real system, country, border, soldiers, and weapons were
  all declined; only the generalized "line of sensor masts" idea was kept and
  pointed at weather and wildlife. A second reel in the same batch — a real
  political figure addressing massed troops with warship/missile/nuclear-war
  imagery — was **declined entirely**: real people, real militaries, and war-hype
  content stay out of the game, full stop.


## The Grand Flock — a migration swarm over the bay (live, v0.83)

Every so often the harbor sky fills with wings: a great seasonal **bird migration**
sweeps east-to-west over the bay in a loose V-echelon, forty-plus birds strong on
high tiers, wingbeats staggered, the whole sky moving. Stand under the crossing and
take it in for a one-time **+20 — or +30 if the Reef Sentry Line is tuned**, because
the wildlife watch logs the flock as it passes ("SENTRY PING — grand flock logged").
Crossings recur on a loose timer; the sentry callout fires once per crossing.

- **Boundary:** the source reel was a war clip — a sky black with attack aircraft
  under a missile-defense targeting HUD, with a **real counter-swarm weapons system**
  named in the caption. The weapons, the targeting, the real system, and the war
  frame are all **out** (non-lethal floor; no real military tech). What was kept is
  only the awe of a sky full of movement — rebuilt as birds, tracked by the island's
  own storm-and-wildlife watch. Nothing shoots anything; you look up, and the line
  takes a note.


## The Glass Reef — coral-tank lounge (live, v0.85)

An open-air lounge pavilion on the headland between the Kindred Court and the bay:
warm pendant lights under a timber roof, two shell chairs, and the centerpiece — a
long **glass coral tank** on a dark base, sand bed glowing, eleven coral heads in
ember orange and gold, **nine little fish** drifting lazy circuits above them. On
the rim sits the house cat — orange-and-white, tail keeping time, head tracking
the fish. It has an arrangement with the glass; the fish are in no danger, and
neither is anyone else. Sit with it a moment for a one-time **+20**.

- **Origin:** an AI-generated luxury-interior render (aquarium table, coral, a cat
  counting fish) — rebuilt as an original harborside lounge. Pure ambience; no
  brand, place, or product depicted.


## The Storm Desk — field weather station (live, v0.87)

A canvas field tent on the headland behind the Light Ring: two poles, sloped
canvas, plain supply crates, a folding table, and a **rugged field laptop** whose
green scope never stops sweeping. It is the island's weather desk — first check
pays **+20** ("squalls and wildlife only, nothing else on this scope"), and every
later check reads out a **live field report from the actual world state**: an
active waterspout, the grand flock mid-crossing, a rain cell overhead, the camera
drone aloft, and where the Sea Puss is on the wreck line right now. If nothing's
happening: *"all quiet, bay breathing easy."*

- **Boundary:** the source reel was "AI Warfare: Precision Missile Deployment" —
  a field operator on a military laptop in a war camp. The missiles, targeting,
  and war frame are all **out**; ammo crates became plain island supply. Only the
  field-desk image was kept, and its scope was pointed at the weather.


## The Island Flypast — festival formation (live, v0.89)

Every so often three little **island sportplanes** — one black, one green, one
gold — sweep the bay in a V, ribbon smoke breathing behind each in the flag
colorway, wings waggling to the crowd below. Stand under the crossing for a
one-time **+20**: *"black, green and gold writing across the sky — pride, not
power."* Crossings recur on a loose festival timer.

- **Boundary:** the source reel was a **real political figure** posed with a
  **real strategic bomber** and armed ranks — a "show of strength." The person,
  the bomber, the weapons, and the war-display are all **out** (no real people,
  no real aircraft, no war-hype). Only the awe of aircraft overhead was kept,
  rebuilt as a civil festival flypast in the island's own colors.


## The Surf Rescue Drill — robo-fin training pool at the Alexandria (live, v0.92)

Beside the Alexandria on the hilltop: a round **lifeguard training pool** ringed
in orange-and-white buoys, a **rescue dummy** riding a board dead centre, and four
of the Don's **robotic drill fins** carving slow circles around it — dark blades
with bright **grab handles** and green nav LEDs, because the rig makes no secret
of being a rig. Trainees practice the paddle-out against moving "sharks" that
were never sharks. A red lifeguard chair watches over the rim. One-time **+20**:
*"nobody in these waters but machines."*

- **Boundary:** the source clip was an AI shark-thriller (two people stranded on
  a surfboard, sharks circling). The peril is **not** depicted — this game never
  does animal attacks; its wildlife is protected and rescued, not menacing. Only
  the fins-around-a-board image was kept, rebuilt as opt-in lifeguard training
  with robots. "Alexandria Potomac" resolves to the game's own fictional
  Alexandria per the standing real-places rule.


## TEST RUN — the Needle, Skyworks' hypersonic testbed (live, v0.96)

On a teal-ringed pad up on the Palisade Skyworks plateau sits **the Needle**:
a long black dart of an aircraft — chined nose, blended delta, twin canted
fins, teal bubble canopy, gold island cheatlines. Stand on the pad a beat and
you're strapped in for the **TEST RUN**: a ~26-second full-throttle proving
flight that spirals out over the island and climbs while Mission Control calls
the numbers — *MACH 2 through the shudder… MACH 5, the island a green coin
below… MACH 8, leading edges glowing… MACH 9.9 — that's the number, bring her
home.* The exhaust bloom swells with the speed. First completed run **+40**
("Skyworks owes you a drink"), repeats +15. **The run always lands** — no fail
state, no combat: the mission is speed, nerve, and bringing her home.

- **Boundary:** built from a film clip of a hypersonic test flight. The film's
  IP (title, characters, the fictional plane's name) and the **real aircraft
  program** the request named are not used — Rule Zero and the no-real-military
  rule. Only the *test-pilot mission shape* was kept: an original invented
  testbed, an original control script, zero weapons.


## The Long Game — the million-run strategy table (live, v0.98)

At Alexandria Mission Control: a dark round table under a soft **column of
light**, ringed by twelve run-counter lamps that ripple teal when someone steps
up to read the board. The table has **run the storm season a million times**,
and the count on the board never changes: *the island wins 1,000,000 of
1,000,000 — and every winning line starts the same way: nobody throws the first
punch.* First reading pays **+25**; step up again and the board re-runs, dealing
original island aphorisms — *win first, then walk in… make your enemy your
neighbour before your neighbour your enemy… patience is a position; hold it.*

- **Boundary:** the request bundled a real author's strategy books, a film
  character's "saw every future" trick, and a real-nation war to win. The
  author's copyrighted work is not reproduced, the film IP is not used, and the
  war is declined (standing rules). Kept only the strategist-who-simulates-
  everything idea, pointed at the game's own doctrine — the aphorisms are
  original and island-voiced, and the one answer the machine ever finds is the
  game's non-lethal floor stated as strategy.


## The Evergreen Course — the bootcamp's longevity class (live, v0.99)

Behind the middle Beach Bootcamp station on Palm Line sand: a dark board carrying
the **two-roads chart** — a grey row of silhouettes that tilt and shrink decade
by decade, and beneath it a **gold row standing upright all the way down the
line**. A coach's bench and a rack of light hand-weights sit beside it. Stand at
the chart to **enrol** (+20 one-time — *"two roads on the chart; the gold one is
just showing up"*), with a **+15 honour bonus** if you've already earned the
Field Conditioning Circuit cert (*"yuh already living it"*). Return visits get
the coach's rotation of original longevity lines: *move a likkle every day…
lift light, lift long… walk, swim, dance, stretch… rest is training too.*

- Wellness-positive and deliberately general — movement, consistency, rest. No
  medical claims, no products, no real people; the chart figures are stylized
  silhouettes. From an "aging with vs without exercise" comparison post, rebuilt
  original.


## Swimming — the water verb (live, v1.01)

The core mechanic the bay had been waiting for. On foot in water you now truly
**swim**: the Don goes prone into a **front-crawl stroke with a flutter kick**,
**W** to swim, **SHIFT** for a strong sprint stroke. Hold **SPACE to dive
under** — down to where the **Coral Tunnel** shuttles run, over the **wreck
field**, beneath the **Sea Puss** on its dive tour. A **breath** gauge shows in
the HUD while submerged (`DIVING ●●●●`); surface to refill it.

**Non-lethal by design, like everything else:** run the breath out and you don't
drown — you simply **come up for air** ("no harm, just breathe"), rising to the
surface even if you keep holding dive. First swim unlocks the verb (+10); your
first deep dive pays +15 ("down where the wrecks and the tunnel run"). It ties
together every water feature already in the game — the Lido, the Raft-Up, the
reef, the tunnel, the wrecks — into one continuous swimmable bay.


## Persistence — auto-save & restore (live, v1.04)

The oldest lesson in game design, now installed: **the island remembers you.**
Progress auto-saves to the browser every few seconds and on tab-hide — clout,
position, time of day, wardrobe, certs (night school, medic, steady-hands,
conditioning circuit), every one-time sight unlocked across the whole map, the
sentry line's tuned masts, and your bests (race, range, beam gate) plus ride
tallies (Sea Puss trips, Needle runs, sky-rig fixes, camera-drone clips). Boot
the game again and you're back where you stood: *"WELCOME BACK, DON — progress
restored."*

- `?fresh=1` on the URL boots a clean island without touching the save;
  `wipeSave()` (debug/cheat surface) clears everything including the older
  per-feature keys (clout/estate/race-best) that predated this system.
- Everything saved is the player's own progress, stored locally in the
  browser — no telemetry, nothing leaves the machine.


## The Watchkeeper's Walk — the watch-tech tour quest (live, v1.07)

A meta-quest crowning the island's five courtesy-tech stations — each one built
fiction-safe from border-surveillance source material and pointed at weather,
wildlife, welcome, or sport, never at people:

1. **Tune the Reef Sentry Line** (storms & wildlife)
2. **Read the Storm Desk** (live field reports)
3. **Stomp the Ground Ear** (seismology, opt-in)
4. **Sign in at the Light Ring** (the gate that welcomes)
5. **Thread the Beam Gate** (reflex sport)

Finish all five and the island names you **Watchkeeper**: **+50** — *"the island
watches WITH you, never AT you."* Progress notes surface gently as you collect
stations; state persists in the auto-save.

- **Origin:** an eight-image batch of a real nation's border-force "laser wall"
  series (flags, armed soldiers, detection of people). Nothing new was taken —
  every keepable idea from that series had already been built fiction-safe in
  v0.82–v1.00; this quest is the ribbon on the completed set, and its completion
  line states the design rule outright.


## The Cliff Kite — hang-glider soar (live, v1.09)

On the Ear's high hill, above the Ground Ear: a timber **launch ramp** and a
parked blue-and-white wing. Stand on the ramp a beat and you're **airborne** —
a swept two-panel kite with a prone pilot pod, steering with **A/D**, **W to
tuck** for speed at the cost of sink. Soar south off the hill and out over the
bay; the chase camera rides behind the wing. **There are no crashes on this
island — only landings**: touch down anywhere feather-soft, get the distance
flown called out, and walk the wing back up. First soar pays **+30**; saved
with everything else.

- **Origin:** a coastal hang-gliding reel — pure traversal joy, rebuilt
  original (invented wing, the island's own cliffs; no resort, brand, or place
  depicted). It completes the flight set: parachute down (Harbor Drop), Mach
  9.9 up (the Needle), and now the slow soar between.


## The Current Suit — powered swim suit (live, v1.10)

On the Vellum promenade, a dark mannequin on a plinth wears it: **the Current
Suit**, Reef School assistive swim-tech out of the Don's workshop — *"anyone can
swim."* Stand at the display a moment and it's fitted, permanently (saved):
**stronger stroke** (+45% swim speed and acceleration, stacking with the sprint
stroke) and **double the breath** underwater. While you swim, thin **blue
propulsion lines glow** along the Don's sides — the suit working.

- **Origin:** an AI concept ad for a propulsion swimsuit. Rebuilt original — no
  brand, no product; framed as what this island always builds: tech that helps a
  body do more, never a weapon. Pairs with v1.01 swimming and the island's
  accessibility streak (Kindred care units, Evergreen Course).


## The Reef Visor — sonar for divers (live, v1.11)

Next to the Current Suit stand on the promenade: a dark half-dome visor on a
pedestal, teal band glowing. Fit it (one-time **+25**, saved) and the bay starts
talking: **while you're genuinely under** (diving, not just wading), the visor
pings the nearest sleeping thing every few seconds — *"VISOR SONAR — wreck 2,
64m west… the coral tunnel, 28m south… the Sea Puss, 90m east"* — live
distances and bearings to the wreck field, the tunnel line, and the submersible
wherever she's currently sailing.

- **Origin:** an "abyssal combat diver" concept — a supercavitating underwater
  **gun** paired with a sonar visor. The gun is **out** (no firearms, ever, on
  this island); the visor half was kept and pointed at exploration. The dive kit
  is now complete: swim (v1.01), power (v1.10), and sight (v1.11) — nothing to
  shoot, everything to find.


## The Soundring — procedural audio engine (live in the prototype, v1.16)

The island gets its voice: a **fully procedural WebAudio engine** — every sound
synthesized at runtime from oscillators and filtered noise. **No audio files, no
samples, no licensed music** — the single-file and all-original guarantees hold
(the IP provenance table's "Audio: none shipped" becomes "Audio: all synthesized").
Toggle with **0** (zero); off by default (browsers require a user gesture anyway).

**What's in the ring:**

- **Bus architecture** — ambience / vehicle / foley / music gain buses into a
  master compressor, the standard mix topology (checklist §6).
- **Dialogue ducking** — while a toast "speaks", the ambience and music buses
  step back automatically (checklist §4), driven by the game's own toast timer.
- **HRTF spatial audio** — the Bassline club is a positional 3D emitter: its
  bass **bleeds through the walls** as you walk past, panned binaurally around
  your head, with exponential distance rolloff (checklist §1 + §5 exterior
  music bleed). The listener rides the player every frame.
- **Interior acoustics** — a master lowpass occludes the outside world to a
  muffle the moment you step inside the house, vault, mess, or estate
  (checklist §1 occlusion / §2 interior reverb zones, rendered as filtering).
- **Engine synthesis, not loops** — sawtooth + sub-sine whose pitch and filter
  brightness ride your actual speed (checklist §3's granular RPM idea, done
  with synthesis); hover mode adds a +70 Hz lift to the tone.
- **Dynamic weather audio** — an always-breathing ocean bed (bandpass noise),
  a wind layer that swells in storms, and a rain hiss layer keyed live to the
  storm state (checklist §2).
- **Material footstep system** — steps are scheduled by distance travelled and
  filtered per surface: asphalt (bright), sand (soft low), grass (mid), plus
  stroke splashes while swimming (checklist §2).

**Honest coverage note (the boundary):** the checklist's remaining items are
engine-rung work, deferred deliberately — Dolby Atmos / platform spatial APIs,
ray-traced propagation, licensed radio stations, recorded VO with lip-sync, and
controller haptics don't exist in a single-file browser prototype. **There is no
weapon audio because there are no weapons** — the non-lethal floor holds in the
mix too. Everything shipped is original synthesis; nothing recorded, sampled,
or licensed.

Headless-verified: context starts on the 0-key gesture; engine gain 0 on foot
and rising while driving; occlusion filter drops 18000→480 Hz inside the vault
and reopens outside; rain layer follows the storm state; HRTF panner sits at the
club's coordinates; footstep scheduler accumulates and fires on grass.


## The Generation Leap — Photo Mode, Daily Routines, the Spectacle Director (live in the prototype, v1.17)

The systemic-depth pass: the kind of polish work that separates one open-world
generation from the next. **Boundary note:** the request framed this as "do what
the GTA 6 developers did" — no other studio's tech, code, assets, or design
documents exist to copy, and none were. These are the island's own from-scratch
takes on three open-world *traditions* (photo modes, NPC schedules, ambient
events), which are genre conventions, not anyone's protected expression.

**Photo Mode (key 9).** A free orbit camera around the Don while the world keeps
living — WASD orbits and tilts, Q/E zooms, F cycles six original color lenses
(Clean, Golden Hour, Harbor Noir, Neon Punch, VHS Dub, Dream Wash — CSS filter
grades, no shader work), SPACE fires the shutter with a white-flash beat, 9
exits. The HUD hides itself for the frame; photo mode owns the keyboard while
active (a capture-phase listener, so no accidental carjacking mid-shot). First
frame pays **+15 — THE REEL OPENS**; the shot counter persists in the save.

**Daily Routines.** The island keeps hours now. The day is sliced into
MORNING / DAY / EVENING / NIGHT; each slice retunes the pedestrians' walking
tempo (morning joggers move at 1.6×, the evening lime slows to 0.85×), sends
half the foot traffic home after dark, and staffs the **Bassline night shift**
— an eight-strong dance crowd that appears outside the club only at night,
bobbing to the bass the Soundring is already bleeding through the wall. Slice
changes are announced in patois-inflected toasts.

**The Spectacle Director.** The world stages its own ambient events on a
random cooldown, filtered by what fits the moment: **a dolphin pod** arcs
across the bay (needs water, no storm), **a full rainbow** hangs over the
harbor (daylight, clear skies — a canvas-gradient arc, no new geometry types),
**a meteor watch** streaks the night sky, and **a steel trio** sets up on a
street corner and actually *plays* — sine-pluck pentatonic notes through the
Soundring's foley bus when you're close and the audio is on. First sighting of
each kind pays **+10**. Events tear down after their run and the director rests
90–160 s before the next one, so no two sessions look alike.

Headless-verified: photo mode toggles on 9 with the HUD hidden, orbit/zoom/lens
keys consumed (F cycles the lens instead of exiting to foot), shutter pays +15
and increments the saved counter, CSS grade clears on exit; MORNING sets ped
tempo 1.6 with all 8 out, NIGHT sends 4 home and raises the 8-dancer club
crowd; all four director events spawn (meteors/dolphins/trio forced, dolphins
auto-picked by the scheduler), first-sighting pays +10 atomically; zero page
errors.


## The Five Cores — right core, right work (live in the prototype, v1.18)

A Chromelab garden of five **invented** processor totems arranged in a ring —
each a pedestal with a slow-spinning, glowing chip hovering above it. Walk up
to each on foot and dwell a moment to "read" it (its LED goes teal when
logged):

| Totem | Epithet | What it teaches |
|---|---|---|
| **CORE-G** | The Generalist | runs everything, rushes nothing — the harbor books on it |
| **CORE-P** | The Thousand Hands | massive parallel math — dreams the big models |
| **CORE-M** | The Pocket | sips power, lives in your hand — on-device smarts |
| **CORE-T** | The Tide | tensor currents at scale — the cloud math engine |
| **CORE-D** | The Mover | ships the data so the thinkers can think |

Read all five for **+25 — GRID LITERATE** ("the island computes with
intention"). Completion persists in the save, and restored saves re-light the
LEDs.

- **Boundary:** built from an AI-chip explainer infographic (CPU/GPU/NPU/TPU/
  DPU). Only the *taxonomy idea* — "the right chip for the right workload" —
  was kept, as island education. **No real chip brands, vendors, product names,
  or the explainer's design/art are used**; the totems, names, and epithets are
  original. Educational and civilian — nothing military, consistent with the
  island's tech doctrine.


## The Palaver Table — one question, five voices (live in the prototype, v1.23)

The island's oldest institution gets a table: a round palaver board at a
probed-clear site where **five invented elders** sit — the Practitioner (straw
brim, lives it daily), the Sceptic (thinks the consensus is wrong), the
Economist (follows the money), the Historian (has seen the pattern), and the
Academic (read the studies, book in lap). Walk up on foot and the table takes
your question; the five answer **in turn, each in their own voice** — three
rotating questions ship (building taller, the reef's recovery, what makes a
town rich), so three visits hear the full bank. First completed palaver pays
**+25 — "you heard the whole island think."**

- **Boundary:** built from a reel demonstrating an AI-prompting technique
  (answer as five distinct experts) shown in a real AI product's interface.
  The product's UI and branding are **not** depicted — only the separable
  five-voices idea, rebuilt as island oral tradition with original characters
  and original dialogue.


## The Harbor Derby — playable island football (live in the prototype, v1.24)

The island gets a pitch. On the flat ground east of the strip (a probed-clear
site) there's a full football ground — green turf, painted touchlines, centre
circle, two netted goals, and a live scoreboard on a pole — where **HARBOR
SHARKS** (you) play **REEF RANGERS**. Walk to the centre spot on foot and dwell
a moment to **kick off** a timed match. You play as the Don, on foot: run into
the ball to move it — a gentle touch when you jog, a proper strike when you
sprint — and put it in the Rangers' goal. Their three outfielders chase you
down and a gold-shirted keeper guards the net (beat them with a struck shot,
not a tap); your two team-mates press up to help. Score both ways is live on
the board with a match clock. At full time: **Sharks win +40 first time (+15
after), a draw +10, a loss +5 for the run-out**. Wander off the pitch mid-match
and it's abandoned. The result and your first win persist in the save.

- **Boundary:** the request pointed at FIFA-style open-source repos. **FIFA and
  EA are trademarks** and are used nowhere; the **real-footballer ratings
  datasets were excluded** (real people, Rule Zero); and **no external code was
  merged** — the single-file guarantee holds. Football itself is a sport, not
  anyone's IP: the pitch, both teams, the players, the ball physics, and the
  arcade match logic are all written from scratch for this game.

Headless-verified: dwell kicks off a 100-second match; the on-foot kick drives
the ball toward goal with speed-scaled power; struck shots beat the keeper and
score (ball resets to centre); the undefended end concedes; the ball bounces in
off the touchline; full time pays out by result and increments the play count;
zero page errors.


## The Red Carpet — paparazzi arrival at the Bassline (live in the prototype, v1.31)

Outside the Bassline club, a **red carpet** with a gold-trim runner, a
step-and-repeat "NEON HARBOR" backdrop, velvet-rope stanchions, and a line of
**five photographers** whose camera **flashes pop** — slow when the carpet's
empty, a frenzy when you walk it (a white key light ramps with the flashes).
Walk the carpet on foot and dwell to bank a **COVER SHOT**: first walk **+20**,
and after that the payout **scales with your wardrobe** (dressing up literally
pays — `+10 + wardrobe tier`). Ties the game's fame/clout economy to its
existing wardrobe system. Saved.

- **Boundary:** built from an AI glamour reel (a gown, a night street, flashing
  lights, and a flirty caption). The **suggestive framing, the officer's
  sidearm, and the third-party AI-generated person are all excluded** — only
  the wholesome kernel was kept: *arriving somewhere glamorous with cameras
  flashing.* Original backdrop, carpet, and crowd; no real person, no weapon,
  broad-audience.


## The Bush Lab — botanical discovery & healing research (live in the prototype, v1.42)

The island's **ethnobotany lab**: a green-roofed open pavilion over six raised
beds, each growing one of the island's healing plants — **cerasee, soursop
leaf, ginger root, moringa, guinea hen weed, sea moss** — with a bench of
flasks and a centrifuge where **the elder and the botanist work one table**.
Walk the beds on foot and dwell at each to read it (its LED goes teal); read
all six for **+30 — "BUSH & BENCH."** Saved; restored saves re-light the LEDs.

- **Boundary & tone:** from a "scientists study traditional healing plants"
  carousel. The account's branding is excluded — and so are **overhyped cure
  claims** (the source's "kills 95% of cancer cells" framing is exactly what
  this game won't sell). Every bed note is measured — "brewed for generations;
  the lab is charting why" — and the completion line says it outright: **"no
  miracle claims on this bench; just careful science."** The lab honours the
  real Caribbean bush-medicine tradition with respect, invented characters,
  and original models.


## The Echo Table — how shape steers waves (live in the prototype, v1.47)

A district science exhibit: a dark wave-lab table where an **emitter dish**
sends glowing wave rings at two shapes side by side. At the **FLAT PLATE** lane
the rings hit and **bounce straight back** to the source; at the **FACETED
WEDGE** lane they hit and go **scattering off-axis**, tilting and fading into
nothing. Two labelled fates, running forever. Dwell for **+20** — *"flat gives
the wave straight back; angles send it elsewhere. Shape steers waves."* Saved.

- **Boundary:** from a "science of stealth / why the B-2 doesn't reflect radar"
  explainer. The **B-2 (a real bomber) and the military-stealth framing are
  excluded** — no aircraft appears at all. Only the pure wave physics was kept,
  as an exhibit in the island's science row ("physics, not magic"). On the
  "GTA-6-level graphics" note: the exhibit's glow rings ride the existing
  pipeline — bloom, and the Z-key Adaptive → Max → OVERKILL supersampling tiers.
