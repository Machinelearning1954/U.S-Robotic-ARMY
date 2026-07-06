// PAUDC — ACES filmic tonemap + teal/orange LUT injection + neon bloom composite.
// Final post pass for the nightlife look. Engine-portable GLSL; the same math is
// what the WebGL2 browser prototype approximates via THREE ACESFilmicToneMapping.

#version 450
layout(location = 0) in vec2 vUV;
layout(location = 0) out vec4 oColor;

layout(set = 0, binding = 0) uniform sampler2D uHDR;    // linear HDR scene
layout(set = 0, binding = 1) uniform sampler2D uBloom;  // high-pass blurred neon
layout(set = 0, binding = 2) uniform sampler3D uLUT;    // 33^3 teal-orange grade

layout(push_constant) uniform Push {
    float exposure;     // scene exposure multiplier
    float bloomStrength;// neon bleed amount
    float lutAmount;    // 0..1 grade blend
    float vignette;     // 0..1 edge darkening
} pc;

// ACES RRT+ODT fit (Narkowicz approximation — cheap, mobile-friendly).
vec3 aces(vec3 x) {
    const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 applyLUT(vec3 c) {
    // 33^3 LUT with half-texel correction.
    float n = 33.0;
    vec3 uvw = (c * (n - 1.0) + 0.5) / n;
    return texture(uLUT, uvw).rgb;
}

void main() {
    vec3 hdr = texture(uHDR, vUV).rgb * pc.exposure;
    hdr += texture(uBloom, vUV).rgb * pc.bloomStrength;   // neon signage bleed

    vec3 mapped = aces(hdr);                               // filmic HDR->LDR
    mapped = mix(mapped, applyLUT(mapped), pc.lutAmount);  // teal-orange grade

    // Cheap vignette — cinematic focus toward center, doubles as VRS periphery cue.
    vec2 d = vUV - 0.5;
    float vig = 1.0 - pc.vignette * dot(d, d) * 2.0;
    mapped *= clamp(vig, 0.0, 1.0);

    oColor = vec4(mapped, 1.0);
}
