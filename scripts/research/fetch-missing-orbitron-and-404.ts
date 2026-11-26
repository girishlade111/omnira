import { chromium } from 'playwright';
import * as fs from 'node:fs';
import sharp from 'sharp';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Inspect 404 portal element
  await page.goto('https://omnira.framer.website/nonexistent-check-404', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const portalInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map((i) => ({
      src: i.currentSrc || i.src,
      w: i.naturalWidth,
      h: i.naturalHeight,
      rect: i.getBoundingClientRect(),
    }));
    const videos = Array.from(document.querySelectorAll('video')).map((v) => ({
      src: v.currentSrc || v.src,
      poster: v.poster,
      rect: v.getBoundingClientRect(),
    }));
    const canvases = Array.from(document.querySelectorAll('canvas')).map((c) => ({
      w: c.width,
      h: c.height,
      rect: c.getBoundingClientRect(),
    }));
    return { imgs, videos, canvases };
  });
  console.log('404 Portal DOM:', JSON.stringify(portalInfo, null, 2));

  // Capture clean crop of portal if it's canvas/video/img, or download img/poster
  if (portalInfo.imgs[0]?.src) {
    const r = await fetch(portalInfo.imgs[0].src);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync('assets-source/original/brand/not-found-portal.jpg', buf);
    await sharp(buf).webp({ quality: 90 }).toFile('public/assets/images/brand/not-found-portal.webp');
    await sharp(buf).avif({ quality: 68 }).toFile('public/assets/images/brand/not-found-portal.avif');
    fs.copyFileSync('assets-source/original/brand/not-found-portal.jpg', 'public/assets/images/brand/not-found-portal.jpg');
    console.log('Updated 404 portal image from img src:', portalInfo.imgs[0].src);
  } else if (portalInfo.videos[0]?.src) {
    const r = await fetch(portalInfo.videos[0].src);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.mkdirSync('public/assets/videos', { recursive: true });
    fs.mkdirSync('assets-source/original/videos', { recursive: true });
    fs.writeFileSync('assets-source/original/videos/not-found-portal.mp4', buf);
    fs.writeFileSync('public/assets/videos/not-found-portal.mp4', buf);
    console.log('Downloaded 404 portal video:', portalInfo.videos[0].src, buf.length);
  }

  // 2. Check Orbitron @font-face URLs on live homepage
  await page.goto('https://omnira.framer.website/', { waitUntil: 'networkidle' });
  const fontCss = await page.evaluate(() => {
    const sheets = Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').join('\n');
    const matches = sheets.match(/@font-face\s*\{[^}]*Orbitron[^}]*\}/gi) || [];
    return matches;
  });
  console.log('Live Orbitron @font-face count:', fontCss.length);
  fs.writeFileSync('research/reference/typography/font-discovery/orbitron-faces.json', JSON.stringify(fontCss, null, 2));

  // Download missing Orbitron weights (400, 600, 700)
  let addedCss = '';
  for (const rule of fontCss) {
    const weightMatch = rule.match(/font-weight:\s*(\d+)/i);
    const urlMatch = rule.match(/url\(([^)]+)\)/i);
    const rangeMatch = rule.match(/unicode-range:\s*([^;]+)/i);
    if (!weightMatch || !urlMatch) continue;
    const weight = weightMatch[1];
    const url = urlMatch[1].replace(/["']/g, '');
    if (['400', '500', '600', '700', '900'].includes(weight)) {
      const range = rangeMatch ? rangeMatch[1] : '';
      const isLatin = !range || range.includes('U+0000-00FF');
      if (!isLatin) continue;
      const filename = `orbitron-${weight}-normal-latin.woff2`;
      const dest = `public/assets/fonts/${filename}`;
      const orig = `assets-source/original/fonts/${filename}`;
      if (!fs.existsSync(dest)) {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.mkdirSync('assets-source/original/fonts', { recursive: true });
          fs.writeFileSync(orig, buf);
          fs.writeFileSync(dest, buf);
          console.log('Downloaded Orbitron weight', weight, buf.length);
        }
      }
      if (!['500', '900'].includes(weight)) {
        addedCss += `\n@font-face {\n  font-family: 'Orbitron';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/assets/fonts/${filename}') format('woff2');\n  unicode-range: ${range};\n}\n`;
      }
    }
  }

  if (addedCss) {
    const currentCss = fs.readFileSync('public/assets/fonts/fonts.css', 'utf8');
    if (!currentCss.includes('orbitron-600-normal-latin.woff2')) {
      fs.writeFileSync('public/assets/fonts/fonts.css', currentCss + addedCss, 'utf8');
      console.log('Appended Orbitron 400/600/700 rules to fonts.css');
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
