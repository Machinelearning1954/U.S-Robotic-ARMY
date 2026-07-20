# PAUDC: Neon Harbor — IP & Provenance Statement

> Prepared to support commercial release of the prototype. This is a factual
> inventory of what the project contains and where it came from — **it is not
> legal advice**; have a games/IP attorney review before any sale or storefront
> listing.

## What the game is

**PAUDC: Neon Harbor** — an original, fictional open-world island prototype
(single-file WebGL, `game/3d.html`). Every place, character, faction, brand,
vehicle, aircraft, vessel, robot, business, and system in the game is invented.

## Originality inventory

| Layer | Contents | Status |
|---|---|---|
| **Code** | All gameplay code written from scratch for this project | Original — owned by the repo owner |
| **Engine** | three.js (inlined build) | MIT license — commercial use permitted; the bundled license notice inside `game/3d.html` **must be kept** |
| **3D assets** | Every model is built in code from engine primitives | Original — no imported models, no marketplace assets |
| **Textures** | All generated procedurally at runtime via canvas | Original — no image files, no photo textures |
| **Audio** | All synthesized at runtime via WebAudio (oscillators + filtered noise) — no audio files, samples, or recorded music | Original — nothing recorded, sampled, or licensed |
| **Fonts** | System font stack | No embedded fonts |
| **Names & text** | All in-game names (PAUDC, BII, Plantin Airways, Sea Puss, Wave Dart, YARDCLASH, the Don/Malik Baptiste, etc.), all toasts, labels, and dialogue | Original, invented for this project |
| **Folklore** | Rolling Calf, duppy — Jamaican folklore | Public domain cultural material, rendered with original designs |

## The design rules that kept it original ("Rule Zero")

Enforced across all ~100 versions, documented per-feature in the
`worldbuilding/` docs (each feature carries a boundary note):

- **No third-party game IP** — no characters, assets, code, names, or levels
  from any existing game. Genre inspiration (open-world island game) is not
  copied expression; every implementation is from-scratch.
- **No film/TV IP** — requests referencing films were rebuilt as original
  missions with no characters, titles, or names carried over.
- **No real people** — no likenesses, no real names, no politicians, no actors.
- **No real weapons or military systems** — real aircraft, drones, defense
  systems, and border systems that appeared in reference material were
  excluded; only generalized non-military ideas were kept.
- **No real brands** — every business in the game is an invented brand.
- **Real places fictionalized** — the island is a fictionalized setting; real
  place names from requests resolve to invented in-game locations.
- **Non-lethal by design** — no kill mechanics, no death screens, no firearms.

## Items to handle before a commercial release

1. **`game/army.html` is NOT sellable.** It is a development scrapbook that
   embeds third-party YouTube/Instagram/Facebook posts. Exclude it from any
   commercial package (ship `game/3d.html` and its docs only), or delete it
   from the release branch.
2. **Keep the three.js license block** inside `game/3d.html` (MIT requires the
   notice). It is already inlined; do not strip it during minification.
3. **Marketing language:** do not use other games' or films' trademarks
   ("GTA", "Top Gun", etc.) in store listings, titles, tags, or ads.
   Development docs in `worldbuilding/` honestly note reference sources with
   boundary notes — that is fine as internal documentation, but marketing copy
   should describe the game on its own terms.
4. **AI concept art** generated during development (Higgsfield) is used for
   art direction only and is **not shipped in the game file**. If any of it is
   used commercially later, verify the generator's commercial-use terms first.
5. **Choose a license/copyright line** for the release (e.g. "© <owner>. All
   rights reserved.") and add it to the game file header and the repo.
6. **Trademark check the title** ("PAUDC: Neon Harbor") in your target markets
   before listing.

## Repository

Development history (every version, with per-feature boundary notes and
headless verification records in the commit messages) lives on the branch
`claude/port-antonio-base-design-lvd49n` of the owner's repository — the
provenance trail itself is part of the asset.
