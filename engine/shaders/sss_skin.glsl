// PAUDC — Screen-space subsurface scattering for skin under neon.
// Separable screen-space diffusion (Jimenez-style), engine-portable GLSL.
// Renders PAUDC's own characters; general-purpose skin shading, non-explicit.
//
// Usage: two passes (horizontal then vertical) over the lit-scene color target,
// masked to skin material IDs, guided by depth so blur never crosses silhouettes.
// The blur width scales with a per-material subsurface radius (mm) projected to
// screen space, so neon light bleeds softly through skin instead of sitting on it.

#version 450
layout(location = 0) in vec2 vUV;
layout(location = 0) out vec4 oColor;

layout(set = 0, binding = 0) uniform sampler2D uColor;   // lit scene (diffuse)
layout(set = 0, binding = 1) uniform sampler2D uDepth;   // linear view-space depth
layout(set = 0, binding = 2) uniform sampler2D uMask;    // .r = skin mask 0..1, .g = sss radius (mm)

layout(push_constant) uniform Push {
    vec2  dir;         // (1,0) horizontal pass, (0,1) vertical pass
    float sssWidthPx;  // base blur width at 1m, pixels
    float depthFalloff;// how hard depth discontinuities cut the blur
    float fovScale;    // projection term: focalLength / sensorHeight
} pc;

// 7-tap Gaussian-ish subsurface profile (RGB weighted — red scatters furthest).
const int   TAPS = 7;
const float OFFS[TAPS] = float[](-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0);
const vec3  WTS[TAPS]  = vec3[](
    vec3(0.06,0.03,0.02), vec3(0.11,0.07,0.05), vec3(0.20,0.17,0.14),
    vec3(0.26,0.46,0.58),
    vec3(0.20,0.17,0.14), vec3(0.11,0.07,0.05), vec3(0.06,0.03,0.02));

void main() {
    vec4  center = texture(uColor, vUV);
    vec2  mask   = texture(uMask,  vUV).rg;
    if (mask.r < 0.01) { oColor = center; return; }   // not skin — pass through

    float depth  = texture(uDepth, vUV).r;
    // Project the material's subsurface radius (mm) to a screen-space pixel width.
    float widthPx = pc.sssWidthPx * (mask.g * 0.001) * pc.fovScale / max(depth, 0.05);

    vec3 sum = vec3(0.0);
    vec3 wsum = vec3(0.0);
    for (int i = 0; i < TAPS; ++i) {
        vec2 uv = vUV + pc.dir * (OFFS[i] * widthPx) / vec2(textureSize(uColor, 0));
        float d = texture(uDepth, uv).r;
        // Bilateral guard: reject taps across a depth edge so blur stays on-face.
        float dw = exp(-abs(d - depth) * pc.depthFalloff);
        vec3  w  = WTS[i] * dw;
        sum  += texture(uColor, uv).rgb * w;
        wsum += w;
    }
    vec3 sss = sum / max(wsum, vec3(1e-4));
    // Blend by mask so hairline/edges keep raster detail.
    oColor = vec4(mix(center.rgb, sss, mask.r), center.a);
}

// NPU note (doctrine §1): the 7-tap separable blur can be replaced by a small
// learned diffusion kernel evaluated on the Neural Engine at ~half the ALU cost;
// this GLSL path is the guaranteed fallback and the correctness reference.
