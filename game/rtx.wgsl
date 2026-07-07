// Liberty Bay RTX — WebGPU path/ray tracer (validated offline with naga).
// Two pipelines share this module: `vs` (fullscreen triangle) + `fsTrace`
// (accumulating ray tracer) and `vs` + `fsPresent` (tonemap to swapchain).

struct Cam {
  originWet : vec4<f32>,  // xyz camera origin, w = wetness (0..1)
  right     : vec4<f32>,  // xyz camera right,  w = tan(halfFov)
  up        : vec4<f32>,  // xyz camera up,     w = aspect
  fwd       : vec4<f32>,  // xyz camera forward,w = accumulation count
  sunNeon   : vec4<f32>,  // xyz sun direction, w = neon flag (0/1)
  misc      : vec4<f32>,  // x resW, y resH, z frameSeed, w boxCount
  misc2     : vec4<f32>,  // x time
};

struct Box { mn : vec3<f32>, tone : f32, mx : vec3<f32>, emis : f32 };

@group(0) @binding(0) var<uniform> cam : Cam;
@group(0) @binding(1) var<storage, read> boxes : array<Box>;
@group(0) @binding(2) var prevTex : texture_2d<f32>;

struct VSOut { @builtin(position) pos : vec4<f32> };

@vertex
fn vs(@builtin(vertex_index) vi : u32) -> VSOut {
  var pts = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
  var o : VSOut;
  o.pos = vec4<f32>(pts[vi], 0.0, 1.0);
  return o;
}

// ---- rng ----
fn hash21(p : vec2<f32>) -> f32 {
  var q = fract(p * vec2<f32>(123.34, 456.21));
  q = q + dot(q, q + 45.32);
  return fract(q.x * q.y);
}
fn hash11(n : f32) -> f32 { return fract(sin(n * 12.9898) * 43758.5453); }

// ---- ray vs axis-aligned box, returns t (or -1) and sets normal ----
fn hitBox(ro : vec3<f32>, rd : vec3<f32>, mn : vec3<f32>, mx : vec3<f32>, nrm : ptr<function, vec3<f32>>) -> f32 {
  // safe inverse: never divide by a zero component (that makes Inf/NaN)
  let safe = select(rd, vec3<f32>(1e-6, 1e-6, 1e-6), abs(rd) < vec3<f32>(1e-6, 1e-6, 1e-6));
  let inv = 1.0 / safe;
  let t0 = (mn - ro) * inv;
  let t1 = (mx - ro) * inv;
  let tsmall = min(t0, t1);
  let tbig = max(t0, t1);
  let tn = max(max(tsmall.x, tsmall.y), tsmall.z);
  let tf = min(min(tbig.x, tbig.y), tbig.z);
  if (tn > tf || tf < 0.0) { return -1.0; }
  let t = select(tn, tf, tn < 0.0);
  // normal = axis where tn was achieved
  var n = vec3<f32>(0.0, 0.0, 0.0);
  if (tsmall.x >= tsmall.y && tsmall.x >= tsmall.z) { n = vec3<f32>(-sign(rd.x), 0.0, 0.0); }
  else if (tsmall.y >= tsmall.z) { n = vec3<f32>(0.0, -sign(rd.y), 0.0); }
  else { n = vec3<f32>(0.0, 0.0, -sign(rd.z)); }
  *nrm = n;
  return t;
}

struct Hit { t : f32, n : vec3<f32>, tone : f32, emis : f32, isGround : f32, id : f32 };

fn trace(ro : vec3<f32>, rd : vec3<f32>) -> Hit {
  var h : Hit;
  h.t = 1e9; h.n = vec3<f32>(0.0, 1.0, 0.0); h.tone = 0.0; h.emis = 0.0; h.isGround = 0.0; h.id = -1.0;
  // ground plane y = 0 (guard against near-horizontal rays -> huge/Inf t)
  if (rd.y < -1e-4) {
    let tg = -ro.y / rd.y;
    if (tg > 0.001 && tg < 8000.0) { h.t = tg; h.n = vec3<f32>(0.0, 1.0, 0.0); h.isGround = 1.0; }
  }
  let n = i32(cam.misc.w);
  for (var i = 0; i < n; i = i + 1) {
    var nrm : vec3<f32>;
    let b = boxes[i];
    let t = hitBox(ro, rd, b.mn, b.mx, &nrm);
    if (t > 0.001 && t < h.t) {
      h.t = t; h.n = nrm; h.tone = b.tone; h.emis = b.emis; h.isGround = 0.0; h.id = f32(i);
    }
  }
  return h;
}

// shadow ray: is the point lit by the sun?
fn sunVis(p : vec3<f32>, sun : vec3<f32>) -> f32 {
  let h = trace(p + sun * 0.05, sun);
  if (h.t < 1e8) { return 0.25; } // soft ambient occlusion of direct light
  return 1.0;
}

fn skyColor(rd : vec3<f32>, sun : vec3<f32>) -> vec3<f32> {
  let neon = cam.sunNeon.w;
  let up = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);
  var top = vec3<f32>(0.05, 0.12, 0.28);
  var bot = vec3<f32>(0.35, 0.45, 0.62);
  if (neon > 0.5) { top = vec3<f32>(0.10, 0.0, 0.18); bot = vec3<f32>(0.45, 0.05, 0.55); }
  var col = mix(bot, top, up);
  let s = max(dot(rd, sun), 0.0);
  col = col + vec3<f32>(1.0, 0.85, 0.6) * pow(s, 350.0) * 1.2;      // sun disk
  col = col + vec3<f32>(1.0, 0.8, 0.55) * pow(s, 8.0) * 0.12;        // glow
  return col;
}

// window emission on a building face
fn windows(p : vec3<f32>, nrm : vec3<f32>, id : f32) -> vec3<f32> {
  // pick the two axes on the face
  var u : f32; var v : f32;
  if (abs(nrm.y) > 0.5) { return vec3<f32>(0.0); }             // roofs: no windows
  if (abs(nrm.x) > 0.5) { u = p.z; v = p.y; } else { u = p.x; v = p.y; }
  let cell = vec2<f32>(floor(u / 8.0), floor(v / 9.0));
  let lit = hash21(cell + vec2<f32>(id * 3.1, id * 1.7));
  let inU = fract(u / 8.0); let inV = fract(v / 9.0);
  let frame = f32(inU > 0.16 && inU < 0.84 && inV > 0.16 && inV < 0.84);
  let neon = cam.sunNeon.w;
  var wc = vec3<f32>(1.0, 0.9, 0.6);
  if (neon > 0.5) {
    let pick = hash11(id + cell.x);
    wc = select(select(vec3<f32>(0.0, 0.9, 1.0), vec3<f32>(1.0, 0.15, 0.85), pick > 0.33), vec3<f32>(0.6, 0.3, 1.0), pick > 0.66);
  }
  let on = f32(lit > 0.55) * frame;
  return wc * on * select(1.2, 3.0, neon > 0.5);
}

fn albedo(tone : f32) -> vec3<f32> {
  if (tone < 0.5) { return vec3<f32>(0.14, 0.18, 0.25); }
  if (tone < 1.5) { return vec3<f32>(0.11, 0.15, 0.22); }
  if (tone < 2.5) { return vec3<f32>(0.16, 0.20, 0.29); }
  return vec3<f32>(0.18, 0.15, 0.14); // iron / restaurant
}

fn shade(ro : vec3<f32>, rd : vec3<f32>, h : Hit, sun : vec3<f32>) -> vec3<f32> {
  let p = ro + rd * h.t;
  if (h.t > 1e8) { return skyColor(rd, sun); }
  var base : vec3<f32>;
  if (h.isGround > 0.5) {
    let checker = 0.5 + 0.02 * sin(p.x * 0.05) + 0.02 * sin(p.z * 0.05);
    base = vec3<f32>(0.06, 0.07, 0.09);
  } else {
    base = albedo(h.tone);
  }
  let ndl = max(dot(h.n, sun), 0.0);
  let vis = sunVis(p, sun);
  let sky = skyColor(h.n, sun) * 0.25;                       // hemispheric ambient
  var col = base * (sky + vec3<f32>(1.0, 0.9, 0.7) * ndl * vis);
  if (h.isGround < 0.5) { col = col + windows(p, h.n, h.id); }  // emissive windows
  return col;
}

@fragment
fn fsTrace(@builtin(position) fc : vec4<f32>) -> @location(0) vec4<f32> {
  let res = cam.misc.xy;
  let seed = cam.misc.z;
  let jitter = vec2<f32>(hash21(fc.xy + seed), hash21(fc.xy + seed + 7.0)) - 0.5;
  var uv = (vec2<f32>(fc.x, res.y - fc.y) + jitter) / res * 2.0 - 1.0;
  uv.x = uv.x * cam.up.w;                                   // aspect
  let thf = cam.right.w;
  let ro = cam.originWet.xyz;
  let rd = normalize(cam.fwd.xyz + uv.x * thf * cam.right.xyz + uv.y * thf * cam.up.xyz);
  let sun = normalize(cam.sunNeon.xyz);

  let h = trace(ro, rd);
  var col = shade(ro, rd, h, sun);
  if (h.t < 1e8) {
    let p = ro + rd * h.t;
    let refl = reflect(rd, h.n);
    let wet = cam.originWet.w;
    var k = 0.04;
    if (h.isGround > 0.5) { k = mix(0.12, 0.85, wet); }
    let h2 = trace(p + h.n * 0.05, refl);
    let rc = shade(p, refl, h2, sun);
    let fres = k + (1.0 - k) * pow(1.0 - max(dot(-rd, h.n), 0.0), 5.0);
    col = mix(col, rc, clamp(fres, 0.0, 0.95));
  }

  // kill any stray Inf/NaN, then bound radiance so tonemapping stays stable
  col = select(col, vec3<f32>(0.0, 0.0, 0.0), col != col);
  col = clamp(col, vec3<f32>(0.0), vec3<f32>(20.0));

  // temporal accumulation
  let count = cam.fwd.w;
  let prev = textureLoad(prevTex, vec2<i32>(fc.xy), 0).rgb;
  let outc = select(mix(prev, col, 1.0 / count), col, count <= 1.5);
  return vec4<f32>(outc, 1.0);
}

fn aces(x : vec3<f32>) -> vec3<f32> {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3<f32>(0.0), vec3<f32>(1.0));
}

@fragment
fn fsPresent(@builtin(position) fc : vec4<f32>) -> @location(0) vec4<f32> {
  var c = textureLoad(prevTex, vec2<i32>(fc.xy), 0).rgb;
  c = aces(c * 0.9);
  // teal/orange grade + vignette
  let l = dot(c, vec3<f32>(0.299, 0.587, 0.114));
  c = c + mix(vec3<f32>(0.0, 0.14, 0.20), vec3<f32>(0.26, 0.12, 0.0), smoothstep(0.15, 0.85, l)) * 0.12;
  let res = cam.misc.xy;
  let d = vec2<f32>(fc.x, fc.y) / res - 0.5;
  c = c * mix(0.6, 1.0, smoothstep(1.0, 0.4, length(d)));
  c = pow(clamp(c, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(1.0 / 2.2));
  return vec4<f32>(c, 1.0);
}
