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

const UP_SCALE = 150; // world building-height multiplier

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

const COMPOSITE_FRAG = /* glsl */ `
  uniform sampler2D tScene; uniform sampler2D tBloom;
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
    c += texture2D(tBloom, vUv).rgb * bloomAmt;
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
    this.matComposite = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: COMPOSITE_FRAG, depthTest: false,
      uniforms: {
        tScene: { value: null }, tBloom: { value: null },
        time: { value: 0 }, bloomAmt: { value: 0.9 }, grainAmt: { value: 0.028 },
      },
    });
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const pw = Math.max(2, Math.floor(w * this.ratio));
    const ph = Math.max(2, Math.floor(h * this.ratio));
    if (this.rtScene) { this.rtScene.dispose(); this.rtBloomA.dispose(); this.rtBloomB.dispose(); }
    this.rtScene = new THREE.WebGLRenderTarget(pw, ph, { samples: 4 });
    this.rtBloomA = new THREE.WebGLRenderTarget(pw >> 2, ph >> 2);
    this.rtBloomB = new THREE.WebGLRenderTarget(pw >> 2, ph >> 2);
    this.rtBloomA.texture.minFilter = this.rtBloomB.texture.minFilter = THREE.LinearFilter;
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
    const { map: facadeMap, emissive: facadeEm } = this.makeFacadeTextures();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0); // grow upward from the ground
    const sideMat = new THREE.MeshStandardMaterial({
      map: facadeMap, roughness: 0.82, metalness: 0.08,
      emissive: 0xffffff, emissiveMap: facadeEm, emissiveIntensity: 1.35,
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0e1424, roughness: 0.92 });
    // Box face order: +x, -x, +y (roof), -y, +z, -z — windows on walls only.
    const mats = [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat];
    const inst = new THREE.InstancedMesh(boxGeo, mats, tiles.length);
    inst.castShadow = true;
    inst.receiveShadow = true;
    const mirrorMats = mats.map((m) => {
      const c = m.clone();
      c.side = THREE.BackSide; // y-flip reverses winding
      c.emissiveIntensity = (m.emissiveIntensity || 0) * 0.55;
      c.color = new THREE.Color(0x0a0e1a);
      return c;
    });
    const instM = new THREE.InstancedMesh(boxGeo, mirrorMats, tiles.length);
    const mtx = new THREE.Matrix4();
    const col = new THREE.Color();
    tiles.forEach((t2, i) => {
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
    });
    this.scene.add(inst);
    this.mirror.add(instM);

    this.buildSigns(g, tiles);
    this.buildAntennas(g, tiles);

    // Ground goes in AFTER the mirror world: it is transparent, so three
    // renders it last and the mirrored city shows through the asphalt.
    const groundTex = this.makeGroundTexture(g);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(g.worldW, g.worldH),
      new THREE.MeshStandardMaterial({
        map: groundTex, roughness: 0.42, metalness: 0.18,
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
    this.lampBulbs = g.lamps.map((l) => {
      const b = new THREE.Mesh(bulbGeo, bulbMat);
      b.position.set(l.x, 26, l.y);
      const bm = new THREE.Mesh(bulbGeo, bulbMirrorMat);
      bm.position.set(l.x, -26, l.y);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(l.x, 13, l.y);
      pole.castShadow = true;
      this.scene.add(b, pole);
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

    // Player: Vesper — an hourglass figure in a dark coat + a cyan lamp
    // that follows her.
    this.dyn.player = new THREE.Group();
    const figure = this.makeFigure({
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
      grp.add(core, beam, light);
      this.scene.add(grp);
      return { grp, core, beam, light };
    });

    // Sweepers: drone bodies with rotor rings + volumetric-style scan cones.
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
    this.dyn.cars = g.cars.map((c) => {
      const grp = this.makeCar(c, false);
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
      const curvy = seed < 0.55; // just over half the crowd
      const fig = this.makeFigure({
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
      grp.add(fig, um);
      this.scene.add(grp);
      return grp;
    });

    this.buildRain(g);

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
  }

  makeGroundTexture(g) {
    const px = 24; // texels per tile
    const c = document.createElement("canvas");
    c.width = g.cols * px; c.height = g.rows * px;
    const x = c.getContext("2d");
    x.fillStyle = "#1b2438";
    x.fillRect(0, 0, c.width, c.height);
    // asphalt grain
    for (let i = 0; i < c.width * c.height / 28; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${0.02 + Math.random() * 0.05})`;
      x.fillRect(Math.random() * c.width, Math.random() * c.height, 1.5, 1.5);
    }
    for (let ty = 0; ty < g.rows; ty++) {
      for (let tx = 0; tx < g.cols; tx++) {
        const isB = g.grid[ty][tx];
        if (isB) {
          x.fillStyle = "#0d1322";
          x.fillRect(tx * px, ty * px, px, px);
          continue;
        }
        // sidewalk edging beside buildings
        const edge = (dx2, dy2) => {
          const nx = tx + dx2, ny = ty + dy2;
          return ny >= 0 && ny < g.rows && nx >= 0 && nx < g.cols && g.grid[ny][nx];
        };
        x.fillStyle = "#1d2740";
        if (edge(-1, 0)) x.fillRect(tx * px, ty * px, 4, px);
        if (edge(1, 0)) x.fillRect(tx * px + px - 4, ty * px, 4, px);
        if (edge(0, -1)) x.fillRect(tx * px, ty * px, px, 4);
        if (edge(0, 1)) x.fillRect(tx * px, ty * px + px - 4, px, 4);
        // lane dashes
        x.fillStyle = "rgba(215,225,195,0.4)";
        if (tx % 4 === 0 && ty % 4 !== 0) x.fillRect(tx * px + px / 2 - 1, ty * px + 4, 2, px - 8);
        if (ty % 4 === 0 && tx % 4 !== 0) x.fillRect(tx * px + 4, ty * px + px / 2 - 1, px - 8, 2);
        // crosswalk zebra at intersections
        if (tx % 4 === 0 && ty % 4 === 0) {
          x.fillStyle = "rgba(220,228,240,0.28)";
          for (let k = 3; k < px - 3; k += 5) x.fillRect(tx * px + k, ty * px + 5, 3, px - 10);
        }
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  makeFacadeTextures() {
    // 512px facade: varied window warmth per unit, dark floors, mullions,
    // floor ledges, and a bright storefront band at street level. The
    // emissive canvas holds only the glass, so walls don't glow.
    const c = document.createElement("canvas");
    const e = document.createElement("canvas");
    c.width = c.height = e.width = e.height = 512;
    const x = c.getContext("2d");
    const xe = e.getContext("2d");
    x.fillStyle = "#0a0e1a";
    x.fillRect(0, 0, 512, 512);
    xe.fillStyle = "#000";
    xe.fillRect(0, 0, 512, 512);
    // concrete tone noise
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${0.015 + Math.random() * 0.03})`;
      x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const floorH = 44;
    for (let fy = 512 - floorH; fy > 30; fy -= floorH) {
      // ledge line between floors
      x.fillStyle = "rgba(255,255,255,0.05)";
      x.fillRect(0, fy, 512, 2);
      const groundFloor = fy >= 512 - floorH;
      const floorDark = !groundFloor && Math.random() < 0.22; // whole floor unlit
      for (let wx = 10; wx < 500; wx += 30) {
        const w = 18, h = groundFloor ? 34 : 26;
        const wy = fy + (groundFloor ? 6 : 9);
        // frame
        x.fillStyle = "#131a2e";
        x.fillRect(wx - 2, wy - 2, w + 4, h + 4);
        let lit = groundFloor ? Math.random() < 0.55 : !floorDark && Math.random() < 0.3;
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
    return { map, emissive };
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
      // composite to screen
      this.postQuad.material = this.matComposite;
      this.matComposite.uniforms.tScene.value = this.rtScene.texture;
      this.matComposite.uniforms.tBloom.value = this.rtBloomA.texture;
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
    if (this.rtScene) { this.rtScene.dispose(); this.rtBloomA.dispose(); this.rtBloomB.dispose(); }
    this.renderer.dispose();
  }
}
