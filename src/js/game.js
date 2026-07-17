// REZONANCE — core engine. Top-down neon-noir signals-investigation.
// Pure canvas 2D, no dependencies. All content fictional.
import { Input } from "./input.js";
import { DISTRICTS } from "./world.js";

const TAU = Math.PI * 2;
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
    this.resize();
    this.startTime = 0;
    this.pausedForOverlay = false;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    // Grid: true = building block (solid), false = road.
    this.grid = [];
    for (let y = 0; y < d.rows; y++) {
      const row = [];
      for (let x = 0; x < d.cols; x++) {
        // Roads every 3rd lane; blocks elsewhere, with some carved plazas.
        const road = x % 4 === 0 || y % 4 === 0;
        const plaza = rng() < 0.05;
        row.push(!road && !plaza);
      }
      this.grid.push(row);
    }

    // Building heights/colors per block for parallax shading.
    this.blockMeta = this.grid.map((row) =>
      row.map(() => ({ h: 0.4 + rng() * 0.6, lit: rng() < 0.5 }))
    );

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

    this.camera = { x: this.player.x, y: this.player.y };
    this.resonance = 0;
    this.exposure = 0;
    this.stamina = 100;
    this.startTime = performance.now();
    this.timeLeft = d.timeLimit;
    this.pings = []; // expanding scan rings
    this.particles = [];
    this.hud.districtName.textContent = d.name;
    this.updateCounts();
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
    // Axis-separated so we slide along walls.
    if (!this.solidAt(ent.x + dx + Math.sign(dx) * ent.r, ent.y)) ent.x += dx;
    if (!this.solidAt(ent.x, ent.y + dy + Math.sign(dy) * ent.r)) ent.y += dy;
    ent.x = clamp(ent.x, ent.r, this.worldW - ent.r);
    ent.y = clamp(ent.y, ent.r, this.worldH - ent.r);
  }

  // -------------------- main loop --------------------
  frame(t) {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
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
    const target = nearest ? clamp(1 - nd / range, 0, 1) : 0;
    this.resonance = lerp(this.resonance, target, 1 - Math.pow(0.02, dt));

    // Scanner ping.
    if (this.input.justPressed(" ")) {
      this.pings.push({ x: p.x, y: p.y, r: 0, max: 420, life: 1 });
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
        this.spawnBurst(nearest.x, nearest.y, this.d.palette.accent);
        this.updateCounts();
        this.hidePrompt();
        if (this.emitters.every((e) => e.neutralized)) this.winDistrict();
      }
    } else {
      this.hidePrompt();
    }

    // Sweepers patrol + detection.
    for (const s of this.sweepers) {
      const tgtx = s.tx, tgty = s.ty;
      const ang = Math.atan2(tgty - s.y, tgtx - s.x);
      s.angle = ang;
      this.moveCircle(s, Math.cos(ang) * s.speed * dt, Math.sin(ang) * s.speed * dt);
      if (Math.hypot(tgtx - s.x, tgty - s.y) < 20) {
        // swap waypoints
        const tmp = { x: s.tx, y: s.ty };
        s.tx = s.wpA.x === s.tx && s.wpA.y === s.ty ? s.wpB.x : s.wpA.x;
        s.ty = s.wpA.x === tmp.x && s.wpA.y === tmp.y ? s.wpB.y : s.wpA.y;
      }
      // Vision cone check.
      const toP = Math.atan2(p.y - s.y, p.x - s.x);
      const dd = dist(s, p);
      let diff = Math.abs(normAngle(toP - s.angle));
      const seen = dd < s.view && diff < s.fov && this.lineOfSight(s, p);
      s.alert = seen;
      if (seen) this.exposure = clamp(this.exposure + 26 * dt, 0, 100);
    }
    if (!this.sweepers.some((s) => s.alert)) {
      this.exposure = clamp(this.exposure - 10 * dt, 0, 100);
    }

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

    // Fail states.
    if (this.exposure >= 100) this.loseDistrict("EXPOSED", "A sweeper flagged your position. The channel went cold and Meridian scrubbed the district.");
    else if (this.timeLeft <= 0) this.loseDistrict("EMITTERS LOCKED", "The harmonic array finished locking before you cleared it. Halcyon Bay stays saturated.");
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
    const ctx = this.ctx, w = this.w, h = this.h;
    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, w, h);

    // Clamp camera to world bounds so we never reveal empty void past the edge
    // (unless the world is smaller than the viewport, then center it).
    let camX = this.camera.x - w / 2;
    let camY = this.camera.y - h / 2;
    camX = this.worldW > w ? clamp(camX, 0, this.worldW - w) : (this.worldW - w) / 2;
    camY = this.worldH > h ? clamp(camY, 0, this.worldH - h) : (this.worldH - h) / 2;
    ctx.save();
    ctx.translate(-camX, -camY);

    this.drawCity(ctx, camX, camY, w, h);
    this.drawPings(ctx);
    this.drawEmitters(ctx);
    this.drawSweepers(ctx);
    this.drawParticles(ctx);
    this.drawPlayer(ctx);

    ctx.restore();

    this.drawVignette(ctx, w, h);
    this.drawScannerTingle(ctx, w, h);
    this.drawMinimap(ctx, w, h);
  }

  drawCity(ctx, camX, camY, w, h) {
    const t = this.tile;
    const x0 = Math.max(0, Math.floor(camX / t) - 1);
    const y0 = Math.max(0, Math.floor(camY / t) - 1);
    const x1 = Math.min(this.cols, Math.ceil((camX + w) / t) + 1);
    const y1 = Math.min(this.rows, Math.ceil((camY + h) / t) + 1);
    const pal = this.d.palette;

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const px = x * t, py = y * t;
        if (this.grid[y][x]) {
          const m = this.blockMeta[y][x];
          // building base
          ctx.fillStyle = pal.block;
          ctx.fillRect(px + 2, py + 2, t - 4, t - 4);
          // roof inset for faux-height
          const inset = 6 + m.h * 10;
          ctx.fillStyle = shade(pal.block, 0.5 + m.h * 0.3);
          ctx.fillRect(px + inset, py + inset, t - inset * 2, t - inset * 2);
          ctx.strokeStyle = pal.edge;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 2.5, py + 2.5, t - 5, t - 5);
          // lit windows
          if (m.lit) {
            ctx.fillStyle = withAlpha(pal.accent, 0.5);
            const wsz = 5;
            for (let wy = 0; wy < 3; wy++)
              for (let wx = 0; wx < 3; wx++)
                if ((x * 3 + wx + y * 7 + wy) % 3 === 0)
                  ctx.fillRect(px + 12 + wx * 14, py + 12 + wy * 14, wsz, wsz);
          }
        } else {
          // road tile with faint grid glow
          ctx.fillStyle = pal.road;
          ctx.fillRect(px, py, t, t);
          ctx.strokeStyle = withAlpha(pal.edge, 0.4);
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, t, t);
        }
      }
    }
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
        // spent node
        ctx.beginPath();
        ctx.arc(e.x, e.y, 8, 0, TAU);
        ctx.fillStyle = "#28405a";
        ctx.fill();
        continue;
      }
      // Emitters are "hidden": only visible via resonance proximity or an active ping wash.
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

  drawSweepers(ctx) {
    for (const s of this.sweepers) {
      // vision cone
      const col = s.alert ? "#ff3b7f" : "#ffb454";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, s.view, s.angle - s.fov, s.angle + s.fov);
      ctx.closePath();
      const g = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, s.view);
      g.addColorStop(0, withAlpha(col, 0.28));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fill();
      // body
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fillStyle = col;
      ctx.shadowColor = col; ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
      // facing tick
      ctx.strokeStyle = "#02030a"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + Math.cos(s.angle) * s.r, s.y + Math.sin(s.angle) * s.r);
      ctx.stroke();
    }
  }

  drawParticles(ctx) {
    for (const pt of this.particles) {
      ctx.globalAlpha = clamp(pt.life, 0, 1);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  drawPlayer(ctx) {
    const p = this.player;
    // soft ground glow
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 46);
    g.addColorStop(0, withAlpha(this.d.palette.accent, 0.35));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, 46, 0, TAU); ctx.fill();
    // body
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fillStyle = "#eafcff";
    ctx.shadowColor = this.d.palette.accent; ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
    // facing
    ctx.strokeStyle = this.d.palette.accent; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.angle) * (p.r + 8), p.y + Math.sin(p.angle) * (p.r + 8));
    ctx.stroke();
  }

  drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Screen-edge "tingle" that sharpens with resonance — the detection cue.
  drawScannerTingle(ctx, w, h) {
    const r = this.resonance;
    if (r < 0.02) return;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / (120 - r * 70));
    const inten = r * pulse;
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.75);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, withAlpha(this.d.palette.accent, inten * 0.5));
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
    // emitters (only those detected via resonance/ping shown faintly)
    for (const e of this.emitters) {
      if (e.neutralized) continue;
      if (dist(e, this.player) > 320) continue;
      ctx.fillStyle = this.d.palette.accent;
      ctx.fillRect(mx + e.x * sx - 1.5, my + e.y * sy - 1.5, 3, 3);
    }
    // sweepers
    for (const s of this.sweepers) {
      ctx.fillStyle = s.alert ? "#ff3b7f" : "#ffb454";
      ctx.fillRect(mx + s.x * sx - 1.5, my + s.y * sy - 1.5, 3, 3);
    }
    // player
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
function withAlpha(hex, a) {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${clamp(a, 0, 1)})`;
}
function shade(hex, f) {
  const c = hexToRgb(hex);
  return `rgb(${Math.round(c.r * f)},${Math.round(c.g * f)},${Math.round(c.b * f)})`;
}
function hexToRgb(hex) {
  const s = hex.replace("#", "");
  const n = s.length === 3 ? s.split("").map((x) => x + x).join("") : s;
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}
