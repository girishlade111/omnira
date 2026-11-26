import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright';

const BASE_URL = 'https://omnira.framer.website';
const OUT_CONTENT_DIR = path.resolve(process.cwd(), 'research/reference/content');
const OUT_MANIFEST_DIR = path.resolve(process.cwd(), 'research/manifests');

function cleanText(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

async function scrollThroughPage(page: Page, stepPx = 700, delayMs = 180): Promise<void> {
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= totalHeight; y += stepPx) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(delayMs);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}

async function main() {
  fs.mkdirSync(OUT_CONTENT_DIR, { recursive: true });
  fs.mkdirSync(OUT_MANIFEST_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // =========================================================================
  // 1. ROUTES & 404 AUDIT
  // =========================================================================
  console.log('[1/6] Auditing routes & 404...');
  const routeChecks = [
    '/',
    '/about',
    '/works',
    '/contact',
    '/404',
    '/does-not-exist-404',
    '/works/brandora',
    '/projects/brandora',
    '/sitemap.xml',
    '/robots.txt',
  ];

  const routesReport: Record<string, unknown>[] = [];
  const allInternalLinks = new Set<string>();
  const allExternalLinks = new Map<string, Set<string>>();

  for (const route of routeChecks) {
    const url = `${BASE_URL}${route}`;
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(800);
    const status = response?.status() ?? null;
    const finalUrl = page.url();
    const contentType = response?.headers()['content-type'] ?? '';

    if (route.endsWith('.xml') || route.endsWith('.txt')) {
      const rawBody = await page.evaluate(() => document.body?.innerText ?? '');
      routesReport.push({
        route,
        requestedUrl: url,
        finalUrl,
        status,
        contentType,
        bodyPreview: rawBody.slice(0, 1200),
      });
      continue;
    }

    const meta = await page.evaluate(() => {
      const title = document.title;
      const canonical =
        document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
      const description =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null;
      const og: Record<string, string> = {};
      for (const m of document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')) {
        const key = m.getAttribute('property') || m.getAttribute('name');
        const val = m.getAttribute('content');
        if (key && val) og[key] = val;
      }
      const h1 = [...document.querySelectorAll('h1')].map((el) =>
        (el.textContent ?? '').replace(/\s+/g, ' ').trim()
      );
      const links = [...document.querySelectorAll('a[href]')].map((a) => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
        target: a.getAttribute('target') || null,
        rel: a.getAttribute('rel') || null,
      }));
      return { title, canonical, description, robots, og, h1, links };
    });

    const internal: { href: string; text: string }[] = [];
    const external: { href: string; text: string; target: string | null }[] = [];
    for (const l of meta.links) {
      if (
        l.href.startsWith('/') ||
        l.href.startsWith('./') ||
        l.href.startsWith(BASE_URL)
      ) {
        internal.push({ href: l.href, text: l.text });
        allInternalLinks.add(l.href);
      } else if (l.href.startsWith('http://') || l.href.startsWith('https://')) {
        external.push({ href: l.href, text: l.text, target: l.target });
        if (!allExternalLinks.has(l.href)) allExternalLinks.set(l.href, new Set());
        allExternalLinks.get(l.href)!.add(route);
      }
    }

    routesReport.push({
      route,
      requestedUrl: url,
      finalUrl,
      status,
      contentType,
      title: meta.title,
      canonical: meta.canonical,
      description: meta.description,
      robots: meta.robots,
      og: meta.og,
      h1: meta.h1,
      internalLinks: internal,
      externalLinks: external,
    });
  }

  // =========================================================================
  // 2. WORKS PAGE (12 vs 27 DISCREPANCY + ALL FILTERS)
  // =========================================================================
  console.log('[2/6] Extracting /works & testing pagination/filters...');
  await page.goto(`${BASE_URL}/works`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  const extractWorksCards = async () => {
    return page.evaluate(() => {
      const cards = [...document.querySelectorAll('a[href]')].filter((a) => {
        const href = a.getAttribute('href') || '';
        return (
          (href.includes('.framer.website') || href.includes('.framer.ai')) &&
          !href.includes('omnira.framer.website') &&
          !href.includes('stylokit.com') &&
          !href.includes('framer.com')
        );
      });
      return cards.map((a, index) => {
        const rect = a.getBoundingClientRect();
        const style = window.getComputedStyle(a);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden';
        const img = a.querySelector('img');
        const headingEl = a.querySelector('[data-framer-name="Heading"], h2, h3, h4');
        const domainEl = a.querySelector('[data-framer-name="Supporting text"]');
        const texts = [...a.querySelectorAll('p, h1, h2, h3, h4, span')]
          .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
          .filter(Boolean);
        return {
          index,
          visible,
          title: headingEl
            ? (headingEl.textContent ?? '').replace(/\s+/g, ' ').trim()
            : texts[0] ?? '',
          displayDomain: domainEl
            ? (domainEl.textContent ?? '').replace(/\s+/g, ' ').trim()
            : texts[1] ?? '',
          externalUrl: a.getAttribute('href') || '',
          thumbnailSrc: img?.getAttribute('src') || '',
          thumbnailAlt: img?.getAttribute('alt') || '',
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        };
      });
    });
  };

  const worksInitialCards = await extractWorksCards();
  const initialHeight = await page.evaluate(() => document.body.scrollHeight);

  // Slowly scroll down and wait at bottom / spinner to see if Framer Load More triggers
  const paginationSnapshots: { step: number; scrollY: number; height: number; cardCount: number; hasSpinner: boolean }[] = [];
  for (let step = 0; step < 12; step++) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), h);
    await page.waitForTimeout(1200);
    const snap = await page.evaluate(() => {
      const spinner = document.querySelector('[data-framer-name="Loading"]');
      const spinnerRect = spinner?.getBoundingClientRect();
      const hasSpinner = Boolean(spinner && spinnerRect && spinnerRect.height > 0);
      const cards = [...document.querySelectorAll('a[href]')].filter((a) => {
        const href = a.getAttribute('href') || '';
        return (
          (href.includes('.framer.website') || href.includes('.framer.ai')) &&
          !href.includes('omnira.framer.website')
        );
      });
      return {
        height: document.body.scrollHeight,
        cardCount: cards.length,
        hasSpinner,
      };
    });
    paginationSnapshots.push({ step, scrollY: h, ...snap });
    if (step >= 2 && snap.cardCount === paginationSnapshots[step - 1].cardCount && !snap.hasSpinner) {
      break;
    }
  }

  // Also test clicking the Loading/Spinner element if present
  const spinnerInfo = await page.evaluate(() => {
    const el = document.querySelector('[data-framer-name="Loading"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      present: true,
      text: (el.textContent ?? '').trim(),
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      rect: { w: rect.width, h: rect.height },
    };
  });

  if (spinnerInfo?.present) {
    try {
      await page.locator('[data-framer-name="Loading"]').first().click({ timeout: 2000, force: true });
      await page.waitForTimeout(1500);
    } catch {
      // ignore if not clickable
    }
  }

  const worksAfterScrollCards = await extractWorksCards();

  // Scroll back to top and click every filter
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const filterLabels = ['ALL PROJECTS', 'AI', 'BUSINESS', 'ONE PAGE', 'PORTFOLIO'];
  const worksByFilter: Record<string, unknown> = {};

  for (const label of filterLabels) {
    const filterLoc = page.locator('[data-framer-name="Filter/Works filter"]').locator(`text="${label}"`).first();
    const fallbackLoc = page.locator(`button, a, div[role="button"], [data-framer-name]`).filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();
    const target = (await filterLoc.count()) > 0 ? filterLoc : fallbackLoc;

    if ((await target.count()) > 0) {
      await target.scrollIntoViewIfNeeded();
      await target.click({ force: true });
      await page.waitForTimeout(1200);
      // Scroll through filtered list in case lazy images or load more fires
      await scrollThroughPage(page, 900, 250);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const cards = await extractWorksCards();
      worksByFilter[label] = {
        clicked: true,
        totalDomCards: cards.length,
        visibleCount: cards.filter((c) => c.visible).length,
        cards,
      };
    } else {
      worksByFilter[label] = { clicked: false, error: 'Filter control not found' };
    }
  }

  // Click ALL PROJECTS back to inspect hidden/mobile variants in DOM
  const allBtn = page.locator(`text="ALL PROJECTS"`).first();
  if ((await allBtn.count()) > 0) {
    await allBtn.click({ force: true });
    await page.waitForTimeout(800);
  }

  // =========================================================================
  // 3. HOMEPAGE INTERACTIVE DATA (/)
  // =========================================================================
  console.log('[3/6] Extracting Homepage (/) interactive data...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  // 3a. Hero rotating headline phrases over 15s
  const heroPhrasesSamples: { tMs: number; h1Text: string; heroTexts: string[] }[] = [];
  const startHero = Date.now();
  while (Date.now() - startHero < 15500) {
    const sample = await page.evaluate(() => {
      const hero = document.querySelector('[data-framer-name="Hero section"]') || document.body;
      const h1 = hero.querySelector('h1');
      const headerTexts = [...hero.querySelectorAll('[data-framer-name="Header"] p, [data-framer-name="Header"] h1, [data-framer-name="Header"] h2, [data-framer-name="Yellow"]')]
        .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      return {
        h1Text: (h1?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        heroTexts: [...new Set(headerTexts)],
      };
    });
    heroPhrasesSamples.push({ tMs: Date.now() - startHero, ...sample });
    await page.waitForTimeout(250);
  }

  const uniqueHeroHeadlines = [...new Set(heroPhrasesSamples.map((s) => s.h1Text).filter(Boolean))];
  const uniqueYellowPhrases = [...new Set(heroPhrasesSamples.flatMap((s) => s.heroTexts).filter(Boolean))];

  // Scroll through homepage slowly so all scroll triggers & counters fire
  await scrollThroughPage(page, 600, 220);

  // 3b. Hero static copy, status, CTAs
  const homeHeroStatic = await page.evaluate(() => {
    const hero = document.querySelector('[data-framer-name="Hero section"]');
    if (!hero) return null;
    const status = (hero.querySelector('[data-framer-name="Status"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const desc = (hero.querySelector('[data-framer-name="Description"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const ctas = [...hero.querySelectorAll('a')].map((a) => ({
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    return { status, desc, ctas };
  });

  // 3c. Home Selected Works preview
  const homeProjects = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="Projects"]');
    if (!sec) return null;
    const cards = [...sec.querySelectorAll('a[href]')].filter((a) => {
      const h = a.getAttribute('href') || '';
      return h.includes('.framer.website') || h.includes('.framer.ai');
    });
    return {
      sectionText: (sec.querySelector('[data-framer-name="Section header"], [data-framer-name="Leading content"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      cardCount: cards.length,
      cards: cards.map((a) => ({
        title: (a.querySelector('[data-framer-name="Heading"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        domain: (a.querySelector('[data-framer-name="Supporting text"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href') || '',
        img: a.querySelector('img')?.getAttribute('src') || '',
      })),
    };
  });

  // 3d. Process 4 phases + metrics
  const processSection = page.locator('[data-framer-name="Process"]').first();
  if ((await processSection.count()) > 0) {
    const box = await processSection.boundingBox();
    if (box) {
      for (let frac = 0; frac <= 1; frac += 0.2) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(box.y + box.height * frac));
        await page.waitForTimeout(450);
      }
    }
  }
  const homeProcess = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="Process"]');
    if (!sec) return null;
    const phases = ['Content-1', 'Content-2', 'Content-3', 'Content-4'].map((name) => {
      const el = sec.querySelector(`[data-framer-name="${name}"]`);
      if (!el) return null;
      return {
        key: name,
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
        lines: [...el.querySelectorAll('h1, h2, h3, h4, p, span')]
          .map((n) => (n.textContent ?? '').replace(/\s+/g, ' ').trim())
          .filter(Boolean),
      };
    });
    const fullText = (sec.textContent ?? '').replace(/\s+/g, ' ').trim();
    return { phases, fullText };
  });

  // 3e. About preview stats & capabilities
  const homeAboutPreview = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="About"]');
    if (!sec) return null;
    const stats = [...sec.querySelectorAll('[data-framer-name="Stats item"], [data-framer-name="Number"]')].map((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
    const listItems = [...sec.querySelectorAll('[data-framer-name="List"] > div, [data-framer-name="List"] p')].map((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
    const fullText = (sec.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {
      stats: [...new Set(stats)].filter(Boolean),
      listItems: [...new Set(listItems)].filter(Boolean),
      fullText,
    };
  });

  // 3f. Services 4 items + test hover vs click vs scroll selection
  const servicesSection = page.locator('[data-framer-name="Services"]').first();
  if ((await servicesSection.count()) > 0) {
    await servicesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }

  const homeServicesInteractionTest: Record<string, unknown>[] = [];
  const serviceTabCount = await page.locator('[data-framer-name="Services"] [data-framer-name="Tabs"] > div').count();
  for (let i = 0; i < Math.max(serviceTabCount, 4); i++) {
    const tab = page.locator('[data-framer-name="Services"] [data-framer-name="Tabs"] > div').nth(i);
    if ((await tab.count()) === 0) break;
    await tab.scrollIntoViewIfNeeded();
    const beforeText = cleanText(await tab.textContent());
    await tab.hover({ force: true });
    await page.waitForTimeout(350);
    const afterHover = await page.evaluate((idx) => {
      const tabs = document.querySelectorAll('[data-framer-name="Services"] [data-framer-name="Tabs"] > div');
      const el = tabs[idx];
      return {
        text: (el?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        hasActiveName: Boolean(el?.querySelector('[data-framer-name*="Acitve"], [data-framer-name*="Active"]')),
        height: el?.getBoundingClientRect().height ?? 0,
      };
    }, i);
    await tab.click({ force: true });
    await page.waitForTimeout(500);
    const afterClick = await page.evaluate((idx) => {
      const sec = document.querySelector('[data-framer-name="Services"]');
      const tabs = sec?.querySelectorAll('[data-framer-name="Tabs"] > div') ?? [];
      const el = tabs[idx];
      const imgs = [...(sec?.querySelectorAll('img') ?? [])].map((img) => ({
        src: img.getAttribute('src'),
        opacity: window.getComputedStyle(img).opacity,
      }));
      return {
        text: (el?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        hasActiveName: Boolean(el?.querySelector('[data-framer-name*="Acitve"], [data-framer-name*="Active"]')),
        height: el?.getBoundingClientRect().height ?? 0,
        deliverables: [...(el?.querySelectorAll('[data-framer-name="List text"], li, p') ?? [])]
          .map((n) => (n.textContent ?? '').replace(/\s+/g, ' ').trim())
          .filter(Boolean),
        sectionImages: imgs,
      };
    }, i);
    homeServicesInteractionTest.push({
      index: i,
      beforeText,
      afterHover,
      afterClick,
    });
  }

  // 3g. Testimonials (6 slides via Next/Back arrows) + Client Satisfaction + Partner logos
  const testimonialsData = await (async () => {
    // Scroll to Review section
    const reviewLoc = page.locator('[data-framer-name="Review"]').first();
    if ((await reviewLoc.count()) > 0) {
      await reviewLoc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    const readSlide = () =>
      page.evaluate(() => {
        const rev = document.querySelector('[data-framer-name="Review"]');
        if (!rev) return null;
        const text = (rev.textContent ?? '').replace(/\s+/g, ' ').trim();
        const fullName = (rev.querySelector('[data-framer-name="Full name"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const role = (rev.querySelector('[data-framer-name="Role"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const score = (rev.querySelector('[data-framer-name="Score"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const avatar = rev.querySelector('[data-framer-name="Avatar"] img')?.getAttribute('src') || null;
        const buttons = [...rev.querySelectorAll('button, [role="button"], [data-framer-name*="Arrow"], [data-framer-name*="Next"], [data-framer-name*="Prev"], [data-framer-name*="Back"], svg')]
          .map((b) => ({
            tag: b.tagName,
            ariaLabel: b.getAttribute('aria-label'),
            framerName: b.getAttribute('data-framer-name'),
          }));
        return { fullName, role, score, avatar, text, buttonsCount: buttons.length };
      });

    const slides: unknown[] = [];
    const seen = new Set<string>();
    const initial = await readSlide();
    if (initial) {
      slides.push({ step: 0, ...initial });
      seen.add(initial.text);
    }

    // Find Next button inside Review section
    const nextBtn = page
      .locator('[data-framer-name="Review"] button, [data-framer-name="Review"] [role="button"], [data-framer-name="Review"] [aria-label*="next" i], [data-framer-name="Review"] [aria-label*="Next" i]')
      .last();

    for (let s = 1; s <= 7; s++) {
      // Try clicking the second button (typically Back = 0, Next = 1)
      const btns = page.locator('[data-framer-name="Review"] button, [data-framer-name="Review"] [role="button"]');
      const count = await btns.count();
      const target = count >= 2 ? btns.nth(1) : nextBtn;
      if ((await target.count()) === 0) break;
      await target.click({ force: true });
      await page.waitForTimeout(550);
      const slide = await readSlide();
      if (slide) {
        slides.push({ step: s, ...slide });
        seen.add(slide.text);
      }
    }

    const logosAndSatisfaction = await page.evaluate(() => {
      const logoCloud = document.querySelector('[data-framer-name="Logo cloud"]');
      const rev = document.querySelector('[data-framer-name="Review"]');
      const containerText = (rev?.closest('section, div[data-framer-name*="Section"]')?.textContent ?? '').replace(/\s+/g, ' ').trim();
      const logos = [...(logoCloud?.querySelectorAll('img, svg') ?? [])].map((el) => ({
        tag: el.tagName,
        src: el.getAttribute('src'),
        alt: el.getAttribute('alt'),
      }));
      return {
        logoCount: logos.length,
        logos,
        logoCloudText: (logoCloud?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        containerText,
      };
    });

    return { slides, uniqueSlidesCount: seen.size, ...logosAndSatisfaction };
  })();

  // 3h. Pricing 3 packages + assurance strip
  const homePricing = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, p')].filter((el) =>
      /pricing|transparent/i.test(el.textContent ?? '')
    );
    const pricingRoot = headings[0]?.closest('section, div[data-framer-name^="Section"]') || document.body;
    const pricingSection =
      [...document.querySelectorAll('[data-framer-name]')].find((el) =>
        /pricing/i.test(el.getAttribute('data-framer-name') || '')
      ) || pricingRoot;
    return {
      framerName: pricingSection.getAttribute('data-framer-name'),
      text: (pricingSection.textContent ?? '').replace(/\s+/g, ' ').trim(),
    };
  });

  // 3i. FAQ all 8 expanded answers (click each!)
  const homeFaqs = await (async () => {
    const accordions = page.locator('[data-framer-name="Accordions"] > div, [data-framer-name="Question area"]');
    // Better: find all elements containing Question row
    const qRows = page.locator('[data-framer-name="Question row"]');
    const count = await qRows.count();
    const items: { index: number; question: string; beforeText: string; afterText: string; expandedAnswer: string }[] = [];

    for (let i = 0; i < count; i++) {
      const row = qRows.nth(i);
      await row.scrollIntoViewIfNeeded();
      const question = cleanText(await row.textContent());
      // Parent card is usually 1 or 2 levels up (the accordion item container)
      const beforeText = await row.evaluate((el) => {
        const card = el.closest('[data-framer-name="Closed"], [data-framer-name="Open"]') || el.parentElement?.parentElement;
        return (card?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });
      await row.click({ force: true });
      await page.waitForTimeout(450);
      const afterText = await row.evaluate((el) => {
        const card = el.closest('[data-framer-name="Closed"], [data-framer-name="Open"]') || el.parentElement?.parentElement;
        return (card?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });
      const expandedAnswer = afterText.startsWith(beforeText)
        ? afterText.slice(beforeText.length).trim()
        : afterText.replace(question, '').trim();
      items.push({ index: i, question, beforeText, afterText, expandedAnswer });
    }
    return { count, items };
  })();

  // =========================================================================
  // 4. ABOUT PAGE INTERACTIVE DATA (/about)
  // =========================================================================
  console.log('[4/6] Extracting /about interactive data...');
  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);
  await scrollThroughPage(page, 600, 180);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const aboutStatic = await page.evaluate(() => {
    const header = document.querySelector('[data-framer-name="Page header"]');
    const aboutMe = document.querySelector('[data-framer-name="About me"]');
    const stats = [...document.querySelectorAll('[data-framer-name="Stats item"]')].map((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
    const services = document.querySelector('[data-framer-name="Services"]');
    return {
      headerText: (header?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      stats,
      aboutMeText: (aboutMe?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      servicesText: (services?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    };
  });

  // 4b. Terminal ("How it works") 5 steps & interaction
  const aboutTerminal = await (async () => {
    const sec = page.locator('[data-framer-name="How it works"]').first();
    if ((await sec.count()) === 0) return null;
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const initialText = cleanText(await sec.textContent());
    // Find clickable step triggers inside How it works
    const stepCandidates = await sec.evaluate((root) => {
      const els = [...root.querySelectorAll('div, button, a')].filter((el) => {
        const t = (el.textContent ?? '').trim();
        const cs = window.getComputedStyle(el);
        return (
          cs.cursor === 'pointer' ||
          /^(01|02|03|04|05)\b/.test(t) ||
          el.getAttribute('role') === 'button' ||
          el.tagName === 'BUTTON'
        );
      });
      return els.slice(0, 30).map((el, i) => ({
        i,
        tag: el.tagName,
        framerName: el.getAttribute('data-framer-name'),
        cursor: window.getComputedStyle(el).cursor,
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120),
      }));
    });

    const stepSnapshots: unknown[] = [];
    // Click elements with data-framer-name matching step numbers or cursor pointer
    const clickableSteps = sec.locator('[data-framer-name="Number"], [data-framer-name="BG border"], [data-framer-name="Default"], [data-framer-name="Inactive"], button');
    const stepCount = await clickableSteps.count();
    for (let i = 0; i < Math.min(stepCount, 12); i++) {
      const el = clickableSteps.nth(i);
      const t = cleanText(await el.textContent());
      if (!t || t.length > 150) continue;
      await el.click({ force: true }).catch(() => {});
      await page.waitForTimeout(450);
      const after = cleanText(await sec.textContent());
      stepSnapshots.push({ clickedIndex: i, clickedLabel: t, terminalText: after });
    }

    // Test pressing Enter key while focused inside terminal section
    await sec.click({ force: true }).catch(() => {});
    await page.keyboard.press('Enter');
    await page.waitForTimeout(450);
    const afterEnterText = cleanText(await sec.textContent());

    return {
      initialText,
      stepCandidates,
      stepSnapshots,
      afterEnterText,
    };
  })();

  // 4c. Timeline 7 years (2020-2026)
  const aboutTimeline = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="Timeline"]');
    if (!sec) return null;
    const cards = [...sec.querySelectorAll('[data-framer-name="Cards"] > div')].map((card, i) => ({
      index: i,
      framerName: card.getAttribute('data-framer-name'),
      text: (card.textContent ?? '').replace(/\s+/g, ' ').trim(),
      img: card.querySelector('img')?.getAttribute('src') || null,
    }));
    return {
      fullText: (sec.textContent ?? '').replace(/\s+/g, ' ').trim(),
      cards,
    };
  });

  // 4d. System Stack all 4 tabs (DESIGN, DEVELOPMENT, MOTION, 3D / VISUAL)
  const aboutSystemStack = await (async () => {
    const tabLabels = ['DESIGN', 'DEVELOPMENT', 'MOTION', '3D / VISUAL'];
    const tabsData: Record<string, unknown> = {};

    // Locate the Tools / System Stack section
    const toolsHeader = page.locator('text=/SYSTEM STACK|TOOLS/i').first();
    if ((await toolsHeader.count()) > 0) {
      await toolsHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    for (const label of tabLabels) {
      const tabBtn = page
        .locator('[data-framer-name="Tabs"] div, [data-framer-name="Tabs"] button, [data-framer-name="Tabs"] a')
        .filter({ hasText: new RegExp(`^\\s*${label.replace('/', '\\/')}\\s*$`, 'i') })
        .first();
      if ((await tabBtn.count()) > 0) {
        await tabBtn.scrollIntoViewIfNeeded();
        await tabBtn.click({ force: true });
        await page.waitForTimeout(650);
      }
      const extracted = await page.evaluate(() => {
        // Find all external tool links currently visible in the System Stack grid
        const toolCards = [...document.querySelectorAll('a[href^="http"]')].filter((a) => {
          const href = a.getAttribute('href') || '';
          const rect = a.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            !href.includes('omnira.framer.website') &&
            !href.includes('stylokit.com') &&
            !href.includes('framer.com/marketplace') &&
            !href.includes('linkedin.com') &&
            !href.includes('x.com') &&
            !href.includes('twitter.com') &&
            !href.includes('google.com/maps')
          );
        });
        return toolCards.map((a) => {
          const img = a.querySelector('img');
          const svg = a.querySelector('svg');
          const texts = [...a.querySelectorAll('h1, h2, h3, h4, p, span')]
            .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
            .filter(Boolean);
          return {
            title: texts[0] ?? '',
            description: texts[1] ?? '',
            allTexts: [...new Set(texts)],
            href: a.getAttribute('href') || '',
            iconSrc: img?.getAttribute('src') || null,
            hasSvgIcon: Boolean(svg),
          };
        });
      });
      tabsData[label] = extracted;
    }
    return tabsData;
  })();

  // =========================================================================
  // 5. CONTACT PAGE INTERACTIVE DATA (/contact) — DO NOT SUBMIT
  // =========================================================================
  console.log('[5/6] Extracting /contact interactive data (no submit)...');
  await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  const contactData = await page.evaluate(() => {
    const contactSec = document.querySelector('[data-framer-name="Contact"]');
    const mailtos = [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => ({
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    const locationLinks = [...document.querySelectorAll('[data-framer-name="Location"] a, a[href*="maps"]')].map((a) => ({
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    const statusRows = [...document.querySelectorAll('[data-framer-name="Status"]')].map((el) =>
      (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    );

    const form = document.querySelector('form');
    const visibleFields = [...(form?.querySelectorAll('input, select, textarea') ?? [])]
      .filter((el) => {
        const htmlEl = el as HTMLElement;
        return htmlEl.getAttribute('aria-hidden') !== 'true' && htmlEl.tabIndex !== -1;
      })
      .map((el, idx) => {
        const labelEl = el.closest('label') || el.parentElement?.previousElementSibling;
        const selectEl = el as HTMLSelectElement;
        return {
          index: idx,
          tagName: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || (el.tagName === 'SELECT' ? 'select' : el.tagName.toLowerCase()),
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          required: el.hasAttribute('required'),
          labelText: (labelEl?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          options:
            el.tagName === 'SELECT'
              ? [...selectEl.options].map((o) => ({ value: o.value, label: (o.textContent ?? '').trim() }))
              : undefined,
        };
      });

    const honeypotFields = [...(form?.querySelectorAll('input[aria-hidden="true"], input[tabindex="-1"]') ?? [])].map((el) => ({
      name: el.getAttribute('name'),
      type: el.getAttribute('type'),
    }));

    const submitButton = form?.querySelector('button[type="submit"], input[type="submit"]');

    return {
      headerText: (contactSec?.querySelector('[data-framer-name="Header"], [data-framer-name="Leading content"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      statusRows,
      mailtos,
      locationLinks,
      visibleFields,
      honeypotFields,
      submitButtonText: (submitButton?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    };
  });

  // Also click/focus each select element to verify interactive focus/dropdown options
  const selectLocs = page.locator('form select');
  const selectCount = await selectLocs.count();
  const dropdownInteractionCheck: unknown[] = [];
  for (let i = 0; i < selectCount; i++) {
    const sel = selectLocs.nth(i);
    await sel.scrollIntoViewIfNeeded();
    await sel.focus();
    const opts = await sel.evaluate((el) =>
      [...(el as HTMLSelectElement).options].map((o) => ({ value: o.value, label: (o.textContent ?? '').trim() }))
    );
    dropdownInteractionCheck.push({ index: i, options: opts });
  }

  // =========================================================================
  // 6. FOOTER & LIVE CLOCK TIMEZONE CHECK
  // =========================================================================
  console.log('[6/6] Checking Footer & Live Clock timezone...');
  const nowUtc = new Date();
  const footerData = await page.evaluate(() => {
    const footer = document.querySelector('[data-framer-name="Footer"]') || document.querySelector('footer');
    const timeEl = document.querySelector('[data-framer-name="Time"]');
    const rowContact = [...document.querySelectorAll('[data-framer-name="Link & icon"], [data-framer-name="Social group"] a')];
    const links = [...(footer?.querySelectorAll('a[href]') ?? []), ...rowContact].map((a) => ({
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    const statusText = [...document.querySelectorAll('[data-framer-name="Status"]')].map((s) =>
      (s.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
    return {
      clockText: (timeEl?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      footerText: (footer?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      links,
      statusText,
    };
  });

  const formatTimeInZone = (d: Date, timeZone: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);

  const timezoneComparison = {
    capturedAtIso: nowUtc.toISOString(),
    renderedClockText: footerData.clockText,
    localZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    zones: {
      local: formatTimeInZone(nowUtc, Intl.DateTimeFormat().resolvedOptions().timeZone),
      UTC: formatTimeInZone(nowUtc, 'UTC'),
      'Europe/Berlin': formatTimeInZone(nowUtc, 'Europe/Berlin'),
      'Europe/London': formatTimeInZone(nowUtc, 'Europe/London'),
      'Europe/Kyiv': formatTimeInZone(nowUtc, 'Europe/Kyiv'),
      'America/New_York': formatTimeInZone(nowUtc, 'America/New_York'),
      'America/Los_Angeles': formatTimeInZone(nowUtc, 'America/Los_Angeles'),
      'Asia/Kolkata': formatTimeInZone(nowUtc, 'Asia/Kolkata'),
    },
  };

  await browser.close();

  // =========================================================================
  // RECONCILE PROJECTS (12 LIVE vs 27 CMS / USER SCREENSHOT)
  // =========================================================================
  const cmsProjectsPath = path.join(OUT_CONTENT_DIR, 'mD0yv0kks-chunk-default-0.framercms.decoded.json');
  const cmsCategoriesPath = path.join(OUT_CONTENT_DIR, 'a_FhlAd4Y-chunk-default-0.framercms.decoded.json');
  const cmsProjectsRaw: any[] = fs.existsSync(cmsProjectsPath)
    ? JSON.parse(fs.readFileSync(cmsProjectsPath, 'utf8'))
    : [];
  const cmsCategoriesRaw: any[] = fs.existsSync(cmsCategoriesPath)
    ? JSON.parse(fs.readFileSync(cmsCategoriesPath, 'utf8'))
    : [];
  const catById = new Map<string, { label: string; slug: string }>(
    cmsCategoriesRaw.map((c) => [c.id, { label: c.QAN3gAK7o, slug: c.aGN8XKkXq }])
  );

  const liveAll = (worksByFilter['ALL PROJECTS'] as any)?.cards ?? worksAfterScrollCards;
  const liveBySlugOrUrl = new Map<string, any>();
  for (const c of liveAll) {
    liveBySlugOrUrl.set(c.externalUrl, c);
  }

  const reconciledProjects = cmsProjectsRaw.map((item, idx) => {
    const cat = catById.get(item.O5iwyiTAI) ?? { label: 'UNKNOWN', slug: 'unknown' };
    const liveMatch = liveBySlugOrUrl.get(item.oWgNH1Iud);
    return {
      order: idx + 1,
      cmsId: item.id,
      slug: item.u8GCKzMS9,
      title: item.PU8bteqhK,
      cmsDisplayDomain: item.wQuPbj7YZ,
      externalUrl: item.oWgNH1Iud,
      category: cat.label,
      categorySlug: cat.slug,
      thumbnailUrl: item.dsL5yhyYV?.src ?? null,
      thumbnailWidth: item.dsL5yhyYV?.pixelWidth ?? 1600,
      thumbnailHeight: item.dsL5yhyYV?.pixelHeight ?? 1200,
      presentInLiveInitial12: Boolean(liveMatch),
      presentInUserScreenshot27: true,
    };
  });

  // =========================================================================
  // WRITE OUTPUTS
  // =========================================================================
  const liveExtraction = {
    extractedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    home: {
      hero: {
        ...homeHeroStatic,
        observedHeadlines: uniqueHeroHeadlines,
        observedYellowPhrases: uniqueYellowPhrases,
        samplesCount: heroPhrasesSamples.length,
        samplesPreview: heroPhrasesSamples.filter(
          (s, i, arr) => i === 0 || s.h1Text !== arr[i - 1].h1Text
        ),
      },
      selectedProjects: homeProjects,
      process: homeProcess,
      aboutPreview: homeAboutPreview,
      services: homeServicesInteractionTest,
      testimonials: testimonialsData,
      pricing: homePricing,
      faq: homeFaqs,
    },
    about: {
      static: aboutStatic,
      terminal: aboutTerminal,
      timeline: aboutTimeline,
      systemStack: aboutSystemStack,
    },
    works: {
      initialHeight,
      initialCardCount: worksInitialCards.length,
      afterScrollCardCount: worksAfterScrollCards.length,
      spinnerInfo,
      paginationSnapshots,
      byFilter: worksByFilter,
    },
    contact: {
      ...contactData,
      dropdownInteractionCheck,
    },
    footer: {
      ...footerData,
      timezoneComparison,
    },
  };

  const projectsReconciled = {
    generatedAt: new Date().toISOString(),
    summary: {
      liveAllProjectsCount: liveAll.length,
      cmsTotalCount: cmsProjectsRaw.length,
      userScreenshotCount: 27,
      discrepancyReason:
        'Live /works Framer page configures its CMS Collection List query with limit: 12 and includes a Load More / Loading spinner block, whereas the underlying Framer CMS collection (mD0yv0kks) and the user-provided full-page Works screenshot contain all 27 projects.',
      categories: cmsCategoriesRaw.map((c) => ({
        id: c.id,
        label: c.QAN3gAK7o,
        slug: c.aGN8XKkXq,
        cmsCount: cmsProjectsRaw.filter((p) => p.O5iwyiTAI === c.id).length,
        liveFilterCount: ((worksByFilter[c.QAN3gAK7o] as any)?.cards ?? []).length,
      })),
    },
    projects: reconciledProjects,
  };

  const routesManifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    sitemapUrls: [
      'https://omnira.framer.website/',
      'https://omnira.framer.website/about',
      'https://omnira.framer.website/works',
      'https://omnira.framer.website/contact',
      'https://omnira.framer.website/404',
    ],
    hasInternalProjectDetailRoutes: false,
    projectDetailPattern: 'External links to *.framer.website / *.framer.ai',
    routes: routesReport,
    uniqueInternalLinks: [...allInternalLinks],
    uniqueExternalLinks: [...allExternalLinks.entries()].map(([href, foundOn]) => ({
      href,
      foundOn: [...foundOn],
    })),
  };

  const interactionsManifest = {
    generatedAt: new Date().toISOString(),
    interactions: {
      heroHeadlineRotation: {
        phrases: uniqueHeroHeadlines,
        yellowPhrases: uniqueYellowPhrases,
        transitions: heroPhrasesSamples.filter(
          (s, i, arr) => i === 0 || s.h1Text !== arr[i - 1].h1Text
        ),
      },
      worksFilters: Object.fromEntries(
        Object.entries(worksByFilter).map(([k, v]: [string, any]) => [
          k,
          { count: v.cards?.length ?? 0, titles: (v.cards ?? []).map((c: any) => c.title) },
        ])
      ),
      servicesTabs: homeServicesInteractionTest,
      testimonialCarousel: {
        slideCount: testimonialsData.uniqueSlidesCount,
        slides: testimonialsData.slides,
      },
      faqAccordions: {
        count: homeFaqs.count,
        items: homeFaqs.items,
      },
      aboutTerminal: aboutTerminal,
      aboutSystemStackTabs: Object.fromEntries(
        Object.entries(aboutSystemStack).map(([k, v]: [string, any]) => [
          k,
          { count: Array.isArray(v) ? v.length : 0, tools: v },
        ])
      ),
      contactDropdowns: dropdownInteractionCheck,
      footerLiveClock: timezoneComparison,
    },
  };

  fs.writeFileSync(
    path.join(OUT_CONTENT_DIR, 'live-extraction.json'),
    JSON.stringify(liveExtraction, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_CONTENT_DIR, 'projects-reconciled.json'),
    JSON.stringify(projectsReconciled, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_MANIFEST_DIR, 'routes.json'),
    JSON.stringify(routesManifest, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_MANIFEST_DIR, 'interactions.json'),
    JSON.stringify(interactionsManifest, null, 2)
  );

  console.log('Done! Wrote live-extraction.json, projects-reconciled.json, routes.json, interactions.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
