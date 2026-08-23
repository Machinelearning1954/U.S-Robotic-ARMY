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

### 4a. The domino table — "dominoes & deals" (live in the prototype, v0.58)

Duppy Links now exists in the prototype as a green with flag pins and a
**dominoes pavilion** — the country-club-satire beat where the island's
business gets done over a slammed bone tile. Walk up on foot, stand at the
table, and the old heads talk hustle: **LLCs, business grants, tax breaks**,
all delivered as Patois table-banter. Hold the table a few seconds and you're
"in the domino circle" — a one-time **+35 networking clout**; the banter lines
keep rotating while you linger.

- **It's comedy, not counsel.** Every line is a joke about island entrepreneurial
  hustle ("register di LLC before yuh even have di idea"; "grant season come like
  mango season"). **None of it is real financial, tax, or legal advice, and no
  real program, agency, form, or firm is named** — it's character flavor in the
  open-world-satire tradition, and it stays generic on purpose.
- **Why the golf course:** the "deals happen on the back nine / at the club"
  trope, reframed to the island's own domino-table culture (the same dominoes
  the dockworkers play in `PAUDC_Base_Design.md`) instead of an imported
  country-club aesthetic — courtesy-first, warm, and ours.

### 4b. The Bone Yard — playable dominoes (live in the prototype, v0.60)

The deal-table is now a real minigame. Stand at the Duppy Links table on foot
and press **O** to sit down for a hand of **The Bone Yard** — a shed-race
domino match against the table:

- **How it plays:** you and the house each start with four bones. A HUD shows
  the **open end** and your hand; press **1–4** to play a tile whose pip
  matches the open end (playing it flips the open end to the tile's other
  pip), or **X** to draw a bone from the yard when you're stuck. First to
  empty their hand wins.
- **Stakes:** win the hand for **+50 clout**; lose and you still pocket **+5**
  for showing up — run it back as often as you like. A skill-and-luck loop, not
  a dwell timer, so it rewards actually reading your tiles.
- **Boundary:** standard dominoes, the island's own game — no real venue,
  brand, or gambling service depicted; "clout" is the game's own social
  currency, not money, and there's no wagering of real or in-world cash.

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

## 6. Wreck Dive — live in the prototype (v0.38)

Three sunken-ship sites scattered in the island's open water, each with a
half-buried hull and a glint of gold visible from the surface. Swim out on
foot (on foot in deep water reads as swimming, per the existing surface
model), hold position over the wreck for a few seconds, and the chest comes
up — **+45 clout**, one-time per wreck, the gold glint gone once it's
found. No depth gauge or oxygen meter yet — the prototype's water model is
surface-only, so "diving" is presence-based (hold your position over the
wreck) rather than a true submersion mechanic; the engine rung can add
real vertical diving, a breath meter, and current/visibility effects once
the water column is a real 3D space rather than a 2D surface flag.

## 7. Content boundary note

All venues, activities, and names above are original PAUDC content. No real
sports league, venue chain, or wagering system is depicted; nothing here
involves real-money gambling — clout is the only stake, same as every other
PAUDC economy loop.


## 8. The Lido — pool club (live in the prototype, v0.70)

The "chill by the pool" hangout beat, built original: a poolside lounge deck
with a swimming pool, striped umbrellas, loungers, a juice bar, and a couple of
relaxing NPCs. Walk in on foot and hold a beat to cool off for a one-time **+30**
("cocktail in hand, island living"). A calm counterpoint to the Bassline
dancefloor and the Mud Run — the game's leisure register.

- **Boundary:** the reference was a GTA screenshot featuring a **Rockstar
  character** (declined per Rule Zero — no copied characters or assets); only the
  generic poolside-lounge *vibe* was kept and rebuilt from scratch. Every mesh,
  NPC, and prop here is original. No real venue, brand, or person depicted.

## Beach Volley — a playable sand rally (live in the prototype, v1.64)

A sand court on the south beach (**210, -115**): lined boundaries, two timber posts and
a net, a ball, and an opponent who plays you honestly.

- **How it plays:** walk up and the opponent **serves** to you. **Run into the ball**
  while it's low on your side and you bump it up and over the net — harder if you're
  moving fast. The opponent tracks the ball's line and **returns anything on their
  side**. The **net physically blocks** a shot driven flat into it. Every crossing adds
  to the **rally**; the rally ends when the ball lands, in or out, and the ball hides
  until the next serve.
- **Rewards:** first rally **+15** (one-shot), and **+10** each time you beat your
  **best rally** (best and plays are saved). Non-lethal by nature — the worst thing
  that happens is the ball lands in the sand.
- **Boundary:** the reference was a fan infographic for a big commercial game — its
  **branding, logo, characters and city are all excluded** (Rule Zero). The list was
  useful only as a **gap analysis**, and that audit was blunt: swimming, free-diving,
  jet skis, boating, beach crowds, coastal wildlife, photo/"social" capture, the surf
  drill and football were **already in this game**. The single real hole was interactive
  beach **sport**, so that is what was built — original court, ball physics and
  opponent, all from primitives. Generic sports are not anyone's IP; that game's
  presentation is, and none of it is reproduced.

## The Wrist Scout — a launched drone with a live holo feed (live in the prototype, v1.68)

Press **J** on foot and a small quad lifts off your cuff; a **holographic panel** unfolds at
your shoulder showing what it can see. Press **J** again to recall it (it also comes home on
its own after 45s). First launch **+15**, saved.

- **The feed is genuinely live.** It sweeps out ahead of you, then holds a slow orbit at
  ~14 m above the ground, and the panel redraws ~7×/s from the **actual terrain** around the
  drone — water, sand, greenery and high ground sampled from the real heightfield — with live
  markers for you and for moving traffic, plus altitude readout and scanlines.
- **Why it's drawn rather than rendered:** this build exports no `WebGLRenderTarget`, so a
  true second-camera render-to-texture is impossible. Rather than fake a "camera" with a
  static image, the panel reports real world data honestly. (On `claude/engine-pbr-upgrade`
  a true render target *is* available, if you ever want an actual optical feed.)
- **Surveillance doctrine, held.** The island watches *with* you, never *at* you. The feed
  shows **ground, your own position, and anonymous motion dots** — it identifies no one and
  tracks no person. The device says so on its own screen: **"NO ID · TERRAIN ONLY."**
- **Boundary:** the reference reel named a real phone brand in its caption — excluded. The
  drone, panel and UI are original, built from primitives and drawn at runtime.

## The Wash Bay — your ride gets dirty, and you clean it (live in the prototype, v1.71)

A drive-through wash on the flats (**130, 90**): a concrete pad, two posts, a green arch of
spray jets, and foam that boils up around a car being cleaned.

- **Grime is a real state, not a prop.** Drive and your paint dulls — fastest through
  **sand** (0.030/s), slower through **bush** (0.020/s), barely at all on **asphalt**
  (0.005/s), and open **water rinses it off** (−0.020/s). It scales with speed. Dirt is
  tracked **per vehicle**, so the car you thrash on the beach is filthy while the one in the
  garage stays clean.
- **It genuinely changes the paint.** Grime darkens and desaturates the body colour toward a
  dusty brown and drops the specular hard (shininess 64 → 9.6 at full dirt), so a dirty car
  stops catching the sun. Base colours are captured before anything is ever dulled, so the
  original paint always comes back exactly.
- **Washing:** roll into the bay and stop. Jets fire, foam rises, and the shine comes back in
  about two seconds. First clean **+15**, saved.
- **Boundary:** the reference was a **GTA 6 concept clip**. The logo and wordmark, the named
  character, "Vice City", "Ocean Drive", the car design, the HUD and the minimap are **all
  excluded** (Rule Zero). What was taken is the generic activity — washing a vehicle — which
  nobody owns, and it earned its place because this game already tracks the surface under the
  tyres and already gives bodywork a specular highlight. Everything built from primitives.

## v1.79 — THE PROVENANCE DESK ("we trace frames, not faces")

**Source & boundary:** the request was to integrate GitHub repositories connected to another
studio's leaked gameplay footage. Declined in full — Rule Zero (no other game's IP) plus the
harder line that nothing with *stolen provenance* goes near a commercial project. What survived
the boundary is the one thing in that world that is genuinely a craft: **geolocating a frame
from nothing but the skyline in it**. Everything below is original fiction.

**The story.** Three mystery frames of an unannounced harbour build — *the Glasswing* — hit the
island's rumor mill, signed only **PATOO** (patois for owl). Broadcast House doesn't ask who;
it asks *where*. You stand where each frame was shot: the Overlook headland (golden hour), the
marina boardwalk (working grey), the relay-tower rise (night glass). The third frame's angle
gives the perch away — the Eyrie — and the ending is the island way: nobody's door gets kicked
in, the Glasswing gets announced properly, and PATOO gets a press pass to shoot it in the open.

**The trick that makes it original tech, not homage:** the three "leaked frames" on the desk
are not textures. They are **ray-marched at runtime from the island's own heightfield** — 96
columns × ~80 terrain samples per frame from each vantage's true eye position, silhouette
against a mood-graded sky, crane drawn over the basin, rumor-mill slate burned in. Every ridge
line in the mystery footage is the actual island, so the match the player makes on foot is
geometrically real.

**Doctrine compliance:** non-lethal (nothing to fight), surveillance doctrine intact (no
tracking, no device forensics, no faces — landscape matching only), restorative resolution,
zero external IP, zero real names. Rewards: +15 briefing, +40 resolution.

**Verification:** sweep covers the full chain — lazy desk build with 3 panels, briefing,
all three vantage matches, Eyrie resolution. 28/28, zero page errors.
