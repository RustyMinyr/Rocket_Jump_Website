/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const origin=process.env.DRIFTER_TEST_ORIGIN||'http://127.0.0.1:4175';
const output='output/drifter-gear-qa';
const local=['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname);
const fixture={version:2,parts:[],completed:[],discovered:[],claims:['gear:prism','gear:aerie'],gear:['starter','crystal','jet'],equipped:{suit:'starter',relic:null},sound:false,home:false};

(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[],failures=[],results=[];
 try{
  async function start(viewport){
   const p=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700});
   p.setDefaultTimeout(12000);
   p.on('pageerror',error=>errors.push(error.message));
   // This fixture is scoped to a fresh local browser context, never an account or live site.
   if(local)await p.addInitScript(profile=>{
    if(!localStorage.getItem('drifter-gear-qa-seeded')){
     localStorage.setItem('roland-get-home-v1',JSON.stringify(profile));
     localStorage.setItem('drifter-gear-qa-seeded','true');
    }
   },fixture);
   await p.clock.install();
   await p.goto(origin+'/drifter/',{waitUntil:'networkidle'});
   await p.locator('#loading').waitFor({state:'hidden'});
   if(await p.locator('#play-free').isVisible())await p.locator('#play-free').click();
   await p.locator('[data-system="udder"]').click();
   await p.clock.runFor(1000);
   await p.locator('[data-planet="moo"]').click();
   await p.clock.runFor(1700);
   assert.equal((await snapshot(p)).state,'playing');
   return p;
  }
  const snapshot=p=>p.evaluate(()=>drifter.snapshot());
  async function hitTarget(p,selector,minHeight=0){
   const report=await p.locator(selector).evaluate(el=>{
    const r=el.getBoundingClientRect(),points=[[.5,.5],[.2,.5],[.8,.5]];
    return {text:el.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,
     inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5,
     clear:points.every(([x,y])=>{const top=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);return top===el||el.contains(top);})};
   });
   assert.ok(report.inside,selector+' is inside the viewport: '+JSON.stringify(report));
   assert.ok(report.clear,selector+' is not obscured: '+JSON.stringify(report));
   assert.ok(report.height>=minHeight,selector+' height is '+report.height);
   return report;
  }
  async function frozen(p){
   const before=await snapshot(p);assert.equal(before.state,'paused');
   await p.clock.runFor(1300);
   const after=await snapshot(p);
   for(const key of ['timer','id','stage','camera'])assert.equal(after[key],before[key],key+' remains paused');
   assert.deepEqual(after.hero,before.hero,'Hero and health remain paused');
   assert.deepEqual(after.companion,before.companion,'Dot remains paused');
   return after;
  }
  async function closeKit(p,touch){
   const close=p.locator('#close-kit');await close.scrollIntoViewIfNeeded();
   await hitTarget(p,'#close-kit',44);
   if(touch)await close.tap();else await close.click();
   await p.locator('#wardrobe-dialog').waitFor({state:'hidden'});
   await p.clock.runFor(20);
  }
  async function inspect(viewport){
   const name=viewport.width+'x'+viewport.height,p=await start(viewport),touch=viewport.width<700;
   try{
    assert.match(await p.locator('#wardrobe-button').textContent(),/^Gear\s/);
    const controls=[];
    for(const id of ['quick-gear','dash','boost'])controls.push(await hitTarget(p,'#'+id,40));
    await hitTarget(p,'#wardrobe-button');
    await p.screenshot({path:output+'/'+name+'-controls.png'});
    if(touch)await p.locator('#quick-gear').tap();else await p.locator('#quick-gear').click();
    await p.locator('#wardrobe-dialog').waitFor({state:'visible'});
    const paused=await frozen(p);
    await hitTarget(p,'#wardrobe-dialog .close-dialog',44);
    await p.screenshot({path:output+'/'+name+'-gear-modal.png'});
    if(local){
     const original=await p.evaluate(()=>drifter.progress());
     for(const gear of ['crystal','jet']){
      const button=p.locator('[data-gear="'+gear+'"]');await button.scrollIntoViewIfNeeded();
      if(touch)await button.tap();else await button.click();
      assert.equal((await snapshot(p)).state,'paused');
     }
     const equipped=await snapshot(p),progress=await p.evaluate(()=>drifter.progress());
     assert.equal(equipped.stats.suit,'crystal');assert.equal(equipped.stats.relic,'jet');
     assert.equal(equipped.mode,'fly');assert.ok(equipped.hero.maxHp>paused.hero.maxHp);
     assert.equal(equipped.hero.hp,paused.hero.hp,'An equipment swap must not heal');
     for(const key of ['x','y','vx','vy','r'])assert.equal(equipped.hero[key],paused.hero[key],key+' is unchanged by equip');
     for(const key of ['timer','id','stage','camera','checkpoint'])assert.equal(equipped[key],paused[key],key+' is unchanged by equip');
     for(const key of ['parts','completed','claims','gear'])assert.deepEqual(progress[key],original[key],key+' is unchanged by equip');
     const cached=await p.evaluate(()=>JSON.parse(localStorage.getItem('roland-get-home-v1')));
     assert.deepEqual(cached.equipped,{suit:'crystal',relic:'jet'});
     await frozen(p);
     await p.locator('#wardrobe-dialog').evaluate(el=>{el.scrollTop=0;});
     await p.screenshot({path:output+'/'+name+'-equipped-modal.png'});
    }
    await closeKit(p,touch);assert.equal((await snapshot(p)).state,'playing');
    await p.locator('#pause').click();
    await p.locator('#result-actions').getByRole('button',{name:'Suits & equipment',exact:true}).click();
    await frozen(p);await closeKit(p,touch);
    assert.equal((await snapshot(p)).state,'paused','Closing Gear returns to the pause menu');
    assert.equal(await p.locator('#overlay').isVisible(),true);
    await p.locator('#result-actions').getByRole('button',{name:'Keep drifting →',exact:true}).click();
    assert.equal((await snapshot(p)).state,'playing');
    if(!touch){await p.keyboard.press('KeyI');await p.locator('#wardrobe-dialog').waitFor({state:'visible'});await frozen(p);await closeKit(p,false);assert.equal((await snapshot(p)).state,'playing');}
    if(local){
     await p.reload({waitUntil:'networkidle'});await p.locator('#loading').waitFor({state:'hidden'});
     assert.deepEqual(await p.evaluate(()=>drifter.progress().equipped),{suit:'crystal',relic:'jet'},'Equipped items persist after reload');
     await p.locator('#wardrobe-button').click();
     assert.equal(await p.locator('[data-gear="crystal"]').isDisabled(),true);
     assert.equal(await p.locator('[data-gear="jet"]').isDisabled(),true);
    }
    results.push({viewport:name,controls:controls.map(({text,width,height})=>({text,width,height})),swap:local?'persisted-local-fixture':'skipped-nonlocal'});
   }catch(error){await p.screenshot({path:output+'/'+name+'-failure.png'}).catch(()=>{});failures.push({viewport:name,error:error.message});}
   finally{await p.close();}
  }
  for(const viewport of [{width:390,height:844},{width:320,height:740},{width:667,height:375},{width:1440,height:900}])await inspect(viewport);
  assert.deepEqual(errors,[],'No browser page errors');
  console.log(JSON.stringify({results,failures},null,2));
  assert.deepEqual(failures,[],'Gear browser checks pass for every viewport');
  console.log('PASS Gear taps, desktop I shortcut, pause restoration, frozen health/time, control hit targets, and persistent local suit/relic swaps.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
