'use strict';
/* ============================================================
   U.S. ROBOTIC ARMY — REPO PROTOCOL
   A top-down driving mission decoded from field footage.
   Mission structure decoded scene-by-scene from source video
   (see docs/VIDEO_DECODE.md). Tech-spec intel decoded from
   source image (see boot screen + in-world billboards).
   All code and art are original & procedural. Dialogue is an
   original paraphrase — no verbatim lines are reproduced.
   ============================================================ */
(() => {

// ---------- utilities ----------
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- credits & sponsor (decoded from the second source video) ----------
const CREATOR = 'Machinelearning1954';
const BRAND = 'B.PATTY GLOW';

// ---------- MOD TERMINAL (original trainer-style script mods) ----------
const MODS = [
  { id: 'god',    name: 'HULL SHIELD',    desc: 'chassis takes zero damage',        on: false },
  { id: 'nitro',  name: 'NITRO INJECT',   desc: '+45% top speed, hotter throttle',  on: false },
  { id: 'moon',   name: 'MOON GRAVITY',   desc: 'floaty low-grip drift physics',    on: false },
  { id: 'slowmo', name: 'BULLET TIME',    desc: 'world runs at half speed',         on: false },
  { id: 'ghost',  name: 'GHOST TRAFFIC',  desc: 'traffic turns intangible',         on: false },
  { id: 'chrome', name: 'CHROME CYCLER',  desc: 'animated rainbow paint job',       on: false },
  { id: 'jack',   name: 'CARJACK PROTOCOL', desc: 'E near stopped traffic: take it', on: false },
];
const modOn = (id) => { const m = MODS.find(m => m.id === id); return !!(m && m.on); };

// wardrobe presets (decoded: the closet outfit-changer menu)
const OUTFITS = [
  { name: 'FIELD PLATES',   body: '#20242b' },
  { name: 'DENIM WORKSHIRT', body: '#3b6ea5' },
  { name: 'MIDNIGHT SUIT',  body: '#101216' },
  { name: 'ROAD LEATHERS',  body: '#4a3226' },
];

// vehicle forge presets (original vehicles)
const FORGE = [
  { name: 'STOCK COMET S',      color: '#cfd3d8', top: 1.00, acc: 1.00, stripe: false, siren: false },
  { name: 'CRIMSON ZAGGERO',    color: '#b3261e', top: 1.08, acc: 1.06, stripe: false, siren: false },
  { name: 'AZZURRO MC-13',      color: '#2757c9', top: 1.12, acc: 1.10, stripe: true,  siren: false },
  { name: 'PATROL INTERCEPTOR', color: '#1c1f24', top: 1.05, acc: 1.04, stripe: false, siren: true  },
  { name: 'SUNBURST CUSTOM',    color: '#c0c4c9', top: 1.10, acc: 1.08, stripe: true,  siren: false, stripeColor: '#ffd23f' },
  { name: 'SCOOTER BROTHER',    color: '#c0392b', top: 0.55, acc: 0.80, stripe: false, siren: false, tiny: true },
];

// ---------- world layout ----------
const WORLD = { w: 7200, h: 5000 };

const ROADS = [
  { x: 1180, y: 1500, w: 160,  h: 3100, name: 'Alta Ave' },        // vertical
  { x: 1180, y: 2400, w: 3020, h: 160,  name: 'Vinewood Blvd' },   // horizontal
  { x: 400,  y: 1500, w: 6400, h: 240,  name: 'Senora Fwy', fwy: true }, // horizontal
  { x: 4040, y: 1500, w: 160,  h: 1060, name: 'Power St' },        // vertical
  { x: 6560, y: 1500, w: 160,  h: 1300, name: 'Little Big Horn' }, // vertical
];

const LOTS = [
  { x: 800,  y: 4000, w: 800, h: 600, kind: 'plaza'  },
  { x: 2500, y: 2140, w: 400, h: 260, kind: 'meet'   },
  { x: 760,  y: 1240, w: 440, h: 260, kind: 'gas'    },
  { x: 6440, y: 2800, w: 340, h: 300, kind: 'garage' },
];

const WATER = { x: 5150, y: 0, w: 1100, h: 5000 };

// solid rectangles (buildings + bridge railings)
const BUILDINGS = [
  { x: 900,  y: 3400, w: 220, h: 400 },
  { x: 1450, y: 3200, w: 400, h: 300 },
  { x: 1450, y: 3800, w: 300, h: 500 },
  { x: 2000, y: 4200, w: 500, h: 300 },
  { x: 1450, y: 2650, w: 350, h: 350 },
  { x: 2100, y: 2650, w: 500, h: 400 },
  { x: 3000, y: 2650, w: 600, h: 350 },
  { x: 2050, y: 1900, w: 380, h: 220 },
  { x: 3100, y: 1900, w: 500, h: 350 },
  { x: 500,  y: 2000, w: 500, h: 300 },
  { x: 4400, y: 1900, w: 500, h: 400 },
  { x: 4400, y: 2700, w: 600, h: 400 },
  { x: 6350, y: 1900, w: 130, h: 600 },
  { x: 6800, y: 1900, w: 300, h: 700 },
  { x: 400,  y: 900,  w: 600, h: 250 },
  { x: 1600, y: 900,  w: 700, h: 300 },
  { x: 2800, y: 900,  w: 700, h: 300 },
  { x: 4200, y: 900,  w: 600, h: 300 },
  // bridge railings across the water
  { x: 5150, y: 1484, w: 1100, h: 12, rail: true },
  { x: 5150, y: 1744, w: 1100, h: 12, rail: true },
];

// billboards decoded from the source image (V vs VI comparison)
const BILLBOARDS = [
  { x: 1420, y: 3060, w: 300, era: 'V',  lines: ['GRAND EPOCH V', '2013-2018', 'BUDGET $265,000,000', 'BUILD TIME: 5 YEARS'] },
  { x: 3000, y: 2140, w: 300, era: 'VI', lines: ['GRAND EPOCH VI', '2023-2026', 'BUDGET $2,000,000,000', 'BUILD TIME: 13 YEARS'] },
  { x: 3600, y: 1300, w: 340, era: 'VI', lines: ['NEXT-GEN INTEL', 'ADVANCED TRAFFIC AI', 'DYNAMIC WORLD EVENTS', 'PHOTOREAL LIGHTING'] },
];

// animated sponsor billboards — 5 procedural frames mirroring the decoded ad storyboard
const AD_BILLBOARDS = [
  { x: 1800, y: 2340, w: 320 },
  { x: 2450, y: 1455, w: 320 },
  { x: 6450, y: 1460, w: 320 },
];

// drive-through sponsor pickups: a jar of the cream restores the hull finish
const JARS = [
  { x: 1260, y: 2900, taken: false },
  { x: 3500, y: 2480, taken: false },
  { x: 4600, y: 1670, taken: false },
  { x: 6640, y: 2400, taken: false },
];

// palm trees (deterministic)
const PALMS = (() => {
  const rnd = mulberry32(1337);
  const spots = [];
  const strips = [
    { x0: 1100, y0: 1500, x1: 1100, y1: 4600 },
    { x0: 1420, y0: 1500, x1: 1420, y1: 4600 },
    { x0: 400,  y0: 1440, x1: 6800, y1: 1440 },
    { x0: 400,  y0: 1800, x1: 6800, y1: 1800 },
    { x0: 1180, y0: 2340, x1: 4200, y1: 2340 },
  ];
  for (const s of strips) {
    const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
    const n = Math.floor(len / 320);
    for (let i = 0; i <= n; i++) {
      const t = n === 0 ? 0 : i / n;
      const x = lerp(s.x0, s.x1, t) + (rnd() - 0.5) * 60;
      const y = lerp(s.y0, s.y1, t) + (rnd() - 0.5) * 60;
      if (x > WATER.x - 30 && x < WATER.x + WATER.w + 30) continue; // not in water
      spots.push({ x, y, s: 0.8 + rnd() * 0.5 });
    }
  }
  return spots;
})();

// traffic lanes: axis 'h' or 'v', pos = the fixed coordinate, range along axis
const LANES = [
  { axis: 'h', pos: 1545, from: 400,  to: 6800, sign: -1 },
  { axis: 'h', pos: 1595, from: 400,  to: 6800, sign: -1 },
  { axis: 'h', pos: 1645, from: 400,  to: 6800, sign: 1  },
  { axis: 'h', pos: 1695, from: 400,  to: 6800, sign: 1  },
  { axis: 'v', pos: 1220, from: 1500, to: 4600, sign: -1 },
  { axis: 'v', pos: 1300, from: 1500, to: 4600, sign: 1  },
  { axis: 'h', pos: 2440, from: 1180, to: 4200, sign: 1  },
  { axis: 'h', pos: 2520, from: 1180, to: 4200, sign: -1 },
  { axis: 'v', pos: 4080, from: 1500, to: 2560, sign: -1 },
  { axis: 'v', pos: 4160, from: 1500, to: 2560, sign: 1  },
  { axis: 'v', pos: 6600, from: 1500, to: 2800, sign: -1 },
  { axis: 'v', pos: 6680, from: 1500, to: 2800, sign: 1  },
];

function pointInRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
function onPavement(x, y) {
  for (const r of ROADS) if (pointInRect(x, y, r)) return true;
  for (const r of LOTS)  if (pointInRect(x, y, r)) return true;
  return false;
}

// ---------- input ----------
const keys = Object.create(null);
const pressed = Object.create(null); // edge-triggered, cleared each frame
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
function axisSteer() {
  return (keys.KeyA || keys.ArrowLeft ? -1 : 0) + (keys.KeyD || keys.ArrowRight ? 1 : 0);
}
function throttleInput() {
  return (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
}
function actionPressed() { return !!(pressed.KeyE || pressed.Enter); }

// touch controls
(function setupTouch() {
  const el = document.getElementById('touch');
  if (!el) return;
  if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) return;
  el.style.display = 'block';
  const map = { tLeft: 'KeyA', tRight: 'KeyD', tGas: 'KeyW', tBrake: 'KeyS', tAct: 'KeyE', tMod: 'KeyT' };
  for (const [id, code] of Object.entries(map)) {
    const b = document.getElementById(id);
    if (!b) continue;
    const down = (e) => { e.preventDefault(); if (!keys[code]) pressed[code] = true; keys[code] = true; };
    const up = (e) => { e.preventDefault(); keys[code] = false; };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
  }
})();

// ---------- audio (optional, M to toggle) ----------
const AudioSys = {
  ctx: null, osc: null, gain: null, on: false,
  toggle() {
    if (!this.on) {
      try {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ctx = new AC();
          this.osc = this.ctx.createOscillator();
          this.osc.type = 'sawtooth';
          this.gain = this.ctx.createGain();
          this.gain.gain.value = 0.0;
          this.osc.connect(this.gain).connect(this.ctx.destination);
          this.osc.start();
        }
        this.ctx.resume();
        this.on = true;
      } catch (err) { /* audio unavailable — ignore */ }
    } else {
      this.on = false;
      if (this.gain) this.gain.gain.value = 0;
    }
  },
  engine(speed) {
    if (!this.on || !this.gain) return;
    this.gain.gain.value = 0.028;
    this.osc.frequency.value = 55 + Math.abs(speed) * 0.22;
  },
};

// ---------- entities ----------
function makeCar(x, y, angle, color) {
  return { x, y, px: x, py: y, angle, speed: 0, color, baseColor: color, damage: 0, radius: 21, flame: 0 };
}

const CAR_COLORS = ['#7c8894', '#5b6c7d', '#8d5f4a', '#b8b2a7', '#43555f', '#6e5d8c', '#a34d4d', '#4d7a5a'];

// ---------- dialogue (original paraphrase of the decoded scenes) ----------
const SPEAKER_COLOR = {
  'FRNK-13': '#6fd3ff', 'OFFICER': '#8ecae6', 'WESTON': '#ffd166',
  'MOLLY': '#f4a0c0', 'MIKE': '#9be07c', 'T': '#ff9e6d', 'RICH KID': '#e0c3fc',
  'SYSTEM': '#9aa5b1', 'RADIO': '#ffd9a0', 'STARLET': '#f7c8e0',
};

const DLG = {
  pullover: [
    { s: 'OFFICER', t: 'Sixty-two in a forty-five, plus a red light back on Crenshaw. Real subtle.' },
    { s: 'OFFICER', t: 'One warning, hotshot. Next stop after this is a cell.' },
    { s: 'FRNK-13', t: 'Warning logged, officer. Friendly city you got here.' },
  ],
  meet: [
    { s: 'WESTON', t: "There he is! Mike's boy, right? Word is you're one serious repo unit." },
    { s: 'FRNK-13', t: 'Something like that.' },
    { s: 'MOLLY',  t: 'Mr. Weston has overseas buyers lined up for a very specific list of cars.' },
    { s: 'WESTON', t: "They belong to friends of mine who can afford the loss. I'm rich enough to want them anyway." },
    { s: 'T',      t: 'So we play dress-up as traffic cops. Classy.' },
    { s: 'MIKE',   t: 'Two trust-fund kids like to run their toys up the Senora Freeway. We stop them. We take them.' },
    { s: 'MOLLY',  t: "Finish the work and you'll all be paid well." },
    { s: 'WESTON', t: 'This is your lucky break, kid. Take it — or go find your level in life.' },
    { s: 'FRNK-13', t: "I guess we'll find out." },
    { s: 'SYSTEM', t: 'OBJECTIVE UPDATED: bait the racers at the Route 68 gas station.' },
  ],
  gas: [
    { s: 'FRNK-13', t: "Nice rides. Let's see if they move as fast as your mouths." },
    { s: 'RICH KID', t: 'This guy wants to race us? We were leaving anyway.' },
    { s: 'FRNK-13', t: 'Then roll out!' },
  ],
  bust: [
    { s: 'MIKE', t: 'Highway patrol! Stop your vehicles on the bridge!' },
    { s: 'T',    t: 'Any idea how fast you were going? Out. Hands on the hood. Now!' },
    { s: 'MIKE', t: "Stay in the car there, homeboy. We'll 'deal with you' later." },
    { s: 'FRNK-13', t: 'Yeah, yeah. See you at the shop.' },
    { s: 'SYSTEM', t: 'TARGET SECURED. Swap to the blue one and move.' },
  ],
  deliver: [
    { s: 'WESTON', t: 'Gentlemen! One kid and two old creeps — who would have called it?' },
    { s: 'MIKE',   t: 'You got the paper?' },
    { s: 'WESTON', t: 'Payment on completion, friend. The order was five cars. I count two. Keep working.' },
    { s: 'MOLLY',  t: "Next job: a rare Z-Type hidden in a lockup in Hawick. We'll be in touch." },
    { s: 'WESTON', t: 'Stay spiritual, gentlemen. Namaste.' },
  ],
};

// timed radio chatter during the race (original paraphrase)
const RACE_RADIO = [
  { at: 2,  s: 'MIKE', t: "We're set past Grapeseed in the uniforms. Bring them through at speed." },
  { at: 9,  s: 'T',    t: 'Am I gaining on them, or is that my imagination?' },
  { at: 16, s: 'MIKE', t: 'Stay with them. They have to stop sometime.' },
  { at: 24, s: 'T',    t: 'Heads up — they are driving into the bay bridge. Traffic will slow them.' },
];

// ---------- game state ----------
const PHASE = {
  BOOT: 'BOOT', INTEL: 'INTEL', WALK: 'WALK', CRUISE: 'CRUISE',
  PULLOVER: 'PULLOVER', PULLOVER_TALK: 'PULLOVER_TALK',
  MEET_DRIVE: 'MEET_DRIVE', MEET_TALK: 'MEET_TALK',
  GAS_DRIVE: 'GAS_DRIVE', GAS_TALK: 'GAS_TALK', COUNTDOWN: 'COUNTDOWN',
  RACE: 'RACE', BUST: 'BUST', DELIVER: 'DELIVER', DELIVER_TALK: 'DELIVER_TALK',
  PASSED: 'PASSED', FAILED: 'FAILED',
};

const G = {
  phase: PHASE.BOOT,
  time: 0,
  phaseTime: 0,
  player: makeCar(1120, 4080, -Math.PI / 2, '#cfd3d8'), // silver sports car parked at the plaza curb
  walker: { x: 1000, y: 4350, angle: 0 },
  onFoot: true,
  camera: { x: 1150, y: 4300 },
  traffic: [],
  cop: null,          // pull-over unit
  racers: [],         // the two targets
  deer: null,         // dynamic world event
  dialog: null,       // {lines,i,timer}
  radioQueue: [],
  subtitle: null,     // {s,t,timer} transient radio line
  objective: { text: '', target: null, radius: 60, needStop: false },
  countdown: 0,
  raceStart: 0,
  stats: { top: 0, hits: 0, t0: 0, t1: 0 },
  checkpoint: null,
  failReason: '',
  shake: 0,
  deerDone: false,
  adPlayed: false,
  modMenu: { open: false, idx: 0 },
  forgeIdx: 0,
  outfitIdx: 0,
  starlet: null, // decoded random event: escort a starlet past the paparazzi
  rnd: mulberry32(20260713),
};

// static scenery vehicles: supercar lineup at the meet lot + curb cars on Alta
const PARKED = [
  makeCar(2560, 2200, 0, '#111318'),          // dark convertible
  makeCar(2660, 2200, 0, '#c92a2a'),          // red exotic
  makeCar(2760, 2200, 0, '#e8590c'),          // orange exotic
  makeCar(2860, 2200, 0, '#1864ab'),          // blue sedan
  makeCar(1120, 3700, -Math.PI / 2, '#22262c'),
  makeCar(1120, 3850, -Math.PI / 2, '#2b4a8f'),
];

function say(lines, onDone) { G.modMenu.open = false; G.dialog = { lines, i: 0, timer: 0, onDone }; }
function radio(s, t) { G.subtitle = { s, t, timer: 5 }; }

function toggleMod(id) {
  const m = MODS.find(m => m.id === id);
  if (!m) return;
  m.on = !m.on;
  if (m.on) G.stats.modsUsed = true;
  if (m.id === 'chrome' && !m.on) G.player.color = G.player.baseColor || G.player.color;
  radio('SYSTEM', `MOD ${m.name}: ${m.on ? 'ENABLED' : 'DISABLED'}.`);
}

function cycleOutfit() {
  G.outfitIdx = (G.outfitIdx + 1) % OUTFITS.length;
  G.stats.modsUsed = true;
  radio('SYSTEM', `WARDROBE: ${OUTFITS[G.outfitIdx].name} equipped.`);
}

function applyForge(i) {
  const f = FORGE[((i % FORGE.length) + FORGE.length) % FORGE.length];
  G.forgeIdx = ((i % FORGE.length) + FORGE.length) % FORGE.length;
  const p = G.player;
  p.baseColor = f.color;
  if (!modOn('chrome')) p.color = f.color;
  p.stripe = f.stripe;
  p.stripeColor = f.stripeColor || null;
  p.siren = f.siren;
  p.tiny = !!f.tiny;
  p.forgeTop = f.top;
  p.forgeAcc = f.acc;
  G.stats.modsUsed = true;
  radio('SYSTEM', `VEHICLE FORGE: ${f.name} deployed.`);
}

function setObjective(text, target, radius, needStop) {
  G.objective = { text, target: target || null, radius: radius || 60, needStop: !!needStop };
}

function saveCheckpoint() {
  G.checkpoint = {
    phase: G.phase,
    onFoot: G.onFoot,
    player: { x: G.player.x, y: G.player.y, angle: G.player.angle, color: G.player.color },
    walker: { x: G.walker.x, y: G.walker.y },
  };
}

function restoreCheckpoint() {
  const c = G.checkpoint;
  if (!c) { enterPhase(PHASE.WALK); return; }
  G.player = makeCar(c.player.x, c.player.y, c.player.angle, c.player.color);
  G.player.stripe = c.player.color === '#2757c9';
  G.walker.x = c.walker.x; G.walker.y = c.walker.y;
  G.onFoot = c.onFoot;
  G.traffic.length = 0;
  G.cop = null; G.racers = []; G.deer = null;
  G.dialog = null; G.subtitle = null; G.radioQueue = [];
  if (c.phase === PHASE.RACE) {
    // a race restart needs its grid back: respawn the targets and count down again
    spawnRacers();
    enterPhase(PHASE.COUNTDOWN, true);
  } else {
    enterPhase(c.phase, true);
  }
}

function fail(reason) {
  if (G.phase === PHASE.FAILED || G.phase === PHASE.PASSED) return;
  G.failReason = reason;
  G.phase = PHASE.FAILED;
  G.phaseTime = 0;
}

// ---------- phase machine ----------
function enterPhase(p, fromCheckpoint) {
  G.phase = p;
  G.phaseTime = 0;
  switch (p) {
    case PHASE.WALK:
      G.onFoot = true;
      if (!fromCheckpoint) { G.walker.x = 1150; G.walker.y = 4350; }
      setObjective('Get to your car on Alta Ave.', { x: G.player.x, y: G.player.y }, 55, false);
      saveCheckpoint();
      break;
    case PHASE.CRUISE:
      G.onFoot = false;
      G.stats.t0 = G.time;
      setObjective('Head north up Alta Ave toward Vinewood.', { x: 1260, y: 2480 }, 90, false);
      saveCheckpoint();
      break;
    case PHASE.PULLOVER:
      G.cop = makeCar(G.player.x - Math.cos(G.player.angle) * 420, G.player.y - Math.sin(G.player.angle) * 420, G.player.angle, '#1c1f24');
      G.cop.siren = true;
      setObjective('Police behind you — pull over and STOP.', null, 0, false);
      radio('OFFICER', 'San Andreas police! Pull your vehicle over, right now!');
      break;
    case PHASE.MEET_DRIVE:
      setObjective('Meet the contact at the Vinewood lot.', { x: 2700, y: 2270 }, 90, true);
      saveCheckpoint();
      break;
    case PHASE.GAS_DRIVE:
      setObjective('Get to the gas station on Route 68.', { x: 980, y: 1380 }, 90, true);
      saveCheckpoint();
      break;
    case PHASE.COUNTDOWN:
      G.countdown = 3.5;
      setObjective('Race the targets down the Senora Freeway!', null, 0, false);
      break;
    case PHASE.RACE:
      G.raceStart = G.time;
      G.radioQueue = RACE_RADIO.map(r => ({ ...r }));
      setObjective('Chase the targets. Do NOT lose them!', null, 0, false);
      saveCheckpoint();
      break;
    case PHASE.BUST:
      setObjective('The disguise worked. Hold position.', null, 0, false);
      break;
    case PHASE.DELIVER:
      setObjective('Deliver the car to Hayes Auto on Little Big Horn.', { x: 6610, y: 2930 }, 90, true);
      // decoded random event: a starlet hides off the garage street, dodging paparazzi
      G.starlet = { x: 6740, y: 2050, state: 'waiting' };
      saveCheckpoint();
      break;
    case PHASE.PASSED:
      G.stats.t1 = G.time;
      break;
  }
}

// scripted spawn helpers
function spawnRacers() {
  const a = makeCar(900, 1355, 0, '#ff8c1a');  // orange, at the pumps
  const b = makeCar(1030, 1420, 0, '#f2f2f2'); // white
  a.isRacer = b.isRacer = true;
  a.laneY = 1645; b.laneY = 1695;
  a.stopX = 5700; b.stopX = 5760;
  a.stopped = b.stopped = false;
  G.racers = [a, b];
}

function spawnDeer() {
  // dynamic world event decoded from the footage: a deer bounds across the freeway
  G.deer = { x: G.player.x + 900, y: 1460, vy: 240, life: 4 };
}

// ---------- traffic ----------
function trafficTarget() { return G.onFoot ? G.walker : G.player; }

function spawnTrafficCar() {
  const t = trafficTarget();
  const rnd = G.rnd;
  for (let attempt = 0; attempt < 12; attempt++) {
    const lane = LANES[Math.floor(rnd() * LANES.length)];
    let x, y;
    if (lane.axis === 'h') { x = lane.from + rnd() * (lane.to - lane.from); y = lane.pos; }
    else { x = lane.pos; y = lane.from + rnd() * (lane.to - lane.from); }
    const d = dist(x, y, t.x, t.y);
    if (d < 340 || d > 1500) continue;
    const c = makeCar(x, y, lane.axis === 'h' ? (lane.sign > 0 ? 0 : Math.PI) : (lane.sign > 0 ? Math.PI / 2 : -Math.PI / 2), CAR_COLORS[Math.floor(rnd() * CAR_COLORS.length)]);
    c.lane = lane;
    c.cruise = 95 + rnd() * 65;
    c.speed = c.cruise;
    c.ai = true;
    return c;
  }
  return null;
}

function updateTraffic(dt) {
  const t = trafficTarget();
  const want = (G.phase === PHASE.RACE) ? 18 : 12;
  while (G.traffic.length < want) {
    const c = spawnTrafficCar();
    if (!c) break;
    G.traffic.push(c);
  }
  for (let i = G.traffic.length - 1; i >= 0; i--) {
    const c = G.traffic[i];
    if (dist(c.x, c.y, t.x, t.y) > 1900) { G.traffic.splice(i, 1); continue; }
    // brake for obstacles ahead in roughly the same lane
    let ahead = 1e9;
    const others = G.traffic.concat(G.onFoot ? [] : [G.player], G.racers, G.cop ? [G.cop] : []);
    for (const o of others) {
      if (o === c) continue;
      if (c.lane.axis === 'h') {
        if (Math.abs(o.y - c.y) < 30) {
          const gap = (o.x - c.x) * c.lane.sign;
          if (gap > 0 && gap < ahead) ahead = gap;
        }
      } else {
        if (Math.abs(o.x - c.x) < 30) {
          const gap = (o.y - c.y) * c.lane.sign;
          if (gap > 0 && gap < ahead) ahead = gap;
        }
      }
    }
    const targetSpeed = ahead < 70 ? 0 : (ahead < 160 ? c.cruise * (ahead - 70) / 90 : c.cruise);
    c.speed = lerp(c.speed, targetSpeed, clamp(3 * dt, 0, 1));
    if (c.lane.axis === 'h') {
      c.x += c.speed * c.lane.sign * dt;
      c.angle = c.lane.sign > 0 ? 0 : Math.PI;
      if (c.x < c.lane.from - 40 || c.x > c.lane.to + 40) G.traffic.splice(i, 1);
    } else {
      c.y += c.speed * c.lane.sign * dt;
      c.angle = c.lane.sign > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (c.y < c.lane.from - 40 || c.y > c.lane.to + 40) G.traffic.splice(i, 1);
    }
  }
}

// ---------- player physics ----------
function updatePlayerCar(dt, locked) {
  const p = G.player;
  p.px = p.x; p.py = p.y;
  locked = locked || G.modMenu.open;
  const thr = locked ? 0 : throttleInput();
  const steer = locked ? 0 : axisSteer();
  const hb = !locked && keys.Space;

  const nitro = modOn('nitro');
  const moon = modOn('moon');
  const topMul = (p.forgeTop || 1) * (nitro ? 1.45 : 1);
  const accMul = (p.forgeAcc || 1) * (nitro ? 1.35 : 1);
  const paved = onPavement(p.x, p.y);
  const maxF = (paved ? 620 : 220) * topMul;
  const maxR = -140;

  if (thr > 0) p.speed += 340 * accMul * dt * (1 - clamp(p.speed / maxF, 0, 1) * 0.55);
  else if (thr < 0) p.speed -= (p.speed > 0 ? 640 : 180) * dt;
  // drag
  const drag = (paved ? 0.45 : 1.6) * (moon ? 0.25 : 1) * (nitro ? 0.7 : 1);
  p.speed -= p.speed * drag * dt;
  if (hb) p.speed -= p.speed * (moon ? 0.9 : 2.4) * dt;
  p.speed = clamp(p.speed, maxR, maxF);
  if (Math.abs(p.speed) < 2 && thr === 0) p.speed = 0;

  // rev flame when stationary + throttle (decoded: exhaust flames at the curb);
  // nitro keeps the pipes lit at speed
  p.flame = (thr > 0 && (Math.abs(p.speed) < 40 || nitro)) ? 1 : Math.max(0, p.flame - 3 * dt);

  const grip = moon ? clamp(Math.abs(p.speed) / 60, 0, 1.4) : clamp(Math.abs(p.speed) / 130, 0, 1);
  const dir = p.speed >= 0 ? 1 : -1;
  p.angle += steer * (hb ? 3.4 : 2.4) * grip * dir * dt;

  p.x += Math.cos(p.angle) * p.speed * dt;
  p.y += Math.sin(p.angle) * p.speed * dt;
  p.x = clamp(p.x, 20, WORLD.w - 20);
  p.y = clamp(p.y, 20, WORLD.h - 20);

  G.stats.top = Math.max(G.stats.top, p.speed);

  // solid collisions
  resolveSolids(p, true);

  // water (only the bridge crosses it)
  if (pointInRect(p.x, p.y, WATER) && !onPavement(p.x, p.y)) {
    fail('UNIT SUBMERGED — hydro damage critical.');
  }

  // vehicle collisions
  if (!locked) {
    const ghost = modOn('ghost');
    const god = modOn('god');
    const others = (ghost ? [] : G.traffic).concat(G.racers, PARKED, (G.cop && G.phase !== PHASE.PULLOVER && G.phase !== PHASE.PULLOVER_TALK) ? [G.cop] : []);
    for (const o of others) {
      const d = dist(p.x, p.y, o.x, o.y);
      const min = p.radius + o.radius;
      if (d < min && d > 0.001) {
        const nx = (p.x - o.x) / d, ny = (p.y - o.y) / d;
        const push = (min - d) / 2;
        p.x += nx * push; p.y += ny * push;
        if (o.ai) { o.x -= nx * push; o.y -= ny * push; o.speed *= 0.4; }
        const impact = Math.abs(p.speed);
        if (impact > 120) {
          if (!god) p.damage = clamp(p.damage + (impact - 100) * 0.045, 0, 100);
          G.stats.hits++;
          G.shake = Math.min(14, 4 + impact / 60);
        }
        p.speed *= 0.55;
      }
    }
    if (p.damage >= 100) fail('VEHICLE DESTROYED — chassis integrity zero.');

    // sponsor jar pickups: nano-cream restores the hull finish
    for (const j of JARS) {
      if (!j.taken && dist(p.x, p.y, j.x, j.y) < 42) {
        j.taken = true;
        p.damage = Math.max(0, p.damage - 25);
        radio('SYSTEM', `${BRAND} applied — hull finish restored (+25).`);
      }
    }
  }

  AudioSys.engine(p.speed);
}

function resolveSolids(body, damaging) {
  for (const b of BUILDINGS) {
    const cx = clamp(body.x, b.x, b.x + b.w);
    const cy = clamp(body.y, b.y, b.y + b.h);
    const dx = body.x - cx, dy = body.y - cy;
    const d2 = dx * dx + dy * dy;
    const r = body.radius || 12;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.001;
      const push = r - d;
      if (d2 === 0) { body.x = body.px; body.y = body.py; }
      else { body.x += (dx / d) * push; body.y += (dy / d) * push; }
      if (damaging && Math.abs(body.speed) > 160) {
        if (!modOn('god')) body.damage = clamp(body.damage + (Math.abs(body.speed) - 140) * 0.03, 0, 100);
        G.stats.hits++;
        G.shake = 8;
      }
      if (body.speed !== undefined) body.speed *= 0.35;
    }
  }
}

// ---------- walker ----------
function updateWalker(dt) {
  const w = G.walker;
  let dx = (keys.KeyA || keys.ArrowLeft ? -1 : 0) + (keys.KeyD || keys.ArrowRight ? 1 : 0);
  let dy = (keys.KeyW || keys.ArrowUp ? -1 : 0) + (keys.KeyS || keys.ArrowDown ? 1 : 0);
  if (dx || dy) {
    const l = Math.hypot(dx, dy);
    dx /= l; dy /= l;
    w.x += dx * 150 * dt; w.y += dy * 150 * dt;
    w.angle = Math.atan2(dy, dx);
  }
  w.x = clamp(w.x, 20, WORLD.w - 20);
  w.y = clamp(w.y, 20, WORLD.h - 20);
  // block walker from buildings & water
  for (const b of BUILDINGS) {
    if (pointInRect(w.x, w.y, b)) {
      const l = w.x - b.x, r = b.x + b.w - w.x, t = w.y - b.y, bo = b.y + b.h - w.y;
      const m = Math.min(l, r, t, bo);
      if (m === l) w.x = b.x - 1; else if (m === r) w.x = b.x + b.w + 1;
      else if (m === t) w.y = b.y - 1; else w.y = b.y + b.h + 1;
    }
  }
  if (pointInRect(w.x, w.y, WATER) && !onPavement(w.x, w.y)) w.x = WATER.x - 12;
}

// ---------- scripted actors ----------
function updateCop(dt) {
  const cop = G.cop;
  if (!cop) return;
  const p = G.player;
  if (G.phase === PHASE.PULLOVER) {
    // pursue a point right behind the player, rubber-banded so it always closes in
    const tx = p.x - Math.cos(p.angle) * 90;
    const ty = p.y - Math.sin(p.angle) * 90;
    const d = dist(cop.x, cop.y, tx, ty);
    const want = Math.atan2(ty - cop.y, tx - cop.x);
    cop.angle += clamp(angDiff(cop.angle, want), -3.2 * dt, 3.2 * dt);
    const chase = clamp(d * 2.2, 0, Math.abs(p.speed) + 260);
    cop.speed = lerp(cop.speed, chase, clamp(2.5 * dt, 0, 1));
    cop.x += Math.cos(cop.angle) * cop.speed * dt;
    cop.y += Math.sin(cop.angle) * cop.speed * dt;
    if (d < 240 && Math.abs(p.speed) < 10) {
      enterPhase(PHASE.PULLOVER_TALK);
      say(DLG.pullover, () => {
        G.cop.leaving = true;
        enterPhase(PHASE.MEET_DRIVE);
      });
    }
  } else if (cop.leaving) {
    cop.speed = lerp(cop.speed, 260, clamp(2 * dt, 0, 1));
    cop.x += Math.cos(cop.angle) * cop.speed * dt;
    cop.y += Math.sin(cop.angle) * cop.speed * dt;
    if (dist(cop.x, cop.y, G.player.x, G.player.y) > 1600) G.cop = null;
  }
}

function updateRacers(dt) {
  if (!G.racers.length) return;
  const racing = G.phase === PHASE.RACE;
  for (const r of G.racers) {
    if (G.phase === PHASE.COUNTDOWN || G.phase === PHASE.GAS_TALK) { r.speed = 0; continue; }
    if (r.stopped) { r.speed = 0; continue; }
    if (!racing && G.phase !== PHASE.BUST) continue;
    // head to lane, then east to stopX
    const inLane = Math.abs(r.y - r.laneY) < 8;
    let want;
    if (!inLane) want = Math.atan2(r.laneY - r.y, 220);
    else want = 0;
    r.angle += clamp(angDiff(r.angle, want), -2.5 * dt, 2.5 * dt);
    // rubber-band: keep the race close (decoded: 'advanced AI' pacing)
    const lead = r.x - G.player.x;
    let target = 470;
    if (lead > 650) target = 360;
    else if (lead < -250) target = 560;
    if (r.x > r.stopX - 420) target = Math.min(target, (r.stopX - r.x) * 1.3);
    if (r.x >= r.stopX) { r.stopped = true; r.speed = 0; continue; }
    r.speed = lerp(r.speed, Math.max(target, 0), clamp(1.6 * dt, 0, 1));
    r.x += Math.cos(r.angle) * r.speed * dt;
    r.y += Math.sin(r.angle) * r.speed * dt;
  }
  if (racing) {
    const leader = Math.max(G.racers[0].x, G.racers[1].x);
    // radio chatter
    const t = G.time - G.raceStart;
    for (let i = G.radioQueue.length - 1; i >= 0; i--) {
      if (t >= G.radioQueue[i].at) { radio(G.radioQueue[i].s, G.radioQueue[i].t); G.radioQueue.splice(i, 1); }
    }
    // dynamic world event once, mid-race
    if (!G.deerDone && G.player.x > 3400) { G.deerDone = true; spawnDeer(); radio('T', 'Whoa — deer on the road! Watch it!'); }
    if (leader - G.player.x > 2400) fail('You lost the targets in traffic.');
    const bothStopped = G.racers.every(r => r.stopped);
    if (bothStopped && Math.abs(G.player.x - 5730) < 420 && Math.abs(G.player.speed) < 30) {
      enterPhase(PHASE.BUST);
      G.player.speed = 0;
      say(DLG.bust, () => {
        // swap into the blue target car (decoded: protagonist leaves in the blue one)
        const p = G.player;
        p.color = '#2757c9'; p.baseColor = '#2757c9'; p.stripe = true; p.stripeColor = null;
        p.siren = false; p.tiny = false; p.damage = Math.min(p.damage, 20);
        p.x = 5730; p.y = 1620; p.angle = 0; p.speed = 0;
        G.racers.forEach(r => { r.busted = true; });
        enterPhase(PHASE.DELIVER);
      });
    }
  }
}

function updateDeer(dt) {
  const d = G.deer;
  if (!d) return;
  d.y += d.vy * dt;
  d.x += 40 * dt;
  d.life -= dt;
  if (d.life <= 0 || d.y > 1820) { G.deer = null; return; }
  const p = G.player;
  if (!G.onFoot && dist(p.x, p.y, d.x, d.y) < 30 && Math.abs(p.speed) > 60) {
    p.speed *= 0.5;
    if (!modOn('god')) p.damage = clamp(p.damage + 8, 0, 100);
    G.stats.hits++;
    G.shake = 10;
    G.deer = null;
    radio('FRNK-13', 'Wildlife impact logged. Sorry, nature.');
  }
}

// ---------- objective checks ----------
function checkObjective() {
  const o = G.objective;
  if (!o.target) return false;
  const t = G.onFoot ? G.walker : G.player;
  if (dist(t.x, t.y, o.target.x, o.target.y) > o.radius) return false;
  if (o.needStop && !G.onFoot && Math.abs(G.player.speed) > 12) return false;
  return true;
}

// ---------- update ----------
function update(dt) {
  if (modOn('slowmo')) dt *= 0.5; // BULLET TIME mod
  G.time += dt;
  G.phaseTime += dt;
  G.shake = Math.max(0, G.shake - 30 * dt);
  if (pressed.KeyM) AudioSys.toggle();

  // MOD TERMINAL input
  if (pressed.KeyT && !G.dialog && ![PHASE.BOOT, PHASE.INTEL, PHASE.PASSED, PHASE.FAILED].includes(G.phase)) {
    G.modMenu.open = !G.modMenu.open;
  }
  if (G.modMenu.open) {
    const mm = G.modMenu;
    const rows = MODS.length + 2; // mods + vehicle forge + wardrobe
    if (pressed.ArrowUp || pressed.KeyW) mm.idx = (mm.idx + rows - 1) % rows;
    if (pressed.ArrowDown || pressed.KeyS) mm.idx = (mm.idx + 1) % rows;
    if (pressed.KeyE || pressed.Enter) {
      if (mm.idx < MODS.length) toggleMod(MODS[mm.idx].id);
      else if (mm.idx === MODS.length) applyForge(G.forgeIdx + 1);
      else cycleOutfit();
    }
    // the menu owns these keys this frame
    delete pressed.KeyE; delete pressed.Enter;
    delete pressed.ArrowUp; delete pressed.ArrowDown;
    delete pressed.KeyW; delete pressed.KeyS;
  }

  // CHROME CYCLER paint job
  if (modOn('chrome')) {
    G.player.color = `hsl(${Math.round((G.time * 90) % 360)},85%,60%)`;
  }

  // CARJACK PROTOCOL: commandeer the nearest stopped traffic car
  const DRIVING = [PHASE.CRUISE, PHASE.PULLOVER, PHASE.MEET_DRIVE, PHASE.GAS_DRIVE, PHASE.RACE, PHASE.DELIVER];
  if (modOn('jack') && pressed.KeyE && !G.dialog && !G.modMenu.open && !G.onFoot && DRIVING.includes(G.phase)) {
    const p = G.player;
    if (Math.abs(p.speed) < 60) {
      let best = null, bestD = 70;
      for (const c of G.traffic) {
        const d = dist(p.x, p.y, c.x, c.y);
        if (d < bestD) { best = c; bestD = d; }
      }
      if (best) {
        p.x = best.x; p.y = best.y; p.px = best.x; p.py = best.y;
        p.angle = best.angle; p.speed = 0;
        p.baseColor = best.color;
        if (!modOn('chrome')) p.color = best.color;
        p.stripe = false; p.stripeColor = null; p.siren = false; p.tiny = false;
        p.forgeTop = 0.92; p.forgeAcc = 0.95; // commuter cars are no supercars
        G.traffic.splice(G.traffic.indexOf(best), 1);
        G.stats.modsUsed = true;
        delete pressed.KeyE;
        radio('SYSTEM', 'CARJACK PROTOCOL: vehicle commandeered. Previous occupant is furious.');
      }
    }
  }

  // dialogue advance
  if (G.dialog) {
    G.dialog.timer += dt;
    if (actionPressed() || G.dialog.timer > 4.5) {
      G.dialog.timer = 0;
      G.dialog.i++;
      if (G.dialog.i >= G.dialog.lines.length) {
        const done = G.dialog.onDone;
        G.dialog = null;
        if (done) done();
      }
    }
  }
  if (G.subtitle) { G.subtitle.timer -= dt; if (G.subtitle.timer <= 0) G.subtitle = null; }

  switch (G.phase) {
    case PHASE.BOOT:
      if (actionPressed()) enterPhase(PHASE.INTEL);
      break;
    case PHASE.INTEL:
      if (actionPressed()) enterPhase(PHASE.WALK);
      break;
    case PHASE.WALK:
      updateWalker(dt);
      if (checkObjective()) enterPhase(PHASE.CRUISE);
      break;
    case PHASE.CRUISE:
      updatePlayerCar(dt, false);
      // scripted pull-over trigger (decoded scene 15-18)
      if (G.player.y < 3400 && G.player.x > 1100 && G.player.x < 1500) enterPhase(PHASE.PULLOVER);
      break;
    case PHASE.PULLOVER:
      updatePlayerCar(dt, false);
      updateCop(dt);
      break;
    case PHASE.PULLOVER_TALK:
      updatePlayerCar(dt, true);
      updateCop(dt);
      break;
    case PHASE.MEET_DRIVE:
      updatePlayerCar(dt, false);
      updateCop(dt);
      if (checkObjective()) {
        G.phase = PHASE.MEET_TALK; G.phaseTime = 0;
        say(DLG.meet, () => enterPhase(PHASE.GAS_DRIVE));
      }
      break;
    case PHASE.MEET_TALK:
      updatePlayerCar(dt, true);
      break;
    case PHASE.GAS_DRIVE:
      updatePlayerCar(dt, false);
      // sponsor radio spot (original copy for the decoded ad)
      if (!G.adPlayed && G.phaseTime > 3) {
        G.adPlayed = true;
        radio('RADIO', `${BRAND} whipped cloud cream — feather-light, gone in a blink, glow that clocks out when you do.`);
      } else if (G.adPlayed === true && G.phaseTime > 9) {
        G.adPlayed = 2;
        radio('RADIO', `Sale ends tonight. ${BRAND} — a ${CREATOR} original.`);
      }
      if (checkObjective()) {
        spawnRacers();
        G.phase = PHASE.GAS_TALK; G.phaseTime = 0;
        say(DLG.gas, () => enterPhase(PHASE.COUNTDOWN));
      }
      break;
    case PHASE.GAS_TALK:
      updatePlayerCar(dt, true);
      updateRacers(dt);
      break;
    case PHASE.COUNTDOWN:
      updatePlayerCar(dt, true);
      updateRacers(dt);
      G.countdown -= dt;
      if (G.countdown <= 0) enterPhase(PHASE.RACE);
      break;
    case PHASE.RACE:
      updatePlayerCar(dt, false);
      updateRacers(dt);
      updateDeer(dt);
      break;
    case PHASE.BUST:
      updatePlayerCar(dt, true);
      updateRacers(dt);
      break;
    case PHASE.DELIVER:
      updatePlayerCar(dt, false);
      // starlet pickup (stop next to her)
      if (G.starlet && G.starlet.state === 'waiting' &&
          dist(G.player.x, G.player.y, G.starlet.x, G.starlet.y) < 80 && Math.abs(G.player.speed) < 12) {
        G.starlet.state = 'riding';
        radio('STARLET', 'You! Please — roll me past those lens-goblins before they spot me. Anywhere but here.');
      }
      if (checkObjective()) {
        G.phase = PHASE.DELIVER_TALK; G.phaseTime = 0;
        G.player.speed = 0;
        if (G.starlet && G.starlet.state === 'riding') {
          G.starlet.state = 'done';
          G.stats.fareRescued = true;
          radio('STARLET', "A repo shop. Perfect — nobody will look here. You're a lifesaver.");
        }
        say(DLG.deliver, () => enterPhase(PHASE.PASSED));
      }
      break;
    case PHASE.DELIVER_TALK:
      updatePlayerCar(dt, true);
      break;
    case PHASE.PASSED:
      if (pressed.KeyR) location.reload();
      break;
    case PHASE.FAILED:
      if (pressed.KeyR || actionPressed()) restoreCheckpoint();
      break;
  }

  if (![PHASE.BOOT, PHASE.INTEL, PHASE.PASSED, PHASE.FAILED].includes(G.phase)) updateTraffic(dt);

  // camera
  const focus = G.onFoot ? G.walker : G.player;
  const lookAhead = G.onFoot ? 0 : clamp(G.player.speed * 0.35, -80, 220);
  const cx = focus.x + Math.cos(focus.angle || 0) * lookAhead;
  const cy = focus.y + Math.sin(focus.angle || 0) * lookAhead;
  G.camera.x = lerp(G.camera.x, cx, clamp(3.2 * dt, 0, 1));
  G.camera.y = lerp(G.camera.y, cy, clamp(3.2 * dt, 0, 1));

  // clear edge-triggered keys
  for (const k in pressed) delete pressed[k];
}

// ---------- rendering ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let VW = 1280, VH = 720;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  VW = Math.max(640, Math.floor(window.innerWidth));
  VH = Math.max(360, Math.floor(window.innerHeight));
  canvas.width = Math.floor(VW * dpr);
  canvas.height = Math.floor(VH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// day -> sunset progression across the mission (decoded from footage + 'photoreal lighting' intel)
function daylight() {
  // 0 = noon, 1 = sunset
  const order = [PHASE.BOOT, PHASE.INTEL, PHASE.WALK, PHASE.CRUISE, PHASE.PULLOVER, PHASE.PULLOVER_TALK,
    PHASE.MEET_DRIVE, PHASE.MEET_TALK, PHASE.GAS_DRIVE, PHASE.GAS_TALK, PHASE.COUNTDOWN, PHASE.RACE,
    PHASE.BUST, PHASE.DELIVER, PHASE.DELIVER_TALK, PHASE.PASSED];
  const i = Math.max(0, order.indexOf(G.phase));
  return clamp(i / (order.length - 1), 0, 1);
}

function worldToScreen(x, y) {
  return [x - G.camera.x + VW / 2, y - G.camera.y + VH / 2];
}

function drawCarShape(c, w, h) {
  // body
  ctx.fillStyle = c.color;
  roundRect(-w / 2, -h / 2, w, h, 5);
  ctx.fill();
  if (c.stripe) {
    ctx.fillStyle = c.stripeColor || 'rgba(255,255,255,0.85)';
    ctx.fillRect(-w / 2 + 4, -2.5, w - 8, 5);
  }
  // cabin
  ctx.fillStyle = 'rgba(20,26,34,0.85)';
  roundRect(-w * 0.18, -h / 2 + 3, w * 0.34, h - 6, 3);
  ctx.fill();
  // headlights / taillights
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(w / 2 - 3, -h / 2 + 2, 3, 5);
  ctx.fillRect(w / 2 - 3, h / 2 - 7, 3, 5);
  ctx.fillStyle = '#ff5d5d';
  ctx.fillRect(-w / 2, -h / 2 + 2, 3, 5);
  ctx.fillRect(-w / 2, h / 2 - 7, 3, 5);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCar(c) {
  const [sx, sy] = worldToScreen(c.x, c.y);
  if (sx < -80 || sy < -80 || sx > VW + 80 || sy > VH + 80) return;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(c.angle);
  // shadow
  const cs = c.tiny ? 0.62 : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 3, 26 * cs, 15 * cs, 0, 0, TAU); ctx.fill();
  drawCarShape(c, 46 * cs, 24 * cs);
  // exhaust flame
  if (c.flame > 0.3) {
    ctx.fillStyle = `rgba(255,${140 + Math.floor(Math.random() * 80)},40,${0.6 * c.flame})`;
    ctx.beginPath();
    ctx.moveTo(-23, -4); ctx.lineTo(-23 - 14 * c.flame * (0.7 + Math.random() * 0.5), 0); ctx.lineTo(-23, 4);
    ctx.closePath(); ctx.fill();
  }
  // siren
  if (c.siren) {
    const on = Math.floor(G.time * 6) % 2 === 0;
    ctx.fillStyle = on ? '#ff4040' : '#3a70ff';
    ctx.fillRect(-6, -9, 12, 4);
    ctx.fillStyle = on ? '#3a70ff' : '#ff4040';
    ctx.fillRect(-6, 5, 12, 4);
  }
  ctx.restore();
}

function drawWorld() {
  const dl = daylight();
  // ground
  const grass = `rgb(${Math.round(lerp(96, 74, dl))},${Math.round(lerp(128, 84, dl))},${Math.round(lerp(74, 66, dl))})`;
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, VW, VH);

  // water
  {
    const [wx, wy] = worldToScreen(WATER.x, WATER.y);
    ctx.fillStyle = `rgb(${Math.round(lerp(46, 40, dl))},${Math.round(lerp(102, 70, dl))},${Math.round(lerp(148, 120, dl))})`;
    ctx.fillRect(wx, wy, WATER.w, WATER.h);
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const yy = ((i * 380 + G.time * 22) % WORLD.h);
      const [rx, ry] = worldToScreen(WATER.x + 80 + (i % 4) * 240, yy);
      if (ry > -10 && ry < VH + 10) {
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 70, ry); ctx.stroke();
      }
    }
  }

  // lots
  for (const l of LOTS) {
    const [lx, ly] = worldToScreen(l.x, l.y);
    ctx.fillStyle = l.kind === 'plaza' ? '#b9b3a6' : '#8f939b';
    ctx.fillRect(lx, ly, l.w, l.h);
  }

  // roads
  for (const r of ROADS) {
    const [rx, ry] = worldToScreen(r.x, r.y);
    ctx.fillStyle = '#3a3f46';
    ctx.fillRect(rx, ry, r.w, r.h);
    // lane markings
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 26]);
    if (r.h > r.w) { // vertical
      ctx.beginPath(); ctx.moveTo(rx + r.w / 2, ry); ctx.lineTo(rx + r.w / 2, ry + r.h); ctx.stroke();
    } else {
      if (r.fwy) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#d9b23a';
        ctx.beginPath(); ctx.moveTo(rx, ry + r.h / 2 - 2); ctx.lineTo(rx + r.w, ry + r.h / 2 - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, ry + r.h / 2 + 2); ctx.lineTo(rx + r.w, ry + r.h / 2 + 2); ctx.stroke();
        ctx.setLineDash([18, 26]);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.moveTo(rx, ry + r.h * 0.25); ctx.lineTo(rx + r.w, ry + r.h * 0.25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, ry + r.h * 0.75); ctx.lineTo(rx + r.w, ry + r.h * 0.75); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(rx, ry + r.h / 2); ctx.lineTo(rx + r.w, ry + r.h / 2); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  // bridge deck highlight over water
  {
    const bx0 = Math.max(WATER.x, 400), bx1 = Math.min(WATER.x + WATER.w, 6800);
    const [dx, dy] = worldToScreen(bx0, 1496);
    ctx.fillStyle = 'rgba(190,195,205,0.25)';
    ctx.fillRect(dx, dy, bx1 - bx0, 248);
  }

  // gas station canopy + pumps
  {
    const g = LOTS[2];
    const [gx, gy] = worldToScreen(g.x + 40, g.y + 30);
    ctx.fillStyle = '#c8442e';
    ctx.fillRect(gx, gy, g.w - 80, 26);
    ctx.fillStyle = '#e8e2d2';
    ctx.fillRect(gx, gy + 26, g.w - 80, 90);
    ctx.fillStyle = '#5a3d34';
    for (let i = 0; i < 3; i++) ctx.fillRect(gx + 30 + i * 100, gy + 60, 16, 30);
    ctx.fillStyle = '#3a2c26';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('ROUTE 68 GAS', gx + 8, gy + 18);
  }

  // garage
  {
    const g = LOTS[3];
    const [gx, gy] = worldToScreen(g.x, g.y + 60);
    ctx.fillStyle = '#7a6f5d';
    ctx.fillRect(gx, gy, g.w, g.h - 60);
    ctx.fillStyle = '#4b4437';
    ctx.fillRect(gx + 40, gy + 30, g.w - 80, g.h - 120);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('HAYES AUTO', gx + 30, gy + 20);
  }

  // buildings
  for (const b of BUILDINGS) {
    const [bx, by] = worldToScreen(b.x, b.y);
    if (bx > VW + 60 || by > VH + 60 || bx + b.w < -60 || by + b.h < -60) continue;
    if (b.rail) {
      ctx.fillStyle = '#aeb6c2';
      ctx.fillRect(bx, by, b.w, b.h);
      continue;
    }
    ctx.fillStyle = '#565d66';
    ctx.fillRect(bx + 6, by + 8, b.w, b.h); // shadow offset
    ctx.fillStyle = '#8a9099';
    ctx.fillRect(bx, by, b.w, b.h);
    ctx.fillStyle = '#6f7680';
    ctx.fillRect(bx + 8, by + 8, b.w - 16, b.h - 16);
    // windows at sunset
    if (daylight() > 0.6) {
      ctx.fillStyle = 'rgba(255,214,120,0.5)';
      for (let wx = bx + 16; wx < bx + b.w - 16; wx += 34) {
        for (let wy = by + 16; wy < by + b.h - 16; wy += 40) {
          if (((wx + wy) | 0) % 3 === 0) ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
  }

  // palms (drawn before billboards so fronds never cover the panels)
  for (const p of PALMS) {
    const [px, py] = worldToScreen(p.x, p.y);
    if (px < -40 || py < -60 || px > VW + 40 || py > VH + 40) continue;
    ctx.strokeStyle = '#6e4b2a';
    ctx.lineWidth = 4 * p.s;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 3, py - 26 * p.s); ctx.stroke();
    ctx.fillStyle = '#3f7a3a';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + 0.4;
      ctx.beginPath();
      ctx.ellipse(px + 3 + Math.cos(a) * 10 * p.s, py - 26 * p.s + Math.sin(a) * 7 * p.s, 12 * p.s, 4.5 * p.s, a, 0, TAU);
      ctx.fill();
    }
  }

  // billboards (decoded from source image)
  for (const bb of BILLBOARDS) {
    const [bx, by] = worldToScreen(bb.x, bb.y);
    if (bx > VW + 200 || by > VH + 200 || bx + bb.w < -200 || by < -200) continue;
    ctx.fillStyle = '#2a2e35';
    ctx.fillRect(bx + bb.w / 2 - 5, by, 10, 46);
    ctx.fillStyle = bb.era === 'V' ? '#15281c' : '#2a1230';
    ctx.fillRect(bx, by - 86, bb.w, 86);
    ctx.strokeStyle = bb.era === 'V' ? '#7be382' : '#f27ad1';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by - 86, bb.w, 86);
    ctx.fillStyle = bb.era === 'V' ? '#a5f2a0' : '#ffb3ec';
    ctx.font = 'bold 13px monospace';
    for (let i = 0; i < bb.lines.length; i++) ctx.fillText(bb.lines[i], bx + 10, by - 66 + i * 19);
  }

  // sponsor ad billboards — animated 5-frame storyboard (decoded ad, redrawn originally)
  for (const ad of AD_BILLBOARDS) {
    const [ax, ay] = worldToScreen(ad.x, ad.y);
    if (ax > VW + 220 || ay > VH + 220 || ax + ad.w < -220 || ay < -220) continue;
    const frame = Math.floor(G.time / 3) % 5;
    // post + panel
    ctx.fillStyle = '#2a2e35';
    ctx.fillRect(ax + ad.w / 2 - 5, ay, 10, 46);
    ctx.fillStyle = '#f6efe6';
    ctx.fillRect(ax, ay - 116, ad.w, 116);
    ctx.strokeStyle = '#c9a24b';
    ctx.lineWidth = 3;
    ctx.strokeRect(ax, ay - 116, ad.w, 116);
    const cx = ax + 52, cy = ay - 58; // art zone center
    const drawJar = (jx, jy, s) => {
      ctx.fillStyle = 'rgba(190,205,215,0.85)';
      roundRect(jx - 14 * s, jy - 8 * s, 28 * s, 20 * s, 4 * s); ctx.fill();
      ctx.fillStyle = '#c9a24b';
      roundRect(jx - 15 * s, jy - 16 * s, 30 * s, 9 * s, 3 * s); ctx.fill();
    };
    ctx.save();
    ctx.beginPath(); ctx.rect(ax + 4, ay - 112, ad.w - 8, 108); ctx.clip();
    if (frame === 0) {           // jar pops open
      drawJar(cx, cy + 8, 1.4);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy - 18, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8a5a00';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('POP!', cx + 16, cy - 22);
    } else if (frame === 1) {    // applying to the cheek
      ctx.fillStyle = '#e8c39e';
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6b4f3a';
      ctx.beginPath(); ctx.arc(cx, cy - 14, 24, Math.PI, 0); ctx.fill(); // hair
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 10, cy + 6, 5, 0, TAU); ctx.fill();  // cream dab
    } else if (frame === 2) {    // macro dollop
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy + 8, 18, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 8, cy - 2, 12, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 9, cy - 4, 9, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2, cy - 14, 6, 0, TAU); ctx.fill();  // soft peak
    } else if (frame === 3) {    // the glow
      ctx.fillStyle = '#e8c39e';
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,120,0.9)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + G.time;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
        ctx.lineTo(cx + Math.cos(a) * 36, cy + Math.sin(a) * 36);
        ctx.stroke();
      }
    } else {                     // call to action
      drawJar(cx, cy, 1.2);
      ctx.fillStyle = '#3f7a3a';
      ctx.beginPath(); ctx.ellipse(cx + 26, cy + 10, 10, 4, -0.6, 0, TAU); ctx.fill(); // flower leaf
    }
    ctx.restore();
    // copy (original)
    ctx.fillStyle = '#5a4632';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(BRAND, ax + 104, ay - 84);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#6d5c46';
    const tag = [
      'WHIPPED CLOUD CREAM',
      'FEATHER-LIGHT. ALL DAY.',
      'TEXTURE YOU CAN HEAR',
      'GLOW THAT SHOWS UP',
      'SALE ENDS TONIGHT',
    ][frame];
    ctx.fillText(tag, ax + 104, ay - 62);
    ctx.fillText(`a ${CREATOR} original`, ax + 104, ay - 40);
    ctx.fillStyle = '#9c8a6e';
    ctx.fillText(`[${frame + 1}/5]`, ax + ad.w - 44, ay - 12);
  }

  // sponsor jar pickups
  for (const j of JARS) {
    if (j.taken) continue;
    const [jx, jy] = worldToScreen(j.x, j.y);
    if (jx < -40 || jy < -40 || jx > VW + 40 || jy > VH + 40) continue;
    const pulse = 1 + 0.2 * Math.sin(G.time * 5);
    ctx.strokeStyle = 'rgba(255,230,160,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(jx, jy, 22 * pulse, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(230,238,244,0.95)';
    roundRect(jx - 8, jy - 5, 16, 12, 3); ctx.fill();
    ctx.fillStyle = '#c9a24b';
    roundRect(jx - 9, jy - 10, 18, 6, 2); ctx.fill();
  }

  // objective marker
  if (G.objective.target && !G.dialog) {
    const [mx, my] = worldToScreen(G.objective.target.x, G.objective.target.y);
    const pulse = 1 + 0.15 * Math.sin(G.time * 4);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(mx, my, G.objective.radius * 0.7 * pulse, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,210,63,0.15)';
    ctx.beginPath(); ctx.arc(mx, my, G.objective.radius * 0.7 * pulse, 0, TAU); ctx.fill();
  }

  // deer
  if (G.deer) {
    const [dx, dy] = worldToScreen(G.deer.x, G.deer.y);
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = '#9a6b3f';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 7, 0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -6, 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7a5430';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(10, -9); ctx.lineTo(14, -15); ctx.moveTo(8, -9); ctx.lineTo(5, -15); ctx.stroke();
    ctx.restore();
  }

  // starlet random event NPC
  if (G.starlet && G.starlet.state === 'waiting') {
    const [nx, ny] = worldToScreen(G.starlet.x, G.starlet.y);
    if (nx > -40 && ny > -40 && nx < VW + 40 && ny < VH + 40) {
      const pulse = 1 + 0.18 * Math.sin(G.time * 4.5);
      ctx.strokeStyle = 'rgba(247,200,224,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(nx, ny, 26 * pulse, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#3a2a22'; // leather jacket
      ctx.beginPath(); ctx.arc(nx, ny, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e6c86e'; // blonde hair
      ctx.beginPath(); ctx.arc(nx, ny - 4, 5, 0, TAU); ctx.fill();
    }
  }

  // vehicles
  for (const c of PARKED) drawCar(c);
  const ghostTraffic = modOn('ghost');
  if (ghostTraffic) ctx.globalAlpha = 0.45;
  for (const c of G.traffic) drawCar(c);
  if (ghostTraffic) ctx.globalAlpha = 1;
  for (const r of G.racers) drawCar(r);
  if (G.cop) drawCar(G.cop);
  if (!G.onFoot) drawCar(G.player);

  // patrol bikes during the bust
  if (G.phase === PHASE.BUST || (G.phase === PHASE.DELIVER && G.player.x > 5100 && G.player.x < 6300)) {
    for (let i = 0; i < 2; i++) {
      const [bx, by] = worldToScreen(5560 + i * 60, 1600 + i * 60);
      ctx.save(); ctx.translate(bx, by);
      ctx.fillStyle = '#16181c';
      ctx.fillRect(-12, -4, 24, 8);
      const on = Math.floor(G.time * 6 + i) % 2 === 0;
      ctx.fillStyle = on ? '#ff4040' : '#3a70ff';
      ctx.fillRect(-3, -7, 6, 3);
      ctx.restore();
    }
  }

  // walker
  if (G.onFoot) {
    const [wx, wy] = worldToScreen(G.walker.x, G.walker.y);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(wx, wy + 3, 9, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = OUTFITS[G.outfitIdx].body;
    ctx.beginPath(); ctx.arc(wx, wy, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6fd3ff';
    ctx.beginPath(); ctx.arc(wx + Math.cos(G.walker.angle) * 5, wy + Math.sin(G.walker.angle) * 5, 3, 0, TAU); ctx.fill();
  }

  // sunset tint overlay
  if (dl > 0.15) {
    const a = (dl - 0.15) * 0.4;
    const grad = ctx.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, `rgba(255,120,60,${a * 0.55})`);
    grad.addColorStop(1, `rgba(40,20,80,${a})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VW, VH);
  }
}

// ---------- HUD ----------
function drawHUD() {
  ctx.textBaseline = 'alphabetic';
  // header
  ctx.fillStyle = 'rgba(8,12,18,0.72)';
  ctx.fillRect(0, 0, VW, 30);
  ctx.fillStyle = '#6fd3ff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('U.S. ROBOTIC ARMY // UNIT FRNK-13 // REPO PROTOCOL 02: "I FOUGHT THE LAW"', 12, 20);
  ctx.fillStyle = '#9aa5b1';
  ctx.fillText('[T] mods  [M] sound', VW - 168, 20);

  // active-mods badge
  const activeMods = MODS.filter(m => m.on).length;
  if (activeMods > 0 && !G.modMenu.open) {
    ctx.fillStyle = 'rgba(8,12,18,0.72)';
    ctx.fillRect(VW - 150, 38, 138, 24);
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`MODS ACTIVE: ${activeMods}`, VW - 140, 55);
  }

  // objective
  if (G.objective.text && !G.dialog && ![PHASE.BOOT, PHASE.INTEL, PHASE.PASSED, PHASE.FAILED].includes(G.phase)) {
    ctx.fillStyle = 'rgba(8,12,18,0.72)';
    const w = Math.min(560, VW - 24);
    ctx.fillRect(12, 40, w, 34);
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('> ' + G.objective.text, 22, 62);
    // GPS arrow
    if (G.objective.target) {
      const t = G.onFoot ? G.walker : G.player;
      const a = Math.atan2(G.objective.target.y - t.y, G.objective.target.x - t.x);
      ctx.save();
      ctx.translate(22 + w - 26, 57);
      ctx.rotate(a);
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-7, -6); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // race gap meter
  if (G.phase === PHASE.RACE && G.racers.length === 2) {
    const leader = Math.max(G.racers[0].x, G.racers[1].x);
    const gap = Math.max(0, leader - G.player.x);
    const frac = clamp(gap / 2400, 0, 1);
    ctx.fillStyle = 'rgba(8,12,18,0.72)';
    ctx.fillRect(12, 82, 240, 26);
    ctx.fillStyle = '#9aa5b1';
    ctx.font = '12px monospace';
    ctx.fillText('TARGET LOCK', 20, 99);
    ctx.fillStyle = frac > 0.7 ? '#ff5d5d' : '#7be382';
    ctx.fillRect(116, 89, (1 - frac) * 126, 12);
    ctx.strokeStyle = '#9aa5b1';
    ctx.strokeRect(116, 89, 126, 12);
  }

  // speed + damage (bottom right)
  if (!G.onFoot && ![PHASE.BOOT, PHASE.INTEL].includes(G.phase)) {
    const mph = Math.round(Math.abs(G.player.speed) / 4.4);
    ctx.fillStyle = 'rgba(8,12,18,0.72)';
    ctx.fillRect(VW - 170, VH - 78, 158, 66);
    ctx.fillStyle = '#e8eef4';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(String(mph).padStart(3, ' '), VW - 158, VH - 48);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#9aa5b1';
    ctx.fillText('MPH  (limit 45)', VW - 110, VH - 48);
    ctx.fillText('HULL', VW - 158, VH - 24);
    const dmg = G.player.damage / 100;
    ctx.fillStyle = dmg > 0.7 ? '#ff5d5d' : '#7be382';
    ctx.fillRect(VW - 118, VH - 34, (1 - dmg) * 96, 12);
    ctx.strokeStyle = '#9aa5b1';
    ctx.strokeRect(VW - 118, VH - 34, 96, 12);
  }

  // minimap (bottom left)
  if (![PHASE.BOOT, PHASE.INTEL].includes(G.phase)) {
    const MW = 216, MH = 150, mx = 12, my = VH - MH - 12;
    const sx = MW / WORLD.w, sy = MH / WORLD.h;
    ctx.fillStyle = 'rgba(8,12,18,0.78)';
    ctx.fillRect(mx, my, MW, MH);
    ctx.fillStyle = 'rgba(70,140,190,0.6)';
    ctx.fillRect(mx + WATER.x * sx, my + WATER.y * sy, WATER.w * sx, WATER.h * sy);
    ctx.fillStyle = '#5c6570';
    for (const r of ROADS) ctx.fillRect(mx + r.x * sx, my + r.y * sy, Math.max(2, r.w * sx), Math.max(2, r.h * sy));
    for (const l of LOTS) { ctx.fillStyle = '#7d8794'; ctx.fillRect(mx + l.x * sx, my + l.y * sy, Math.max(3, l.w * sx), Math.max(3, l.h * sy)); }
    if (G.objective.target) {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath(); ctx.arc(mx + G.objective.target.x * sx, my + G.objective.target.y * sy, 4, 0, TAU); ctx.fill();
    }
    for (const r of G.racers) {
      ctx.fillStyle = r.color;
      ctx.fillRect(mx + r.x * sx - 2, my + r.y * sy - 2, 4, 4);
    }
    const t = G.onFoot ? G.walker : G.player;
    ctx.fillStyle = '#6fd3ff';
    ctx.beginPath(); ctx.arc(mx + t.x * sx, my + t.y * sy, 4, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#39424d';
    ctx.strokeRect(mx, my, MW, MH);
  }

  // dialogue box
  if (G.dialog) {
    const line = G.dialog.lines[G.dialog.i];
    const bw = Math.min(760, VW - 40);
    const bx = (VW - bw) / 2, by = VH - 120;
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    roundRect(bx, by, bw, 84, 8); ctx.fill();
    ctx.strokeStyle = '#39424d'; ctx.lineWidth = 1;
    roundRect(bx, by, bw, 84, 8); ctx.stroke();
    ctx.fillStyle = SPEAKER_COLOR[line.s] || '#e8eef4';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(line.s, bx + 18, by + 26);
    ctx.fillStyle = '#e8eef4';
    ctx.font = '15px monospace';
    wrapText(line.t, bx + 18, by + 50, bw - 36, 20);
    ctx.fillStyle = '#9aa5b1';
    ctx.font = '11px monospace';
    ctx.fillText('[E] continue  (' + (G.dialog.i + 1) + '/' + G.dialog.lines.length + ')', bx + bw - 170, by + 74);
  } else if (G.subtitle) {
    const bw = Math.min(700, VW - 40);
    const bx = (VW - bw) / 2, by = VH - 96;
    ctx.fillStyle = 'rgba(8,12,18,0.65)';
    roundRect(bx, by, bw, 54, 8); ctx.fill();
    ctx.fillStyle = SPEAKER_COLOR[G.subtitle.s] || '#e8eef4';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(G.subtitle.s + ':', bx + 16, by + 22);
    ctx.fillStyle = '#e8eef4';
    ctx.font = '14px monospace';
    wrapText(G.subtitle.t, bx + 16, by + 42, bw - 32, 18);
  }

  // MOD TERMINAL overlay
  if (G.modMenu.open) {
    const rows = MODS.length + 2;
    const pw = 340, ph = 96 + rows * 30;
    const px = VW - pw - 14, py = 72;
    ctx.fillStyle = 'rgba(6,10,16,0.92)';
    roundRect(px, py, pw, ph, 8); ctx.fill();
    ctx.strokeStyle = '#6fd3ff'; ctx.lineWidth = 1.5;
    roundRect(px, py, pw, ph, 8); ctx.stroke();
    ctx.fillStyle = '#6fd3ff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('MOD TERMINAL v1.9', px + 16, py + 26);
    ctx.fillStyle = '#9aa5b1';
    ctx.font = '11px monospace';
    ctx.fillText('W/S select · E toggle · T close', px + 16, py + 44);
    for (let i = 0; i < rows; i++) {
      const y = py + 66 + i * 30;
      const sel = i === G.modMenu.idx;
      if (sel) {
        ctx.fillStyle = 'rgba(111,211,255,0.14)';
        ctx.fillRect(px + 8, y - 18, pw - 16, 26);
      }
      if (i < MODS.length) {
        const m = MODS[i];
        ctx.fillStyle = sel ? '#e8eef4' : '#b9c2cc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(m.name, px + 20, y);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#7d8794';
        ctx.fillText(m.desc, px + 20, y + 11);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = m.on ? '#7be382' : '#66707c';
        ctx.fillText(m.on ? '[ON]' : '[OFF]', px + pw - 62, y);
      } else if (i === MODS.length) {
        ctx.fillStyle = sel ? '#e8eef4' : '#b9c2cc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('VEHICLE FORGE', px + 20, y);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#7d8794';
        ctx.fillText('cycle spawned vehicle', px + 20, y + 11);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffd23f';
        ctx.fillText(FORGE[G.forgeIdx].name, px + pw - 176, y);
      } else {
        ctx.fillStyle = sel ? '#e8eef4' : '#b9c2cc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('WARDROBE', px + 20, y);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#7d8794';
        ctx.fillText('cycle unit plating (decoded closet menu)', px + 20, y + 11);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffd23f';
        ctx.fillText(OUTFITS[G.outfitIdx].name, px + pw - 176, y);
      }
    }
  }

  // countdown
  if (G.phase === PHASE.COUNTDOWN) {
    const n = Math.ceil(G.countdown - 0.5);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, VH / 2 - 70, VW, 140);
    ctx.fillStyle = n <= 0 ? '#7be382' : '#ffd23f';
    ctx.font = 'bold 84px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n <= 0 ? 'GO!' : String(n), VW / 2, VH / 2 + 28);
    ctx.textAlign = 'left';
  }

  // control hint
  if ([PHASE.WALK, PHASE.CRUISE].includes(G.phase) && G.phaseTime < 6) {
    ctx.fillStyle = 'rgba(8,12,18,0.6)';
    ctx.fillRect(VW / 2 - 190, 40, 380, 26);
    ctx.fillStyle = '#9aa5b1';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(G.onFoot ? 'WASD / arrows to walk' : 'WASD drive · SPACE handbrake · E talk', VW / 2, 58);
    ctx.textAlign = 'left';
  }
}

function wrapText(text, x, y, maxW, lh) {
  const words = String(text).split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w; yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

// ---------- overlays ----------
function drawBoot() {
  ctx.fillStyle = '#060a10';
  ctx.fillRect(0, 0, VW, VH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6fd3ff';
  ctx.font = 'bold 34px monospace';
  ctx.fillText('U.S. ROBOTIC ARMY', VW / 2, VH * 0.3);
  ctx.fillStyle = '#e8eef4';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('REPO PROTOCOL 02 — "I FOUGHT THE LAW"', VW / 2, VH * 0.3 + 36);
  ctx.fillStyle = '#9aa5b1';
  ctx.font = '14px monospace';
  const lines = [
    'SYSTEM BOOT ............ OK',
    'FIELD FOOTAGE DECODE ... 53/53 SCENES',
    'IMAGE INTEL DECODE ..... V-vs-VI SPEC SHEET',
    'SPONSOR DECODE ......... ' + BRAND + ' (5/5 SCENES)',
    'MISSION SYNTHESIS ...... COMPLETE',
  ];
  const shown = clamp(Math.floor(G.phaseTime * 2.5) + 1, 1, lines.length);
  for (let i = 0; i < shown; i++) ctx.fillText(lines[i], VW / 2, VH * 0.46 + i * 24);
  if (G.phaseTime > 1.6 && Math.floor(G.time * 2) % 2 === 0) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('[ PRESS E / ENTER TO ENGAGE ]', VW / 2, VH * 0.72);
  }
  ctx.fillStyle = '#6d7885';
  ctx.font = '13px monospace';
  ctx.fillText(`a ${CREATOR} production · sponsored in-world by ${BRAND}`, VW / 2, VH * 0.86);
  ctx.textAlign = 'left';
}

function drawIntel() {
  ctx.fillStyle = '#060a10';
  ctx.fillRect(0, 0, VW, VH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('DECODED INTEL — ENGINE GENERATIONS', VW / 2, 64);
  const colW = Math.min(360, VW / 2 - 40);
  const cy = 110;
  const draw = (cx, color, title, rows) => {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(cx - colW / 2, cy, colW, 210);
    ctx.strokeStyle = color;
    ctx.strokeRect(cx - colW / 2, cy, colW, 210);
    ctx.fillStyle = color;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(title, cx, cy + 32);
    ctx.fillStyle = '#e8eef4';
    ctx.font = '13px monospace';
    rows.forEach((r, i) => ctx.fillText(r, cx, cy + 64 + i * 24));
  };
  draw(VW / 2 - colW / 2 - 20, '#7be382', 'EPOCH V (2013-2018)', [
    'BUDGET: $265,000,000',
    'BUILD TIME: 5 YEARS',
    'ERA: LOS SANTOS DAYLIGHT',
    'STATUS: LEGEND',
  ]);
  draw(VW / 2 + colW / 2 + 20, '#f27ad1', 'EPOCH VI (2023-2026)', [
    'BUDGET: $2,000,000,000',
    'BUILD TIME: 13 YEARS',
    'ADVANCED TRAFFIC AI',
    'DYNAMIC WORLD EVENTS',
  ]);
  ctx.fillStyle = '#9aa5b1';
  ctx.font = '13px monospace';
  ctx.fillText('This mission runs decoded VI-spec systems: smart traffic, live events, day-to-sunset lighting.', VW / 2, cy + 250);
  if (Math.floor(G.time * 2) % 2 === 0) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[ PRESS E / ENTER TO DEPLOY ]', VW / 2, cy + 300);
  }
  ctx.textAlign = 'left';
}

function drawPassed() {
  ctx.fillStyle = 'rgba(4,6,10,0.78)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('MISSION PASSED', VW / 2, VH * 0.36);
  ctx.fillStyle = '#e8eef4';
  ctx.font = '16px monospace';
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const jars = JARS.filter(j => j.taken).length;
  const rows = [
    `MISSION TIME  ${mmss(Math.max(0, G.stats.t1 - G.stats.t0))}`,
    `TOP SPEED     ${Math.round(G.stats.top / 4.4)} MPH`,
    `COLLISIONS    ${G.stats.hits}`,
    `${BRAND} JARS  ${jars}/${JARS.length}`,
    `STARLET FARE  ${G.stats.fareRescued ? 'RESCUED' : 'MISSED'}`,
    `MODS          ${G.stats.modsUsed ? 'USED' : 'CLEAN RUN'}`,
    '',
    'NEXT CONTRACT DECODED: Z-TYPE // LOCKUP // HAWICK',
  ];
  rows.forEach((r, i) => ctx.fillText(r, VW / 2, VH * 0.36 + 44 + i * 26));
  ctx.fillStyle = '#9aa5b1';
  ctx.fillText('[R] replay protocol', VW / 2, VH * 0.36 + 44 + rows.length * 26 + 20);
  ctx.fillStyle = '#6d7885';
  ctx.fillText(`a ${CREATOR} production`, VW / 2, VH * 0.36 + 44 + rows.length * 26 + 46);
  ctx.textAlign = 'left';
}

function drawFailed() {
  ctx.fillStyle = 'rgba(30,4,8,0.8)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5d5d';
  ctx.font = 'bold 44px monospace';
  ctx.fillText('PROTOCOL FAILED', VW / 2, VH * 0.42);
  ctx.fillStyle = '#e8eef4';
  ctx.font = '16px monospace';
  ctx.fillText(G.failReason, VW / 2, VH * 0.42 + 40);
  ctx.fillStyle = '#9aa5b1';
  ctx.fillText('[R / E] restore from checkpoint', VW / 2, VH * 0.42 + 76);
  ctx.textAlign = 'left';
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  update(dt);

  ctx.save();
  if (G.shake > 0.5) ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
  if (G.phase === PHASE.BOOT) drawBoot();
  else if (G.phase === PHASE.INTEL) drawIntel();
  else {
    drawWorld();
    drawHUD();
    if (G.phase === PHASE.PASSED) drawPassed();
    if (G.phase === PHASE.FAILED) drawFailed();
  }
  ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- debug / test hooks ----------
window.__ra = {
  G, PHASE, enterPhase, update, MODS, FORGE, OUTFITS,
  toggleMod, applyForge, cycleOutfit,
  teleport(x, y) { const p = G.player; p.x = x; p.y = y; p.px = x; p.py = y; p.speed = 0; },
  walkTo(x, y) { G.walker.x = x; G.walker.y = y; },
  pressE() { pressed.KeyE = true; },
  press(code) { pressed[code] = true; },
  setKey(code, down) { keys[code] = !!down; },
  step(dt) { update(dt || 1 / 60); },
};

})();
