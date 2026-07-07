# PAUDC — GTA-Level Production Toolchain

> The full pipeline map: **GPU provider → engine → DCC tools → AI → assets → output.**
> Everything graded honestly: what's free/open (use it), what's commercial (budget it),
> what's gated (needs an account), and what's already proven working in this repo.
> Rule Zero applies at every stage: original content only.

## The pipeline at a glance

| Stage | Tool | License | Status here |
|---|---|---|---|
| **Free GPU** | Kaggle (~30 h/wk), Google Colab, RunPod community | free tiers | ✅ ready — [`kaggle_asset_pipeline.ipynb`](kaggle_asset_pipeline.ipynb); Colab/Kaggle: new notebook → Accelerator GPU → `!nvidia-smi` |
| **Engine (next rung)** | **Godot 4.3** | MIT, free | ⬜ download `Godot_v4.3-stable_linux.x86_64.zip` from godotengine.org on your machine; `./Godot_v4.3_linux.x86_64` runs it (container proxy blocks the download here) |
| **Engine (AAA rung)** | **Unreal Engine 5.4+** (Nanite, Lumen, Chaos) | free until revenue threshold | ⬜ source clone requires an Epic account linked to GitHub (free: epicgames.com → account → Connections → GitHub), then `git clone https://github.com/EpicGames/UnrealEngine`; or just install via the Epic launcher — source not required for our use |
| **DCC / world build** | **Blender 4.0** | GPL, free | ✅ **installed & proven**: [`blender/make_scene.py`](blender/make_scene.py) builds `scene.blend` (original Rolling Calf turntable), and `blender -b scene.blend -o //render/frame_##### -a` rendered all 24 frames headless (Cycles CPU — EEVEE needs a display). Sample: [`blender/sample_frame.png`](blender/sample_frame.png). Also our GLB game-ready pass (decimate/LOD/collision) |
| **Procedural cities** | Esri **CityEngine** | commercial (free trial) | 💰 optional; free path: Blender Geometry Nodes + open building generators; OSM data via ODbL license with attribution if real-city layouts are ever wanted (we hand-trace our fictional island instead) |
| **FX / destruction** | SideFX **Houdini** | commercial; **Houdini Apprentice is free** (non-commercial, watermarked) | 💰/🆓 Apprentice is the legal learning tier; UE5 Chaos covers destruction in-engine for free |
| **AI world/mission gen** | **Claude (Anthropic SDK)** + **Z.ai GLM (zhipuai SDK)** | API accounts | ✅ **both installed**: `anthropic 0.116.0`, `zhipuai` — set `ANTHROPIC_API_KEY` / `ZHIPUAI_API_KEY` to use; mission-logic and dialogue generation feed the docs, never runtime dependencies |
| **NPC behavior** | **Kythera AI** | commercial middleware (eval on request) | 💰 optional; free path: Godot/UE5 built-in nav + behavior trees (UE5 StateTree), which cover our traffic/stalker/brawler patterns |
| **NPC dialogue** | **Inworld AI** | commercial (free dev tier) | 💰/🆓 dev tier exists; free path: Likkle Oracle dialogue pre-generated via the SDKs above and shipped as static content |
| **Version control for big assets** | **git-lfs** | free | ✅ installed (`git lfs version` 3.4.1) — run `git lfs track "*.glb" "*.png"` before committing engine-scale binaries |

## Output targets (what this buys)

- **GTA-6-tier graphics** — UE5 Nanite/Lumen on the AAA rung; the browser build stays the free instant-play tier (SA-rung now, v0.21).
- **Open-world city/island** — our hand-traced Port Antonio island; procedural fill via Blender geo-nodes.
- **AI-driven missions** — generated with the SDKs into `worldbuilding/` docs, curated by hand, shipped as content.
- **Real-time physics / destruction** — Chaos (UE5) or Godot physics; Houdini Apprentice for baked FX.
- **Ray tracing** — Lumen HW-RT on capable GPUs; the mobile doctrine (engine/) governs the phone tier.

## Ground rules

1. **The game never requires a cloud GPU** — cloud GPUs are for asset generation only (see roadmap "Free cloud GPUs").
2. **Original inputs only** through every AI tool — no third-party IP laundering (Rule Zero).
3. Generated assets get the **game-ready pass** (decimate, LODs, collision) before engine import.
4. Commercial tools are options, never dependencies — every stage has a free path listed above.
