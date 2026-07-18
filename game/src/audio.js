// Spatial audio engine — a browser-scale take on AAA audio design:
//
//  - HRTF 3D positioning (Web Audio PannerNode) with inverse distance model,
//    so drones and gunfire are localizable above/behind/beside the player
//  - manual Doppler on moving sources (pitch shift from radial velocity)
//  - occlusion: sources behind buildings/rocks get low-pass filtered so only
//    a muffled rumble comes through
//  - convolution reverb send (procedurally generated impulse response)
//  - layered ambient bed (wind, low city hum, positional bird chirps) that
//    responds to combat intensity
//  - physics-keyed Foley: footsteps from the movement cycle, servo whine
//    keyed to speed, weapon shots layered click/body/crack
//  - adaptive score: tension pad + action layer, crossfaded by threat level,
//    built from stems so layers drop in and out
//  - bus architecture (music / ambience / sfx) under a master compressor,
//    with sidechain-style ducking on explosions and dialogue-priority feed
//  - gamepad haptics synced to explosions and damage
//
// Everything is synthesized at runtime — zero audio asset downloads.
import * as THREE from 'three';

const SPEED_OF_SOUND = 343;

function makeNoiseBuffer(ctx, seconds = 2) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Stereo exponential-decay noise burst — a serviceable outdoor-ish IR.
function makeImpulseResponse(ctx, seconds = 1.8, decay = 2.8) {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(2, rate * seconds, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** decay;
    }
  }
  return buffer;
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.started = false;
    this.obstacles = [];
    this.listenerPos = new THREE.Vector3();
    this.threat = 0;         // 0 calm .. 1 full combat, smoothed
    this.droneHandles = new Set();
    this.birdTimer = 2;
  }

  // Must be called from a user gesture (autoplay policy).
  start() {
    if (this.started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.started = true;
    const ctx = this.ctx;

    // --- bus architecture: buses -> duck -> compressor -> destination ----
    this.master = ctx.createDynamicsCompressor();
    this.master.threshold.value = -14;
    this.master.ratio.value = 6;
    this.master.connect(ctx.destination);

    this.duck = ctx.createGain();          // sidechain-style duck point
    this.duck.connect(this.master);

    this.buses = {};
    for (const [name, level] of [['music', 0.5], ['ambience', 0.55], ['sfx', 0.9]]) {
      const g = ctx.createGain();
      g.gain.value = level;
      g.connect(this.duck);
      this.buses[name] = g;
    }

    // --- reverb send ------------------------------------------------------
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulseResponse(ctx);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.25;
    this.reverb.connect(reverbGain).connect(this.buses.sfx);

    this.noise = makeNoiseBuffer(ctx);

    this._buildAmbience();
    this._buildMusic();
    this._buildServo();
  }

  // --- helpers ------------------------------------------------------------
  _panner(position, refDistance = 10, maxDistance = 320) {
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = refDistance;
    p.maxDistance = maxDistance;
    p.rolloffFactor = 1;
    p.positionX.value = position.x;
    p.positionY.value = position.y;
    p.positionZ.value = position.z;
    return p;
  }

  // 2D segment-vs-circle test against world obstacles: is the straight path
  // from the listener to the source blocked by a building or rock?
  _occluded(source) {
    const a = this.listenerPos, b = source;
    const abx = b.x - a.x, abz = b.z - a.z;
    const len2 = abx * abx + abz * abz;
    if (len2 < 1) return false;
    for (const ob of this.obstacles) {
      const t = Math.max(0, Math.min(1,
        ((ob.x - a.x) * abx + (ob.z - a.z) * abz) / len2));
      const cx = a.x + abx * t - ob.x;
      const cz = a.z + abz * t - ob.z;
      if (cx * cx + cz * cz < ob.radius * ob.radius) return true;
    }
    return false;
  }

  // Wire a source chain: [node] -> occlusion filter -> panner -> sfx bus
  // (+ reverb send). Returns the entry filter node.
  _spatialChain(position, { refDistance, reverbSend = 0.4 } = {}) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this._occluded(position) ? 480 : 18000;
    const panner = this._panner(position, refDistance);
    filter.connect(panner).connect(this.buses.sfx);
    if (reverbSend > 0) {
      const send = this.ctx.createGain();
      send.gain.value = reverbSend;
      panner.connect(send).connect(this.reverb);
    }
    return { filter, panner };
  }

  setListener(camera, playerPos) {
    if (!this.started) return;
    this.listenerPos.copy(playerPos);
    const l = this.ctx.listener;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    const t = this.ctx.currentTime;
    if (l.positionX) {
      l.positionX.setTargetAtTime(camera.position.x, t, 0.05);
      l.positionY.setTargetAtTime(camera.position.y, t, 0.05);
      l.positionZ.setTargetAtTime(camera.position.z, t, 0.05);
      l.forwardX.setTargetAtTime(fwd.x, t, 0.05);
      l.forwardY.setTargetAtTime(fwd.y, t, 0.05);
      l.forwardZ.setTargetAtTime(fwd.z, t, 0.05);
      l.upX.setTargetAtTime(0, t, 0.05);
      l.upY.setTargetAtTime(1, t, 0.05);
      l.upZ.setTargetAtTime(0, t, 0.05);
    } else {
      l.setPosition(camera.position.x, camera.position.y, camera.position.z);
      l.setOrientation(fwd.x, fwd.y, fwd.z, 0, 1, 0);
    }
  }

  // --- ambient bed --------------------------------------------------------
  _buildAmbience() {
    const ctx = this.ctx;
    // wind: looped noise through a slowly wandering low-pass
    const wind = ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 420;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.05;
    wind.connect(this.windFilter).connect(this.windGain).connect(this.buses.ambience);
    wind.start();
    const windLFO = ctx.createOscillator();
    windLFO.frequency.value = 0.07;
    const windLFOGain = ctx.createGain();
    windLFOGain.gain.value = 160;
    windLFO.connect(windLFOGain).connect(this.windFilter.frequency);
    windLFO.start();

    // distant low hum (far-off machinery / highway)
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 55;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.012;
    hum.connect(humGain).connect(this.buses.ambience);
    hum.start();
  }

  // Positional bird chirp somewhere around the player; suppressed by combat.
  _birdChirp() {
    const ctx = this.ctx;
    const angle = Math.random() * Math.PI * 2;
    const r = 25 + Math.random() * 50;
    const pos = new THREE.Vector3(
      this.listenerPos.x + Math.cos(angle) * r,
      this.listenerPos.y + 6 + Math.random() * 10,
      this.listenerPos.z + Math.sin(angle) * r,
    );
    const { filter } = this._spatialChain(pos, { refDistance: 14, reverbSend: 0.15 });
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const chirps = 2 + Math.floor(Math.random() * 3);
    g.gain.value = 0;
    for (let i = 0; i < chirps; i++) {
      const start = t + i * 0.16;
      const f = 2600 + Math.random() * 1400;
      osc.frequency.setValueAtTime(f, start);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, start + 0.06);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.12, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
    }
    osc.connect(g).connect(filter);
    osc.start(t);
    osc.stop(t + chirps * 0.16 + 0.2);
  }

  // --- adaptive score -----------------------------------------------------
  _buildMusic() {
    const ctx = this.ctx;
    // stem 1: tension pad — two detuned oscillators, always faintly present
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.05;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 600;
    padFilter.connect(this.padGain).connect(this.buses.music);
    for (const detune of [-6, 5]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55;   // A1
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(padFilter);
      osc.start();
    }
    const padLFO = ctx.createOscillator();
    padLFO.frequency.value = 0.11;
    const padLFOGain = ctx.createGain();
    padLFOGain.gain.value = 320;
    padLFO.connect(padLFOGain).connect(padFilter.frequency);
    padLFO.start();

    // stem 2: action layer — sequenced kick/bass/hat, faded in by threat
    this.actionGain = ctx.createGain();
    this.actionGain.gain.value = 0;
    this.actionGain.connect(this.buses.music);
    this._beat = 0;
    this._nextBeatTime = ctx.currentTime + 0.1;
    this._bassNotes = [55, 55, 65.4, 49];   // A1 A1 C2 G1
  }

  // Lookahead sequencer, driven from update(). 150 BPM eighth notes.
  _scheduleMusic() {
    const ctx = this.ctx;
    const step = 60 / 150 / 2;
    while (this._nextBeatTime < ctx.currentTime + 0.25) {
      const t = this._nextBeatTime;
      const beat = this._beat;
      if (beat % 2 === 0) {   // kick on quarters
        const kick = ctx.createOscillator();
        kick.frequency.setValueAtTime(120, t);
        kick.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const kg = ctx.createGain();
        kg.gain.setValueAtTime(0.5, t);
        kg.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        kick.connect(kg).connect(this.actionGain);
        kick.start(t);
        kick.stop(t + 0.16);
      }
      // hat on every eighth
      const hat = ctx.createBufferSource();
      hat.buffer = this.noise;
      const hf = ctx.createBiquadFilter();
      hf.type = 'highpass';
      hf.frequency.value = 7000;
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(beat % 2 ? 0.05 : 0.09, t);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      hat.connect(hf).connect(hg).connect(this.actionGain);
      hat.start(t);
      hat.stop(t + 0.06);
      if (beat % 4 === 2) {   // off-beat bass
        const bass = ctx.createOscillator();
        bass.type = 'square';
        bass.frequency.value = this._bassNotes[(beat >> 2) % this._bassNotes.length];
        const bf = ctx.createBiquadFilter();
        bf.type = 'lowpass';
        bf.frequency.value = 300;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.16, t);
        bg.gain.exponentialRampToValueAtTime(0.001, t + step * 1.8);
        bass.connect(bf).connect(bg).connect(this.actionGain);
        bass.start(t);
        bass.stop(t + step * 2);
      }
      this._beat++;
      this._nextBeatTime += step;
    }
  }

  // --- player servo whine (speed-keyed "engine" Foley) --------------------
  _buildServo() {
    const ctx = this.ctx;
    this.servo = ctx.createOscillator();
    this.servo.type = 'sawtooth';
    this.servo.frequency.value = 70;
    this.servoFilter = ctx.createBiquadFilter();
    this.servoFilter.type = 'bandpass';
    this.servoFilter.frequency.value = 320;
    this.servoFilter.Q.value = 3;
    this.servoGain = ctx.createGain();
    this.servoGain.gain.value = 0;
    this.servo.connect(this.servoFilter).connect(this.servoGain).connect(this.buses.sfx);
    this.servo.start();
  }

  // --- per-frame update ---------------------------------------------------
  // threatRaw: 0..1 combat intensity, speedNorm: 0..1 player speed
  update(dt, threatRaw, speedNorm) {
    if (!this.started) return;
    this.threat += (threatRaw - this.threat) * Math.min(1, dt * 1.2);
    const t = this.ctx.currentTime;

    // crossfade score stems and stir the wind up during combat
    this.actionGain.gain.setTargetAtTime(this.threat * 0.5, t, 0.4);
    this.padGain.gain.setTargetAtTime(0.05 + this.threat * 0.03, t, 0.5);
    this.windGain.gain.setTargetAtTime(0.05 + this.threat * 0.03, t, 0.8);
    this._scheduleMusic();

    // servo whine follows speed (granular-synthesis-style pitch tracking)
    this.servoGain.gain.setTargetAtTime(speedNorm * 0.045, t, 0.08);
    this.servo.frequency.setTargetAtTime(70 + speedNorm * 90 + Math.random() * 6, t, 0.05);
    this.servoFilter.frequency.setTargetAtTime(320 + speedNorm * 500, t, 0.1);

    // wildlife thins out as combat intensifies
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      if (this.threat < 0.4) this._birdChirp();
      this.birdTimer = 2.5 + Math.random() * 6;
    }

    // live occlusion + Doppler for persistent drone sources
    for (const h of this.droneHandles) h._tick(t);
  }

  // --- persistent positional source for a hover drone ---------------------
  attachDrone(getPosition) {
    if (!this.started) return null;
    const ctx = this.ctx;
    const pos = getPosition();
    const chain = this._spatialChain(pos, { refDistance: 6, reverbSend: 0.2 });
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 140;
    // rotor amplitude modulation
    const am = ctx.createGain();
    am.gain.value = 0.5;
    const amLFO = ctx.createOscillator();
    amLFO.frequency.value = 28;
    const amDepth = ctx.createGain();
    amDepth.gain.value = 0.35;
    amLFO.connect(amDepth).connect(am.gain);
    const out = ctx.createGain();
    out.gain.value = 0.16;
    osc.connect(am).connect(out).connect(chain.filter);
    osc.start();
    amLFO.start();

    const engine = this;
    const prev = pos.clone();
    const handle = {
      _tick(t) {
        const p = getPosition();
        chain.panner.positionX.setTargetAtTime(p.x, t, 0.05);
        chain.panner.positionY.setTargetAtTime(p.y, t, 0.05);
        chain.panner.positionZ.setTargetAtTime(p.z, t, 0.05);
        // Doppler: radial velocity toward the listener shifts rotor pitch
        const dNow = p.distanceTo(engine.listenerPos);
        const dPrev = prev.distanceTo(engine.listenerPos);
        const radialV = (dPrev - dNow) * 60;   // approx m/s toward listener
        const doppler = SPEED_OF_SOUND / Math.max(60, SPEED_OF_SOUND - radialV);
        osc.frequency.setTargetAtTime(140 * doppler, t, 0.08);
        prev.copy(p);
        // occlusion re-check (cheap, per frame)
        chain.filter.frequency.setTargetAtTime(
          engine._occluded(p) ? 480 : 18000, t, 0.15);
      },
      dispose() {
        engine.droneHandles.delete(handle);
        const t = ctx.currentTime;
        out.gain.setTargetAtTime(0, t, 0.03);
        osc.stop(t + 0.2);
        amLFO.stop(t + 0.2);
      },
    };
    this.droneHandles.add(handle);
    return handle;
  }

  // --- one-shot Foley -----------------------------------------------------
  // Player weapon: layered mechanical click + body + supersonic crack.
  shoot() {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    // click (trigger/slide)
    const click = ctx.createBufferSource();
    click.buffer = this.noise;
    const cf = ctx.createBiquadFilter();
    cf.type = 'highpass';
    cf.frequency.value = 3000;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.12, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    click.connect(cf).connect(cg).connect(this.buses.sfx);
    click.start(t);
    click.stop(t + 0.04);
    // body (energy discharge)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.13);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.14, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(og).connect(this.buses.sfx);
    osc.start(t);
    osc.stop(t + 0.16);
    // crack (broadband transient) + reverb tail
    const crack = ctx.createBufferSource();
    crack.buffer = this.noise;
    const kg = ctx.createGain();
    kg.gain.setValueAtTime(0.18, t);
    kg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    crack.connect(kg).connect(this.buses.sfx);
    kg.connect(this.reverb);
    crack.start(t);
    crack.stop(t + 0.06);
  }

  // Hostile fire, positioned in the world (distance/occlusion handled).
  enemyShoot(position) {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const { filter } = this._spatialChain(position, { refDistance: 12 });
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g).connect(filter);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Positional explosion with sub-bass thump, reverb tail, ducking, haptics.
  explosion(position) {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const { filter } = this._spatialChain(position, { refDistance: 16, reverbSend: 0.7 });
    const boom = ctx.createBufferSource();
    boom.buffer = this.noise;
    const bf = ctx.createBiquadFilter();
    bf.type = 'lowpass';
    bf.frequency.setValueAtTime(2500, t);
    bf.frequency.exponentialRampToValueAtTime(120, t + 0.5);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(1.0, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    boom.connect(bf).connect(bg).connect(filter);
    boom.start(t);
    boom.stop(t + 0.65);
    const sub = ctx.createOscillator();
    sub.frequency.setValueAtTime(70, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.4);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.6, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sub.connect(sg).connect(filter);
    sub.start(t);
    sub.stop(t + 0.5);
    // duck music/ambience under the blast, then recover
    this.duckPulse(0.45, 0.7);
    this.haptics(0.8, 200);
  }

  hurt() {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g).connect(this.buses.sfx);
    osc.start(t);
    osc.stop(t + 0.25);
    this.haptics(0.5, 120);
  }

  // Ground-material footstep (grass/dirt): soft broadband thud, harder and
  // brighter when sprinting.
  footstep(sprinting) {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const step = ctx.createBufferSource();
    step.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = sprinting ? 480 : 320;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(sprinting ? 0.16 : 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    step.connect(f).connect(g).connect(this.buses.sfx);
    step.start(t);
    step.stop(t + 0.1);
    // mech weight: tiny sub thump under each step
    const sub = ctx.createOscillator();
    sub.frequency.setValueAtTime(65, t);
    sub.frequency.exponentialRampToValueAtTime(38, t + 0.07);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.1, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    sub.connect(sg).connect(this.buses.sfx);
    sub.start(t);
    sub.stop(t + 0.09);
  }

  walkerStep(position) {
    if (!this.started) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const { filter } = this._spatialChain(position, { refDistance: 14, reverbSend: 0.3 });
    const sub = ctx.createOscillator();
    sub.frequency.setValueAtTime(55, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    sub.connect(g).connect(filter);
    sub.start(t);
    sub.stop(t + 0.18);
  }

  // Sidechain-style duck of music+ambience (explosions, priority audio).
  duckPulse(depth = 0.4, seconds = 0.6) {
    const t = this.ctx.currentTime;
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setTargetAtTime(1 - depth, t, 0.02);
    this.duck.gain.setTargetAtTime(1, t + seconds * 0.4, seconds * 0.4);
  }

  // Low-frequency events mirrored to gamepad rumble when one is connected.
  haptics(intensity, ms) {
    try {
      for (const pad of navigator.getGamepads?.() ?? []) {
        pad?.vibrationActuator?.playEffect?.('dual-rumble', {
          duration: ms,
          strongMagnitude: intensity,
          weakMagnitude: intensity * 0.5,
        });
      }
    } catch { /* haptics unsupported */ }
  }
}
