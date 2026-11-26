import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_PATH = path.resolve("research/reports/overflow-check.json");

const ROUTES = ["/", "/about", "/works", "/contact", "/nonexistent-check-404"];
const VIEWPORTS = [
  { label: "1440x900", width: 1440, height: 900 },
  { label: "1024x768", width: 1024, height: 768 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "390x844", width: 390, height: 844 },
  { label: "320x700", width: 320, height: 700 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const checks: Array<Record<string, unknown>> = [];
  let failures = 0;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      await context.addInitScript(() => {
        try {
          window.sessionStorage.setItem("stylokit-initial-loader-seen", "true");
          window.sessionStorage.setItem("omnira-initial-loader-seen", "true");
        } catch {
          // ignore
        }
      });

      const page = await context.newPage();

      for (const route of ROUTES) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(200);

        const metrics = await page.evaluate(() => {
          const vw = window.innerWidth;
          const docW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;

          const offenders: Array<{ tag: string; text: string; left: number; right: number; width: number }> = [];
          for (const el of document.querySelectorAll("body *")) {
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > vw + 1 || r.left < -1) {
              if (offenders.length < 10) {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
              }
            }
          }

          return {
            viewportWidth: vw,
            scrollWidth: docW,
            clientWidth: clientW,
            overflowX: docW > clientW,
            offenders,
          };
        });

        const passed = !metrics.overflowX;
        if (!passed) failures++;

        checks.push({
          route,
          viewport: vp.label,
          passed,
          ...metrics,
        });

        console.log(
          `[${passed ? "PASS" : "FAIL"}] ${route} @ ${vp.label}: scrollWidth=${metrics.scrollWidth}/${metrics.clientWidth} offenders=${metrics.offenders.length}`
        );
      }

      await context.close();
    }

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(
      REPORT_PATH,
      JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), failures, checks }, null, 2),
      "utf8"
    );

    if (failures > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("check-overflow failed:", err);
  process.exit(1);
});
