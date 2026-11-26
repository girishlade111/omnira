# Omnira Licensing & Attribution Research

> **Purpose:** Document all public licensing terms, marketplace metadata, and redistribution/reuse boundaries observed on Framer Marketplace, Stylokit, and Framplates for the **Omnira** template (`https://omnira.framer.website/`).

## 1. Template Overview & Authorship
- **Template Name:** Omnira (`Futuristic portfolio template` / `Bold portfolio for digital makers`)
- **Creator:** Dmytri Ivanov (`@dmytri` / `@dmytri-ivanov` / `https://x.com/Dmytri_Design` / `https://www.linkedin.com/in/dmytri-design/`)
- **Published / Updated (Framer Marketplace):** Published Jul 5, 2026 · Updated Oct 21, 2026
- **Price:** $99 USD (both Framer Marketplace & Stylokit)
- **Live Demo:** `https://omnira.framer.website/`
- **Marketplace Listings Checked:**
  1. **Framer Marketplace:** `https://www.framer.com/marketplace/templates/omnira/` (HTTP 200)
  2. **Stylokit:** `https://stylokit.com/templates/omnira` (HTTP 200) + `https://stylokit.com/license` (HTTP 200)
  3. **Framplates:** `https://framplates.com/omnira` (HTTP 200; aggregator listing referencing Framer Marketplace / Lemon Squeezy purchase)

---

## 2. Framer Marketplace License (`Single-Use`)
- **Listing Label:** `License: Single-Use` linking to `https://www.framer.com/legal/community-terms`
- **Governing Clause:** Section **7.3.2 Single-Use Commercial License (Paid Content)** of the Framer Community Terms.
- **Permitted Use:**
  - Grants the purchaser ("End User") a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to use the paid template solely for **one (1) end product or project** ("Permitted Project").
  - End User may modify the Licensed Content as reasonably necessary for the Permitted Project, and use it for commercial or internal business purposes solely within that Permitted Project.
- **Key Restrictions:**
  - Cannot resell, redistribute, sublicense, share, publish, or make the Licensed Content available to any third party.
  - Cannot use the Licensed Content to create or offer competing templates, themes, components, design systems, or marketplace assets.
  - Cannot use the Licensed Content in more than one project, website, product, or client engagement.
  - Cannot include the Licensed Content in any product or service intended for resale, licensing, or distribution to third parties.
  - Cannot remove, obscure, or alter proprietary notices included with the Licensed Content.
- **Ownership & Support:**
  - Licensed, not sold. Creator (Dmytri Ivanov) retains ownership and intellectual property rights; Framer is not a party to End User disputes or payments (`Section 4.3`, `Section 6.3`).

---

## 3. Stylokit License (`https://stylokit.com/templates/omnira` & `https://stylokit.com/license`)
- **Checkout Link:** `https://stylokit.lemonsqueezy.com/checkout/buy/2f9c0adb-b559-41e0-98d8-e7d3f1ed923a`
- **Product Benefits Listed on `/templates/omnira`:**
  - Instant access
  - Lifetime updates
  - Commercial license
  - Support included
- **Template Specs Listed on `/templates/omnira`:**
  - Platform: Framer
  - Category: Portfolio
  - Page number: `5`
  - CMS: `2` (corresponds to `Works` and `Categories` CMS collections)
- **Stylokit General License Page (`/license`, dated April 12, 2024):**
  - Grants a non-exclusive, non-transferable license for internal business purposes on a single device, and explicitly restricts modification, reverse engineering, or redistribution/sublicensing (generic software EULA wording on `/license`, whereas the `/templates/omnira` product card highlights a "Commercial license" and "Remix Template" workflow inside Framer).
  - Governing law: Canada. Support contact: `info@stylokit.com`.

---

## 4. Engineering & Asset Hygiene Implications for This Rebuild
1. **No Redistribution as a Template:** Our Next.js rebuild is a **single-project application** in this workspace (`omnira`), not a redistributed/resold template or competing UI kit.
2. **Original / Re-authored Content & Local Assets:**
   - All reference HTML, CMS data, and asset URLs captured in `research/reference/` are **for design-system & behavioral analysis only**.
   - Avoid hotlinking `framerusercontent.com` in production `src/` or redistributing third-party copyrighted stock photography/3D renders verbatim if publishing publicly; download/inspect for reference in `assets-source/` and replace or self-host approved/custom/open-licensed assets under `public/assets/`.
3. **Font Licensing:**
   - **Orbitron** (Google Fonts — SIL Open Font License 1.1)
   - **Chakra Petch** (Google Fonts — SIL Open Font License 1.1)
   - **Inter** (Rasmus Andersson / Google Fonts / Framer CDN — SIL Open Font License 1.1)
   - All three typeface families are **SIL OFL 1.1**, allowing free commercial and self-hosted (`next/font/google` or local `.woff2`) use.
4. **Framer Attribution / Boilerplate:**
   - The demo site displays `© MADE IN STYLOKIT` and a Framer badge (`Create a free website with Framer...`) plus `Remix Template` CTA linking to `https://stylokit.lemonsqueezy.com/checkout/buy/2f9c0adb-b559-41e0-98d8-e7d3f1ed923a` and `https://framer.link/bFVcS5o`.
   - For the faithful reference clone vs. customized production brand, confirm whether the `Remix Template` / `© MADE IN STYLOKIT` template footer items are preserved for visual parity or adapted to the user's brand.
