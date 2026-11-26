import { chromium, type BrowserContext, type CDPSession, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

const BASE_URL = "https://omnira.framer.website";
const OUT_SCREENSHOTS = path.resolve("research/reference/screenshots");
const OUT_TYPOGRAPHY = path.resolve("research/reference/typography");
const OUT_DESIGN = path.resolve("research/reference/design-system");
const OUT_STYLES = path.resolve("research/reference/styles");
const OUT_MOTION = path.resolve("research/reference/motion");
const OUT_TECH = path.resolve("research/reference/technology");
const OUT_DOM = path.resolve("research/reference/dom");

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function waitForPageReady(page: Page, settleMs = 3400) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return img.decode().catch(() => {});
        }
        return new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 4000);
          img.addEventListener(
            "load",
            () => {
              clearTimeout(timer);
              img.decode().catch(() => {}).finally(resolve);
            },
            { once: true }
          );
          img.addEventListener(
            "error",
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true }
          );
        });
      })
    );
  });
  await page.waitForFunction(
    () => !document.querySelector('[style*="2147483647"]'),
    { timeout: 10000 }
  ).catch(() => {});
  await page.waitForTimeout(Math.min(settleMs, 900));
}

async function triggerAllReveals(page: Page) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const step = Math.max(300, Math.floor(vh * 0.65));
  for (let y = 0; y <= totalHeight; y += step) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(220);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

async function captureLoadingSequence(context: BrowserContext) {
  console.log("[1/6] Capturing initial loading frames (0ms..3250ms)...");
  const dir = path.join(OUT_SCREENSHOTS, "animation-frames/loading");
  ensureDir(dir);
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const frames: Array<{
    elapsedMs: number;
    file: string;
    overlays: Array<{
      tag: string;
      text: string;
      zIndex: string;
      opacity: string;
      position: string;
      rect: { x: number; y: number; width: number; height: number };
    }>;
  }> = [];

  const navPromise = page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  const t0 = Date.now();
  await navPromise;

  const sampleTimes = [0, 200, 450, 700, 1000, 1300, 1600, 1900, 2200, 2600, 3000, 3400];
  for (const targetMs of sampleTimes) {
    const now = Date.now() - t0;
    if (targetMs > now) {
      await page.waitForTimeout(targetMs - now);
    }
    const elapsedMs = Date.now() - t0;
    const fname = `loading-${String(targetMs).padStart(4, "0")}ms.png`;
    await page.screenshot({ path: path.join(dir, fname) });
    const overlays = await page.evaluate(() => {
      const results: Array<{
        tag: string;
        text: string;
        zIndex: string;
        opacity: string;
        position: string;
        rect: { x: number; y: number; width: number; height: number };
      }> = [];
      for (const el of document.querySelectorAll("div, section")) {
        const cs = getComputedStyle(el);
        const z = Number.parseInt(cs.zIndex, 10);
        const r = el.getBoundingClientRect();
        if (
          (cs.position === "fixed" || (!Number.isNaN(z) && z >= 10)) &&
          r.width > 200 &&
          r.height > 100
        ) {
          const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 160);
          results.push({
            tag: el.tagName.toLowerCase(),
            text,
            zIndex: cs.zIndex,
            opacity: cs.opacity,
            position: cs.position,
            rect: {
              x: Math.round(r.x),
              y: Math.round(r.y),
              width: Math.round(r.width),
              height: Math.round(r.height),
            },
          });
        }
      }
      return results.slice(0, 15);
    });
    frames.push({ elapsedMs, file: fname, overlays });
  }

  writeJson(path.join(OUT_MOTION, "loading-sequence.json"), {
    url: `${BASE_URL}/`,
    viewport: { width: 1440, height: 900 },
    frames,
  });
  await page.close();
}

async function captureHeroHeadlineAndPortrait(context: BrowserContext) {
  console.log("[2/6] Inspecting Hero headline timing & Hero portrait rendering technology...");
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3600);

  // 1. Inspect Hero DOM structure (canvases, videos, svgs, imgs, transforms, scripts)
  const heroInspection = await page.evaluate(() => {
    const vh = window.innerHeight;
    const heroCandidates = Array.from(document.querySelectorAll("section, header, main > div, [data-framer-name]")).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= -50 && r.top < vh * 0.8 && r.height >= 400;
    });

    const canvases = Array.from(document.querySelectorAll("canvas")).map((c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      let webglInfo: Record<string, unknown> | null = null;
      try {
        const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
        if (gl) {
          webglInfo = {
            version: gl.getParameter(gl.VERSION),
            renderer: gl.getParameter(gl.RENDERER),
            vendor: gl.getParameter(gl.VENDOR),
            drawingBufferWidth: gl.drawingBufferWidth,
            drawingBufferHeight: gl.drawingBufferHeight,
          };
        }
      } catch {
        webglInfo = { error: "context-query-failed" };
      }
      return {
        widthAttr: c.width,
        heightAttr: c.height,
        rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
        style: {
          position: cs.position,
          transform: cs.transform,
          opacity: cs.opacity,
          mixBlendMode: cs.mixBlendMode,
          filter: cs.filter,
          pointerEvents: cs.pointerEvents,
        },
        parentFramerName: c.parentElement?.getAttribute("data-framer-name") || null,
        grandParentFramerName: c.parentElement?.parentElement?.getAttribute("data-framer-name") || null,
        webglInfo,
      };
    });

    const videos = Array.from(document.querySelectorAll("video")).map((v) => {
      const r = v.getBoundingClientRect();
      return {
        src: v.currentSrc || v.src,
        poster: v.poster,
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted,
        paused: v.paused,
        rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
      };
    });

    const heroImages = Array.from(document.querySelectorAll("img"))
      .filter((img) => {
        const r = img.getBoundingClientRect();
        return r.top < vh * 1.2 && r.width > 100 && r.height > 100;
      })
      .map((img) => {
        const r = img.getBoundingClientRect();
        const cs = getComputedStyle(img);
        return {
          src: img.currentSrc || img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          style: {
            objectFit: cs.objectFit,
            transform: cs.transform,
            filter: cs.filter,
            opacity: cs.opacity,
            mixBlendMode: cs.mixBlendMode,
          },
          parentFramerName: img.parentElement?.getAttribute("data-framer-name") || null,
          ancestorNames: (() => {
            const names: string[] = [];
            let cur: HTMLElement | null = img.parentElement;
            for (let i = 0; i < 6 && cur; i++) {
              const fn = cur.getAttribute("data-framer-name");
              if (fn) names.push(fn);
              cur = cur.parentElement;
            }
            return names;
          })(),
        };
      });

    const heroSvgs = Array.from(document.querySelectorAll("svg"))
      .filter((s) => {
        const r = s.getBoundingClientRect();
        return r.top < vh * 1.1 && (r.width > 80 || r.height > 80);
      })
      .map((s) => {
        const r = s.getBoundingClientRect();
        return {
          viewBox: s.getAttribute("viewBox"),
          rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          childCount: s.children.length,
          parentFramerName: s.parentElement?.getAttribute("data-framer-name") || null,
        };
      });

    const heroHeadings = Array.from(document.querySelectorAll("h1, h2, p, span"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const txt = (el.textContent || "").trim();
        return r.top >= 0 && r.top < vh && txt.length > 0 && el.children.length === 0;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim(),
          rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          opacity: cs.opacity,
          transform: cs.transform,
        };
      });

    return {
      heroCandidateNames: heroCandidates.map((el) => ({
        tag: el.tagName.toLowerCase(),
        framerName: el.getAttribute("data-framer-name"),
        rect: el.getBoundingClientRect(),
      })),
      canvases,
      videos,
      heroImages,
      heroSvgs,
      heroHeadings,
    };
  });

  // 2. Observe Hero headline rotation over 14 seconds (every 250ms)
  const headlineSamples: Array<{
    tMs: number;
    texts: Array<{ text: string; opacity: string; transform: string; y: number }>;
    animations: Array<{ name: string; playState: string; currentTime: number | null; targetText: string }>;
  }> = [];
  const headlineFrameDir = path.join(OUT_SCREENSHOTS, "animation-frames/hero-headline");
  ensureDir(headlineFrameDir);
  const seenPhrases = new Set<string>();

  const tStart = Date.now();
  for (let i = 0; i < 56; i++) {
    const snap = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll("h1, [data-framer-name*='Hero' i] h1, [data-framer-name*='Hero' i] h2, [data-framer-name*='Hero' i] p"))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 40 && r.top < 750 && (el.textContent || "").trim().length > 0;
        })
        .map((el) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            text: (el.textContent || "").trim().replace(/\s+/g, " "),
            opacity: cs.opacity,
            transform: cs.transform,
            y: Math.round(r.y),
          };
        });
      const anims = document.getAnimations().map((a) => {
        const eff = a.effect as KeyframeEffect | null;
        const target = eff?.target as HTMLElement | null;
        return {
          name: (a as CSSAnimation).animationName || a.id || "waapi",
          playState: a.playState,
          currentTime: typeof a.currentTime === "number" ? Math.round(a.currentTime) : null,
          targetText: (target?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
        };
      });
      return { h1s, anims };
    });
    const tMs = Date.now() - tStart;
    headlineSamples.push({ tMs, texts: snap.h1s, animations: snap.anims.slice(0, 20) });

    const key = snap.h1s.map((h) => `${h.text}@${Number(h.opacity).toFixed(1)}`).join("|");
    if (seenPhrases.size < 8 && !seenPhrases.has(key)) {
      seenPhrases.add(key);
      await page.screenshot({
        path: path.join(headlineFrameDir, `headline-state-${seenPhrases.size}.png`),
      });
    }
    await page.waitForTimeout(250);
  }

  // 3. Test Hero portrait pointer-move across center and 4 corners
  const portraitFrameDir = path.join(OUT_SCREENSHOTS, "animation-frames/hero-portrait");
  ensureDir(portraitFrameDir);

  const portraitTarget = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      if (r.width > 100 && r.height > 100 && r.top < window.innerHeight) {
        return { kind: "canvas", x: r.x, y: r.y, width: r.width, height: r.height };
      }
    }
    // fallback: largest image or framer hero visual box
    const imgs = Array.from(document.querySelectorAll("img"))
      .map((i) => ({ i, r: i.getBoundingClientRect() }))
      .filter(({ r }) => r.top < window.innerHeight && r.width > 150 && r.height > 150)
      .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
    if (imgs.length > 0) {
      const r = imgs[0].r;
      return { kind: "img", x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return { kind: "viewport", x: 0, y: 80, width: 1440, height: 760 };
  });

  const pointerPoints = [
    { name: "center", px: portraitTarget.x + portraitTarget.width * 0.5, py: portraitTarget.y + portraitTarget.height * 0.5 },
    { name: "top-left", px: portraitTarget.x + portraitTarget.width * 0.12, py: portraitTarget.y + portraitTarget.height * 0.12 },
    { name: "top-right", px: portraitTarget.x + portraitTarget.width * 0.88, py: portraitTarget.y + portraitTarget.height * 0.12 },
    { name: "bottom-left", px: portraitTarget.x + portraitTarget.width * 0.12, py: portraitTarget.y + portraitTarget.height * 0.88 },
    { name: "bottom-right", px: portraitTarget.x + portraitTarget.width * 0.88, py: portraitTarget.y + portraitTarget.height * 0.88 },
  ];

  const pointerStates: Array<{
    name: string;
    px: number;
    py: number;
    file: string;
    transforms: Array<{ framerName: string | null; tag: string; transform: string }>;
    canvasDataUrlPrefix: string | null;
  }> = [];

  for (const pt of pointerPoints) {
    await page.mouse.move(pt.px, pt.py, { steps: 10 });
    await page.waitForTimeout(350);
    const fname = `hero-pointer-${pt.name}.png`;
    const fpath = path.join(portraitFrameDir, fname);
    await page.screenshot({ path: fpath });

    const state = await page.evaluate(() => {
      const transforms: Array<{ framerName: string | null; tag: string; transform: string }> = [];
      for (const el of document.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight || r.height < 40) continue;
        const cs = getComputedStyle(el);
        if (cs.transform && cs.transform !== "none") {
          transforms.push({
            framerName: el.getAttribute("data-framer-name"),
            tag: el.tagName.toLowerCase(),
            transform: cs.transform,
          });
        }
      }
      const c = document.querySelector("canvas");
      let canvasDataUrlPrefix: string | null = null;
      if (c) {
        try {
          canvasDataUrlPrefix = c.toDataURL().slice(0, 120);
        } catch {
          canvasDataUrlPrefix = "tainted-or-preserveDrawingBuffer-false";
        }
      }
      return { transforms: transforms.slice(0, 25), canvasDataUrlPrefix };
    });

    pointerStates.push({
      name: pt.name,
      px: Math.round(pt.px),
      py: Math.round(pt.py),
      file: fname,
      transforms: state.transforms,
      canvasDataUrlPrefix: state.canvasDataUrlPrefix,
    });
  }

  // Pixel diff between center and corners in the portrait region
  const pixelDiffs: Record<string, number> = {};
  const centerImg = await sharp(path.join(portraitFrameDir, "hero-pointer-center.png"))
    .extract({
      left: Math.max(0, Math.round(portraitTarget.x)),
      top: Math.max(0, Math.round(portraitTarget.y)),
      width: Math.min(1440 - Math.max(0, Math.round(portraitTarget.x)), Math.max(10, Math.round(portraitTarget.width))),
      height: Math.min(900 - Math.max(0, Math.round(portraitTarget.y)), Math.max(10, Math.round(portraitTarget.height))),
    })
    .raw()
    .toBuffer();

  for (const pt of pointerPoints.slice(1)) {
    const otherImg = await sharp(path.join(portraitFrameDir, `hero-pointer-${pt.name}.png`))
      .extract({
        left: Math.max(0, Math.round(portraitTarget.x)),
        top: Math.max(0, Math.round(portraitTarget.y)),
        width: Math.min(1440 - Math.max(0, Math.round(portraitTarget.x)), Math.max(10, Math.round(portraitTarget.width))),
        height: Math.min(900 - Math.max(0, Math.round(portraitTarget.y)), Math.max(10, Math.round(portraitTarget.height))),
      })
      .raw()
      .toBuffer();
    let changed = 0;
    for (let i = 0; i < centerImg.length; i += 4) {
      if (
        Math.abs(centerImg[i] - otherImg[i]) > 6 ||
        Math.abs(centerImg[i + 1] - otherImg[i + 1]) > 6 ||
        Math.abs(centerImg[i + 2] - otherImg[i + 2]) > 6
      ) {
        changed++;
      }
    }
    pixelDiffs[`center_vs_${pt.name}_changedPixels`] = changed;
  }

  writeJson(path.join(OUT_TECH, "hero-portrait-forensics.json"), {
    portraitTarget,
    heroInspection,
    pointerStates,
    pixelDiffs,
  });
  writeJson(path.join(OUT_MOTION, "hero-headline-timing.json"), {
    sampleCount: headlineSamples.length,
    samples: headlineSamples,
  });

  await page.close();
}

async function captureScreenshotsAcrossViewports(context: BrowserContext) {
  console.log("[3/6] Capturing Desktop, Tablet, Mobile, Section, Hover & Interaction screenshots...");
  const routes = [
    { name: "home", path: "/" },
    { name: "about", path: "/about" },
    { name: "works", path: "/works" },
    { name: "contact", path: "/contact" },
    { name: "not-found", path: "/nonexistent-check-404" },
  ];

  const viewports = [
    { folder: "desktop", label: "1440x900", width: 1440, height: 900, doSlices: true },
    { folder: "desktop", label: "1920x1080", width: 1920, height: 1080, doSlices: false },
    { folder: "desktop", label: "1280x800", width: 1280, height: 800, doSlices: false },
    { folder: "tablet", label: "1024x768", width: 1024, height: 768, doSlices: false },
    { folder: "tablet", label: "768x1024", width: 768, height: 1024, doSlices: false },
    { folder: "mobile", label: "390x844", width: 390, height: 844, doSlices: false, checkMenu: true },
    { folder: "mobile", label: "320x700", width: 320, height: 700, doSlices: false, checkMenu: true },
  ];

  const pageMetaSummary: Array<Record<string, unknown>> = [];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const r of routes) {
      const url = `${BASE_URL}${r.path}`;
      const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
      await waitForPageReady(page, 3400);

      const dir = path.join(OUT_SCREENSHOTS, vp.folder, vp.label);
      ensureDir(dir);

      // Capture top viewport at scroll=0
      await page.screenshot({ path: path.join(dir, `${r.name}-viewport.png`), fullPage: false });

      if (vp.label === "1440x900" && r.name === "home") {
        // Also capture initial fullPage at scrollY=0 before scrolling reveals
        await page.screenshot({ path: path.join(dir, `${r.name}-fullpage-unscrolled.png`), fullPage: true });
      }

      // Trigger reveals by scrolling down & back up, then take fullPage
      await triggerAllReveals(page);
      await page.screenshot({ path: path.join(dir, `${r.name}-fullpage.png`), fullPage: true });

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));
      pageMetaSummary.push({
        route: r.name,
        path: r.path,
        status: resp?.status() ?? null,
        viewport: vp.label,
        ...metrics,
      });

      // Viewport slices on 1440x900 for home & about
      if (vp.doSlices && (r.name === "home" || r.name === "about")) {
        const sliceDir = path.join(OUT_SCREENSHOTS, "sections", r.name);
        ensureDir(sliceDir);
        const totalH = metrics.scrollHeight;
        let idx = 0;
        for (let y = 0; y < totalH; y += 800) {
          await page.evaluate((pos) => window.scrollTo(0, pos), y);
          await page.waitForTimeout(350);
          await page.screenshot({
            path: path.join(sliceDir, `${r.name}-y${String(y).padStart(5, "0")}.png`),
            fullPage: false,
          });
          idx++;
          if (idx > 30) break;
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      }

      // Mobile menu open state capture on home
      if (vp.checkMenu && r.name === "home") {
        const menuTrigger = page.locator('[data-framer-name="Open"], header button, nav button, [aria-label*="menu" i]').first();
        if ((await menuTrigger.count()) > 0) {
          await menuTrigger.click({ force: true }).catch(() => {});
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(dir, `home-mobile-menu-open.png`), fullPage: false });
          const closeTrigger = page.locator('[data-framer-name="Close"], [data-framer-name="Open"]').first();
          await closeTrigger.click({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }
      }
    }
    await page.close();
  }

  // Hover & interaction states at 1440x900
  const hoverDir = path.join(OUT_SCREENSHOTS, "hover-states");
  const interDir = path.join(OUT_SCREENSHOTS, "interaction-states");
  ensureDir(hoverDir);
  ensureDir(interDir);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Home hover + FAQ + Services
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3400);
  await triggerAllReveals(page);

  const navLink = page.locator("header nav a, header a").nth(1);
  if ((await navLink.count()) > 0) {
    await navLink.hover();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(hoverDir, "header-nav-hover.png") });
  }

  // Hero CTA hover
  const heroCta = page.locator("a[href*='contact'], a:has-text('Book'), a:has-text('Start'), button:has-text('Start')").first();
  if ((await heroCta.count()) > 0) {
    await heroCta.hover();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(hoverDir, "hero-cta-hover.png") });
  }

  // FAQ expanded state
  const faqTrigger = page.locator("text=How long does a typical project take").first();
  if ((await faqTrigger.count()) > 0) {
    await faqTrigger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await faqTrigger.click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(interDir, "home-faq-expanded.png") });
  }

  // Works filter tabs + card hover
  await page.goto(`${BASE_URL}/works`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3400);
  for (const filterName of ["AI", "BUSINESS", "ONE PAGE", "PORTFOLIO"]) {
    const btn = page.locator(`button:has-text("${filterName}"), [role="button"]:has-text("${filterName}"), div:text-is("${filterName}")`).first();
    if ((await btn.count()) > 0) {
      await btn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(interDir, `works-filter-${filterName.toLowerCase().replace(/\s+/g, "-")}.png`) });
    }
  }
  const resetBtn = page.locator(`text="ALL PROJECTS"`).first();
  if ((await resetBtn.count()) > 0) {
    await resetBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }
  const firstCard = page.locator("main a[href^='http']").first();
  if ((await firstCard.count()) > 0) {
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(hoverDir, "works-card-hover.png") });
  }

  // About System Stack tabs + Terminal steps
  await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3400);
  await triggerAllReveals(page);
  for (const tab of ["DESIGN", "DEVELOPMENT", "MOTION", "3D / VISUAL"]) {
    const tabLoc = page.locator(`button:has-text("${tab}"), div:text-is("${tab}")`).first();
    if ((await tabLoc.count()) > 0) {
      await tabLoc.scrollIntoViewIfNeeded();
      await tabLoc.click({ force: true }).catch(() => {});
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(interDir, `about-stack-${tab.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`) });
    }
  }

  // Contact dropdown open states
  await page.goto(`${BASE_URL}/contact`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page, 3400);
  const selectLoc = page.locator("select").first();
  const selectCount = await page.locator("select").count();
  await page.screenshot({ path: path.join(interDir, `contact-initial-selects-${selectCount}.png`) });
  if (selectCount > 0) {
    await selectLoc.focus();
    await page.screenshot({ path: path.join(interDir, "contact-select-focused.png") });
  }

  await page.close();
  writeJson(path.join(OUT_STYLES, "viewport-page-metrics.json"), pageMetaSummary);
}

async function runTypographyForensics(context: BrowserContext) {
  console.log("[4/6] Running CDP Typography & Font Forensics...");
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const cdp: CDPSession = await context.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  const routeTargets = [
    { name: "home", path: "/" },
    { name: "about", path: "/about" },
    { name: "works", path: "/works" },
    { name: "contact", path: "/contact" },
  ];

  const allFontFaces: unknown[] = [];
  const loadedFontsPerRoute: Record<string, unknown[]> = {};
  const elementTypography: Array<Record<string, unknown>> = [];

  for (const r of routeTargets) {
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 3400);
    await triggerAllReveals(page);

    if (r.name === "home") {
      // Extract @font-face rules from all accessible stylesheets
      const faces = await page.evaluate(() => {
        const list: Array<Record<string, string>> = [];
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              if (rule instanceof CSSFontFaceRule) {
                list.push({
                  fontFamily: rule.style.getPropertyValue("font-family"),
                  fontWeight: rule.style.getPropertyValue("font-weight"),
                  fontStyle: rule.style.getPropertyValue("font-style"),
                  fontDisplay: rule.style.getPropertyValue("font-display"),
                  unicodeRange: rule.style.getPropertyValue("unicode-range"),
                  src: rule.style.getPropertyValue("src"),
                });
              }
            }
          } catch {
            // cross-origin stylesheet
          }
        }
        return list;
      });
      allFontFaces.push(...faces);
    }

    const docFonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts).map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status,
        unicodeRange: f.unicodeRange,
        display: f.display,
      }));
    });
    loadedFontsPerRoute[r.name] = docFonts;

    // Tag representative text elements with temporary data-typo-id for CDP getPlatformFontsForNode
    const tagged = await page.evaluate((routeName) => {
      const candidates: Array<{
        id: string;
        role: string;
        tag: string;
        text: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        lineHeight: string;
        letterSpacing: string;
        textTransform: string;
        color: string;
        whiteSpace: string;
        rect: { x: number; y: number; width: number; height: number };
        lineCountEstimate: number;
      }> = [];

      const els = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, a, button, span, label, input, select, textarea"));
      let idx = 0;
      const seenKeys = new Set<string>();

      for (const el of els) {
        // Prefer leaf text elements or direct text holders
        const hasChildElText = Array.from(el.children).some((c) => (c.textContent || "").trim().length > 0);
        if (hasChildElText && !["H1", "H2", "H3", "H4", "A", "BUTTON"].includes(el.tagName)) continue;
        const text = (el.textContent || "").trim().replace(/\s+/g, " ");
        if (!text && !["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) continue;

        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        const cs = getComputedStyle(el);
        const key = `${el.tagName}|${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${text.slice(0, 30)}`;
        if (seenKeys.has(key) && candidates.length > 45) continue;
        seenKeys.add(key);

        const id = `${routeName}-t-${idx++}`;
        el.setAttribute("data-typo-id", id);

        let role = el.tagName.toLowerCase();
        if (el.closest("header")) role = "header-" + role;
        else if (el.closest("footer")) role = "footer-" + role;
        else if (text.startsWith("[") || text.includes("//")) role = "badge-or-tech";

        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        candidates.push({
          id,
          role,
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 120),
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          textTransform: cs.textTransform,
          color: cs.color,
          whiteSpace: cs.whiteSpace,
          rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
          lineCountEstimate: Math.max(1, Math.round(r.height / lh)),
        });
        if (candidates.length >= 90) break;
      }
      return candidates;
    }, r.name);

    const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
    for (const item of tagged) {
      let platformFonts: unknown[] = [];
      try {
        const { nodeId } = await cdp.send("DOM.querySelector", {
          nodeId: root.nodeId,
          selector: `[data-typo-id="${item.id}"]`,
        });
        if (nodeId) {
          const res = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          platformFonts = res.fonts;
        }
      } catch {
        // ignore missing node
      }
      elementTypography.push({
        route: r.name,
        ...item,
        platformFonts,
      });
    }
  }

  // Responsive heading wrapping check across breakpoints on `/`
  const responsiveWrapping: Array<Record<string, unknown>> = [];
  for (const vp of [
    { label: "1440x900", width: 1440, height: 900 },
    { label: "1280x800", width: 1280, height: 800 },
    { label: "1024x768", width: 1024, height: 768 },
    { label: "768x1024", width: 768, height: 1024 },
    { label: "390x844", width: 390, height: 844 },
    { label: "320x700", width: 320, height: 700 },
  ]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 3400);
    await triggerAllReveals(page);
    const headings = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => {
        const cs = getComputedStyle(h);
        const r = h.getBoundingClientRect();
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        return {
          tag: h.tagName.toLowerCase(),
          text: (h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90),
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          width: Math.round(r.width),
          height: Math.round(r.height),
          lines: Math.max(1, Math.round(r.height / lh)),
        };
      })
    );
    responsiveWrapping.push({ viewport: vp.label, headings });
  }

  writeJson(path.join(OUT_TYPOGRAPHY, "font-discovery/font-faces.json"), allFontFaces);
  writeJson(path.join(OUT_TYPOGRAPHY, "rendered-fonts/loaded-fonts.json"), loadedFontsPerRoute);
  writeJson(path.join(OUT_TYPOGRAPHY, "heading-measurements/cdp-typography.json"), elementTypography);
  writeJson(path.join(OUT_TYPOGRAPHY, "heading-measurements/responsive-wrapping.json"), responsiveWrapping);

  await page.close();
}

async function runDesignSystemAndGeometryForensics(context: BrowserContext) {
  console.log("[5/6] Extracting Design System, Side Rails, Chamfers, Tokens, & Grain Texture...");
  const page = await context.newPage();

  const layoutBreakpoints: Array<Record<string, unknown>> = [];
  for (const vp of [
    { label: "1920x1080", width: 1920, height: 1080 },
    { label: "1440x900", width: 1440, height: 900 },
    { label: "1280x800", width: 1280, height: 800 },
    { label: "1024x768", width: 1024, height: 768 },
    { label: "768x1024", width: 768, height: 1024 },
    { label: "390x844", width: 390, height: 844 },
    { label: "320x700", width: 320, height: 700 },
  ]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 3400);

    const frameGeometry = await page.evaluate(() => {
      const vw = window.innerWidth;
      // Find side rails (elements along left/right edges or with repeating-linear-gradient / diagonal stripes)
      const rails: Array<Record<string, unknown>> = [];
      const containers: Array<Record<string, unknown>> = [];
      const grainElements: Array<Record<string, unknown>> = [];

      for (const el of document.querySelectorAll("div, aside, section, main, header, footer")) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const bgImg = cs.backgroundImage || "";
        const maskImg = cs.maskImage || cs.webkitMaskImage || "";

        if (bgImg.includes("gradient") || maskImg.includes("gradient") || (r.width > 10 && r.width < 220 && r.height > 400 && (r.left <= 5 || Math.abs(r.right - vw) <= 5))) {
          rails.push({
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            className: el.className?.toString().slice(0, 80),
            rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width * 100) / 100, height: Math.round(r.height) },
            position: cs.position,
            backgroundImage: bgImg,
            backgroundSize: cs.backgroundSize,
            backgroundRepeat: cs.backgroundRepeat,
            backgroundColor: cs.backgroundColor,
            opacity: cs.opacity,
            borderLeft: cs.borderLeft,
            borderRight: cs.borderRight,
            mixBlendMode: cs.mixBlendMode,
            zIndex: cs.zIndex,
          });
        }

        if (bgImg.includes("clI6TcTdwfgaDLeA7qOuGlEUTCY")) {
          grainElements.push({
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
            position: cs.position,
            backgroundImage: bgImg,
            backgroundSize: cs.backgroundSize,
            backgroundRepeat: cs.backgroundRepeat,
            opacity: cs.opacity,
            mixBlendMode: cs.mixBlendMode,
            pointerEvents: cs.pointerEvents,
            zIndex: cs.zIndex,
          });
        }

        if (r.width >= vw * 0.5 && r.height >= 200 && el.parentElement && (el.parentElement === document.body || el.parentElement.id === "main" || el.getAttribute("data-framer-name"))) {
          if (containers.length < 35) {
            containers.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              framerName: el.getAttribute("data-framer-name"),
              rect: { x: Math.round(r.x * 10) / 10, y: Math.round(r.y), width: Math.round(r.width * 10) / 10, height: Math.round(r.height) },
              maxWidth: cs.maxWidth,
              paddingLeft: cs.paddingLeft,
              paddingRight: cs.paddingRight,
              borderLeft: cs.borderLeft,
              borderRight: cs.borderRight,
              backgroundColor: cs.backgroundColor,
            });
          }
        }
      }

      // Check img tags for grain texture too
      for (const img of document.querySelectorAll("img")) {
        if ((img.currentSrc || img.src).includes("clI6TcTdwfgaDLeA7qOuGlEUTCY")) {
          const cs = getComputedStyle(img);
          const r = img.getBoundingClientRect();
          grainElements.push({
            tag: "img",
            src: img.currentSrc || img.src,
            rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
            position: cs.position,
            opacity: cs.opacity,
            mixBlendMode: cs.mixBlendMode,
            objectFit: cs.objectFit,
            pointerEvents: cs.pointerEvents,
            zIndex: cs.zIndex,
          });
        }
      }

      return { viewportWidth: vw, rails: rails.slice(0, 20), containers, grainElements };
    });

    layoutBreakpoints.push({ viewport: vp.label, ...frameGeometry });
  }

  // Detailed token, chamfer, badge, and computed styles extraction at 1440x900 across routes
  await page.setViewportSize({ width: 1440, height: 900 });
  const tokensAndChamfers: Record<string, unknown> = {};

  for (const r of [
    { name: "home", path: "/" },
    { name: "about", path: "/about" },
    { name: "works", path: "/works" },
    { name: "contact", path: "/contact" },
  ]) {
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, 3400);
    await triggerAllReveals(page);

    tokensAndChamfers[r.name] = await page.evaluate(() => {
      const cssVars: Record<string, string> = {};
      for (const el of [document.documentElement, document.body, document.querySelector("#main")]) {
        if (!el) continue;
        const cs = getComputedStyle(el);
        for (let i = 0; i < cs.length; i++) {
          const prop = cs[i];
          if (prop.startsWith("--")) {
            cssVars[prop] = cs.getPropertyValue(prop).trim();
          }
        }
      }

      // Collect stylesheet CSS vars too
      const sheetVars: Record<string, string> = {};
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule instanceof CSSStyleRule && (rule.selectorText === ":root" || rule.selectorText === "body" || rule.selectorText.includes("framer"))) {
              for (let i = 0; i < rule.style.length; i++) {
                const p = rule.style[i];
                if (p.startsWith("--token-")) {
                  sheetVars[p] = rule.style.getPropertyValue(p).trim();
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const bgColors = new Map<string, number>();
      const textColors = new Map<string, number>();
      const borderColors = new Map<string, number>();
      const chamfers: Array<Record<string, unknown>> = [];
      const badges: Array<Record<string, unknown>> = [];
      const buttonsAndInputs: Array<Record<string, unknown>> = [];

      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
          bgColors.set(cs.backgroundColor, (bgColors.get(cs.backgroundColor) || 0) + 1);
        }
        if (cs.color) {
          textColors.set(cs.color, (textColors.get(cs.color) || 0) + 1);
        }
        for (const b of [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor]) {
          if (b && b !== "rgba(0, 0, 0, 0)") {
            borderColors.set(b, (borderColors.get(b) || 0) + 1);
          }
        }

        const clip = cs.clipPath;
        const mask = cs.maskImage || cs.webkitMaskImage;
        const beforeCs = getComputedStyle(el, "::before");
        const afterCs = getComputedStyle(el, "::after");
        const hasPseudo =
          (beforeCs.content && beforeCs.content !== "none") ||
          (afterCs.content && afterCs.content !== "none");

        if ((clip && clip !== "none") || (mask && mask !== "none")) {
          chamfers.push({
            kind: clip && clip !== "none" ? "clip-path" : "mask-image",
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
            rect: { width: Math.round(r.width), height: Math.round(r.height) },
            clipPath: clip,
            maskImage: mask,
            backgroundColor: cs.backgroundColor,
            borderRadius: cs.borderRadius,
          });
        }

        // Check SVG elements that look like chamfered frames or corner brackets
        if (el.tagName.toLowerCase() === "svg") {
          const paths = Array.from(el.querySelectorAll("path, polygon, rect, line")).map((p) => ({
            tag: p.tagName.toLowerCase(),
            d: p.getAttribute("d")?.slice(0, 200) || null,
            points: p.getAttribute("points")?.slice(0, 200) || null,
            fill: p.getAttribute("fill") || getComputedStyle(p).fill,
            stroke: p.getAttribute("stroke") || getComputedStyle(p).stroke,
            strokeWidth: p.getAttribute("stroke-width") || getComputedStyle(p).strokeWidth,
          }));
          if (r.width >= 30 && paths.length > 0 && chamfers.length < 120) {
            chamfers.push({
              kind: "svg",
              framerName: el.getAttribute("data-framer-name"),
              parentFramerName: el.parentElement?.getAttribute("data-framer-name"),
              rect: { width: Math.round(r.width), height: Math.round(r.height) },
              viewBox: el.getAttribute("viewBox"),
              paths: paths.slice(0, 12),
            });
          }
        }

        // Technical badges or bracketed labels
        const txt = (el.textContent || "").trim();
        if ((txt.startsWith("[") && txt.endsWith("]") && txt.length < 50) || (el.getAttribute("data-framer-name") || "").toLowerCase().includes("badge")) {
          if (badges.length < 30) {
            badges.push({
              tag: el.tagName.toLowerCase(),
              framerName: el.getAttribute("data-framer-name"),
              text: txt,
              rect: { width: Math.round(r.width), height: Math.round(r.height) },
              padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
              fontFamily: cs.fontFamily,
              fontSize: cs.fontSize,
              letterSpacing: cs.letterSpacing,
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
              clipPath: cs.clipPath,
            });
          }
        }

        if (["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) && buttonsAndInputs.length < 60) {
          if (r.height >= 28) {
            buttonsAndInputs.push({
              tag: el.tagName.toLowerCase(),
              type: (el as HTMLInputElement).type || null,
              framerName: el.getAttribute("data-framer-name"),
              text: txt.slice(0, 45),
              rect: { width: Math.round(r.width), height: Math.round(r.height) },
              padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
              borderRadius: cs.borderRadius,
              clipPath: cs.clipPath,
              hasPseudo,
            });
          }
        }
      }

      // Landmarks / sections
      const landmarks = Array.from(document.querySelectorAll("header, nav, main, section, footer, [data-framer-name]"))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 300 && r.height > 40;
        })
        .slice(0, 60)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            framerName: el.getAttribute("data-framer-name"),
            rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
            backgroundColor: cs.backgroundColor,
            padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
            gap: cs.gap,
            display: cs.display,
            gridTemplateColumns: cs.gridTemplateColumns,
          };
        });

      return {
        cssVars,
        sheetVars,
        bgColors: Array.from(bgColors.entries()).sort((a, b) => b[1] - a[1]),
        textColors: Array.from(textColors.entries()).sort((a, b) => b[1] - a[1]),
        borderColors: Array.from(borderColors.entries()).sort((a, b) => b[1] - a[1]),
        chamfers,
        badges,
        buttonsAndInputs,
        landmarks,
      };
    });
  }

  writeJson(path.join(OUT_DESIGN, "geometry/layout-breakpoints.json"), layoutBreakpoints);
  writeJson(path.join(OUT_DESIGN, "raw-design-system-forensics.json"), tokensAndChamfers);
  writeJson(path.join(OUT_DOM, "dom-landmarks.json"), {
    home: (tokensAndChamfers.home as Record<string, unknown>).landmarks,
    about: (tokensAndChamfers.about as Record<string, unknown>).landmarks,
    works: (tokensAndChamfers.works as Record<string, unknown>).landmarks,
    contact: (tokensAndChamfers.contact as Record<string, unknown>).landmarks,
  });

  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    await captureLoadingSequence(context);
    await captureHeroHeadlineAndPortrait(context);
    await captureScreenshotsAcrossViewports(context);
    await runTypographyForensics(context);
    await runDesignSystemAndGeometryForensics(context);

    console.log("[6/6] Visual forensics capture complete!");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
