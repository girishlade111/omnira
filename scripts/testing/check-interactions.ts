import { chromium, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_PATH = path.resolve("research/reports/interaction-check.json");

interface InteractionCheckResult {
  name: string;
  passed: boolean;
  details: Record<string, unknown>;
}

async function prepare(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForFunction(
    () => !document.querySelector('[data-loading-screen="true"], [style*="2147483647"]'),
    { timeout: 6000 }
  ).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function checkWorksFilters(page: Page): Promise<InteractionCheckResult> {
  await page.goto(`${BASE_URL}/works`, { waitUntil: "domcontentloaded" });
  await prepare(page);

  const expectedCounts: Array<{ label: string; count: number }> = [
    { label: "ALL PROJECTS", count: 27 },
    { label: "AI", count: 3 },
    { label: "BUSINESS", count: 12 },
    { label: "ONE PAGE", count: 5 },
    { label: "PORTFOLIO", count: 7 },
  ];

  const observed: Record<string, number> = {};
  for (const item of expectedCounts) {
    const btn = page.getByRole("button", { name: new RegExp(`^${item.label}$`, "i") }).first();
    if ((await btn.count()) > 0) {
      await btn.click();
    } else {
      await page.locator(`button:has-text("${item.label}"), [role="tab"]:has-text("${item.label}")`).first().click();
    }
    await page.waitForTimeout(200);
    const cardCount = await page.locator("main a[target='_blank'], main article a[href^='http']").count();
    observed[item.label] = cardCount;
  }

  const passed = expectedCounts.every((e) => observed[e.label] === e.count);
  return { name: "works-filters-27-projects", passed, details: { expectedCounts, observed } };
}

async function checkHomeInteractions(page: Page): Promise<InteractionCheckResult[]> {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await prepare(page);

  // 1. Services 4 tabs
  const serviceTabs = ["DESIGN", "DEVELOPMENT", "VISUAL SYSTEM", "CREATIVE"];
  const serviceStates: Record<string, boolean> = {};
  for (const tab of serviceTabs) {
    const el = page.locator(`button:has-text("${tab}")`).first();
    if ((await el.count()) > 0) {
      await el.scrollIntoViewIfNeeded();
      await el.click();
      await page.waitForTimeout(200);
      const expanded = await el.getAttribute("aria-expanded");
      serviceStates[tab] = expanded === "true" || (await page.locator(`text=${tab}`).count()) > 0;
    } else {
      serviceStates[tab] = false;
    }
  }

  // 2. Testimonials Next / Previous
  const nextBtn = page.getByRole("button", { name: /next/i }).first();
  const prevBtn = page.getByRole("button", { name: /prev/i }).first();
  let carouselOk = false;
  if ((await nextBtn.count()) > 0 && (await prevBtn.count()) > 0) {
    await nextBtn.scrollIntoViewIfNeeded();
    const beforeText = await page.locator("section").filter({ hasText: "TESTIMONIALS" }).first().innerText().catch(() => "");
    await nextBtn.click();
    await page.waitForTimeout(250);
    const afterNext = await page.locator("section").filter({ hasText: "TESTIMONIALS" }).first().innerText().catch(() => "");
    await prevBtn.click();
    await page.waitForTimeout(250);
    const afterPrev = await page.locator("section").filter({ hasText: "TESTIMONIALS" }).first().innerText().catch(() => "");
    carouselOk = beforeText !== afterNext && afterPrev.length > 20;
  }

  // 3. FAQ 8 accordions
  const faqButtons = page.locator("section").filter({ hasText: "FAQs" }).locator("button[aria-expanded]");
  const faqCount = await faqButtons.count();
  let faqToggled = 0;
  for (let i = 0; i < faqCount; i++) {
    const btn = faqButtons.nth(i);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(120);
    if ((await btn.getAttribute("aria-expanded")) === "true") {
      faqToggled++;
    }
  }

  return [
    {
      name: "home-services-4-tabs",
      passed: Object.values(serviceStates).every(Boolean),
      details: { serviceStates },
    },
    {
      name: "home-testimonials-carousel",
      passed: carouselOk,
      details: { carouselOk },
    },
    {
      name: "home-faq-8-accordions",
      passed: faqCount === 8 && faqToggled === 8,
      details: { faqCount, faqToggled },
    },
  ];
}

async function checkAboutInteractions(page: Page): Promise<InteractionCheckResult[]> {
  await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded" });
  await prepare(page);

  // Terminal 5 steps
  const steps = ["INPUT", "STRATEGY", "STRUCTURE", "INTERFACE", "LAUNCH"];
  const terminalClicked: string[] = [];
  const terminalSection = page.locator("section").filter({ hasText: "TERMINAL" }).first();
  for (const step of steps) {
    const btn = terminalSection.locator(`button:has-text("${step}")`).first();
    if ((await btn.count()) > 0) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForTimeout(150);
      terminalClicked.push(step);
    }
  }

  // System Stack 4 tabs
  const stackTabs = ["DESIGN", "DEVELOPMENT", "MOTION", "3D / VISUAL"];
  const stackObserved: Record<string, number> = {};
  const stackSection = page.locator("section").filter({ hasText: "SYSTEM STACK" }).first();
  for (const tab of stackTabs) {
    const btn = stackSection.locator(`button:has-text("${tab}")`).first();
    if ((await btn.count()) > 0) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForTimeout(200);
      const links = await stackSection.locator("a[href^='http']").count();
      stackObserved[tab] = links;
    } else {
      stackObserved[tab] = 0;
    }
  }

  return [
    {
      name: "about-terminal-5-steps",
      passed: terminalClicked.length === 5,
      details: { terminalClicked },
    },
    {
      name: "about-system-stack-4-tabs",
      passed: stackTabs.every((t) => (stackObserved[t] ?? 0) >= 4),
      details: { stackObserved },
    },
  ];
}

async function checkContactInteractions(page: Page): Promise<InteractionCheckResult> {
  await page.goto(`${BASE_URL}/contact`, { waitUntil: "domcontentloaded" });
  await prepare(page);

  const nativeSelectCount = await page.locator("main select").count();

  // Attempt invalid empty submit
  const submitBtn = page.getByRole("button", { name: /send request/i }).first();
  await submitBtn.scrollIntoViewIfNeeded();
  await submitBtn.click();
  await page.waitForTimeout(250);
  const errorCountAfterEmptySubmit = await page.locator('[role="alert"], [aria-invalid="true"]').count();

  // Fill fields and select custom dropdowns
  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const messageInput = page.locator("textarea").first();

  if ((await nameInput.count()) > 0) await nameInput.fill("Alex Morgan");
  if ((await emailInput.count()) > 0) await emailInput.fill("alex@example.com");
  if ((await messageInput.count()) > 0) await messageInput.fill("Looking to build a next-gen AI product marketing site.");

  // Select custom combobox / listbox options
  const dropdownTriggers = page.locator('button[aria-haspopup="listbox"]');
  const dropdownCount = await dropdownTriggers.count();
  let selectedDropdowns = 0;
  for (let i = 0; i < dropdownCount; i++) {
    const trigger = dropdownTriggers.nth(i);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForTimeout(150);
    const firstOption = page.locator('[role="option"]').first();
    if ((await firstOption.count()) > 0) {
      await firstOption.click();
      selectedDropdowns++;
      await page.waitForTimeout(120);
    }
  }

  // Submit form and observe response/confirmation
  await submitBtn.click();
  await page.waitForTimeout(600);
  const statusText = await page.locator("main form").innerText().catch(() => "");

  const passed =
    nativeSelectCount === 0 &&
    errorCountAfterEmptySubmit > 0 &&
    dropdownCount >= 3 &&
    selectedDropdowns === dropdownCount &&
    /sent|received|thank|demo|success|submitted/i.test(statusText);

  return {
    name: "contact-validation-custom-dropdowns-submit",
    passed,
    details: {
      nativeSelectCount,
      errorCountAfterEmptySubmit,
      dropdownCount,
      selectedDropdowns,
      confirmationMatched: /sent|received|thank|demo|success|submitted/i.test(statusText),
    },
  };
}

async function checkMobileDrawer(browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<InteractionCheckResult> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
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
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await prepare(page);

  const openBtn = page.locator('header button[aria-expanded], header button[aria-label*="menu" i]').first();
  let opened = false;
  let hasLinks = false;
  let closed = false;
  if ((await openBtn.count()) > 0) {
    await openBtn.click();
    await page.waitForTimeout(300);
    opened = (await openBtn.getAttribute("aria-expanded")) === "true" || (await page.getByRole("link", { name: "LET'S TALK" }).count()) > 0;
    const dialogOrNav = page.locator('[role="dialog"], nav[aria-label*="mobile" i]');
    hasLinks = (await dialogOrNav.getByRole("link", { name: "WORKS" }).count()) > 0 || (await page.getByRole("link", { name: "WORKS" }).count()) > 0;
    const closeBtn = page.locator('button[aria-label*="close" i], header button[aria-expanded="true"]').first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
      await page.waitForTimeout(250);
      closed = (await openBtn.getAttribute("aria-expanded")) !== "true";
    }
  }

  await context.close();
  return {
    name: "mobile-drawer-open-close",
    passed: opened && hasLinks && closed,
    details: { opened, hasLinks, closed },
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: InteractionCheckResult[] = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
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

    results.push(await checkWorksFilters(page));
    results.push(...(await checkHomeInteractions(page)));
    results.push(...(await checkAboutInteractions(page)));
    results.push(await checkContactInteractions(page));
    await context.close();

    results.push(await checkMobileDrawer(browser));

    const failures = results.filter((r) => !r.passed).length;
    for (const r of results) {
      console.log(`[${r.passed ? "PASS" : "FAIL"}] ${r.name}:`, JSON.stringify(r.details));
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
  console.error("check-interactions failed:", err);
  process.exit(1);
});
