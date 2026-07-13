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

  // DELIVER
  await page.evaluate(() => window.__ra.teleport(6610, 2930));
  await stepMany(10);
  ok('deliver talk', (await phase()) === 'DELIVER_TALK');
  await skipDialog();
  ok('mission passed', (await phase()) === 'PASSED');

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
