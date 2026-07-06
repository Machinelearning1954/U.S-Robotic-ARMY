# RoboFSR — FSR 2.0 upscaling for Red Dead Redemption 2

RoboFSR is a drop-in translation layer that lets Red Dead Redemption 2 run
**AMD FidelityFX Super Resolution 2.0** through the game's built-in DLSS code
path. The game believes it is talking to NVIDIA's NGX runtime; RoboFSR
intercepts those calls and feeds the frame, depth, and motion-vector data into
FSR 2.0 instead. The result: modern temporal upscaling on any GPU vendor — no
RTX hardware required.

## How it works

RDR2 ships with DLSS support behind NVIDIA's NGX interface (`nvngx.dll`).
RoboFSR provides two small DLLs:

- **`nvngx.dll`** (built from `RoboFSR/`) — implements the NGX entry points the
  game calls. Instead of dispatching to DLSS, it creates an FSR 2.0 context
  (DirectX 12 or Vulkan, matching the game's renderer) and maps every NGX
  parameter — input color, depth, motion vectors, jitter offsets, exposure,
  sharpness — onto the equivalent FSR 2.0 dispatch parameters.
- **`d3d11.dll`** (built from `nvngxLoader/`) — a loader shim that sits in the
  game directory so the mod is picked up without touching game files.

The in-game DLSS quality settings keep working and map to FSR 2.0 quality
modes. The in-game *Ultra Quality* option runs FSR 2.0 at native resolution —
effectively AMD's answer to DLAA: better-than-native image quality for a
performance cost.

Runtime behaviour is tunable through [`nvngx.ini`](nvngx.ini): sharpening,
upscale-ratio override, auto-exposure, HDR, jitter cancellation, and the
view-matrix source (field of view, near/far planes) used for high-quality
motion reprojection.

## Installation (players)

1. Grab a release build.
2. Extract the contents into your RDR2 executable directory.
3. Launch the game and pick a DLSS quality level in the graphics settings —
   FSR 2.0 is now doing the work.

Requires a legitimate, unmodified copy of RDR2. As with any mod for a
Rockstar title, avoid using it in Red Dead Online — mods there may put your
account at risk.

## Building from source

1. Clone this repository **with submodules**:
   ```sh
   git clone --recursive <repo-url>
   ```
2. Install the [Vulkan SDK](https://vulkan.lunarg.com/sdk/home) and make sure
   the `VULKAN_SDK` environment variable is set.
3. Build the FSR 2.0 API libraries in `external/FidelityFX-FSR2` per AMD's
   [quick-start checklist](https://github.com/GPUOpen-Effects/FidelityFX-FSR2#quick-start-checklist)
   — build **both** the DX12 and Vulkan variants.
4. Open `RoboFSR.sln` in Visual Studio 2022 and build the full solution.
5. Copy into the RDR2 executable directory:
   - `nvngx.dll` and `d3d11.dll` (your build output), and
   - `ffx_fsr2_api_x64.dll`, `ffx_fsr2_api_dx12_x64.dll`,
     `ffx_fsr2_api_vk_x64.dll` from the FidelityFX build.

## Project layout

| Path | Purpose |
| --- | --- |
| `RoboFSR/` | The NGX→FSR2 translation library (`nvngx.dll`). |
| `nvngxLoader/` | Loader shim (`d3d11.dll`). |
| `external/FidelityFX-FSR2/` | AMD FSR 2.0 SDK (submodule, pinned to v2.0.1a). |
| `external/nvngx_dlss_sdk/` | NGX/DLSS interface headers (submodule). |
| `external/simpleini/` | INI parser used for `nvngx.ini` (vendored). |
| `nvngx.ini` | Runtime configuration. |
| `EnableSignatureOverride.reg` / `DisableSignatureOverride.reg` | Toggle NVIDIA's NGX DLL signature check. |

## Credits & license

MIT licensed — see [LICENSE](LICENSE). RoboFSR builds on the DLSS→FSR2
bridging approach pioneered by PotatoOfDoom's CyberFSR2 and its RDR2
adaptation by RealIndica; the original copyright notice is retained in the
LICENSE file as the MIT license requires. FidelityFX Super Resolution 2.0 is
by AMD (GPUOpen), under its own license in the submodule.
