# Asset Rights, Licensing, and Provenance Audit

> **Evidence Classification Key:** `VERIFIED` (fetched directly from Framer Marketplace, Framer Legal Community Terms, Stylokit, and Framplates in `research/reference/html/`, plus SHA-256 checksums in `research/manifests/assets.json` and `research/reference/assets/deduplication-report.json`), `DOCUMENTATION-DERIVED` (marketplace copy).

## 1. Template & Marketplace Licensing (`VERIFIED`)

| Source | Price | License Label | Governing Terms | Saved Evidence |
|---|---:|---|---|---|
| Framer Marketplace (`https://www.framer.com/marketplace/templates/omnira/`) | `$99` | `Single-Use` | Framer Community Terms Section `7.3.2` (`https://www.framer.com/legal/community-terms`) | `research/reference/html/framer-marketplace-omnira.html`, `framer-community-terms.html` |
| Stylokit (`https://stylokit.com/templates/omnira`) | `$99` | `Commercial license` | `https://stylokit.com/license` (dated April 12, 2024; governing law: Canada) | `research/reference/html/stylokit-omnira.html`, `stylokit-license.html` |
| Framplates (`https://framplates.com/omnira`) | `$99` | Aggregator listing | Links to Framer Marketplace / Lemon Squeezy checkout | `research/reference/html/framplates-omnira.html` |

### Key Obligations Under Framer Community Terms Section 7.3.2 (`VERIFIED`)
- **Permitted Use:** Limited, non-exclusive, non-transferable, non-sublicensable, revocable license to use and modify the template solely for **one (1) end product or project** ("Permitted Project").
- **Restrictions:** Cannot resell, redistribute, sublicense, share, or publish the template or its assets as a standalone template, theme, component kit, design system, or marketplace asset; cannot reuse in more than one project or client engagement; cannot remove proprietary notices.
- **Ownership:** Licensed, not sold. Creator Dmytri Ivanov (`@dmytri-ivanov`) retains intellectual property ownership.

## 2. Font Licensing (`VERIFIED`)

| Font Family | Source | Files Prepared | Total Bytes | License |
|---|---|---:|---:|---|
| `Orbitron` (400, 500, 600, 700) | `fonts.gstatic.com` | 16 WOFF2 | Included in `618,228` | **SIL Open Font License 1.1** (`OFL-1.1`) |
| `Chakra Petch` (400, 500, 600, 700, normal/italic) | `fonts.gstatic.com` | 32 WOFF2 | Included in `618,228` | **SIL Open Font License 1.1** (`OFL-1.1`) |
| `Inter` (400, 700, normal/italic) | `framerusercontent.com/assets/` | 14 WOFF2 | Included in `618,228` | **SIL Open Font License 1.1** (`OFL-1.1`) |

All 62 WOFF2 files are self-hosted in `public/assets/fonts/` with generated CSS in `public/assets/fonts/fonts.css` (`research/reference/assets/fonts-prepared.json`). SIL OFL 1.1 permits commercial use, bundling, and self-hosting without royalty.

## 3. Visual Asset Acquisition, Validation, and Deduplication (`VERIFIED`)

From `research/manifests/assets.json` and `research/reference/assets/deduplication-report.json`:
- **Tracked Assets:** `138` total (`76` unique raster/SVG base URLs + `62` WOFF2 font files).
- **Downloaded & Validated:** `137 / 138` passed magic-byte, Sharp decode/dimensions/alpha, SVG validity, and font checks.
- **Missing Upstream Asset (`1`):** `icons-spinner-mask` (`https://framerusercontent.com/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg`) returned **HTTP 404** upstream. Replaced in Next.js with an inline accessible SVG spinner inside `ContactForm`.
- **SHA-256 Deduplication:** `136` unique SHA-256 hashes across `137` downloaded files. Duplicate pair:
  - Canonical: `brand-omnira-favicon` (`assets-source/original/brand/omnira-favicon.svg`, SHA-256 `f29bd624819c7e05133d05c616d2f97cb62b44a025487fbb39203639503e9a80`)
  - Duplicate: `brand-cdn-assets-omnira-favicon` (`https://framerusercontent.com/assets/tHX9pPhKmTRRwWGxPYLzOtXho.svg`, `duplicateOf: "brand-omnira-favicon"`)
- **Optimization:** `74` canonical raster/SVG assets generated `190` files in `public/assets/` (`9,748,969` bytes -> `4,335,845` bytes, `55.5%` reduction).
- **Inline SVGs:** `730` unique inline SVGs discovered; `441` procedural Framer chamfer/border SVGs excluded; `289` icon/brand SVGs extracted to `assets-source/original/icons/inline/`.

## 4. Production Asset Provenance Policy (`DOCUMENTATION-DERIVED`)

- All reference HTML, `.mjs` chunks, and `.framercms` binaries live strictly inside `research/` and `assets-source/`, both excluded from the Next.js production bundle (`tsconfig.json`, `next.config.ts` `outputFileTracingExcludes`).
- Production `src/` references only local self-hosted files under `public/assets/` (`research/manifests/component-assets.json`), eliminating runtime dependency on `framerusercontent.com`.
- If the site is later published under a distinct commercial brand, template demo portraits, partner logos, and third-party showcase thumbnails should be replaced with original project imagery unless covered by a valid single-use Omnira template license.
