// Procedural robot meshes — fallbacks used when no Tripo3D GLB is present for
// a slot, so the game always has something to render. Each builder returns a
// group whose feet are at y=0, matching the normalized AI models.
import * as THREE from 'three';

const armorMat = new THREE.MeshStandardMaterial({ color: 0x5c6e57, roughness: 0.6, metalness: 0.25 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a4046, roughness: 0.55, metalness: 0.3 });
const visorMat = new THREE.MeshStandardMaterial({
  color: 0x22ff88, emissive: 0x1aff77, emissiveIntensity: 1.6, roughness: 0.3,
});
const hostileVisorMat = new THREE.MeshStandardMaterial({
  color: 0xff3322, emissive: 0xff2211, emissiveIntensity: 1.8, roughness: 0.3,
});
const hostileArmorMat = new THREE.MeshStandardMaterial({ color: 0x6e5050, roughness: 0.6, metalness: 0.25 });

function shadowed(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Bipedal US Army mech (~3.2 m). Exposes named parts for walk animation.
export function buildPlayerMech() {
  const g = new THREE.Group();

  const torso = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.8), armorMat));
  torso.position.y = 2.0;
  g.add(torso);

  const chest = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.5), darkMat));
  chest.position.set(0, 2.1, 0.45);
  g.add(chest);

  const head = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), darkMat));
  head.position.y = 2.85;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.06), visorMat);
  visor.position.set(0, 0.02, 0.29);
  head.add(visor);
  g.add(head);

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.42, 1.45, 0);
    const thigh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.75, 0.4), armorMat));
    thigh.position.y = -0.35;
    const shin = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.32), darkMat));
    shin.position.y = -1.05;
    const foot = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.6), darkMat));
    foot.position.set(0, -1.42, 0.1);
    hip.add(thigh, shin, foot);
    g.add(hip);
    legs.push(hip);
  }

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.85, 2.35, 0);
    const pad = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.5), armorMat));
    const arm = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.3), darkMat));
    arm.position.y = -0.6;
    shoulder.add(pad, arm);
    g.add(shoulder);
    arms.push(shoulder);
  }

  // right-arm pulse cannon; muzzle marks where shots originate
  const cannon = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.1, 10), darkMat));
  cannon.rotation.x = Math.PI / 2;
  cannon.position.set(0, -0.95, 0.45);
  arms[1].add(cannon);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, -0.95, 1.05);
  arms[1].add(muzzle);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), darkMat);
  antenna.position.set(0.2, 3.3, 0);
  g.add(antenna);

  g.userData.animParts = { legs, arms, torso, head };
  g.userData.muzzle = muzzle;
  return g;
}

// Hovering attack drone (~1.6 m across), hostile fallback.
export function buildDrone() {
  const g = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), hostileArmorMat));
  body.scale.set(1, 0.6, 1);
  body.position.y = 0.8;
  g.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), hostileVisorMat);
  eye.position.set(0, 0.8, 0.42);
  g.add(eye);
  const ringGeo = new THREE.TorusGeometry(0.75, 0.06, 8, 20);
  const ring = shadowed(new THREE.Mesh(ringGeo, darkMat));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.8;
  g.add(ring);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.08), darkMat);
    rotor.position.set(Math.cos(a) * 0.75, 0.86, Math.sin(a) * 0.75);
    g.add(rotor);
    (g.userData.rotors ??= []).push(rotor);
  }
  return g;
}

// Quad walker tank (~3.6 m), heavier hostile fallback.
export function buildWalker() {
  const g = new THREE.Group();
  const hull = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 2.8), hostileArmorMat));
  hull.position.y = 1.9;
  g.add(hull);
  const turret = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.6, 8), darkMat));
  turret.position.y = 2.7;
  g.add(turret);
  const barrel = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 8), darkMat));
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 2.75, 1.4);
  g.add(barrel);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.08), hostileVisorMat);
  eye.position.set(0, 2.0, 1.45);
  g.add(eye);
  const legs = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 1.05, 1.7, sz * 1.1);
    const upper = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 1.1), darkMat));
    upper.rotation.z = sx * 0.55;
    upper.position.x = sx * 0.4;
    const lower = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.24), hostileArmorMat));
    lower.position.set(sx * 0.85, -0.75, 0);
    leg.add(upper, lower);
    g.add(leg);
    legs.push(leg);
  }
  g.userData.animParts = { legs };
  return g;
}
