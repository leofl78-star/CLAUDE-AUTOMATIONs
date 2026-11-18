// Gera os MP4. Uso:
//   node render.js            -> os dois formatos em out/
//   node render.js v          -> só vertical (1080x1920)
//   node render.js h          -> só horizontal (1920x1080)
//   node render.js stills v 2 9 25   -> PNGs de conferência nos segundos pedidos
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const FPS = 30, DURATION = 60;
const SIZE = { v: [1080, 1920], h: [1920, 1080] };
const NAME = { v: 'dopamina-cocaina-vertical-1080x1920.mp4', h: 'dopamina-cocaina-horizontal-1920x1080.mp4' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function openPage(browser, port, format) {
  const [w, h] = SIZE[format];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.error('erro na página:', e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${port}/index.html?format=${format}&capture=1`);
  await page.waitForFunction('window.ready === true');
  await page.evaluate(() => document.fonts.load('900 40px Inter'));
  return page;
}

async function renderVideo(browser, port, format) {
  const page = await openPage(browser, port, format);
  const file = path.join(OUT, NAME[format]);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', file,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, bad) => ff.on('close', (c) => (c === 0 ? ok() : bad(new Error('ffmpeg saiu com código ' + c)))));
  const total = FPS * DURATION;
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const url = await page.evaluate((n) => window.frameData(n), i);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
    if (i % 300 === 0) console.log(`${format}: quadro ${i}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await done;
  await page.close();
  console.log('pronto:', file);
}

async function renderStills(browser, port, format, times) {
  const page = await openPage(browser, port, format);
  for (const t of times) {
    await page.evaluate((n) => window.renderFrame(n), Math.round(t * FPS));
    const file = path.join(OUT, `still-${format}-${String(t).padStart(4, '0')}.png`);
    await page.locator('canvas').screenshot({ path: file });
    console.log('still:', file);
  }
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const args = process.argv.slice(2);
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch();
  try {
    if (args[0] === 'stills') {
      await renderStills(browser, port, args[1] || 'v', args.slice(2).map(Number));
    } else {
      for (const f of (args.length ? args : ['v', 'h'])) await renderVideo(browser, port, f);
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
