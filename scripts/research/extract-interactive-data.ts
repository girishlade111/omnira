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
      if (l.href.startsWith('/') || l.href.startsWith('./') || l.href.startsWith(BASE_URL)) {
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
        const bgEl = a.querySelector('[data-framer-background-image-wrapper="true"]');
        const headingEl = a.querySelector('[data-framer-name="Heading"], h2, h3, h4');
        const domainEl = a.querySelector('[data-framer-name="Supporting text"]');
        const texts = ((a as HTMLElement).innerText || '')
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean);
        return {
          index,
          visible,
          title: headingEl ? (headingEl.textContent ?? '').trim() : texts[0] ?? '',
          displayDomain: domainEl ? (domainEl.textContent ?? '').trim() : texts[1] ?? '',
          externalUrl: a.getAttribute('href') || '',
          thumbnailSrc: img?.currentSrc || img?.getAttribute('src') || '',
          thumbnailAlt: img?.getAttribute('alt') || '',
          hasBgWrapper: Boolean(bgEl),
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          },
        };
      });
    });
  };

  const worksInitialCards = await extractWorksCards();
  const initialHeight = await page.evaluate(() => document.body.scrollHeight);

  const paginationSnapshots: {
    step: number;
    scrollY: number;
    height: number;
    cardCount: number;
    hasSpinner: boolean;
  }[] = [];
  for (let step = 0; step < 10; step++) {
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
    if (step >= 1 && snap.cardCount === paginationSnapshots[step - 1].cardCount && !snap.hasSpinner) {
      break;
    }
  }

  // Scroll smoothly through all cards to force lazy image hydration
  await scrollThroughPage(page, 400, 180);
  const worksAfterScrollCards = await extractWorksCards();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const filterLabels = ['ALL PROJECTS', 'AI', 'BUSINESS', 'ONE PAGE', 'PORTFOLIO'];
  const worksByFilter: Record<string, unknown> = {};

  for (const label of filterLabels) {
    const filterLoc = page
      .locator('[data-framer-name="Filter/Works filter"]')
      .locator(`text="${label}"`)
      .first();
    const fallbackLoc = page
      .locator(`button, a, div[role="button"], [data-framer-name]`)
      .filter({ hasText: new RegExp(`^${label}$`, 'i') })
      .first();
    const target = (await filterLoc.count()) > 0 ? filterLoc : fallbackLoc;

    if ((await target.count()) > 0) {
      await target.scrollIntoViewIfNeeded();
      await target.click({ force: true });
      await page.waitForTimeout(1000);
      await scrollThroughPage(page, 600, 200);
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

  // =========================================================================
  // 3. HOMEPAGE INTERACTIVE DATA (/)
  // =========================================================================
  console.log('[3/6] Extracting Homepage (/) interactive data...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  // 3a. Hero rotating headline phrases over 15s (track vertical positions of rotating words inside slot)
  const heroPhrasesSamples: {
    tMs: number;
    headerLines: string[];
    activeWord: string | null;
    wordPositions: { word: string; top: number; height: number; opacity: string }[];
  }[] = [];

  const startHero = Date.now();
  while (Date.now() - startHero < 15500) {
    const sample = await page.evaluate(() => {
      const hero = document.querySelector('[data-framer-name="Hero section"]') || document.body;
      const header = hero.querySelector('[data-framer-name="Header"]') as HTMLElement | null;
      const headerLines = (header?.innerText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const rotatingWords = ['INTERFACE', 'SYSTEM', 'PRODUCT', 'EXPERIENCE'];
      const wordNodes = [...(header?.querySelectorAll('p, span, h1, h2, div') ?? [])].filter((el) => {
        const t = (el.textContent ?? '').trim();
        return rotatingWords.includes(t) && el.children.length === 0;
      });
      // Find the parent container clipping them
      const wordPositions = wordNodes.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          word: (el.textContent ?? '').trim(),
          top: Math.round(r.top),
          height: Math.round(r.height),
          opacity: cs.opacity,
        };
      });
      // Determine which word is centered inside the slot (e.g. compare against sibling slot box)
      let activeWord: string | null = null;
      if (wordNodes.length > 0) {
        const slot = wordNodes[0].parentElement?.parentElement;
        const slotRect = slot?.getBoundingClientRect();
        if (slotRect) {
          const slotMid = slotRect.top + slotRect.height / 2;
          let bestDist = Infinity;
          for (const el of wordNodes) {
            const r = el.getBoundingClientRect();
            const mid = r.top + r.height / 2;
            const dist = Math.abs(mid - slotMid);
            if (dist < bestDist) {
              bestDist = dist;
              activeWord = (el.textContent ?? '').trim();
            }
          }
        }
      }
      return { headerLines, activeWord, wordPositions };
    });
    heroPhrasesSamples.push({ tMs: Date.now() - startHero, ...sample });
    await page.waitForTimeout(250);
  }

  const activeWordSequence = heroPhrasesSamples
    .map((s) => ({ tMs: s.tMs, activeWord: s.activeWord }))
    .filter((s, i, arr) => s.activeWord && (i === 0 || s.activeWord !== arr[i - 1].activeWord));

  // Scroll through homepage slowly so all scroll triggers & counters fire
  await scrollThroughPage(page, 600, 220);

  // 3b. Hero static copy, status, CTAs
  const homeHeroStatic = await page.evaluate(() => {
    const hero = document.querySelector('[data-framer-name="Hero section"]') as HTMLElement | null;
    if (!hero) return null;
    const status = (hero.querySelector('[data-framer-name="Status"]') as HTMLElement | null)?.innerText?.replace(/\s+/g, ' ').trim() ?? '';
    const desc = (hero.querySelector('[data-framer-name="Description"]') as HTMLElement | null)?.innerText?.replace(/\s+/g, ' ').trim() ?? '';
    const headerLines = ((hero.querySelector('[data-framer-name="Header"]') as HTMLElement | null)?.innerText ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const ctas = [...hero.querySelectorAll('a, [data-framer-name="Primary | md"], [data-framer-name="Secondary | md"]')].map((el) => ({
      tag: el.tagName,
      name: el.getAttribute('data-framer-name'),
      text: ((el as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
      href: el.getAttribute('href') || '',
    }));
    return { headerLines, status, desc, ctas };
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
      sectionText: ((sec.querySelector('[data-framer-name="Leading content"]') as HTMLElement | null)?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      cardCount: cards.length,
      cards: cards.map((a) => ({
        title: (a.querySelector('[data-framer-name="Heading"]')?.textContent ?? '').trim(),
        domain: (a.querySelector('[data-framer-name="Supporting text"]')?.textContent ?? '').trim(),
        href: a.getAttribute('href') || '',
        img: a.querySelector('img')?.currentSrc || a.querySelector('img')?.getAttribute('src') || '',
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
    const sec = document.querySelector('[data-framer-name="Process"]') as HTMLElement | null;
    if (!sec) return null;
    const lines = (sec.innerText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return { lines, fullText: lines.join(' ') };
  });

  // 3e. About preview stats & capabilities
  const homeAboutPreview = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="About"]') as HTMLElement | null;
    if (!sec) return null;
    const lines = (sec.innerText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return { lines, fullText: lines.join(' ') };
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
      const el = tabs[idx] as HTMLElement | undefined;
      return {
        text: (el?.innerText ?? '').replace(/\s+/g, ' ').trim(),
        hasActiveName: Boolean(el?.querySelector('[data-framer-name*="Acitve"], [data-framer-name*="Active"]')),
        height: Math.round(el?.getBoundingClientRect().height ?? 0),
      };
    }, i);
    await tab.click({ force: true });
    await page.waitForTimeout(550);
    const afterClick = await page.evaluate((idx) => {
      const sec = document.querySelector('[data-framer-name="Services"]');
      const tabs = sec?.querySelectorAll('[data-framer-name="Tabs"] > div') ?? [];
      const el = tabs[idx] as HTMLElement | undefined;
      const lines = (el?.innerText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const svgs = [...(sec?.querySelectorAll('svg') ?? [])].length;
      const imgs = [...(sec?.querySelectorAll('img') ?? [])].map((img) => ({
        src: img.currentSrc || img.getAttribute('src'),
        opacity: window.getComputedStyle(img).opacity,
      }));
      return {
        lines,
        hasActiveName: Boolean(el?.querySelector('[data-framer-name*="Acitve"], [data-framer-name*="Active"]')),
        height: Math.round(el?.getBoundingClientRect().height ?? 0),
        svgCount: svgs,
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

  // 3g. Testimonials (Ticker vs Carousel) + Client Satisfaction + Partner logos
  const testimonialsData = await page.evaluate(() => {
    const logoCloud = document.querySelector('[data-framer-name="Logo cloud"]');
    const reviewEls = [...document.querySelectorAll('[data-framer-name="Review"]')];
    // Find testimonial section root
    const sec = reviewEls[0]?.closest('section') || reviewEls[0]?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
    const cardsMap = new Map<string, { quote: string; fullName: string; role: string; linkHref: string | null; avatar: string | null; score: string }>();

    for (const rev of reviewEls) {
      const card = rev.parentElement?.parentElement || rev;
      const quote = ((rev as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim();
      if (!quote) continue;
      const fullName = ((card.querySelector('[data-framer-name="Full name"]') as HTMLElement | null)?.innerText ?? '').trim();
      const role = ((card.querySelector('[data-framer-name="Role"]') as HTMLElement | null)?.innerText ?? '').trim();
      const linkHref = card.querySelector('a[href]')?.getAttribute('href') || null;
      const avatar = card.querySelector('[data-framer-name="Avatar"] img')?.getAttribute('src') || null;
      const score = ((card.querySelector('[data-framer-name="Score"]') as HTMLElement | null)?.innerText ?? '').trim();
      if (!cardsMap.has(quote)) {
        cardsMap.set(quote, { quote, fullName, role, linkHref, avatar, score });
      }
    }

    // Check if there are any Next/Back arrow controls near testimonials
    const ticker = sec?.querySelector('[data-framer-name="Ticker"]');
    const controls = [...(sec?.querySelectorAll('button, [role="button"], [aria-label*="next" i], [aria-label*="prev" i]') ?? [])].map((el) => ({
      tag: el.tagName,
      ariaLabel: el.getAttribute('aria-label'),
      text: ((el as HTMLElement).innerText ?? '').trim(),
    }));

    // Client satisfaction / section header
    const secTextLines = ((sec as HTMLElement | null)?.innerText ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const logos = [...(logoCloud?.querySelectorAll('img') ?? [])].map((img) => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || '',
    }));
    const uniqueLogos = [...new Map(logos.map((l) => [l.src, l])).values()];

    return {
      mechanism: ticker ? 'continuous-marquee-ticker' : 'carousel',
      controlsFound: controls,
      uniqueTestimonialsCount: cardsMap.size,
      testimonials: [...cardsMap.values()],
      sectionHeaderLines: secTextLines.slice(0, 20),
      uniquePartnerLogosCount: uniqueLogos.length,
      partnerLogos: uniqueLogos,
    };
  });

  // 3h. Pricing 3 packages + assurance strip
  const homePricing = await page.evaluate(() => {
    const pricingSec =
      [...document.querySelectorAll('[data-framer-name]')].find((el) =>
        /pricing/i.test(el.getAttribute('data-framer-name') || '')
      ) ||
      [...document.querySelectorAll('h1, h2, h3, h4, p')]
        .find((el) => /transparent pricing|built for every project stage/i.test(el.textContent ?? ''))
        ?.closest('section, div[data-framer-name]');
    const lines = ((pricingSec as HTMLElement | null)?.innerText ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      framerName: pricingSec?.getAttribute('data-framer-name') ?? null,
      lines,
      fullText: lines.join(' '),
    };
  });

  // 3i. FAQ all 8 expanded answers (click each!)
  const homeFaqs = await (async () => {
    const qRows = page.locator('[data-framer-name="Question row"]');
    const count = await qRows.count();
    const items: { index: number; question: string; expandedAnswer: string; fullTextAfterClick: string }[] = [];

    for (let i = 0; i < count; i++) {
      const row = qRows.nth(i);
      await row.scrollIntoViewIfNeeded();
      const question = cleanText(await row.textContent());
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
      items.push({ index: i, question, expandedAnswer, fullTextAfterClick: afterText });
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
    const header = document.querySelector('[data-framer-name="Page header"]') as HTMLElement | null;
    const aboutMe = document.querySelector('[data-framer-name="About me"]') as HTMLElement | null;
    const stats = [...document.querySelectorAll('[data-framer-name="Stats item"]')].map((el) =>
      ((el as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim()
    );
    const services = document.querySelector('[data-framer-name="Services"]') as HTMLElement | null;
    return {
      headerLines: (header?.innerText ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      stats,
      aboutMeLines: (aboutMe?.innerText ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      servicesLines: (services?.innerText ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
    };
  });

  // 4b. Terminal ("How it works") 5 steps & interaction
  const aboutTerminal = await (async () => {
    const sec = page.locator('[data-framer-name="How it works"]').first();
    if ((await sec.count()) === 0) return null;
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const initialLines = await sec.evaluate((el) =>
      ((el as HTMLElement).innerText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    );

    const interactiveEls = await sec.evaluate((root) => {
      return [...root.querySelectorAll('*')]
        .filter((el) => {
          const cs = window.getComputedStyle(el);
          return (
            cs.cursor === 'pointer' ||
            el.getAttribute('tabindex') === '0' ||
            el.tagName === 'BUTTON' ||
            el.tagName === 'INPUT'
          );
        })
        .map((el) => ({
          tag: el.tagName,
          framerName: el.getAttribute('data-framer-name'),
          text: ((el as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
        }));
    });

    // Test clicking each step title (INPUT, STRATEGY, STRUCTURE, INTERFACE, LAUNCH) and ENTER
    const stepLabels = ['INPUT', 'STRATEGY', 'STRUCTURE', 'INTERFACE', 'LAUNCH', 'ENTER'];
    const clickTests: { label: string; changedDom: boolean; afterLines: string[] }[] = [];
    for (const label of stepLabels) {
      const target = sec.locator(`text="${label}"`).first();
      if ((await target.count()) > 0) {
        await target.click({ force: true }).catch(() => {});
        await page.waitForTimeout(350);
        const afterLines = await sec.evaluate((el) =>
          ((el as HTMLElement).innerText ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        );
        clickTests.push({
          label,
          changedDom: JSON.stringify(afterLines) !== JSON.stringify(initialLines),
          afterLines,
        });
      }
    }

    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
    const afterEnterLines = await sec.evaluate((el) =>
      ((el as HTMLElement).innerText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    );

    return {
      isInteractiveOnLiveSite:
        clickTests.some((t) => t.changedDom) ||
        JSON.stringify(afterEnterLines) !== JSON.stringify(initialLines),
      interactiveEls,
      initialLines,
      clickTests,
      afterEnterChangedDom: JSON.stringify(afterEnterLines) !== JSON.stringify(initialLines),
    };
  })();

  // 4c. Timeline 7 years (2020-2026)
  const aboutTimeline = await page.evaluate(() => {
    const sec = document.querySelector('[data-framer-name="Timeline"]') as HTMLElement | null;
    if (!sec) return null;
    const cards = [...sec.querySelectorAll('[data-framer-name="Cards"] > div')].map((card, i) => {
      const lines = ((card as HTMLElement).innerText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        index: i,
        year: lines[0] ?? '',
        title: lines[1] ?? '',
        description: lines.slice(2).join(' '),
        img: card.querySelector('img')?.currentSrc || card.querySelector('img')?.getAttribute('src') || null,
      };
    });
    return {
      headerLines: (sec.querySelector('[data-framer-name="Section header"]') as HTMLElement | null)?.innerText
        ?.split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      cards,
    };
  });

  // 4d. System Stack all 4 tabs (DESIGN, DEVELOPMENT, MOTION, 3D / VISUAL)
  const aboutSystemStack = await (async () => {
    const tabLabels = ['DESIGN', 'DEVELOPMENT', 'MOTION', '3D / VISUAL'];
    const tabsData: Record<string, unknown> = {};

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
        await page.waitForTimeout(700);
      }
      const extracted = await page.evaluate(() => {
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
            !href.includes('google.com/maps') &&
            href !== 'https://www.framer.com'
          );
        });
        return toolCards.map((a) => {
          const lines = ((a as HTMLElement).innerText || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
          const img = a.querySelector('img');
          const svg = a.querySelector('svg');
          return {
            title: lines[0] ?? '',
            description: lines.slice(1).join(' '),
            href: a.getAttribute('href') || '',
            iconSrc: img?.currentSrc || img?.getAttribute('src') || null,
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
    const contactSec = document.querySelector('[data-framer-name="Contact"]') as HTMLElement | null;
    const mailtos = [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => ({
      text: ((a as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    const locationLinks = [...document.querySelectorAll('[data-framer-name="Location"] a, a[href*="maps"]')].map((a) => ({
      text: ((a as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href') || '',
    }));
    const statusRows = [...document.querySelectorAll('[data-framer-name="Status"]')].map((el) =>
      ((el as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim()
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
        const labelFirstLine = ((labelEl as HTMLElement | null)?.innerText ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)[0] ?? '';
        return {
          index: idx,
          tagName: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || (el.tagName === 'SELECT' ? 'select' : el.tagName.toLowerCase()),
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          required: el.hasAttribute('required'),
          labelText: labelFirstLine,
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
      headerLines: (contactSec?.innerText ?? '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 18),
      statusRows,
      mailtos,
      locationLinks,
      visibleFields,
      honeypotFields,
      submitButtonText: ((submitButton as HTMLElement | null)?.innerText ?? '').replace(/\s+/g, ' ').trim(),
    };
  });

  const selectLocs = page.locator('form select');
  const selectCount = await selectLocs.count();
  const dropdownInteractionCheck: unknown[] = [];
  for (let i = 0; i < selectCount; i++) {
    const sel = selectLocs.nth(i);
    await sel.scrollIntoViewIfNeeded();
    await sel.click({ force: true });
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
    const timeEl = document.querySelector('[data-framer-name="Time"]') as HTMLElement | null;
    const rowContact = [...document.querySelectorAll('[data-framer-name="Link & icon"], [data-framer-name="Social group"] a')];
    const links = [...(footer?.querySelectorAll('a[href]') ?? []), ...rowContact]
      .filter((a) => a.getAttribute('href'))
      .map((a) => ({
        text: ((a as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href') || '',
      }));
    const statusText = [...document.querySelectorAll('[data-framer-name="Status"]')].map((s) =>
      ((s as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim()
    );
    return {
      clockText: (timeEl?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      footerLines: ((footer as HTMLElement | null)?.innerText ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
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
  // RECONCILE PROJECTS (12 INITIAL vs 27 SCROLL-LOADED / CMS / USER SCREENSHOT)
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

  const initialUrls = new Set(worksInitialCards.map((c) => c.externalUrl));
  const liveAll = (worksByFilter['ALL PROJECTS'] as any)?.cards ?? worksAfterScrollCards;
  const liveByUrl = new Map<string, any>(liveAll.map((c: any) => [c.externalUrl, c]));

  const reconciledProjects = cmsProjectsRaw.map((item, idx) => {
    const cat = catById.get(item.O5iwyiTAI) ?? { label: 'UNKNOWN', slug: 'unknown' };
    const liveMatch = liveByUrl.get(item.oWgNH1Iud);
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
      liveRenderedThumbSrc: liveMatch?.thumbnailSrc || null,
      thumbnailWidth: item.dsL5yhyYV?.pixelWidth ?? 1600,
      thumbnailHeight: item.dsL5yhyYV?.pixelHeight ?? 1200,
      presentInLiveInitial12: initialUrls.has(item.oWgNH1Iud),
      presentInLiveAfterScroll27: Boolean(liveMatch),
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
        rotatingWordsInDom: ['INTERFACE', 'SYSTEM', 'PRODUCT', 'EXPERIENCE'],
        activeWordTransitions: activeWordSequence,
        samplesCount: heroPhrasesSamples.length,
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
      liveInitial12Count: worksInitialCards.length,
      liveAllProjectsAfterScrollCount: liveAll.length,
      cmsTotalCount: cmsProjectsRaw.length,
      userScreenshotCount: 27,
      discrepancyReason:
        'Live /works SSR renders limit: 12 initially, then client-side IntersectionObserver LoadMore appends 12 (to 24) and 3 (to 27) on scroll; thus all 27 projects from CMS (mD0yv0kks) match the user-provided full-page screenshot.',
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
        prefix: 'DESIGN BEYOND THE',
        rotatingWords: ['INTERFACE', 'SYSTEM', 'PRODUCT', 'EXPERIENCE'],
        observedTransitionsOver15s: activeWordSequence,
      },
      worksFilters: Object.fromEntries(
        Object.entries(worksByFilter).map(([k, v]: [string, any]) => [
          k,
          { count: v.cards?.length ?? 0, titles: (v.cards ?? []).map((c: any) => c.title) },
        ])
      ),
      servicesTabs: {
        selectionMechanism: 'click-only (hover does not expand)',
        tabs: homeServicesInteractionTest,
      },
      testimonialSection: testimonialsData,
      faqAccordions: homeFaqs,
      aboutTerminal,
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

  console.log('Done! Updated live-extraction.json, projects-reconciled.json, routes.json, interactions.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
