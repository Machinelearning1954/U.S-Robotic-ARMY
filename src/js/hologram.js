// REZONANCE — handler "comms uplink" hologram.
// An original, fully procedural animated portrait of K, Vesper's handler:
// a signals analyst with a headset in front of a command display — code
// rain, an orange wireframe globe, hex reticles, and telemetry projected
// across her face. Drawn on a small HUD canvas whenever the radio is live.
// Inspired by (not copied from) a command-center reel; see the title credit.

const GLYPHS = "01<>/{}#$%&=+*";

export class HandlerHologram {
  constructor(canvas) {
    this.c = canvas;
    this.x = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    // code-rain columns with independent speeds/phases
    this.cols = Array.from({ length: 9 }, (_, i) => ({
      x: 6 + i * (this.w - 12) / 9,
      speed: 14 + Math.random() * 26,
      phase: Math.random() * 1000,
      chars: Array.from({ length: 10 }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]),
    }));
    this.glitchAt = 0;
  }

  draw(nowMs) {
    const t = nowMs * 0.001;
    const x = this.x, w = this.w, h = this.h;

    // backdrop
    const bg = x.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#050c18");
    bg.addColorStop(1, "#03070f");
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);

    // code rain
    x.font = "7px monospace";
    for (const col of this.cols) {
      const off = ((t * col.speed + col.phase) % 30);
      for (let i = 0; i < 10; i++) {
        const cy = ((i * 22 + off * 4) % (h + 20)) - 10;
        const head = i === 0;
        x.fillStyle = head ? "rgba(190,240,255,0.75)" : "rgba(80,190,230,0.28)";
        x.fillText(col.chars[(i + ((t * 2) | 0)) % 10], col.x, cy);
      }
    }

    // orange wireframe globe, lower left
    const gx = 30, gy = h - 48, gr = 22;
    x.strokeStyle = "rgba(255,150,60,0.7)";
    x.lineWidth = 1;
    x.beginPath(); x.arc(gx, gy, gr, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(255,150,60,0.4)";
    for (let i = -1; i <= 1; i++) { // latitudes
      x.beginPath();
      x.ellipse(gx, gy, gr, gr * 0.38, 0, 0, Math.PI * 2);
      x.save(); x.translate(0, i * gr * 0.55); x.stroke(); x.restore();
      x.beginPath();
      x.ellipse(gx, gy + i * gr * 0.55, Math.sqrt(Math.max(0.05, 1 - (i * 0.55) ** 2)) * gr, gr * 0.16, 0, 0, Math.PI * 2);
      x.stroke();
    }
    for (let i = 0; i < 3; i++) { // spinning meridians
      const p = Math.cos(t * 0.9 + i * 1.05);
      x.beginPath();
      x.ellipse(gx, gy, Math.abs(p) * gr, gr, 0, 0, Math.PI * 2);
      x.stroke();
    }
    const gpulse = 0.5 + 0.5 * Math.sin(t * 3);
    x.fillStyle = `rgba(255,170,80,${0.35 + gpulse * 0.45})`;
    x.beginPath(); x.arc(gx, gy, 2.6, 0, Math.PI * 2); x.fill();

    // hex reticle, lower right, with pulsing warning triangle
    const hx = w - 30, hy = h - 40, hr = 16 + Math.sin(t * 2.2) * 1.5;
    x.strokeStyle = "rgba(90,210,255,0.55)";
    for (const r of [hr, hr * 0.62]) {
      x.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = t * 0.25 + i * Math.PI / 3;
        x[i ? "lineTo" : "moveTo"](hx + Math.cos(a) * r, hy + Math.sin(a) * r);
      }
      x.stroke();
    }
    x.fillStyle = `rgba(255,170,60,${0.4 + 0.4 * Math.sin(t * 4)})`;
    x.beginPath();
    x.moveTo(hx, hy - 5); x.lineTo(hx + 4.5, hy + 3.5); x.lineTo(hx - 4.5, hy + 3.5);
    x.closePath(); x.fill();

    // ---- the analyst (original stylized portrait, cyan rim light) ----
    const px = w * 0.56, py = h * 0.44; // face anchor
    x.save();
    x.translate(px, py);
    const sway = Math.sin(t * 0.8) * 0.8;
    x.rotate(sway * 0.01);
    // shoulders / high-collar jacket
    x.fillStyle = "#141a28";
    x.beginPath();
    x.moveTo(-34, 62); x.quadraticCurveTo(-30, 34, -14, 28);
    x.lineTo(14, 28); x.quadraticCurveTo(32, 34, 36, 62);
    x.closePath(); x.fill();
    x.strokeStyle = "rgba(51,226,255,0.5)"; // rim light on the right shoulder
    x.beginPath(); x.moveTo(15, 29); x.quadraticCurveTo(31, 35, 35, 60); x.stroke();
    // collar
    x.fillStyle = "#0e1420";
    x.fillRect(-11, 22, 24, 10);
    // neck
    x.fillStyle = "#8d7b6e";
    x.fillRect(-6, 14, 13, 12);
    // face: three-quarter oval
    x.fillStyle = "#a08a7a";
    x.beginPath();
    x.ellipse(1, -2, 14, 18, 0, 0, Math.PI * 2);
    x.fill();
    // shading on the far side of the face
    x.fillStyle = "rgba(10,16,28,0.35)";
    x.beginPath();
    x.ellipse(-5, -2, 8, 17, 0, Math.PI * 0.4, Math.PI * 1.6);
    x.fill();
    // bob haircut: crown + side curtains
    x.fillStyle = "#20242e";
    x.beginPath();
    x.ellipse(0, -10, 16.5, 13, 0, Math.PI, Math.PI * 2);
    x.fill();
    x.beginPath(); // left curtain
    x.moveTo(-16, -10); x.quadraticCurveTo(-19, 8, -13, 20);
    x.lineTo(-8, 20); x.quadraticCurveTo(-13, 4, -12, -8);
    x.closePath(); x.fill();
    x.beginPath(); // right curtain
    x.moveTo(16, -10); x.quadraticCurveTo(20, 8, 14, 21);
    x.lineTo(9, 21); x.quadraticCurveTo(14, 4, 13, -8);
    x.closePath(); x.fill();
    x.strokeStyle = "rgba(51,226,255,0.55)"; // hair rim light
    x.beginPath(); x.moveTo(15, -12); x.quadraticCurveTo(19, 6, 14, 20); x.stroke();
    // eyes: calm, looking off-frame left
    x.fillStyle = "#141824";
    x.fillRect(-8, -4, 5, 2);
    x.fillRect(4, -4, 5, 2);
    // brow + nose + mouth hints
    x.strokeStyle = "rgba(20,24,36,0.7)";
    x.beginPath(); x.moveTo(-9, -8); x.lineTo(-3, -8.5); x.stroke();
    x.beginPath(); x.moveTo(4, -8.5); x.lineTo(10, -8); x.stroke();
    x.beginPath(); x.moveTo(0, -2); x.lineTo(-1, 5); x.stroke();
    x.beginPath(); x.moveTo(-3, 10); x.lineTo(3, 10); x.stroke();
    // headset: ear cup, glowing ring, mic boom with lit tip
    x.fillStyle = "#0c121e";
    x.beginPath(); x.arc(13, 2, 4.5, 0, Math.PI * 2); x.fill();
    x.strokeStyle = `rgba(51,226,255,${0.5 + 0.4 * Math.sin(t * 5)})`;
    x.beginPath(); x.arc(13, 2, 4.5, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#233046";
    x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(13, 6); x.quadraticCurveTo(10, 13, 2, 12); x.stroke();
    x.lineWidth = 1;
    const micGlow = 0.6 + 0.4 * Math.sin(t * 7);
    x.fillStyle = `rgba(160,235,255,${micGlow})`;
    x.beginPath(); x.arc(2, 12, 1.8, 0, Math.PI * 2); x.fill();
    // telemetry projected on the cheek/temple (flickering dashes)
    x.fillStyle = `rgba(190,240,255,${0.35 + 0.25 * Math.sin(t * 9 + 1)})`;
    for (let r = 0; r < 4; r++) {
      const ln = 3 + ((r * 7 + ((t * 3) | 0)) % 4) * 2;
      x.fillRect(3, -14 + r * 3, ln, 1);
    }
    x.restore();

    // frame: corner brackets + label
    x.strokeStyle = "rgba(51,226,255,0.6)";
    const cb = 9;
    for (const [cx, cy, dx, dy] of [[2, 2, 1, 1], [w - 2, 2, -1, 1], [2, h - 2, 1, -1], [w - 2, h - 2, -1, -1]]) {
      x.beginPath();
      x.moveTo(cx + dx * cb, cy); x.lineTo(cx, cy); x.lineTo(cx, cy + dy * cb);
      x.stroke();
    }
    x.fillStyle = "rgba(140,225,255,0.8)";
    x.font = "7px monospace";
    x.fillText("UPLINK // K", 6, 11);
    const dot = Math.sin(t * 6) > 0 ? "●" : "○";
    x.fillStyle = "rgba(255,90,110,0.9)";
    x.fillText(dot + " LIVE", w - 34, 11);

    // scanlines + occasional glitch slice
    x.fillStyle = "rgba(0,0,0,0.16)";
    for (let sy = 0; sy < h; sy += 3) x.fillRect(0, sy, w, 1);
    if (t > this.glitchAt) {
      this.glitchAt = t + 0.7 + Math.random() * 2.2;
      this.glitchY = Math.random() * h * 0.8;
    }
    if (t > this.glitchAt - 0.12) {
      const gy2 = this.glitchY;
      const slice = x.getImageData(0, gy2, w, 4);
      x.putImageData(slice, (Math.random() - 0.5) * 10, gy2);
    }
  }
}
