# Framer Runtime, Bundling, CMS & Font Recon Summary

## 1. Public Routes & HTTP Behavior
| URL | HTTP Status | Bytes | Notes |
|---|---:|---:|---|
| `https://omnira.framer.website/` | 200 | 872,425 | Home page (`selected work` limit 6, `about bento` limit 4, KPI counters) |
| `https://omnira.framer.website/about` | 200 | 725,753 | Profile, KPI counters, Process + Terminal, Services, Timeline (2020–2026), Tools Stack, Testimonials |
| `https://omnira.framer.website/works` | 200 | 301,037 | Works grid (`pageSize: 12` initial SSR + LoadMore pagination to 27 total CMS items) + category filter tabs |
| `https://omnira.framer.website/contact` | 200 | 368,904 | Contact form (`Name`, `Email`, `Project Type`, `Budget Range`, `Timeline`, `Project Details`) + 8 FAQs |
| `https://omnira.framer.website/404` | 404 | 245,983 | Custom 404 page (`ERROR / 404 / PAGE NOT FOUND`) |
| `https://omnira.framer.website/nonexistent-check-404` | 404 | 245,983 | Serves identical custom 404 HTML with HTTP 404 status |
| `https://omnira.framer.website/sitemap.xml` | 200 | 394 | Lists `/`, `/about`, `/works`, `/contact`, `/404` |
| `https://omnira.framer.website/robots.txt` | 200 | 74 | `User-agent: *`, `Allow: /`, `Sitemap: https://omnira.framer.website/sitemap.xml` |

> **Important Route Finding:** Despite marketplace copy mentioning "project detail pages", `script_main.DZZ9_rVU.mjs` only registers 5 routes: `/`, `/about`, `/works`, `/contact`, `/404`. All 27 project cards link externally to live Framer demo sites (`https://*.framer.website/` or `https://thinkbot.framer.ai/`).

## 2. Fonts & `@font-face`
- **Families:** `Orbitron` (display/headings, weights 400, 500, 600, 700), `Chakra Petch` (mono/HUD labels/buttons, weights 400, 500, 600, 700 + italic), `Inter` (body copy, weights 400, 500, 600, 700 + italic).
- **Sources:**
  - `Orbitron` & `Chakra Petch`: `https://fonts.gstatic.com/s/{orbitron,chakrapetch}/...woff2`
  - `Inter`: `https://framerusercontent.com/assets/*.woff2` (subset by unicode-range)
- **CSS:** All `@font-face` rules and `--token-*` CSS custom properties are inlined in `<style data-framer-css-ssr-minified>` inside each HTML document (no external `.css` `<link>` stylesheets).

## 3. Framer CMS & the 12 vs 27 Projects Discrepancy
- **Works CMS Collection (`6861c96a-f5b2-49ab-998d-2cc51e06ffc1` / `mD0yv0kks`):**
  - Binary data URL: `https://framerusercontent.com/cms/E5MpW6XGJgWAeC6WiNzn/CeOq2vr0Um0pdWUMSbnI/mD0yv0kks-chunk-default-0.framercms`
  - **Total items in CMS:** **27** (`Brandora` through `Platify`).
  - **Why `/works` SSR HTML only shows 12:** `ewDeb3VVFPkyC2MkYdlp-r5GKdMQXdGeE2p0U7UbEFk.CLjMfjOn.mjs` passes `pageSize: 12` to Framer's paginated CMS query (`Ot({pageSize:12, query:Q(S)})`), rendering 12 items server-side and loading items 13–27 client-side via LoadMore / category filtering.
  - **Home limits:** `Selected Work` uses `limit: 6`; `About` preview uses `limit: 4`.
  - **KPI Counters:** Both Home and About render `YEARS: 6+`, `PROJECTS: 40+` (`v3f1I_oEQ: 40`), `CLIENTS: 10K+`, while Testimonials reads `FROM 24 CLIENT PROJECTS` (`4.8`).
- **Categories CMS Collection (`a_FhlAd4Y`):**
  - Binary data URL: `https://framerusercontent.com/cms/FoBUndsbdoyNu2iiD1rU/vE20txgCpo9QxaXpgl1e/a_FhlAd4Y-chunk-default-0.framercms`
  - **Categories (4 + All):** `ALL PROJECTS` (27), `AI` (`ai`, 3), `BUSINESS` (`business`, 12), `ONE PAGE` (`one-page`, 5), `PORTFOLIO` (`portfolio`, 7).

## 4. Key Bundled Artifacts & Chunks
- **Search Index JSON:** `searchIndex-Ax3rzBlz0ClU.json` / `searchIndex-OqOLDYeczOHR.json`
- **Main Router:** `script_main.DZZ9_rVU.mjs`
- **Home Page:** `EobXXbbWfB7esIu9E9mR-oWYOkWOMjNJMoyb6HWc2Rw.B7tFxpIP.mjs`
- **About Page:** `1jPVe6ELA2ogP4sSWf7-XeWzR8AJzutT3-_cFNcY6sI.D66oSexm.mjs`
- **Works Page:** `ewDeb3VVFPkyC2MkYdlp-r5GKdMQXdGeE2p0U7UbEFk.CLjMfjOn.mjs`
- **Contact Page:** `yeL9HJlHZi_e4MBgkkEyHKbZLEnWYdp04ShqMZ7eGVM.BLKL2gor.mjs`
- **404 Page:** `n29-rOn25nOKCkoLA_5gf9uFwUAaxDh80UPT5cpmyJU.B-aOHWd4.mjs`
- **FAQ Accordion Component:** `aspL4zAAs.4wUx_Cd_.mjs`
- **Header / Footer / Counters / Testimonials:** `AaRtvYy_c.Br4Q4bg5.mjs`
- **Works CMS & Project Card:** `mD0yv0kks.BkFopPY8.mjs`
- **Categories CMS:** `a_FhlAd4Y.D-UWAPuV.mjs`
- **HUD / Chamfer / Pixel / Effects Shared Lib:** `shared-lib.DwAK3G21.mjs`
