// Keyboard input tracking with edge-detection for "just pressed" keys.
export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set(); // consumed once per frame
    this._onDown = (e) => {
      const k = this._norm(e.key);
      if (!this.down.has(k)) this.pressed.add(k);
      this.down.add(k);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    };
    this._onUp = (e) => this.down.delete(this._norm(e.key));
    window.addEventListener("keydown", this._onDown);
    window.addEventListener("keyup", this._onUp);
  }

  _norm(k) { return k.length === 1 ? k.toLowerCase() : k.toLowerCase(); }

  isDown(...keys) { return keys.some((k) => this.down.has(k)); }

  justPressed(k) {
    if (this.pressed.has(k)) { this.pressed.delete(k); return true; }
    return false;
  }

  // Movement vector from WASD / arrows, normalized.
  moveVector() {
    let x = 0, y = 0;
    if (this.isDown("a", "arrowleft")) x -= 1;
    if (this.isDown("d", "arrowright")) x += 1;
    if (this.isDown("w", "arrowup")) y -= 1;
    if (this.isDown("s", "arrowdown")) y += 1;
    const len = Math.hypot(x, y);
    if (len > 0) { x /= len; y /= len; }
    return { x, y };
  }

  clearFrame() { this.pressed.clear(); }

  destroy() {
    window.removeEventListener("keydown", this._onDown);
    window.removeEventListener("keyup", this._onUp);
  }
}
