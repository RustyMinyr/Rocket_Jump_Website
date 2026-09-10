const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const output = path.resolve('public/brand/examples');
const assets = [
  ['airko.webp', 'C:/Users/brad/Documents/ChatGPT/AirKo/airko-platform/public/brand/airko-wordmark-reference.png', 1000],
  ['ec-film.svg', 'C:/Users/brad/Documents/EC Film/public/brand/logos/ec-film-resource-primary-full-colour.svg'],
  ['studio-gq.webp', 'C:/Users/brad/Documents/Studio GQ Website/public/logos/studio-gq-white.png', 640],
  ['drone-division.webp', 'C:/Users/brad/Documents/DroneDivision Website/public/drone-division-logo.png', 1200],
  ['dasu.svg', 'C:/Users/brad/Documents/ChatGPT/Dasu/public/brand/dasu/wordmark-light.svg'],
  ['unopened-lockup.webp', 'C:/Users/brad/Documents/ChatGPT/Unopened Website/public/brand/unopened-logo.png', 1536],
  ['roland.webp', 'C:/Users/brad/Documents/ChatGPT/Roland/public/brand/roland-big-personality.png', 1536],
  ['dasu-campaign.webp', 'C:/Users/brad/Documents/Fondri2/output/branding/dasu-2026-09-09/dasu-brand-hero.png', 1400],
  ['dasu-stationery.webp', 'C:/Users/brad/Documents/Fondri2/output/branding/dasu-2026-09-09/dasu-stationery.png', 1400],
];

(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const [name, source, width] of assets) {
    const destination = path.join(output, name);
    if (name.endsWith('.svg')) await fs.copyFile(source, destination);
    else await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 92 }).toFile(destination);
    console.log(name, (await fs.stat(destination)).size, 'bytes');
  }
})();
