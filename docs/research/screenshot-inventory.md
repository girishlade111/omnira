# Reference Screenshot Inventory

> **Evidence Classification Key:** `SCREENSHOT-OBSERVED` (directly inspected pixel content and layout in the 4 user-provided PNGs), `BROWSER-MEASURED` (automated Playwright Chromium captures and Sharp image dimension/byte telemetry in `research/reference/screenshots/`).

## 1. User-Provided Full-Page Captures (`SCREENSHOT-OBSERVED`, `BROWSER-MEASURED`)

All four user-provided captures were located in `Downloads` (`screencapture-omnira-framer-website*.png`) and archived under `research/reference/screenshots/user-provided/`. They were captured on `2026-11-26` between `09:53:46` and `09:55:57` local time (`18:53` to `18:56` `Europe/Berlin` clock visible in footers) at `1910px` CSS capture width via a full-page scroll-stitching browser extension.

| Page | Archive Path | Dimensions (px) | Bytes | Observed Visual & Motion Notes (`SCREENSHOT-OBSERVED`) |
|---|---|---:|---:|---|
| Home (`/`) | `research/reference/screenshots/user-provided/home/screencapture-omnira-framer-website-2026-11-26-09_53_46.png` | `1910 x 17187` | 9,387,779 | Hero displays `"DESIGN BEYOND THE EXPERIENCE"` (`EXPERIENCE` rotation frame) + Canvas 2D dot-matrix portrait. Selected Work shows 6 cards (2x3 grid). Process (`FROM CONCEPT TO LAUNCH`) and Services (`DIGITAL SYSTEMS FOR BOLD BRANDS`) span tall sticky-scroll runways creating dark vertical scroll bands between pinned stages. Pricing `$1,200` / `$2,400` / `$4,800` digits and `"PRE-BUILD"` FAQ span appear dimmed/mid-transition when stitched without pausing at `threshold: 0.5`. |
| About (`/about`) | `research/reference/screenshots/user-provided/about/screencapture-omnira-framer-website-about-2026-11-26-09_54_56.png` | `1910 x 9081` | 7,406,609 | Hero shows `BUILD WITH CLEAR DIRECTION`, portrait + `6+ / 40+ / 10K+` counters, Adrian Voss bio + signature + Profile card. Terminal shows 5 steps (`INPUT`..`LAUNCH`), `purpuse + structure + clarity = impact`, 5-layer isometric stack, and `SYSTEM CHECK [ALL OK]`. Timeline shows `2020`, `2023`, `2026` highlighted bright while `2021`, `2022`, `2024`, `2025` are dimmed. System Stack shows `DESIGN` tab active (`FIGMA`, `PHOTOSHOP`, `ILLUSTRATOR`, `DESIGN SYSTEMS`). |
| Works (`/works`) | `research/reference/screenshots/user-provided/works/screencapture-omnira-framer-website-works-2026-11-26-09_55_31.png` | `1910 x 5880` | 7,027,557 | Shows `ALL PROJECTS` active pill and all **27 project cards** in 9 rows x 3 columns (`BRANDORA` through `PLATIFY`), confirming scroll-triggered `LoadMore` loaded items 13-27 beyond the initial 12 SSR cards. Footer shows `LOCAL TIME: 06:55:36 PM`. Bottom CTA `"LET'S BUILD"` is mid-scroll-reveal above `"SOMETHING"`. |
| Contact (`/contact`) | `research/reference/screenshots/user-provided/contact/screencapture-omnira-framer-website-contact-2026-11-26-09_55_57.png` | `1910 x 2933` | 2,581,021 | Shows `CONTACT CHANNEL`, `LET'S BUILD SOMETHING`, status rows (`AVAILABLE FOR HIRE`, `WITHIN 24 HOURS`, `STRONG`), `HELLO@OMNIRO.STUDIO`, `BERLIN, GERMANY`, 6-field form (`SEND REQUEST`), 8 collapsed FAQs (`01`..`08`), CTA card, and footer (`LOCAL TIME: 06:56:00 PM`). |

### Key Takeaways from Comparing User Captures vs Live DOM
1. **Tall Sticky Scroll Regions (Home):** The `17,187px` Home height is driven by Framer sticky-scroll sections in Process and Services (`desktop/1440x900/home-fullpage.png` measures `15,683px`, `desktop/1920x1080/home-fullpage.png` measures `17,375px`).
2. **Works 27-Card Layout:** The `1910 x 5880` Works capture matches the 27-card scrolled Playwright full-page capture (`desktop/1440x900/works-fullpage.png` at `1440 x 4704`) and the 27 decoded CMS records (`Brandora`..`Platify`).
3. **Scroll-Triggered Appear Artifacts:** Scroll-stitching extensions sometimes capture Framer `onInView` elements (`Go` blur-in digits, `"PRE-BUILD"` span, CTA heading/email row) mid-animation before intersection settles.

## 2. Automated Playwright Reference Captures (`BROWSER-MEASURED`)

All automated captures reside under `research/reference/screenshots/` (173 total PNG files across 8 category directories):

### 2.1 Desktop Viewports (`desktop/`, 31 PNGs)
- **`desktop/1280x800/` (10 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png`
  - Full-page heights at `1280px`: Home `14,682px`, About `7,349px`, Works `4,429px`, Contact `2,347px`, 404 `1,565px`.
- **`desktop/1440x900/` (11 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png` + `home-fullpage-unscrolled.png`
  - Full-page heights at `1440px`: Home `15,683px`, About `7,265px`, Works `4,704px`, Contact `2,347px`, 404 `1,565px`.
- **`desktop/1920x1080/` (10 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png`
  - Full-page heights at `1920px`: Home `17,375px`, About `7,265px`, Works `4,704px`, Contact `2,347px`, 404 `1,565px`.

### 2.2 Tablet Viewports (`tablet/`, 20 PNGs)
- **`tablet/1024x768/` (10 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png`
  - Full-page heights: Home `10,212px`, About `9,699px`, Works `7,289px`, Contact `2,997px`, 404 `1,333px`.
- **`tablet/768x1024/` (10 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png`
  - Full-page heights: Home `14,199px`, About `10,870px`, Works `18,914px`, Contact `3,361px`, 404 `2,065px`.

### 2.3 Mobile Viewports (`mobile/`, 22 PNGs)
- **`mobile/390x844/` (11 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png` + `home-mobile-menu-open.png`
  - Full-page heights: Home `13,211px`, About `11,003px`, Works `11,207px`, Contact `3,565px`, 404 `2,065px`.
- **`mobile/320x700/` (11 PNGs):** `{home,about,works,contact,not-found}-{viewport,fullpage}.png` + `home-mobile-menu-open.png`
  - Full-page heights: Home `13,586px`, About `11,793px`, Works `9,812px`, Contact `3,777px`, 404 `2,089px`.

### 2.4 Section Strips (`sections/`, 30 PNGs)
- **`sections/about/` (10 PNGs, `1440x900`):** `about-y00000.png` through `about-y07200.png` (`800px` Y increments, `202KB`-`627KB` each, showing rendered Profile, Terminal, Services, Timeline, Tools, Testimonials, Footer).
- **`sections/home/` (20 PNGs, `1440x900`):** `home-y00000.png` through `home-y15200.png` (`800px` Y increments; note all 20 files are `5,848B` because `Initial Loader` overlay covered the viewport during that pass - use `animation-frames/scroll-5pct/` for rendered Home scroll bands).

### 2.5 Hover, Interaction, and Animation Frames (`hover-states/`, `interaction-states/`, `animation-frames/`, 66 PNGs)
- **`hover-states/` (1 PNG, `1440x900`):** `hero-cta-hover.png` (`687,206B`).
- **`interaction-states/` (2 PNGs, `1440x900`):** `contact-initial-selects-3.png` (`556,454B`), `contact-select-focused.png` (`548,198B`).
- **`animation-frames/hero-headline/` (1 PNG):** `headline-state-1.png`.
- **`animation-frames/hero-portrait/` (5 PNGs):** `hero-pointer-{center,top-left,top-right,bottom-left,bottom-right}.png` (`712KB`-`796KB`, capturing pointer repulsion on the Canvas 2D halftone portrait).
- **`animation-frames/loading/` (12 PNGs):** `loading-{0000..3400}ms.png` (`5,848B` black overlay at `0-1000ms`, transitioning `6,636B` at `1300-3400ms`).
- **`animation-frames/process/` (11 PNGs):** `process-step-00-y0.png` through `process-step-10-y15183.png`.
- **`animation-frames/services/` (13 PNGs):** `services-scroll-00-y0.png` through `services-scroll-12-y15283.png`.
- **`animation-frames/scroll-5pct/` (21 PNGs):** `scroll-000.png` through `scroll-100.png` (5% scroll increments across Home, `142KB`-`693KB` rendered frames).
