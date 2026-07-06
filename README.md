# U.S-Robotic-ARMY

This repository vendors the [RDRFSR2](https://github.com/RealIndica/RDRFSR2)
project under [`RDRFSR2/`](RDRFSR2/).

## RDRFSR2

RDRFSR2 is a library for **Red Dead Redemption 2** that replaces NVIDIA DLSS
with **AMD FidelityFX Super Resolution 2.0 (FSR 2.0)**. It is written primarily
in C++ and targets Windows (Direct3D 12 and Vulkan). The upstream project is
archived and read-only; this repository preserves its source at the state it
was integrated.

See [`RDRFSR2/README.md`](RDRFSR2/README.md) for the original installation and
compilation instructions.

### Layout

| Path | Description |
| --- | --- |
| `RDRFSR2/CyberFSR/` | Main mod library (DLSS → FSR 2.0 translation, DX12/Vulkan hooks). |
| `RDRFSR2/nvngxLoader/` | NVIDIA NGX loader shim. |
| `RDRFSR2/external/simpleini/` | Vendored [SimpleIni](https://github.com/brofield/simpleini) header library. |
| `RDRFSR2/external/FidelityFX-FSR2/` | Git submodule → [GPUOpen-Effects/FidelityFX-FSR2](https://github.com/GPUOpen-Effects/FidelityFX-FSR2) (pinned to `v2.0.1a`). |
| `RDRFSR2/external/nvngx_dlss_sdk/` | Git submodule → [PotatoOfDoom/DLSS](https://github.com/PotatoOfDoom/DLSS). |
| `RDRFSR2/CyberFSR.sln` | Visual Studio 2022 solution. |

### Getting the external dependencies

The two build-time SDK dependencies are tracked as git submodules. After
cloning, pull them in:

```sh
git clone --recursive <this-repo-url>
# or, if already cloned:
git submodule update --init --recursive
```

Building additionally requires the [Vulkan SDK](https://vulkan.lunarg.com/sdk/home)
(with the `VULKAN_SDK` environment variable set) and Visual Studio 2022, as
described in `RDRFSR2/README.md`.

## Licensing

The RDRFSR2 source retains its original license
([`RDRFSR2/LICENSE`](RDRFSR2/LICENSE)). Vendored dependencies retain their own
licenses. This repository's top-level [`LICENSE`](LICENSE) applies to the
repository packaging.
