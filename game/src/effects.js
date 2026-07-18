// Tracers, impact sparks and explosions. Sound is delegated to the
// spatial audio engine (audio.js).
import * as THREE from 'three';

// --- visual effects -------------------------------------------------------
export class EffectSystem {
  constructor(scene, audio) {
    this.scene = scene;
    this.audio = audio;
    this.tracers = [];       // {mesh, velocity, life, hostile, damage}
    this.particles = [];     // {mesh, velocity, life, gravity}
    this.tracerGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6);
    this.tracerGeo.rotateX(Math.PI / 2);
    this.friendlyMat = new THREE.MeshBasicMaterial({ color: 0x66ffbb });
    this.hostileMat = new THREE.MeshBasicMaterial({ color: 0xff5533 });
    this.sparkGeo = new THREE.SphereGeometry(0.08, 6, 5);
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffcc55 });
    this.fireMat = new THREE.MeshBasicMaterial({ color: 0xff7733 });
  }

  fireTracer(origin, direction, { hostile = false, speed = 150, damage = 10 } = {}) {
    const mesh = new THREE.Mesh(this.tracerGeo, hostile ? this.hostileMat : this.friendlyMat);
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(direction));
    this.scene.add(mesh);
    this.tracers.push({
      mesh,
      velocity: direction.clone().normalize().multiplyScalar(speed),
      life: 2.2,
      hostile,
      damage,
    });
  }

  burst(position, count, mat, power = 8) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sparkGeo, mat);
      mesh.position.copy(position);
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5), Math.random() * 0.9 + 0.1, (Math.random() - 0.5),
      ).normalize().multiplyScalar(power * (0.4 + Math.random() * 0.8));
      this.particles.push({ mesh, velocity, life: 0.5 + Math.random() * 0.5, gravity: 14 });
      this.scene.add(mesh);
    }
  }

  impact(position) { this.burst(position, 6, this.sparkMat, 7); }

  explosion(position) {
    this.burst(position, 22, this.fireMat, 12);
    this.burst(position, 10, this.sparkMat, 9);
    this.audio?.explosion(position);
  }

  update(dt) {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      // remember the previous position so collision checks can sweep the
      // full segment instead of tunneling through targets at high speed
      (t.prev ??= new THREE.Vector3()).copy(t.mesh.position);
      t.mesh.position.addScaledVector(t.velocity, dt);
      t.life -= dt;
      if (t.life <= 0) {
        this.scene.remove(t.mesh);
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.velocity.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.life -= dt;
      p.mesh.scale.setScalar(Math.max(p.life, 0.01));
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  removeTracer(index) {
    this.scene.remove(this.tracers[index].mesh);
    this.tracers.splice(index, 1);
  }
}
