import { chromium } from 'playwright';
import * as fs from 'node:fs';
import sharp from 'sharp';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://omnira.framer.website/nonexistent-check-404', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const bgUrls = await page.evaluate(() => {
    const urls: Array<{ url: string; w: number; h: number; x: number; y: number }> = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.includes('url(')) {
        const r = el.getBoundingClientRect();
        urls.push({
          url: cs.backgroundImage,
          w: Math.round(r.width),
          h: Math.round(r.height),
          x: Math.round(r.x),
          y: Math.round(r.y),
        });
      }
    }
    return urls;
  });
  console.log('404 backgroundImages:', JSON.stringify(bgUrls, null, 2));

  // Also grab elementFromPoint(950, 350) outerHTML + styles
  const pointInfo = await page.evaluate(() => {
    const el = document.elementFromPoint(950, 350);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      bg: cs.backgroundImage,
      html: el.outerHTML.slice(0, 500),
      parentHtml: el.parentElement?.outerHTML.slice(0, 500),
    };
  });
  console.log('Point (950,350):', JSON.stringify(pointInfo, null, 2));

  // Find actual portal image URL or screenshot clean crop of the portal container
  const match = JSON.stringify(bgUrls).match(/https:\/\/framerusercontent\.com\/images\/[A-Za-z0-9_.-]+[^"')\s]*/);
  if (match && !match[0].includes('clI6TcT')) {
    const r = await fetch(match[0]);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync('assets-source/original/brand/not-found-portal.jpg', buf);
    await sharp(buf).webp({ quality: 90 }).toFile('public/assets/images/brand/not-found-portal.webp');
    await sharp(buf).avif({ quality: 68 }).toFile('public/assets/images/brand/not-found-portal.avif');
    fs.copyFileSync('assets-source/original/brand/not-found-portal.jpg', 'public/assets/images/brand/not-found-portal.jpg');
    console.log('Downloaded actual 404 portal bg image:', match[0], buf.length);
  } else {
    // Capture clean screenshot crop of the 404 portal area (excluding corners/text) from reference
    const clip = { x: 646, y: 158, width: 676, height: 556 };
    const buf = await page.screenshot({ clip });
    fs.writeFileSync('assets-source/original/brand/not-found-portal.png', buf);
    await sharp(buf).webp({ quality: 90 }).toFile('public/assets/images/brand/not-found-portal.webp');
    await sharp(buf).avif({ quality: 68 }).toFile('public/assets/images/brand/not-found-portal.avif');
    await sharp(buf).jpeg({ quality: 92 }).toFile('public/assets/images/brand/not-found-portal.jpg');
    console.log('Captured 404 portal artwork crop');
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
