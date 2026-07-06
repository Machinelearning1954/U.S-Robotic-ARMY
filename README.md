# U.S-Robotic-ARMY

Home of **RoboFSR** — a translation layer that brings AMD FidelityFX Super
Resolution 2.0 to Red Dead Redemption 2 through the game's DLSS code path, so
temporal upscaling works on any GPU vendor.

The project lives in [`RoboFSR2/`](RoboFSR2/) — see its
[README](RoboFSR2/README.md) for how it works, installation, and build
instructions.

## Quick start

```sh
git clone --recursive <this-repo-url>
# or, if already cloned:
git submodule update --init --recursive
```

Building requires Windows, Visual Studio 2022, and the
[Vulkan SDK](https://vulkan.lunarg.com/sdk/home) with `VULKAN_SDK` set.

## License

MIT — see [LICENSE](LICENSE) and [RoboFSR2/LICENSE](RoboFSR2/LICENSE).
