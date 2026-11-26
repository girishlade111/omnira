import { chromium, type Page } from "playwright";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REF_ROOT = path.resolve("research/reference/screenshots");
const CMP_ROOT = path.resolve("research/comparisons");
const REPORT_PATH = path.resolve("research/reports/visual-comparison-summary.json");

interface RouteSpec {
  key: string;
  implPath: string;
  refName: string;
}

const ROUTES: RouteSpec[] = [
  { key: "home", implPath: "/", refName: "home" },
  { key: "about", implPath: "/about", refName: "about" },
  { key: "works", implPath: "/works", refName: "works" },
  { key: "contact", implPath: "/contact", refName: "contact" },
  { key: "404", implPath: "/nonexistent-check-404", refName: "not-found" },
];

const VIEWPORTS = [
  { folder: "desktop", label: "1440x900", width: 1440, height: 900 },
  { folder: "mobile", label: "390x844", width: 390, height: 844 },
];

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function preparePage(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForFunction(
    () => !document.querySelector('[data-loading-screen="true"], [style*="2147483647"]'),
    { timeout: 6000 }
  ).catch(() => {});

  // Scroll through page so intersection-observer reveals settle, then return to top
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  for (let y = 0; y <= totalHeight; y += Math.max(320, Math.floor(vh * 0.7))) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.querySelectorAll("img")).map((img) =>
        img.complete ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );
  });
  await page.waitForTimeout(350);
}

function computeSsimWindowed(
  a: Uint8Array | Buffer,
  b: Uint8Array | Buffer,
  width: number,
  height: number
): number {
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 120));
  const win = 8;
  let totalSsim = 0;
  let windows = 0;

  const luma = (buf: Uint8Array | Buffer, x: number, y: number) => {
    const idx = (y * width + x) * 4;
    return 0.299 * buf[idx] + 0.587 * buf[idx + 1] + 0.114 * buf[idx + 2];
  };

  for (let wy = 0; wy + win <= height; wy += win * step) {
    for (let wx = 0; wx + win <= width; wx += win * step) {
      let meanA = 0;
      let meanB = 0;
      const n = win * win;
      for (let dy = 0; dy < win; dy++) {
        for (let dx = 0; dx < win; dx++) {
          meanA += luma(a, wx + dx, wy + dy);
          meanB += luma(b, wx + dx, wy + dy);
        }
      }
      meanA /= n;
      meanB /= n;

      let varA = 0;
      let varB = 0;
      let covAB = 0;
      for (let dy = 0; dy < win; dy++) {
        for (let dx = 0; dx < win; dx++) {
          const da = luma(a, wx + dx, wy + dy) - meanA;
          const db = luma(b, wx + dx, wy + dy) - meanB;
          varA += da * da;
          varB += db * db;
          covAB += da * db;
        }
      }
      varA /= n - 1;
      varB /= n - 1;
      covAB /= n - 1;

      const num = (2 * meanA * meanB + c1) * (2 * covAB + c2);
      const den = (meanA * meanA + meanB * meanB + c1) * (varA + varB + c2);
      totalSsim += den === 0 ? 1 : num / den;
      windows++;
    }
  }
  return windows > 0 ? Number((totalSsim / windows).toFixed(4)) : 0;
}

async function compareImagePair(refPath: string, implBuffer: Buffer, outDir: string, prefix: string) {
  ensureDir(outDir);
  fs.copyFileSync(refPath, path.join(outDir, `${prefix}-reference.png`));
  fs.writeFileSync(path.join(outDir, `${prefix}-implementation.png`), implBuffer);

  const refMeta = await sharp(refPath).metadata();
  const implMeta = await sharp(implBuffer).metadata();

  const refW = refMeta.width || 0;
  const refH = refMeta.height || 0;
  const implW = implMeta.width || 0;
  const implH = implMeta.height || 0;

  const matchW = Math.min(refW, implW);
  const matchH = Math.min(refH, implH);

  const refCropped = await sharp(refPath)
    .extract({ left: 0, top: 0, width: matchW, height: matchH })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const implCropped = await sharp(implBuffer)
    .extract({ left: 0, top: 0, width: matchW, height: matchH })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const diffBuf = Buffer.alloc(matchW * matchH * 4);
  const mismatchedPixels = pixelmatch(refCropped, implCropped, diffBuf, matchW, matchH, {
    threshold: 0.15,
    includeAA: false,
  });

  const totalPixels = matchW * matchH;
  const diffPercent = Number(((mismatchedPixels / Math.max(1, totalPixels)) * 100).toFixed(3));
  const ssimScore = computeSsimWindowed(refCropped, implCropped, matchW, matchH);

  // Save difference.png
  await sharp(diffBuf, { raw: { width: matchW, height: matchH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, `${prefix}-difference.png`));

  // Save overlay.png (50/50 blend of reference + implementation with red diff highlight)
  const overlayBuf = Buffer.alloc(matchW * matchH * 4);
  for (let i = 0; i < overlayBuf.length; i += 4) {
    const isDiff = diffBuf[i] > 200 && diffBuf[i + 1] < 80;
    if (isDiff) {
      overlayBuf[i] = Math.min(255, Math.round(implCropped[i] * 0.4 + 255 * 0.6));
      overlayBuf[i + 1] = Math.round(implCropped[i + 1] * 0.4);
      overlayBuf[i + 2] = Math.round(implCropped[i + 2] * 0.4);
      overlayBuf[i + 3] = 255;
    } else {
      overlayBuf[i] = Math.round((refCropped[i] + implCropped[i]) / 2);
      overlayBuf[i + 1] = Math.round((refCropped[i + 1] + implCropped[i + 1]) / 2);
      overlayBuf[i + 2] = Math.round((refCropped[i + 2] + implCropped[i + 2]) / 2);
      overlayBuf[i + 3] = 255;
    }
  }
  await sharp(overlayBuf, { raw: { width: matchW, height: matchH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, `${prefix}-overlay.png`));

  // Also write standard unsuffixed filenames for viewport comparison
  if (prefix === "viewport") {
    fs.copyFileSync(path.join(outDir, "viewport-reference.png"), path.join(outDir, "reference.png"));
    fs.copyFileSync(path.join(outDir, "viewport-implementation.png"), path.join(outDir, "implementation.png"));
    fs.copyFileSync(path.join(outDir, "viewport-difference.png"), path.join(outDir, "difference.png"));
    fs.copyFileSync(path.join(outDir, "viewport-overlay.png"), path.join(outDir, "overlay.png"));
  }

  return {
    kind: prefix,
    referenceDimensions: { width: refW, height: refH },
    implementationDimensions: { width: implW, height: implH },
    matchedDimensions: { width: matchW, height: matchH },
    heightDeltaPx: implH - refH,
    mismatchedPixels,
    totalPixels,
    diffPercent,
    ssimScore,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: Array<Record<string, unknown>> = [];

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
        // Freeze Date for deterministic LiveClock comparisons
        const fixedMs = new Date("2026-11-26T12:00:00Z").getTime();
        const OrigDate = Date;
        class MockDate extends OrigDate {
          constructor(...args: unknown[]) {
            if (args.length === 0) {
              super(fixedMs);
            } else {
              super(...(args as [string | number]));
            }
          }
          static now() {
            return fixedMs;
          }
        }
        Object.setPrototypeOf(MockDate, OrigDate);
        (window as unknown as { Date: typeof Date }).Date = MockDate as unknown as typeof Date;
      });

      const page = await context.newPage();

      for (const route of ROUTES) {
        const url = `${BASE_URL}${route.implPath}`;
        const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
        await preparePage(page);

        const outDir = path.join(CMP_ROOT, route.key, vp.label);
        ensureDir(outDir);

        const vpBuf = await page.screenshot({ fullPage: false });
        const fullBuf = await page.screenshot({ fullPage: true });

        const refVp = path.join(REF_ROOT, vp.folder, vp.label, `${route.refName}-viewport.png`);
        const refFull = path.join(REF_ROOT, vp.folder, vp.label, `${route.refName}-fullpage.png`);

        const pairMetrics: Array<Record<string, unknown>> = [];
        if (fs.existsSync(refVp)) {
          pairMetrics.push(await compareImagePair(refVp, vpBuf, outDir, "viewport"));
        }
        if (fs.existsSync(refFull)) {
          pairMetrics.push(await compareImagePair(refFull, fullBuf, outDir, "fullpage"));
        }

        const entry = {
          route: route.key,
          path: route.implPath,
          httpStatus: resp?.status() ?? null,
          viewport: vp.label,
          comparisons: pairMetrics,
        };
        fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(entry, null, 2), "utf8");
        results.push(entry);
        console.log(`Compared ${route.key} @ ${vp.label}:`, pairMetrics.map((m) => `${m.kind}: diff=${m.diffPercent}% ssim=${m.ssimScore}`).join(" | "));
      }

      await context.close();
    }

    ensureDir(path.dirname(REPORT_PATH));
    fs.writeFileSync(
      REPORT_PATH,
      JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), results }, null, 2),
      "utf8"
    );
    console.log("Wrote visual comparison summary to", REPORT_PATH);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("compare-screenshots failed:", err);
  process.exit(1);
});
