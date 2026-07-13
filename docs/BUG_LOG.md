# Bug Decode Log

Every bug found while building and verifying the game, and how each was fixed.
Verification = `node --check` + a headless Playwright smoke suite (25 checks) that
drives every mission phase end-to-end, exercises failure/checkpoint paths, and fails
on any browser console or page error.

## Found and fixed

| # | Severity | Bug | Fix |
|---|---|---|---|
| 1 | **Critical — softlock** | Failing during the race and restoring the checkpoint re-entered `RACE` with the racer array cleared, so `updateRacers()` no-oped forever and the mission could never be completed. | `restoreCheckpoint()` now detects a `RACE` checkpoint, respawns the two targets at the grid, and re-enters `COUNTDOWN`. Covered by a dedicated regression check ("race restore -> countdown with grid"). |
| 2 | **Critical — crash** | A leftover `void inCutscene;` statement referenced a variable deleted during refactoring — a `ReferenceError` thrown on every `update()` tick. | Statement removed; caught by grep sweep and the console-error check in the smoke suite. |
| 3 | Medium — visual/logic | The starting player car was parked inside an Alta Ave traffic lane; during the on-foot phase, ambient traffic drove straight through it (traffic only checks the player car when the player is driving). | Start car moved to the plaza curb, off all traffic lanes. |
| 4 | Medium — fidelity | The meet lot had no parked supercars (decoded scenes 19–25 show a supercar lineup), and the player could drive through the space they should occupy. | Added static `PARKED` scenery cars (meet-lot lineup + Alta curb cars) that render and collide with the player. |
| 5 | Low — dead code | `updateWalker()` called `resolveSolids()` on a spread-copy of the walker, so the collision resolution mutated a discarded object (pure no-op). | Call removed; the explicit building/water push-out below it is the real collision path. |
| 6 | Low — perf | The `WALK` objective allocated a fresh `{x, y}` target object every frame even though the target (the parked car) never moves. | Target set once when the phase is entered. |
| 7 | Low — dead code | Unused `dist2` helper. | Removed. |

## Sponsor-integration pass (B.PATTY GLOW)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 8 | Medium — visual | Palm trees were drawn after billboard panels, so fronds rendered on top of the sponsor ad art (caught in a render screenshot). | Palms now draw before both billboard layers; re-screenshotted clean. |

Suite grew to 27 checks: sponsor radio spot fires during the Route 68 drive, and a
glow-jar pickup verifiably repairs the hull (60 → 35 damage).

## MOD TERMINAL pass

| # | Severity | Bug | Fix |
|---|---|---|---|
| 9 | Medium — logic | Disabling CHROME CYCLER restored `baseColor`, but `makeCar()` never initialized it — the "restore" kept the rainbow paint forever on a stock car. | `makeCar()` now sets `baseColor` alongside `color`. Regression check: chrome off returns a non-hsl color. |
| 10 | Medium — design/logic | NITRO INJECT raised the speed *cap* to ~900 but drag physics set terminal velocity at ~628 — the mod was nearly a no-op. | Nitro now also cuts drag 30%; terminal ≈ 770. Regression check: top speed must exceed stock 640. |
| 11 | Low — test design | Mod checks ran during `CRUISE`, where the scripted pull-over hijacks the phase and its dialog consumed the `E` press, silently breaking the carjack check. | Mod tests run in `MEET_DRIVE`; nitro run wraps in GHOST TRAFFIC so collisions don't cap the measurement. |
| 12 | Cosmetic | MOD TERMINAL hint line clipped at the panel edge. | Shortened the hint text. |

Suite is now 41 checks: menu open/close, all seven script mods (god, nitro, bullet
time, ghost, chrome on/off restore, carjack, moon implicitly via physics paths),
vehicle forge, wardrobe, and the starlet random event (pickup + rescue stat).

## Verified clean

- All 25 smoke checks pass: boot → intel → walk → cruise → pull-over → meet →
  gas → countdown → race → bust (car swap) → deliver → mission passed, plus
  vehicle-destroyed failure, checkpoint restore, water hazard failure, and the
  race-restart regression.
- Zero console/page errors across boot, all phases, and a long idle render
  (minimap, billboards, deer, sunset overlay all exercised).
- `node --check` clean; no unused/undefined identifiers left (grep-swept).
