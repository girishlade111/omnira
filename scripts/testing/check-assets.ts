import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_PATH = path.resolve("research/reports/asset-check.json");

const ROUTES = ["/", "/about", "/works", "/contact", "/nonexistent-check-404"];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const routeReports: Array<Record<string, unknown>> = [];
  let totalFailures = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.sessionStorage.setItem("stylokit-initial-loader-seen", "true");
        window.sessionStorage.setItem("omnira-initial-loader-seen", "true");
        window.sessionStorage.setItem("omnira_initial_loader_seen", "true");
      } catch {
        // ignore
      }
    });

    for (const route of ROUTES) {
      const page = await context.newPage();
      const failedAssets: Array<{ url: string; status: number; resourceType: string }> = [];

      page.on("response", (res) => {
        const req = res.request();
        const type = req.resourceType();
        if (["image", "font", "stylesheet", "media"].includes(type) && res.status() >= 400) {
          failedAssets.push({ url: res.url(), status: res.status(), resourceType: type });
        }
      });

      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

      // Trigger lazy images by scrolling down and back up
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= scrollHeight; y += 600) {
        await page.evaluate((pos) => window.scrollTo(0, pos), y);
        await page.waitForTimeout(100);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const domAudit = await page.evaluate(async () => {
        await document.fonts.ready;
        const brokenImages: Array<{ src: string; alt: string; complete: boolean; naturalWidth: number }> = [];
        const imgs = Array.from(document.querySelectorAll("img"));
        for (const img of imgs) {
          if (!img.complete || img.naturalWidth === 0) {
            brokenImages.push({
              src: img.currentSrc || img.getAttribute("src") || "",
              alt: img.alt || "",
              complete: img.complete,
              naturalWidth: img.naturalWidth,
            });
          }
        }

        const loadedFamilies = Array.from(document.fonts)
          .filter((f) => f.status === "loaded")
          .map((f) => f.family.replace(/["']/g, ""));

        const canvases = Array.from(document.querySelectorAll("canvas")).map((c) => {
          const r = c.getBoundingClientRect();
          return { width: Math.round(r.width), height: Math.round(r.height), attrW: c.width, attrH: c.height };
        });

        const zeroSizedSvgs = Array.from(document.querySelectorAll("svg")).filter((s) => {
          const r = s.getBoundingClientRect();
          const cs = getComputedStyle(s);
          return cs.display !== "none" && cs.visibility !== "hidden" && (r.width === 0 || r.height === 0);
        }).length;

        return {
          totalImages: imgs.length,
          brokenImages,
          loadedFontFamilies: [...new Set(loadedFamilies)],
          canvases,
          zeroSizedSvgs,
        };
      });

      const hasOrbitron = domAudit.loadedFontFamilies.some((f) => f.toLowerCase().includes("orbitron"));
      const hasChakra = domAudit.loadedFontFamilies.some((f) => f.toLowerCase().includes("chakra"));
      const passed =
        failedAssets.length === 0 &&
        domAudit.brokenImages.length === 0 &&
        hasOrbitron &&
        hasChakra;

      if (!passed) totalFailures++;

      routeReports.push({
        route,
        passed,
        failedAssets,
        ...domAudit,
        fontsCheck: { hasOrbitron, hasChakra },
      });

      console.log(
        `[${passed ? "PASS" : "FAIL"}] ${route}: imgs=${domAudit.totalImages} broken=${domAudit.brokenImages.length} failedNet=${failedAssets.length} fonts=${domAudit.loadedFontFamilies.join(",")}`
      );
      await page.close();
    }

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(
      REPORT_PATH,
      JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), totalFailures, routeReports }, null, 2),
      "utf8"
    );

    if (totalFailures > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("check-assets failed:", err);
  process.exit(1);
});
