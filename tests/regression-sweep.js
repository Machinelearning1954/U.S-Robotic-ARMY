// Run:  npm i playwright-core  &&  node tests/regression-sweep.js
// PAUDC regression sweep — rebuilt v1.75 after the container reset wiped the original.
// Checks that the load-bearing systems still work after any change, across the whole file.
const {chromium}=require('playwright-core');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// v1.78: no hardcoded chromium build number — honor $PW_CHROMIUM, else find any /opt/pw-browsers
// install, else fall back to playwright's own resolution so the sweep runs on a fresh clone.
const chromePath=process.env.PW_CHROMIUM||(()=>{try{
  return fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium'))
    .map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(p=>fs.existsSync(p));
}catch(e){return undefined;}})();
(async()=>{const errors=[];
const b=await chromium.launch({...(chromePath?{executablePath:chromePath}:{}),headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-background-timer-throttling']});
const page=await b.newContext({viewport:{width:820,height:520}}).then(c=>c.newPage());
page.on('pageerror',e=>errors.push(String(e)));
const ext=[];page.on('request',r=>{const u=r.url();if(!/^(file:|data:|blob:|about:)/.test(u))ext.push(u);});
await page.goto('file://'+require('path').resolve(__dirname,'../game/3d.html')+'?fresh=1',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>window.__paudc&&window.__paudc.st,{timeout:45000});
const fails=[];const ck=(n,c,x='')=>{console.log((c?'  ok ':'FAIL ')+n+(x?'  '+x:''));if(!c)fails.push(n);};
async function poll(fn,ms){const t0=Date.now();while(Date.now()-t0<ms){if(await page.evaluate(fn))return true;await sleep(150);}return false;}
await sleep(3000);

// A. BOOT + SHAPE
const s=await page.evaluate(()=>window.__paudc.st());
const need=['clout','veh','onFoot','seaLevel','grassCount','rockCount','pedRigged','vbBest','dirt','gfxCfg','benchCalls','surgeOn','buoyOn'];
ck('st() exposes every major subsystem',need.every(k=>k in s),'missing: '+need.filter(k=>!(k in s)).join(','));
ck('SELF-CONTAINED: zero external requests',ext.length===0,ext.slice(0,2).join(', ')||'none');

// B. WORLD SYSTEMS
ck('vehicle roster intact (>=11 rides)',(await page.evaluate(()=>window.__paudc.VEH.length))>=11);
ck('groundcover + stones populated',s.grassCount>0&&s.rockCount>0,'grass='+s.grassCount+' stones='+s.rockCount);
ck('pedestrians are rigged',s.pedRigged>0,'rigged='+s.pedRigged);
const seaBase=await page.evaluate(()=>window.__paudc.SEA_BASE);
ck('sea starts at the ordinary tideline',typeof seaBase==='number'&&Math.abs(s.seaLevel-seaBase)<1e-9,'seaLevel='+s.seaLevel+' base='+seaBase);
ck('sea has wave layers + depth tint',s.waveLayers>=3&&s.seaTinted===true,'layers='+s.waveLayers);

// C. ON FOOT + SWIMMING
await page.keyboard.press('f');
ck('can get out on foot',await poll(()=>window.__paudc.st().onFoot,9000));
await page.evaluate(()=>window.__paudc.setAmbCd(99999));
await page.evaluate(()=>{const q=window.__paudc;q.P.x=150;q.P.z=-250;q.P.v=0;});
ck('deep water makes you swim',await poll(()=>window.__paudc.st().swimming,9000));

// D. SAVE / LOAD
const rt=await page.evaluate(()=>{const q=window.__paudc;q.setClout(500);q.saveGame();q.setClout(11);
  const ok=q.loadGame();return{ok,after:q.st().clout};});
ck('save/load round-trips',rt.ok&&rt.after===500,JSON.stringify(rt));

// E. GRAPHICS CONTROLS
await page.evaluate(()=>{const q=window.__paudc;q.GFXCFG.grass=0;q.applyGfxCfg();});
await sleep(2200);
const off=await page.evaluate(()=>window.__paudc.st().grassCount);
await page.evaluate(()=>{const q=window.__paudc;q.GFXCFG.grass=3;q.applyGfxCfg();});
await sleep(2200);
ck('graphics settings actually bite',off===0&&(await page.evaluate(()=>window.__paudc.st().grassCount))>0,'off='+off);
await page.evaluate(()=>window.__paudc.togglePerfHud(true));
await sleep(3500);
ck('benchmark reports whole-frame cost',(await page.evaluate(()=>window.__paudc.st().benchCalls))>20);

// F. RECENT FEATURES STILL ALIVE
ck('surge machine runs',await page.evaluate(()=>{const q=window.__paudc;const r=q.startSurge();q.surge.t=99;return r===true;}));
// v1.78: surge coherence — the raised sea must move the WHOLE water model, not just the mesh.
// The player is still in deep water from section C, so the swimmer has to ride up with it.
const sg=await page.evaluate(()=>{const q=window.__paudc;q.setSurgeH(2.5);
  return{sea:q.st().seaLevel,wave:q.seaWaveAt(150,-250)};});
ck('surge lifts the sea level itself',Math.abs(sg.sea-(seaBase+2.5))<0.01,'sea='+sg.sea);
ck('surge lifts the sampled wave surface',sg.wave>1.2,'waveY='+sg.wave.toFixed(2)); // 2.5 surge minus worst-case trough (all 1.09 of amplitude down) still clears 1.2
ck('surge lifts the swimmer with the water',await poll(()=>{const q=window.__paudc;
  return q.st().swimming&&q.walker.position.y>1.5;},9000),
  'walkerY='+await page.evaluate(()=>+window.__paudc.walker.position.y.toFixed(2)));
ck('surge lets go cleanly',await page.evaluate(()=>{const q=window.__paudc;
  q.surge.on=false;q.surge.phase='calm';q.setSurgeH(0);   // force it off — the natural ebb takes ~20s of sim time
  return q.st().seaLevel===q.SEA_BASE&&q.st().surgeH===0;}));
// v1.78: buoyancy axis convention — pitch must live on rotation.z (the fore-aft axis every other
// tilt in the game uses), roll on rotation.x. Source-level check, since heaving a hull onto a
// specific wave slope isn't reachable from a throttled headless frame.
const src=fs.readFileSync(require('path').resolve(__dirname,'../game/3d.html'),'utf8');
ck('buoyancy pitch rides rotation.z, roll rides rotation.x',
  /cur\.g\.rotation\.z=buoyPitch;cur\.g\.rotation\.x=buoyRoll/.test(src));
ck('wrist scout launches',await page.evaluate(()=>{const q=window.__paudc;q.P.x=-60;q.P.z=95;return q.launchScout()!==false;}));
await page.evaluate(()=>window.__paudc.launchScout());
ck('beach volley serves',await page.evaluate(()=>{const q=window.__paudc;q.vbServe();return q.st().vbOn===true;}));
ck('marquee has no third-party embed',(await page.evaluate(()=>document.querySelectorAll('iframe,embed,object').length))===0);
// v1.79: THE PROVENANCE DESK — desk builds lazily, briefing fires, and the whole vantage
// chain walks through to the restorative ending. Dwell timers are primed (headless rAF ~1fps).
ck('provenance desk built with 3 terrain-derived frames',await poll(()=>{const q=window.__paudc;
  return q.PVD.deskX!==0&&q.st().pvdPanelN===3;},9000));
await page.evaluate(()=>{const q=window.__paudc;q.setPvdMsgT(9e9);q.P.x=q.PVD.deskX;q.P.z=q.PVD.deskZ;q.P.v=0;q.setPvdT(9);});
ck('provenance briefing fires from the desk',await poll(()=>window.__paudc.st().pvdStage>=1,9000));
for(let i=0;i<3;i++){
  await page.evaluate(()=>{const q=window.__paudc;const v=q.pvdVantages()[q.PVD.stage-1];
    q.P.x=v.X;q.P.z=v.Z;q.P.v=0;q.setPvdT(9);});
  ck('provenance frame '+(i+1)+' matches at its vantage',await poll(`window.__paudc.st().pvdStage>=${i+2}`,9000));}
await page.evaluate(()=>{const q=window.__paudc;q.P.x=q.EYRIE.X;q.P.z=q.EYRIE.Z;q.P.v=0;q.setPvdT(9);});
ck('provenance resolves restoratively at the Eyrie',await poll(()=>window.__paudc.st().pvdDone===true,9000));

console.log('\nPAGE ERRORS:',errors.length,errors.join(' | ').slice(0,240));
ck('zero page errors across the sweep',errors.length===0);
console.log('\n=== '+(fails.length===0?'SWEEP: ALL FUNCTIONAL — 0 failures':'SWEEP: '+fails.length+' FAILURE(S): '+fails.join('; '))+' ===');
await b.close();process.exit(fails.length===0?0:2);})().catch(e=>{console.log('FATAL',e.message);process.exit(1);});
