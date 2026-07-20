// REZONANCE — procedural audio. Everything is synthesized with WebAudio at
// runtime (no asset files), so the game stays fully self-contained.
//
// Continuous beds: rain (weather-scaled filtered noise), wind (gust-following
// low rumble), an exposure-driven tension drone (the adaptive-score analogue),
// and a resonance hum that tracks the scanner. One-shots: sonar pings,
// neutralize zaps, sweeper alert stingers, thunder after lightning, radio
// squelch (which ducks the ambience while the handler talks), and footsteps.
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.stepClock = 0;
  }

  // Must be called from a user-gesture handler at least once.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;

    this.master = c.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(c.destination);

    // Bus the beds through one gain so radio chatter can duck them together.
    this.bedBus = c.createGain();
    this.bedBus.gain.value = 1;
    this.bedBus.connect(this.master);

    const noiseBuf = this.makeNoiseBuffer();
    this.noiseBuf = noiseBuf;

    // Rain bed.
    this.rain = this.loopNoise(noiseBuf, "bandpass", 2800, 0.6);
    this.rain.gain.gain.value = 0;
    this.rain.gain.connect(this.bedBus);

    // Wind bed.
    this.windBed = this.loopNoise(noiseBuf, "lowpass", 240, 1);
    this.windBed.gain.gain.value = 0;
    this.windBed.gain.connect(this.bedBus);

    // Tension drone: two detuned lows + a minor third that rises with heat.
    this.drone = c.createGain();
    this.drone.gain.value = 0.0;
    this.drone.connect(this.bedBus);
    for (const [freq, level] of [[55, 0.5], [55.7, 0.4], [65.4, 0.0]]) {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      const g = c.createGain();
      g.gain.value = level;
      o.connect(g).connect(this.drone);
      o.start();
      if (freq > 60) this.droneThird = g;
    }

    // Scanner resonance hum.
    this.humOsc = c.createOscillator();
    this.humOsc.type = "sine";
    this.humOsc.frequency.value = 180;
    this.humGain = c.createGain();
    this.humGain.gain.value = 0;
    this.humOsc.connect(this.humGain).connect(this.master);
    this.humOsc.start();
  }

  makeNoiseBuffer() {
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  loopNoise(buf, type, freq, q) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const gain = c.createGain();
    src.connect(f).connect(gain);
    src.start();
    return { src, filter: f, gain };
  }

  setMuted(m) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  // Called every frame with the game state the beds should follow.
  update(dt, s) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;

    const rainLevel = { drizzle: 0.030, rain: 0.065, storm: 0.11 }[s.weatherMode] || 0;
    this.rain.gain.gain.setTargetAtTime(rainLevel, t, 0.6);
    this.windBed.gain.gain.setTargetAtTime(s.wind * 0.35, t, 0.4);

    this.drone.gain.setTargetAtTime(0.015 + (s.exposure / 100) * 0.075, t, 0.5);
    this.droneThird.gain.setTargetAtTime((s.exposure / 100) * 0.5, t, 0.5);

    // The audible tingle: pitch and level climb with resonance, with a
    // nervous tremble as it gets strong.
    const trem = 1 + Math.sin(t * (6 + s.resonance * 18)) * 0.35 * s.resonance;
    this.humGain.gain.setTargetAtTime(s.resonance * 0.05 * trem, t, 0.08);
    this.humOsc.frequency.setTargetAtTime(170 + s.resonance * 320, t, 0.15);

    // Footsteps on wet asphalt.
    if (s.moving) {
      this.stepClock -= dt;
      if (this.stepClock <= 0) {
        this.stepClock = s.sprinting ? 0.23 : 0.36;
        this.blip({ type: "noise", freq: 900, q: 1.4, dur: 0.05, gain: 0.05 + (s.sprinting ? 0.02 : 0) });
      }
    } else {
      this.stepClock = 0;
    }
  }

  // ---- one-shots ----
  blip({ type, freq, freqEnd, q = 4, dur = 0.2, gain = 0.1, shape = "sine", delay = 0 }) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const c = this.ctx, t0 = c.currentTime + delay;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + dur);
    g.connect(this.master);
    if (type === "noise") {
      const src = c.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.setValueAtTime(freq, t0);
      if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
      f.Q.value = q;
      src.connect(f).connect(g);
      src.start(t0); src.stop(t0 + dur + 0.05);
    } else {
      const o = c.createOscillator();
      o.type = shape;
      o.frequency.setValueAtTime(freq, t0);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
      o.connect(g);
      o.start(t0); o.stop(t0 + dur + 0.05);
    }
  }

  ping() { this.blip({ type: "osc", freq: 980, freqEnd: 240, dur: 0.42, gain: 0.09 }); }

  neutralize() {
    this.blip({ type: "osc", shape: "sawtooth", freq: 220, freqEnd: 52, dur: 0.5, gain: 0.11 });
    this.blip({ type: "noise", freq: 1600, freqEnd: 300, dur: 0.4, gain: 0.07 });
  }

  alert() {
    this.blip({ type: "osc", shape: "square", freq: 660, dur: 0.09, gain: 0.055 });
    this.blip({ type: "osc", shape: "square", freq: 660, dur: 0.09, gain: 0.055, delay: 0.14 });
  }

  flyby() {
    // High-altitude turbine wash swelling in and trailing off.
    this.blip({ type: "noise", freq: 240, freqEnd: 90, q: 0.8, dur: 2.6, gain: 0.12 });
  }

  airstrike() {
    // Ground-shaking penetrator impact: sub thump, long low rumble, debris hiss.
    this.blip({ type: "noise", freq: 90, freqEnd: 30, q: 0.6, dur: 2.2, gain: 0.3 });
    this.blip({ type: "osc", shape: "sine", freq: 54, freqEnd: 24, dur: 1.6, gain: 0.2, delay: 0.05 });
    this.blip({ type: "noise", freq: 1400, freqEnd: 200, dur: 0.5, gain: 0.08, delay: 0.12 });
  }

  thunder() {
    // Rolls in slightly after the flash, like real distance.
    const delay = 0.25 + Math.random() * 1.1;
    this.blip({ type: "noise", freq: 120, freqEnd: 45, q: 0.7, dur: 1.6, gain: 0.22, delay });
  }

  radioSquelch() {
    this.blip({ type: "noise", freq: 1900, q: 2.5, dur: 0.09, gain: 0.05 });
    this.blip({ type: "osc", freq: 1245, dur: 0.06, gain: 0.03, delay: 0.09 });
    // Duck the ambience while the handler talks, then bring it back.
    if (this.ctx && this.ctx.state === "running") {
      const t = this.ctx.currentTime;
      this.bedBus.gain.setTargetAtTime(0.45, t, 0.08);
      this.bedBus.gain.setTargetAtTime(1, t + 3.6, 0.7);
    }
  }
}

export const audio = new AudioEngine();
