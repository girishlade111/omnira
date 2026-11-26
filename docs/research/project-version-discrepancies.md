# Project Version and Data Discrepancies

> **Evidence Classification Key:** `VERIFIED` (code/CMS/HTML inspection), `BROWSER-MEASURED` (live Chromium DOM/scroll/click telemetry), `SCREENSHOT-OBSERVED` (user-provided full-page captures), `DOCUMENTATION-DERIVED` (Framer Marketplace / Stylokit / Framplates copy).

## 1. The 12 vs 27 Projects Discrepancy (RESOLVED)

- **Symptom (`VERIFIED` + `SCREENSHOT-OBSERVED`):**
  - Initial HTTP SSR HTML (`research/reference/html/works.html`) and initial viewport load on `/works` contain only **12** projects (`Brandora` through `Landify`).
  - The user-provided full-page screenshot (`research/reference/screenshots/user-provided/works/`) displays **27** projects (9 rows of 3 cards).
- **Root Cause (`VERIFIED` + `BROWSER-MEASURED`):**
  - In `research/reference/technology/chunks/ewDeb3VVFPkyC2MkYdlp-r5GKdMQXdGeE2p0U7UbEFk.CLjMfjOn.mjs`, the Works CMS query component `Ot` is configured with `pageSize: 12` (`Ot({pageSize:12, query:Q(S)})`) paired with a Framer `LoadMore` spinner (`LnE6B5npm`).
  - Decoding the upstream CMS binary (`mD0yv0kks-chunk-default-0.framercms`, collection `6861c96a-f5b2-49ab-998d-2cc51e06ffc1`, saved in `research/reference/content/mD0yv0kks-chunk-default-0.framercms.decoded.json`) proves that **all 27 projects exist in the live CMS**.
  - Live Playwright verification (`research/reference/content/projects-reconciled.json`) confirmed that scrolling `/works` triggers `IntersectionObserver` pagination, appending 12 more cards (24 total) and then 3 more cards (**27 total**), matching the user-provided screenshot 1:1.
- **Additional Portfolio Count Signals (`VERIFIED`):**
  - Home Selected Work: `limit: 6` (items 1-6).
  - Home About Bento Preview: `limit: 4` (items 1-4).
  - Home and About KPI Counter (`PROJECTS`): `40+` (`v3f1I_oEQ: 40`).
  - Testimonials Rating Card (`Card/Rating card`): `4.8` / `FROM 24 CLIENT PROJECTS`.

## 2. "Project Detail Pages" in Listings vs Live Router (`DOCUMENTATION-DERIVED` vs `VERIFIED` / `BROWSER-MEASURED`)

- **Listing Claim (`DOCUMENTATION-DERIVED`):** Both Framer Marketplace (`https://www.framer.com/marketplace/templates/omnira/`) and Stylokit (`https://stylokit.com/templates/omnira`) describe the template as including "project detail pages".
- **Live Site Reality (`VERIFIED`, `BROWSER-MEASURED`):**
  - `sitemap.xml` lists only 5 URLs (`/`, `/about`, `/works`, `/contact`, `/404`).
  - `script_main.DZZ9_rVU.mjs` registers only those 5 routes.
  - Requests to `/works/brandora` and `/projects/brandora` return HTTP `404` (`research/manifests/routes.json`).
  - Every project card links directly via `target="_blank"` to external `https://*.framer.website/` (or `https://thinkbot.framer.ai/`) sites.
- **Rebuild Decision:** Keep external demo links faithful to the live site, and optionally add local `/works/[slug]` case-study view support only if explicitly desired without breaking external link parity.

## 3. Upstream Copy and Link Discrepancies (`VERIFIED`, `BROWSER-MEASURED`)

| Location | Upstream Observed Text / Value | Upstream Target / Counterpart | Notes |
|---|---|---|---|
| Contact page & Footer Email | Displayed text: `HELLO@OMNIRO.STUDIO` / `hello@omniro.studio` | Anchor `href`: `mailto:hello@omnira.studio` | Live DOM (`live-extraction.json`) shows `omniro` in visible text but `omnira` in `mailto:` href. |
| Footer Social Handles | Displayed text: `@omnira_design`, `linkedin.com/in/omnira` | `href`: `https://x.com/Dmytri_Design`, `https://www.linkedin.com/in/dmytri-design/` | Persona text says Omnira while links point to creator Dmytri Ivanov. |
| Contact Budget Range Option 5 | Label: `Not suire yet` | Value: `not-sure-yet` | Upstream spelling typo (`suire`). |
| Home Pricing Starter Feature 1 | `Landing poge` | Intended: `Landing page` | Upstream spelling typo in `EobXXb...mjs` (`w8oIjVlRw`). |
| About Terminal Copy | `STAUS: IN PROGRESS`, `archittecture`, `purpuse + structure + clarity = impact` | Intended: `STATUS:`, `architecture`, `purpose` | Upstream spelling typos inside `1jPVe6...mjs`. |
| Brand Accent Fallback in JS | Fallback strings `rgb(255, 212, 0)` | `:root` CSS `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37: #ff9800` | CSS custom property overrides JS fallback at runtime; rendered accent is `#ff9800` (amber-orange). |
| Works Display Domains | `bradora.studio`, `girdo.studio`, `designer.com` | `Brandora`, `Grido`, `Designor` | Upstream CMS typos in `wQuPbj7YZ`. |

## 4. Marketplace Listing Cross-Check (`VERIFIED`)

- **Framer Marketplace (`https://www.framer.com/marketplace/templates/omnira/`):** `$99`, License `Single-Use` (`framer.com/legal/community-terms`), Published `Jul 5, 2026`, Updated `Oct 21, 2026`, Creator `Dmytri Ivanov (@dmytri-ivanov)`.
- **Stylokit (`https://stylokit.com/templates/omnira`):** `$99`, `Commercial license`, `Page number: 5`, `CMS: 2`, Checkout via Lemon Squeezy (`stylokit.lemonsqueezy.com/checkout/buy/2f9c0adb-b559-41e0-98d8-e7d3f1ed923a`).
- **Framplates (`https://framplates.com/omnira`):** `$99`, aggregator listing pointing to Framer template.
