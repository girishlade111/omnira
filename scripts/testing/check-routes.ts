import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_PATH = path.resolve("research/reports/route-check.json");

interface RouteCheckCase {
  path: string;
  expectedStatus: number;
  kind: "page" | "xml" | "text" | "not-found";
}

const CASES: RouteCheckCase[] = [
  { path: "/", expectedStatus: 200, kind: "page" },
  { path: "/about", expectedStatus: 200, kind: "page" },
  { path: "/works", expectedStatus: 200, kind: "page" },
  { path: "/contact", expectedStatus: 200, kind: "page" },
  { path: "/404", expectedStatus: 404, kind: "not-found" },
  { path: "/nonexistent-check-404", expectedStatus: 404, kind: "not-found" },
  { path: "/works/brandora", expectedStatus: 404, kind: "not-found" },
  { path: "/sitemap.xml", expectedStatus: 200, kind: "xml" },
  { path: "/robots.txt", expectedStatus: 200, kind: "text" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: Array<Record<string, unknown>> = [];
  let failures = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.sessionStorage.setItem("stylokit-initial-loader-seen", "true");
        window.sessionStorage.setItem("omnira-initial-loader-seen", "true");
      } catch {
        // ignore
      }
    });

    for (const c of CASES) {
      const page = await context.newPage();
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: Array<{ url: string; status: number }> = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });
      page.on("response", (res) => {
        if (res.url().startsWith(BASE_URL) && res.status() >= 400 && c.expectedStatus === 200) {
          failedRequests.push({ url: res.url(), status: res.status() });
        }
      });

      const resp = await page.goto(`${BASE_URL}${c.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
      const status = resp?.status() ?? 0;

      let title = "";
      let h1OrHeadingCount = 0;
      let bodyLength = 0;
      if (c.kind === "page" || c.kind === "not-found") {
        const info = await page.evaluate(() => ({
          title: document.title,
          headingCount: document.querySelectorAll("h1, h2").length,
          bodyLength: (document.body?.innerText || "").trim().length,
        }));
        title = info.title;
        h1OrHeadingCount = info.headingCount;
        bodyLength = info.bodyLength;
      } else {
        const text = await resp?.text();
        bodyLength = (text || "").length;
      }

      const statusOk = status === c.expectedStatus;
      const runtimeOk = pageErrors.length === 0 && failedRequests.length === 0;
      const contentOk = bodyLength > 20;
      const passed = statusOk && runtimeOk && contentOk;
      if (!passed) failures++;

      results.push({
        path: c.path,
        expectedStatus: c.expectedStatus,
        actualStatus: status,
        title,
        h1OrHeadingCount,
        bodyLength,
        consoleErrors,
        pageErrors,
        failedRequests,
        passed,
      });

      console.log(
        `[${passed ? "PASS" : "FAIL"}] ${c.path} -> HTTP ${status} (expected ${c.expectedStatus}), errors=${consoleErrors.length + pageErrors.length}`
      );
      await page.close();
    }

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(
      REPORT_PATH,
      JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), failures, results }, null, 2),
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
  console.error("check-routes failed:", err);
  process.exit(1);
});
