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
  const out: Record<string, Array<{ title: string; href: string; svg: string | null }>> = {};

  for (const t of tabs) {
    const stackHeading = page.getByText('TOOLS BEHIND', { exact: false }).first();
    await stackHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    const box = await page.evaluate((tabName) => {
      const candidates = Array.from(document.querySelectorAll('p, span, div'))
        .filter((el) => (el.textContent || '').trim() === tabName)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, r };
        })
        .filter((x) => x.r.width > 10 && x.r.height > 10 && x.r.left < 600);
      const target = candidates[candidates.length - 1];
      if (!target) return null;
      return {
        x: target.r.left + target.r.width / 2,
        y: target.r.top + target.r.height / 2,
      };
    }, t);

    if (box) {
      await page.mouse.click(box.x, box.y);
      await page.waitForTimeout(550);
    }

    const cards = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter((a) =>
          /figma|adobe|designsystems|framer\.com\/\?via|react\.dev|typescriptlang|storybook|gsap|motion\.dev|lottiefiles|spline\.design|blender\.org|threejs\.org|rive\.app/i.test(
            a.href,
          ),
        )
        .map((a) => {
          const svgs = Array.from(a.querySelectorAll('svg')).filter((s) => {
            const h = s.outerHTML;
            return (
              !h.includes('sci-fi-clip') &&
              !h.includes('corner-glow') &&
              !h.includes('0 0 12 12') &&
              !h.includes('M 4 8') &&
              h.length > 40
            );
          });
          const iconSvg = svgs[0];
          let resolvedSvg: string | null = null;
          if (iconSvg) {
            const clone = iconSvg.cloneNode(true) as SVGElement;
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            clone.setAttribute('width', '24');
            clone.setAttribute('height', '24');
            clone.removeAttribute('style');
            const uses = Array.from(clone.querySelectorAll('use'));
            for (const u of uses) {
              const ref = u.getAttribute('href') || u.getAttribute('xlink:href');
              if (ref && ref.startsWith('#')) {
                const tpl = document.getElementById(ref.slice(1));
                if (tpl) {
                  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                  wrapper.innerHTML = tpl.innerHTML;
                  u.replaceWith(wrapper);
                }
              }
            }
            resolvedSvg = clone.outerHTML
              .replace(/var\(--[^,)]+,\s*([^)]+)\)/g, '$1')
              .replace(/rgb\(255,\s*255,\s*255\)/g, '#ffffff')
              .replace(/currentColor/g, '#ffffff');
          }
          return {
            title: a.innerText.trim().split(/\n/)[0] || '',
            href: a.href,
            svg: resolvedSvg,
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
      if (item.svg && !item.svg.includes('<use')) {
        fs.writeFileSync(path.join('public/assets/icons/tools', `${slug}.svg`), item.svg, 'utf8');
        saved++;
      } else {
        console.log('FAILED RESOLVE:', cat, slug);
      }
    }
  }

  fs.writeFileSync('research/reference/assets/tool-icons-extracted.json', JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved resolved tool SVGs:', saved, Object.entries(out).map(([k, v]) => `${k}=[${v.map((x) => x.title).join(',')}]`).join(' | '));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
