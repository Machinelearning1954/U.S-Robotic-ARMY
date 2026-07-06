# Island of Jamaica 3D — the flagship sandbox build

> **FICTIONAL VIDEO GAME CONTENT.** GTA-genre homage set on a fictionalized
> island of Jamaica. This note integrates the larger sandbox build into the
> project and records how it reconciles with the bounded PAUDC canon.

## What it is

A single-file **WebGPU** Three.js open-world game (with automatic WebGL2
fallback) that is much larger in scope than the focused `game/3d.html` PAUDC
vertical slice. It demonstrates the full GTA loop the design docs describe:

- Full island — Kingston metro + Spanish Town, Mandeville, Ocho Rios, Montego
  Bay, Negril, Cockpit Country, Port Antonio — with highways and causeways.
- On-foot **and** driving, get-in/out-of-car, shooting (hitscan), gangs, a
  wanted system with **A\* police pursuit** over a navigation cost grid.
- Dual protagonists (Tab-switch), day/night with real shadows, synth car radio
  + live-stream station, missions + economy + fame, cheat codes, touch controls,
  a 6-"dimension" filter toggle, and a localStorage **save system**.
- Quality presets (PERFORMANCE / BALANCED / ULTRA / RTX) with **dynamic
  resolution scaling**, HDR bloom, and an original CAS-style (FSR-inspired)
  sharpen pass — matching the render doctrine in `../engine/`.
- A **PAUDC — Port Antonio Unified Defense Complex** zone with a recruitment
  hub, so this build and our canon are the same universe.

## How it maps to PAUDC canon

| Island build | PAUDC canon (`worldbuilding/`) |
|---|---|
| PAUDC zone, recruitment hub, Q-Core | The Vault / ORACLE Table, recruitment stat |
| A* police pursuit, wanted stars | Watch Level & the BII Infraction Ledger (Systems §12) |
| Yaad Kitchen curry-goat school | Fort Flavor / Tichfield Culinary Academy |
| Fitness coach at the stadium | Beach Bootcamp / the Coach (Wildlife §7) |
| Maroon heritage reenactment | Story campaign heritage beats |
| Radio stations, fame/followers | OnWatch clout loop (Systems §4) |

The two builds are the **same project at two scales**: `game/3d.html` is the
tight, headless-verified PAUDC vertical slice; the Island build is the broad
sandbox. The roadmap's engine rung is where they converge.

## Reconciliation needed before this is "canon"

The PAUDC content boundaries (`PAUDC_Base_Design.md` §13) forbid **real** units,
agencies, systems, and procedures — only stylized/sci-fi or generalized tropes.
The Island build currently includes real-world branding and edutainment boards
that sit **outside** those rules and should be fictionalized to match canon
before this becomes the shipping build:

- Real service/agency branding (e.g. named armed-forces mottos, FBI/CIA
  recruitment) → replace with the fictional PAUDC / JDF-style equivalents.
- Real-hardware callouts and defense-doctrine placards → keep the *ethics*
  framing but generalize the specifics, same as the rest of PAUDC's tech.
- Everything else (island, driving, cooking school, heritage site, coach,
  radio, save) already fits canon cleanly.

## Landing the exact file

This build is ~2000 lines of a WebGPU program that **cannot be runtime-verified
in this sandbox** (the artifact CSP blocks the three.js CDN import, and headless
Chromium here has no reliable WebGPU). To get a byte-exact, uncorrupted copy
into `game/island.html`, **upload the `.html` file** in-session (same as the
image/video uploads) — it will be dropped in verbatim and committed. Hand-
transcribing a 2000-line program risks silent corruption of a working game, so
the upload path is the reliable one.

Once it's in, the next engineering step is the canon reconciliation above.
