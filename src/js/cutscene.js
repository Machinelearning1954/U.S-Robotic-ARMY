// REZONANCE — intro cutscene.
// Plays src/assets/intro.mp4 if the file exists (drop your own footage there);
// otherwise renders an original animated briefing: rain over the Halcyon Bay
// skyline, a scanner waveform, and a typewritten message from Vesper's handler.
// Skippable at any time. All content fictional.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Deterministic PRNG so the skyline is stable between plays.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PHASES = [
  { at: 0,    caption: "HALCYON BAY — 02:14 AM" },
  { at: 4.5,  caption: "ANOMALOUS HARMONIC SIGNATURE — GRID 7" },
  { at: 9,    caption: "" }, // typewriter message takes over
];
const MESSAGE =
  "VESPER — MERIDIAN MOVED EARLY.\n" +
  "THREE DISTRICTS ARE ALREADY HUMMING.\n" +
  "YOU'LL FEEL IT BEFORE YOU SEE IT.\n" +
  "FOLLOW THE RESONANCE. BURN EVERY EMITTER.\n\n" +
  "— K";
const MESSAGE_START = 9;
const TOTAL = 17;

export class Cutscene {
  constructor(els) {
    this.els = els; // { screen, canvas, video, text }
    this.ctx = els.canvas.getContext("2d");
    this.done = null;
    this._raf = null;
    this._skip = (e) => {
      if (e.type === "keydown" && e.repeat) return;
      this.finish();
    };
  }

  // Resolves when the cutscene ends or is skipped.
  play() {
    return new Promise(async (resolve) => {
      this.done = resolve;
      this.els.screen.classList.add("active");
      window.addEventListener("keydown", this._skip);
      this.els.screen.addEventListener("pointerdown", this._skip);

      if (await this.hasVideo()) this.playVideo();
      else this.playAnimated();
    });
  }

  async hasVideo() {
    try {
      const res = await fetch("src/assets/intro.mp4", { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  playVideo() {
    const v = this.els.video;
    v.src = "src/assets/intro.mp4";
    v.style.display = "block";
    v.onended = () => this.finish();
    v.onerror = () => { v.style.display = "none"; this.playAnimated(); };
    v.play().catch(() => { v.style.display = "none"; this.playAnimated(); });
  }

  playAnimated() {
    const c = this.els.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    c.width = this.w * dpr;
    c.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Skyline: silhouetted towers with a few lit windows.
    const rng = mulberry32(0xB4C0DE);
    this.towers = [];
    let x = -40;
    while (x < this.w + 60) {
      const w = 46 + rng() * 90;
      const h = this.h * (0.22 + rng() * 0.38);
      const windows = [];
      for (let i = 0; i < 26; i++) {
        if (rng() < 0.28) windows.push({ wx: rng(), wy: rng(), tw: rng() * 6 });
      }
      this.towers.push({ x, w, h, windows });
      x += w + 6 + rng() * 22;
    }
    // Rain streaks.
    this.rain = Array.from({ length: 130 }, () => ({
      x: rng() * this.w, y: rng() * this.h, s: 420 + rng() * 520, l: 9 + rng() * 15,
    }));

    this.t0 = performance.now();
    const loop = (t) => {
      const el = (t - this.t0) / 1000;
      if (el >= TOTAL) { this.finish(); return; }
      this.drawFrame(el, t);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  drawFrame(el, now) {
    const { ctx, w, h } = this;
    const dt = 1 / 60;

    // Night sky wash.
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#04060e");
    sky.addColorStop(0.65, "#081226");
    sky.addColorStop(1, "#0c1a33");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant glow on the horizon.
    const glow = ctx.createRadialGradient(w * 0.62, h * 0.78, 10, w * 0.62, h * 0.78, h * 0.7);
    glow.addColorStop(0, "rgba(51,226,255,0.14)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Towers.
    for (const tw of this.towers) {
      const top = h - tw.h;
      ctx.fillStyle = "#060a14";
      ctx.fillRect(tw.x, top, tw.w, tw.h);
      ctx.strokeStyle = "rgba(51,226,255,0.08)";
      ctx.strokeRect(tw.x + 0.5, top + 0.5, tw.w - 1, tw.h - 1);
      for (const win of tw.windows) {
        const flick = 0.55 + 0.45 * Math.sin(now / 700 + win.tw * 10);
        ctx.fillStyle = `rgba(255,180,84,${0.35 * flick})`;
        ctx.fillRect(tw.x + 5 + win.wx * (tw.w - 14), top + 8 + win.wy * (tw.h - 20), 4, 6);
      }
    }

    // Rain.
    ctx.strokeStyle = "rgba(140,190,255,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of this.rain) {
      d.y += d.s * dt;
      d.x -= d.s * 0.12 * dt;
      if (d.y > h) { d.y = -20; d.x = Math.random() * (w + 80); }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.l * 0.12, d.y - d.l);
    }
    ctx.stroke();

    // Phase B: scanner waveform sweeping across the lower third.
    if (el >= 4.5 && el < 10.5) {
      const fade = clamp((el - 4.5) / 0.8, 0, 1) * clamp((10.5 - el) / 0.8, 0, 1);
      const base = h * 0.62;
      ctx.strokeStyle = `rgba(51,226,255,${0.75 * fade})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = "#33e2ff";
      ctx.shadowBlur = 12 * fade;
      ctx.beginPath();
      for (let px = 0; px <= w; px += 3) {
        const k = px / w;
        // A carrier plus a "spike" that intensifies mid-phase — the anomaly.
        const spike = Math.exp(-Math.pow((k - 0.62) * 9, 2)) * 46 * fade;
        const y = base
          + Math.sin(px * 0.045 + now / 130) * 7
          + Math.sin(px * 0.013 - now / 90) * 5
          + Math.sin(px * 0.21 + now / 45) * spike * 0.35
          - spike * Math.abs(Math.sin(now / 110));
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Letterbox bars for the cinematic frame.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h * 0.09);
    ctx.fillRect(0, h * 0.91, w, h * 0.09);

    // Captions / typewriter text via the DOM node (crisper than canvas text).
    let text = "";
    if (el < MESSAGE_START) {
      for (const p of PHASES) if (el >= p.at) text = p.caption;
    } else {
      const chars = Math.floor((el - MESSAGE_START) * 34);
      text = MESSAGE.slice(0, chars);
    }
    if (this.els.text.textContent !== text) this.els.text.textContent = text;

    // Slow fade-in from black at the start, fade-out at the end.
    const fadeIn = clamp(1 - el / 1.2, 0, 1);
    const fadeOut = clamp((el - (TOTAL - 1.2)) / 1.2, 0, 1);
    const black = Math.max(fadeIn, fadeOut);
    if (black > 0) {
      ctx.fillStyle = `rgba(0,0,0,${black})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  finish() {
    if (!this.done) return;
    const resolve = this.done;
    this.done = null;
    if (this._raf) cancelAnimationFrame(this._raf);
    window.removeEventListener("keydown", this._skip);
    this.els.screen.removeEventListener("pointerdown", this._skip);
    const v = this.els.video;
    v.pause?.();
    v.removeAttribute("src");
    v.style.display = "none";
    this.els.text.textContent = "";
    this.els.screen.classList.remove("active");
    resolve();
  }
}
