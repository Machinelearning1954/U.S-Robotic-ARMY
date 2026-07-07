# PAUDC — PC Hardware Targets (Engine Rung)

> Reference spec for the **engine-rung** PC build (Godot 4 / UE5 target, per
> `worldbuilding/DEVELOPMENT_ROADMAP.md`). Calibrated against the community-predicted
> GTA 6 PC requirements circulating as of **July 2026** — GTA 6 ships on console
> Nov 19, 2026, with **no PC version confirmed** (Rockstar PC ports historically
> land 1–2 years later), so every figure below is a *predicted* ceiling we design
> toward, not an announced spec. The browser prototype (`game/3d.html`) stays the
> instant-play tier and needs none of this; it renders on the player's device today.

## 1. The four PAUDC PC tiers (mapped to the GTA-6-class prediction)

| PAUDC tier | Resolution / settings | Target FPS | GPU (NVIDIA / AMD, predicted) | VRAM | CPU (predicted) | RAM |
|---|---|---|---|---|---|---|
| **Minimum** | 1080p / Low–Med | 30–60 | RTX 2070 / RX 6700 XT | 8 GB | i7-10700K / Ryzen 7 5800X (6-core) | 16 GB DDR4/5 |
| **Recommended** | 1440p / High | 60 | RTX 3080 / RX 7900 XT | 12 GB | i9-12900K / Ryzen 9 5900X (8–12c) | 32 GB DDR5 |
| **Ultra** | 4K / High + ray tracing | 60+ | RTX 4080 / RX 7900 XTX | 16 GB+ | Ryzen 7 9800X3D-class (8c X3D) | 32 GB DDR5 |
| **Future-proof** | 4K Ultra + next-gen RT | 60+ | RTX 5080 / 5090 / RX 9000 | 16 GB+ | 9800X3D / Core Ultra 9 285K | 32 GB+ DDR5 |

**Storage (all tiers):** NVMe SSD is non-negotiable — Gen4/5, **150 GB** for the
install (matches our budgeted install spec, `PAUDC_Base_Design.md`), 1 TB+ drive
recommended for headroom and fast asset streaming.

## 2. Why each component matters *for our design*

- **GPU is the ceiling.** Our Ultra tier's ray-traced water/wet-asphalt/glass
  reflections, volumetric tropical sky, and dense-neon nightlife (`MOBILE_RENDER_DOCTRINE.md`
  §nightlife) are exactly the GPU-bound features the prediction flags — 16 GB+ VRAM
  is the line for 4K + RT. Below that, our tier system degrades gracefully (the same
  ULTRA/HIGH/BASE auto-detect the browser build already ships, scaled up).
- **CPU is the simulation.** The island's NPC culture behavior trees, left-hand
  traffic, ferry/taxi transit sim, BII pursuit AI, and Storm Condition weather all
  run on the CPU — an 8-core X3D-class chip is what keeps frame pacing smooth in a
  dense district, per the prediction's CPU-bound warning.
- **RAM + NVMe = streaming.** The whole-island world (`JAMAICA_ISLAND_WORLD.md`)
  streams district-by-district; 32 GB + Gen4/5 NVMe is what makes the seamless
  loads (ferry rides and gates masking the boundaries) actually seamless.

## 3. Example builds (from the July-2026 market snapshot)

| Build | CPU | GPU | RAM | Storage | Predicted target |
|---|---|---|---|---|---|
| **Budget** | Core Ultra 5 245K | RTX 5060 / RX 9060 XT (16GB) | 16 GB DDR5 | 512 GB NVMe | 1080p Med, 30–60 |
| **Balanced** | Ryzen 5 9600X | RTX 5070 / RX 9070 XT | 32 GB DDR5 | 1 TB NVMe | 1440p High, 60 |
| **High** | Ryzen 7 9800X3D | RTX 5080 | 32 GB DDR5 | 1 TB Gen4/5 | 1440p Ultra, 60+ |
| **Next-gen** | Ryzen 7 9800X3D | RTX 5090 (32GB) | 32 GB+ DDR5 | 2 TB Gen5 | 4K Ultra + RT, 60+ |

*Pricing note (July 2026, volatile): RTX 5090 ~$2,350–2,800; 5080 ~$1,150–1,450;
9070 XT ~$600–650 (AMD flagged a 10–15% H2-2026 hike); 9800X3D ~$480–520;
32 GB DDR5-6000 ~$400–500 (spiking); 2 TB Gen4 NVMe ~$160–200. Figures are
community-synthesized reference, not a bill of materials.*

## 4. What this means for the roadmap

- **We do not gate the project on this hardware.** The instant-play browser build is
  the floor and always will be; these targets describe the *ceiling* the engine rung
  climbs toward once PAUDC is in Godot/UE5.
- **The mobile track** (`DEVELOPMENT_ROADMAP.md` → "PAUDC: Neon Harbor Mobile", 8 GB)
  is the opposite end of this same spectrum — same engine, phone build target.
- **Design implication:** everything we build must scale from a browser tab on a
  laptop iGPU (today) to a 4K-RT rig on an RTX 5090 (engine rung) through the tier
  system — which is why the device-tier auto-detect and adaptive resolution shipped
  in the prototype first. This table is where that ladder ends.

> Predicted, unofficial, reference-only. GTA 6 PC is unannounced; all hardware
> figures are community forecasts we calibrate against, and PAUDC is an original
> game — no Rockstar spec, code, or asset is used (Rule Zero).
