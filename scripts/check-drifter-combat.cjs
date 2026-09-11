/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.DRIFTER_TEST_ORIGIN||'http://127.0.0.1:4175';
(async()=>{
 fs.mkdirSync('output/drifter-combat-qa',{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
 try{
  async function start(viewport){const p=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700});p.on('pageerror',e=>errors.push(e.message));await p.clock.install();await p.goto(origin+'/drifter/',{waitUntil:'networkidle'});await p.locator('#loading').waitFor({state:'hidden'});await p.click('#play-free');await p.click('[data-system="udder"]');await p.clock.runFor(1000);await p.click('[data-planet="moo"]');await p.clock.runFor(1000);return p;}
  const phone=await start({width:390,height:844});await phone.clock.runFor(3000);
  let s=await phone.evaluate(()=>drifter.snapshot());assert.equal(s.shotsFired,0,'No unseen enemies should provoke fire');assert.doesNotMatch(await phone.locator('#combat-hint').textContent(),/ARMOUR/);
  await phone.keyboard.down('ArrowRight');await phone.clock.runFor(1100);await phone.keyboard.up('ArrowRight');
  s=await phone.evaluate(()=>drifter.snapshot());assert.equal(s.facing,1);
  await phone.screenshot({path:'output/drifter-combat-qa/phone-right.png'});
  let last=s.shotsFired,shotTimes=[],sawShot=false;
  for(let i=0;i<90;i++){await phone.clock.runFor(40);s=await phone.evaluate(()=>drifter.snapshot());if(s.shotsFired>last){assert.ok(s.aimTarget,'A visible target must exist');assert.ok(s.aimTarget.x-s.aimTarget.r>s.camera+30);assert.ok(s.aimTarget.x+s.aimTarget.r<s.camera+s.width-30);assert.ok(s.companion);assert.ok(s.shots.some(shot=>Math.hypot(shot.x-s.companion.x,shot.y-s.companion.y)<120));shotTimes.push(s.timer);if(!sawShot){await phone.screenshot({path:'output/drifter-combat-qa/dot-fires.png'});sawShot=true;}last=s.shotsFired;}}
  assert.ok(sawShot,'Dot fires once a threat is visible');assert.ok(shotTimes.every((time,i)=>i===0||time-shotTimes[i-1]>.65));
  await phone.keyboard.down('ArrowLeft');await phone.clock.runFor(450);await phone.keyboard.up('ArrowLeft');s=await phone.evaluate(()=>drifter.snapshot());assert.equal(s.facing,-1);await phone.screenshot({path:'output/drifter-combat-qa/phone-left.png'});
  // Real pointer travel followed by the retained optional keyboard fire shortcut.
  await phone.touchscreen.tap(300,400);const before=await phone.evaluate(()=>drifter.snapshot().target);assert.ok(before);await phone.keyboard.down('KeyX');assert.deepEqual(await phone.evaluate(()=>drifter.snapshot().target),before);await phone.keyboard.up('KeyX');
  await phone.click('#pause');const frozen=await phone.evaluate(()=>drifter.snapshot());await phone.clock.runFor(1000);const after=await phone.evaluate(()=>drifter.snapshot());assert.equal(after.timer,frozen.timer);assert.deepEqual(after.companion,frozen.companion);
  const desktop=await start({width:1440,height:900});await desktop.keyboard.down('ArrowRight');await desktop.clock.runFor(1700);await desktop.keyboard.up('ArrowRight');await desktop.screenshot({path:'output/drifter-combat-qa/desktop.png'});await desktop.click('#wardrobe-button');await desktop.screenshot({path:'output/drifter-combat-qa/suits.png'});
  const landscape=await start({width:667,height:375});await landscape.keyboard.down('ArrowRight');await landscape.clock.runFor(1600);await landscape.keyboard.up('ArrowRight');await landscape.clock.runFor(1200);const l=await landscape.evaluate(()=>drifter.snapshot());assert.ok(l.shotsFired>0);assert.ok(l.companion.y<l.height);await landscape.screenshot({path:'output/drifter-combat-qa/landscape.png'});
  assert.deepEqual(errors,[]);console.log('PASS visible-only calm Dot fire, lens origin, movement facing, uninterrupted travel, paused companion, desktop and both phone orientations.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
