// REZONANCE — core engine. Top-down neon-noir signals-investigation.
// Pure canvas 2D, no dependencies. All content fictional.
//
// Renderer: GTA2-style 2.5D — buildings extrude away from the screen center
// (a scale-about-center projection, so roofs stay axis-aligned rects), with a
// dynamic lighting layer, wet-street reflections, ambient traffic and
// pedestrians, rain, bloom and film-grain post-processing.
import { Input } from "./input.js";
import { DISTRICTS } from "./world.js";
import { audio } from "./audio.js";

const TAU = Math.PI * 2;
const EXTRUDE = 0.13; // max roof offset as a fraction of distance from screen center
const AMBIENT_DARK = 0.52;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Deterministic PRNG so a district always generates the same layout.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CAR_BODIES = ["#141c2c", "#1f2637", "#2b1e1c", "#1b2b33", "#251c2e", "#101722"];
const NEON_COLORS = ["#33e2ff", "#ff3b7f", "#ffb454", "#46f4a0", "#b18cff"];

export class Game {
  constructor(canvas, hud, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hud = hud;
    this.onEnd = onEnd;
    this.input = new Input();
    this.running = false;
    this.districtIndex = 0;
    this._resize = () => this.resize();
    window.addEventListener("resize", this._resize);

    // Offscreen layers for lighting, bloom and grain.
    this.lightCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d");
    this.bloomCanvas = document.createElement("canvas");
    this.bloomCtx = this.bloomCanvas.getContext("2d");
    this.noiseCanvas = this.makeNoise(160);
    this.noisePattern = this.ctx.createPattern(this.noiseCanvas, "repeat");
    this.canFilter = typeof this.ctx.filter === "string";

    // Pre-rendered radial glow sprites, tinted per color. Far cheaper than
    // per-frame shadowBlur or radial gradients in the hot path.
    this.glowCache = new Map();

    this.resize();
    this.startTime = 0;
    this.pausedForOverlay = false;

    // Adaptive quality: 2 = full (bloom+grain), 1 = no grain, 0 = no bloom
    // and lighting refreshed every other frame. Downshifts when the average
    // frame time can't hold ~40fps, upshifts when there's headroom.
    this.quality = 2;
    this.frameNo = 0;
    this.frameEma = 1 / 60;
    this.qualityCooldown = 0;
  }

  glowSprite(color) {
    let c = this.glowCache.get(color);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const g2 = c.getContext("2d");
    const grad = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, withAlpha(color, 0.45));
    grad.addColorStop(1, withAlpha(color, 0));
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 64, 64);
    this.glowCache.set(color, c);
    return c;
  }

  drawGlow(ctx, x, y, r, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.glowSprite(color), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }

  makeNoise(size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const nctx = c.getContext("2d");
    const img = nctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.random() * 137;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
    return c;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.r3d) this.r3d.resize();
    // Effect layers run at CSS resolution (lighting) and quarter res (bloom).
    this.lightCanvas.width = this.w;
    this.lightCanvas.height = this.h;
    this.bloomCanvas.width = Math.max(1, this.w >> 2);
    this.bloomCanvas.height = Math.max(1, this.h >> 2);
  }

  start(districtIndex = 0) {
    this.districtIndex = districtIndex;
    this.loadDistrict(DISTRICTS[districtIndex]);
    this.running = true;
    this.pausedForOverlay = false;
    this.last = performance.now();
    this._loop = (t) => this.frame(t);
    requestAnimationFrame(this._loop);
  }

  // -------------------- level generation --------------------
  loadDistrict(d) {
    this.d = d;
    const rng = mulberry32(hashStr(d.id));
    this.rng = rng;
    this.tile = d.tile;
    this.cols = d.cols;
    this.rows = d.rows;
    this.worldW = d.cols * d.tile;
    this.worldH = d.rows * d.tile;

    // Precomputed colors for the hot render path (no string building per frame).
    this.shades = {
      face: new Map([[1.0, 0], [0.82, 0], [0.62, 0], [0.5, 0]].map(([lum]) =>
        [lum, shade(d.palette.block, 0.62 * lum + 0.14)])),
      roof: shade(d.palette.block, 1.28),
      roofEdge: shade(d.palette.block, 0.85),
      ac: shade(d.palette.block, 0.55),
    };

    // Grid: true = building block (solid), false = road.
    this.grid = [];
    for (let y = 0; y < d.rows; y++) {
      const row = [];
      for (let x = 0; x < d.cols; x++) {
        const road = x % 4 === 0 || y % 4 === 0;
        const plaza = rng() < 0.05;
        row.push(!road && !plaza);
      }
      this.grid.push(row);
    }

    // Building metadata: height, lit windows, roof clutter, neon signage.
    this.blockMeta = this.grid.map((row) =>
      row.map(() => ({
        h: 0.35 + rng() * 0.65,
        lit: rng() < 0.55,
        ac: rng() < 0.5,
        antenna: rng() < 0.14,
        sign: rng() < 0.16 ? { color: NEON_COLORS[(rng() * NEON_COLORS.length) | 0], phase: rng() * TAU, flicker: rng() < 0.3 } : null,
      }))
    );

    // Street lamps at alternating intersections; puddles scattered on roads.
    this.lamps = [];
    this.puddles = [];
    for (let y = 0; y < d.rows; y++) {
      for (let x = 0; x < d.cols; x++) {
        if (this.grid[y][x]) continue;
        const px = (x + 0.5) * d.tile, py = (y + 0.5) * d.tile;
        if (x % 4 === 0 && y % 4 === 0 && (x + y) % 8 === 0) {
          this.lamps.push({ x: px + 14, y: py + 14, phase: rng() * TAU });
        }
        if (rng() < 0.16) {
          this.puddles.push({
            x: px + (rng() - 0.5) * d.tile * 0.6,
            y: py + (rng() - 0.5) * d.tile * 0.6,
            rx: 12 + rng() * 22, ry: 5 + rng() * 9, phase: rng() * TAU,
          });
        }
      }
    }

    // Ambient traffic on the road lanes.
    const vLanes = [], hLanes = [];
    for (let x = 0; x < d.cols; x += 4) vLanes.push((x + 0.5) * d.tile);
    for (let y = 0; y < d.rows; y += 4) hLanes.push((y + 0.5) * d.tile);
    this.cars = [];
    const nCars = Math.round((d.cols * d.rows) / 38);
    for (let i = 0; i < nCars; i++) {
      const vertical = rng() < 0.5;
      const lane = vertical ? vLanes[(rng() * vLanes.length) | 0] : hLanes[(rng() * hLanes.length) | 0];
      const dir = rng() < 0.5 ? 1 : -1;
      this.cars.push({
        vertical, lane, dir,
        pos: rng() * (vertical ? this.worldH : this.worldW),
        speed: 110 + rng() * 90,
        body: CAR_BODIES[(rng() * CAR_BODIES.length) | 0],
        len: 30 + rng() * 8, wid: 14,
      });
    }

    // Pedestrians with umbrellas, drifting between road points.
    this.peds = [];
    const nPeds = Math.round((d.cols * d.rows) / 30);
    for (let i = 0; i < nPeds; i++) {
      const p = this.findRoad(rng, 0, 0);
      const t2 = this.findRoad(rng, 0, 0);
      this.peds.push({
        x: p.x, y: p.y, tx: t2.x, ty: t2.y,
        speed: 26 + rng() * 26, phase: rng() * TAU,
        tint: NEON_COLORS[(rng() * NEON_COLORS.length) | 0],
      });
    }

    // Player spawns on a road tile near a corner.
    const spawn = this.findRoad(rng, 2, 2);
    this.player = {
      x: spawn.x, y: spawn.y, r: 13,
      vx: 0, vy: 0, angle: 0,
      speed: 210, sprint: 340,
    };

    // Emitters — hidden nodes placed on/near roads, spread apart.
    this.emitters = [];
    let guard = 0;
    while (this.emitters.length < d.emitters && guard++ < 2000) {
      const p = this.findRoad(rng, 0, 0);
      if (dist(p, this.player) < 350) continue;
      if (this.emitters.some((e) => dist(e, p) < 260)) continue;
      this.emitters.push({ x: p.x, y: p.y, r: 16, neutralized: false, pulse: rng() * TAU, lock: 0 });
    }

    // Sweepers patrol between road waypoints.
    this.sweepers = [];
    for (let i = 0; i < d.sweepers; i++) {
      const a = this.findRoad(rng, 0, 0);
      const b = this.findRoad(rng, 0, 0);
      this.sweepers.push({
        x: a.x, y: a.y, tx: b.x, ty: b.y,
        r: 12, speed: 90 + rng() * 40, angle: 0,
        wpA: a, wpB: b, view: 190, fov: 0.62,
      });
    }

    // Rain (screen space) and ground splashes (world space).
    this.rainDrops = Array.from({ length: 110 }, () => ({
      x: Math.random() * this.w, y: Math.random() * this.h,
      s: 460 + Math.random() * 480, l: 8 + Math.random() * 14,
    }));
    this.splashes = [];

    // Dynamic weather: drizzle -> rain -> storm, rotating on a timer.
    // Storms bring lightning and harder, wind-driven rain.
    this.weather = { mode: "rain", t: 16 + rng() * 14 };
    this.flash = 0;
    this.wind = 0.1;
    this.windTarget = 0.1;

    // Drifting volumetric fog banks (world space, wrap around the viewport).
    this.fog = Array.from({ length: 5 }, () => ({
      x: rng() * this.worldW, y: rng() * this.worldH,
      r: 260 + rng() * 320, vx: 6 + rng() * 10, a: 0.05 + rng() * 0.05,
    }));

    // Wildlife: birds resting on the streets; they scatter from sprinting
    // players and scanner pings.
    this.birds = Array.from({ length: 12 }, () => {
      const p2 = this.findRoad(rng, 0, 0);
      return { x: p2.x, y: p2.y, state: "rest", vx: 0, vy: 0, flap: rng() * TAU, t: 0 };
    });

    // Give puddles the color of their nearest light source — the cheap-2D
    // stand-in for reflections of off-screen geometry.
    for (const pu of this.puddles) {
      let best = null, bd = Infinity;
      for (const l of this.lamps) {
        const dd = (l.x - pu.x) ** 2 + (l.y - pu.y) ** 2;
        if (dd < bd) { bd = dd; best = "#ffb454"; }
      }
      for (let y = 0; y < d.rows; y++) {
        for (let x = 0; x < d.cols; x++) {
          const m2 = this.grid[y][x] && this.blockMeta[y][x];
          if (!m2 || !m2.sign) continue;
          const dd = ((x + 0.5) * d.tile - pu.x) ** 2 + ((y + 0.5) * d.tile - pu.y) ** 2;
          if (dd < bd) { bd = dd; best = m2.sign.color; }
        }
      }
      pu.tint = best || d.palette.accent;
    }

    // Escalation state: instead of a hard fail at max exposure, a lockdown
    // window opens — survive it unseen and the run continues.
    this.lockdown = null;

    // Contextual radio chatter from Vesper's handler.
    this.radioTimer = 0;
    this.radioFlags = {};

    this.camera = { x: this.player.x, y: this.player.y };
    this.resonance = 0;
    this.exposure = 0;
    this.stamina = 100;
    this.startTime = performance.now();
    this.timeLeft = d.timeLimit;
    this.pings = [];
    this.particles = [];
    this.hud.districtName.textContent = d.name;
    this.updateCounts();
    this.radioMsg(`K — ${d.blurb.toUpperCase()}`);
  }

  radioMsg(text) {
    if (!this.hud.radio) return;
    this.hud.radio.textContent = text;
    this.hud.radio.classList.add("show");
    this.radioTimer = 4.5;
    audio.radioSquelch();
  }

  findRoad(rng, minCol, minRow) {
    for (let i = 0; i < 500; i++) {
      const cx = Math.floor(minCol + rng() * (this.cols - minCol - 1));
      const cy = Math.floor(minRow + rng() * (this.rows - minRow - 1));
      if (!this.grid[cy][cx]) {
        return { x: (cx + 0.5) * this.tile, y: (cy + 0.5) * this.tile };
      }
    }
    return { x: this.tile * 1.5, y: this.tile * 1.5 };
  }

  updateCounts() {
    const live = this.emitters.filter((e) => !e.neutralized).length;
    const total = this.emitters.length;
    this.hud.emitterCount.textContent = `${total - live} / ${total}`;
  }

  // -------------------- collision --------------------
  solidAt(x, y) {
    const cx = Math.floor(x / this.tile);
    const cy = Math.floor(y / this.tile);
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return true;
    return this.grid[cy][cx];
  }

  moveCircle(ent, dx, dy) {
    if (!this.solidAt(ent.x + dx + Math.sign(dx) * ent.r, ent.y)) ent.x += dx;
    if (!this.solidAt(ent.x, ent.y + dy + Math.sign(dy) * ent.r)) ent.y += dy;
    ent.x = clamp(ent.x, ent.r, this.worldW - ent.r);
    ent.y = clamp(ent.y, ent.r, this.worldH - ent.r);
  }

  // -------------------- main loop --------------------
  frame(t) {
    if (!this.running) return;
    // Clamp both ends: rAF timestamps can occasionally run backwards
    // (tab switches, headless timers), and a negative dt corrupts every
    // integrator downstream.
    const dt = clamp((t - this.last) / 1000, 0, 0.05);
    this.last = t;
    this.frameNo++;
    this.frameEma = this.frameEma * 0.95 + dt * 0.05;
    if (--this.qualityCooldown <= 0) {
      if (this.frameEma > 0.025 && this.quality > 0) { this.quality--; this.qualityCooldown = 90; }
      else if (this.frameEma < 0.014 && this.quality < 2) { this.quality++; this.qualityCooldown = 180; }
    }
    if (!this.pausedForOverlay) {
      this.update(dt);
      this.render();
    }
    this.input.clearFrame();
    requestAnimationFrame(this._loop);
  }

  update(dt) {
    const p = this.player;

    // Movement + stamina.
    const mv = this.input.moveVector();
    const sprinting = this.input.isDown("shift") && this.stamina > 1 && (mv.x || mv.y);
    const spd = sprinting ? p.sprint : p.speed;
    if (sprinting) this.stamina = clamp(this.stamina - 34 * dt, 0, 100);
    else this.stamina = clamp(this.stamina + 16 * dt, 0, 100);
    if (mv.x || mv.y) p.angle = Math.atan2(mv.y, mv.x);
    this.moveCircle(p, mv.x * spd * dt, mv.y * spd * dt);

    // Camera easing.
    this.camera.x = lerp(this.camera.x, p.x, 1 - Math.pow(0.001, dt));
    this.camera.y = lerp(this.camera.y, p.y, 1 - Math.pow(0.001, dt));

    // Resonance from nearest live emitter (proximity-based tingle).
    let nearest = null, nd = Infinity;
    for (const e of this.emitters) {
      if (e.neutralized) continue;
      const dd = dist(e, p);
      if (dd < nd) { nd = dd; nearest = e; }
      e.pulse += dt * 2;
    }
    const range = 520;
    let target = nearest ? clamp(1 - nd / range, 0, 1) : 0;
    // Storm cells inject noise into the scanner — readings jump.
    if (this.weather.mode === "storm" && target > 0.02) {
      target = clamp(target + (Math.random() - 0.5) * 0.12, 0, 1);
    }
    this.resonance = lerp(this.resonance, target, 1 - Math.pow(0.02, dt));

    // Scanner ping.
    if (this.input.justPressed(" ")) {
      this.pings.push({ x: p.x, y: p.y, r: 0, max: 420, life: 1 });
      audio.ping();
    }
    // Mute toggle.
    if (this.input.justPressed("m")) audio.setMuted(!audio.muted);

    // 3D camera toggle (lazy-loads the WebGL renderer on first use).
    if (this.input.justPressed("v") && !this._loading3d) {
      if (this.r3d) {
        this.mode3d = !this.mode3d;
        document.getElementById("game").classList.toggle("mode3d", this.mode3d);
      } else {
        this._loading3d = true;
        import("./render3d.js")
          .then(({ Renderer3D }) => {
            this.r3d = new Renderer3D(document.getElementById("stage3d"));
            this.mode3d = true;
            document.getElementById("game").classList.add("mode3d");
          })
          .catch((err) => console.warn("3D mode unavailable:", err))
          .finally(() => { this._loading3d = false; });
      }
    }
    for (const ping of this.pings) {
      ping.r += 620 * dt;
      ping.life = clamp(1 - ping.r / ping.max, 0, 1);
    }
    this.pings = this.pings.filter((p2) => p2.life > 0);

    // Neutralize.
    if (nearest && nd < 46) {
      this.showPrompt("[E] NEUTRALIZE EMITTER");
      if (this.input.justPressed("e")) {
        nearest.neutralized = true;
        audio.neutralize();
        this.spawnBurst(nearest.x, nearest.y, this.d.palette.accent);
        this.updateCounts();
        this.hidePrompt();
        const left = this.emitters.filter((e) => !e.neutralized).length;
        if (left === 0) this.winDistrict();
        else if (left === 1) this.radioMsg("K — LAST EMITTER. FINISH IT AND GET OUT.");
        else if (!this.radioFlags.first) {
          this.radioFlags.first = true;
          this.radioMsg("K — ONE DOWN. THE ARRAY'S THINNING.");
        }
      }
    } else {
      this.hidePrompt();
    }

    // Sweepers: patrol -> suspicious -> alert -> pursuit. Suspicion builds
    // while you sit in a cone and decays when you break line of sight; only
    // a confirmed sighting (sus past threshold) raises exposure and triggers
    // a chase to your last known position.
    let anyAlert = false;
    let seenDuringLockdown = false;
    for (const s of this.sweepers) {
      const chasing = (s.chase || 0) > 0;
      const tgtx = chasing ? s.cx : s.tx;
      const tgty = chasing ? s.cy : s.ty;
      const ang = Math.atan2(tgty - s.y, tgtx - s.x);
      s.angle = ang;
      const spd2 = s.speed * (chasing ? 1.55 : 1);
      this.moveCircle(s, Math.cos(ang) * spd2 * dt, Math.sin(ang) * spd2 * dt);
      if (chasing) {
        s.chase -= dt;
        if (Math.hypot(s.cx - s.x, s.cy - s.y) < 24) s.chase = 0;
      } else if (Math.hypot(tgtx - s.x, tgty - s.y) < 20) {
        const tmp = { x: s.tx, y: s.ty };
        s.tx = s.wpA.x === s.tx && s.wpA.y === s.ty ? s.wpB.x : s.wpA.x;
        s.ty = s.wpA.x === tmp.x && s.wpA.y === tmp.y ? s.wpB.y : s.wpA.y;
      }

      const toP = Math.atan2(p.y - s.y, p.x - s.x);
      const dd = dist(s, p);
      const diff = Math.abs(normAngle(toP - s.angle));
      const seen = dd < s.view && diff < s.fov && this.lineOfSight(s, p);
      s.sus = clamp((s.sus || 0) + (seen ? 1.4 : -0.5) * dt, 0, 1);
      const wasAlert = s.alert;
      s.alert = seen && s.sus >= 0.45;
      if (s.alert && !wasAlert) audio.alert();
      if (s.alert) {
        anyAlert = true;
        s.chase = 2.4;
        s.cx = p.x; s.cy = p.y;
        this.exposure = clamp(this.exposure + 26 * dt, 0, 100);
      }
      if (this.lockdown && seen) seenDuringLockdown = true;
    }
    if (!anyAlert && !this.lockdown) {
      this.exposure = clamp(this.exposure - 10 * dt, 0, 100);
    }

    // Ambient traffic: cars brake for the player crossing ahead of them,
    // then pull away again once the road is clear.
    for (const c of this.cars) {
      const x = c.vertical ? c.lane + 15 * c.dir : c.pos;
      const y = c.vertical ? c.pos : c.lane + 15 * -c.dir;
      const ahead = 44;
      const fx = c.vertical ? x : x + ahead * c.dir;
      const fy = c.vertical ? y + ahead * c.dir : y;
      const blocked = Math.hypot(fx - p.x, fy - p.y) < 34;
      if (c.v === undefined) c.v = c.speed;
      c.v = blocked ? Math.max(0, c.v - 520 * dt) : Math.min(c.speed, c.v + 200 * dt);
      c.pos += c.v * c.dir * dt;
      const max = c.vertical ? this.worldH : this.worldW;
      if (c.pos > max + 60) c.pos = -60;
      if (c.pos < -60) c.pos = max + 60;
    }

    // Pedestrians drift between road points — and bolt from sprinting
    // players or any sweeper that has gone loud.
    for (const ped of this.peds) {
      let threat = null;
      if (sprinting && dist(ped, p) < 75) threat = p;
      if (!threat) {
        for (const s of this.sweepers) {
          if (s.alert && dist(ped, s) < 170) { threat = s; break; }
        }
      }
      if (threat) {
        ped.panic = 1.4;
        const a = Math.atan2(ped.y - threat.y, ped.x - threat.x);
        ped.pvx = Math.cos(a); ped.pvy = Math.sin(a);
      }
      if (ped.panic > 0) {
        ped.panic -= dt;
        ped.x = clamp(ped.x + ped.pvx * 95 * dt, 8, this.worldW - 8);
        ped.y = clamp(ped.y + ped.pvy * 95 * dt, 8, this.worldH - 8);
      } else {
        const dx = ped.tx - ped.x, dy = ped.ty - ped.y;
        const dd = Math.hypot(dx, dy);
        if (dd < 8) {
          const t2 = this.findRoad(this.rng, 0, 0);
          ped.tx = t2.x; ped.ty = t2.y;
        } else {
          ped.x += (dx / dd) * ped.speed * dt;
          ped.y += (dy / dd) * ped.speed * dt;
        }
      }
    }

    // Birds: startle on nearby sprint or a passing ping ring, fly off, and
    // eventually settle somewhere new.
    for (const b of this.birds) {
      if (b.state === "rest") {
        const startled =
          (sprinting && dist(b, p) < 95) ||
          this.pings.some((pg) => Math.abs(dist(pg, b) - pg.r) < 36 && pg.life > 0.1);
        if (startled) {
          const a = Math.atan2(b.y - p.y, b.x - p.x) + (Math.random() - 0.5) * 1.2;
          const sp = 150 + Math.random() * 90;
          b.state = "fly"; b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.t = 2.6;
        }
      } else {
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.flap += dt * 26;
        b.t -= dt;
        if (b.t <= 0) {
          const spot = this.findRoad(this.rng, 0, 0);
          b.x = spot.x; b.y = spot.y; b.state = "rest";
        }
      }
    }

    // Weather cycle + wind gusts + lightning during storms.
    const wz = this.weather;
    wz.t -= dt;
    if (wz.t <= 0) {
      const order = { drizzle: "rain", rain: "storm", storm: "drizzle" };
      wz.mode = order[wz.mode];
      wz.t = 16 + Math.random() * 16;
      if (wz.mode === "storm") this.radioMsg("K — STORM CELL ON TOP OF YOU. EMITTER READINGS WILL JUMP.");
    }
    this.windTarget += (Math.random() - 0.5) * dt * 2;
    this.windTarget = clamp(this.windTarget, 0.02, wz.mode === "storm" ? 0.55 : 0.25);
    this.wind = lerp(this.wind, this.windTarget, 1 - Math.pow(0.1, dt));
    if (wz.mode === "storm" && Math.random() < dt * 0.30) {
      this.flash = 0.9;
      audio.thunder();
    }
    this.flash *= Math.pow(0.02, dt);
    for (const f of this.fog) {
      f.x += f.vx * dt;
      if (f.x - f.r > this.worldW) f.x = -f.r;
    }

    // Rain splashes on the pavement (rate follows the weather).
    const splashRate = { drizzle: 1, rain: 3, storm: 5 }[this.weather.mode];
    if (this.splashes.length < 36) {
      for (let i = 0; i < splashRate; i++) {
        const wx = this.camera.x - this.w / 2 + Math.random() * this.w;
        const wy = this.camera.y - this.h / 2 + Math.random() * this.h;
        if (!this.solidAt(wx, wy)) this.splashes.push({ x: wx, y: wy, r: 1, life: 1 });
      }
    }
    for (const sp of this.splashes) { sp.r += 26 * dt; sp.life -= 2.2 * dt; }
    this.splashes = this.splashes.filter((sp) => sp.life > 0);

    // Particles.
    for (const pt of this.particles) {
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      pt.vx *= 0.94; pt.vy *= 0.94; pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);

    // Timer.
    this.timeLeft -= dt;

    // HUD meters.
    this.hud.resonanceFill.style.width = (this.resonance * 100).toFixed(1) + "%";
    this.hud.exposureFill.style.width = this.exposure.toFixed(1) + "%";
    this.hud.staminaFill.style.width = this.stamina.toFixed(1) + "%";
    const m = Math.max(0, Math.floor(this.timeLeft / 60));
    const s2 = Math.max(0, Math.floor(this.timeLeft % 60));
    this.hud.clock.textContent = `${String(m).padStart(2, "0")}:${String(s2).padStart(2, "0")}`;

    // Contextual radio warnings (each fires once per district).
    if (this.exposure > 60 && !this.radioFlags.hot && !this.lockdown) {
      this.radioFlags.hot = true;
      this.radioMsg("K — YOU'RE HOT. BREAK LINE OF SIGHT, NOW.");
    }
    if (this.timeLeft < 30 && !this.radioFlags.thirty) {
      this.radioFlags.thirty = true;
      this.radioMsg("K — THIRTY SECONDS BEFORE THE ARRAY LOCKS.");
    }
    if (this.radioTimer > 0) {
      this.radioTimer -= dt;
      if (this.radioTimer <= 0 && this.hud.radio) this.hud.radio.classList.remove("show");
    }

    // No hard fail at max exposure: a lockdown window opens instead. Stay
    // out of every cone until it ends and the run survives; get spotted
    // once during it and Meridian closes the net.
    if (this.lockdown) {
      this.exposure = 100;
      if (seenDuringLockdown) {
        this.loseDistrict("EXPOSED", "A sweeper confirmed your position during the lockdown. The channel went cold and Meridian scrubbed the district.");
        return;
      }
      this.lockdown.t -= dt;
      this.showPrompt(`LOCKDOWN — STAY UNSEEN ${Math.ceil(this.lockdown.t)}s`);
      if (this.lockdown.t <= 0) {
        this.lockdown = null;
        this.exposure = 55;
        this.hidePrompt();
        this.radioMsg("K — ...CLEAR. THEY LOST THE THREAD. BACK TO WORK.");
      }
    } else if (this.exposure >= 100) {
      this.lockdown = { t: 6 };
      for (const s of this.sweepers) { s.chase = 3.5; s.cx = p.x; s.cy = p.y; }
      this.radioMsg("K — MAX EXPOSURE. GO DARK AND STAY DARK.");
    }

    if (this.timeLeft <= 0) this.loseDistrict("EMITTERS LOCKED", "The harmonic array finished locking before you cleared it. Halcyon Bay stays saturated.");

    // Feed the continuous audio beds.
    audio.update(dt, {
      weatherMode: this.weather.mode,
      wind: this.wind,
      exposure: this.exposure,
      resonance: this.resonance,
      moving: !!(mv.x || mv.y),
      sprinting,
    });
  }

  lineOfSight(a, b) {
    const steps = Math.ceil(dist(a, b) / (this.tile * 0.4));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.solidAt(lerp(a.x, b.x, t), lerp(a.y, b.y, t))) return false;
    }
    return true;
  }

  spawnBurst(x, y, color) {
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * TAU, sp = 60 + Math.random() * 220;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.5, color });
    }
  }

  // -------------------- rendering --------------------
  render() {
    const now = performance.now();
    if (this.mode3d && this.r3d) {
      this.r3d.render(this, now);
      return;
    }
    const ctx = this.ctx, w = this.w, h = this.h;
    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, w, h);

    // Clamp camera to world bounds so we never reveal empty void past the edge
    // (unless the world is smaller than the viewport, then center it).
    let camX = this.camera.x - w / 2;
    let camY = this.camera.y - h / 2;
    camX = this.worldW > w ? clamp(camX, 0, this.worldW - w) : (this.worldW - w) / 2;
    camY = this.worldH > h ? clamp(camY, 0, this.worldH - h) : (this.worldH - h) / 2;
    this.viewCamX = camX;
    this.viewCamY = camY;
    const cx = camX + w / 2, cy = camY + h / 2; // projection center (world coords)

    ctx.save();
    ctx.translate(-camX, -camY);

    this.drawGround(ctx, camX, camY, w, h, now);
    this.drawPuddles(ctx, camX, camY, w, h, now);
    this.drawSplashes(ctx);
    this.drawPings(ctx);
    this.drawEmitters(ctx);
    this.drawPeds(ctx, camX, camY, w, h, now);
    this.drawCars(ctx, camX, camY, w, h);
    this.drawSweepers(ctx);
    this.drawPlayer(ctx, now);
    this.drawLamps(ctx, camX, camY, w, h);
    this.drawBuildings(ctx, camX, camY, w, h, cx, cy, now);
    this.drawBirds(ctx, camX, camY, w, h);
    this.drawFog(ctx, camX, camY, w, h);
    this.drawParticles(ctx);

    ctx.restore();

    this.compositeLighting(ctx, camX, camY, w, h, now);
    if (this.flash > 0.02) {
      ctx.fillStyle = `rgba(210,230,255,${this.flash * 0.38})`;
      ctx.fillRect(0, 0, w, h);
    }
    this.drawAccentGlows(ctx, camX, camY, w, h);
    this.drawRain(ctx, w, h);
    if (this.quality >= 1) this.compositeBloom(ctx, w, h);
    if (this.quality >= 2) this.drawGrain(ctx, w, h);
    this.drawVignette(ctx, w, h);
    this.drawScannerTingle(ctx, w, h, now);
    this.drawMinimap(ctx, w, h);
  }

  visibleTileRange(camX, camY, w, h, pad = 2) {
    const t = this.tile;
    return {
      x0: Math.max(0, Math.floor(camX / t) - pad),
      y0: Math.max(0, Math.floor(camY / t) - pad),
      x1: Math.min(this.cols, Math.ceil((camX + w) / t) + pad),
      y1: Math.min(this.rows, Math.ceil((camY + h) / t) + pad),
    };
  }

  drawGround(ctx, camX, camY, w, h, now) {
    const t = this.tile;
    const { x0, y0, x1, y1 } = this.visibleTileRange(camX, camY, w, h);
    const pal = this.d.palette;

    // Wet asphalt base with a faint cool sheen toward the bottom of the screen.
    ctx.fillStyle = pal.road;
    ctx.fillRect(camX, camY, w, h);
    const sheen = ctx.createLinearGradient(0, camY, 0, camY + h);
    sheen.addColorStop(0, "rgba(20,40,70,0)");
    sheen.addColorStop(1, "rgba(30,60,110,0.10)");
    ctx.fillStyle = sheen;
    ctx.fillRect(camX, camY, w, h);
    // Sky tint follows the compressed night: warm dusk -> deep blue night
    // -> cold pre-dawn cyan as the clock runs down.
    const phase = clamp(1 - this.timeLeft / this.d.timeLimit, 0, 1);
    const tint = phase < 0.5
      ? lerpColor("#ff8a50", "#0c1430", phase * 2)
      : lerpColor("#0c1430", "#7fe7ff", (phase - 0.5) * 2);
    ctx.fillStyle = withAlpha(tint, 0.05);
    ctx.fillRect(camX, camY, w, h);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if (this.grid[y][x]) continue;
        const px = x * t, py = y * t;
        // Sidewalk edging where road meets building.
        ctx.strokeStyle = withAlpha(pal.edge, 0.22);
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, t - 1, t - 1);
        // Lane dashes down road centers.
        const vRoad = x % 4 === 0 && !(y % 4 === 0);
        const hRoad = y % 4 === 0 && !(x % 4 === 0);
        ctx.fillStyle = "rgba(215,225,190,0.10)";
        if (vRoad) for (let dy = 6; dy < t; dy += 22) ctx.fillRect(px + t / 2 - 1, py + dy, 2, 11);
        if (hRoad) for (let dx = 6; dx < t; dx += 22) ctx.fillRect(px + dx, py + t / 2 - 1, 11, 2);
      }
    }
  }

  drawPuddles(ctx, camX, camY, w, h, now) {
    const pal = this.d.palette;
    for (const pu of this.puddles) {
      if (pu.x < camX - 40 || pu.x > camX + w + 40 || pu.y < camY - 40 || pu.y > camY + h + 40) continue;
      const shimmer = 0.5 + 0.5 * Math.sin(now / 900 + pu.phase);
      // Dark water body.
      ctx.beginPath();
      ctx.ellipse(pu.x, pu.y, pu.rx, pu.ry, 0, 0, TAU);
      ctx.fillStyle = "rgba(4,10,22,0.85)";
      ctx.fill();
      // Reflection smear tinted by the puddle's nearest light source — the
      // cheap-2D stand-in for reflecting off-screen geometry.
      const g = ctx.createLinearGradient(pu.x, pu.y - pu.ry * 3, pu.x, pu.y + pu.ry);
      g.addColorStop(0, "transparent");
      g.addColorStop(1, withAlpha(pu.tint || pal.accent, 0.16 + shimmer * 0.1));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(pu.x, pu.y, pu.rx * 0.8, pu.ry * 0.8, 0, 0, TAU);
      ctx.fill();
      // Rim light.
      ctx.strokeStyle = withAlpha("#9fd4ff", 0.10 + shimmer * 0.06);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  drawSplashes(ctx) {
    ctx.strokeStyle = "rgba(160,200,255,0.22)";
    ctx.lineWidth = 1;
    for (const sp of this.splashes) {
      ctx.globalAlpha = sp.life * 0.5;
      ctx.beginPath();
      const sr = Math.max(0.1, sp.r);
      ctx.ellipse(sp.x, sp.y, sr, sr * 0.45, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawPings(ctx) {
    for (const ping of this.pings) {
      ctx.beginPath();
      ctx.arc(ping.x, ping.y, ping.r, 0, TAU);
      ctx.strokeStyle = withAlpha(this.d.palette.accent, ping.life * 0.7);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  drawEmitters(ctx) {
    for (const e of this.emitters) {
      if (e.neutralized) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 8, 0, TAU);
        ctx.fillStyle = "#28405a";
        ctx.fill();
        continue;
      }
      const d = dist(e, this.player);
      const pingHit = this.pings.some((p) => Math.abs(dist(p, e) - p.r) < 30 && p.life > 0.1);
      const vis = clamp(1 - d / 300, 0, 1) * 0.9 + (pingHit ? 0.6 : 0);
      if (vis <= 0.02) continue;
      const a = clamp(vis, 0, 1);
      const pulse = 0.5 + 0.5 * Math.sin(e.pulse * 3);
      const R = e.r + pulse * 6;
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, R * 2.4);
      grad.addColorStop(0, withAlpha(this.d.palette.accent, a));
      grad.addColorStop(0.4, withAlpha(this.d.palette.accent, a * 0.4));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(e.x, e.y, R * 2.4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 0.5, 0, TAU);
      ctx.fillStyle = withAlpha("#ffffff", a);
      ctx.fill();
    }
  }

  drawPeds(ctx, camX, camY, w, h, now) {
    for (const ped of this.peds) {
      if (ped.x < camX - 30 || ped.x > camX + w + 30 || ped.y < camY - 30 || ped.y > camY + h + 30) continue;
      const bob = Math.sin(now / 160 + ped.phase) * 1.2;
      // Ground shadow.
      ctx.beginPath();
      ctx.ellipse(ped.x, ped.y + 4, 7, 3, 0, 0, TAU);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fill();
      // Body.
      ctx.beginPath();
      ctx.arc(ped.x, ped.y + bob, 4.5, 0, TAU);
      ctx.fillStyle = "#0d1420";
      ctx.fill();
      // Umbrella canopy with a wet highlight.
      ctx.beginPath();
      ctx.arc(ped.x, ped.y + bob - 2, 7.5, 0, TAU);
      ctx.fillStyle = shade(ped.tint, 0.22);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ped.x - 2, ped.y + bob - 4, 3, 0, TAU);
      ctx.fillStyle = withAlpha(ped.tint, 0.35);
      ctx.fill();
    }
  }

  drawCars(ctx, camX, camY, w, h) {
    for (const c of this.cars) {
      const x = c.vertical ? c.lane + 15 * c.dir : c.pos;
      const y = c.vertical ? c.pos : c.lane + 15 * -c.dir;
      if (x < camX - 80 || x > camX + w + 80 || y < camY - 80 || y > camY + h + 80) continue;
      const ang = c.vertical ? (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (c.dir > 0 ? 0 : Math.PI);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      // Shadow.
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      rr(ctx, -c.len / 2 + 2, -c.wid / 2 + 3, c.len, c.wid, 5);
      ctx.fill();
      // Headlight cone splashing on the wet road.
      const cone = ctx.createLinearGradient(c.len / 2, 0, c.len / 2 + 78, 0);
      cone.addColorStop(0, "rgba(255,236,180,0.20)");
      cone.addColorStop(1, "transparent");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(c.len / 2 - 2, -c.wid / 2 + 2);
      ctx.lineTo(c.len / 2 + 78, -c.wid * 1.5);
      ctx.lineTo(c.len / 2 + 78, c.wid * 1.5);
      ctx.lineTo(c.len / 2 - 2, c.wid / 2 - 2);
      ctx.closePath();
      ctx.fill();
      // Body with a cool roof sheen.
      rr(ctx, -c.len / 2, -c.wid / 2, c.len, c.wid, 4);
      ctx.fillStyle = c.body;
      ctx.fill();
      const sheen = ctx.createLinearGradient(0, -c.wid / 2, 0, c.wid / 2);
      sheen.addColorStop(0, "rgba(170,210,255,0.16)");
      sheen.addColorStop(0.5, "rgba(170,210,255,0.02)");
      sheen.addColorStop(1, "rgba(0,0,0,0.15)");
      ctx.fillStyle = sheen;
      rr(ctx, -c.len / 2, -c.wid / 2, c.len, c.wid, 4);
      ctx.fill();
      // Windshield + rear glass.
      ctx.fillStyle = "rgba(140,190,235,0.30)";
      rr(ctx, c.len * 0.08, -c.wid / 2 + 2.5, c.len * 0.2, c.wid - 5, 2);
      ctx.fill();
      rr(ctx, -c.len * 0.30, -c.wid / 2 + 2.5, c.len * 0.14, c.wid - 5, 2);
      ctx.fill();
      // Headlights + taillights.
      this.drawGlow(ctx, c.len / 2, -c.wid / 2 + 3, 7, "#ffedb8", 0.8);
      this.drawGlow(ctx, c.len / 2, c.wid / 2 - 3, 7, "#ffedb8", 0.8);
      ctx.fillStyle = "#ffedb8";
      ctx.fillRect(c.len / 2 - 2.5, -c.wid / 2 + 1.5, 2.5, 3);
      ctx.fillRect(c.len / 2 - 2.5, c.wid / 2 - 4.5, 2.5, 3);
      this.drawGlow(ctx, -c.len / 2 + 1, -c.wid / 2 + 3, 6, "#ff3648", 0.7);
      this.drawGlow(ctx, -c.len / 2 + 1, c.wid / 2 - 3, 6, "#ff3648", 0.7);
      ctx.fillStyle = "#ff3648";
      ctx.fillRect(-c.len / 2, -c.wid / 2 + 1.5, 2, 3);
      ctx.fillRect(-c.len / 2, c.wid / 2 - 4.5, 2, 3);
      ctx.restore();
    }
  }

  drawSweepers(ctx) {
    for (const s of this.sweepers) {
      // patrol amber -> suspicious yellow -> alert magenta
      const col = s.alert ? "#ff3b7f" : (s.sus || 0) > 0.12 ? "#ffd24f" : "#ffb454";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, s.view, s.angle - s.fov, s.angle + s.fov);
      ctx.closePath();
      const g = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, s.view);
      g.addColorStop(0, withAlpha(col, 0.28));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fill();
      // Ground shadow + body.
      ctx.beginPath();
      ctx.ellipse(s.x + 2, s.y + 4, s.r, s.r * 0.45, 0, 0, TAU);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fill();
      this.drawGlow(ctx, s.x, s.y, s.r * 2.2, col, 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = "#02030a"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * s.r, s.y + Math.sin(s.angle) * s.r);
      ctx.stroke();
    }
  }

  drawPlayer(ctx, now) {
    const p = this.player;
    // Ground glow + drop shadow.
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 46);
    g.addColorStop(0, withAlpha(this.d.palette.accent, 0.35));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, 46, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.x + 3, p.y + 5, p.r, p.r * 0.45, 0, 0, TAU);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill();
    // Coat: a dark rounded silhouette trailing the facing direction.
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = "#141b2c";
    rr(ctx, -p.r, -p.r * 0.78, p.r * 1.7, p.r * 1.56, 7);
    ctx.fill();
    // Shoulder highlight (streetlight from above).
    ctx.fillStyle = "rgba(190,220,255,0.20)";
    rr(ctx, -p.r * 0.7, -p.r * 0.62, p.r * 1.1, p.r * 0.5, 4);
    ctx.fill();
    // Head.
    this.drawGlow(ctx, p.r * 0.14, 0, p.r * 1.1, this.d.palette.accent, 0.4);
    ctx.beginPath();
    ctx.arc(p.r * 0.14, 0, p.r * 0.52, 0, TAU);
    ctx.fillStyle = "#eafcff";
    ctx.fill();
    ctx.restore();
    // Scanner in hand: a blinking accent point ahead of the player.
    const blink = 0.5 + 0.5 * Math.sin(now / 220);
    const sx2 = p.x + Math.cos(p.angle) * (p.r + 7);
    const sy2 = p.y + Math.sin(p.angle) * (p.r + 7);
    this.drawGlow(ctx, sx2, sy2, 9, this.d.palette.accent, 0.4 + blink * 0.4);
    ctx.beginPath();
    ctx.arc(sx2, sy2, 3, 0, TAU);
    ctx.fillStyle = withAlpha(this.d.palette.accent, 0.5 + blink * 0.5);
    ctx.fill();
  }

  drawLamps(ctx, camX, camY, w, h) {
    for (const l of this.lamps) {
      if (l.x < camX - 60 || l.x > camX + w + 60 || l.y < camY - 60 || l.y > camY + h + 60) continue;
      // Warm pool of light on the pavement + lamp head.
      this.drawGlow(ctx, l.x, l.y, 78, "#ffc46e", 0.22);
      this.drawGlow(ctx, l.x, l.y, 10, "#ffd9a0", 0.9);
      ctx.beginPath(); ctx.arc(l.x, l.y, 3, 0, TAU);
      ctx.fillStyle = "#ffd9a0";
      ctx.fill();
    }
  }

  // GTA2-style extrusion: every roof is the base rect scaled about the screen
  // center by (1 + EXTRUDE * height); the walls are the quads joining them.
  drawBuildings(ctx, camX, camY, w, h, cx, cy, now) {
    const t = this.tile;
    const { x0, y0, x1, y1 } = this.visibleTileRange(camX, camY, w, h, 3);

    const tiles = [];
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if (!this.grid[y][x]) continue;
        const px = x * t, py = y * t;
        const mx2 = px + t / 2, my2 = py + t / 2;
        tiles.push({ x, y, px, py, d: (mx2 - cx) ** 2 + (my2 - cy) ** 2 });
      }
    }
    // Painter order: farthest from the projection center first, so nearer
    // buildings (small lean) overwrite the outward lean of the ones behind.
    tiles.sort((a, b) => b.d - a.d);

    for (const tl of tiles) {
      const m = this.blockMeta[tl.y][tl.x];
      const k = EXTRUDE * m.h;
      const bx = tl.px + 2, by = tl.py + 2, bs = t - 4; // base rect (inset)
      const scale = (v, c) => v + (v - c) * k;
      const rx = scale(bx, cx), ry = scale(by, cy);
      const rx2 = scale(bx + bs, cx), ry2 = scale(by + bs, cy);

      // Ambient occlusion at the base.
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(bx - 3, by - 3, bs + 6, bs + 6);

      // Wall faces. Only the faces angled toward the projection center show.
      const faces = [
        { a: [bx, by], b: [bx + bs, by], ta: [rx, ry], tb: [rx2, ry], n: [0, -1], lum: 1.0 },   // north
        { a: [bx + bs, by], b: [bx + bs, by + bs], ta: [rx2, ry], tb: [rx2, ry2], n: [1, 0], lum: 0.62 }, // east
        { a: [bx + bs, by + bs], b: [bx, by + bs], ta: [rx2, ry2], tb: [rx, ry2], n: [0, 1], lum: 0.5 },  // south
        { a: [bx, by + bs], b: [bx, by], ta: [rx, ry2], tb: [rx, ry], n: [-1, 0], lum: 0.82 },  // west
      ];
      for (const f of faces) {
        const fcX = (f.a[0] + f.b[0]) / 2, fcY = (f.a[1] + f.b[1]) / 2;
        if (f.n[0] * (fcX - cx) + f.n[1] * (fcY - cy) >= 0) continue; // back face
        ctx.fillStyle = this.shades.face.get(f.lum);
        ctx.beginPath();
        ctx.moveTo(f.a[0], f.a[1]);
        ctx.lineTo(f.b[0], f.b[1]);
        ctx.lineTo(f.tb[0], f.tb[1]);
        ctx.lineTo(f.ta[0], f.ta[1]);
        ctx.closePath();
        ctx.fill();

        // Lit windows climbing the wall.
        if (m.lit && m.h > 0.45) {
          for (let row = 0; row < 3; row++) {
            for (let col2 = 0; col2 < 3; col2++) {
              if ((tl.x * 3 + col2 + tl.y * 7 + row) % 3 !== 0) continue;
              const u = 0.2 + col2 * 0.3;
              const v = 0.25 + row * 0.28;
              const gx = lerp(lerp(f.a[0], f.b[0], u), lerp(f.ta[0], f.tb[0], u), v);
              const gy = lerp(lerp(f.a[1], f.b[1], u), lerp(f.ta[1], f.tb[1], u), v);
              ctx.fillStyle = withAlpha("#ffcf8a", 0.5 * f.lum);
              ctx.fillRect(gx - 1.5, gy - 2.5, 3, 5);
            }
          }
        }

        // Neon sign hung mid-wall on the street-facing side.
        if (m.sign) {
          const flick = m.sign.flicker
            ? (Math.sin(now / 90 + m.sign.phase) > -0.72 ? 1 : 0.15)
            : 0.8 + 0.2 * Math.sin(now / 500 + m.sign.phase);
          const u = 0.5, v = 0.5;
          const sx = lerp(lerp(f.a[0], f.b[0], u), lerp(f.ta[0], f.tb[0], u), v);
          const sy = lerp(lerp(f.a[1], f.b[1], u), lerp(f.ta[1], f.tb[1], u), v);
          this.drawGlow(ctx, sx, sy, 16, m.sign.color, 0.5 * flick);
          ctx.fillStyle = withAlpha(m.sign.color, 0.85 * flick);
          ctx.fillRect(sx - 8, sy - 2.5, 16, 5);
          // Color bleed: the sign washes its light onto the street below
          // (the 2D stand-in for bounce lighting).
          this.drawGlow(ctx, (f.a[0] + f.b[0]) / 2, (f.a[1] + f.b[1]) / 2 + 10, 42, m.sign.color, 0.13 * flick);
        }
      }

      // Roof: an axis-aligned rect (scaling about a point keeps it a rect).
      ctx.fillStyle = this.shades.roof;
      ctx.fillRect(rx, ry, rx2 - rx, ry2 - ry);
      // Light-side edge highlight (NW) + dark far edge.
      ctx.strokeStyle = withAlpha("#a8c8ff", 0.18);
      ctx.beginPath();
      ctx.moveTo(rx, ry2); ctx.lineTo(rx, ry); ctx.lineTo(rx2, ry);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(rx2, ry); ctx.lineTo(rx2, ry2); ctx.lineTo(rx, ry2);
      ctx.stroke();
      // Roof clutter: AC units and a blinking aviation light on the tallest.
      const rw = rx2 - rx;
      if (m.ac && rw > 26) {
        ctx.fillStyle = this.shades.ac;
        ctx.fillRect(rx + rw * 0.18, ry + rw * 0.2, rw * 0.2, rw * 0.14);
        ctx.fillRect(rx + rw * 0.58, ry + rw * 0.55, rw * 0.16, rw * 0.2);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(rx + rw * 0.18, ry + rw * 0.34, rw * 0.2, 2);
      }
      if (m.antenna && m.h > 0.8) {
        const blink = Math.sin(now / 460 + tl.x * 3 + tl.y) > 0.55;
        ctx.strokeStyle = "rgba(140,160,190,0.6)";
        ctx.beginPath();
        ctx.moveTo(rx + rw / 2, ry + rw / 2);
        ctx.lineTo(rx + rw / 2, ry + rw / 2 - 10);
        ctx.stroke();
        if (blink) {
          this.drawGlow(ctx, rx + rw / 2, ry + rw / 2 - 10.5, 7, "#ff4b58", 0.7);
          ctx.fillStyle = "#ff4b58";
          ctx.fillRect(rx + rw / 2 - 1.5, ry + rw / 2 - 12, 3, 3);
        }
      }
    }
  }

  drawBirds(ctx, camX, camY, w, h) {
    for (const b of this.birds) {
      if (b.x < camX - 40 || b.x > camX + w + 40 || b.y < camY - 40 || b.y > camY + h + 40) continue;
      if (b.state === "rest") {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 3.4, 2.4, 0, 0, TAU);
        ctx.fillStyle = "#1b2434";
        ctx.fill();
        ctx.fillStyle = "#2c3a52";
        ctx.fillRect(b.x - 1, b.y - 2.6, 2, 2);
      } else {
        // In flight: a flapping "v" pointed along the velocity.
        const a = Math.atan2(b.vy, b.vx);
        const spread = 4 + Math.sin(b.flap) * 3;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(a);
        ctx.strokeStyle = "#2c3a52";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-3, -spread);
        ctx.lineTo(1.5, 0);
        ctx.lineTo(-3, spread);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawFog(ctx, camX, camY, w, h) {
    for (const f of this.fog) {
      if (f.x + f.r < camX || f.x - f.r > camX + w || f.y + f.r < camY || f.y - f.r > camY + h) continue;
      this.drawGlow(ctx, f.x, f.y, f.r, "#8fa8c8", f.a);
    }
  }

  drawParticles(ctx) {
    ctx.globalCompositeOperation = "lighter";
    for (const pt of this.particles) {
      ctx.globalAlpha = clamp(pt.life, 0, 1);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // Night falls over everything; lights punch holes in the darkness.
  compositeLighting(ctx, camX, camY, w, h, now) {
    const lc = this.lightCtx;
    // At the lowest quality tier, rebuild the darkness layer every other
    // frame and reuse the previous one (a half-frame light lag is invisible).
    if (this.quality === 0 && this.frameNo % 2 === 1) {
      ctx.drawImage(this.lightCanvas, 0, 0, w, h);
      return;
    }
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = "source-over";
    // Time of day: dusk when the district starts, deepest night mid-run,
    // first hint of dawn as the timer runs out. Storms darken everything.
    const phase = clamp(1 - this.timeLeft / this.d.timeLimit, 0, 1);
    const ambient = clamp(
      AMBIENT_DARK - 0.12 + 0.16 * Math.sin(Math.PI * phase) +
      (this.weather.mode === "storm" ? 0.05 : 0),
      0, 0.7);
    lc.fillStyle = `rgba(3,7,18,${ambient})`;
    lc.fillRect(0, 0, w, h);
    lc.globalCompositeOperation = "destination-out";

    const sprite = this.glowSprite("#ffffff");
    const hole = (wx, wy, r, a) => {
      const x = wx - camX, y = wy - camY;
      if (x < -r || x > w + r || y < -r || y > h + r) return;
      lc.globalAlpha = a;
      lc.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    };

    hole(this.player.x, this.player.y, 150, 0.9);
    for (const l of this.lamps) {
      const flick = 0.85 + 0.15 * Math.sin(now / 300 + l.phase);
      hole(l.x, l.y, 130 * flick, 0.85);
    }
    for (const e of this.emitters) {
      if (e.neutralized) continue;
      const vis = clamp(1 - dist(e, this.player) / 300, 0, 1);
      if (vis > 0.02) hole(e.x, e.y, 160 * vis, 0.8);
    }
    for (const c of this.cars) {
      const x = c.vertical ? c.lane + 15 * c.dir : c.pos;
      const y = c.vertical ? c.pos : c.lane + 15 * -c.dir;
      const ahead = 46;
      const hx = c.vertical ? x : x + ahead * c.dir;
      const hy = c.vertical ? y + ahead * c.dir : y;
      hole(hx, hy, 95, 0.7);
    }
    for (const s of this.sweepers) hole(s.x, s.y, 90, 0.6);
    lc.globalAlpha = 1;

    ctx.drawImage(this.lightCanvas, 0, 0, w, h);
  }

  // Colored light accents drawn over the darkness for extra punch.
  drawAccentGlows(ctx, camX, camY, w, h) {
    ctx.globalCompositeOperation = "lighter";
    const glow = (wx, wy, r, color, a) => {
      const x = wx - camX, y = wy - camY;
      if (x < -r || x > w + r || y < -r || y > h + r) return;
      this.drawGlow(ctx, x, y, r, color, a);
    };
    glow(this.player.x, this.player.y, 90, this.d.palette.accent, 0.10);
    for (const l of this.lamps) glow(l.x, l.y, 70, "#ffb454", 0.10);
    for (const e of this.emitters) {
      if (e.neutralized) continue;
      const vis = clamp(1 - dist(e, this.player) / 300, 0, 1);
      if (vis > 0.02) glow(e.x, e.y, 120 * vis, this.d.palette.accent, 0.16);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  drawRain(ctx, w, h) {
    const mode = this.weather.mode;
    const count = mode === "drizzle" ? 55 : 110;
    const alpha = mode === "drizzle" ? 0.13 : mode === "rain" ? 0.20 : 0.28;
    const speedMul = mode === "storm" ? 1.35 : 1;
    const windX = this.wind; // gusts slant the whole rain field
    ctx.strokeStyle = `rgba(150,195,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const dt = 1 / 60;
    for (let i = 0; i < count; i++) {
      const d = this.rainDrops[i];
      d.y += d.s * speedMul * dt;
      d.x -= d.s * windX * dt;
      if (d.y > h) { d.y = -20; d.x = Math.random() * (w + 60); }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.l * windX, d.y - d.l);
    }
    ctx.stroke();
  }

  // Cheap bloom: blur a quarter-res copy of the frame back over itself.
  compositeBloom(ctx, w, h) {
    if (!this.canFilter) return;
    const bc = this.bloomCtx, bw = this.bloomCanvas.width, bh = this.bloomCanvas.height;
    bc.setTransform(1, 0, 0, 1, 0, 0);
    bc.clearRect(0, 0, bw, bh);
    bc.filter = "blur(4px) saturate(1.25) brightness(1.06)";
    bc.drawImage(this.canvas, 0, 0, bw, bh);
    bc.filter = "none";
    ctx.globalAlpha = 0.30;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(this.bloomCanvas, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  drawGrain(ctx, w, h) {
    const s = this.noiseCanvas.width;
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.translate(-((Math.random() * s) | 0), -((Math.random() * s) | 0));
    ctx.fillStyle = this.noisePattern;
    ctx.fillRect(0, 0, w + s, h + s);
    ctx.restore();
  }

  drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Screen-edge "tingle" that sharpens with resonance — the detection cue.
  drawScannerTingle(ctx, w, h, now) {
    const r = this.resonance;
    if (r < 0.02) return;
    const pulse = 0.5 + 0.5 * Math.sin(now / (120 - r * 70));
    const inten = r * pulse;
    // Hug the screen edges — a nervous rim of light, not a full-screen wash.
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.62, w / 2, h / 2, h * 0.85);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, withAlpha(this.d.palette.accent, inten * 0.34));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  drawMinimap(ctx, w, h) {
    const pad = 22, size = 150;
    const mx = w - size - pad, my = h - size - pad;
    const sx = size / this.worldW, sy = size / this.worldH;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(6,10,20,0.8)";
    ctx.fillRect(mx, my, size, size);
    ctx.strokeStyle = "rgba(80,120,180,0.4)";
    ctx.strokeRect(mx, my, size, size);
    for (const e of this.emitters) {
      if (e.neutralized) continue;
      if (dist(e, this.player) > 320) continue;
      ctx.fillStyle = this.d.palette.accent;
      ctx.fillRect(mx + e.x * sx - 1.5, my + e.y * sy - 1.5, 3, 3);
    }
    for (const s of this.sweepers) {
      ctx.fillStyle = s.alert ? "#ff3b7f" : "#ffb454";
      ctx.fillRect(mx + s.x * sx - 1.5, my + s.y * sy - 1.5, 3, 3);
    }
    ctx.fillStyle = "#eafcff";
    ctx.fillRect(mx + this.player.x * sx - 2, my + this.player.y * sy - 2, 4, 4);
    ctx.restore();
  }

  // -------------------- prompts + end states --------------------
  showPrompt(text) {
    this.hud.prompt.textContent = text;
    this.hud.prompt.classList.add("show");
  }
  hidePrompt() { this.hud.prompt.classList.remove("show"); }

  winDistrict() {
    this.pausedForOverlay = true;
    const next = this.districtIndex + 1;
    if (next < DISTRICTS.length) {
      this.onEnd({
        type: "win",
        title: "DISTRICT CLEARED",
        body: `${this.d.name} is dark. ${DISTRICTS[next].name} is already lighting up — Meridian is moving.`,
        next,
      });
    } else {
      this.onEnd({
        type: "victory",
        title: "HALCYON BAY IS QUIET",
        body: "Every emitter across the three districts is neutralized. The Meridian array never finished locking. Vesper Kade goes dark — for now.",
        next: null,
      });
    }
  }

  loseDistrict(title, body) {
    this.pausedForOverlay = true;
    this.onEnd({ type: "lose", title, body, retry: this.districtIndex });
  }

  stop() {
    this.running = false;
    window.removeEventListener("resize", this._resize);
    this.input.destroy();
  }
}

// -------------------- helpers --------------------
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function normAngle(a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rr(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  else { ctx.beginPath(); ctx.rect(x, y, w, h); }
}
function withAlpha(hex, a) {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${clamp(a, 0, 1)})`;
}
function shade(hex, f) {
  const c = hexToRgb(hex);
  return `rgb(${Math.min(255, Math.round(c.r * f))},${Math.min(255, Math.round(c.g * f))},${Math.min(255, Math.round(c.b * f))})`;
}
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return `#${[["r"], ["g"], ["b"]].map(([k]) =>
    Math.round(ca[k] + (cb[k] - ca[k]) * t).toString(16).padStart(2, "0")).join("")}`;
}
function hexToRgb(hex) {
  const s = hex.replace("#", "");
  const n = s.length === 3 ? s.split("").map((x) => x + x).join("") : s;
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}
