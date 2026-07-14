# Housing & Interiors — Module Specification

> **FICTIONAL VIDEO GAME CONTENT.** The property/interior module for the
> PAUDC/Jamaica island world — the last uncovered slot in the module build-out
> (every other system — driving, economy, transit, combat, dialogue, wanted,
> wildlife, side activities — had at least a live prototype slice; this one
> didn't, until now). Everything below is original invention.

## 1. Anchor Row — the first ownable safehouse (live in the prototype, v0.33)

A small house on a quiet stretch of coast, well clear of the district ring —
the player's own place. It's the prototype's proof that PAUDC can do real
**interiors**, not just dwell-timer flavor text at an exterior prop:

- **Enter:** on foot, walk up to the door, press **E**. The world doesn't
  fake it — the player is moved to a physically separate interior space (a
  fully enclosed room built at its own out-of-the-way map location) and the
  exterior position is remembered.
- **Inside:** a floor, four walls, a ceiling, a window with a painted harbor
  view, a bed, and a wardrobe. Small, but everything an interior needs to
  read as a room rather than a prop.
- **Sleep:** walk to the bed and hold position. A couple of seconds later:
  time jumps to dawn, paranoia clears, and if the Static Hour was active it
  lifts — a clean slate, no clout farm attached (sleeping isn't a grind
  loop, it's a reset button).
- **Leave:** press **E** again near the interior door and the player returns
  to the exact exterior spot and heading they left from.

## 2. Why this design (engine-mapping note)

The prototype is a single continuous WebGL scene with one camera — there's
no level-streaming or portal-rendering yet. Rather than fake an interior with
a lightbox trick, Anchor Row's interior is a **real, separate physical room**
built at an unused, far-off map coordinate; entering/leaving is a direct
position swap (the same primitive already used for the harbor Static-Hour
reset and the Vault Drag bust). It's a legitimate placeholder for what the
engine rung (Godot 4 / UE5, `DEVELOPMENT_ROADMAP.md`) will do properly with
level streaming and interior cells — the interaction model (walk up, press E,
walk to the bed, press E to leave) is what carries forward unchanged.

## 3. The Wardrobe — live in the prototype (v0.39)

The first real clout sink in the game. Anchor Row's wardrobe was spec'd here
as a future cosmetic clout sink — it's now built: stand at the wardrobe and
press **E** to cycle outfits. Three colorways beyond the default (Cutlass
Gold, Tidewater Pink, Palm Green) cost **25 / 40 / 60 clout** to unlock the
first time; once bought, re-wearing any owned fit is free — cycling never
double-charges. This is also the answer to a standing gap: every other
system in the game only ever *paid out* clout (OnWatch, side activities,
turf, wrecks); nothing ever asked the player to *spend* it. The Wardrobe is
the prototype's proof that the economy doc's shop/vendor model
(`PAUDC_Economy.md`) works as a real interaction, not just a spec.

## 3b. The Don's Hillside Estate — live in the prototype (v0.55)

The ownership ladder's top rung is now real: a high-clout **hillside estate**
that the Don earns as his fame climbs — the power-fantasy payoff of the whole
progression. It sits on a gentle rise well clear of the district ring, a dark
wood-and-glass mansion with a **car-display forecourt** of four stylized
supercars in bright liveries (original low-poly builds, no real marque).

- **Claim it:** on foot at the estate with **150 clout** banked, it becomes
  yours automatically — "keys are yours, from Anchor Row to the hills," +40
  clout, one-time. Under the threshold, it tells you how much more you need.
- **Persistent:** ownership saves to `localStorage` (like race-best and
  clout), so the estate stays claimed across sessions.
- **Why it lands:** it's the visible answer to "what is all this clout *for*"
  — the same "day in the life at the big house" fantasy the open-world genre
  runs on, kept fictional and courtesy-first: you earn it, nobody's evicted.

## 4. What's next (spec only, not yet built)

- **More properties, more tiers:** a starter room → Anchor Row's house →
  the Hillside Estate (live) → a Strip penthouse, each unlocked by
  clout/story progress, per the economy doc's ownership ladder.
- **More decoration:** furniture skins as a further clout sink, matching the
  Duppy Links ball-skin pattern (`PAUDC_Side_Activities.md` §4) and the
  Wardrobe's own unlock-once model above.
- **Storage:** a stash box for mission items (crocs, curry pot, raw clips)
  so property has a mechanical reason to visit beyond sleeping and dressing.
- **NPC visits:** faction contacts and story characters dropping by,
  scheduled off the world clock — reuses the NPC culture doc's routine
  system (`JAMAICA_NPC_CULTURE.md` §2) rather than inventing a new one.

## 4. Content boundary note

Anchor Row and every future property are original fictional locations; no
real address, estate, or listing is depicted. The sleep/reset mechanic is a
game-design convenience (a checkpoint, dressed as a bed), not a claim about
real sleep, health, or medicine.
