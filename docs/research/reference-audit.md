# Reference Site Audit (`https://omnira.framer.website/`)

> **Evidence Classification Key:** `VERIFIED` (direct HTTP fetch, HTML/CSS/JS/CMS bundle decoding in `research/reference/`), `BROWSER-MEASURED` (live Playwright Chromium inspection in `research/manifests/{routes,interactions}.json` and `research/reference/content/live-extraction.json`), `SCREENSHOT-OBSERVED` (user-provided captures in `research/reference/screenshots/user-provided/`), `DOCUMENTATION-DERIVED` (Framer Marketplace, Stylokit, Framplates listings), `INFERRED` (architectural conclusions).

## 1. Executive Summary (`VERIFIED`, `BROWSER-MEASURED`)

- **Subject:** Omnira Framer Portfolio Template (`https://omnira.framer.website/`) created by Dmytri Ivanov (`@dmytri-ivanov`, `Stylokit`, `$99`).
- **Live Page Footprint:** Five active routes (`/`, `/about`, `/works`, `/contact`, `/404`) confirmed via `sitemap.xml`, `script_main.DZZ9_rVU.mjs`, HTTP recon, and Playwright (`research/manifests/routes.json`).
- **CMS Collections:** Two Framer CMS collections decoded from `.framercms` binaries:
  - `Works` (`6861c96a-f5b2-49ab-998d-2cc51e06ffc1` / `mD0yv0kks`): `27` records (`Brandora` through `Platify`).
  - `Categories` (`a_FhlAd4Y`): `4` filter categories (`AI`: 3, `BUSINESS`: 12, `ONE PAGE`: 5, `PORTFOLIO`: 7) plus default `ALL PROJECTS` (`27`).
- **Marketplace Cross-Check (`DOCUMENTATION-DERIVED` vs `VERIFIED`):** Framer Marketplace (`Single-Use Commercial License`, `https://www.framer.com/legal/community-terms` Section `7.3.2`) and Stylokit (`https://stylokit.com/templates/omnira`, `https://stylokit.com/license`) specify 5 pages and 2 CMS collections. Although listing prose mentions "project detail pages", the live Framer site has no `/works/:slug` or `/projects/:slug` routes (all tested detail paths return HTTP `404`), and all 27 project cards link externally.

## 2. Page-by-Page Structural & Interactive Audit (`VERIFIED`, `BROWSER-MEASURED`, `SCREENSHOT-OBSERVED`)

### 2.1 Global Chrome (`Header`, `Side Rails`, `Footer`)
- **Top Navigation (`Nav/Navigation`):** Brand mark + `OMNIRA` (`/`), `HOME` (`/`), `ABOUT` (`/about`), `WORKS` (`/works`), `CONTACT` (`/contact`), and CTA button `LET'S TALK` (`/contact`).
- **Architectural Side Rails:** Responsive vertical gutter columns (`96px` desktop >= `1200px`, `48px` tablet `810px-1199.98px`, `16px` mobile <= `809.98px`) filled with 145-degree CSS diagonal hatch lines (`repeating-linear-gradient`).
- **Footer:** Navigation links (`HOME`, `ABOUT`, `WORKS`, `CONTACT`), `LOCAL TIME:` live clock pinned via `Intl.DateTimeFormat` to `Europe/Berlin` (`12h` format with seconds; Playwright measured `09:49:52 PM` Berlin time while local browser zone `America/Los_Angeles` was `12:49:52 PM`), `© MADE IN STYLOKIT`, and social links (`Email`, `X`, `LinkedIn`).

### 2.2 Home (`/`) (`VERIFIED`, `BROWSER-MEASURED`)
1. **Initial Loader (`Initial Loader`):** Fullscreen `#000000` preloader (`minDuration: 1.2s`, `maxWait: 8s`, `exitEffect: "grid"`, `gridSize: 24px`, `fadeDuration: 0.75s`).
2. **Hero:** Badge `INTERFACE DESIGNER`, rotating 3D `rotateX` headline (`DESIGN BEYOND THE` + `["INTERFACE", "SYSTEM", "PRODUCT", "EXPERIENCE"]` at `3s` interval), description, `VIEW WORKS` + `EXPLORE PROCESS` CTAs, `STATUS: AVAILABLE FOR HIRE` with `750ms` pulsing green indicator, `SCROLL TO EXPLORE`, and interactive Canvas 2D dot-matrix portrait (`Stylokit Image Halftone`).
3. **Selected Work:** Displays `6` featured projects (`limit: 6`, `Brandora` through `Studyflow`) with chamfered `BG Border` cards and hover corner/zoom transitions.
4. **Process (`FROM CONCEPT TO LAUNCH`):** `4` phases (`PHASES 01: DISCOVER`, `02: Design`, `03: Build`, `04: Refine`) wrapped in `HoverCardMove` pointer-tilt cards, horizontal scroll-progress bar with `4` glowing dots (`#content-1..4`), `4` principle chips (`CLARITY`, `STRUCTURE`, `MOTION`, `IMPACT`), and `3` animated metrics (`4 PHASES`, `100% PRECISION`, `infinity POSSIBILITIES`).
5. **About Preview (`SHARP DESIGN CLEAN FLOW`):** Status `OPEN FOR WORK`, `6+ YEARS`, `40+ PROJECTS`, `10K+ CLIENTS` (`AnimatedNumber`), `4` capability cards (`01`..`04`), and `4`-project bento preview (`limit: 4`).
6. **Services (`WHAT I CREATE`):** Click-only `4`-tab selector (`Design`, `Development`, `VISUAL SYSTEM`, `CREATIVE`; Playwright verified hover alone does not expand deliverables) paired with an interactive `4`-layer pure React+CSS isometric diamond stack (`Gi` / `Ki`).
7. **Testimonials:** `Previous` / `Next` carousel cycling `6` client testimonials (`Marko Ivanov`, `Daniel Kim`, `Sarah Chen`, `Leon Hart`, `Sofia brand`, `Mira klein`), `4.8` rating card (`CLIENT SATISFACTION`, `FROM 24 CLIENT PROJECTS`), and `8` partner logos.
8. **Pricing:** `3` packages (`STARTER` `$1,200`, `PRO` `$2,400` featured, `Custom` `$4,800`) with per-character blur-in digit animation (`Go`) + `4` assurance strip items (`SECURE`, `FAST DELIVERY`, `PROCESS`, `SUPPORT`).
9. **FAQs (`01`..`08`):** `8` collapsible accordion items (all Q&As verified in `aspL4zAAs.4wUx_Cd_.mjs` and `interactions.json`).
10. **CTA Card (`Lets talk about your project`):** Links to `/contact`.

### 2.3 About (`/about`) (`VERIFIED`, `BROWSER-MEASURED`)
- **Profile System:** `Adrian Voss`, Graphic designer / Web design, `6+ years`, `Germany, Berlin`, KPI counters (`6+`, `40+`, `10K+`), portrait + signature.
- **Process Terminal:** Visual-only (`isInteractiveOnLiveSite: false` in `interactions.json`), displaying `5` steps (`01 INPUT`..`05 LAUNCH`), prompt `omnira@terminal: -$`, command `purpuse + structure + clarity = impact`, `OUTPUT` 5-layer isometric stack, and `SYSTEM CHECK [ALL OK]` (`CLARITY`, `RESPONSIVE`, `MOTION`, `PERFORMANCE`).
- **Core Services & Pillars:** `4` service cards + `STRATEGY / DESIGN / DEVELOPMENT / IMPACT` strip.
- **Timeline Archive:** `7` milestones (`2020`-`2026`, `Design foundation` through `Sharper systems`) paired with a vertical scroll-progress dot tracker (`#timeline-1..7`).
- **System Stack (`Tools`):** `4` clickable tabs (`DESIGN`, `DEVELOPMENT`, `MOTION`, `3D / VISUAL`), `4` tool cards each (`16` tools total) with external tool links and inline SVG icons.
- **Testimonials:** Shared section with Home.

### 2.4 Works (`/works`) (`VERIFIED`, `BROWSER-MEASURED`, `SCREENSHOT-OBSERVED`)
- Renders `pageSize: 12` in SSR HTML and loads all `27` projects on scroll (`12 -> 24 -> 27`, `scrollHeight: 2789 -> 4704`, `projects-reconciled.json`).
- Category filter buttons (`ALL PROJECTS`, `AI`, `BUSINESS`, `ONE PAGE`, `PORTFOLIO`) filter deterministically to `27`, `3`, `12`, `5`, `7` projects.

### 2.5 Contact (`/contact`) & Error (`/404`) (`VERIFIED`, `BROWSER-MEASURED`)
- **Contact:** Status rows (`AVAILABLE FOR HIRE`, `WITHIN 24 HOURS`, `STRONG`), Email (`hello@omniro.studio` display text / `mailto:hello@omnira.studio` href), Location (`BERLIN, GERMANY` -> Google Maps), `6` visible form controls (`Name`, `Email`, `PROJECT TYPE`, `BUDGET RANGE`, `TIMELINE`, `PROJECT DETAILS` + `11` hidden honeypot inputs in Framer form runtime), `SEND REQUEST` button, and `8` FAQs.
- **404:** Serves HTTP `404` for `/404` and unknown routes (`/nonexistent-check-404`, `/does-not-exist-404`, `/works/brandora`, `/projects/brandora`) with `ERROR / 404 / PAGE NOT FOUND`, `BACK TO HOME` (`/`), and `Contact me` (`/contact`).

## 3. Upstream Anomalies Flagged for Clean Handling (`VERIFIED`, `BROWSER-MEASURED`)

- Upstream text typos: `bradora.studio`, `girdo.studio`, `designer.com`, `hello@omniro.studio` (vs `mailto:hello@omnira.studio`), `Not suire yet`, `Landing poge`, `STAUS:`, `archittecture`, `purpuse`, `Everthing`, `end project delivery`.
- Missing upstream asset: `https://framerusercontent.com/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg` returns HTTP `404` (replaced locally with an inline SVG spinner).
- JS fallback vs CSS token: Compiled Framer JS contains fallback `#ffd400` (`rgb(255, 212, 0)`), while `:root` CSS sets `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37: #ff9800`.
