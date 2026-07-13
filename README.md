# U.S. Robotic Army — Repo Protocol

**A Machinelearning1954 production.**

A self-contained HTML5 top-down driving game. The mission was **decoded from field
footage** (a 22-minute gameplay video, analyzed scene-by-scene — see
[`docs/VIDEO_DECODE.md`](docs/VIDEO_DECODE.md)) and the tech/lore layer was decoded
from a generation-comparison intel image (budgets, build times, and next-gen feature
list — shown on the boot intel screen and on in-world billboards).

You are **UNIT FRNK-13**, an autonomous U.S. Robotic Army driver moonlighting as a
repo specialist, running **Repo Protocol 02: "I Fought the Law"**.

## Play

Open `game/index.html` in any modern browser — no build step, no dependencies.

```bash
cd game && python3 -m http.server 8080   # or just double-click index.html
```

| Input | Action |
|---|---|
| `W A S D` / arrows | Drive (or walk when on foot) |
| `Space` | Handbrake |
| `E` / `Enter` | Talk / advance dialogue / confirm |
| `M` | Engine sound on/off |
| `R` | Restart from checkpoint (after a fail) / replay (after passing) |

Touch controls appear automatically on phones/tablets.

## Mission flow (decoded from the footage)

1. **On foot** — leave the plaza and get to your car.
2. **Cruise** — head north through the city… and get scripted-pulled-over
   ("62 in a 45, plus a red light").
3. **The meet** — a billionaire and his counsel hire the crew to repo supercars;
   two of the crew dress up as traffic cops.
4. **The bait** — challenge two trust-fund racers at the Route 68 gas station.
5. **The race** — chase them down the Senora Freeway through live traffic
   (watch for the deer — a dynamic world event decoded straight from the footage).
6. **The bust** — the "patrol officers" stop everyone on the bay bridge and
   seize the cars; you swap into the blue one.
7. **The delivery** — bring it to Hayes Auto. **MISSION PASSED**, next contract teased.

## Decoded-image integration

The comparison image (Epoch V: $265M / 5 years vs Epoch VI: $2B / 13 years) appears as:

- the **DECODED INTEL** screen before deployment,
- three **in-world billboards** around the map,
- actual gameplay systems from the "next-gen" feature list: smarter braking/queueing
  traffic AI, a dynamic world event (deer crossing), and day-to-sunset lighting that
  progresses with the mission.

## The in-world sponsor: B.PATTY GLOW

A second decoded source — a 15-second skincare commercial (5 scenes: jar-pop reveal,
application, macro texture, sunlit glow, call-to-action) — was integrated as an
**original in-game brand** named for the creator:

- **Animated billboards** around the map cycle all 5 storyboard frames procedurally,
  each with original taglines.
- **A radio spot** (original copy) plays on the drive to Route 68.
- **Gameplay**: four B.PATTY GLOW jars are placed along the mission routes — drive
  through one and the nano-cream restores 25 hull. Jars collected show up in the
  Mission Passed stats.

All ad art is procedural and all copy is original — nothing is reproduced from the
source commercial.

## MOD TERMINAL — the GTA-V-mods layer

Press **`T`** in any driving phase to open the trainer-style mod menu (an original
homage to the PC modding scene; everything is implemented natively):

| Mod | Effect |
|---|---|
| HULL SHIELD | god mode — chassis takes zero damage |
| NITRO INJECT | +45% top speed, lower drag, pipes stay lit |
| MOON GRAVITY | floaty low-grip drift physics |
| BULLET TIME | the whole world runs at half speed |
| GHOST TRAFFIC | traffic turns intangible (and translucent) |
| CHROME CYCLER | animated rainbow paint job |
| CARJACK PROTOCOL | stop near traffic and press `E` to take the car |
| VEHICLE FORGE | cycle six original spawned vehicles — incl. SUNBURST CUSTOM (silver/yellow customs build) and the SCOOTER BROTHER |
| WARDROBE | cycle unit plating — the decoded closet outfit-changer |

Mission stats mark the run **MODS USED** vs **CLEAN RUN**. There's also a decoded
random event: a starlet hides near Hayes Auto on the delivery leg — stop for her and
sneak her past the paparazzi for a bonus stat.

### Model spawn console (`F8` or `` ` ``)

Type a model code to **replace** your car, or `addon <code>` to spawn a parked copy
beside you — the add-on/replace distinction from the decoded mod-install tutorial.
Codes: `comet`, `zaggero`, `mc13`, `patrol`, `sunburst`, `scooter`… and one hidden
gold machine that only exists as a model code. The **VISUAL V+** mod adds enhanced
warm grading and a vignette (the graphics-enhancement mod from the same tutorial).

### Weather & A/B compare

From a decoded graphics-mods comparison showcase:

- **WEATHER ENGINE** (mod terminal) cycles CLEAR → RAIN → STORM: rain particles,
  wet-road handling (20% less steering grip), and storm lightning with screen flash
  and rumble.
- **A/B COMPARE** renders the showcase's split-screen format live: enhanced grading
  on the left half, stock on the right, with a labeled divider.

## SYSTEM OPTIMIZER — the FPS-tutorial layer

Press **`O`** to open the optimizer (an original take on the decoded
Windows-for-gaming tuning guide). Every tweak genuinely works:

| Setting | Effect |
|---|---|
| GAME MODE | low-detail rendering — no shadows, lit windows, fronds, or sunset grading |
| SOLID DESKTOP | flat ground and still water (no ripple animation) |
| NOTIFICATIONS | toggle SYSTEM popup subtitles |
| FPS COUNTER | real measured framerate in the header |
| CREATE RESTORE POINT | manual quicksave of your run ("chassis are temperamental") |
| SYSTEM RESTORE | load the saved restore point |
| TEMP CLEANUP | purge background traffic processes |
| ULTIMATE PERFORMANCE | the secret plan — flips everything at once |

## Quality

The game ships with a headless Playwright smoke suite that drives **every mission
phase end-to-end** (25 checks, including failure/checkpoint paths and console-error
capture). All bugs found during that pass are documented in
[`docs/BUG_LOG.md`](docs/BUG_LOG.md).

All code and art are original and procedural; dialogue is an original paraphrase of
the decoded scenes.
