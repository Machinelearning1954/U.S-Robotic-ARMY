# Field Footage Decode — Mission Source

The source video (a ~22:50 gameplay recording) was analyzed scene-by-scene with an
automated video-analysis pipeline (53 scenes decoded). The table below summarizes each
beat **in our own words** and maps it to the phase of the game that implements it.
Dialogue in the game is an original paraphrase — no lines are reproduced verbatim.

| Scenes | Time | What happens in the footage | Game phase |
|---|---|---|---|
| 1–4 | 0:00–0:17 | Protagonist stands in a sunlit city plaza under a pergola, looking around; skyscrapers and palm trees in the background. | `WALK` — on-foot start at the plaza |
| 5–9 | 0:17–1:04 | He walks along a busy multi-lane street past rows of parked luxury cars. | `WALK` — parked cars line the curb |
| 10–12 | 1:04–1:24 | He gets into a silver sports car, starts it, and revs it hard — flames burst from the exhaust. | `CRUISE` — silver car; revving at standstill shoots exhaust flames |
| 13–14 | 1:24–2:09 | High-speed weaving through city traffic and intersections. | `CRUISE` — free driving with live traffic |
| 15–17 | 2:09–3:25 | A police SUV gives chase with sirens; slowed by traffic, the driver pulls over on a bridge road. | `PULLOVER` — scripted pursuit; stop to proceed |
| 18 | 3:25–4:13 | The officer cites him for doing 62 in a 45 zone and running a red light, and lets him off with a warning. | `PULLOVER_TALK` — paraphrased citation dialogue |
| 19–25 | 4:13–6:18 | At a lot full of supercars he meets a rich mogul and his corporate counsel; the crew is hired to "repossess" cars from the mogul's wealthy acquaintances for overseas buyers; two crew members will pose as traffic cops; a take-it-or-leave-it speech closes the deal. | `MEET_DRIVE` / `MEET_TALK` — supercar lot + briefing |
| 26–29 | 6:18–8:27 | Long high-speed drive out of the city in a red exotic, through interchanges toward the highway. | `GAS_DRIVE` — route to Route 68 |
| 30–31 | 8:27–9:36 | Phone coordination with the disguised crew; arrival at a gas station where two exotic cars are refueling. | `GAS_DRIVE` arrival — orange & white targets at the pumps |
| 32 | 9:36–9:41 | The protagonist goads the two owners into a street race. | `GAS_TALK` — challenge dialogue |
| 33–35 | 9:41–11:38 | The three cars launch and race down the freeway, crossing a large bridge, weaving through traffic. | `COUNTDOWN` + `RACE` |
| 36–38 | 11:38–13:33 | The two disguised "patrol officers" on police bikes join the pursuit; radio chatter about keeping up and letting traffic slow the targets. | `RACE` — timed radio chatter |
| 39 | 13:33–14:17 | A deer leaps across the road mid-pursuit; the targets finally slow near a coastal bridge. | `RACE` — deer dynamic-world event; targets stop on the bay bridge |
| 40–42 | 14:17–15:17 | The fake highway patrol stops everyone on the bridge, orders the owners out, and takes the cars. | `BUST` — bridge bust cutscene |
| 43–49 | 15:17–20:25 | The protagonist drives off in the blue exotic, coordinating (and trash-talking) over the phone on the long run back to the city at sunset. | `DELIVER` — blue car swap; sunset lighting |
| 50–52 | 20:25–21:55 | All cars are delivered to an auto shop; the mogul withholds full payment ("the order was five cars"), and the counsel briefs the next job: a rare Z-Type hidden in a lockup. | `DELIVER_TALK` — payment scene + next-contract tease |
| 53 | 21:55–22:50 | A big "Mission Passed" graphic ends the sequence. | `PASSED` — mission-passed screen with stats |

## Second footage decode — the sponsor commercial

A second source video (a ~15-second product commercial, 5 scenes decoded) supplied the
game's in-world sponsor. It was rebuilt as an **original brand** — "B.PATTY GLOW", named
for the project's creator — with new procedural art and original copy throughout.

| Scene | Time | What happens in the footage | Where it lives in the game |
|---|---|---|---|
| 1 | 0:00–0:02 | Hands unscrew a frosted glass jar with a gold lid, revealing a whipped white cream. | Billboard frame 1 ("jar pop") + the jar-pickup model |
| 2 | 0:02–0:06 | A woman applies the cream to her cheek in a bright bathroom while a voiceover praises how light it feels. | Billboard frame 2 + radio-spot line 1 (original copy) |
| 3 | 0:06–0:09 | Macro speed-ramp shot of the airy cream texture with soft peaks. | Billboard frame 3 (procedural dollop) |
| 4 | 0:09–0:13 | Sunlit shot showing a healthy glow on her skin; the voiceover says it lasts all afternoon. | Billboard frame 4 (radiating glow) |
| 5 | 0:13–0:15 | Product beauty shot beside a glass of water and a flower; a sale call-to-action closes. | Billboard frame 5 + radio-spot line 2 |

Gameplay integration: four B.PATTY GLOW jars sit on the mission routes; driving through
one restores 25 hull ("nano-cream finish"). Collected jars are tallied on the
Mission Passed screen.

## Third decode — the mods request (two source videos)

Two more sources drove the MOD TERMINAL feature set. As always the table paraphrases
the footage in our own words, and everything in the game is an original re-creation.

**Source A — a story-mode walkthrough segment ("Part 19")**, decoded in 16 scenes:
a character wakes in a mansion, cycles outfits in a walk-in closet via an on-screen
menu, gags on a green health juice, then takes a black-and-orange supercar through
city traffic; later a starlet hiding in an alley asks for a ride to escape the
paparazzi.

| Decoded beat | In the game |
|---|---|
| Closet outfit-changer menu | WARDROBE row in the MOD TERMINAL (4 platings) |
| Supercar morning drive | VEHICLE FORGE presets |
| Starlet asking for a ride past the paparazzi | Random event on the delivery leg — stop for her near Hayes Auto, drop her at the shop (Mission Passed stat) |

**Source B — a free-roam chaos/mods showcase**, decoded in 16 scenes: repeated
car-jacking (sedan, police SUV, sports car), a rampage sequence, a comedic scooter
chase, and a customs-shop scene where a silver car gets a yellow secondary paint job
and new wheels.

| Decoded beat | In the game |
|---|---|
| Car-jacking loop | CARJACK PROTOCOL mod (E near stopped traffic) |
| Customs shop: silver + yellow livery | SUNBURST CUSTOM forge preset (stripe color support) |
| Scooter chase | SCOOTER BROTHER forge preset (tiny, slow, glorious) |
| Rampage/weapons sequence | Deliberately not integrated — outside this game's tone; noted for completeness |

The trainer-menu concept itself (toggleable script mods: god mode, nitro, moon
gravity, slow motion, ghost traffic, paint cycler) is the game's original homage to
the PC modding scene.

## Fourth decode — the FPS-optimization tutorial

A ~9-minute Windows-for-gaming tuning walkthrough, decoded in 42 scenes: create a
system restore point first; display tweaks (HDR off, native resolution, max refresh
rate); notifications off; storage cleanup; Bluetooth off; pointer-precision off;
Ethernet over Wi-Fi; minimal themes and a solid-color background; uninstalling and
de-starting unused apps; Game Mode on; hardware-accelerated GPU scheduling; per-app
graphics priorities; security and update tweaks; the "Ultimate Performance" power
plan unlocked from a terminal command; hardware acceleration off in background apps;
%temp% cleanup; and "adjust for best performance" visual effects.

It became the in-game **SYSTEM OPTIMIZER** (`O`) — each decoded tip re-created as a
working, game-native setting:

| Decoded tip | In the game |
|---|---|
| Create a restore point before touching anything | CREATE RESTORE POINT / SYSTEM RESTORE — a real quicksave/load |
| Game Mode + "best performance" visual effects | GAME MODE — actual low-detail render path |
| Solid-color desktop background | SOLID DESKTOP — flat ground, still water |
| Turn off notifications | NOTIFICATIONS toggle (mutes SYSTEM popups) |
| The tutorial's FPS promise | FPS COUNTER — real measured framerate |
| %temp% folder cleanup | TEMP CLEANUP — purges background traffic entities |
| Secret "Ultimate Performance" power plan | ULTIMATE PERFORMANCE — one action flips every setting |

## Fifth decode — the mod-installation tutorial

A ~8-minute "how to install PC mods" walkthrough, decoded in 39 scenes: browsing a
mod site's categories, the difference between add-on, replace, and package-installer
mod types; installing a mod manager tool and creating a `mods` folder; registering a
new vehicle in the game's DLC list file; installing a script-hook library and a
trainer; a graphics-enhancement mod; spawning the new car in-game by typing its model
code into the trainer's spawner; and a caution to keep modded installs offline.

Integrated as the game's **mod-loader layer** (all original):

| Decoded beat | In the game |
|---|---|
| Trainer spawner: type a model code | `F8` MODEL SPAWNER console with typed codes |
| Add-on vs replace install types | `addon <code>` parks a copy; bare code replaces your car |
| The "580" car folder + gold intro car | Hidden AURUM 580 preset, spawnable only by model code |
| Unknown/wrong folder names failing | Unknown codes rejected: "model not found in dlclist" |
| Graphics-enhancement mod | VISUAL V+ mod: warm grade + vignette |
| Keep mods offline caution | MODS USED vs CLEAN RUN stat (already tracked) |

## Sixth decode — the graphics-mods A/B showcase

A ~15-minute side-by-side comparison of two rival graphics enhancement mods, decoded
in 24 scenes: split-screen shots of night rain reflections, neon-lit streets, light
bloom, draw distance, dusk sky transitions, wet tunnels, burnout smoke particles,
thunderstorm lightning, underwater visuals, road textures, and foliage density.

| Decoded beat | In the game |
|---|---|
| The split-screen A/B format itself | A/B COMPARE mod: enhanced grading left, stock right, labeled divider |
| Rain, wet asphalt, reflections | WEATHER ENGINE: RAIN — particles, wet tint, 20% less steering grip |
| Thunderstorm with lightning flashes | WEATHER ENGINE: STORM — heavier rain, lightning flash + screen rumble |
| Grading/bloom differences | Reuses and showcases the VISUAL V+ grade in the split view |

## Second image decode — the safehouse infographic

A fan infographic about a next-gen title's safehouse system, split into confirmed
facts (the two leads use places throughout the story; multiple interiors such as
homes, motel rooms, and apartments; the system's workings unannounced) versus rumors
(purchasable safehouses across the map, customization, properties unlocking unique
gameplay benefits or businesses, more properties unlocking as the story progresses,
a shared main home).

Integrated as the game's original **district & property layer**, with districts named
per the project owner's brief:

| Decoded beat | In the game |
|---|---|
| Confirmed vs rumored framing | Unowned safehouses read RUMORED; purchasing flips them to CONFIRMED |
| Purchasable safehouses across the map | Three properties: Kingston Villa (Little Jamaica), Spring Manor (Silver Springs), Old Town Rowhouse (Alexandria) |
| Properties unlock unique gameplay benefits | Real perks: +5% top speed, halved wet-grip penalty, +$500 delivery bonus |
| Places used throughout the story | Owned safehouses offer rest: full repair + automatic restore point |
| More properties as the story progresses | A cash economy earned across mission beats gates the purchases |

## Image intel decode

A second source (a social-media comparison image) provided the tech/lore layer:

| Fact from image | Where it appears in the game |
|---|---|
| Generation V: budget $265,000,000, 5 years (2013–2018) | Intel screen, "Epoch V" billboard |
| Generation VI: budget $2,000,000,000, 13 years (2023–2026) | Intel screen, "Epoch VI" billboard |
| Advanced AI — smarter traffic, realistic behavior | Traffic cars queue/brake for obstacles; racers rubber-band |
| Dynamic world — real-time events | Deer crossing event mid-race |
| Next-gen graphics — visuals & lighting | Day-to-sunset lighting progression + lit building windows |
| Immersive experience — deeper story | Full decoded mission arc with dialogue and checkpoints |
