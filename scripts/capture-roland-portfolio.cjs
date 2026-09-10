const { chromium } = require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  const response = await page.goto('https://www.rolandgaspar.co.za/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
  console.log(JSON.stringify({ status: response.status(), url: page.url(), title: await page.title(), text: await page.locator('body').innerText() }));
  await page.screenshot({ path: 'output/portfolio-refresh-2026-09-10/roland-landing.png' });
  await browser.close();
})().catch(error => { console.error(error.message); process.exit(1); });
