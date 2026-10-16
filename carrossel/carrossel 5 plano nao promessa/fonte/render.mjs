// Renders every .slide in carousel.html to a 1080x1440 PNG.
// Usage: node render.mjs <outDir>
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] || path.join(here, 'out'));
fs.mkdirSync(outDir, { recursive: true });
// drop stale slide PNGs only (NN_name.png); never delete the folder itself
for (const f of fs.readdirSync(outDir)) if (/^\d{2}_.+\.png$/.test(f)) fs.rmSync(path.join(outDir, f));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1160, height: 1520 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, 'carousel.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(i => i.complete));
const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
if (broken.length) { console.error('broken images:', broken); process.exit(1); }

const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.style}`));
console.log('fonts loaded:', [...new Set(fonts)].join(', '));

const slides = await page.$$('.slide');
for (const [i, el] of slides.entries()) {
  const name = await el.getAttribute('data-name');
  const file = path.join(outDir, `${String(i + 1).padStart(2, '0')}_${name || 'slide'}.png`);
  await el.screenshot({ path: file });
  console.log('wrote', file);
}
await browser.close();
