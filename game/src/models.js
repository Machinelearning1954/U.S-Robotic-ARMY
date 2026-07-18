// Asset pipeline for AI-generated 3D models (Tripo3D Studio).
//
// Tripo3D (https://studio.tripo3d.ai) turns text prompts or photos of real
// hardware into game-ready meshes. Export any model as GLB, drop it into
// game/assets/models/, list it in manifest.json, and this loader picks it up.
// When a slot has no GLB, the game falls back to a built-in procedural mesh,
// so the game is fully playable with zero downloaded assets.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Slot name -> desired height in meters once placed in the world.
export const MODEL_SLOTS = {
  player: { height: 3.2 },
  enemy_drone: { height: 1.6 },
  enemy_walker: { height: 3.6 },
};

const loader = new GLTFLoader();
const cache = new Map();   // slot -> THREE.Group (normalized template)

async function fetchManifest() {
  try {
    const res = await fetch('assets/models/manifest.json', { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// Scale and center a loaded scene so its feet sit at y=0 and it stands
// `targetHeight` tall regardless of how the generator exported it.
function normalize(sceneRoot, targetHeight) {
  const box = new THREE.Box3().setFromObject(sceneRoot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.001);
  const wrapper = new THREE.Group();
  sceneRoot.scale.setScalar(scale);
  box.setFromObject(sceneRoot);
  const center = new THREE.Vector3();
  box.getCenter(center);
  sceneRoot.position.x -= center.x;
  sceneRoot.position.z -= center.z;
  sceneRoot.position.y -= box.min.y;
  sceneRoot.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  wrapper.add(sceneRoot);
  return wrapper;
}

// Load every GLB referenced by the manifest. Resolves with the set of slot
// names that loaded successfully; failures just fall back silently.
export async function loadTripoModels(onProgress) {
  const manifest = await fetchManifest();
  const loaded = [];
  for (const [slot, spec] of Object.entries(MODEL_SLOTS)) {
    const file = manifest[slot];
    if (!file) continue;
    try {
      const gltf = await loader.loadAsync(`assets/models/${file}`);
      cache.set(slot, normalize(gltf.scene, spec.height));
      loaded.push(slot);
      onProgress?.(`loaded AI model: ${slot} (${file})`);
    } catch (err) {
      console.warn(`Tripo model "${slot}" failed to load (${file}); using procedural fallback.`, err);
    }
  }
  return loaded;
}

// Returns a fresh instance for a slot, or null if no AI model was loaded
// (caller should then build its procedural fallback).
export function instantiateModel(slot) {
  const template = cache.get(slot);
  return template ? template.clone(true) : null;
}
