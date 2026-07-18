// U.S. Robotic ARMY — Real World Ops
// Third-person 3D combat in a realistic outdoor environment, built on Three.js.
// AI-generated 3D models (Tripo3D Studio GLB exports) are loaded from
// assets/models/ via models.js; procedural meshes fill any missing slot.
import * as THREE from 'three';
import { createWorld, terrainHeight, WORLD_SIZE } from './world.js';
import { loadTripoModels, instantiateModel } from './models.js';
import { buildPlayerMech } from './robots.js';
import { EffectSystem } from './effects.js';
import { EnemyManager } from './enemies.js';
import { AudioEngine } from './audio.js';

// --- renderer / scene -----------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);

const { obstacles, sun } = createWorld(scene, renderer);
const audio = new AudioEngine();
audio.obstacles = obstacles;   // buildings/rocks used for sound occlusion
const effects = new EffectSystem(scene, audio);
const enemyManager = new EnemyManager(scene, effects, audio);

// --- HUD ------------------------------------------------------------------
const hud = {
  health: document.getElementById('healthfill'),
  wave: document.getElementById('wave'),
  score: document.getElementById('score'),
  feed: document.getElementById('feed'),
  overlay: document.getElementById('overlay'),
  startBtn: document.getElementById('startBtn'),
  loadnote: document.getElementById('loadnote'),
};
function feed(msg) {
  const line = document.createElement('div');
  line.textContent = msg;
  hud.feed.appendChild(line);
  while (hud.feed.children.length > 6) hud.feed.firstChild.remove();
  setTimeout(() => line.remove(), 4200);
}

// --- game state -----------------------------------------------------------
const state = {
  running: false,
  health: 100,
  score: 0,
  yaw: 0,
  pitch: -0.12,
  velocityY: 0,
  grounded: true,
  fireCooldown: 0,
  time: 0,
  gameOver: false,
};

const keys = new Set();

// --- player ---------------------------------------------------------------
let player = null;
function spawnPlayer() {
  player = instantiateModel('player') ?? buildPlayerMech();
  player.position.set(0, terrainHeight(0, 0), 0);
  scene.add(player);
}

enemyManager.onWave = (wave) => {
  hud.wave.textContent = wave;
  feed(`WAVE ${wave} INBOUND — hostiles detected`);
};
enemyManager.onKill = (points, typeName) => {
  state.score += points;
  hud.score.textContent = state.score;
  feed(typeName === 'walker' ? 'Walker destroyed (+3)' : 'Drone destroyed (+1)');
};

function damagePlayer(amount) {
  if (state.gameOver) return;
  state.health = Math.max(0, state.health - amount);
  hud.health.style.width = `${state.health}%`;
  hud.health.classList.toggle('low', state.health < 35);
  audio.hurt();
  if (state.health <= 0) endGame();
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  document.exitPointerLock?.();
  hud.overlay.classList.remove('hidden');
  hud.overlay.querySelector('h1').textContent = 'UNIT DESTROYED';
  hud.overlay.querySelector('h2').textContent =
    `FINAL SCORE ${state.score} — WAVE ${enemyManager.wave}`;
  hud.startBtn.textContent = 'Redeploy';
}

function resetGame() {
  state.health = 100;
  state.score = 0;
  state.gameOver = false;
  hud.overlay.querySelector('h1').textContent = 'U.S. Robotic ARMY';
  hud.overlay.querySelector('h2').textContent = 'REAL WORLD OPS — SECTOR 7 DEFENSE';
  hud.health.style.width = '100%';
  hud.health.classList.remove('low');
  hud.score.textContent = '0';
  hud.wave.textContent = '1';
  for (const e of enemyManager.enemies) {
    e.dispose();
    scene.remove(e.object);
  }
  enemyManager.enemies.length = 0;
  enemyManager.wave = 0;
  enemyManager.betweenWaves = 3;
  player.position.set(0, terrainHeight(0, 0), 0);
}

// --- input ----------------------------------------------------------------
document.addEventListener('keydown', (e) => keys.add(e.code));
document.addEventListener('keyup', (e) => keys.delete(e.code));

document.addEventListener('mousemove', (e) => {
  if (!state.running || document.pointerLockElement !== renderer.domElement) return;
  state.yaw -= e.movementX * 0.0024;
  state.pitch -= e.movementY * 0.0022;
  state.pitch = Math.max(-1.1, Math.min(0.55, state.pitch));
});

document.addEventListener('mousedown', () => {
  if (!state.running || document.pointerLockElement !== renderer.domElement) return;
  shoot();
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== renderer.domElement && state.running && !state.gameOver) {
    state.running = false;
    hud.overlay.classList.remove('hidden');
    hud.startBtn.textContent = 'Resume';
  }
});

hud.startBtn.addEventListener('click', () => {
  audio.start();   // audio context must be created inside a user gesture
  if (state.gameOver) resetGame();
  hud.overlay.classList.add('hidden');
  state.running = true;
  renderer.domElement.requestPointerLock();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- combat ---------------------------------------------------------------
const aimRay = new THREE.Raycaster();
function shoot() {
  if (state.fireCooldown > 0 || state.gameOver) return;
  state.fireCooldown = 0.18;
  audio.shoot();
  audio.haptics(0.25, 60);

  // fire from the mech's muzzle toward whatever the crosshair points at
  aimRay.setFromCamera(new THREE.Vector2(0, 0), camera);
  const target = aimRay.ray.origin.clone().addScaledVector(aimRay.ray.direction, 300);

  let origin;
  const muzzle = player.userData.muzzle;
  if (muzzle) {
    origin = new THREE.Vector3();
    muzzle.getWorldPosition(origin);
  } else {
    origin = player.position.clone().add(new THREE.Vector3(0, 2.2, 0));
  }
  const direction = target.sub(origin).normalize();
  effects.fireTracer(origin, direction, { hostile: false, speed: 170, damage: 12 });
}

// --- movement -------------------------------------------------------------
const WALK_SPEED = 10;
const SPRINT_SPEED = 17;
const GRAVITY = 30;
const JUMP_VELOCITY = 11;

function updatePlayer(dt) {
  const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
  const right = new THREE.Vector3(-forward.z, 0, forward.x);
  const move = new THREE.Vector3();
  if (keys.has('KeyW')) move.add(forward);
  if (keys.has('KeyS')) move.sub(forward);
  if (keys.has('KeyD')) move.add(right);
  if (keys.has('KeyA')) move.sub(right);
  const moving = move.lengthSq() > 0;
  if (moving) move.normalize();

  const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? SPRINT_SPEED : WALK_SPEED;
  const next = player.position.clone().addScaledVector(move, speed * dt);

  // keep inside the map and out of buildings/rocks
  const limit = WORLD_SIZE / 2 - 15;
  next.x = Math.max(-limit, Math.min(limit, next.x));
  next.z = Math.max(-limit, Math.min(limit, next.z));
  for (const ob of obstacles) {
    const dx = next.x - ob.x, dz = next.z - ob.z;
    const distSq = dx * dx + dz * dz;
    const minDist = ob.radius + 1.2;
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq) || 0.001;
      next.x = ob.x + (dx / dist) * minDist;
      next.z = ob.z + (dz / dist) * minDist;
    }
  }
  player.position.x = next.x;
  player.position.z = next.z;

  // gravity / jumping over terrain
  const ground = terrainHeight(player.position.x, player.position.z);
  if (keys.has('Space') && state.grounded) {
    state.velocityY = JUMP_VELOCITY;
    state.grounded = false;
  }
  state.velocityY -= GRAVITY * dt;
  player.position.y += state.velocityY * dt;
  if (player.position.y <= ground) {
    player.position.y = ground;
    state.velocityY = 0;
    state.grounded = true;
  }

  // face movement direction (aim direction while firing/idle)
  player.rotation.y = state.yaw + Math.PI;

  // walk cycle for the procedural mech
  const sprinting = speed === SPRINT_SPEED;
  const parts = player.userData.animParts;
  if (parts) {
    const swing = moving ? Math.sin(state.time * (sprinting ? 13 : 9)) * 0.55 : 0;
    parts.legs[0].rotation.x = swing;
    parts.legs[1].rotation.x = -swing;
    parts.arms[0].rotation.x = -swing * 0.6;
    parts.torso.position.y = 2.0 + (moving ? Math.abs(Math.sin(state.time * 9)) * 0.06 : 0);
  }

  // physics-keyed footstep Foley: one step per half stride while grounded
  if (moving && state.grounded) {
    state.stepTimer = (state.stepTimer ?? 0) - dt;
    if (state.stepTimer <= 0) {
      audio.footstep(sprinting);
      state.stepTimer = sprinting ? 0.24 : 0.35;
    }
  } else {
    state.stepTimer = 0;
  }
  state.speedNorm = moving ? (sprinting ? 1 : 0.6) : 0;
}

function updateCamera() {
  const back = new THREE.Vector3(
    Math.sin(state.yaw) * Math.cos(state.pitch),
    -Math.sin(state.pitch),
    Math.cos(state.yaw) * Math.cos(state.pitch),
  );
  const desired = player.position.clone()
    .add(new THREE.Vector3(0, 3.0, 0))
    .addScaledVector(back, 9);
  const groundAtCam = terrainHeight(desired.x, desired.z) + 0.6;
  if (desired.y < groundAtCam) desired.y = groundAtCam;
  camera.position.lerp(desired, 0.35);
  camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 2.4, 0)));

  // keep the shadow frustum centered on the action
  sun.position.set(player.position.x + 120, 300, player.position.z + 60);
  sun.target.position.copy(player.position);
  sun.target.updateMatrixWorld();
}

// --- projectile collisions ------------------------------------------------
const samplePoint = new THREE.Vector3();
function updateTracerHits() {
  for (let i = effects.tracers.length - 1; i >= 0; i--) {
    const t = effects.tracers[i];
    const p = t.mesh.position;
    // sweep the segment travelled this frame so fast shots can't tunnel
    // through a target between frames
    const from = t.prev ?? p;
    const steps = 4;
    let consumed = false;
    for (let s = 1; s <= steps && !consumed; s++) {
      samplePoint.lerpVectors(from, p, s / steps);
      if (t.hostile) {
        const dx = samplePoint.x - player.position.x;
        const dz = samplePoint.z - player.position.z;
        const dy = samplePoint.y - (player.position.y + 1.6);
        if (dx * dx + dz * dz < 1.44 && Math.abs(dy) < 1.9) {
          damagePlayer(t.damage);
          effects.impact(samplePoint.clone());
          effects.removeTracer(i);
          consumed = true;
        }
      } else if (enemyManager.tryHit(samplePoint, t.damage)) {
        effects.removeTracer(i);
        consumed = true;
      }
    }
    if (consumed) continue;
    if (p.y < terrainHeight(p.x, p.z)) {
      effects.impact(p.clone());
      effects.removeTracer(i);
    }
  }
}

// --- boot + main loop -----------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (state.running && !state.gameOver) {
    state.time += dt;
    state.fireCooldown -= dt;
    updatePlayer(dt);
    enemyManager.update(dt, player.position, state.time, damagePlayer);
    updateTracerHits();
    effects.update(dt);

    // adaptive score: combat intensity from hostile count and proximity
    let nearest = Infinity;
    for (const e of enemyManager.enemies) {
      nearest = Math.min(nearest, e.object.position.distanceTo(player.position));
    }
    const threat = enemyManager.enemies.length === 0 ? 0
      : Math.min(1, 0.35 + (1 - Math.min(nearest, 120) / 120) * 0.65);
    audio.update(dt, threat, state.speedNorm ?? 0);
  }
  if (player) {
    updateCamera();
    audio.setListener(camera, player.position);
  }
  renderer.render(scene, camera);
}

(async function boot() {
  hud.startBtn.disabled = true;
  hud.loadnote.textContent = 'scanning assets/models for AI-generated GLB models…';
  const loaded = await loadTripoModels((msg) => feed(msg));
  hud.loadnote.textContent = loaded.length
    ? `AI models active: ${loaded.join(', ')}`
    : 'no GLB models found — using built-in procedural robots (see assets/models/MODELS.md)';
  spawnPlayer();
  hud.startBtn.disabled = false;
  // exposed for debugging/automated smoke tests
  window.__game = { state, enemyManager, audio, getPlayer: () => player };
  animate();
})();
