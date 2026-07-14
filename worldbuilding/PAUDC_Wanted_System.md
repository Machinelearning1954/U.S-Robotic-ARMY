# The Wanted System — BII Watch Level & Pursuit

> **FICTIONAL VIDEO GAME CONTENT.** The island-wide police/wanted design for the
> PAUDC universe. The enforcing body is the **BII (Bureau of Island Integrity)** — an
> invented, satirical courtesy-first force established in the systems doc (§5 Watch
> Level, §12 Infraction Ledger). **No real police force, unit, tactic, or procedure
> is depicted; everything here is invented and tuned for comedy-forward, non-lethal
> play.** This doc unifies the existing pieces and adds the pursuit ladder.

## Design pillars

1. **Non-lethal, always.** PAUDC's power-fantasy floor applies to the law too: no
   death screens, no kill squads. Getting caught costs time, clout, and dignity.
2. **Courtesy-first satire.** The BII's whole voice is polite menace: infractions
   are "invitations," arrests are "words being had," the SWAT-equivalent is a
   *very* insistent customer-service department.
3. **The chase is the content.** Stars exist to produce great chases and great
   OnWatch clips — the system feeds the clout economy on both ends (fleeing pays
   filmable moments; getting stopped costs clout).

## The five-star ladder (island-wide)

| Stars | Name | What happens |
|---|---|---|
| ★ | **Noted** | A courtesy note on the ledger. Nothing visible; decays fast. |
| ★★ | **Observed** | A patrol shadows you at distance — visible on the radar, never engages. Prices tick up at BII-adjacent vendors. |
| ★★★ | **Invited** | *(Live in the prototype, v0.23.)* The **Courtesy Interceptor** is dispatched — teal-striped cruiser, flashing bar, radar blip. It pursues; linger slow near it and you're **courtesy-stopped**: ledger cleared, −15 clout, released on the spot. Outrun it (real distance, sustained) and stars cool to ★★. |
| ★★★★ | **Escorted** | Two interceptors run a pincer; route-taxi NPCs pull over ahead of you (civilian traffic parts, telegraphing the pincer's path). Roadside spike *cones* (satire: literal traffic cones that only work if you drive over them slowly). |
| ★★★★★ | **The Full Apology** | The storm-rated interceptor (works at sea), a spotter drone with a spotlight cone, and roadblocks at ring-road chokepoints. Reserved for mission crescendos; still non-lethal — the fail state is the island's most elaborate courtesy stop. |

## How stars rise and fall

- **Rise:** the Infraction Ledger (systems doc §12) — donuts ("Excessive Style,
  Vehicular"), creative parking, unlicensed regattas, declining invitations, and
  mission-specific infractions.
- **Fall:** time (60s per star), **twice as fast with IRIE** (Green Cross buff),
  frozen during an active pursuit, instant-cleared by a courtesy stop, cooled to
  ★★ by a clean escape.
- **Fame is heat** (OnWatch §4): higher clout tiers accelerate star gain — everyone
  recognizes you, including the BII.

## Pursuit AI (engine mapping)

- **Interceptor behavior:** pursue → maintain-contact → stop-attempt loop; road-
  snapped where possible, amphibious-but-grudging in water (7 m/s vs 29 on land, so
  the sea is a genuine escape valve — canon: the Mudfish always wins the harbor).
- **Escape logic:** sustained true distance (70 m for 12 s at ★★★; tighter at higher
  tiers), or line-of-sight breaks in Cockpit-Country-class terrain (engine rung).
- **Catch logic:** proximity + low speed, held briefly — surrender is always a
  *choice the player makes by slowing down*, which keeps stops feeling fair.
- Prototype implementation is the ★★★ tier end-to-end (dispatch → chase → radar
  blip → stop/escape); ★★★★/★★★★★ ship with the engine rung's traffic control.

## Consequences table

| Outcome | Cost | Canon flavor |
|---|---|---|
| Courtesy stop | ledger cleared, −15 clout, a moment of your time | "Words were had." |
| Clean escape | stars → ★★, cooldown restarts | the clip usually earns more than the fine would've cost |
| Mission arrest (story) | scripted only | the BII interview room has excellent coffee and worse small talk |

> All fictional. The BII, its interceptors, and every procedure above are invented
> for a comedy-forward game; nothing depicts real law enforcement.

---

## Vault Drag — the signature heist chase

*A set-piece mission built at The Vault (base design doc, canon location), pairing
directly with the Courtesy Interceptor above. Original take on the classic
"drag the score, outrun the law" heist beat — our own MacGuffin, our own island,
our own chase.*

### The loop
1. **Hook it.** Pull up slow beside the crate at The Vault and press `H`. The
   moment it's hooked, the BII is notified — an automatic ★★★ dispatch, same
   Courtesy Interceptor as any other pursuit.
2. **Haul it.** The crate trails your ride on a visible chain. Top speed drops
   (~38%) while hauling — every vehicle in the ring becomes a heavier, more
   deliberate drive, and cornering matters more than raw horsepower.
3. **Outrun it.** Standard pursuit rules apply (wanted-system doc above): the
   amphibious escape valve still works, the Dazzler still stuns the interceptor.
   Get caught (a courtesy stop) and the crate is seized on the spot — mission
   busted, ledger cleared, try again after cooldown.
4. **Drop it.** Reach Pelican Key — the far side of the island, deliberately the
   longest possible haul — and the crate releases clean: a big clout payout and
   a 90-second cooldown before the crate resets at the Vault for the next run.

### Why Pelican Key
The Vault sits deep in the island's interior; Pelican Key is the opposite shore.
The full-island crossing *while towing and while wanted* is the point — every
surface, every district, the day/night cycle, and the storm lader all factor
into a single drag run, making it the game's best showcase of everything else
in this document working together at once.

> All fictional: the crate, the Vault, and the getaway are original PAUDC
> content — no real heist, vehicle, or location is depicted.

## BII Scene Response — forensics process what you caused (live in the prototype, v0.57)

The "the law investigates the scenes *you* caused" beat, reframed to the game's
non-lethal, courtesy-first floor. When the Don **flags a ride** (`J`, the
Flag-a-Ride mechanic), the BII treats it as an incident and dispatches a
**forensics team** to the exact spot:

- **What appears:** a taped-off cordon (courtesy tape), three numbered
  **evidence markers**, and two BII investigators who work the scene — one
  photographs, both bob over their clipboards. It's the CSI-processing tableau,
  played for gentle satire: the "evidence" is a dropped domino, not a body.
- **It processes and files:** left alone, the team works the scene for ~12
  seconds and then clears — *"photographed, bagged, filed. Ledger, not the
  morgue."* First time you trigger one, +10 clout for discovering the system.
- **Disturb it and the clock resets:** drive back through the cordon at speed
  and the investigators have to start over — a small, comic consequence, never
  a pursuit escalation on its own.
- **Why non-lethal:** the reference for this feature was a violent crime-scene
  mock-up; PAUDC keeps the *mechanic* (the law forensically reacting to your
  mess) and drops the gore entirely. No body, no blood, no death — consistent
  with the whole wanted system's floor. **No real agency, forensic procedure,
  or method is depicted** — the BII is the invented Bureau of Island Integrity,
  and "processing" here is set-dressing and comedy, not a real technique.
