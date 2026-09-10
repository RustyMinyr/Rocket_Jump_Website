const { chromium } = require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
  const output = 'output/portfolio-qa-' + Date.now();
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of ['/work', '/']) {
      const response = await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      assert.equal(await page.locator('.project-card').count(), route === '/work' ? 8 : 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src)), []);
      await page.screenshot({ path: `${output}/${route === '/' ? 'home' : 'work'}-${width}.png`, fullPage: true });
      if (route === '/work') {
        await page.locator('.project-card').first().screenshot({ path: `${output}/first-card-${width}.png` });
        await page.locator('.project-card').last().screenshot({ path: `${output}/roland-${width}.png` });
        await page.getByText('Website coming 18 September', { exact: true }).waitFor();
        for (const card of await page.locator('.project-card').all()) {
          const buttons = await card.locator('.project-thumbnails button').all();
          for (const button of buttons) {
            await button.click();
            assert.equal(await button.getAttribute('aria-pressed'), 'true');
            const main = card.locator('.project-visual img');
            await main.evaluate(i => i.decode());
            assert.ok(await main.evaluate(i => i.naturalWidth > 0));
          }
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(JSON.stringify({ output, routes: 2, widths: 3, projects: 8, images: 22, galleryChecks: 'passed', errors }));
})().catch(error => { console.error(error); process.exit(1); });
