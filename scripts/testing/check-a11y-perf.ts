import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const A11Y_REPORT = path.resolve('research/reports/a11y-report.json');
const PERF_REPORT = path.resolve('research/reports/perf-report.json');

const ROUTES = ['/', '/about', '/works', '/contact', '/nonexistent-check-404'];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const a11yResults: Array<Record<string, unknown>> = [];
  const perfResults: Array<Record<string, unknown>> = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await context.addInitScript(() => {
      try {
        window.sessionStorage.setItem('omnira_initial_loader_seen', 'true');
      } catch {
        // ignore
      }
      window.__perfMetrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perfMetrics.lcp = entry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutEntry.hadRecentInput && typeof layoutEntry.value === 'number') {
            window.__perfMetrics.cls += layoutEntry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    for (const route of ROUTES) {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(450);

      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalAndSerious = axe.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      a11yResults.push({
        route,
        violationCount: axe.violations.length,
        criticalAndSeriousCount: criticalAndSerious.length,
        passesCount: axe.passes.length,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
          targets: v.nodes.slice(0, 3).map((n) => n.target),
        })),
      });

      const perf = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        return {
          lcpMs: Math.round(window.__perfMetrics?.lcp ?? 0),
          cls: Number((window.__perfMetrics?.cls ?? 0).toFixed(4)),
          ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
          domInteractiveMs: nav ? Math.round(nav.domInteractive - nav.startTime) : 0,
          loadEventMs: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
        };
      });

      perfResults.push({ route, ...perf });

      console.log(
        `[A11Y] ${route}: violations=${axe.violations.length} (crit/ser=${criticalAndSerious.length}) passes=${axe.passes.length}`,
      );
      console.log(
        `[PERF] ${route}: LCP=${perf.lcpMs}ms CLS=${perf.cls} TTFB=${perf.ttfbMs}ms DOM=${perf.domInteractiveMs}ms`,
      );

      await page.close();
    }

    // Keyboard Tab sanity check on Home & Contact
    const kbPage = await context.newPage();
    await kbPage.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await kbPage.keyboard.press('Tab');
    const firstFocusText = await kbPage.evaluate(() =>
      (document.activeElement?.textContent || '').trim(),
    );
    await kbPage.close();

    fs.mkdirSync(path.dirname(A11Y_REPORT), { recursive: true });
    fs.writeFileSync(
      A11Y_REPORT,
      JSON.stringify(
        {
          baseUrl: BASE_URL,
          generatedAt: new Date().toISOString(),
          firstSkipFocus: firstFocusText,
          routes: a11yResults,
        },
        null,
        2,
      ),
      'utf8',
    );

    fs.writeFileSync(
      PERF_REPORT,
      JSON.stringify(
        {
          baseUrl: BASE_URL,
          generatedAt: new Date().toISOString(),
          viewport: '1440x900',
          routes: perfResults,
        },
        null,
        2,
      ),
      'utf8',
    );
  } finally {
    await browser.close();
  }
}

declare global {
  interface Window {
    __perfMetrics: { lcp: number; cls: number };
  }
}

main().catch((err) => {
  console.error('check-a11y-perf failed:', err);
  process.exit(1);
});
