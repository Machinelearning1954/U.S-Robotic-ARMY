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

## 3. What's next (spec only, not yet built)

- **More properties, more tiers:** a starter room → Anchor Row's house →
  a Strip penthouse, each unlocked by clout/story progress, per the economy
  doc's ownership ladder.
- **Decoration/customization:** cosmetic furniture and wardrobe skins as a
  clout sink, matching the Duppy Links ball-skin pattern
  (`PAUDC_Side_Activities.md` §4).
- **Storage:** a stash box for mission items (crocs, curry pot, raw clips)
  so property has a mechanical reason to visit beyond sleeping.
- **NPC visits:** faction contacts and story characters dropping by,
  scheduled off the world clock — reuses the NPC culture doc's routine
  system (`JAMAICA_NPC_CULTURE.md` §2) rather than inventing a new one.

## 4. Content boundary note

Anchor Row and every future property are original fictional locations; no
real address, estate, or listing is depicted. The sleep/reset mechanic is a
game-design convenience (a checkpoint, dressed as a bed), not a claim about
real sleep, health, or medicine.
