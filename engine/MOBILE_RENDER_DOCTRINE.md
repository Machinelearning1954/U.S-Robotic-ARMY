# PAUDC — Mobile Render Doctrine ("Art of War")

> Technical design for the **engine-rung** mobile renderer (Godot 4 / UE5 target,
> per `worldbuilding/DEVELOPMENT_ROADMAP.md`). Goal: GTA-6-class fidelity for
> PAUDC's *own* neon-nightlife scenes on Galaxy Z Fold 6 (Snapdragon 8 Gen 3/4)
> and iPhone 16 Pro Max (A18 Pro), inside a mobile thermal envelope.
>
> **Everything here renders PAUDC's own content through PAUDC's own engine.**

---

## Scope decision — one layer is built differently, on purpose

The doctrine proposed a "Trojan Horse" interceptor: a Vulkan/Metal layer that
attaches to *another game's process* and captures its swapchain to upscale it.
**PAUDC does not do this**, for three reasons:

1. **Rule Zero.** This project never touches Rockstar's (or anyone's) shipped
   software. An injection overlay into a third-party game is precisely that.
2. **Platform + anti-cheat terms.** Process injection and swapchain capture of
   another title violate store and anti-cheat policies and can brick accounts.
3. **We don't need it.** PAUDC owns its render loop. The swapchain, depth buffer
   and motion vectors are *ours natively* — every technique below plugs straight
   into our own frame graph with no hooking, and works better for it.

So the interceptor is replaced by an **in-engine render graph node** (`ReframeNode`)
that reads the exact same buffers we already produce. Same NPU pipeline, same
shaders, none of the legal or technical liability. Everything else in the
doctrine is adopted as written.

**Worked example — why we don't vendor game-specific upscaler mods.** Mods like
RDRFSR2 (which ships DLLs that *Red Dead Redemption 2 loads at runtime* to
redirect its NVIDIA NGX/DLSS calls to AMD FSR 2.0) are the injected form of this
exact idea. PAUDC does not vendor or ship that kind of thing: it hooks a shipped
Rockstar title, which is precisely what Rule Zero forbids, and renaming it does
not change what the binary does. The *upscaler itself*, though, is legitimate and
open — see below. We take the technique into our own renderer, not the hook.

---

## The five doctrines, mapped to our own engine

### 1. Deception — Neural assist (our NPU pipeline, our frames)
- **Temporal upscale (the workhorse):** render internal at 720–1080p and
  reconstruct to panel resolution. **Reference implementation: AMD FSR 2.x**
  (open-source, MIT, GPUOpen) — a temporal upscaler that takes exactly the inputs
  we already own (color, depth, motion vectors, jitter) and needs *no game hook*
  because it's a pass inside our own render graph. This is the legitimate,
  buildable core of the whole "deception" doctrine: same math the injected mods
  smuggle into other games, run natively on our frame. XeSS and a quantized
  ESRGAN-class NPU model are the alternate paths per device tier.
- **Neural upscale:** where the NPU is idle and cool, an ESRGAN-class model
  (TFLite NNAPI on Android, CoreML/ANE on iOS) can beat FSR on detail; FSR is the
  guaranteed fallback when the NPU is busy or hot.
- **Frame generation:** render 45–60fps, synthesize intermediate frames from
  our own motion vectors for a 90–120fps panel. **Guardrail:** frame-gen is
  disabled whenever input latency matters (combat, YARDCLASH) — interpolated
  frames never gate hit registration.
- **Neural texture reconstruction:** ship compact weights, reconstruct high-res
  detail on the NPU to cut texture VRAM. Applied to environment/background sets,
  never to gameplay-critical readouts (the OnWatch HUD stays crisp raster).

### 2. Know the terrain — unified-memory exploitation
- **Zero-copy buffers:** GPU and NPU share one allocation (`AHardwareBuffer` on
  Android, `IOSurface`/`MTLBuffer` shared storage on iOS). No CPU round-trips in
  the hot path.
- **Async compute:** cloth Verlet, SSS blur and post run on compute queues while
  the graphics queue rasterizes the next geometry pass.

### 3. Strike the weak — Variable Rate Shading (Tier 2)
- Screen center 1×1; periphery 2×2 → 4×4; fast-moving objects shaded at reduced
  rate, static hero surfaces at full rate. Foldable note: the Fold 6 inner panel
  gets a wider full-rate center region than the outer cover screen.

### 4. Economy of force — temporal reconstruction
- **TAA** accumulating 4 frames for supersampled detail at 1× cost, with motion
  rejection to avoid ghosting on the fast jeep/GX.
- **Foveated hook** stubbed for eye-tracking hardware; today drives a fixed-fovea
  quality falloff that doubles as the VRS map.

### 5. Speed — native pipeline
- Vulkan 1.3+/Metal 3 render loop in C++ (`native_core/`), no managed-language
  overhead per frame; frame pacing to the panel's refresh via display-timing
  extensions. This is *our* renderer's loop — not a hook into another process.

---

## Nightlife theater — the shaders that sell it

Target: The Strip and Lagoon Club interiors, Pelican Key beaches. **Maturity:**
PAUDC is an M-rated GTA-style world — adult nightlife and beachwear NPCs are
genre-standard and kept **non-explicit**; no sexual content. The skin and cloth
work below is general-purpose character rendering.

- **Subsurface scattering skin** — screen-space SSS so neon reads as light
  *through* skin, not painted on. Reference: [`shaders/sss_skin.glsl`](shaders/sss_skin.glsl).
- **Cloth physics** — GPU Verlet solver for beachwear/loose clothing, lightweight
  constraints for crowds, wind/gravity from world state. Reference:
  [`shaders/cloth_verlet.comp.glsl`](shaders/cloth_verlet.comp.glsl).
- **Neon + volumetrics** — high-pass bloom on emissive signage, froxel volumetric
  fog tinted per-club, SSR on polished floors. ACES tonemap with a teal-orange
  LUT. Reference: [`shaders/aces_tonemap.glsl`](shaders/aces_tonemap.glsl),
  [`shaders/volumetric_froxel.md`](shaders/volumetric_froxel.md).

---

## The Citadel — thermal management (the part that actually ships fidelity)

A PID controller on package temperature is the whole game on mobile — sustained
fidelity beats peak fidelity. Three defensible lines:

| Skin temp | Posture | What's on |
|---|---|---|
| **≤ 38 °C** | Full Assault | neural upscale + frame-gen, VRS T2, SSS hi, cloth on all NPCs, SSGI, volumetrics |
| **38–42 °C** | Tactical Withdrawal | drop SSGI to baked cube-map reflections, SSS to 2-tap, cloth to nearest-N NPCs, keep upscale |
| **> 42 °C** | Scorched Earth | native res, no frame-gen, bloom+tonemap only — **still locked to 60fps** |

The controller ramps continuously between tiers (no visible pops), and the floor
is always a smooth 60fps. Biometric gate (platform FaceID/fingerprint) is an
app-shell concern, not a render concern.

---

## Where this sits on the roadmap

This is **engine-rung** work (roadmap rung 3+). The WebGL2 browser prototype
(`game/3d.html`) already ships the cheap-imitation subset that *does* run in a
browser — bloom, ACES-style grade, planar water reflection, device tiers,
adaptive resolution. The doctrine above is the Godot/UE5 target that the mobile
build grows into; the shaders here are written engine-portable (GLSL, MSL-ready)
so they migrate with it.
