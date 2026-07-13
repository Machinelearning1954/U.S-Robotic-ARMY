/* Headless smoke test: boots the game and drives every mission phase. */
const { chromium } = require('playwright');
const path = require('path');

const GAME = 'file://' + path.resolve('/home/user/U.S-Robotic-ARMY/game/index.html');
const errors = [];
let failCount = 0;

function ok(name, cond, extra) {
  if (cond) console.log('PASS  ' + name);
  else { failCount++; console.log('FAIL  ' + name + (extra ? '  -- ' + extra : '')); }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(GAME);
  await page.waitForTimeout(400);

  const phase = () => page.evaluate(() => window.__ra.G.phase);
  const stepMany = (n, dt) => page.evaluate(([n, dt]) => {
    for (let i = 0; i < n; i++) window.__ra.step(dt);
  }, [n, dt || 1 / 60]);
  const pressE = () => page.evaluate(() => { window.__ra.pressE(); window.__ra.step(1 / 60); });
  // advance through any active dialog (E has a per-line debounce via timer reset)
  const skipDialog = async (max) => {
    for (let i = 0; i < (max || 30); i++) {
      const has = await page.evaluate(() => !!window.__ra.G.dialog);
      if (!has) return;
      await pressE();
    }
  };

  ok('boot phase', (await phase()) === 'BOOT');

  // BOOT -> INTEL -> WALK
  await pressE();
  ok('intel phase', (await phase()) === 'INTEL');
  await pressE();
  ok('walk phase', (await phase()) === 'WALK');

  // WALK -> CRUISE (walk to the car)
  await page.evaluate(() => { const p = window.__ra.G.player; window.__ra.walkTo(p.x, p.y + 30); });
  await stepMany(30);
  ok('cruise after reaching car', (await phase()) === 'CRUISE');

  // CRUISE -> PULLOVER (scripted trigger north on Alta)
  await page.evaluate(() => window.__ra.teleport(1260, 3390));
  await stepMany(5);
  ok('pullover trigger', (await phase()) === 'PULLOVER');

  // stop, let the cop close in -> PULLOVER_TALK
  await stepMany(600); // 10 sim-seconds standing still
  ok('pullover talk', (await phase()) === 'PULLOVER_TALK');
  await skipDialog();
  ok('meet drive after officer talk', (await phase()) === 'MEET_DRIVE');

  // MEET
  await page.evaluate(() => window.__ra.teleport(2700, 2270));
  await stepMany(10);
  ok('meet talk', (await phase()) === 'MEET_TALK');
  await skipDialog();
  ok('gas drive after briefing', (await phase()) === 'GAS_DRIVE');

  // sponsor radio spot plays during the drive to the gas station
  await stepMany(200); // ~3.3 sim-seconds into GAS_DRIVE
  const adLine = await page.evaluate(() => window.__ra.G.subtitle && window.__ra.G.subtitle.s);
  ok('sponsor radio spot', adLine === 'RADIO', String(adLine));

  // sponsor jar pickup repairs the hull
  const jarDmg = await page.evaluate(() => {
    const ra = window.__ra;
    ra.G.player.damage = 60;
    ra.teleport(1260, 2900); // jar on Alta Ave
    for (let i = 0; i < 5; i++) ra.step(1 / 60);
    return ra.G.player.damage;
  });
  ok('glow jar repairs hull', jarDmg === 35, 'damage=' + jarDmg);

  // GAS
  await page.evaluate(() => window.__ra.teleport(980, 1380));
  await stepMany(10);
  ok('gas talk', (await phase()) === 'GAS_TALK');
  const racers = await page.evaluate(() => window.__ra.G.racers.length);
  ok('racers spawned', racers === 2);
  await skipDialog();
  ok('countdown', (await phase()) === 'COUNTDOWN');
  await stepMany(240); // 4s
  ok('race started', (await phase()) === 'RACE');

  // race: follow the targets by teleporting near them until they stop on the bridge
  for (let i = 0; i < 40; i++) {
    const done = await page.evaluate(() => {
      const G = window.__ra.G;
      const lead = Math.max(G.racers[0].x, G.racers[1].x);
      window.__ra.teleport(Math.min(lead - 120, 5730), 1620);
      for (let k = 0; k < 60; k++) window.__ra.step(1 / 60);
      return G.racers.every(r => r.stopped) || G.phase !== 'RACE';
    });
    if (done) break;
  }
  await stepMany(60);
  ok('bust reached', (await phase()) === 'BUST');
  await skipDialog();
  ok('deliver after bust', (await phase()) === 'DELIVER');
  const blue = await page.evaluate(() => window.__ra.G.player.color);
  ok('swapped to blue car', blue === '#2757c9', blue);

  // starlet random event: stop next to her, then deliver with her aboard
  const starletState = await page.evaluate(() => {
    const ra = window.__ra;
    ra.teleport(6740, 2060);
    for (let i = 0; i < 10; i++) ra.step(1 / 60);
    return ra.G.starlet && ra.G.starlet.state;
  });
  ok('starlet picked up', starletState === 'riding', String(starletState));

  // DELIVER
  await page.evaluate(() => window.__ra.teleport(6610, 2930));
  await stepMany(10);
  ok('deliver talk', (await phase()) === 'DELIVER_TALK');
  const rescued = await page.evaluate(() => window.__ra.G.stats.fareRescued === true);
  ok('starlet fare rescued', rescued);
  await skipDialog();
  ok('mission passed', (await phase()) === 'PASSED');

  // ---- MOD TERMINAL ----
  await page.reload();
  await page.waitForTimeout(300);
  await pressE(); await pressE(); // BOOT -> INTEL -> WALK
  await page.evaluate(() => { const p = window.__ra.G.player; window.__ra.walkTo(p.x, p.y + 30); });
  await stepMany(30); // -> CRUISE
  // run mod tests in a phase without the scripted pull-over (it opens a dialog that eats E)
  await page.evaluate(() => window.__ra.enterPhase('MEET_DRIVE'));

  // menu opens with T and owns navigation keys
  await page.evaluate(() => { window.__ra.press('KeyT'); window.__ra.step(1 / 60); });
  ok('mod menu opens', await page.evaluate(() => window.__ra.G.modMenu.open === true));
  await page.evaluate(() => { window.__ra.press('KeyT'); window.__ra.step(1 / 60); });
  ok('mod menu closes', await page.evaluate(() => window.__ra.G.modMenu.open === false));

  // god mode: ram a building, take zero damage
  const godDmg = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('god'); ra.step(1 / 60);
    ra.teleport(1260, 3900);
    ra.G.player.angle = Math.PI; // west toward the plaza-side building
    ra.G.player.speed = 500;
    for (let i = 0; i < 120; i++) ra.step(1 / 60);
    return { dmg: ra.G.player.damage, phase: ra.G.phase };
  });
  ok('god mode blocks damage', godDmg.dmg === 0 && godDmg.phase !== 'FAILED', JSON.stringify(godDmg));

  // nitro raises the speed cap past stock 620
  const nitroSpeed = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('nitro'); ra.toggleMod('ghost'); ra.step(1 / 60); // ghost keeps the run collision-free
    ra.teleport(1000, 1620); ra.G.player.angle = 0;
    ra.setKey('KeyW', true);
    for (let i = 0; i < 600; i++) ra.step(1 / 60);
    ra.setKey('KeyW', false);
    ra.toggleMod('ghost'); ra.step(1 / 60);
    return ra.G.stats.top;
  });
  ok('nitro exceeds stock top speed', nitroSpeed > 640, 'top=' + Math.round(nitroSpeed));

  // bullet time halves the world clock
  const slow = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('slowmo'); ra.step(1 / 60);
    const t0 = ra.G.time;
    for (let i = 0; i < 60; i++) ra.step(1 / 60);
    ra.toggleMod('slowmo'); ra.step(1 / 60);
    return ra.G.time - t0;
  });
  ok('bullet time halves clock', slow > 0.4 && slow < 0.62, 'dt=' + slow.toFixed(3));

  // ghost traffic: standing inside a traffic car causes no hits
  const ghostHits = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('ghost'); ra.step(1 / 60);
    ra.G.traffic.push({ x: 2000, y: 1645, px: 2000, py: 1645, angle: 0, speed: 0, cruise: 0,
      color: '#888', damage: 0, radius: 21, flame: 0, ai: true,
      lane: { axis: 'h', pos: 1645, from: 400, to: 6800, sign: 1 } });
    const hits0 = ra.G.stats.hits;
    ra.teleport(2000, 1645);
    ra.G.player.speed = 300;
    for (let i = 0; i < 30; i++) ra.step(1 / 60);
    ra.toggleMod('ghost'); ra.step(1 / 60);
    return ra.G.stats.hits - hits0;
  });
  ok('ghost traffic intangible', ghostHits === 0, 'hits=' + ghostHits);

  // chrome cycler animates the paint, restores base color on disable
  const chrome = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('chrome'); ra.step(1 / 60);
    const painted = ra.G.player.color;
    ra.toggleMod('chrome'); ra.step(1 / 60);
    return { painted, restored: ra.G.player.color };
  });
  ok('chrome cycler paints hsl', chrome.painted.startsWith('hsl'), chrome.painted);
  ok('chrome restores base color', !chrome.restored.startsWith('hsl'), chrome.restored);

  // vehicle forge cycles presets and applies stats
  const forge = await page.evaluate(() => {
    const ra = window.__ra;
    ra.applyForge(1); ra.step(1 / 60);
    return { color: ra.G.player.color, top: ra.G.player.forgeTop, name: ra.FORGE[ra.G.forgeIdx].name };
  });
  ok('vehicle forge applies preset', forge.color === '#b3261e' && forge.top === 1.08, JSON.stringify(forge));

  // wardrobe cycles outfits
  const outfit = await page.evaluate(() => {
    const ra = window.__ra;
    const i0 = ra.G.outfitIdx;
    ra.cycleOutfit();
    return ra.G.outfitIdx !== i0;
  });
  ok('wardrobe cycles outfit', outfit);

  // ---- SYSTEM OPTIMIZER ----
  // menus are mutually exclusive
  const exclusive = await page.evaluate(() => {
    const ra = window.__ra;
    ra.press('KeyT'); ra.step(1 / 60);           // open mods
    ra.press('KeyO'); ra.step(1 / 60);           // open optimizer -> mods must close
    const optOpen = ra.G.optMenu.open && !ra.G.modMenu.open;
    ra.press('KeyO'); ra.step(1 / 60);           // close optimizer
    return optOpen && !ra.G.optMenu.open;
  });
  ok('optimizer/mod menus exclusive', exclusive);

  // notifications off suppresses SYSTEM radio
  const notif = await page.evaluate(() => {
    const ra = window.__ra;
    ra.OPT.notifications = false;
    ra.G.subtitle = null;
    ra.tempCleanup(); // radios a SYSTEM line
    const suppressed = ra.G.subtitle === null;
    ra.OPT.notifications = true;
    return suppressed;
  });
  ok('notifications-off mutes SYSTEM radio', notif);

  // temp cleanup purges traffic
  const cleaned = await page.evaluate(() => {
    const ra = window.__ra;
    for (let i = 0; i < 60; i++) ra.step(1 / 60); // let traffic spawn
    const before = ra.G.traffic.length;
    ra.tempCleanup();
    return { before, after: ra.G.traffic.length };
  });
  ok('temp cleanup purges traffic', cleaned.before > 0 && cleaned.after === 0, JSON.stringify(cleaned));

  // restore point: save here, wander off, restore back
  const restore = await page.evaluate(() => {
    const ra = window.__ra;
    ra.teleport(3000, 2480);
    const saved = ra.createRestorePoint();
    ra.teleport(900, 1620);
    const ran = ra.systemRestore();
    for (let i = 0; i < 3; i++) ra.step(1 / 60);
    return { saved, ran, x: ra.G.player.x, y: ra.G.player.y, phase: ra.G.phase };
  });
  ok('restore point round-trip', restore.saved && restore.ran &&
    Math.abs(restore.x - 3000) < 1 && Math.abs(restore.y - 2480) < 1 && restore.phase === 'MEET_DRIVE',
    JSON.stringify(restore));

  // ultimate performance flips every optimizer setting
  const ultimate = await page.evaluate(() => {
    const ra = window.__ra;
    ra.ultimatePerformance();
    return ra.OPT.gameMode && ra.OPT.solidDesktop && !ra.OPT.notifications && ra.OPT.fpsCounter;
  });
  ok('ultimate performance preset', ultimate);

  // game-mode render path draws without errors
  await page.waitForTimeout(700);

  // reset optimizer so later checks see stock behavior
  await page.evaluate(() => {
    const ra = window.__ra;
    ra.OPT.gameMode = false; ra.OPT.solidDesktop = false;
    ra.OPT.notifications = true; ra.OPT.fpsCounter = false;
  });

  // carjack protocol: E near a stopped commuter takes the car
  // (assert on takeover signals — position + paint — not on traffic count, which the
  //  spawner refills within the same tick)
  const jack = await page.evaluate(() => {
    const ra = window.__ra;
    ra.toggleMod('jack'); ra.step(1 / 60);
    const mark = { x: 2400, y: 1695, px: 2400, py: 1695, angle: 0, speed: 0, cruise: 0,
      color: '#136f9a', damage: 0, radius: 21, flame: 0, ai: true,
      lane: { axis: 'h', pos: 1695, from: 400, to: 6800, sign: 1 } };
    ra.G.traffic.push(mark);
    ra.teleport(2400, 1660);
    ra.press('KeyE'); ra.step(1 / 60);
    return {
      color: ra.G.player.color,
      atCar: Math.abs(ra.G.player.x - 2400) < 30 && Math.abs(ra.G.player.y - 1695) < 30,
      removed: !ra.G.traffic.includes(mark),
    };
  });
  ok('carjack takes the vehicle', jack.color === '#136f9a' && jack.atCar && jack.removed, JSON.stringify(jack));

  // failure + checkpoint restore path
  await page.reload();
  await page.waitForTimeout(300);
  await pressE(); await pressE(); // BOOT -> INTEL -> WALK
  await page.evaluate(() => { const p = window.__ra.G.player; window.__ra.walkTo(p.x, p.y + 30); });
  await stepMany(30);
  await page.evaluate(() => { window.__ra.G.player.damage = 100; window.__ra.G.player.speed = 200; });
  await stepMany(5);
  ok('failure on destroyed car', (await phase()) === 'FAILED');
  await pressE();
  await stepMany(5);
  const restored = await phase();
  ok('checkpoint restore', restored === 'CRUISE', restored);

  // water hazard: drive into the bay (not on bridge)
  await page.evaluate(() => window.__ra.teleport(5400, 2600));
  await stepMany(5);
  ok('water failure', (await phase()) === 'FAILED');

  // race checkpoint restore must respawn the grid (regression: softlock)
  await page.evaluate(() => { window.__ra.pressE(); window.__ra.step(1 / 60); }); // leave FAILED
  await page.evaluate(() => {
    const ra = window.__ra;
    ra.G.checkpoint = {
      phase: 'RACE', onFoot: false,
      player: { x: 980, y: 1620, angle: 0, color: '#cfd3d8' },
      walker: { x: 1000, y: 4350 },
    };
    ra.G.player.damage = 100; ra.G.player.speed = 200;
    ra.step(1 / 60);
  });
  ok('race failure state', (await phase()) === 'FAILED');
  await pressE();
  await stepMany(5);
  const afterRaceRestore = await page.evaluate(() => ({ p: window.__ra.G.phase, n: window.__ra.G.racers.length }));
  ok('race restore -> countdown with grid', afterRaceRestore.p === 'COUNTDOWN' && afterRaceRestore.n === 2,
    JSON.stringify(afterRaceRestore));
  await stepMany(260);
  ok('race restarts after restore', (await phase()) === 'RACE');

  // long idle render (catch draw-loop errors incl. minimap/billboards/deer)
  await page.evaluate(() => { window.__ra.G.phase = 'FAILED'; });
  await pressE();
  await page.evaluate(() => window.__ra.teleport(3600, 1620));
  await page.waitForTimeout(1500);

  ok('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));

  await browser.close();
  console.log(failCount === 0 ? 'SMOKE: ALL GREEN' : `SMOKE: ${failCount} FAILURES`);
  process.exit(failCount === 0 ? 0 : 1);
})().catch((e) => { console.error('SMOKE CRASH:', e); process.exit(2); });
