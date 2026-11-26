import { chromium, type BrowserContext, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REF_METRICS_PATH = path.resolve("research/reference/styles/viewport-page-metrics.json");
const REF_TYPO_PATH = path.resolve("research/reference/typography/heading-measurements/cdp-typography.json");
const REPORT_PATH = path.resolve("research/reports/geometry-comparison.json");

interface RefPageMetric {
  route: string;
  path: string;
  viewport: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  overflowX: boolean;
}

interface RefTypoItem {
  route: string;
  tag: string;
  text: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  color: string;
  platformFonts?: Array<{ familyName: string; isCustomFont: boolean }>;
}

const ROUTES = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  { key: "works", path: "/works" },
  { key: "contact", path: "/contact" },
  { key: "not-found", path: "/nonexistent-check-404" },
];

const VIEWPORTS = [
  { label: "1440x900", width: 1440, height: 900, expectedRailWidth: 96, expectedOuterMax: 1400 },
  { label: "1024x768", width: 1024, height: 768, expectedRailWidth: 48, expectedOuterMax: 1024 },
  { label: "390x844", width: 390, height: 844, expectedRailWidth: 16, expectedOuterMax: 390 },
];

async function settlePage(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForFunction(
    () => !document.querySelector('[data-loading-screen="true"], [style*="2147483647"]'),
    { timeout: 6000 }
  ).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function inspectTypographyCdp(context: BrowserContext, page: Page) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  const targets = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("h1, h2, h3, h5, h6, header a, p")).slice(0, 40);
    return els.map((el, idx) => {
      const id = `geom-t-${idx}`;
      el.setAttribute("data-geom-typo", id);
      const cs = getComputedStyle(el);
      return {
        id,
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontWeight: cs.fontWeight,
        color: cs.color,
      };
    });
  });

  const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
  const enriched: Array<Record<string, unknown>> = [];
  for (const t of targets) {
    let platformFonts: Array<{ familyName: string; isCustomFont: boolean }> = [];
    try {
      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: `[data-geom-typo="${t.id}"]`,
      });
      if (nodeId) {
        const res = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
        platformFonts = res.fonts.map((f) => ({ familyName: f.familyName, isCustomFont: f.isCustomFont }));
      }
    } catch {
      // ignore
    }
    enriched.push({ ...t, platformFonts });
  }
  await cdp.detach();
  return enriched;
}

async function main() {
  const refMetrics: RefPageMetric[] = fs.existsSync(REF_METRICS_PATH)
    ? JSON.parse(fs.readFileSync(REF_METRICS_PATH, "utf8"))
    : [];
  const refTypo: RefTypoItem[] = fs.existsSync(REF_TYPO_PATH)
    ? JSON.parse(fs.readFileSync(REF_TYPO_PATH, "utf8"))
    : [];

  const browser = await chromium.launch({ headless: true });
  const viewportResults: Array<Record<string, unknown>> = [];
  let typographyReport: Array<Record<string, unknown>> = [];

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      await context.emulateMedia({ reducedMotion: "reduce" });
      await context.addInitScript(() => {
        try {
          window.sessionStorage.setItem("stylokit-initial-loader-seen", "true");
          window.sessionStorage.setItem("omnira-initial-loader-seen", "true");
          window.sessionStorage.setItem("omnira_initial_loader_seen", "true");
        } catch {
          // ignore
        }
      });

      const page = await context.newPage();

      for (const route of ROUTES) {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
        await settlePage(page);

        const measured = await page.evaluate(() => {
          const header = document.querySelector("header");
          const main = document.querySelector("main");
          const footer = document.querySelector("footer");
          const sections = document.querySelectorAll("main section, main > div > section");

          // Find outer frame wrapper and left/right rails if present
          const frameEl =
            document.querySelector('[data-frame-shell="true"]') ||
            document.querySelector("main") ||
            document.body;
          const frameRect = frameEl.getBoundingClientRect();

          const rails = Array.from(document.querySelectorAll("aside, [data-rail], [class*='rail' i]"))
            .filter((el) => el.getBoundingClientRect().width > 5 && el.getBoundingClientRect().width < 220)
            .map((el) => Math.round(el.getBoundingClientRect().width));

          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollHeight: document.documentElement.scrollHeight,
            overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            outerFrameWidth: Math.round(frameRect.width),
            mainContentWidth: main ? Math.round(main.getBoundingClientRect().width) : null,
            headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
            footerHeight: footer ? Math.round(footer.getBoundingClientRect().height) : null,
            sectionCount: sections.length,
            railWidths: rails.slice(0, 4),
          };
        });

        const ref = refMetrics.find((r) => r.route === route.key && r.viewport === vp.label);
        viewportResults.push({
          route: route.key,
          viewport: vp.label,
          expectedRailWidth: vp.expectedRailWidth,
          expectedOuterMax: vp.expectedOuterMax,
          measured,
          referenceHeight: ref?.scrollHeight ?? null,
          heightDeltaPx: ref ? measured.scrollHeight - ref.scrollHeight : null,
          passed: !measured.overflowX,
        });

        if (vp.label === "1440x900" && route.key === "home") {
          typographyReport = await inspectTypographyCdp(context, page);
        }
      }

      await context.close();
    }

    const refHomeHero = refTypo.find((t) => t.route === "home" && t.fontSize === "64px");
    const refHomeBody = refTypo.find((t) => t.route === "home" && t.tag === "p" && t.fontSize === "16px");
    const implCustomFontsOk = typographyReport.every((item) => {
      const pf = (item.platformFonts as Array<{ isCustomFont: boolean }>) || [];
      return pf.length === 0 || pf.some((f) => f.isCustomFont);
    });

    const summary = {
      baseUrl: BASE_URL,
      generatedAt: new Date().toISOString(),
      allOverflowFree: viewportResults.every((r) => r.passed === true),
      implCustomFontsOk,
      referenceKeyTypography: {
        hero: refHomeHero ?? null,
        body: refHomeBody ?? null,
      },
      viewportResults,
      home1440TypographySample: typographyReport,
    };

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2), "utf8");
    console.log("Wrote geometry comparison report to", REPORT_PATH);

    if (!summary.allOverflowFree) {
      console.error("Geometry comparison detected horizontal overflow!");
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("compare-geometry failed:", err);
  process.exit(1);
});
