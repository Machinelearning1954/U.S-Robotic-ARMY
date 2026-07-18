// Real-world environment: atmospheric sky, sun, rolling terrain, buildings and
// vegetation. The terrain height function is shared so gameplay code can clamp
// units to the ground.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export const WORLD_SIZE = 900;          // playable square, centered on origin
const TERRAIN_SEGMENTS = 160;

// --- deterministic value noise (no external deps) -------------------------
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
function smooth(t) { return t * t * (3 - 2 * t); }
function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi), b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  let value = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 5; i++) {
    value += amp * valueNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return value;
}

// Ground elevation at any world (x, z). Flattened near the origin so the
// base/combat area stays walkable.
export function terrainHeight(x, z) {
  const d = Math.sqrt(x * x + z * z);
  const flatten = smooth(Math.min(1, Math.max(0, (d - 60) / 220)));
  const hills = fbm(x * 0.008 + 10, z * 0.008 + 10) * 26 - 8;
  const detail = fbm(x * 0.05, z * 0.05) * 1.6;
  return (hills * flatten) + detail * 0.6;
}

// --- procedural ground texture (grass/dirt blend) -------------------------
function makeGroundTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4a5d33';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const g = 70 + Math.random() * 60;
    ctx.fillStyle = `rgba(${g * 0.75 | 0}, ${g | 0}, ${g * 0.45 | 0}, 0.5)`;
    ctx.fillRect(x, y, 2, 2);
  }
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const b = 90 + Math.random() * 40;
    ctx.fillStyle = `rgba(${b | 0}, ${b * 0.8 | 0}, ${b * 0.55 | 0}, 0.35)`;
    ctx.fillRect(x, y, 3, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(48, 48);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBuildingTexture() {
  const w = 128, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#6b6f74';
  ctx.fillRect(0, 0, w, h);
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 5; col++) {
      const lit = Math.random() < 0.35;
      ctx.fillStyle = lit ? '#ffe9a8' : '#2b3138';
      ctx.fillRect(10 + col * 23, 12 + row * 20, 14, 11);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildTerrain() {
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    map: makeGroundTexture(),
    roughness: 0.95,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function buildTree(scale) {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b4327, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6b2e, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 3, 6), trunkMat);
  trunk.position.y = 1.5;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 7), leafMat);
  crown.position.y = 5.5;
  trunk.castShadow = crown.castShadow = true;
  tree.add(trunk, crown);
  tree.scale.setScalar(scale);
  return tree;
}

function buildRock(scale) {
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7d7a72, roughness: 0.9 });
  const rock = new THREE.Mesh(geo, mat);
  rock.castShadow = rock.receiveShadow = true;
  rock.scale.set(scale, scale * 0.7, scale);
  rock.rotation.y = Math.random() * Math.PI;
  return rock;
}

function buildBuilding(tex) {
  const wCount = 1 + Math.floor(Math.random() * 2);
  const width = 8 + Math.random() * 8;
  const height = 14 + Math.random() * 26;
  const depth = 8 + Math.random() * 8;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.1 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x3c4046, roughness: 0.9 });
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geo, [mat, mat, capMat, capMat, mat, mat]);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.position.y = height / 2 - 0.2;
  const group = new THREE.Group();
  group.add(mesh);
  if (wCount > 1) {
    const annex = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, height * 0.5, depth * 0.6),
      [mat, mat, capMat, capMat, mat, mat]);
    annex.castShadow = annex.receiveShadow = true;
    annex.position.set(width * 0.7, height * 0.25, 0);
    group.add(annex);
  }
  return group;
}

// Scatter props on terrain, avoiding the central combat zone and each other.
function scatter(scene, count, minRadius, maxRadius, factory, obstacles, obstacleRadius) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = minRadius + Math.random() * (maxRadius - minRadius);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const obj = factory();
    obj.position.set(x, terrainHeight(x, z), z);
    obj.rotation.y = Math.random() * Math.PI * 2;
    scene.add(obj);
    if (obstacles && obstacleRadius) {
      obstacles.push({ x, z, radius: obstacleRadius });
    }
  }
}

export function createWorld(scene, renderer) {
  // atmosphere
  const sky = new Sky();
  sky.scale.setScalar(450000);
  const sunPosition = new THREE.Vector3();
  const elevation = 32, azimuth = 155;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);
  sunPosition.setFromSphericalCoords(1, phi, theta);
  const u = sky.material.uniforms;
  u.sunPosition.value.copy(sunPosition);
  u.turbidity.value = 6;
  u.rayleigh.value = 1.8;
  u.mieCoefficient.value = 0.006;
  u.mieDirectionalG.value = 0.8;
  scene.add(sky);
  scene.fog = new THREE.Fog(0xbfd4e0, 180, 720);

  // lights
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.6);
  sun.position.copy(sunPosition).multiplyScalar(300);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -120;
  sun.shadow.camera.right = sun.shadow.camera.top = 120;
  sun.shadow.camera.far = 800;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x3d4a2e, 1.2));

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.75;

  // ground + props
  scene.add(buildTerrain());

  const obstacles = [];   // {x, z, radius} — used for simple collision
  const buildingTex = makeBuildingTexture();
  scatter(scene, 26, 130, 380, () => buildBuilding(buildingTex), obstacles, 9);
  scatter(scene, 90, 70, 420, () => buildTree(0.8 + Math.random() * 1.4));
  scatter(scene, 40, 40, 420, () => buildRock(0.6 + Math.random() * 2.2), obstacles, 2);

  return { obstacles, sun, sunTarget: sun.target };
}
