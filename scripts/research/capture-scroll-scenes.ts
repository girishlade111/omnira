import { chromium, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = "https://omnira.framer.website";
const OUT_SCREENSHOTS = path.resolve("research/reference/screenshots/animation-frames");
const OUT_MOTION = path.resolve("research/reference/motion");

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function waitForPageReady(page: Page, settleMs = 3500) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.querySelectorAll("img")).map((img) =>
        img.complete ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );
  });
  await page.waitForTimeout(settleMs);
}

async function captureHomeScrollScenes(page: Page) {
  console.log("[1/3] Capturing / scroll scenes in 5% increments (0%..100%)...");
  const dir = path.join(OUT_SCREENSHOTS, "scroll-5pct");
  ensureDir(dir);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3600);

  const dims = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  }));

  const increments: Array<Record<string, unknown>> = [];

  for (let pct = 0; pct <= 100; pct += 5) {
    const targetY = Math.round((dims.maxScroll * pct) / 100);
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(450);

    const fname = `scroll-${String(pct).padStart(3, "0")}.png`;
    await page.screenshot({ path: path.join(dir, fname), fullPage: false });

    const snapshot = await page.evaluate(() => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Capture top-level sections & sticky elements
      const stickyElements: Array<Record<string, unknown>> = [];
      const animatedOrTransformed: Array<Record<string, unknown>> = [];

      for (const el of document.querySelectorAll("div, section, header, footer")) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (r.width < 100 || r.height < 40) continue;

        if (cs.position === "sticky" || cs.position === "fixed") {
          stickyElements.push({
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            position: cs.position,
            topStyle: cs.top,
            rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
            opacity: cs.opacity,
            transform: cs.transform,
            textPreview: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70),
          });
        }

        // Check elements intersecting viewport with non-default opacity or transform
        if (r.bottom > -100 && r.top < vh + 100) {
          if ((cs.opacity !== "1" || cs.transform !== "none") && animatedOrTransformed.length < 40) {
            animatedOrTransformed.push({
              tag: el.tagName.toLowerCase(),
              framerName: el.getAttribute("data-framer-name"),
              rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
              opacity: cs.opacity,
              transform: cs.transform,
              textPreview: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
            });
          }
        }
      }

      // Named/major vertical sections (children of main wrapper)
      const mainRoot = document.querySelector("#main > div") || document.body;
      const sections = Array.from(mainRoot.children)
        .filter((el) => el.getBoundingClientRect().height > 60)
        .map((el, idx) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            index: idx,
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            rect: { yViewport: Math.round(r.y), yDoc: Math.round(r.y + scrollY), height: Math.round(r.height) },
            position: cs.position,
            opacity: cs.opacity,
            overflow: cs.overflow,
            textPreview: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          };
        });

      const activeAnimations = document.getAnimations().map((a) => {
        const eff = a.effect as KeyframeEffect | null;
        const target = eff?.target as HTMLElement | null;
        return {
          name: (a as CSSAnimation).animationName || a.id || "waapi",
          playState: a.playState,
          currentTime: typeof a.currentTime === "number" ? Math.round(a.currentTime) : null,
          targetFramerName: target?.getAttribute?.("data-framer-name") || null,
          targetTag: target?.tagName?.toLowerCase() || null,
        };
      });

      return {
        scrollY,
        stickyElements: stickyElements.slice(0, 25),
        animatedOrTransformed,
        sections,
        activeAnimationsCount: activeAnimations.length,
        activeAnimations: activeAnimations.slice(0, 20),
      };
    });

    increments.push({ pct, targetY, file: fname, ...snapshot });
  }

  writeJson(path.join(OUT_MOTION, "home-scroll-5pct.json"), {
    url: `${BASE_URL}/`,
    viewport: { width: 1440, height: 900 },
    ...dims,
    increments,
  });
}

async function investigateProcessAndServices(page: Page) {
  console.log("[2/3] Deep-diving Process & Services scroll-driven transitions + dark region cause...");
  const servicesDir = path.join(OUT_SCREENSHOTS, "animation-frames/services");
  const processDir = path.join(OUT_SCREENSHOTS, "animation-frames/process");
  ensureDir(servicesDir);
  ensureDir(processDir);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3600);

  // Locate Process and Services containers in document coordinates
  const ranges = await page.evaluate(() => {
    const matchesFor = (needle: string) => {
      const matches = Array.from(document.querySelectorAll("section, [data-framer-name], div")).filter((el) => {
        const txt = (el.textContent || "").trim();
        const r = el.getBoundingClientRect();
        return txt.includes(needle) && r.height >= 500 && r.width >= 800;
      });
      matches.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height);
      const best = matches[matches.length - 1] || matches[0];
      if (!best) return null;
      let cur: HTMLElement | null = best as HTMLElement;
      while (cur && cur.parentElement && cur.parentElement.getBoundingClientRect().height < 14000) {
        if (cur.getBoundingClientRect().height >= 1200 && cur.getBoundingClientRect().height <= 6000) break;
        cur = cur.parentElement;
      }
      const r = (cur || best).getBoundingClientRect();
      return {
        framerName: (cur || best).getAttribute("data-framer-name"),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        bottom: Math.round(r.bottom + window.scrollY),
      };
    };

    return {
      process: matchesFor("DISCOVER"),
      services: matchesFor("SERVICES"),
      allTallChildren: Array.from((document.querySelector("#main > div") || document.body).children).map((c) => {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        return {
          tag: c.tagName.toLowerCase(),
          framerName: c.getAttribute("data-framer-name"),
          top: Math.round(r.top + window.scrollY),
          height: Math.round(r.height),
          position: cs.position,
          hasStickyDescendant: Array.from(c.querySelectorAll("*")).some((d) => getComputedStyle(d).position === "sticky"),
          textSnippet: (c.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90),
        };
      }),
    };
  });

  // Sample Process in fine steps if found
  const processFrames: Array<Record<string, unknown>> = [];
  if (ranges.process) {
    const start = Math.max(0, ranges.process.top - 200);
    const end = ranges.process.bottom - 500;
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const y = Math.round(start + ((end - start) * i) / steps);
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(400);
      const fname = `process-step-${String(i).padStart(2, "0")}-y${y}.png`;
      await page.screenshot({ path: path.join(processDir, fname) });
      const info = await page.evaluate(() => {
        const visibleText = Array.from(document.querySelectorAll("h2, h3, p, span"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return r.top >= 0 && r.bottom <= window.innerHeight && parseFloat(cs.opacity) > 0.2 && el.children.length === 0;
          })
          .map((el) => (el.textContent || "").trim())
          .filter(Boolean)
          .slice(0, 25);
        return { scrollY: window.scrollY, visibleText };
      });
      processFrames.push({ step: i, y, file: fname, ...info });
    }
  }

  // Sample Services across scroll range + test clicking/hovering service titles
  const servicesFrames: Array<Record<string, unknown>> = [];
  if (ranges.services) {
    const start = Math.max(0, ranges.services.top - 100);
    const end = ranges.services.bottom - 400;
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const y = Math.round(start + ((end - start) * i) / steps);
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await page.waitForTimeout(400);
      const fname = `services-scroll-${String(i).padStart(2, "0")}-y${y}.png`;
      await page.screenshot({ path: path.join(servicesDir, fname) });
      const info = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img, svg"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return r.top >= -50 && r.bottom <= window.innerHeight + 50 && r.width > 120 && parseFloat(cs.opacity) > 0.1;
          })
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            src: el instanceof HTMLImageElement ? el.currentSrc || el.src : null,
            opacity: getComputedStyle(el).opacity,
            transform: getComputedStyle(el).transform,
            rect: { x: Math.round(el.getBoundingClientRect().x), y: Math.round(el.getBoundingClientRect().y), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) },
          }));
        const headings = Array.from(document.querySelectorAll("h2, h3, h4, p"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= window.innerHeight && parseFloat(getComputedStyle(el).opacity) > 0.2;
          })
          .map((el) => ({
            text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
            color: getComputedStyle(el).color,
            opacity: getComputedStyle(el).opacity,
          }))
          .slice(0, 20);
        return { scrollY: window.scrollY, visibleGraphics: imgs, visibleText: headings };
      });
      servicesFrames.push({ step: i, y, file: fname, ...info });
    }
  }

  writeJson(path.join(OUT_MOTION, "process-services-forensics.json"), {
    ranges,
    processFrames,
    servicesFrames,
  });
}

async function captureAboutScrollScenes(page: Page) {
  console.log("[3/3] Capturing /about scroll scenes (Timeline 2020-2026 & sections)...");
  const dir = path.join(OUT_SCREENSHOTS, "animation-frames/about-scroll");
  ensureDir(dir);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3500);

  const dims = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  }));

  const increments: Array<Record<string, unknown>> = [];
  for (let pct = 0; pct <= 100; pct += 10) {
    const targetY = Math.round((dims.maxScroll * pct) / 100);
    await page.evaluate((y) => window.scrollTo(0, y), targetY);
    await page.waitForTimeout(450);
    const fname = `about-scroll-${String(pct).padStart(3, "0")}.png`;
    await page.screenshot({ path: path.join(dir, fname), fullPage: false });

    const snap = await page.evaluate(() => {
      const sticky = Array.from(document.querySelectorAll("div, section"))
        .filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position))
        .map((el) => ({
          framerName: el.getAttribute("data-framer-name"),
          position: getComputedStyle(el).position,
          rect: el.getBoundingClientRect(),
        }));
      return { scrollY: window.scrollY, stickyCount: sticky.length, sticky: sticky.slice(0, 10) };
    });
    increments.push({ pct, targetY, file: fname, ...snap });
  }

  writeJson(path.join(OUT_MOTION, "about-scroll-10pct.json"), {
    url: `${BASE_URL}/about`,
    ...dims,
    increments,
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await captureHomeScrollScenes(page);
    await investigateProcessAndServices(page);
    await captureAboutScrollScenes(page);

    await page.close();
    console.log("Scroll scene forensics complete!");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
