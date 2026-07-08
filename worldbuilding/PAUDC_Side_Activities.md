# Side Activities — Module Specification

> **FICTIONAL VIDEO GAME CONTENT.** The downtime/side-activity module for the
> PAUDC/Jamaica island world — the "things to do between missions" layer every
> open-world island needs. Names, venues, and rules below are original PAUDC
> invention; nothing here depicts a real business, league, or venue.

## 1. The four activities

| Activity | PAUDC name | Where | Status |
|---|---|---|---|
| Basketball | **Half Court** | pickup courts in Kingston core and the student districts | spec only |
| Pool / billiards | **Nine Ball** | the back room of island rum bars | spec only |
| Mini-golf | **Duppy Links** — a glow-in-the-dark course themed on island folklore (the same duppy/River Mumma/Anansi vocabulary as YARDCLASH, canon-consistent) | The Strip | spec only |
| Dirt bike racing | **The Mud Run** | a mudflat trail circuit out past the wetland, ridden on the existing NIGHTHAWK bike | **live in the prototype, v0.32** |

Underground cage fighting is **not a new system** — it's already shipped as
**YARDCLASH Beast Night** (`PAUDC_Wildlife_Butcher.md` / game v0.18), our
folklore-transformation take on the same "underground fight club" beat. We
don't duplicate it here.

## 2. Half Court (basketball)

Dwell-based skill check at a hoop prop: hold position in the key, a timing
bar sweeps, tap in the green zone for a make. Streaks pay escalating clout;
missing resets the streak but never fails you out of the activity — an
NPC always racks a fresh ball. Social bed: onlookers heckle/hype per the
NPC culture doc's crowd-reaction rules.

## 3. Nine Ball (pool)

A bar-side minigame: aiming is a two-axis meter (angle + power), sunk balls
pay small clout, a scratch or the eight-ball early ends the rack. Played
seated, first-person — the one activity where the player's ride stays parked
and the camera goes handheld-still, matching the bar's slower dialogue
register (`PAUDC_Dialogue_Voice.md` §1).

## 4. Duppy Links (mini-golf)

Nine glow-course holes threaded through faux-tombstone and river-spirit set
dressing — spooky-fun, never grim (psych-thriller-mode content boundary
applies: no real folklore claimed as literally true, no fear content beyond
theme-park spookiness). Par-based scoring, a leaderboard per hole, cosmetic
ball skins as a clout sink.

## 5. The Mud Run — live in the prototype (v0.32)

The one activity built end-to-end this pass, chosen because it's the
purest showcase of a system we'd already shipped: the surface-grip table
(`PAUDC_Driving_Physics.md` §2 — dirt/scrub grip, loose and
throttle-steerable) and the NIGHTHAWK bike (v0.17's fourth vehicle-ring
entry) had no dedicated reason to leave the asphalt until now.

- **Where:** a six-gate loop circuit around the NIGHTHAWK's parked spot on
  the mudflat, well off the ring road.
- **How it plays:** board the Nighthawk, ride up to the start gate, press
  **B** to go. Six gates in order, no time limit beyond your own best —
  miss a gate and you're still racing, just circling back to find it.
- **Payout:** finish for **+30 clout**; beat your own best time and it pays
  **+60** instead, with the new best banked for next time.
- **Fails soft:** dismount or swap rides mid-run and the attempt quietly
  ends — no penalty, no wasted trip, just try again from the start gate.
- **Why no lap timer HUD yet:** the engine-rung build gets a proper
  leaderboard/ghost-replay; the prototype keeps it to a toast-driven loop
  consistent with every other minigame shipped so far (Croc Wrangler, Low &
  Slow, the fitness sets).

## 6. Content boundary note

All venues, activities, and names above are original PAUDC content. No real
sports league, venue chain, or wagering system is depicted; nothing here
involves real-money gambling — clout is the only stake, same as every other
PAUDC economy loop.
