// REZONANCE — optional true-3D renderer (toggle with V in game).
// Mirrors the running Game's state into a Three.js scene each frame: the same
// grid, emitters, sweepers, traffic, and pedestrians, but as a real 3D city
// with perspective, fog, and dynamic lights. Game logic stays in game.js;
// this file only draws.
//
// Realism pipeline (all procedural, no external assets):
//   - PCF soft shadow mapping from a moon key light that follows the player
//   - planar wet-street reflections: the lit city is mirrored below a
//     translucent asphalt plane, so every window, neon sign, headlight and
//     lamp smears into the road like standing water
//   - procedural night sky dome (stars, moon, drifting cloud murk)
//   - 512px facade textures with per-floor window variety, storefront bands,
//     ledges, and a separate emissive map so only glass glows
//   - pooled dynamic lights: street lamps and car headlight spotlights swap
//     to whichever sources are nearest the player
//   - wind-slanted rain streaks, emitter sky-beams, drone scan cones
//   - post chain: threshold bloom, chromatic aberration, film grain,
//     vignette, gamma — with an auto quality governor for weak GPUs
import * as THREE from "../vendor/three.module.js";
import { loadGLB } from "./glb.js";

const UP_SCALE = 150; // world building-height multiplier

// Optional GLB props — generated with an image-to-3D service (a local
// FastAPI-TRIPOSR instance, Higgsfield generate_3d, Meshy…) and dropped
// into src/assets/props/. Each entry lists sources tried in order; when
// none resolve, the procedural stand-in keeps rendering. See docs/ASSETS.md.
// Higgsfield image_to_3d GLB of the luxury coupe (generated from a Higgsfield
// nano_banana_pro concept). Hosted on Higgsfield's CDN and fetched at runtime
// by the player's browser; a committed local file always wins if present.
const HF_COUPE = "https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/f2ea3d25-7e38-4ffb-8445-59444c838dfd.glb";
// Second variant: dark midnight-blue hypercar (Higgsfield image_to_3d).
const HF_HYPERCAR = "https://d3u0tzju9qaucj.cloudfront.net/7d051b5a-7bfe-49fe-a484-24e7b3a9458a/82a45175-132a-4bb4-ab36-c9a1c19e62c7.glb";

const PROPS = {
  emitter: { sources: ["src/assets/props/emitter.glb"], size: 26 },
  vesper: { sources: ["src/assets/props/vesper.glb"], size: 34 },
  sweeper: { sources: ["src/assets/props/sweeper.glb"], size: 24 },
  car: { sources: ["src/assets/props/car.glb", HF_COUPE], size: 34 },
  car2: { sources: ["src/assets/props/car2.glb", HF_HYPERCAR], size: 34 },
  ped: { sources: ["src/assets/props/ped.glb"], size: 18 },
  lamp: { sources: ["src/assets/props/lamp.glb"], size: 30 },
  hovercar: { sources: ["src/assets/props/hovercar.glb", HF_COUPE], size: 60 },
  hovercar2: { sources: ["src/assets/props/hovercar2.glb", HF_HYPERCAR], size: 60 },
};

// Empty-string / falsy sources are skipped by the loader, so an unfilled
// variant URL simply falls through to the procedural body.

// ---------------------------------------------------------------------------
// Full-screen post-processing shaders
// ---------------------------------------------------------------------------
const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BRIGHT_FRAG = /* glsl */ `
  uniform sampler2D tex; uniform float threshold;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tex, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float k = smoothstep(threshold, threshold + 0.35, l);
    gl_FragColor = vec4(c * k, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */ `
  uniform sampler2D tex; uniform vec2 dir;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tex, vUv).rgb * 0.227027;
    c += texture2D(tex, vUv + dir * 1.3846).rgb * 0.3162162;
    c += texture2D(tex, vUv - dir * 1.3846).rgb * 0.3162162;
    c += texture2D(tex, vUv + dir * 3.2308).rgb * 0.0702703;
    c += texture2D(tex, vUv - dir * 3.2308).rgb * 0.0702703;
    gl_FragColor = vec4(c, 1.0);
  }
`;

// Volumetric light shafts (crepuscular / "god" rays): march from each pixel
// toward the light's screen position through the thresholded bright buffer,
// accumulating with decay so bright emitters and the moon streak through the
// rainy air. Radial-blur scattering, the classic real-time approximation.
const GODRAY_FRAG = /* glsl */ `
  uniform sampler2D tBright; uniform vec2 uLight; uniform float uActive;
  varying vec2 vUv;
  void main() {
    const int N = 24;
    vec2 dir = (uLight - vUv) / float(N) * 0.85;
    vec2 uv = vUv;
    float decay = 1.0, sum = 0.0, w = 0.0;
    for (int i = 0; i < N; i++) {
      uv += dir;
      float s = dot(texture2D(tBright, uv).rgb, vec3(0.33));
      sum += s * decay;
      w += decay;
      decay *= 0.93;
    }
    gl_FragColor = vec4(vec3(sum / w) * uActive, 1.0);
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tBloomWide;
  uniform sampler2D tGod; uniform vec3 uGodTint;
  uniform float time; uniform float bloomAmt; uniform float grainAmt;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 fromC = vUv - 0.5;
    float r2 = dot(fromC, fromC);
    // chromatic aberration grows toward the frame edge, like a real lens
    vec2 ca = fromC * r2 * 0.06;
    vec3 c;
    c.r = texture2D(tScene, vUv - ca).r;
    c.g = texture2D(tScene, vUv).g;
    c.b = texture2D(tScene, vUv + ca).b;
    // two bloom octaves: tight neon glow + wide atmospheric halo
    c += texture2D(tBloom, vUv).rgb * bloomAmt * 0.75;
    c += texture2D(tBloomWide, vUv).rgb * bloomAmt * 0.65;
    // volumetric light shafts, tinted moon-cool
    c += texture2D(tGod, vUv).r * uGodTint;
    // teal-orange grade: cool shadows, warm highlights, gentle saturation lift
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c *= mix(vec3(0.92, 1.03, 1.12), vec3(1.07, 1.01, 0.94), smoothstep(0.08, 0.75, l));
    c = mix(vec3(l), c, 1.12);
    c *= 1.0 - r2 * 0.85;                       // vignette
    c += (hash(vUv * 917.0 + time) - 0.5) * grainAmt; // film grain
    c = max(c, 0.0);
    gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0); // to sRGB
  }
`;

export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    this.ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060a16, 0.001);
    this.camera = new THREE.PerspectiveCamera(55, 1, 8, 5000);
    this.builtFor = null;
    this.dyn = {};
    this.quality = 2; // 2 = full, 1 = no bloom / 1x pixel ratio
    this.frameEMA = 16;

    // Kick off async GLB prop loads; a district rebuild swaps them in
    // whenever one lands. Missing files just mean procedural stand-ins.
    this.props = {};
    for (const [name, def] of Object.entries(PROPS)) {
      (async () => {
        for (const src of def.sources) {
          if (!src) continue; // unfilled variant URL — skip
          try {
            this.props[name] = await loadGLB(src, { targetSize: def.size });
            this.builtFor = null; // trigger rebuild with the real asset
            return;
          } catch (e) { /* try next source */ }
        }
      })();
    }

    // --- post-processing chain (bloom + composite) ---
    this.postScene = new THREE.Scene();
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.postScene.add(this.postQuad);
    this.matBright = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: BRIGHT_FRAG, depthTest: false,
      uniforms: { tex: { value: null }, threshold: { value: 0.52 } },
    });
    this.matBlur = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: BLUR_FRAG, depthTest: false,
      uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } },
    });
    this.matGodray = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: GODRAY_FRAG, depthTest: false,
      uniforms: { tBright: { value: null }, uLight: { value: new THREE.Vector2(0.5, 0.1) }, uActive: { value: 0 } },
    });
    this.matComposite = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: COMPOSITE_FRAG, depthTest: false,
      uniforms: {
        tScene: { value: null }, tBloom: { value: null }, tBloomWide: { value: null },
        tGod: { value: null }, uGodTint: { value: new THREE.Color(0.42, 0.55, 0.78) },
        time: { value: 0 }, bloomAmt: { value: 0.95 }, grainAmt: { value: 0.028 },
      },
    });
    this._moonNDC = new THREE.Vector3();
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const pw = Math.max(2, Math.floor(w * this.ratio));
    const ph = Math.max(2, Math.floor(h * this.ratio));
    if (this.rtScene) {
      this.rtScene.dispose(); this.rtBloomA.dispose(); this.rtBloomB.dispose();
      this.rtBloomC.dispose(); this.rtBloomD.dispose(); this.rtGod.dispose();
    }
    this.rtScene = new THREE.WebGLRenderTarget(pw, ph, { samples: 4 });
    this.rtBloomA = new THREE.WebGLRenderTarget(pw >> 2, ph >> 2);
    this.rtBloomB = new THREE.WebGLRenderTarget(pw >> 2, ph >> 2);
    this.rtBloomC = new THREE.WebGLRenderTarget(pw >> 3, ph >> 3);
    this.rtBloomD = new THREE.WebGLRenderTarget(pw >> 3, ph >> 3);
    this.rtGod = new THREE.WebGLRenderTarget(pw >> 2, ph >> 2);
    this.rtGod.texture.minFilter = THREE.LinearFilter;
    for (const rt of [this.rtBloomA, this.rtBloomB, this.rtBloomC, this.rtBloomD]) {
      rt.texture.minFilter = THREE.LinearFilter;
    }
  }

  // ---------- static city, rebuilt when the district changes ----------
  build(g) {
    this.builtFor = g.d.id;
    // Drop everything from a previous district.
    this.scene.clear();
    this.dyn = {};
    this.signs = [];
    this.antennas = [];
    this.strikeFx = null;
    this.reconFx = null;

    const accent = new THREE.Color(g.d.palette.accent);

    // Lighting rig: blue night ambience + a shadow-casting moon key light.
    this.scene.add(new THREE.HemisphereLight(0x33507f, 0x0a0f1c, 1.5));
    const moon = new THREE.DirectionalLight(0x9fc2f0, 1.35);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near = 100;
    moon.shadow.camera.far = 3200;
    const sc = 760;
    moon.shadow.camera.left = -sc; moon.shadow.camera.right = sc;
    moon.shadow.camera.top = sc; moon.shadow.camera.bottom = -sc;
    moon.shadow.bias = -0.0006;
    this.moon = moon;
    this.moonTarget = new THREE.Object3D();
    this.scene.add(moon, this.moonTarget);
    moon.target = this.moonTarget;

    this.buildSky(g);

    // ----- wet-street mirror world -------------------------------------
    // Everything luminous gets a dimmed, y-flipped twin below street level.
    // The asphalt plane above it is slightly translucent, so the mirrored
    // city bleeds through like reflections on rain-soaked tarmac. Cheap,
    // artifact-free, and it sells "wet night city" harder than anything.
    this.mirror = new THREE.Group();
    this.scene.add(this.mirror);

    // Buildings: one instanced box per solid tile.
    const tiles = [];
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        if (g.grid[y][x]) tiles.push({ x, y, m: g.blockMeta[y][x] });
      }
    }
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0); // grow upward from the ground
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0e1424, roughness: 0.92 });
    // Two facade variants so adjacent blocks don't share one identical skin.
    const variants = [this.makeFacadeTextures(1), this.makeFacadeTextures(2)];
    const varGroups = [[], []];
    for (const t2 of tiles) varGroups[(t2.x * 3 + t2.y) % 2].push(t2);
    const mtx = new THREE.Matrix4();
    const col = new THREE.Color();
    const setbacks = [];
    let sideMat0 = null;
    varGroups.forEach((list, vi) => {
      const v = variants[vi];
      const sideMat = new THREE.MeshStandardMaterial({
        map: v.map, normalMap: v.normal, normalScale: new THREE.Vector2(0.7, 0.7),
        roughness: 0.82, metalness: 0.08,
        emissive: 0xffffff, emissiveMap: v.emissive, emissiveIntensity: 1.35,
      });
      if (!sideMat0) sideMat0 = sideMat;
      // Box face order: +x, -x, +y (roof), -y, +z, -z — windows on walls only.
      const mats = [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat];
      const inst = new THREE.InstancedMesh(boxGeo, mats, list.length);
      inst.castShadow = true;
      inst.receiveShadow = true;
      const mirrorMats = mats.map((m) => {
        const c = m.clone();
        c.side = THREE.BackSide; // y-flip reverses winding
        c.emissiveIntensity = (m.emissiveIntensity || 0) * 0.55;
        c.color = new THREE.Color(0x0a0e1a);
        return c;
      });
      const instM = new THREE.InstancedMesh(boxGeo, mirrorMats, list.length);
      list.forEach((t2, i) => {
        const h = t2.m.h * UP_SCALE;
        const s = g.tile - 6;
        const cx = (t2.x + 0.5) * g.tile, cz = (t2.y + 0.5) * g.tile;
        mtx.makeScale(s, h, s);
        mtx.setPosition(cx, 0, cz);
        inst.setMatrixAt(i, mtx);
        mtx.makeScale(s, -h, s);
        mtx.setPosition(cx, 0, cz);
        instM.setMatrixAt(i, mtx);
        col.setHSL(0.6, 0.2, 0.16 + t2.m.h * 0.09);
        inst.setColorAt(i, col);
        instM.setColorAt(i, col);
        if (t2.m.h > 0.78) setbacks.push({ cx, cz, h, s });
      });
      this.scene.add(inst);
      this.mirror.add(instM);
    });

    // Tower setbacks: the tallest blocks get a stepped upper tier, breaking
    // the flat-roof skyline the way real high-rises do.
    if (setbacks.length) {
      const mats2 = [sideMat0, sideMat0, roofMat, roofMat, sideMat0, sideMat0];
      const instS = new THREE.InstancedMesh(boxGeo, mats2, setbacks.length);
      instS.castShadow = true;
      setbacks.forEach((sb, i) => {
        mtx.makeScale(sb.s * 0.58, sb.h * 0.42, sb.s * 0.58);
        mtx.setPosition(sb.cx, sb.h, sb.cz);
        instS.setMatrixAt(i, mtx);
      });
      this.scene.add(instS);
    }

    // Roof clutter: AC units scattered on the roofs that have them.
    const acTiles = tiles.filter((t2) => t2.m.ac).slice(0, 220);
    if (acTiles.length) {
      const acMat = new THREE.MeshStandardMaterial({ color: 0x1c2536, roughness: 0.7, metalness: 0.4 });
      const instAC = new THREE.InstancedMesh(boxGeo, acMat, acTiles.length);
      acTiles.forEach((t2, i) => {
        const h = t2.m.h * UP_SCALE;
        const s = g.tile - 6;
        const ox = ((t2.x * 13 + t2.y * 7) % 10 - 5) * (s / 24);
        const oz = ((t2.x * 5 + t2.y * 17) % 10 - 5) * (s / 24);
        const w2 = 6 + ((t2.x + t2.y) % 3) * 2.5;
        mtx.makeScale(w2, 4.5, w2 * 0.8);
        mtx.setPosition((t2.x + 0.5) * g.tile + ox, h, (t2.y + 0.5) * g.tile + oz);
        instAC.setMatrixAt(i, mtx);
      });
      this.scene.add(instAC);
    }

    this.buildSigns(g, tiles);
    this.buildAntennas(g, tiles);

    // Ground goes in AFTER the mirror world: it is transparent, so three
    // renders it last and the mirrored city shows through the asphalt.
    const gt = this.makeGroundTexture(g);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(g.worldW, g.worldH),
      new THREE.MeshStandardMaterial({
        map: gt.map, normalMap: gt.normalMap, roughnessMap: gt.roughnessMap,
        normalScale: new THREE.Vector2(0.9, 0.9),
        roughness: 1, metalness: 0.18,
        transparent: true, opacity: 0.86, depthWrite: false,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(g.worldW / 2, 0.2, g.worldH / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);
    // Puddles: patches where the asphalt goes clearer, so the mirror world
    // reads sharper — standing water instead of damp tarmac.
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x0a101e, roughness: 0.06, metalness: 0.4,
      transparent: true, opacity: 0.5, depthWrite: false,
    });
    const puddleGeo = new THREE.CircleGeometry(1, 20);
    g.puddles.forEach((pu) => {
      const p = new THREE.Mesh(puddleGeo, puddleMat);
      p.rotation.x = -Math.PI / 2;
      p.scale.set(pu.rx * 1.6, pu.ry * 2.6, 1);
      p.position.set(pu.x, 0.45, pu.y);
      this.scene.add(p);
    });

    // Street lamps: emissive bulbs everywhere, real point lights on the
    // nearest few (swapped to follow the player, keeps the light count sane).
    const bulbGeo = new THREE.SphereGeometry(2.6, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    const bulbMirrorMat = new THREE.MeshBasicMaterial({ color: 0x8a6f47 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x151d2e, roughness: 0.6, metalness: 0.5 });
    const poleGeo = new THREE.CylinderGeometry(0.9, 1.2, 26, 6);
    const glowMat = new THREE.SpriteMaterial({
      map: this.makeGlowTexture(), color: 0xffb46e,
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5,
    });
    this.lampBulbs = g.lamps.map((l) => {
      const b = new THREE.Mesh(bulbGeo, bulbMat);
      b.position.set(l.x, 26, l.y);
      const bm = new THREE.Mesh(bulbGeo, bulbMirrorMat);
      bm.position.set(l.x, -26, l.y);
      if (this.props.lamp) {
        const p = this.props.lamp.clone(true);
        p.position.set(l.x, 0, l.y);
        this.scene.add(p);
      } else {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(l.x, 13, l.y);
        pole.castShadow = true;
        this.scene.add(pole);
      }
      // additive halo: the rain-fog aura every real streetlight carries
      const halo = new THREE.Sprite(glowMat);
      halo.scale.setScalar(46);
      halo.position.set(l.x, 27, l.y);
      this.scene.add(b, halo);
      this.mirror.add(bm);
      return b;
    });
    this.lampLights = Array.from({ length: 6 }, () => {
      const pl = new THREE.PointLight(0xffb46e, 3600, 320, 1.8);
      this.scene.add(pl);
      return pl;
    });

    // Car headlight spotlights: a pooled set assigned to the nearest cars.
    this.headlights = Array.from({ length: 4 }, () => {
      const sp = new THREE.SpotLight(0xfff3d0, 4200, 460, 0.5, 0.55, 1.7);
      const tgt = new THREE.Object3D();
      this.scene.add(sp, tgt);
      sp.target = tgt;
      sp.visible = false;
      return sp;
    });

    // Player: Vesper — a GLB model when one is provided, otherwise the
    // procedural hourglass figure — plus a cyan lamp that follows her.
    this.dyn.player = new THREE.Group();
    const figure = this.props.vesper
      ? this.props.vesper.clone(true)
      : this.makeFigure({
          height: 1.15, hipW: 1.55, shoulderW: 1.0,
          outfit: 0x161f36, skin: 0xdfe9f2,
          headGlow: 0x33e2ff,
        });
    this.dyn.playerBody = figure;
    this.dyn.player.add(figure);
    this.dyn.playerLight = new THREE.PointLight(accent, 4800, 360, 1.8);
    this.dyn.playerLight.position.y = 40;
    this.dyn.player.add(this.dyn.playerLight);
    // A glowing accent ring on the pavement marks the player from any height.
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(11, 14, 28),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 1;
    this.dyn.player.add(ring);
    this.scene.add(this.dyn.player);

    // Emitters: pulsing cores + a vertical sky-beam you can navigate by.
    const beamGeo = new THREE.CylinderGeometry(2.2, 4.5, 340, 10, 1, true);
    this.dyn.emitters = g.emitters.map(() => {
      const grp = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(6, 14, 14),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true })
      );
      core.position.y = 10;
      const beam = new THREE.Mesh(
        beamGeo,
        new THREE.MeshBasicMaterial({
          color: accent, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      );
      beam.position.y = 175;
      const light = new THREE.PointLight(accent, 0, 300, 1.8);
      light.position.y = 30;
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.makeGlowTexture(), color: accent,
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0,
      }));
      halo.position.y = 12;
      grp.add(core, beam, light, halo);
      // generated hardware model under the glow, when available
      if (this.props.emitter) grp.add(this.props.emitter.clone(true));
      this.scene.add(grp);
      return { grp, core, beam, light, halo };
    });

    // Sweepers: drone bodies with rotor rings + volumetric-style scan cones.
    // A GLB drone model replaces the sphere/rotor pair when provided; the
    // status sphere shrinks into an indicator light riding on top of it.
    this.dyn.sweepers = g.sweepers.map(() => {
      const grp = new THREE.Group();
      const body2 = new THREE.Mesh(
        new THREE.SphereGeometry(7, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffb454, emissive: 0xffb454, emissiveIntensity: 0.7, roughness: 0.35, metalness: 0.6 })
      );
      body2.position.y = 34;
      body2.castShadow = true;
      const rotor = new THREE.Mesh(
        new THREE.TorusGeometry(11, 1.1, 6, 20),
        new THREE.MeshStandardMaterial({ color: 0x2a3350, roughness: 0.4, metalness: 0.7 })
      );
      rotor.rotation.x = Math.PI / 2;
      rotor.position.y = 38;
      if (this.props.sweeper) {
        const p = this.props.sweeper.clone(true);
        p.position.y = 26;
        grp.add(p);
        body2.scale.setScalar(0.35); // becomes the alert-status beacon
        body2.position.y = 46;
        rotor.visible = false;
      }
      // Ground wash of the scan cone…
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(190, 24, -0.62, 1.24),
        new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 1.2;
      // …plus the beam itself, hanging in the rain like a searchlight.
      const air = new THREE.Mesh(
        new THREE.ConeGeometry(95, 190, 20, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xffc879, transparent: true, opacity: 0.06,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      );
      air.rotation.x = Math.PI / 2 - 0.18;
      air.position.set(0, 20, 95);
      air.rotation.order = "YXZ";
      grp.add(body2, rotor, disc, air);
      this.scene.add(grp);
      return { grp, body: body2, rotor, cone: disc, air };
    });

    // Cars: bodies with cabs, wheels, emissive lamps — mirrored in the wet.
    // GLB vehicles replace the procedural body, alternating between whichever
    // car variants loaded so the traffic isn't all one model (procedural
    // stays in the mirror world, where the reflection only needs a silhouette).
    const carModels = [this.props.car, this.props.car2].filter(Boolean);
    this.dyn.cars = g.cars.map((c, i) => {
      let grp;
      if (carModels.length) {
        grp = new THREE.Group();
        const p = carModels[i % carModels.length].clone(true);
        p.rotation.y = Math.PI / 2; // GLB convention: front toward +z → +x
        grp.add(p);
      } else {
        grp = this.makeCar(c, false);
      }
      const mir = this.makeCar(c, true);
      this.scene.add(grp);
      this.mirror.add(mir);
      return { grp, mir };
    });

    // Pedestrians: small figures under umbrellas. Body shapes vary from a
    // deterministic per-ped seed — many of the women carry a full hourglass
    // build (wide hips, narrow waist, strong thighs).
    this.dyn.peds = g.peds.map((ped, i) => {
      const grp = new THREE.Group();
      const seed = (i * 2654435761) % 1000 / 1000;
      let fig;
      if (this.props.ped) {
        fig = this.props.ped.clone(true);
        fig.scale.multiplyScalar(0.9 + (seed * 7 % 1) * 0.2);
        fig.rotation.y = seed * Math.PI * 2;
      } else {
        const curvy = seed < 0.55; // just over half the crowd
        fig = this.makeFigure({
          height: 0.52 + (seed * 7 % 1) * 0.1,
          hipW: curvy ? 1.5 + (seed * 13 % 1) * 0.45 : 1.0 + (seed * 13 % 1) * 0.2,
          shoulderW: curvy ? 0.85 : 1.0 + (seed * 17 % 1) * 0.25,
          outfit: 0x0d1420, skin: 0x9a8474,
        });
        const um = new THREE.Mesh(
          new THREE.ConeGeometry(8, 4, 10),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(ped.tint).multiplyScalar(0.4), roughness: 0.5 })
        );
        um.position.y = 19;
        grp.add(um);
      }
      grp.add(fig);
      this.scene.add(grp);
      return grp;
    });

    this.buildRain(g);
    this.buildSkyCars(g);
    this.buildHolos(g);

    this.camPos = new THREE.Vector3(g.player.x, 560, g.player.y + 240);
  }

  // A stylized human figure with controllable proportions. hipW widens the
  // hips/glutes/thighs and narrows the waist toward an hourglass build;
  // shoulderW broadens the upper body. height scales the whole figure.
  makeFigure({ height = 1, hipW = 1, shoulderW = 1, outfit = 0x161f36, skin = 0x9a8474, headGlow = null }) {
    const grp = new THREE.Group();
    const outfitMat = new THREE.MeshStandardMaterial({ color: outfit, roughness: 0.6 });
    const skinMat = headGlow
      ? new THREE.MeshStandardMaterial({ color: skin, emissive: headGlow, emissiveIntensity: 0.22, roughness: 0.4 })
      : new THREE.MeshStandardMaterial({ color: skin, roughness: 0.5 });

    // thighs: fuller and spread with hip width
    const thighR = 2.6 + hipW * 0.9;
    [-1, 1].forEach((side) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(thighR * 0.62, 8.5, 4, 8), outfitMat);
      leg.position.set(side * hipW * 2.4, 6, 0);
      leg.castShadow = true;
      grp.add(leg);
    });
    // hips/glutes: a wide ellipsoid, the center of mass of the silhouette
    const hips = new THREE.Mesh(new THREE.SphereGeometry(5.6, 14, 12), outfitMat);
    hips.scale.set(hipW * 1.02, 0.82, 0.9 + hipW * 0.22);
    hips.position.y = 11.8;
    hips.castShadow = true;
    grp.add(hips);
    // waist: pinched relative to the hips
    const waist = new THREE.Mesh(new THREE.CapsuleGeometry(3.1, 3.5, 4, 10), outfitMat);
    waist.position.y = 16.5;
    grp.add(waist);
    // chest + shoulders
    const chest = new THREE.Mesh(new THREE.SphereGeometry(4.1, 12, 10), outfitMat);
    chest.scale.set(shoulderW * 1.15, 0.95, 0.9);
    chest.position.y = 20.5;
    chest.castShadow = true;
    grp.add(chest);
    const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 7 * shoulderW, 4, 8), outfitMat);
    shoulders.rotation.z = Math.PI / 2;
    shoulders.position.y = 22.5;
    grp.add(shoulders);
    // head + hair cap
    const head = new THREE.Mesh(new THREE.SphereGeometry(3.9, 14, 14), skinMat);
    head.position.y = 27.5;
    head.castShadow = true;
    grp.add(head);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(4.15, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.7 })
    );
    hair.position.y = 28.1;
    grp.add(hair);

    grp.scale.setScalar(height);
    return grp;
  }

  makeCar(c, mirrored) {
    const grp = new THREE.Group();
    const dim = mirrored ? 0.35 : 1;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(c.body).multiplyScalar(dim),
      roughness: 0.22, metalness: 0.75,
      side: mirrored ? THREE.BackSide : THREE.FrontSide,
    });
    const body3 = new THREE.Mesh(new THREE.BoxGeometry(c.len, 9, c.wid), bodyMat);
    body3.position.y = 8;
    if (!mirrored) body3.castShadow = true;
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(c.len * 0.45, 7, c.wid * 0.85),
      new THREE.MeshStandardMaterial({
        color: 0x0b111c, roughness: 0.06, metalness: 0.85,
        side: mirrored ? THREE.BackSide : THREE.FrontSide,
      })
    );
    cab.position.set(-c.len * 0.05, 15.5, 0);
    const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c2).multiplyScalar(dim) });
    const tailMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3648).multiplyScalar(dim) });
    const lampL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.4, 2.4), lampMat);
    lampL.position.set(c.len / 2, 7, -c.wid / 2 + 2.4);
    const lampR = lampL.clone(); lampR.position.z = c.wid / 2 - 2.4;
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 2.2), tailMat);
    tailL.position.set(-c.len / 2, 7, -c.wid / 2 + 2.2);
    const tailR = tailL.clone(); tailR.position.z = c.wid / 2 - 2.2;
    grp.add(body3, cab, lampL, lampR, tailL, tailR);
    if (!mirrored) {
      const wheelGeo = new THREE.CylinderGeometry(3.4, 3.4, 2.4, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.9 });
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([fx, fz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(fx * c.len * 0.32, 3.4, fz * (c.wid / 2 - 0.6));
        grp.add(w);
      });
    } else {
      grp.scale.y = -1;
    }
    return grp;
  }

  buildSky(g) {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const x = c.getContext("2d");
    const grad = x.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#020308");
    grad.addColorStop(0.55, "#071021");
    grad.addColorStop(0.8, "#0d1a30");
    grad.addColorStop(1, "#16233d");
    x.fillStyle = grad;
    x.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 340; i++) { // stars, denser near the zenith
      const sy = Math.pow(Math.random(), 1.7) * 300;
      x.fillStyle = `rgba(${200 + Math.random() * 55 | 0},${210 + Math.random() * 45 | 0},255,${0.25 + Math.random() * 0.65})`;
      const s = Math.random() < 0.08 ? 2 : 1;
      x.fillRect(Math.random() * 1024, sy, s, s);
    }
    // moon with a soft halo
    const mg = x.createRadialGradient(780, 105, 8, 780, 105, 90);
    mg.addColorStop(0, "rgba(225,238,255,0.95)");
    mg.addColorStop(0.12, "rgba(200,220,250,0.5)");
    mg.addColorStop(1, "rgba(160,190,240,0)");
    x.fillStyle = mg;
    x.fillRect(660, 0, 260, 240);
    x.fillStyle = "#e8f1ff";
    x.beginPath(); x.arc(780, 105, 17, 0, Math.PI * 2); x.fill();
    x.fillStyle = "rgba(190,205,235,0.55)";
    x.beginPath(); x.arc(774, 100, 4, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(786, 111, 3, 0, Math.PI * 2); x.fill();
    // low cloud murk banded above the skyline
    for (let i = 0; i < 26; i++) {
      const cy = 240 + Math.random() * 200;
      const cg = x.createRadialGradient(0, 0, 0, 0, 0, 90);
      cg.addColorStop(0, "rgba(24,36,60,0.24)");
      cg.addColorStop(1, "rgba(24,36,60,0)");
      x.save();
      x.translate(Math.random() * 1024, cy);
      x.scale(3.2, 0.7);
      x.fillStyle = cg;
      x.fillRect(-90, -90, 180, 180);
      x.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const cx = g.worldW / 2, cz = g.worldH / 2;
    this.skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(2600, 28, 18),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })
    );
    this.skyDome.position.set(cx, -140, cz);
    this.scene.add(this.skyDome);
  }

  buildSigns(g, tiles) {
    // Neon signage from block metadata, hung on walls that face a street.
    const signGeo = new THREE.PlaneGeometry(1, 1);
    let count = 0;
    for (const t2 of tiles) {
      if (!t2.m.sign || count >= 60) continue;
      // pick an open-street face for the sign
      const dirs = [[1, 0, 0], [-1, 0, Math.PI], [0, 1, -Math.PI / 2], [0, -1, Math.PI / 2]];
      const open = dirs.find(([dx2, dy2]) => {
        const nx = t2.x + dx2, ny = t2.y + dy2;
        return ny >= 0 && ny < g.rows && nx >= 0 && nx < g.cols && !g.grid[ny][nx];
      });
      if (!open) continue;
      count++;
      const meta = t2.m.sign;
      const mat = new THREE.MeshBasicMaterial({
        color: meta.color, transparent: true, opacity: 0.95,
        side: THREE.DoubleSide, fog: true,
      });
      const s = g.tile - 6;
      const h = t2.m.h * UP_SCALE;
      const sw = 8 + ((t2.x * 7 + t2.y * 13) % 3) * 6, sh = Math.min(h * 0.5, 34 + ((t2.x + t2.y) % 3) * 14);
      const sign = new THREE.Mesh(signGeo, mat);
      sign.scale.set(sw, sh, 1);
      const cx = (t2.x + 0.5) * g.tile, cz = (t2.y + 0.5) * g.tile;
      sign.position.set(cx + open[0] * (s / 2 + 1.2), Math.min(h * 0.62, sh / 2 + 26), cz + open[1] * (s / 2 + 1.2));
      sign.rotation.y = open[2];
      this.scene.add(sign);
      const mir = sign.clone();
      mir.material = mat.clone();
      mir.material.opacity = 0.3;
      mir.position.y *= -1;
      mir.scale.y *= -1;
      this.mirror.add(mir);
      this.signs.push({ mesh: sign, mir, meta });
    }
  }

  buildAntennas(g, tiles) {
    // Blinking aircraft-warning beacons on the tallest antenna roofs.
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.6 });
    const mastGeo = new THREE.CylinderGeometry(0.5, 0.8, 22, 5);
    const tipGeo = new THREE.SphereGeometry(1.7, 8, 8);
    let count = 0;
    for (const t2 of tiles) {
      if (!t2.m.antenna || count >= 40) continue;
      count++;
      const h = t2.m.h * UP_SCALE;
      const cx = (t2.x + 0.5) * g.tile, cz = (t2.y + 0.5) * g.tile;
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(cx, h + 11, cz);
      const tip = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: 0xff2f4a }));
      tip.position.set(cx, h + 23, cz);
      this.scene.add(mast, tip);
      this.antennas.push({ tip, phase: (t2.x * 31 + t2.y * 17) % 7 });
    }
  }

  buildRain(g) {
    // Wind-slanted rain streaks (line segments), recycled around the camera.
    const count = 700;
    this.rainData = [];
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      this.rainData.push({
        x: Math.random() * g.worldW,
        y: Math.random() * 420,
        z: Math.random() * g.worldH,
        v: 320 + Math.random() * 160,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.dyn.rain = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        color: 0x9cc4ea, transparent: true, opacity: 0.34,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.dyn.rain.frustumCulled = false;
    this.scene.add(this.dyn.rain);

    // Splash rings where drops hit the street around the player.
    const splashGeo = new THREE.RingGeometry(0.8, 1, 14);
    this.splashes = Array.from({ length: 26 }, () => {
      const m = new THREE.Mesh(
        splashGeo,
        new THREE.MeshBasicMaterial({
          color: 0x9cc4ea, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.6;
      this.scene.add(m);
      return { m, t: Math.random() * 0.5, dur: 0.32 + Math.random() * 0.22 };
    });
  }

  // Sobel a grayscale height canvas into a tangent-space normal map.
  makeNormalMap(hc, strength = 2.2) {
    const w = hc.width, h = hc.height;
    const src = hc.getContext("2d").getImageData(0, 0, w, h).data;
    const out = document.createElement("canvas");
    out.width = w; out.height = h;
    const octx = out.getContext("2d");
    const img = octx.createImageData(w, h);
    const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (H(x - 1, y) - H(x + 1, y)) * strength;
        const dy = (H(x, y - 1) - H(x, y + 1)) * strength;
        const inv = 1 / Math.hypot(dx, dy, 1);
        const o = (y * w + x) * 4;
        img.data[o] = (dx * inv * 0.5 + 0.5) * 255;
        img.data[o + 1] = (dy * inv * 0.5 + 0.5) * 255;
        img.data[o + 2] = (inv * 0.5 + 0.5) * 255;
        img.data[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(out);
  }

  // Soft radial glow used as an additive halo sprite on light sources.
  makeGlowTexture() {
    if (this.glowTex) return this.glowTex;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const gr = x.createRadialGradient(64, 64, 2, 64, 64, 62);
    gr.addColorStop(0, "rgba(255,255,255,0.9)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.28)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    this.glowTex = new THREE.CanvasTexture(c);
    return this.glowTex;
  }

  // Street hologram projectors: a glass cube beaming an additive light cone
  // up to a translucent, slowly-rotating holographic bust with an emissive
  // rim and a point light. Purely cosmetic set dressing.
  buildHolos(g) {
    this.dyn.holos = (g.holos || []).map((ho) => {
      const grp = new THREE.Group();
      const tint = new THREE.Color(ho.tint);
      // glass projector cube
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(12, 10, 12),
        new THREE.MeshStandardMaterial({ color: 0x14202f, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.8, emissive: tint, emissiveIntensity: 0.3 })
      );
      cube.position.y = 5;
      cube.castShadow = true;
      // upward light cone
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(20, 60, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      cone.position.y = 42;
      // holographic bust: head + shoulders, translucent + emissive
      const bust = new THREE.Group();
      const holoMat = new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
      const head = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 14), holoMat);
      head.position.y = 6;
      const hair = new THREE.Mesh(new THREE.SphereGeometry(6.3, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), holoMat);
      hair.position.y = 7;
      const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(4, 11, 10, 16, 1, true), holoMat);
      shoulders.position.y = -5;
      bust.add(head, hair, shoulders);
      bust.position.y = 60;
      bust.scale.setScalar(1.4);
      const light = new THREE.PointLight(tint, 1400, 220, 2);
      light.position.y = 55;
      grp.add(cube, cone, bust, light);
      grp.position.set(ho.x, 0, ho.y);
      this.scene.add(grp);
      return { grp, bust, cone, light, tint };
    });
  }

  // Luxury hovercars gliding over the district: a GLB body when provided,
  // otherwise a sleek procedural wedge, each with an underglow disc, twin
  // thruster sprites and a downward mist cone.
  buildSkyCars(g) {
    const glow = this.makeGlowTexture();
    const hoverModels = [this.props.hovercar, this.props.hovercar2].filter(Boolean);
    this.dyn.skyCars = g.skyCars.map((s, si) => {
      const grp = new THREE.Group();
      const tint = new THREE.Color(s.tint);
      let body;
      if (hoverModels.length) {
        body = hoverModels[si % hoverModels.length].clone(true);
      } else {
        body = new THREE.Group();
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(20, 18, 10),
          new THREE.MeshStandardMaterial({ color: 0x0e1622, roughness: 0.25, metalness: 0.8, emissive: tint, emissiveIntensity: 0.15 })
        );
        shell.scale.set(1, 0.32, 0.6);
        shell.castShadow = true;
        const canopy = new THREE.Mesh(
          new THREE.SphereGeometry(9, 14, 10),
          new THREE.MeshStandardMaterial({ color: 0x66c8ff, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.6 })
        );
        canopy.scale.set(1, 0.5, 0.7);
        canopy.position.set(2, 5, 0);
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(30, 1, 1.6),
          new THREE.MeshBasicMaterial({ color: tint })
        );
        strip.position.set(-2, 2, 6.2);
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 2.2, 10),
          new THREE.MeshBasicMaterial({ color: 0xeaf7ff })
        );
        head.position.set(19, 1, 0);
        body.add(shell, canopy, strip, head);
      }
      // underglow disc on the belly
      const disc = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glow, color: tint, blending: THREE.AdditiveBlending,
        depthWrite: false, transparent: true, opacity: 0.7,
      }));
      disc.scale.setScalar(70);
      disc.position.y = -6;
      // twin thruster flares at the rear
      const flareMat = new THREE.SpriteMaterial({
        map: glow, color: tint, blending: THREE.AdditiveBlending,
        depthWrite: false, transparent: true, opacity: 0.9,
      });
      const f1 = new THREE.Sprite(flareMat); f1.scale.setScalar(20); f1.position.set(-22, 0, -6);
      const f2 = new THREE.Sprite(flareMat); f2.scale.setScalar(20); f2.position.set(-22, 0, 6);
      // downward mist cone
      const mist = new THREE.Mesh(
        new THREE.ConeGeometry(26, s.alt, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x9cd2ff, transparent: true, opacity: 0.06,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      );
      mist.position.y = -s.alt / 2;
      const light = new THREE.PointLight(tint, 2600, 420, 1.8);
      light.position.y = -4;
      grp.add(body, disc, f1, f2, mist, light);
      this.scene.add(grp);
      return { grp, body };
    });
  }

  makeGroundTexture(g) {
    const px = 24; // texels per tile
    const c = document.createElement("canvas");
    c.width = g.cols * px; c.height = g.rows * px;
    const x = c.getContext("2d");
    // parallel height + roughness canvases for normal/roughness maps
    const hgt = document.createElement("canvas");
    hgt.width = c.width; hgt.height = c.height;
    const xh = hgt.getContext("2d");
    const rgh = document.createElement("canvas");
    rgh.width = c.width; rgh.height = c.height;
    const xr = rgh.getContext("2d");
    x.fillStyle = "#1b2438";
    x.fillRect(0, 0, c.width, c.height);
    xh.fillStyle = "#808080";
    xh.fillRect(0, 0, c.width, c.height);
    xr.fillStyle = "#6f6f6f"; // damp asphalt: mid roughness
    xr.fillRect(0, 0, c.width, c.height);
    // asphalt grain (albedo + height speckle + roughness variance)
    for (let i = 0; i < c.width * c.height / 28; i++) {
      const gx = Math.random() * c.width, gy = Math.random() * c.height;
      const lite = Math.random() < 0.5;
      x.fillStyle = `rgba(${lite ? "255,255,255" : "0,0,0"},${0.02 + Math.random() * 0.05})`;
      x.fillRect(gx, gy, 1.5, 1.5);
      xh.fillStyle = `rgba(${lite ? "255,255,255" : "0,0,0"},0.25)`;
      xh.fillRect(gx, gy, 1.5, 1.5);
    }
    // slick patches: locally low roughness so lamp light smears like water
    for (let i = 0; i < (c.width * c.height) / 22000; i++) {
      const gr2 = xr.createRadialGradient(0, 0, 2, 0, 0, 26);
      gr2.addColorStop(0, "rgba(18,18,18,0.85)");
      gr2.addColorStop(1, "rgba(18,18,18,0)");
      xr.save();
      xr.translate(Math.random() * c.width, Math.random() * c.height);
      xr.scale(1.6, 0.8);
      xr.fillStyle = gr2;
      xr.fillRect(-26, -26, 52, 52);
      xr.restore();
    }
    for (let ty = 0; ty < g.rows; ty++) {
      for (let tx = 0; tx < g.cols; tx++) {
        const isB = g.grid[ty][tx];
        if (isB) {
          x.fillStyle = "#0d1322";
          x.fillRect(tx * px, ty * px, px, px);
          xr.fillStyle = "#e0e0e0"; // building footprints: rough, no sheen
          xr.fillRect(tx * px, ty * px, px, px);
          continue;
        }
        // sidewalk edging beside buildings (raised curb in the height map)
        const edge = (dx2, dy2) => {
          const nx = tx + dx2, ny = ty + dy2;
          return ny >= 0 && ny < g.rows && nx >= 0 && nx < g.cols && g.grid[ny][nx];
        };
        x.fillStyle = "#1d2740";
        xh.fillStyle = "#b8b8b8";
        if (edge(-1, 0)) { x.fillRect(tx * px, ty * px, 4, px); xh.fillRect(tx * px, ty * px, 4, px); }
        if (edge(1, 0)) { x.fillRect(tx * px + px - 4, ty * px, 4, px); xh.fillRect(tx * px + px - 4, ty * px, 4, px); }
        if (edge(0, -1)) { x.fillRect(tx * px, ty * px, px, 4); xh.fillRect(tx * px, ty * px, px, 4); }
        if (edge(0, 1)) { x.fillRect(tx * px, ty * px + px - 4, px, 4); xh.fillRect(tx * px, ty * px + px - 4, px, 4); }
        // lane dashes (slightly proud of the asphalt, like thermoplastic paint)
        x.fillStyle = "rgba(215,225,195,0.4)";
        xh.fillStyle = "rgba(255,255,255,0.35)";
        if (tx % 4 === 0 && ty % 4 !== 0) {
          x.fillRect(tx * px + px / 2 - 1, ty * px + 4, 2, px - 8);
          xh.fillRect(tx * px + px / 2 - 1, ty * px + 4, 2, px - 8);
        }
        if (ty % 4 === 0 && tx % 4 !== 0) {
          x.fillRect(tx * px + 4, ty * px + px / 2 - 1, px - 8, 2);
          xh.fillRect(tx * px + 4, ty * px + px / 2 - 1, px - 8, 2);
        }
        // crosswalk zebra at intersections
        if (tx % 4 === 0 && ty % 4 === 0) {
          x.fillStyle = "rgba(220,228,240,0.28)";
          xh.fillStyle = "rgba(255,255,255,0.3)";
          for (let k = 3; k < px - 3; k += 5) {
            x.fillRect(tx * px + k, ty * px + 5, 3, px - 10);
            xh.fillRect(tx * px + k, ty * px + 5, 3, px - 10);
          }
        }
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const normalMap = this.makeNormalMap(hgt, 1.8);
    normalMap.anisotropy = 4;
    const roughnessMap = new THREE.CanvasTexture(rgh);
    return { map: tex, normalMap, roughnessMap };
  }

  makeFacadeTextures(variant = 1) {
    // 512px facade: varied window warmth per unit, dark floors, mullions,
    // floor ledges, and a bright storefront band at street level. The
    // emissive canvas holds only the glass, so walls don't glow, and a
    // parallel height canvas turns into a normal map (inset windows,
    // proud ledges) so the moonlight actually grips the wall.
    const c = document.createElement("canvas");
    const e = document.createElement("canvas");
    const hgt = document.createElement("canvas");
    c.width = c.height = e.width = e.height = hgt.width = hgt.height = 512;
    const x = c.getContext("2d");
    const xe = e.getContext("2d");
    const xh = hgt.getContext("2d");
    x.fillStyle = "#0a0e1a";
    x.fillRect(0, 0, 512, 512);
    xe.fillStyle = "#000";
    xe.fillRect(0, 0, 512, 512);
    xh.fillStyle = "#808080";
    xh.fillRect(0, 0, 512, 512);
    // concrete tone noise
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${0.015 + Math.random() * 0.03})`;
      x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const floorH = variant === 1 ? 44 : 38;
    const winStep = variant === 1 ? 30 : 24;
    const litP = variant === 1 ? 0.3 : 0.24;
    for (let fy = 512 - floorH; fy > 30; fy -= floorH) {
      // ledge line between floors (proud in the height map)
      x.fillStyle = "rgba(255,255,255,0.05)";
      x.fillRect(0, fy, 512, 2);
      xh.fillStyle = "#c8c8c8";
      xh.fillRect(0, fy, 512, 3);
      const groundFloor = fy >= 512 - floorH;
      const floorDark = !groundFloor && Math.random() < 0.22; // whole floor unlit
      for (let wx = 10; wx < 500; wx += winStep) {
        const w = winStep * 0.6, h = groundFloor ? 34 : floorH * 0.6;
        const wy = fy + (groundFloor ? 6 : 9);
        // frame
        x.fillStyle = "#131a2e";
        x.fillRect(wx - 2, wy - 2, w + 4, h + 4);
        // window glass sits inset from the wall plane
        xh.fillStyle = "#4a4a4a";
        xh.fillRect(wx, wy, w, h);
        let lit = groundFloor ? Math.random() < 0.55 : !floorDark && Math.random() < litP;
        if (lit) {
          // window color temperature varies: warm homes, cool offices, tv glow
          const r = Math.random();
          const tone = r < 0.6 ? [255, 196, 130] : r < 0.85 ? [190, 220, 255] : [140, 190, 255];
          const a = 0.55 + Math.random() * 0.45;
          x.fillStyle = `rgb(${tone[0]},${tone[1]},${tone[2]})`;
          x.fillRect(wx, wy, w, h);
          xe.fillStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${a})`;
          xe.fillRect(wx, wy, w, h);
          // half-drawn blinds on some
          if (Math.random() < 0.3) {
            const bh = h * (0.3 + Math.random() * 0.4);
            x.fillStyle = "#1a2338";
            x.fillRect(wx, wy, w, bh);
            xe.fillStyle = "rgba(0,0,0,0.85)";
            xe.fillRect(wx, wy, w, bh);
          }
          // mullion cross
          x.fillStyle = "rgba(10,14,26,0.8)";
          x.fillRect(wx + w / 2 - 1, wy, 2, h);
          x.fillRect(wx, wy + h / 2 - 1, w, 2);
          xe.fillStyle = "rgba(0,0,0,0.6)";
          xe.fillRect(wx + w / 2 - 1, wy, 2, h);
          xe.fillRect(wx, wy + h / 2 - 1, w, 2);
        } else {
          // dark glass still catches a faint sky sheen
          x.fillStyle = "#101728";
          x.fillRect(wx, wy, w, h);
          x.fillStyle = "rgba(120,150,200,0.07)";
          x.fillRect(wx, wy, w, h / 3);
        }
      }
    }
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const emissive = new THREE.CanvasTexture(e);
    emissive.colorSpace = THREE.SRGBColorSpace;
    const normal = this.makeNormalMap(hgt, 2.4);
    normal.anisotropy = 4;
    return { map, emissive, normal };
  }

  // ---------- per-frame sync ----------
  render(g, now) {
    if (this.builtFor !== g.d.id) this.build(g);
    const d = this.dyn;
    const t0 = performance.now();

    d.player.position.set(g.player.x, 0, g.player.y);
    d.player.rotation.y = -g.player.angle;
    // walking bob (a hint of hip sway) + a slight lean into motion
    const moving = Math.hypot(g.player.vx || 0, g.player.vy || 0) > 4;
    d.playerBody.position.y = moving ? Math.abs(Math.sin(now * 0.011)) * 1.1 : 0;
    d.playerBody.rotation.z = moving ? Math.sin(now * 0.0055) * 0.05 : 0;
    d.player.rotation.x = moving ? 0.06 : 0;

    // moon + shadow frustum track the player so shadows stay crisp
    this.moon.position.set(g.player.x - 620, 900, g.player.y + 380);
    this.moonTarget.position.set(g.player.x, 0, g.player.y);

    g.emitters.forEach((e, i) => {
      const m = d.emitters[i];
      m.grp.position.set(e.x, 0, e.y);
      if (e.neutralized) {
        m.core.material.opacity = 0.18;
        m.beam.material.opacity = 0;
        m.light.intensity = 0;
        return;
      }
      const vis = Math.max(0, 1 - Math.hypot(e.x - g.player.x, e.y - g.player.y) / 300);
      const pulse = 0.6 + 0.4 * Math.sin(e.pulse * 3);
      m.core.material.opacity = 0.15 + vis * 0.85;
      m.core.scale.setScalar(1 + pulse * 0.5);
      m.beam.material.opacity = 0.04 + vis * 0.3 * pulse;
      m.light.intensity = vis * 2600 * pulse;
      m.halo.material.opacity = 0.12 + vis * 0.5 * pulse;
      m.halo.scale.setScalar(34 + pulse * 26);
    });

    g.sweepers.forEach((s, i) => {
      const m = d.sweepers[i];
      m.grp.position.set(s.x, 0, s.y);
      m.grp.rotation.y = -s.angle;
      m.rotor.rotation.z = now * 0.02;
      const c2 = s.alert ? 0xff3b7f : (s.sus || 0) > 0.12 ? 0xffd24f : 0xffb454;
      m.body.material.color.setHex(c2);
      m.body.material.emissive.setHex(c2);
      m.cone.material.color.setHex(c2);
      m.cone.material.opacity = s.alert ? 0.18 : 0.1;
      m.air.material.color.setHex(c2);
      m.air.material.opacity = s.alert ? 0.11 : 0.055;
    });

    g.cars.forEach((c2, i) => {
      const { grp, mir } = d.cars[i];
      const x = c2.vertical ? c2.lane + 15 * c2.dir : c2.pos;
      const y = c2.vertical ? c2.pos : c2.lane + 15 * -c2.dir;
      const rot = c2.vertical ? (c2.dir > 0 ? -Math.PI / 2 : Math.PI / 2) : (c2.dir > 0 ? 0 : Math.PI);
      grp.position.set(x, 0, y);
      grp.rotation.y = rot;
      mir.position.set(x, 0, y);
      mir.rotation.y = rot;
    });

    g.peds.forEach((ped, i) => {
      d.peds[i].position.set(ped.x, 0, ped.y);
    });

    // The nearest street lamps carry real point lights.
    const nearest = [...g.lamps]
      .map((l) => ({ l, d2: (l.x - g.player.x) ** 2 + (l.y - g.player.y) ** 2 }))
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, this.lampLights.length);
    this.lampLights.forEach((pl, i) => {
      if (nearest[i]) {
        pl.position.set(nearest[i].l.x, 26, nearest[i].l.y);
        pl.intensity = 1000;
      } else pl.intensity = 0;
    });

    // Headlight spotlights ride the nearest cars.
    const nearCars = g.cars
      .map((c2, i) => {
        const x = c2.vertical ? c2.lane + 15 * c2.dir : c2.pos;
        const y = c2.vertical ? c2.pos : c2.lane + 15 * -c2.dir;
        return { c2, x, y, d2: (x - g.player.x) ** 2 + (y - g.player.y) ** 2 };
      })
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, this.headlights.length);
    this.headlights.forEach((sp, i) => {
      const n = nearCars[i];
      if (!n) { sp.visible = false; return; }
      sp.visible = true;
      const fx = n.c2.vertical ? 0 : n.c2.dir;
      const fz = n.c2.vertical ? n.c2.dir : 0;
      sp.position.set(n.x + fx * n.c2.len * 0.5, 8, n.y + fz * n.c2.len * 0.5);
      sp.target.position.set(n.x + fx * 190, 0, n.y + fz * 190);
    });

    this.syncStrike(g);
    this.syncRecon(g);

    // Hologram busts slowly rotate and flicker.
    (g.holos || []).forEach((ho, i) => {
      const m = this.dyn.holos && this.dyn.holos[i];
      if (!m) return;
      m.bust.rotation.y = ho.phase * 0.7;
      const flick = 0.82 + 0.18 * Math.sin(now * 0.02 + ho.phase * 7);
      m.bust.children.forEach((c) => { c.material.opacity = 0.5 * flick; });
      m.cone.material.opacity = 0.1 * flick;
      m.light.intensity = 1400 * flick;
    });

    // Sky hovercars: place at altitude, bob, and face along their lane.
    g.skyCars.forEach((s, i) => {
      const m = this.dyn.skyCars[i];
      if (!m) return;
      const wx = s.vertical ? s.lane : s.pos;
      const wy = s.vertical ? s.pos : s.lane;
      m.grp.position.set(wx, s.alt + Math.sin(s.phase * 1.6) * 6, wy);
      m.grp.rotation.y = s.vertical ? (s.dir > 0 ? -Math.PI / 2 : Math.PI / 2) : (s.dir > 0 ? 0 : Math.PI);
    });

    // Neon sign flicker.
    for (const s of this.signs) {
      if (!s.meta.flicker) continue;
      const on = Math.sin(now * 0.011 + s.meta.phase) > -0.82 || Math.random() < 0.02;
      s.mesh.material.opacity = on ? 0.95 : 0.12;
      s.mir.material.opacity = on ? 0.3 : 0.04;
    }
    // Antenna beacons blink slowly out of phase.
    for (const a of this.antennas) {
      a.tip.material.color.setHex(Math.sin(now * 0.002 + a.phase) > 0.35 ? 0xff2f4a : 0x36131c);
    }
    // The cloud dome drifts.
    if (this.skyDome) this.skyDome.rotation.y = now * 0.000012;

    // Rain streaks fall along the wind vector.
    const wind = (g.wind || 0.1) * 140;
    const rainPos = d.rain.geometry.attributes.position;
    const slant = 0.05;
    for (let i = 0; i < this.rainData.length; i++) {
      const r = this.rainData[i];
      r.y -= r.v * 0.016;
      r.x += wind * 0.016;
      if (r.y < 0) { r.y = 380 + Math.random() * 40; r.x = g.player.x + (Math.random() - 0.5) * 900; r.z = g.player.y + (Math.random() - 0.5) * 900; }
      const len = r.v * slant;
      rainPos.setXYZ(i * 2, r.x, r.y, r.z);
      rainPos.setXYZ(i * 2 + 1, r.x - wind * slant, r.y + len, r.z);
    }
    rainPos.needsUpdate = true;
    d.rain.material.opacity = g.weather.mode === "storm" ? 0.5 : g.weather.mode === "rain" ? 0.34 : 0.18;

    // Ground splash rings cycle around the player, denser in heavier rain.
    const splashGain = g.weather.mode === "storm" ? 0.45 : g.weather.mode === "rain" ? 0.3 : 0.16;
    for (const sp of this.splashes) {
      sp.t += 0.016;
      if (sp.t >= sp.dur) {
        sp.t = 0;
        sp.dur = 0.32 + Math.random() * 0.22;
        sp.m.position.set(
          g.player.x + (Math.random() - 0.5) * 620, 0.6,
          g.player.y + (Math.random() - 0.5) * 620);
      }
      const q = sp.t / sp.dur;
      sp.m.scale.setScalar(1.5 + q * 7);
      sp.m.material.opacity = splashGain * (1 - q);
    }

    // Lightning bumps the exposure for a frame.
    this.renderer.toneMappingExposure = 1.25 + (g.flash || 0) * 1.7;

    // Cinematic chase camera: lower and closer than a map view, looking a
    // touch ahead of the player, with a slow handheld sway.
    const sway = Math.sin(now * 0.0006) * 6;
    const target = new THREE.Vector3(g.player.x + sway * 0.4, 12, g.player.y - 30);
    this.camPos.lerp(new THREE.Vector3(g.player.x + sway, 560, g.player.y + 240), 0.055);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(target);

    // ---- render: scene -> bloom -> composite ----
    if (this.quality >= 2) {
      this.renderer.setRenderTarget(this.rtScene);
      this.renderer.render(this.scene, this.camera);
      // bright pass at quarter res
      this.postQuad.material = this.matBright;
      this.matBright.uniforms.tex.value = this.rtScene.texture;
      this.renderer.setRenderTarget(this.rtBloomA);
      this.renderer.render(this.postScene, this.postCam);
      // separable blur
      this.postQuad.material = this.matBlur;
      this.matBlur.uniforms.tex.value = this.rtBloomA.texture;
      this.matBlur.uniforms.dir.value.set(1 / this.rtBloomA.width, 0);
      this.renderer.setRenderTarget(this.rtBloomB);
      this.renderer.render(this.postScene, this.postCam);
      this.matBlur.uniforms.tex.value = this.rtBloomB.texture;
      this.matBlur.uniforms.dir.value.set(0, 1 / this.rtBloomA.height);
      this.renderer.setRenderTarget(this.rtBloomA);
      this.renderer.render(this.postScene, this.postCam);
      // second bloom octave: blur down again at 1/8 res for a wide halo
      this.matBlur.uniforms.tex.value = this.rtBloomA.texture;
      this.matBlur.uniforms.dir.value.set(1.5 / this.rtBloomC.width, 0);
      this.renderer.setRenderTarget(this.rtBloomC);
      this.renderer.render(this.postScene, this.postCam);
      this.matBlur.uniforms.tex.value = this.rtBloomC.texture;
      this.matBlur.uniforms.dir.value.set(0, 1.5 / this.rtBloomC.height);
      this.renderer.setRenderTarget(this.rtBloomD);
      this.renderer.render(this.postScene, this.postCam);
      // volumetric light shafts: march the bloom buffer toward a fixed sky
      // anchor near the top of the frame, so the bright skyline and moon-lit
      // sky streak downward through the rainy air. A slow drift keeps it alive.
      const gx = 0.5 + Math.sin(now * 0.0004) * 0.12;
      this.postQuad.material = this.matGodray;
      this.matGodray.uniforms.tBright.value = this.rtBloomA.texture;
      this.matGodray.uniforms.uLight.value.set(gx, 0.88);
      this.matGodray.uniforms.uActive.value = 0.85;
      this.renderer.setRenderTarget(this.rtGod);
      this.renderer.render(this.postScene, this.postCam);
      // composite to screen
      this.postQuad.material = this.matComposite;
      this.matComposite.uniforms.tScene.value = this.rtScene.texture;
      this.matComposite.uniforms.tBloom.value = this.rtBloomA.texture;
      this.matComposite.uniforms.tBloomWide.value = this.rtBloomD.texture;
      this.matComposite.uniforms.tGod.value = this.rtGod.texture;
      this.matComposite.uniforms.time.value = now * 0.001;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCam);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }

    // Auto quality governor: if the GPU can't hold ~38fps, drop the post
    // chain and render scale once rather than stuttering forever.
    this.frameEMA = this.frameEMA * 0.95 + (performance.now() - t0) * 0.05;
    if (this.quality === 2 && this.frameEMA > 26) {
      this.quality = 1;
      this.ratio = 1;
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      this.resize();
    }
  }

  // VAULTBREAKER finale mirrored into 3D: a stealth flying wing crosses at
  // altitude, the penetrator drops, and the impact throws light, a ground
  // shockwave ring, and a rolling dust dome.
  syncStrike(g) {
    const s = g.strike;
    if (!s) {
      if (this.strikeFx) {
        this.scene.remove(this.strikeFx.grp);
        this.strikeFx = null;
      }
      return;
    }
    if (!this.strikeFx) {
      const grp = new THREE.Group();
      const wing = new THREE.Mesh(
        new THREE.ConeGeometry(34, 96, 3),
        new THREE.MeshStandardMaterial({ color: 0x0a0e15, roughness: 0.35, metalness: 0.7 })
      );
      wing.scale.set(0.16, 1, 1); // flatten into a stealth wing profile
      wing.rotation.z = -Math.PI / 2; // nose along +x
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 1.2, 26, 8),
        new THREE.MeshBasicMaterial({ color: 0xe8c85a })
      );
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.86, 1, 44),
        new THREE.MeshBasicMaterial({
          color: 0xffd68c, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(s.x, 1.4, s.y);
      const dust = new THREE.Mesh(
        new THREE.SphereGeometry(1, 14, 10),
        new THREE.MeshBasicMaterial({ color: 0x8a7458, transparent: true, opacity: 0, depthWrite: false })
      );
      dust.position.set(s.x, 0, s.y);
      const light = new THREE.PointLight(0xffd08a, 0, 900, 1.6);
      light.position.set(s.x, 40, s.y);
      grp.add(wing, pen, ring, dust, light);
      this.scene.add(grp);
      this.strikeFx = { grp, wing, pen, ring, dust, light };
    }
    const fx = this.strikeFx;
    const t = s.t;
    fx.wing.visible = t < 3.0;
    if (fx.wing.visible) {
      const p = t / 3.0;
      fx.wing.position.set(s.x - 950 + 1900 * p, 440, s.y + 70);
    }
    fx.pen.visible = t >= 2.2 && t < 3.0;
    if (fx.pen.visible) {
      const q = (t - 2.2) / 0.8;
      fx.pen.position.set(s.x, 430 * (1 - q * q) + 8, s.y);
    }
    if (t >= 3.0) {
      const q = Math.min(1, (t - 3.0) / 2.4);
      fx.ring.scale.setScalar(8 + q * 280);
      fx.ring.material.opacity = 0.5 * (1 - q);
      fx.dust.scale.setScalar(12 + q * 130);
      fx.dust.material.opacity = 0.34 * (1 - q);
      fx.light.intensity = 12000 * Math.max(0, 1 - (t - 3.0) * 1.4);
    }
  }

  // OVERWATCH recon pass in 3D: a Mach-3 dart streaking over the district,
  // airframe rimmed in skin-friction heat, twin afterburner glows trailing.
  syncRecon(g) {
    const rc = g.recon;
    if (!rc) {
      if (this.reconFx) {
        this.scene.remove(this.reconFx.grp);
        this.reconFx = null;
      }
      return;
    }
    if (!this.reconFx) {
      const grp = new THREE.Group();
      const fuselage = new THREE.Mesh(
        new THREE.ConeGeometry(7, 110, 6),
        new THREE.MeshStandardMaterial({
          color: 0x11151d, roughness: 0.3, metalness: 0.8,
          emissive: 0xff8c46, emissiveIntensity: 0.35,
        })
      );
      fuselage.rotation.z = -Math.PI / 2;
      fuselage.scale.set(0.5, 1, 1);
      const burnGeo = new THREE.ConeGeometry(4, 30, 8, 1, true);
      const burnMat = new THREE.MeshBasicMaterial({
        color: 0xffa050, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      [-10, 10].forEach((dz) => {
        const burn = new THREE.Mesh(burnGeo, burnMat);
        burn.rotation.z = Math.PI / 2;
        burn.position.set(-58, 0, dz);
        grp.add(burn);
      });
      grp.add(fuselage);
      this.scene.add(grp);
      this.reconFx = { grp };
    }
    const p = rc.t / 2.6;
    this.reconFx.grp.position.set(
      g.player.x - 1100 + 2200 * p, 470, g.player.y - 120);
  }

  dispose() {
    if (this.rtScene) {
      this.rtScene.dispose(); this.rtBloomA.dispose(); this.rtBloomB.dispose();
      this.rtBloomC.dispose(); this.rtBloomD.dispose(); this.rtGod.dispose();
    }
    this.renderer.dispose();
  }
}
