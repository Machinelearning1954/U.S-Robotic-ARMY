// U.S. Robotic ARMY — Tactical Recon
// A small RTS-style game whose battlefield is a 3D point-cloud map produced by
// LingBot-Map (https://github.com/robbyant/lingbot-map) via the exporter in
// lingbot_map_integration/. Maps are plain JSON ("usra-map-v1"); a bundled
// procedural map ships with the repo so the game runs with no GPU pipeline.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---------------------------------------------------------------- map loading

async function loadMap() {
  const params = new URLSearchParams(location.search);
  const name = params.get('map');
  if (name && location.protocol.startsWith('http')) {
    const res = await fetch(`maps/${encodeURIComponent(name)}.json`);
    if (!res.ok) throw new Error(`map ${name} not found (${res.status})`);
    return res.json();
  }
  if (window.EMBEDDED_MAP) return window.EMBEDDED_MAP;
  throw new Error('no map available');
}

class HeightField {
  constructor(grid) { this.g = grid; }
  at(x, z) {
    const { nx, nz, minX, minZ, cell, heights } = this.g;
    const fx = Math.min(Math.max((x - minX) / cell, 0), nx - 1.001);
    const fz = Math.min(Math.max((z - minZ) / cell, 0), nz - 1.001);
    const ix = Math.floor(fx), iz = Math.floor(fz);
    const tx = fx - ix, tz = fz - iz;
    const h = (i, k) => heights[k * nx + i];
    const a = h(ix, iz) * (1 - tx) + h(ix + 1, iz) * tx;
    const b = h(ix, iz + 1) * (1 - tx) + h(ix + 1, iz + 1) * tx;
    return a * (1 - tz) + b * tz;
  }
}

// ------------------------------------------------------------- tripo3d assets
// Custom 3D models (e.g. generated on https://studio.tripo3d.ai or via
// tripo_integration/generate_asset.py) are loaded from game/models/ per
// models/manifest.json. Any missing/failed model falls back to the built-in
// procedural mesh, so the game always runs.

const assets = { unit: null, drone: null, objective: null };

async function loadAssets() {
  if (!location.protocol.startsWith('http')) return; // GLB fetch needs a server
  let manifest;
  try {
    const res = await fetch('models/manifest.json');
    if (!res.ok) return;
    manifest = await res.json();
  } catch { return; }
  const loader = new GLTFLoader();
  await Promise.all(Object.entries(manifest.models || {}).map(async ([role, cfg]) => {
    if (!cfg || !cfg.file || !(role in assets)) return;
    try {
      const gltf = await loader.loadAsync(`models/${cfg.file}`);
      assets[role] = { scene: gltf.scene, cfg };
      console.info(`loaded ${role} model: models/${cfg.file}`);
    } catch (e) {
      console.warn(`model for "${role}" (${cfg.file}) failed to load — using built-in mesh`, e);
    }
  }));
}

// Clone a loaded asset, scaled to targetSize (largest dimension, meters) and
// resting on y=0. Returns null when no asset is available for the role.
function instantiateAsset(role, targetSize) {
  const a = assets[role];
  if (!a) return null;
  const obj = a.scene.clone(true);
  obj.rotation.y = ((a.cfg.rotateY || 0) * Math.PI) / 180;
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const s = ((a.cfg.scale || 1) * targetSize) / Math.max(size.x, size.y, size.z, 1e-6);
  obj.scale.setScalar(s);
  box.setFromObject(obj);
  obj.position.y = -box.min.y + (a.cfg.yOffset || 0);
  const g = new THREE.Group();
  g.add(obj);
  return g;
}

// ------------------------------------------------------------------ constants

const UNIT_SPEED = 6.5;        // m/s
const UNIT_RANGE = 14;         // weapon range, m
const UNIT_DPS = 28;
const UNIT_HP = 100;
const DRONE_SPEED = 4.2;
const DRONE_RANGE = 9;
const DRONE_DPS = 12;
const DRONE_HP = 45;
const CAPTURE_RADIUS = 6;
const CAPTURE_TIME = 5;        // seconds a unit must hold a zone
const DRONE_WAVE_EVERY = 22;   // seconds

// --------------------------------------------------------------------- scene

const map = await loadMap().catch(err => {
  document.getElementById('loading').textContent = 'Failed to load map: ' + err.message;
  throw err;
});
document.getElementById('mapsource').textContent =
  `map: ${map.name} (${map.source === 'lingbot-map' ? 'LingBot-Map reconstruction' : map.source})`;

const heightField = new HeightField(map.heightGrid);
const groundY = (x, z) => heightField.at(x, z);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e0a);
scene.fog = new THREE.Fog(0x0b0e0a, 70, 160);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 42, -70);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 8;
controls.maxDistance = 130;
controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: null };
controls.target.set(0, 0, -20);

scene.add(new THREE.HemisphereLight(0xbfd4c9, 0x1a2014, 1.1));
const sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
sun.position.set(30, 60, -20);
scene.add(sun);

// Point-cloud battlefield
{
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(map.positions, 3));
  // sRGB → linear so vertex colors survive three's output color transform
  const cols = new Float32Array(map.colors.length);
  for (let i = 0; i < map.colors.length; i++) cols[i] = Math.pow(map.colors[i] / 255, 2.2);
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const mat = new THREE.PointsMaterial({ size: 0.55, vertexColors: true, sizeAttenuation: true });
  scene.add(new THREE.Points(geo, mat));
}

// Recon flight path from the reconstruction's camera trajectory
if (map.cameraPath && map.cameraPath.length > 1) {
  const pts = map.cameraPath.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x3f6fa8, transparent: true, opacity: 0.5 }));
  scene.add(line);
}

// Invisible ground plane used only for raycasting move orders; y adjusted per hit
const pickPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ visible: false })
);
scene.add(pickPlane);

// --------------------------------------------------------------------- units

function selectionRing() {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.7, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x9fd08a, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  ring.position.y = 0.06;
  ring.visible = false;
  return ring;
}

function makeUnitMesh(color) {
  const custom = instantiateAsset('unit', 2.6);
  if (custom) {
    const ring = selectionRing();
    custom.add(ring);
    custom.userData.ring = ring;
    return custom;
  }
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 2.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.4 }));
  body.position.y = 0.7;
  const turret = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x2e3b2a, roughness: 0.5, metalness: 0.5 }));
  turret.position.y = 1.3;
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 1.6, 8).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.7 }));
  barrel.position.set(0, 1.3, 1.0);
  const ring = selectionRing();
  g.add(body, turret, barrel, ring);
  g.userData.ring = ring;
  return g;
}

function makeDroneMesh() {
  const custom = instantiateAsset('drone', 1.5);
  if (custom) return custom;
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7),
    new THREE.MeshStandardMaterial({ color: 0x8a2f2f, roughness: 0.4, metalness: 0.5, emissive: 0x511, emissiveIntensity: 0.6 }));
  g.add(core);
  return g;
}

function makeObjectiveMesh() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(CAPTURE_RADIUS - 0.4, CAPTURE_RADIUS, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xc8a24a, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  ring.position.y = 0.1;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 14, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xc8a24a, transparent: true, opacity: 0.35 }));
  beam.position.y = 7;
  g.add(ring, beam);
  const prop = instantiateAsset('objective', 3.5);
  if (prop) g.add(prop);
  g.userData = { ring, beam };
  return g;
}

await loadAssets();

const units = [];   // player robots
const drones = [];  // hostiles
const objectives = [];
const lasers = [];

const UNIT_NAMES = ['ATLAS-1', 'BULWARK-2', 'CENTURION-3', 'DAGGER-4'];
(map.spawns.player || []).slice(0, 4).forEach(([x, z], i) => {
  const mesh = makeUnitMesh(0x4a6b3f);
  mesh.position.set(x, groundY(x, z), z);
  scene.add(mesh);
  units.push({ name: UNIT_NAMES[i] || `UNIT-${i + 1}`, mesh, hp: UNIT_HP, target: null, cooldown: 0 });
});

(map.spawns.objectives || []).forEach(([x, z], i) => {
  const mesh = makeObjectiveMesh();
  mesh.position.set(x, groundY(x, z), z);
  scene.add(mesh);
  objectives.push({ id: i + 1, mesh, progress: 0, captured: false });
});

function spawnDroneWave(count) {
  const spawns = map.spawns.enemy || [[0, 30]];
  for (let i = 0; i < count; i++) {
    const [sx, sz] = spawns[Math.floor(Math.random() * spawns.length)];
    const x = sx + (Math.random() - 0.5) * 6;
    const z = sz + (Math.random() - 0.5) * 6;
    const mesh = makeDroneMesh();
    mesh.position.set(x, groundY(x, z) + 3.2, z);
    scene.add(mesh);
    drones.push({ mesh, hp: DRONE_HP, cooldown: 0, bob: Math.random() * Math.PI * 2 });
  }
}
spawnDroneWave(3);

function fireLaser(from, to, color) {
  const geo = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1 }));
  scene.add(line);
  lasers.push({ line, ttl: 0.12 });
}

// ------------------------------------------------------------------ controls

let selected = null;
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function pick(ev) {
  mouse.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
}

function select(u) {
  if (selected) selected.mesh.userData.ring.visible = false;
  selected = u;
  if (u) u.mesh.userData.ring.visible = true;
}

renderer.domElement.addEventListener('pointerdown', ev => {
  if (gameOver) return;
  pick(ev);
  if (ev.button === 0) {
    const hits = ray.intersectObjects(units.map(u => u.mesh), true);
    if (hits.length) {
      let obj = hits[0].object;
      while (obj.parent && !units.some(u => u.mesh === obj)) obj = obj.parent;
      select(units.find(u => u.mesh === obj) || null);
    } else select(null);
  } else if (ev.button === 2 && selected) {
    const hit = ray.intersectObject(pickPlane)[0];
    if (hit) {
      // Project the flat-plane hit onto the terrain heightfield
      selected.target = new THREE.Vector3(hit.point.x, 0, hit.point.z);
    }
  }
});
renderer.domElement.addEventListener('contextmenu', ev => ev.preventDefault());

let flyover = null;
addEventListener('keydown', ev => {
  const idx = ['1', '2', '3', '4'].indexOf(ev.key);
  if (idx >= 0 && units[idx]) select(units[idx]);
  if (ev.key === ' ' && map.cameraPath && map.cameraPath.length > 3 && !flyover) {
    flyover = { t: 0 };
  }
});

// ----------------------------------------------------------------------- HUD

const unitpanel = document.getElementById('unitpanel');
const objhud = document.getElementById('objhud');
const msg = document.getElementById('msg');
let gameOver = false;

function updateHud() {
  const cap = objectives.filter(o => o.captured).length;
  objhud.textContent = `Objectives: ${cap} / ${objectives.length} · Units: ${units.length} · Hostiles: ${drones.length}`;
  if (selected) {
    unitpanel.innerHTML = `<b>${selected.name}</b><br>` +
      `Integrity: <span class="hp">${Math.max(0, Math.round(selected.hp))}%</span><br>` +
      (selected.target ? 'Status: moving' : 'Status: holding');
  } else {
    unitpanel.textContent = units.length ? 'No unit selected — left-click a robot or press 1–4' : '—';
  }
}

function endGame(win) {
  gameOver = true;
  msg.style.display = 'block';
  msg.innerHTML = win
    ? 'AREA SECURED<small>All objectives captured. Reload the page to redeploy.</small>'
    : 'SQUAD LOST<small>All units destroyed. Reload the page to redeploy.</small>';
}

// ----------------------------------------------------------------- game loop

const clock = new THREE.Clock();
let droneTimer = DRONE_WAVE_EVERY;
const tmp = new THREE.Vector3();

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);

  // Units: movement + combat
  for (const u of units) {
    u.cooldown -= dt;
    if (u.target) {
      tmp.set(u.target.x - u.mesh.position.x, 0, u.target.z - u.mesh.position.z);
      const d = tmp.length();
      if (d < 0.3) u.target = null;
      else {
        tmp.normalize().multiplyScalar(Math.min(UNIT_SPEED * dt, d));
        u.mesh.position.x += tmp.x;
        u.mesh.position.z += tmp.z;
        u.mesh.rotation.y = Math.atan2(tmp.x, tmp.z);
      }
    }
    u.mesh.position.y = groundY(u.mesh.position.x, u.mesh.position.z);

    // auto-engage nearest drone in range
    let best = null, bestD = UNIT_RANGE;
    for (const dr of drones) {
      const d = u.mesh.position.distanceTo(dr.mesh.position);
      if (d < bestD) { bestD = d; best = dr; }
    }
    if (best && u.cooldown <= 0) {
      u.cooldown = 0.35;
      best.hp -= UNIT_DPS * 0.35;
      const muzzle = u.mesh.position.clone().add(new THREE.Vector3(0, 1.3, 0));
      fireLaser(muzzle, best.mesh.position, 0x9fff6a);
    }
  }

  // Drones: seek nearest unit, bob, attack
  for (const dr of drones) {
    dr.cooldown -= dt;
    dr.bob += dt * 3;
    let best = null, bestD = Infinity;
    for (const u of units) {
      const d = dr.mesh.position.distanceTo(u.mesh.position);
      if (d < bestD) { bestD = d; best = u; }
    }
    if (best) {
      if (bestD > DRONE_RANGE * 0.8) {
        tmp.copy(best.mesh.position).sub(dr.mesh.position).setY(0).normalize().multiplyScalar(DRONE_SPEED * dt);
        dr.mesh.position.add(tmp);
      }
      if (bestD < DRONE_RANGE && dr.cooldown <= 0) {
        dr.cooldown = 0.6;
        best.hp -= DRONE_DPS * 0.6;
        fireLaser(dr.mesh.position, best.mesh.position.clone().add(new THREE.Vector3(0, 0.9, 0)), 0xff5a4a);
      }
    }
    const g = groundY(dr.mesh.position.x, dr.mesh.position.z);
    dr.mesh.position.y = g + 3.2 + Math.sin(dr.bob) * 0.35;
    dr.mesh.rotation.y += dt * 1.5;
  }

  // Deaths
  for (let i = drones.length - 1; i >= 0; i--) {
    if (drones[i].hp <= 0) { scene.remove(drones[i].mesh); drones.splice(i, 1); }
  }
  for (let i = units.length - 1; i >= 0; i--) {
    if (units[i].hp <= 0) {
      if (selected === units[i]) select(null);
      scene.remove(units[i].mesh);
      units.splice(i, 1);
    }
  }

  // Objectives: capture when a unit stands inside and no drone contests
  for (const o of objectives) {
    if (o.captured) continue;
    const held = units.some(u => u.mesh.position.distanceTo(o.mesh.position) < CAPTURE_RADIUS);
    const contested = drones.some(d => d.mesh.position.distanceTo(o.mesh.position) < CAPTURE_RADIUS);
    if (held && !contested) o.progress += dt;
    else o.progress = Math.max(0, o.progress - dt * 0.5);
    const t = Math.min(o.progress / CAPTURE_TIME, 1);
    o.mesh.userData.ring.material.color.setHSL(0.25 * t + 0.1, 0.6, 0.55);
    if (t >= 1) {
      o.captured = true;
      o.mesh.userData.ring.material.color.set(0x6adf6a);
      o.mesh.userData.beam.material.color.set(0x6adf6a);
    }
  }

  // Laser fade
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].ttl -= dt;
    lasers[i].line.material.opacity = Math.max(0, lasers[i].ttl / 0.12);
    if (lasers[i].ttl <= 0) { scene.remove(lasers[i].line); lasers.splice(i, 1); }
  }

  // Waves
  if (!gameOver) {
    droneTimer -= dt;
    if (droneTimer <= 0) {
      droneTimer = DRONE_WAVE_EVERY;
      spawnDroneWave(2 + objectives.filter(o => o.captured).length);
    }
  }

  // Recon flyover along the LingBot-Map camera path
  if (flyover) {
    flyover.t += dt / 14;
    const path = map.cameraPath;
    if (flyover.t >= 1) flyover = null;
    else {
      const f = flyover.t * (path.length - 1);
      const i = Math.floor(f), k = Math.min(i + 1, path.length - 1), s = f - i;
      const p = path[i], q = path[k];
      camera.position.set(
        p[0] + (q[0] - p[0]) * s,
        p[1] + (q[1] - p[1]) * s + 2,
        p[2] + (q[2] - p[2]) * s);
      const look = path[Math.min(k + 2, path.length - 1)];
      controls.target.set(look[0], look[1], look[2]);
    }
  }

  // Win/lose
  if (!gameOver) {
    if (objectives.length && objectives.every(o => o.captured)) endGame(true);
    else if (!units.length) endGame(false);
  }

  updateHud();
  controls.update();
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Debug/test handle
window.__game = { units, drones, objectives, map, select, assets };

document.getElementById('loading').remove();
tick();
