import { chromium } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://omnira.framer.website/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  const tabs = ['DESIGN', 'DEVELOPMENT', 'MOTION', '3D / VISUAL'];
  const out: Record<string, Array<{ title: string; href: string; svg: string | null; img: string | null }>> = {};

  for (const t of tabs) {
    const tabEl = page.locator('[data-framer-name]').filter({ hasText: t }).last();
    await tabEl.scrollIntoViewIfNeeded().catch(() => {});
    await page.getByText(t, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(450);

    const cards = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter((a) =>
          /figma|adobe|designsystems|framer\.com\/\?via|react\.dev|typescriptlang|storybook|gsap|motion\.dev|lottiefiles|spline\.design|blender\.org|threejs\.org|rive\.app/i.test(
            a.href,
          ),
        )
        .map((a) => {
          const svgs = Array.from(a.querySelectorAll('svg'))
            .map((s) => s.outerHTML)
            .filter(
              (h) =>
                !h.includes('sci-fi-clip') &&
                !h.includes('corner-glow') &&
                !h.includes('0 0 12 12') &&
                !h.includes('M 4 8') &&
                h.length > 40,
            );
          const imgs = Array.from(a.querySelectorAll('img')).map((i) => i.src);
          return {
            title: a.innerText.trim().split(/\n/)[0] || '',
            href: a.href,
            svg: svgs[0] || null,
            img: imgs[0] || null,
          };
        });
    });
    out[t] = cards;
  }

  fs.mkdirSync('public/assets/icons/tools', { recursive: true });
  let saved = 0;
  for (const [cat, items] of Object.entries(out)) {
    for (const item of items) {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (item.svg) {
        let svg = item.svg;
        if (!svg.includes('xmlns=')) {
          svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        fs.writeFileSync(path.join('public/assets/icons/tools', `${slug}.svg`), svg, 'utf8');
        saved++;
      } else if (item.img) {
        console.log('IMG tool icon:', cat, slug, item.img);
      } else {
        console.log('NO SVG/IMG:', cat, item.title, item.href);
      }
    }
  }

  fs.writeFileSync('research/reference/assets/tool-icons-extracted.json', JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved tool SVGs:', saved);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
