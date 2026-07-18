// Hostile units: hover drones (fast, ram the player) and walkers (slow,
// ranged fire). Spawned in escalating waves around the player.
import * as THREE from 'three';
import { terrainHeight } from './world.js';
import { instantiateModel } from './models.js';
import { buildDrone, buildWalker } from './robots.js';

const TYPES = {
  drone: {
    slot: 'enemy_drone', fallback: buildDrone,
    hp: 20, speed: 9.5, hover: 2.6, score: 1,
    attackRange: 3.2, touchDamage: 12,
  },
  walker: {
    slot: 'enemy_walker', fallback: buildWalker,
    hp: 70, speed: 4.2, hover: 0, score: 3,
    attackRange: 55, fireInterval: 2.4, shotDamage: 8,
  },
};

class Enemy {
  constructor(typeName, position, audio) {
    this.typeName = typeName;
    this.spec = TYPES[typeName];
    this.hp = this.spec.hp;
    this.fireCooldown = 1 + Math.random() * 2;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.stepPhase = Math.random();
    this.audio = audio;
    this.object = instantiateModel(this.spec.slot) ?? this.spec.fallback();
    this.object.position.copy(position);
    this.radius = typeName === 'walker' ? 1.8 : 1.0;
    this.hitHeight = typeName === 'walker' ? 2.2 : this.spec.hover + 0.8;
    if (typeName === 'drone') {
      // persistent HRTF-positioned rotor sound with Doppler + occlusion
      this.sound = audio?.attachDrone(() => this.object.position);
    }
  }

  dispose() {
    this.sound?.dispose();
  }

  update(dt, playerPos, effects, time, onPlayerHit) {
    const pos = this.object.position;
    const toPlayer = new THREE.Vector3().subVectors(playerPos, pos);
    toPlayer.y = 0;
    const dist = toPlayer.length();
    toPlayer.normalize();

    this.object.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);

    if (this.typeName === 'drone') {
      pos.addScaledVector(toPlayer, this.spec.speed * dt);
      const ground = terrainHeight(pos.x, pos.z);
      this.bobPhase += dt * 6;
      pos.y = ground + this.spec.hover + Math.sin(this.bobPhase) * 0.25;
      for (const rotor of this.object.userData.rotors ?? []) {
        rotor.rotation.y += dt * 40;
      }
      if (dist < this.spec.attackRange) {
        // kamikaze detonation
        effects.explosion(pos.clone().setY(pos.y + 0.5));
        onPlayerHit(this.spec.touchDamage);
        this.hp = 0;
        this.selfDestructed = true;
      }
    } else {
      // walker: close to firing range, then shell the player
      const advancing = dist > this.spec.attackRange * 0.7;
      if (advancing) {
        pos.addScaledVector(toPlayer, this.spec.speed * dt);
        this.stepPhase += dt * 1.8;
        if (this.stepPhase >= 1) {
          this.stepPhase %= 1;
          this.audio?.walkerStep(pos);   // heavy positional footfall
        }
      }
      pos.y = terrainHeight(pos.x, pos.z);
      const legs = this.object.userData.animParts?.legs;
      if (legs) {
        for (let i = 0; i < legs.length; i++) {
          legs[i].rotation.x = Math.sin(time * 7 + i * Math.PI * 0.5) * 0.18;
        }
      }
      this.fireCooldown -= dt;
      if (dist < this.spec.attackRange && this.fireCooldown <= 0) {
        this.fireCooldown = this.spec.fireInterval;
        const muzzle = pos.clone().add(new THREE.Vector3(toPlayer.x, 0, toPlayer.z).multiplyScalar(1.6));
        muzzle.y = pos.y + 2.75;
        const aim = new THREE.Vector3().subVectors(
          playerPos.clone().setY(playerPos.y + 1.6), muzzle,
        ).normalize();
        effects.fireTracer(muzzle, aim, { hostile: true, speed: 65, damage: this.spec.shotDamage });
        this.audio?.enemyShoot(muzzle);
      }
    }
  }
}

export class EnemyManager {
  constructor(scene, effects, audio) {
    this.scene = scene;
    this.effects = effects;
    this.audio = audio;
    this.enemies = [];
    this.wave = 0;
    this.betweenWaves = 3;   // seconds until first wave
    this.onWave = null;      // callbacks assigned by main
    this.onKill = null;
  }

  spawnWave() {
    this.wave += 1;
    const drones = 3 + this.wave * 2;
    const walkers = Math.floor(this.wave / 2);
    const spawnOne = (typeName) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 90 + Math.random() * 60;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = terrainHeight(x, z) + (TYPES[typeName].hover || 0);
      const enemy = new Enemy(typeName, new THREE.Vector3(x, y, z), this.audio);
      this.scene.add(enemy.object);
      this.enemies.push(enemy);
    };
    for (let i = 0; i < drones; i++) spawnOne('drone');
    for (let i = 0; i < walkers; i++) spawnOne('walker');
    this.onWave?.(this.wave);
  }

  // Apply damage from a friendly tracer if it is inside an enemy's hull.
  // Returns true when the tracer should be consumed.
  tryHit(point, damage) {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      const dx = point.x - e.object.position.x;
      const dz = point.z - e.object.position.z;
      const dy = point.y - (e.object.position.y + e.hitHeight * 0.5);
      if (dx * dx + dz * dz < e.radius * e.radius && Math.abs(dy) < e.hitHeight) {
        e.hp -= damage;
        this.effects.impact(point);
        return true;
      }
    }
    return false;
  }

  update(dt, playerPos, time, onPlayerHit) {
    if (this.enemies.length === 0) {
      this.betweenWaves -= dt;
      if (this.betweenWaves <= 0) {
        this.spawnWave();
        this.betweenWaves = 6;
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, playerPos, this.effects, time, onPlayerHit);
      if (e.hp <= 0) {
        if (!e.selfDestructed) {
          this.effects.explosion(e.object.position.clone().setY(e.object.position.y + 1));
          this.onKill?.(e.spec.score, e.typeName);
        }
        e.dispose();
        this.scene.remove(e.object);
        this.enemies.splice(i, 1);
      }
    }
  }
}
