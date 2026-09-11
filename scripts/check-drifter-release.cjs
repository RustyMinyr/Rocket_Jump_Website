/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
(async()=>{
 const origin=process.env.DRIFTER_TEST_ORIGIN||'http://localhost:4180',live=origin.startsWith('https:'),out='output/drifter-release-'+(live?'live':'local');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
 try{const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('drifter-gameplay-stats','off'));
  await page.goto(origin+'/drifter/index.html',{waitUntil:'networkidle'});await page.locator('#loading').waitFor({state:'hidden'});await page.screenshot({path:out+'/entry-phone.png'});await page.click('#entry-leaderboard');await page.waitForFunction(()=>!document.getElementById('board-status').textContent.includes('Finding'));assert.equal(await page.locator('#board-signin').isVisible(),true);assert.equal(await page.locator('#stats-toggle').isChecked(),false);await page.screenshot({path:out+'/leaderboard-phone.png'});
  const board=await page.evaluate(async()=>{const r=await fetch('/api/roland/leaderboard');return{status:r.status,body:await r.json()};});assert.equal(board.status,200);assert.ok(Array.isArray(board.body.entries));
  await page.goto(origin+'/admin',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Sign in',exact:true}).waitFor();assert.equal(await page.evaluate(async()=>{const r=await fetch('/api/roland/admin-insights');return r.status;}),403);await page.screenshot({path:out+'/admin-phone.png'});
  await page.goto(origin+'/',{waitUntil:'networkidle'});await page.getByRole('link',{name:'Admin',exact:true}).scrollIntoViewIfNeeded();assert.equal(await page.getByRole('link',{name:'Play Drifter'}).count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/footer-phone.png'});
  if(live){for(const name of ['physics.js','insights.js','game.js','community.css']){const r=await page.request.get(origin+'/roland-home/'+name);assert.equal(r.status(),200);const digest=data=>createHash('sha256').update(data).digest('hex');assert.equal(digest(await r.body()),digest(execFileSync('git',['show','HEAD:public/roland-home/'+name])),name+' matches the tested release');}}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/result.json',JSON.stringify({origin,pass:true,readOnly:true,errors,assetMatch:live},null,2));console.log('PASS entry, leaderboard, private admin, footer, phone layout'+(live?' and exact live asset hashes.':'.'));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
