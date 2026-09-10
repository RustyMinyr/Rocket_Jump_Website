const sharp = require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const source = 'output/portfolio-refresh-2026-09-10';
const destination = 'public/work/portfolio';
const assets = {
  'ecfilm-home': 'ecfilm-01-home-viewport.png',
  'ecfilm-courses': 'ecfilm-03-courses-viewport.png',
  'ecfilm-locations': 'ecfilm-05-locations-viewport.png',
  'studio-gq-home': '01-studio-gq-website-monitor.png',
  'studio-gq-services': '02-studio-gq-services-laptop.png',
  'studio-gq-booking': '04-studio-gq-booking-tablet.png',
  'rooiko-home': 'rooiko-01-homepage.png',
  'rooiko-services': 'rooiko-02-services.png',
  'rooiko-hardware': 'rooiko-03-hardware.png',
  'drone-division-home': 'drone-division-01-homepage.png',
  'drone-division-studio': 'drone-division-05-laptop-studio.png',
  'drone-division-technology': 'drone-division-03-technology.png',
  'dasu-home': 'exec-ac154c4c-4188-4f22-b1a6-652d8a1deb83.png',
  'dasu-review': 'dasu-03-review.jpg',
  'dasu-send': 'dasu-02-send.jpg',
  'dasu-team': 'dasu-01-team-management.jpg',
  'unopened-home': 'unopened-launch-hero-1920x1080.png',
  'unopened-collection': 'unopened-launch-collection-1920x1080.png',
  'airko-home': 'airko-01-airko-homepage.jpg',
  'airko-platform': 'airko-02-airko-platform.jpg',
  'airko-team': 'airko-03-airko-team-layout.jpg',
  'roland-home': 'roland-landing.png',
};
(async () => {
  await fs.mkdir(destination, { recursive: true });
  const thumbnails = [];
  for (const [name, file] of Object.entries(assets)) {
    const output = path.join(destination, name + '.webp');
    await sharp(path.join(source, file)).resize({ width: 1600, height: 1100, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(output);
    const thumb = await sharp(output).resize(480, 300, { fit: 'contain', background: '#111111' }).toBuffer();
    thumbnails.push({ input: thumb, left: (thumbnails.length % 3) * 480, top: Math.floor(thumbnails.length / 3) * 300 });
    console.log(name, (await fs.stat(output)).size);
  }
  await sharp({ create: { width: 1440, height: Math.ceil(thumbnails.length / 3) * 300, channels: 3, background: '#111111' } }).composite(thumbnails).jpeg().toFile(path.join(source, 'contact-sheet.jpg'));
})().catch(error => { console.error(error); process.exit(1); });
