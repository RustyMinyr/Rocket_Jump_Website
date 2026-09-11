/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.DRIFTER_TEST_ORIGIN||'http://127.0.0.1:4175',out='output/drifter-bounce-qa';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
 try{
  const snapshot=p=>p.evaluate(()=>drifter.snapshot());
  async function start(system,planet,viewport={width:1365,height:900}){const p=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700});p.on('pageerror',e=>errors.push(e.message));await p.clock.install();await p.goto(origin+'/drifter/',{waitUntil:'networkidle'});await p.locator('#loading').waitFor({state:'hidden'});await p.click('#play-free');await p.click('[data-system="'+system+'"]');await p.clock.runFor(1000);await p.click('[data-planet="'+planet+'"]');await p.clock.runFor(1000);return p;}
  async function target(p,x,y){const s=await snapshot(p),b=await p.locator('#scene').boundingBox();const px=Math.max(25,Math.min(s.width-25,x-s.camera))*b.width/s.width,py=Math.max(350,Math.min(s.height-250,y))*b.height/s.height;await p.mouse.click(px,py);}
  const p=await start('udder','moo',{width:390,height:844});const ys=[];let min=Infinity,max=-Infinity;
  for(let i=0;i<60;i++){await p.clock.runFor(100);const s=await snapshot(p);ys.push(s.hero.y);if(s.hero.y<min){min=s.hero.y;await p.screenshot({path:out+'/bounce-high.png'});}if(s.hero.y>max){max=s.hero.y;await p.screenshot({path:out+'/bounce-low.png'});}}
  assert.ok(max-min>100&&max-min<120,'Clear full bounce height: '+(max-min));assert.ok((await snapshot(p)).gravityPeriod>1.17);
  const patch=(await snapshot(p)).items.find(i=>i.kind==='repair');assert.ok(patch);
  let collected=false;
  for(let i=0;i<200;i++){await target(p,patch.x,patch.y);await p.clock.runFor(120);const s=await snapshot(p);assert.equal(s.state,'playing');if(s.effects.repair>0){collected=true;break;}}
  assert.ok(collected,'Reach and collect a real gravity patch');await p.keyboard.up('Space');await p.clock.runFor(1500);let s=await snapshot(p);assert.equal(s.mode,'walk');assert.ok(Math.abs(s.hero.vy)<1);assert.match(await p.locator('#effects').textContent(),/DEVICE FIXED/);await p.screenshot({path:out+'/repair-active.png'});
  await p.click('#quick-gear');const remaining=(await snapshot(p)).effects.repair;await p.clock.runFor(2000);assert.equal((await snapshot(p)).effects.repair,remaining);await p.click('#close-kit');await p.clock.runFor(remaining*1000+1400);assert.equal((await snapshot(p)).mode,'bounce');assert.equal((await snapshot(p)).effects.repair,0);
  const city=await start('tomorrow','city');await city.clock.runFor(3000);s=await snapshot(city);assert.equal(s.mode,'walk');assert.equal(s.hero.vy,0);await city.keyboard.down('Space');await city.clock.runFor(200);assert.ok((await snapshot(city)).hero.y<s.hero.y-30);await city.keyboard.up('Space');
  const ocean=await start('deep','ocean');await ocean.keyboard.down('ArrowRight');await ocean.clock.runFor(4700);await ocean.keyboard.up('ArrowRight');assert.equal((await snapshot(ocean)).mode,'swim');
  for(const [system,world]of [['lunar','driftport'],['beyond','nebula'],['beyond','ring']]){
   const ship=await start(system,world);await ship.keyboard.down('ArrowRight');await ship.clock.runFor(1350);await ship.keyboard.up('ArrowRight');await ship.click('#interact');assert.equal((await snapshot(ship)).mode,'ship');
   await ship.keyboard.down('ArrowRight');await ship.clock.runFor(450);await ship.keyboard.up('ArrowRight');assert.equal((await snapshot(ship)).facing,1);await ship.screenshot({path:out+'/'+world+'-right.png'});
   await ship.keyboard.down('ArrowLeft');await ship.clock.runFor(450);await ship.keyboard.up('ArrowLeft');assert.equal((await snapshot(ship)).facing,-1);await ship.screenshot({path:out+'/'+world+'-left.png'});await ship.click('#interact');assert.equal((await snapshot(ship)).vehicle.facing,-1);await ship.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS full-height phone bounce, real repair pickup/countdown/pause/expiry, gravity planet jump, underwater field swimming, and all three flyable ships turning both ways.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
