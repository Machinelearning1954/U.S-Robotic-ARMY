// Run:  npm i playwright-core  &&  node tests/regression-sweep.js
// PAUDC regression sweep — rebuilt v1.75 after the container reset wiped the original.
// Checks that the load-bearing systems still work after any change, across the whole file.
const {chromium}=require('playwright-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const errors=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-background-timer-throttling']});
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
ck('sea starts at the ordinary tideline',s.seaLevel===0.4);
ck('sea has wave layers + depth tint',s.waveLayers===5&&s.seaTinted===true);

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
await page.evaluate(()=>window.__paudc.setSurgeH(0));
ck('wrist scout launches',await page.evaluate(()=>{const q=window.__paudc;q.P.x=-60;q.P.z=95;return q.launchScout()!==false;}));
await page.evaluate(()=>window.__paudc.launchScout());
ck('beach volley serves',await page.evaluate(()=>{const q=window.__paudc;q.vbServe();return q.st().vbOn===true;}));
ck('marquee has no third-party embed',(await page.evaluate(()=>document.querySelectorAll('iframe,embed,object').length))===0);

console.log('\nPAGE ERRORS:',errors.length,errors.join(' | ').slice(0,240));
ck('zero page errors across the sweep',errors.length===0);
console.log('\n=== '+(fails.length===0?'SWEEP: ALL FUNCTIONAL — 0 failures':'SWEEP: '+fails.length+' FAILURE(S): '+fails.join('; '))+' ===');
await b.close();process.exit(fails.length===0?0:2);})().catch(e=>{console.log('FATAL',e.message);process.exit(1);});
