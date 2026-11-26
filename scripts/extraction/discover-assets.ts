import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium, type Page, type Response } from 'playwright';

interface DiscoveredImage {
  url: string;
  baseUrl: string;
  srcsetUrls: string[];
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
  renderWidth: number;
  renderHeight: number;
  framerName: string | null;
  sectionContext: string;
  pageUrl: string;
  state: string;
  sourceKind: 'img' | 'picture-source' | 'css-background' | 'css-mask' | 'meta-icon' | 'cms-chunk' | 'html-chunk' | 'network';
}

interface DiscoveredSvg {
  hash: string;
  outerHtml: string;
  viewBox: string | null;
  width: number;
  height: number;
  framerName: string | null;
  sectionContext: string;
  pageUrl: string;
  state: string;
  isUseRef: boolean;
  hrefRef: string | null;
}

interface DiscoveredFont {
  family: string;
  weight: string;
  style: string;
  unicodeRange: string | null;
  url: string;
  format: string | null;
  source: 'style-tag' | 'stylesheet' | 'network' | 'html-regex';
  pageUrl: string;
}

interface DiscoveredMedia {
  tag: 'video' | 'canvas' | 'source';
  url: string | null;
  poster: string | null;
  width: number;
  height: number;
  framerName: string | null;
  sectionContext: string;
  pageUrl: string;
  state: string;
  extra?: Record<string, unknown>;
}

interface NetworkAsset {
  url: string;
  baseUrl: string;
  status: number;
  contentType: string;
  contentLength: number;
  resourceType: string;
  pageUrl: string;
}

const ROUTES = [
  { name: 'home', url: 'https://omnira.framer.website/' },
  { name: 'about', url: 'https://omnira.framer.website/about' },
  { name: 'works', url: 'https://omnira.framer.website/works' },
  { name: 'contact', url: 'https://omnira.framer.website/contact' },
  { name: '404', url: 'https://omnira.framer.website/404' },
];

const OUT_DIR = path.resolve('research/reference/assets');
const OUT_FILE = path.join(OUT_DIR, 'discovered-assets.json');

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function stripQuery(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

function parseSrcsetUrls(srcset: string | null | undefined): string[] {
  if (!srcset) return [];
  return srcset
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter((u) => u && u.startsWith('http'));
}

async function scrollFullPage(page: Page): Promise<void> {
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 700;
  for (let y = 0; y <= totalHeight; y += step) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function extractDomSnapshot(page: Page, pageUrl: string, state: string) {
  return page.evaluate(
    ({ pageUrlArg, stateArg }) => {
      function getContext(el: Element | null): string {
        const parts: string[] = [];
        let cur: Element | null = el;
        let depth = 0;
        while (cur && depth < 10) {
          const fname = cur.getAttribute('data-framer-name');
          const id = cur.id;
          const tag = cur.tagName.toLowerCase();
          if (fname) parts.push(fname);
          else if (id && !id.startsWith('framer')) parts.push(`#${id}`);
          else if (tag === 'section' || tag === 'header' || tag === 'footer' || tag === 'nav' || tag === 'main') {
            parts.push(tag);
          }
          cur = cur.parentElement;
          depth++;
        }
        return parts.reverse().join(' > ') || 'body';
      }

      const imgs: Array<{
        url: string;
        srcset: string;
        alt: string;
        naturalWidth: number;
        naturalHeight: number;
        renderWidth: number;
        renderHeight: number;
        framerName: string | null;
        sectionContext: string;
      }> = [];

      document.querySelectorAll('img').forEach((img) => {
        const rect = img.getBoundingClientRect();
        const url = img.currentSrc || img.src || img.getAttribute('src') || '';
        if (!url) return;
        imgs.push({
          url,
          srcset: img.srcset || '',
          alt: img.alt || '',
          naturalWidth: img.naturalWidth || 0,
          naturalHeight: img.naturalHeight || 0,
          renderWidth: Math.round(rect.width),
          renderHeight: Math.round(rect.height),
          framerName: img.getAttribute('data-framer-name') || img.closest('[data-framer-name]')?.getAttribute('data-framer-name') || null,
          sectionContext: getContext(img),
        });
      });

      const pictureSources: Array<{ srcset: string; type: string; media: string; sectionContext: string }> = [];
      document.querySelectorAll('picture source').forEach((src) => {
        const srcset = src.getAttribute('srcset') || '';
        if (srcset) {
          pictureSources.push({
            srcset,
            type: src.getAttribute('type') || '',
            media: src.getAttribute('media') || '',
            sectionContext: getContext(src),
          });
        }
      });

      const cssImages: Array<{ url: string; kind: 'css-background' | 'css-mask'; framerName: string | null; sectionContext: string; renderWidth: number; renderHeight: number }> = [];
      document.querySelectorAll('*').forEach((el) => {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        const mask = cs.maskImage || cs.webkitMaskImage;
        const rect = el.getBoundingClientRect();
        const extractUrls = (val: string, kind: 'css-background' | 'css-mask') => {
          if (!val || val === 'none') return;
          const matches = val.match(/url\(["']?(https?:\/\/[^"')]+|data:image\/[^"')]+)["']?\)/g);
          if (!matches) return;
          for (const m of matches) {
            const inner = m.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            cssImages.push({
              url: inner,
              kind,
              framerName: el.getAttribute('data-framer-name'),
              sectionContext: getContext(el),
              renderWidth: Math.round(rect.width),
              renderHeight: Math.round(rect.height),
            });
          }
        };
        extractUrls(bg, 'css-background');
        extractUrls(mask, 'css-mask');
      });

      const svgs: Array<{
        outerHtml: string;
        viewBox: string | null;
        width: number;
        height: number;
        framerName: string | null;
        sectionContext: string;
        isUseRef: boolean;
        hrefRef: string | null;
      }> = [];
      document.querySelectorAll('svg').forEach((svg) => {
        const rect = svg.getBoundingClientRect();
        const useEl = svg.querySelector('use');
        const hrefRef = useEl ? useEl.getAttribute('href') || useEl.getAttribute('xlink:href') : null;
        let resolvedHtml = svg.outerHTML;
        if (hrefRef && hrefRef.startsWith('#')) {
          const target = document.getElementById(hrefRef.slice(1));
          if (target) {
            resolvedHtml = `${svg.outerHTML}<!-- symbol:${target.outerHTML} -->`;
          }
        }
        svgs.push({
          outerHtml: resolvedHtml,
          viewBox: svg.getAttribute('viewBox'),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          framerName: svg.getAttribute('data-framer-name') || svg.closest('[data-framer-name]')?.getAttribute('data-framer-name') || null,
          sectionContext: getContext(svg),
          isUseRef: Boolean(useEl),
          hrefRef,
        });
      });

      const media: Array<{
        tag: 'video' | 'canvas' | 'source';
        url: string | null;
        poster: string | null;
        width: number;
        height: number;
        framerName: string | null;
        sectionContext: string;
        extra?: Record<string, unknown>;
      }> = [];

      document.querySelectorAll('video').forEach((v) => {
        const rect = v.getBoundingClientRect();
        media.push({
          tag: 'video',
          url: v.currentSrc || v.src || v.querySelector('source')?.src || null,
          poster: v.poster || null,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          framerName: v.getAttribute('data-framer-name') || v.closest('[data-framer-name]')?.getAttribute('data-framer-name') || null,
          sectionContext: getContext(v),
          extra: { autoplay: v.autoplay, loop: v.loop, muted: v.muted },
        });
      });

      document.querySelectorAll('canvas').forEach((c) => {
        const rect = c.getBoundingClientRect();
        let contextType = 'unknown';
        try {
          if (c.getContext('webgl2')) contextType = 'webgl2';
          else if (c.getContext('webgl')) contextType = 'webgl';
          else if (c.getContext('2d')) contextType = '2d';
        } catch {
          contextType = 'locked';
        }
        media.push({
          tag: 'canvas',
          url: null,
          poster: null,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          framerName: c.getAttribute('data-framer-name') || c.closest('[data-framer-name]')?.getAttribute('data-framer-name') || null,
          sectionContext: getContext(c),
          extra: { attrWidth: c.width, attrHeight: c.height, contextType },
        });
      });

      const metaAssets: Array<{ url: string; alt: string; context: string }> = [];
      document.querySelectorAll('link[rel*="icon"], meta[property="og:image"], meta[name="twitter:image"]').forEach((el) => {
        const url = el.getAttribute('href') || el.getAttribute('content') || '';
        if (url) {
          metaAssets.push({
            url,
            alt: el.getAttribute('rel') || el.getAttribute('property') || el.getAttribute('name') || 'meta',
            context: el.outerHTML.slice(0, 180),
          });
        }
      });

      const fontFaces: Array<{ family: string; weight: string; style: string; unicodeRange: string | null; src: string; source: 'style-tag' | 'stylesheet' }> = [];
      document.querySelectorAll('style').forEach((styleEl) => {
        const css = styleEl.textContent || '';
        if (!css.includes('@font-face')) return;
        const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
        for (const block of blocks) {
          const family = block.match(/font-family:\s*([^;]+)/i)?.[1]?.replace(/["']/g, '').trim() || '';
          const weight = block.match(/font-weight:\s*([^;]+)/i)?.[1]?.trim() || '400';
          const style = block.match(/font-style:\s*([^;]+)/i)?.[1]?.trim() || 'normal';
          const unicodeRange = block.match(/unicode-range:\s*([^;]+)/i)?.[1]?.trim() || null;
          const src = block.match(/src:\s*([^;]+)/i)?.[1]?.trim() || '';
          fontFaces.push({ family, weight, style, unicodeRange, src, source: 'style-tag' });
        }
      });

      return { pageUrl: pageUrlArg, state: stateArg, imgs, pictureSources, cssImages, svgs, media, metaAssets, fontFaces };
    },
    { pageUrlArg: pageUrl, stateArg: state },
  );
}

async function clickInteractiveStates(page: Page, routeName: string, snapshots: Array<Awaited<ReturnType<typeof extractDomSnapshot>>>) {
  if (routeName === 'home') {
    // 4 Services tabs
    const serviceKeywords = ['WEB DESIGN', 'FRAMER DEVELOPMENT', 'UI/UX', 'BRAND', '01', '02', '03', '04'];
    const serviceButtons = page.locator('[data-framer-name*="Service"], [data-framer-name*="Tab"], section button, [role="tab"]');
    const count = await serviceButtons.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = serviceButtons.nth(i);
      const txt = ((await btn.innerText().catch(() => '')) || '').trim();
      if (txt && serviceKeywords.some((k) => txt.toUpperCase().includes(k))) {
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(450);
        snapshots.push(await extractDomSnapshot(page, page.url(), `services-click-${i}:${txt.slice(0, 24)}`));
      }
    }

    // Testimonials next button (6 slides)
    const nextBtn = page.locator('[aria-label*="Next" i], [data-framer-name*="Next" i], button:has-text("Next"), [data-framer-name*="Arrow"] >> nth=1');
    if ((await nextBtn.count()) > 0) {
      for (let i = 0; i < 6; i++) {
        await nextBtn.first().scrollIntoViewIfNeeded().catch(() => {});
        await nextBtn.first().click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        snapshots.push(await extractDomSnapshot(page, page.url(), `testimonial-slide-${i + 1}`));
      }
    }

    // FAQ items
    const faqButtons = page.locator('[data-framer-name*="FAQ" i] [role="button"], [data-framer-name*="Faq" i]');
    const faqCount = await faqButtons.count();
    for (let i = 0; i < Math.min(faqCount, 12); i++) {
      await faqButtons.nth(i).click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(200);
    }
    if (faqCount > 0) {
      snapshots.push(await extractDomSnapshot(page, page.url(), 'faq-expanded'));
    }
  }

  if (routeName === 'about') {
    // Timeline years 2020..2026
    for (const year of ['2020', '2021', '2022', '2023', '2024', '2025', '2026']) {
      const loc = page.getByText(year, { exact: true }).first();
      if ((await loc.count()) > 0) {
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        snapshots.push(await extractDomSnapshot(page, page.url(), `timeline-${year}`));
      }
    }

    // System stack tabs: DESIGN, DEVELOPMENT, MOTION, 3D / VISUAL
    for (const tab of ['DESIGN', 'DEVELOPMENT', 'MOTION', '3D / VISUAL']) {
      const loc = page.getByText(tab, { exact: true }).first();
      if ((await loc.count()) > 0) {
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        snapshots.push(await extractDomSnapshot(page, page.url(), `stack-tab-${tab.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`));
      }
    }
  }

  if (routeName === 'works') {
    for (const filter of ['ALL PROJECTS', 'AI', 'BUSINESS', 'ONE PAGE', 'PORTFOLIO']) {
      const loc = page.getByText(filter, { exact: true }).first();
      if ((await loc.count()) > 0) {
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(450);
        snapshots.push(await extractDomSnapshot(page, page.url(), `works-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`));
      }
    }
  }
}

function scanStaticFiles() {
  const staticUrls = new Set<string>();
  const fontFaceUrls: DiscoveredFont[] = [];

  const htmlDir = path.resolve('research/reference/html');
  if (fs.existsSync(htmlDir)) {
    for (const file of fs.readdirSync(htmlDir)) {
      if (!file.endsWith('.html')) continue;
      if (file.startsWith('framer-') || file.startsWith('stylokit') || file.startsWith('framplates')) continue;
      const html = fs.readFileSync(path.join(htmlDir, file), 'utf8');
      const urlMatches = html.match(/https?:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com|assets\.framer\.com)[^"'\`)\s<>\\]+/g) || [];
      for (const u of urlMatches) staticUrls.add(u.replace(/\\+$/, ''));

      const ffBlocks = html.match(/@font-face\s*\{[^}]+\}/g) || [];
      for (const block of ffBlocks) {
        const family = block.match(/font-family:\s*([^;]+)/i)?.[1]?.replace(/["']/g, '').trim() || '';
        const weight = block.match(/font-weight:\s*([^;]+)/i)?.[1]?.trim() || '400';
        const style = block.match(/font-style:\s*([^;]+)/i)?.[1]?.trim() || 'normal';
        const unicodeRange = block.match(/unicode-range:\s*([^;]+)/i)?.[1]?.trim() || null;
        const srcUrl = block.match(/url\(["']?([^"')]+)["']?\)/i)?.[1] || '';
        const format = block.match(/format\(["']?([^"')]+)["']?\)/i)?.[1] || null;
        if (srcUrl.startsWith('http')) {
          fontFaceUrls.push({ family, weight, style, unicodeRange, url: srcUrl, format, source: 'html-regex', pageUrl: file });
        }
      }
    }
  }

  const chunksDir = path.resolve('research/reference/technology/chunks');
  if (fs.existsSync(chunksDir)) {
    for (const file of fs.readdirSync(chunksDir)) {
      if (!file.endsWith('.mjs') && !file.endsWith('.js')) continue;
      const txt = fs.readFileSync(path.join(chunksDir, file), 'utf8');
      const urlMatches = txt.match(/https?:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com|assets\.framer\.com)[^"'\`)\s<>\\]+/g) || [];
      for (const u of urlMatches) staticUrls.add(u.replace(/\\+$/, ''));
    }
  }

  const cmsProjectsPath = path.resolve('research/reference/content/mD0yv0kks-chunk-default-0.framercms.decoded.json');
  const cmsProjects: Array<{
    id: string;
    title: string;
    slug: string;
    categoryId: string;
    domain: string;
    liveUrl: string;
    imageSrc: string;
    srcSetUrls: string[];
    width: number;
    height: number;
  }> = [];
  if (fs.existsSync(cmsProjectsPath)) {
    const raw = JSON.parse(fs.readFileSync(cmsProjectsPath, 'utf8'));
    for (const item of raw) {
      cmsProjects.push({
        id: item.id,
        title: item.PU8bteqhK,
        slug: item.u8GCKzMS9,
        categoryId: item.O5iwyiTAI,
        domain: item.wQuPbj7YZ,
        liveUrl: item.oWgNH1Iud,
        imageSrc: item.dsL5yhyYV?.src || '',
        srcSetUrls: parseSrcsetUrls(item.dsL5yhyYV?.srcSet),
        width: item.dsL5yhyYV?.pixelWidth || 0,
        height: item.dsL5yhyYV?.pixelHeight || 0,
      });
    }
  }

  return { staticUrls: [...staticUrls], fontFaceUrls, cmsProjects };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const networkAssets = new Map<string, NetworkAsset>();
  let currentPageUrl = ROUTES[0].url;

  page.on('response', async (res: Response) => {
    const req = res.request();
    const rType = req.resourceType();
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    const isMedia =
      ['image', 'font', 'media'].includes(rType) ||
      ct.startsWith('image/') ||
      ct.startsWith('font/') ||
      ct.startsWith('video/') ||
      /\.(woff2?|ttf|otf|svg|png|jpe?g|webp|avif|gif|mp4|webm)(\?|$)/i.test(url);
    if (!isMedia) return;
    if (!networkAssets.has(url)) {
      networkAssets.set(url, {
        url,
        baseUrl: stripQuery(url),
        status: res.status(),
        contentType: ct,
        contentLength: Number(res.headers()['content-length'] || 0),
        resourceType: rType,
        pageUrl: currentPageUrl,
      });
    }
  });

  const snapshots: Array<Awaited<ReturnType<typeof extractDomSnapshot>>> = [];

  for (const route of ROUTES) {
    currentPageUrl = route.url;
    console.log(`Discovering ${route.name} (${route.url})...`);
    await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(800);
    await scrollFullPage(page);
    snapshots.push(await extractDomSnapshot(page, route.url, 'initial-full-scroll'));
    await clickInteractiveStates(page, route.name, snapshots);
  }

  // Mobile menu check on /
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobilePage.on('response', (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (ct.startsWith('image/') || ct.startsWith('font/') || ct.startsWith('video/')) {
      if (!networkAssets.has(url)) {
        networkAssets.set(url, {
          url,
          baseUrl: stripQuery(url),
          status: res.status(),
          contentType: ct,
          contentLength: Number(res.headers()['content-length'] || 0),
          resourceType: res.request().resourceType(),
          pageUrl: 'https://omnira.framer.website/#mobile',
        });
      }
    }
  });
  await mobilePage.goto('https://omnira.framer.website/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await mobilePage.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await mobilePage.waitForTimeout(600);
  const menuBtn = mobilePage.locator('header [role="button"], header button, nav [role="button"], [data-framer-name*="Menu" i], [data-framer-name*="Hamburger" i]').first();
  if ((await menuBtn.count()) > 0) {
    await menuBtn.click({ timeout: 2000 }).catch(() => {});
    await mobilePage.waitForTimeout(500);
    snapshots.push(await extractDomSnapshot(mobilePage, 'https://omnira.framer.website/', 'mobile-menu-open'));
  }
  await mobilePage.close();
  await browser.close();

  // Deduplicate and organize discoveries
  const imagesByBase = new Map<string, DiscoveredImage>();
  const svgsByHash = new Map<string, DiscoveredSvg & { occurrences: number; contexts: string[] }>();
  const mediaList: DiscoveredMedia[] = [];
  const fontsByUrl = new Map<string, DiscoveredFont>();

  const registerImage = (item: DiscoveredImage) => {
    const existing = imagesByBase.get(item.baseUrl);
    if (!existing) {
      imagesByBase.set(item.baseUrl, item);
    } else {
      const mergedSrcset = new Set([...existing.srcsetUrls, ...item.srcsetUrls]);
      existing.srcsetUrls = [...mergedSrcset];
      if (!existing.alt && item.alt) existing.alt = item.alt;
      if (item.naturalWidth > existing.naturalWidth) {
        existing.url = item.url;
        existing.naturalWidth = item.naturalWidth;
        existing.naturalHeight = item.naturalHeight;
      }
      if (!existing.framerName && item.framerName) existing.framerName = item.framerName;
    }
  };

  for (const snap of snapshots) {
    for (const img of snap.imgs) {
      const srcsetUrls = parseSrcsetUrls(img.srcset);
      registerImage({
        url: img.url,
        baseUrl: stripQuery(img.url),
        srcsetUrls,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderWidth: img.renderWidth,
        renderHeight: img.renderHeight,
        framerName: img.framerName,
        sectionContext: img.sectionContext,
        pageUrl: snap.pageUrl,
        state: snap.state,
        sourceKind: 'img',
      });
    }
    for (const ps of snap.pictureSources) {
      for (const u of parseSrcsetUrls(ps.srcset)) {
        registerImage({
          url: u,
          baseUrl: stripQuery(u),
          srcsetUrls: [],
          alt: '',
          naturalWidth: 0,
          naturalHeight: 0,
          renderWidth: 0,
          renderHeight: 0,
          framerName: null,
          sectionContext: ps.sectionContext,
          pageUrl: snap.pageUrl,
          state: snap.state,
          sourceKind: 'picture-source',
        });
      }
    }
    for (const ci of snap.cssImages) {
      registerImage({
        url: ci.url,
        baseUrl: stripQuery(ci.url),
        srcsetUrls: [],
        alt: '',
        naturalWidth: 0,
        naturalHeight: 0,
        renderWidth: ci.renderWidth,
        renderHeight: ci.renderHeight,
        framerName: ci.framerName,
        sectionContext: ci.sectionContext,
        pageUrl: snap.pageUrl,
        state: snap.state,
        sourceKind: ci.kind,
      });
    }
    for (const m of snap.metaAssets) {
      registerImage({
        url: m.url,
        baseUrl: stripQuery(m.url),
        srcsetUrls: [],
        alt: m.alt,
        naturalWidth: 0,
        naturalHeight: 0,
        renderWidth: 0,
        renderHeight: 0,
        framerName: m.alt,
        sectionContext: 'head > meta/link',
        pageUrl: snap.pageUrl,
        state: snap.state,
        sourceKind: 'meta-icon',
      });
    }
    for (const svg of snap.svgs) {
      const hash = sha256(svg.outerHtml);
      const existing = svgsByHash.get(hash);
      if (!existing) {
        svgsByHash.set(hash, {
          ...svg,
          hash,
          pageUrl: snap.pageUrl,
          state: snap.state,
          occurrences: 1,
          contexts: [`${snap.pageUrl} [${snap.state}] ${svg.sectionContext}`],
        });
      } else {
        existing.occurrences++;
        const ctx = `${snap.pageUrl} [${snap.state}] ${svg.sectionContext}`;
        if (!existing.contexts.includes(ctx) && existing.contexts.length < 15) {
          existing.contexts.push(ctx);
        }
      }
    }
    for (const m of snap.media) {
      mediaList.push({ ...m, pageUrl: snap.pageUrl, state: snap.state });
    }
    for (const ff of snap.fontFaces) {
      const urlMatch = ff.src.match(/url\(["']?([^"')]+)["']?\)/i)?.[1];
      const format = ff.src.match(/format\(["']?([^"')]+)["']?\)/i)?.[1] || null;
      if (urlMatch && urlMatch.startsWith('http') && !fontsByUrl.has(urlMatch)) {
        fontsByUrl.set(urlMatch, {
          family: ff.family,
          weight: ff.weight,
          style: ff.style,
          unicodeRange: ff.unicodeRange,
          url: urlMatch,
          format,
          source: ff.source,
          pageUrl: snap.pageUrl,
        });
      }
    }
  }

  // Merge static HTML, chunks, CMS, and network assets
  const staticData = scanStaticFiles();
  for (const ff of staticData.fontFaceUrls) {
    if (!fontsByUrl.has(ff.url)) fontsByUrl.set(ff.url, ff);
  }
  for (const proj of staticData.cmsProjects) {
    if (proj.imageSrc) {
      registerImage({
        url: proj.imageSrc,
        baseUrl: stripQuery(proj.imageSrc),
        srcsetUrls: proj.srcSetUrls,
        alt: proj.title,
        naturalWidth: proj.width,
        naturalHeight: proj.height,
        renderWidth: 0,
        renderHeight: 0,
        framerName: `cms-project:${proj.slug}`,
        sectionContext: `CMS Project (${proj.title} - ${proj.domain})`,
        pageUrl: 'https://omnira.framer.website/works#cms',
        state: 'cms-chunk',
        sourceKind: 'cms-chunk',
      });
    }
  }
  for (const u of staticData.staticUrls) {
    if (/\.(woff2?|ttf|otf)(\?|$)/i.test(u)) {
      if (!fontsByUrl.has(u)) {
        fontsByUrl.set(u, {
          family: 'unknown-chunk-font',
          weight: 'unknown',
          style: 'normal',
          unicodeRange: null,
          url: u,
          format: path.extname(stripQuery(u)).slice(1) || null,
          source: 'html-regex',
          pageUrl: 'static-chunks',
        });
      }
    } else if (/\/images\//i.test(u) || /\.(png|jpe?g|webp|avif|svg|gif)(\?|$)/i.test(u)) {
      registerImage({
        url: u,
        baseUrl: stripQuery(u),
        srcsetUrls: [],
        alt: '',
        naturalWidth: 0,
        naturalHeight: 0,
        renderWidth: 0,
        renderHeight: 0,
        framerName: null,
        sectionContext: 'static-html-or-chunk',
        pageUrl: 'static-chunks',
        state: 'static-scan',
        sourceKind: 'html-chunk',
      });
    }
  }
  for (const net of networkAssets.values()) {
    if (net.resourceType === 'font' || net.contentType.startsWith('font/') || /\.(woff2?|ttf|otf)(\?|$)/i.test(net.url)) {
      if (!fontsByUrl.has(net.url)) {
        fontsByUrl.set(net.url, {
          family: 'network-font',
          weight: 'unknown',
          style: 'normal',
          unicodeRange: null,
          url: net.url,
          format: path.extname(net.baseUrl).slice(1) || null,
          source: 'network',
          pageUrl: net.pageUrl,
        });
      }
    } else if (net.contentType.startsWith('image/') || net.resourceType === 'image') {
      registerImage({
        url: net.url,
        baseUrl: net.baseUrl,
        srcsetUrls: [],
        alt: '',
        naturalWidth: 0,
        naturalHeight: 0,
        renderWidth: 0,
        renderHeight: 0,
        framerName: null,
        sectionContext: `network:${net.pageUrl}`,
        pageUrl: net.pageUrl,
        state: 'network',
        sourceKind: 'network',
      });
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      snapshotsCaptured: snapshots.length,
      uniqueImageBaseUrls: imagesByBase.size,
      uniqueInlineSvgs: svgsByHash.size,
      uniqueFontUrls: fontsByUrl.size,
      mediaElements: mediaList.length,
      networkAssetCount: networkAssets.size,
      cmsProjectsCount: staticData.cmsProjects.length,
    },
    cmsProjects: staticData.cmsProjects,
    images: [...imagesByBase.values()],
    inlineSvgs: [...svgsByHash.values()],
    fonts: [...fontsByUrl.values()],
    media: mediaList,
    networkAssets: [...networkAssets.values()],
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log('Discovery complete:', output.summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
