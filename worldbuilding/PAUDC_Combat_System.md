# Combat & Weapons — Module Specification

> **FICTIONAL VIDEO GAME CONTENT.** The combat module for the PAUDC/Jamaica island
> world. **Canon filters applied to the brief:** every real law-enforcement agency
> it named resolves to the fictional **BII** and its tiers (wanted-system doc) — no
> real force, unit, or tactic is depicted; no real firearm makes or models are named;
> ballistics and AI behavior are specified at *game-feel* level, never as real-world
> procedure. PAUDC's standing identity holds: **less-lethal-forward**, consequences
> over carnage, comedy where it fits, and the non-lethal player floor everywhere.

## 1. Arsenal (the Field Kit, extended)

Builds on the Field Kit loadout canon (systems doc §11) — one kit wheel, hard
choices, no infinite pockets:

- **Hands & melee:** fists (YARDCLASH kit — light/heavy/grapple, live in the
  prototype), baton-class, improvised (bottle, pipe, market produce for comedy
  beats). Weight-based hit reactions; wall/table/ground environmental moves in
  the engine rung.
- **Less-lethal (the PAUDC signature):** **Dazzler puck** *(live in v0.26 — see
  §6)*, stun-net launcher, foam-baton rounds, chaff foil, smoke. The whole BII
  ladder fights with these; so does the smart player.
- **Special-purpose:** tranquilizer darts (wildlife module's licensed capture
  loop), signal flares (storm rescues), the Reef School's line-thrower.
- **Firearms (fictional makes, story-weighted):** civilian-grade pistols, patrol
  long guns for the BII's top tier, and the Weathermen's storm-rated hardware —
  present because the genre and the campaign need stakes, **rare because the
  economy and the ledger make them expensive in every sense.** Black-market
  sourcing is mission content with the risk ladder attached (economy doc §7),
  never a vending machine.

## 2. Ballistics & physics (game-feel level)

Projectile drop and travel time at long range (rewarding lead, not a sniper
sim); material response classes — soft cover (drywall/zinc: suppression, not
safety), hard cover (limestone/brick: safety), glass (dramatic, loud); ricochet
as a *spectacle* probability on metal/stone; recoil as readable per-class
patterns; loud-vs-quiet as a stealth dial (suppressed = "quieter," never
modeled beyond gameplay radius).

## 3. Melee system

The YARDCLASH three-layer kit (strikes / grapple / Riddim super) generalizes to
open-world melee: light/heavy, block, dodge-step, disarm as the counter-reward,
and non-lethal takedowns as the stealth verb. Beast Night transformations stay
ring-only (canon).

## 4. Player abilities

Hip-fire vs aimed modes, sprint-slide-vault traversal, contextual cover
(low walls, market stalls, vehicle bodies), quick-draw contest in BII
stop-standoffs (a timing minigame that *ends non-lethally either way* — the
ledger, not the morgue), and the Dazzler as the panic button.

## 5. AI combat behavior

- **Civilians:** panic → flee → hide → call the BII (NPC-culture reaction
  states; already the vendor rule in the economy doc).
- **Weathermen (fictional faction):** cover use, flank attempts, retreat when
  cut off, surrender when overwhelmed — surrendered enemies are mission
  currency (intel, ledger credit), rewarding restraint.
- **BII ladder (wanted doc):** less-lethal priority at every tier below the
  campaign's scripted peaks; negotiation attempts before escalation; the
  five-star response stays the courtesy-satire (cones, not carnage).
- All combat AI runs the same perception/stamina/grip systems as the rest of
  the world — no cheating aimbots; difficulty comes from numbers and terrain.

## 6. Damage modeling (non-lethal floor)

- **Player:** regional damage as *impairment* (limp, aim sway), never gore; the
  fail state is the canon "come to" (harbor/med bay) — time and clout, not death
  screens. Armor absorbs; the med bay lectures.
- **NPCs:** stylized reactions, no dismemberment, no cruelty verbs; downed
  enemies are out, not dead-on-screen.
- **Vehicles:** the driving-physics doc's damage spec (tires, cooling, steering
  bias, limp mode) plus glass and panel deformation for drama.
- **Environment:** breakable props (market stalls regrow next morning — with a
  vendor grudge and a ledger entry), explosive barrels only in scripted set
  pieces, fragile neon that fizzles beautifully.

## 7. Playable now (v0.26)

The **Dazzler puck** — the Field Kit's stun-dazzle thrown tool — is live: press
**`G`** with a threat active and the puck arcs at it. Dazzle the **Courtesy
Interceptor** mid-pursuit and it sits blinking for four seconds (lights on,
wheels off) — the escape window. Dazzle the **Yard challenger** and his wind-up
resets for three. Eight-second cooldown, 45 m range, non-lethal to its core.

**The Dragonfly Swarm — live in v0.53.** The Don's own build, straight out of his
robotics-vet backstory (`PAUDC_Character_Bible.md` §2.0): press **`K`** on foot to
launch a swarm of fictional micro-drones that orbit him for six seconds. It's a
hands-free **area** version of the Dazzler — while aloft it keeps a nearby
Courtesy Interceptor or Yard challenger dazzled and scatters bystanders clear —
and it is emphatically **non-lethal**: it dazzles and disperses, never harms, in
keeping with the game's no-kill floor. Sixteen-second cooldown; first deploy
unlocks it for +20 clout. No real drone, swarm doctrine, or hardware is depicted —
it's stylized island tech, courtesy-first even when it comes in numbers.

**The Dragonfin ROV — live in v0.62.** The other half of the Don's robotics kit: a
little marine drone. On foot, press **`L`** and the Dragonfin auto-pilots out to the
nearest un-logged shipwreck, **scouts it** (logs its coordinates, marks the gold
glint, +15 clout), and returns to the case on an 8-second cooldown. It's the
recon companion to the Wreck Dive loop (`PAUDC_Game_Systems.md` — salvage) —
find wrecks the easy way with the ROV, then dive them yourself. Original
fictional hardware; no real drone or ROV is depicted.

## 8. Hooks

Tactical rescue (storm + flare), Weathermen takedown chains (campaign acts 2–3),
undercover buys (black-market risk ladder), the de-escalation missions (talking
a fight *down* pays more Standing than winning it), tranquilizer wildlife work,
and BII training sims at the Crucible (combat tutorial diegetically).

> All fictional; violence is gameplay with consequences, never glorified — the
> package's tone rule (cinematic, playful, power fantasy with a conscience)
> governs every line above.


## The Dazzler Range — non-lethal target practice (live in the prototype, v0.78)

The "shooting range" beat, kept firmly inside the non-lethal floor: a covered
firing line downrange of **five pop-up target boards** (bullseyes, not people).
Stand at the line on foot and press **G** to dazzle the nearest standing target;
knock down all five to clear the round and score (**+6 clout per target hit**, a
"best" is tracked; a perfect 5/5 is called out). Targets reset up for the next run.

- **No guns, no enemies, no kills** — you're dazzling *boards* with the Field Kit's
  existing less-lethal Dazzler, the same tool that stuns the Courtesy Interceptor.
  It's reflex-scoring target practice, the arcade-range fun without the violence.
- **Origin:** built from an AI-game-dev post whose demo clip was a first-person
  *shooter*; PAUDC does not do firearms, so only the "target arena" idea was kept
  and rebuilt non-lethal. No real weapon, and the 3D/physics/interaction
  "capabilities" the post advertised are things the prototype already ships.


## The Beam Gate — non-lethal light-beam agility drill (live, v1.00)

An agility course on the compound flats: a rubber lane between two posts, a green
start pad and a gold finish pad, and **eight light-beams** strung across it. Arm
it at the green pad (**E**) and thread the grid — each armed beam **blinks dark
for half a second** of every cycle; press **E** in that dark window to phase it
(the beam turns green), mistime it and you **trip**. A trip just **resets the
grid — no harm, no alarm, no scratch**; wait for the dark and go again. Clear all
eight for **+25 (+35 graded)**; your best run is tracked.

- **Boundary:** built from a border-infiltration image — a real national border
  fence with its flag, laser tripwires, and a masked intruder mid-break-in. The
  real border, the flag, the intruder, and the whole break-in framing are **out**
  (no real places, no real security systems, no crime-against-a-real-site).
  Only the thread-the-laser-grid *game beat* — the heist-room classic — was kept,
  rebuilt as courtesy-first reflex sport with a no-penalty trip, fully inside the
  non-lethal floor.
