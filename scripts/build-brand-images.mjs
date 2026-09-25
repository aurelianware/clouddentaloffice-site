// Renders the PNG share image and PNG/ICO favicons from the SVGs in /brand.
// Re-run after replacing the brand files:
//
//   npm i --no-save puppeteer-core
//   CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//     node scripts/build-brand-images.mjs
//
// Outputs (committed; the site has no build step):
//   og-image.png            1200x630 share image
//   favicon-32x32.png, favicon.ico, apple-touch-icon.png (180),
//   brand/cdo-icon-192.png, brand/cdo-icon-512.png

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = process.env.SITE_ROOT ?? resolve(import.meta.dirname, '..');
const svg = (name) => readFileSync(resolve(root, 'brand', name), 'utf8');
const dataUri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;

const icon = dataUri(svg('cdo-icon.svg'));
const lockup = dataUri(svg('cdo-horizontal-on-dark.svg'));

const iconPage = (size) => `<!doctype html><html><body style="margin:0;background:#000">
  <img src="${icon}" width="${size}" height="${size}" style="display:block"></body></html>`;

const ogPage = `<!doctype html><html><head><style>
  body { margin:0; width:1200px; height:630px; background:#000; overflow:hidden;
         font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif; }
  .grid { position:absolute; inset:0;
          background-image:linear-gradient(rgba(0,255,255,.06) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(0,255,255,.06) 1px,transparent 1px);
          background-size:48px 48px; }
  .glow { position:absolute; inset:0; background:radial-gradient(ellipse at 30% 40%,rgba(0,255,255,.16),transparent 60%); }
  .wrap { position:absolute; left:96px; right:96px; top:0; bottom:0; display:flex; flex-direction:column; justify-content:center; }
  img { width:630px; height:auto; }
  p { color:#e6e6e6; font-size:40px; line-height:1.3; font-weight:600; margin:48px 0 0; max-width:900px; }
  .bar { position:absolute; left:0; right:0; bottom:0; height:8px; background:linear-gradient(90deg,#00ffff,#00ff88); }
</style></head><body><div class="grid"></div><div class="glow"></div>
  <div class="wrap"><img src="${lockup}" alt="">
  <p>Scheduling, eligibility, claims, and payments for dental practices.</p></div>
  <div class="bar"></div></body></html>`;

// ICO container holding a single PNG image (supported by every current browser).
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage();

async function render(html, width, height, out) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } });
  if (out) writeFileSync(resolve(root, out), png);
  return png;
}

await render(ogPage, 1200, 630, 'og-image.png');
const fav32 = await render(iconPage(32), 32, 32, 'favicon-32x32.png');
writeFileSync(resolve(root, 'favicon.ico'), ico(fav32, 32));
await render(iconPage(180), 180, 180, 'apple-touch-icon.png');
await render(iconPage(192), 192, 192, 'brand/cdo-icon-192.png');
await render(iconPage(512), 512, 512, 'brand/cdo-icon-512.png');

await browser.close();
console.log('Wrote og-image.png, favicons, and brand/cdo-icon-{192,512}.png');
