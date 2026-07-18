// REZONANCE — optional true-3D renderer (toggle with V in game).
// Mirrors the running Game's state into a Three.js scene each frame: the same
// grid, emitters, sweepers, traffic, and pedestrians, but as a real 3D city
// with perspective, fog, and dynamic lights. Game logic stays in game.js;
// this file only draws.
import * as THREE from "../vendor/three.module.js";

const UP_SCALE = 150; // world building-height multiplier

export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060c);
    this.scene.fog = new THREE.FogExp2(0x060a16, 0.00085);
    this.camera = new THREE.PerspectiveCamera(50, 1, 10, 4000);
    this.builtFor = null;
    this.dyn = {};
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------- static city, rebuilt when the district changes ----------
  build(g) {
    this.builtFor = g.d.id;
    // Drop everything from a previous district.
    this.scene.clear();
    this.dyn = {};

    const accent = new THREE.Color(g.d.palette.accent);

    // Lighting rig: blue night ambience + a cool moon strong enough to read
    // the streets by.
    this.scene.add(new THREE.HemisphereLight(0x3d5a88, 0x0c1220, 1.7));
    const moon = new THREE.DirectionalLight(0x8fb4e8, 0.8);
    moon.position.set(-0.4, 1, 0.3);
    this.scene.add(moon);

    // Ground: one big plane textured with the district's road grid.
    const groundTex = this.makeGroundTexture(g);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(g.worldW, g.worldH),
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.35, metalness: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(g.worldW / 2, 0, g.worldH / 2);
    this.scene.add(ground);

    // Buildings: one instanced box per solid tile, facade texture shared.
    const tiles = [];
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        if (g.grid[y][x]) tiles.push({ x, y, m: g.blockMeta[y][x] });
      }
    }
    const facade = this.makeFacadeTexture();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0); // grow upward from the ground
    const sideMat = new THREE.MeshStandardMaterial({
      map: facade, roughness: 0.8, metalness: 0.1,
      emissive: 0xffc46e, emissiveMap: facade, emissiveIntensity: 0.85,
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x11182a, roughness: 0.9 });
    // Box face order: +x, -x, +y (roof), -y, +z, -z — windows on walls only.
    const inst = new THREE.InstancedMesh(
      boxGeo, [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat], tiles.length);
    const mtx = new THREE.Matrix4();
    const col = new THREE.Color();
    tiles.forEach((t2, i) => {
      const h = t2.m.h * UP_SCALE;
      const s = g.tile - 6;
      mtx.makeScale(s, h, s);
      mtx.setPosition((t2.x + 0.5) * g.tile, 0, (t2.y + 0.5) * g.tile);
      inst.setMatrixAt(i, mtx);
      col.setHSL(0.6, 0.22, 0.17 + t2.m.h * 0.08);
      inst.setColorAt(i, col);
    });
    this.scene.add(inst);

    // Street lamps: emissive bulbs everywhere, real point lights on the
    // nearest few (swapped to follow the player, keeps the light count sane).
    const bulbGeo = new THREE.SphereGeometry(2.6, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    this.lampBulbs = g.lamps.map((l) => {
      const b = new THREE.Mesh(bulbGeo, bulbMat);
      b.position.set(l.x, 26, l.y);
      this.scene.add(b);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 26, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a2436 })
      );
      pole.position.set(l.x, 13, l.y);
      this.scene.add(pole);
      return b;
    });
    this.lampLights = Array.from({ length: 6 }, () => {
      const pl = new THREE.PointLight(0xffb46e, 3200, 300, 1.8);
      this.scene.add(pl);
      return pl;
    });

    // Player: coat-dark capsule + a cyan lamp that follows them.
    this.dyn.player = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(7, 12, 4, 10),
      new THREE.MeshStandardMaterial({ color: 0x18213a, roughness: 0.6 })
    );
    body.position.y = 13;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xeafcff, emissive: 0x33e2ff, emissiveIntensity: 0.25 })
    );
    head.position.y = 26;
    this.dyn.player.add(body, head);
    this.dyn.playerLight = new THREE.PointLight(accent, 5200, 380, 1.8);
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

    // Emitters: pulsing glow spheres (visibility driven per-frame).
    this.dyn.emitters = g.emitters.map(() => {
      const grp = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(6, 12, 12),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true })
      );
      core.position.y = 10;
      const light = new THREE.PointLight(accent, 0, 300, 1.8);
      light.position.y = 30;
      grp.add(core, light);
      this.scene.add(grp);
      return { grp, core, light };
    });

    // Sweepers: bodies + translucent vision cones lying on the street.
    this.dyn.sweepers = g.sweepers.map(() => {
      const grp = new THREE.Group();
      const body2 = new THREE.Mesh(
        new THREE.SphereGeometry(8, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xffb454, emissive: 0xffb454, emissiveIntensity: 0.6 })
      );
      body2.position.y = 10;
      const coneGeo = new THREE.CircleGeometry(190, 24, -0.62, 1.24);
      const cone = new THREE.Mesh(
        coneGeo,
        new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
      );
      cone.rotation.x = -Math.PI / 2;
      cone.position.y = 1.2;
      grp.add(body2, cone);
      this.scene.add(grp);
      return { grp, body: body2, cone };
    });

    // Cars: box bodies + emissive head/tail blocks.
    this.dyn.cars = g.cars.map((c) => {
      const grp = new THREE.Group();
      const body3 = new THREE.Mesh(
        new THREE.BoxGeometry(c.len, 10, c.wid),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(c.body), roughness: 0.25, metalness: 0.7 })
      );
      body3.position.y = 6;
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(c.len * 0.45, 7, c.wid * 0.85),
        new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 0.1, metalness: 0.6 })
      );
      cab.position.set(-c.len * 0.05, 13, 0);
      const lampL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.4, 2.4), new THREE.MeshBasicMaterial({ color: 0xffedb8 }));
      lampL.position.set(c.len / 2, 6, -c.wid / 2 + 2.4);
      const lampR = lampL.clone(); lampR.position.z = c.wid / 2 - 2.4;
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 2.2), new THREE.MeshBasicMaterial({ color: 0xff3648 }));
      tailL.position.set(-c.len / 2, 6, -c.wid / 2 + 2.2);
      const tailR = tailL.clone(); tailR.position.z = c.wid / 2 - 2.2;
      grp.add(body3, cab, lampL, lampR, tailL, tailR);
      this.scene.add(grp);
      return grp;
    });

    // Pedestrians: little capsules with umbrella discs.
    this.dyn.peds = g.peds.map((ped) => {
      const grp = new THREE.Group();
      const b = new THREE.Mesh(
        new THREE.CapsuleGeometry(3, 7, 3, 8),
        new THREE.MeshStandardMaterial({ color: 0x0d1420 })
      );
      b.position.y = 8;
      const um = new THREE.Mesh(
        new THREE.ConeGeometry(8, 4, 10),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(ped.tint).multiplyScalar(0.4) })
      );
      um.position.y = 17;
      grp.add(b, um);
      this.scene.add(grp);
      return grp;
    });

    // Rain: a falling particle field recycled around the camera.
    const rainCount = 900;
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = Math.random() * g.worldW;
      rainPos[i * 3 + 1] = Math.random() * 400;
      rainPos[i * 3 + 2] = Math.random() * g.worldH;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    this.dyn.rain = new THREE.Points(
      rainGeo,
      new THREE.PointsMaterial({ color: 0x96c3ff, size: 1.6, transparent: true, opacity: 0.5, sizeAttenuation: true })
    );
    this.scene.add(this.dyn.rain);

    this.camPos = new THREE.Vector3(g.player.x, 640, g.player.y + 210);
  }

  makeGroundTexture(g) {
    const px = 16; // texels per tile
    const c = document.createElement("canvas");
    c.width = g.cols * px; c.height = g.rows * px;
    const x = c.getContext("2d");
    x.fillStyle = "#1a2338";
    x.fillRect(0, 0, c.width, c.height);
    for (let ty = 0; ty < g.rows; ty++) {
      for (let tx = 0; tx < g.cols; tx++) {
        if (g.grid[ty][tx]) {
          x.fillStyle = "#10182a";
          x.fillRect(tx * px, ty * px, px, px);
          continue;
        }
        // lane dashes
        x.fillStyle = "rgba(215,225,195,0.4)";
        if (tx % 4 === 0 && ty % 4 !== 0) x.fillRect(tx * px + px / 2 - 0.5, ty * px + 3, 1, px - 6);
        if (ty % 4 === 0 && tx % 4 !== 0) x.fillRect(tx * px + 3, ty * px + px / 2 - 0.5, px - 6, 1);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  makeFacadeTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "#0b0f1c";
    x.fillRect(0, 0, 128, 128);
    // window grid — some lit, most dark
    for (let wy = 8; wy < 120; wy += 14) {
      for (let wx = 8; wx < 120; wx += 12) {
        const lit = Math.random() < 0.16;
        x.fillStyle = lit ? "#ffcf8a" : "#131a2c";
        x.fillRect(wx, wy, 6, 8);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ---------- per-frame sync ----------
  render(g, now) {
    if (this.builtFor !== g.d.id) this.build(g);
    const d = this.dyn;

    d.player.position.set(g.player.x, 0, g.player.y);
    d.player.rotation.y = -g.player.angle;

    g.emitters.forEach((e, i) => {
      const m = d.emitters[i];
      m.grp.position.set(e.x, 0, e.y);
      if (e.neutralized) { m.core.material.opacity = 0.18; m.light.intensity = 0; return; }
      const vis = Math.max(0, 1 - Math.hypot(e.x - g.player.x, e.y - g.player.y) / 300);
      const pulse = 0.6 + 0.4 * Math.sin(e.pulse * 3);
      m.core.material.opacity = 0.15 + vis * 0.85;
      m.core.scale.setScalar(1 + pulse * 0.5);
      m.light.intensity = vis * 2600 * pulse;
    });

    g.sweepers.forEach((s, i) => {
      const m = d.sweepers[i];
      m.grp.position.set(s.x, 0, s.y);
      m.grp.rotation.y = -s.angle;
      const c2 = s.alert ? 0xff3b7f : (s.sus || 0) > 0.12 ? 0xffd24f : 0xffb454;
      m.body.material.color.setHex(c2);
      m.body.material.emissive.setHex(c2);
      m.cone.material.color.setHex(c2);
      m.cone.material.opacity = s.alert ? 0.18 : 0.10;
    });

    g.cars.forEach((c2, i) => {
      const grp = d.cars[i];
      const x = c2.vertical ? c2.lane + 15 * c2.dir : c2.pos;
      const y = c2.vertical ? c2.pos : c2.lane + 15 * -c2.dir;
      grp.position.set(x, 0, y);
      grp.rotation.y = c2.vertical ? (c2.dir > 0 ? -Math.PI / 2 : Math.PI / 2) : (c2.dir > 0 ? 0 : Math.PI);
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
        pl.intensity = 900;
      } else pl.intensity = 0;
    });

    // Rain falls; wrap around vertically.
    const pos = d.rain.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let yv = pos.getY(i) - 6.5;
      if (yv < 0) yv = 380;
      pos.setY(i, yv);
    }
    pos.needsUpdate = true;
    d.rain.material.opacity = g.weather.mode === "storm" ? 0.7 : g.weather.mode === "rain" ? 0.5 : 0.3;

    // Lightning bumps the exposure for a frame.
    this.renderer.toneMappingExposure = 1.3 + (g.flash || 0) * 1.6;

    // Chase camera: high behind the player, always looking at them.
    const target = new THREE.Vector3(g.player.x, 0, g.player.y);
    this.camPos.lerp(new THREE.Vector3(g.player.x, 640, g.player.y + 210), 0.06);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(target.x, 0, target.z);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
