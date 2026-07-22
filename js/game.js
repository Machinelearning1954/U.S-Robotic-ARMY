/* =====================================================================
   U.S. Robotic Army — Reel Defense
   A self-contained HTML5 Canvas arcade defense game.
   Player commands a ground robot, holding the line against waves of
   enemy drones. The Instagram reel is embedded on the briefing and
   end screens (see index.html).
   ===================================================================== */
(function () {
  "use strict";

  // ---- Screen management -------------------------------------------------
  const screens = {
    start: document.getElementById("screen-start"),
    game: document.getElementById("screen-game"),
    end: document.getElementById("screen-end"),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    // Re-render Instagram embeds when a screen with a reel becomes visible.
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }

  // ---- Canvas ------------------------------------------------------------
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;   // logical 800
  const H = canvas.height;  // logical 600

  // ---- HUD elements ------------------------------------------------------
  const hudScore = document.getElementById("hud-score");
  const hudWave = document.getElementById("hud-wave");
  const hudLives = document.getElementById("hud-lives");
  const pauseOverlay = document.getElementById("pause-overlay");

  // ---- Game state --------------------------------------------------------
  const TOTAL_WAVES = 5;
  let state;

  function newState() {
    return {
      running: false,
      paused: false,
      over: false,
      score: 0,
      wave: 1,
      hull: 100,
      player: { x: W / 2, y: H - 50, w: 46, h: 30, speed: 6, cooldown: 0 },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      particles: [],
      stars: makeStars(60),
      spawnTimer: 0,
      waveEnemiesLeft: 0,
      waveCleared: false,
      waveBanner: 90, // frames to show the wave banner
    };
  }

  function makeStars(n) {
    const stars = [];
    // Deterministic-ish scatter (Math.random is fine at runtime in the browser).
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: Math.random() * 1.6 + 0.4,
        v: Math.random() * 0.5 + 0.2,
      });
    }
    return stars;
  }

  // ---- Input -------------------------------------------------------------
  const keys = {};
  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", " ", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;
    if (e.key === " ") keys[" "] = true;

    if ((e.key === "p" || e.key === "P") && state && state.running && !state.over) {
      togglePause();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === " ") keys[" "] = false;
  });

  // Basic touch controls: tap left/right half to move, always auto-fires.
  let touchDir = 0;
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    touchDir = x < 0.5 ? -1 : 1;
  });
  canvas.addEventListener("pointerup", () => (touchDir = 0));
  canvas.addEventListener("pointerleave", () => (touchDir = 0));

  function togglePause() {
    state.paused = !state.paused;
    pauseOverlay.classList.toggle("hidden", !state.paused);
  }

  // ---- Wave setup --------------------------------------------------------
  function startWave(n) {
    state.wave = n;
    state.waveEnemiesLeft = 4 + n * 3; // scales up each wave
    state.waveCleared = false;
    state.waveBanner = 90;
    state.spawnTimer = 0;
    hudWave.textContent = n;
  }

  function spawnEnemy() {
    const wave = state.wave;
    const size = 34;
    const x = Math.random() * (W - size * 2) + size;
    const hp = 1 + Math.floor(wave / 2);
    const speed = 0.6 + wave * 0.18 + Math.random() * 0.4;
    state.enemies.push({
      x,
      y: -size,
      w: size,
      h: size,
      hp,
      maxHp: hp,
      speed,
      // sinusoidal drift
      phase: Math.random() * Math.PI * 2,
      amp: 20 + Math.random() * 40,
      baseX: x,
      fireTimer: 60 + Math.random() * 120,
    });
  }

  // ---- Entity updates ----------------------------------------------------
  function update() {
    if (!state.running || state.paused || state.over) return;

    // Stars parallax
    for (const st of state.stars) {
      st.y += st.v;
      if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
    }

    const p = state.player;

    // Movement
    let dir = 0;
    if (keys["arrowleft"] || keys["a"]) dir -= 1;
    if (keys["arrowright"] || keys["d"]) dir += 1;
    dir += touchDir;
    p.x += dir * p.speed;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));

    // Firing (space, or auto-fire on touch)
    if (p.cooldown > 0) p.cooldown--;
    const wantFire = keys[" "] || touchDir !== 0;
    if (wantFire && p.cooldown === 0) {
      state.bullets.push({ x: p.x, y: p.y - p.h / 2, w: 4, h: 12, v: 10 });
      p.cooldown = 10;
    }

    // Player bullets
    for (const b of state.bullets) b.y -= b.v;
    state.bullets = state.bullets.filter((b) => b.y > -20);

    // Spawn enemies for this wave
    if (state.waveEnemiesLeft > 0) {
      state.spawnTimer--;
      if (state.spawnTimer <= 0) {
        spawnEnemy();
        state.waveEnemiesLeft--;
        state.spawnTimer = Math.max(24, 70 - state.wave * 6);
      }
    }

    // Enemies
    for (const e of state.enemies) {
      e.y += e.speed;
      e.phase += 0.03;
      e.x = e.baseX + Math.sin(e.phase) * e.amp;
      e.x = Math.max(e.w / 2, Math.min(W - e.w / 2, e.x));

      // Enemy fire
      e.fireTimer--;
      if (e.fireTimer <= 0 && e.y > 0 && e.y < H * 0.7) {
        state.enemyBullets.push({ x: e.x, y: e.y + e.h / 2, w: 5, h: 10, v: 3 + state.wave * 0.3 });
        e.fireTimer = 90 + Math.random() * 120;
      }

      // Enemy reaches the base line -> hull damage, enemy removed
      if (e.y - e.h / 2 > H - 16) {
        e.dead = true;
        damageHull(12);
        spawnExplosion(e.x, H - 20, "#ff9a3d");
      }
    }

    // Enemy bullets
    for (const eb of state.enemyBullets) eb.y += eb.v;
    state.enemyBullets = state.enemyBullets.filter((eb) => eb.y < H + 20);

    // Collisions: player bullets vs enemies
    for (const b of state.bullets) {
      for (const e of state.enemies) {
        if (e.dead) continue;
        if (rectHit(b, e)) {
          b.dead = true;
          e.hp--;
          spawnExplosion(b.x, b.y, "#35e06f", 4);
          if (e.hp <= 0) {
            e.dead = true;
            state.score += 10 * state.wave;
            spawnExplosion(e.x, e.y, "#f5c451", 14);
          }
          break;
        }
      }
    }

    // Collisions: enemy bullets vs player
    for (const eb of state.enemyBullets) {
      if (rectHit(eb, { x: p.x, y: p.y, w: p.w, h: p.h })) {
        eb.dead = true;
        damageHull(8);
        spawnExplosion(eb.x, eb.y, "#ff4d4d", 8);
      }
    }

    // Collisions: enemy body vs player
    for (const e of state.enemies) {
      if (!e.dead && rectHit({ x: e.x, y: e.y, w: e.w, h: e.h }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
        e.dead = true;
        damageHull(18);
        spawnExplosion(e.x, e.y, "#ff4d4d", 16);
      }
    }

    // Cleanup
    state.bullets = state.bullets.filter((b) => !b.dead);
    state.enemies = state.enemies.filter((e) => !e.dead);
    state.enemyBullets = state.enemyBullets.filter((eb) => !eb.dead);

    // Particles
    for (const pt of state.particles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
    }
    state.particles = state.particles.filter((pt) => pt.life > 0);

    // Wave complete?
    if (state.waveEnemiesLeft === 0 && state.enemies.length === 0 && !state.waveCleared) {
      state.waveCleared = true;
      if (state.wave >= TOTAL_WAVES) {
        endGame(true);
      } else {
        state.score += 50; // wave clear bonus
        startWave(state.wave + 1);
      }
    }

    if (state.waveBanner > 0) state.waveBanner--;

    // Sync HUD
    hudScore.textContent = state.score;
    hudLives.textContent = Math.max(0, Math.round(state.hull));
  }

  function damageHull(amount) {
    state.hull -= amount;
    if (state.hull <= 0) {
      state.hull = 0;
      endGame(false);
    }
  }

  function rectHit(a, b) {
    return (
      Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
      Math.abs(a.y - b.y) < (a.h + b.h) / 2
    );
  }

  function spawnExplosion(x, y, color, count) {
    count = count || 8;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3 + 1;
      state.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 20 + Math.random() * 20,
        color,
      });
    }
  }

  // ---- Rendering ---------------------------------------------------------
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "#2a3b32";
    for (const st of state.stars) {
      ctx.globalAlpha = 0.6;
      ctx.fillRect(st.x, st.y, st.s, st.s);
    }
    ctx.globalAlpha = 1;

    // Base line
    ctx.strokeStyle = "rgba(53,224,111,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 16);
    ctx.lineTo(W, H - 16);
    ctx.stroke();

    // Enemy bullets
    ctx.fillStyle = "#ff6b6b";
    for (const eb of state.enemyBullets) {
      ctx.fillRect(eb.x - eb.w / 2, eb.y - eb.h / 2, eb.w, eb.h);
    }

    // Player bullets
    ctx.fillStyle = "#9dffbe";
    for (const b of state.bullets) {
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }

    // Enemies (drones)
    for (const e of state.enemies) drawDrone(e);

    // Player robot
    drawPlayer(state.player);

    // Particles
    for (const pt of state.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / 40);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    // Wave banner
    if (state.waveBanner > 0 && !state.over) {
      ctx.globalAlpha = Math.min(1, state.waveBanner / 30);
      ctx.fillStyle = "#35e06f";
      ctx.font = "bold 34px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("WAVE " + state.wave, W / 2, H / 2);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
    }
  }

  function drawPlayer(p) {
    const x = p.x, y = p.y;
    ctx.save();
    ctx.translate(x, y);
    // body
    ctx.fillStyle = "#2f6b45";
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    // armor plating
    ctx.fillStyle = "#4bd07d";
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, 6);
    // cannon
    ctx.fillStyle = "#9dffbe";
    ctx.fillRect(-4, -p.h / 2 - 12, 8, 14);
    // eye
    ctx.fillStyle = "#f5c451";
    ctx.fillRect(-6, -4, 12, 6);
    // treads
    ctx.fillStyle = "#1c3b28";
    ctx.fillRect(-p.w / 2 - 4, p.h / 2 - 6, 8, 10);
    ctx.fillRect(p.w / 2 - 4, p.h / 2 - 6, 8, 10);
    ctx.restore();
  }

  function drawDrone(e) {
    const x = e.x, y = e.y;
    ctx.save();
    ctx.translate(x, y);
    // hp tint
    const t = e.hp / e.maxHp;
    ctx.fillStyle = `rgb(${Math.round(200 - t * 60)}, ${Math.round(60 + t * 30)}, ${Math.round(60 + t * 30)})`;
    // body (diamond)
    ctx.beginPath();
    ctx.moveTo(0, -e.h / 2);
    ctx.lineTo(e.w / 2, 0);
    ctx.lineTo(0, e.h / 2);
    ctx.lineTo(-e.w / 2, 0);
    ctx.closePath();
    ctx.fill();
    // core
    ctx.fillStyle = "#ffd36b";
    ctx.fillRect(-4, -4, 8, 8);
    // rotors
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-e.w / 2 - 6, -2); ctx.lineTo(-e.w / 2 + 2, -2);
    ctx.moveTo(e.w / 2 - 2, -2); ctx.lineTo(e.w / 2 + 6, -2);
    ctx.stroke();
    ctx.restore();
  }

  // ---- Main loop ---------------------------------------------------------
  function loop() {
    update();
    if (state.running) draw();
    requestAnimationFrame(loop);
  }

  // ---- Game lifecycle ----------------------------------------------------
  function startGame() {
    state = newState();
    state.running = true;
    startWave(1);
    showScreen("game");
  }

  function endGame(victory) {
    state.over = true;
    state.running = false;
    const title = document.getElementById("end-title");
    const msg = document.getElementById("end-message");
    document.getElementById("end-score").textContent = state.score;

    if (victory) {
      title.textContent = "MISSION COMPLETE";
      title.style.color = "#35e06f";
      msg.textContent = "The line held. The Robotic Army stands victorious, soldier.";
    } else {
      title.textContent = "BASE OVERRUN";
      title.style.color = "#ff4d4d";
      msg.textContent = "Hull integrity lost. Regroup and redeploy.";
    }
    showScreen("end");
  }

  // ---- Wire up buttons ---------------------------------------------------
  document.getElementById("btn-deploy").addEventListener("click", startGame);
  document.getElementById("btn-restart").addEventListener("click", startGame);

  // Kick off the render loop (idles until a game starts).
  state = newState();
  requestAnimationFrame(loop);

  // Process the reel embed on the initial briefing screen once the
  // Instagram script has loaded.
  window.addEventListener("load", () => {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  });
})();
