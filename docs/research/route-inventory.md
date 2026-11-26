# Route Inventory and Link Topology

> **Evidence Classification Key:** `VERIFIED` (observed via direct HTTP fetch, `sitemap.xml`, `robots.txt`, and Framer router bundle `script_main.DZZ9_rVU.mjs`), `BROWSER-MEASURED` (observed via Playwright Chromium in `research/manifests/routes.json`), `DOCUMENTATION-DERIVED` (stated on Framer Marketplace / Stylokit / Framplates listings).

## 1. Live Route Table (`https://omnira.framer.website`)

| Route | HTTP Status | Source Evidence | Classification | Notes |
|---|---:|---|---|---|
| `/` | 200 | `research/reference/html/home.headers.json`, `research/manifests/routes.json` | `VERIFIED`, `BROWSER-MEASURED` | Home page (`872,425` bytes HTML). Renders Selected Work (`limit: 6`), Process (`#content-1..4`), About preview (`limit: 4`), Services (`#section-1..4`), Testimonials, Pricing, FAQs, CTA, Footer. |
| `/about` | 200 | `research/reference/html/about.headers.json`, `research/manifests/routes.json` | `VERIFIED`, `BROWSER-MEASURED` | Profile (`Adrian Voss`, Berlin, `6+` years / `40+` projects / `10K+` clients), Terminal 5-step workflow, 4 Services, Timeline (`2020`-`2026`), System Stack (`DESIGN`, `DEVELOPMENT`, `MOTION`, `3D / VISUAL`), Testimonials. |
| `/works` | 200 | `research/reference/html/works.headers.json`, `research/manifests/routes.json` | `VERIFIED`, `BROWSER-MEASURED` | Portfolio grid (`301,037` bytes HTML). Initial SSR renders 12 items (`pageSize: 12`); client-side IntersectionObserver loads all 27 CMS records across 5 filter tabs (`ALL PROJECTS`, `AI`, `BUSINESS`, `ONE PAGE`, `PORTFOLIO`). |
| `/contact` | 200 | `research/reference/html/contact.headers.json`, `research/manifests/routes.json` | `VERIFIED`, `BROWSER-MEASURED` | Contact channel (`AVAILABLE FOR HIRE`, `WITHIN 24 HOURS`, `STRONG`, `HELLO@OMNIRO.STUDIO` / `mailto:hello@omnira.studio`, `Berlin, Germany`), 6-field project inquiry form, 8 FAQs. |
| `/404` | 404 | `research/reference/html/404.headers.json`, `research/manifests/routes.json` | `VERIFIED`, `BROWSER-MEASURED` | Custom error page (`ERROR`, `404`, `PAGE NOT FOUND`) with `BACK TO HOME` (`/`) and `Contact me` (`/contact`) CTAs (`245,983` bytes HTML). |
| `/nonexistent-check-404` | 404 | `research/reference/html/nonexistent-check-404.headers.json` | `VERIFIED` | Unknown route returns HTTP `404` with identical HTML (`245,983` bytes) to `/404`. |
| `/does-not-exist-404` | 404 | `research/manifests/routes.json` | `BROWSER-MEASURED` | Playwright check confirms unknown routes return HTTP `404` and custom 404 DOM. |
| `/works/brandora` | 404 | `research/manifests/routes.json` | `BROWSER-MEASURED` | Confirmed absent (`404`). No `/works/:slug` route exists on live Framer site. |
| `/projects/brandora` | 404 | `research/manifests/routes.json` | `BROWSER-MEASURED` | Confirmed absent (`404`). No `/projects/:slug` route exists on live Framer site. |
| `/sitemap.xml` | 200 | `research/reference/html/sitemap.xml` | `VERIFIED` | Lists exactly 5 URLs: `/`, `/about`, `/works`, `/contact`, `/404`. |
| `/robots.txt` | 200 | `research/reference/html/robots.txt` | `VERIFIED` | `User-agent: *`, `Allow: /`, `Sitemap: https://omnira.framer.website/sitemap.xml`. |

## 2. Framer Router Registration Check (`VERIFIED`)

Inspection of `research/reference/technology/chunks/script_main.DZZ9_rVU.mjs` confirms Framer's compiled client router registers exactly five path patterns:
- `/`
- `/about`
- `/works`
- `/contact`
- `/404`

Although marketplace listings (`https://www.framer.com/marketplace/templates/omnira/` and `https://stylokit.com/templates/omnira`, `DOCUMENTATION-DERIVED`) mention "project detail pages", the live demo does not expose `/works/:slug` or `/projects/:slug` routes. Every project card's anchor tag links directly to its external demo URL (`https://*.framer.website/` or `https://thinkbot.framer.ai/`).

## 3. Internal Anchor & Navigation Links (`VERIFIED`, `BROWSER-MEASURED`)

- **Primary Navigation (`Nav/Navigation`):** `OMNIRA` (`/`), `HOME` (`/`), `ABOUT` (`/about`), `WORKS` (`/works`), `CONTACT` (`/contact`), CTA `LET'S TALK` (`/contact`).
- **Home Process Anchor Links:** `./#content-1`, `./#content-2`, `./#content-3`, `./#content-4`.
- **Home Services Anchor Links:** `./#section-1`, `./#section-2`, `./#section-3`, `./#section-4`.
- **Footer Links:** `OMNIRA` (`/`), `HOME` (`/`) , `ABOUT` (`/about`), `WORKS` (`/works`), `CONTACT` (`/contact`), `mailto:hello@omnira.studio` (rendered text `hello@omniro.studio` in live DOM), `https://x.com/Dmytri_Design` (rendered text `@omnira_design`), `https://www.linkedin.com/in/dmytri-design/` (rendered text `linkedin.com/in/omnira`).
- **Floating Template Action Badge (Demo Overlay):** `Remix Template` CTA linking to `https://stylokit.lemonsqueezy.com/checkout/buy/2f9c0adb-b559-41e0-98d8-e7d3f1ed923a` (`Purchase`) and `https://framer.link/bFVcS5o` (`Framer`).

## 4. External Links Inventory (`VERIFIED`, `BROWSER-MEASURED`)

1. **27 Works External Project Demos:** 26 hosted on `https://<slug>.framer.website/` and 1 (`Thinkbot`) on `https://thinkbot.framer.ai/` (complete table in `docs/research/project-inventory.md`).
2. **Social & Creator Links:** `https://x.com/Dmytri_Design`, `https://www.linkedin.com/in/dmytri-design/`, `https://www.framer.com`, `https://stylokit.com/`.
3. **Contact Location Link:** `https://www.google.com/maps` (`BERLIN, GERMANY`).
4. **About System Stack Tool Links (16 tools across 4 tabs):** `figma.com`, `adobe.com/products/photoshop.html`, `adobe.com/products/illustrator.html`, `designsystemsrepo.com`, `framer.com/?via=dmytri_design`, `react.dev`, `typescriptlang.org`, `storybook.js.org`, `gsap.com`, `motion.dev`, `adobe.com/products/aftereffects.html`, `lottiefiles.com`, `spline.design`, `blender.org`, `threejs.org`, `rive.app`.

## 5. SEO & Metadata Snapshot (`VERIFIED`, `BROWSER-MEASURED`)

- **Title (all 5 pages):** `Omnira`
- **Meta Description:** `Omnira is a dark futuristic portfolio with cinematic visuals, sharp typography, and high-tech interface details.`
- **Robots Meta:** `max-image-preview:large`
- **Open Graph / Twitter Card:** `og:type="website"`, `summary_large_image`, `og:image="https://framerusercontent.com/images/DKiwUEdtILCqS2R0ETztXd7tHY.jpg"`, `og:url` set per route.
- **Canonical Note:** Initial raw SSR HTML (`research/reference/html/*.html`) omits `<link rel="canonical">`; `og:url` carries the canonical URL (`https://omnira.framer.website/`, `/about`, `/works`, `/contact`, `/404`).
