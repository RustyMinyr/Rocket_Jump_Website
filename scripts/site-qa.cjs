const { chromium } = require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs/promises');
const routes = ['/', '/web-design', '/branding', '/social-media', '/work', '/about', '/contact', '/client-portal', '/privacy', '/terms'];
(async () => {
  const output = 'output/site-qa/check-' + Date.now();
  await fs.mkdir(output, { recursive: true });
  console.log(output);
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const report=[];
  for(const width of [1440,1024,390]) {
    const page = await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
    for(const route of routes) {
      const errors=[];const errorHandler=e=>errors.push(e.message); page.on('pageerror',errorHandler);
      const response=await page.goto('http://localhost:3001'+route,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';}await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
      const data=await page.evaluate(()=>({
        scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth,
        brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
        overflow:[...document.querySelectorAll('main *')].filter(e=>{const b=e.getBoundingClientRect();const s=getComputedStyle(e);return b.width>0&&(b.right>innerWidth+3||b.left< -3)&&s.position!=='absolute'&&!e.closest('[aria-hidden=true]');}).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60)})).slice(0,30),
        headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({text:e.textContent,font:getComputedStyle(e).fontSize,line:getComputedStyle(e).lineHeight,weight:getComputedStyle(e).fontWeight})),
      }));
      const name=(route==='/'?'home':route.slice(1))+'-'+width;
      await page.screenshot({path:output+'/'+name+'.png',fullPage:true});
      await page.screenshot({path:output+'/'+name+'-viewport.png'});
      report.push({route,width,status:response.status(),errors,...data});
      page.off('pageerror',errorHandler);
    }
    await page.close();
  }
  await browser.close();
  await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(({headings,...r})=>r)));
})();
