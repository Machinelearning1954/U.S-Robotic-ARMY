// PAUDC — GPU cloth solver (Verlet integration + distance constraints).
// One compute dispatch per cloth patch; lightweight enough for crowds of NPCs
// (beachwear, loose shirts, banners). Engine-portable GLSL compute.
//
// Each particle stores current + previous position; Verlet derives velocity
// implicitly. Distance constraints are solved in a few Jacobi iterations so the
// whole crowd can share one dispatch without per-character serialization.

#version 450
layout(local_size_x = 64) in;

struct Particle {
    vec4 pos;   // xyz position, w = inverse mass (0 = pinned)
    vec4 prev;  // xyz previous position, w unused
};

layout(std430, set = 0, binding = 0) buffer Particles { Particle p[]; };

struct Constraint { uint a; uint b; float rest; float _pad; };
layout(std430, set = 0, binding = 1) readonly buffer Constraints { Constraint c[]; };

layout(push_constant) uniform Push {
    vec4  gravity;      // xyz m/s^2, w = dt seconds
    vec4  wind;         // xyz wind force, w = damping (0.9..0.999)
    uint  particleCount;
    uint  constraintCount;
    uint  iterations;   // constraint relaxation passes (2..4)
    uint  phase;        // 0 = integrate, 1 = solve constraints
} pc;

void integrate(uint i) {
    Particle q = p[i];
    if (q.pos.w == 0.0) return;                 // pinned
    vec3 cur  = q.pos.xyz;
    vec3 vel  = (cur - q.prev.xyz) * pc.wind.w; // damped Verlet velocity
    vec3 acc  = pc.gravity.xyz + pc.wind.xyz * q.pos.w;
    vec3 next = cur + vel + acc * (pc.gravity.w * pc.gravity.w);
    p[i].prev.xyz = cur;
    p[i].pos.xyz  = next;
}

void solve(uint i) {
    Constraint k = c[i];
    Particle A = p[k.a];
    Particle B = p[k.b];
    vec3 delta = B.pos.xyz - A.pos.xyz;
    float len  = max(length(delta), 1e-5);
    float diff = (len - k.rest) / len;
    float wA = A.pos.w, wB = B.pos.w;
    float wsum = wA + wB;
    if (wsum == 0.0) return;
    vec3 corr = delta * diff;
    // Distribute correction by inverse mass; pinned particles (w=0) don't move.
    p[k.a].pos.xyz += corr * (wA / wsum);
    p[k.b].pos.xyz -= corr * (wB / wsum);
}

void main() {
    uint i = gl_GlobalInvocationID.x;
    if (pc.phase == 0u) {
        if (i < pc.particleCount) integrate(i);
    } else {
        // Constraints are graph-colored on the CPU into non-conflicting batches;
        // each batch is one dispatch, so writes here never race within a batch.
        if (i < pc.constraintCount) solve(i);
    }
}

// Thermal note (doctrine "Citadel"): at Tactical Withdrawal the host clamps
// cloth to the nearest N NPCs and drops `iterations` from 4 to 2 — visibly
// softer, never absent, and the 60fps floor holds.
