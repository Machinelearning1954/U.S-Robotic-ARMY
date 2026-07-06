# Volumetric fog / neon light shafts — froxel design note

Reference design for the club-interior and storm-night volumetrics named in the
doctrine. Full GLSL lands at the engine rung; this is the algorithm and budget so
it drops in cleanly.

## Structure
- **Froxel grid:** a camera-frustum-aligned 3D texture, e.g. `160 × 90 × 64`
  (Tactical Withdrawal drops the depth slices to 32). Each froxel stores
  scattering + extinction for that slab of view space.
- **Two compute passes:**
  1. **Inject** — for each froxel, accumulate density (height fog + club haze) and
     in-scattered light from the neon lights that touch it, tinted per club
     (pink/blue/purple). Sample the sun/moon shadow map and the nearest N point
     lights only — economy of force.
  2. **March/accumulate** — integrate front-to-back along Z into a scattering +
     transmittance value per froxel, so the raymarch is amortized across frames.
- **Apply:** during the final composite, sample the froxel volume at each pixel's
  depth and blend `scene * transmittance + inScatter`.

## Temporal amortization (doctrine §4)
Jitter the froxel Z-slice sample per frame and accumulate with the reprojected
previous volume (TAA-style). Gives 128-sample quality at ~32 samples/frame of
cost. Reject history on fast camera motion to avoid smearing light shafts.

## Budget (Fold 6 / iPhone 16 Pro Max)
- Inject + march: target < 1.2 ms combined at Full Assault.
- Memory: two `R11G11B10F` volumes (current + history) ≈ 5–6 MB at the grid above.
- Scorched Earth: volume disabled, replaced by a cheap analytic height-fog term in
  the tonemap pass — the 60fps floor never depends on volumetrics.

## Why froxels over per-pixel raymarch
Per-pixel raymarch of neon shafts is the classic thermal killer on mobile. The
froxel grid decouples volumetric cost from screen resolution (VRS-friendly) and
from light count (only lights touching a froxel are injected), which is exactly
the "avoid what is strong, strike what is weak" trade.
