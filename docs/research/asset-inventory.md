# Asset Inventory, Acquisition, Validation, and Optimization Report

> **Evidence Classification Key:** `VERIFIED` (scripted download, magic-byte/Sharp/font validation, SHA-256 hashing, and optimization reports in `research/manifests/assets.json`, `research/manifests/component-assets.json`, and `research/reference/assets/*.json`).

## 1. Pipeline Totals (`VERIFIED`)

| Metric | Count / Value | Source Artifact |
|---|---:|---|
| Unique image/SVG base URLs discovered | 76 | `research/manifests/assets.json` |
| Unique inline SVGs discovered in live DOM | 730 | `research/manifests/assets.json` |
| Procedural Framer border/chamfer SVGs excluded | 441 | `research/manifests/assets.json` |
| Non-border inline SVGs extracted (`assets-source/original/icons/inline/`) | 289 | `assets-source/original/icons/inline/` |
| Font-face WOFF2 URLs discovered & prepared | 62 (618,228 bytes) | `research/reference/assets/fonts-prepared.json` |
| Total tracked assets in download manifest | 138 | `research/manifests/assets.json` |
| Successfully downloaded & validated (`valid: true`) | 137 | `research/reference/assets/validation-report.json` |
| Upstream missing / HTTP 404 assets | 1 (`icons-spinner-mask`) | `research/manifests/assets.json` |
| Unique SHA-256 digests across 137 files | 136 | `research/reference/assets/deduplication-report.json` |
| Deduplicated exact binary duplicates | 1 (`brand-cdn-assets-omnira-favicon`) | `research/reference/assets/deduplication-report.json` |
| Canonical raster/SVG assets optimized | 74 | `research/reference/assets/optimization-report.json` |
| Total public optimized files in `public/assets/` | 190 (+ 62 fonts + `fonts.css`) | `research/reference/assets/optimization-report.json` |
| Raster optimization size reduction | 9,748,969 B -> 4,335,845 B (55.5% saved) | `research/reference/assets/optimization-report.json` |

## 2. Per-Category Asset Breakdown (`VERIFIED`)

Exact counts derived directly from `research/manifests/assets.json` (`138` tracked entries across `11` manifest categories) plus extracted inline SVGs (`inline-svg`):

| Category | Tracked | Valid | Missing (404) | Canonical | Duplicate | Derivatives in `public/assets/` | Source Bytes | Best/Target Bytes | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `brand` | 9 | 9 | 0 | 8 | 1 | 15 | 596,363 | 140,163 | Nav/footer logo SVGs, favicon (`duplicateOf` resolved), apple-touch-icon, OG cards, profile signature |
| `hero` | 1 | 1 | 0 | 1 | 0 | 3 | 224,625 | 133,816 | `hero-portrait-dotmatrix` (`1254x1254`) for Canvas 2D halftone portrait |
| `about` / `portraits` | 1 | 1 | 0 | 1 | 0 | 3 | 215,483 | 109,856 | About profile portrait (`portraits` category in `assets.json`; signature tracked in `brand`) |
| `projects` | 28 | 28 | 0 | 28 | 0 | 84 | 4,621,746 | 1,983,993 | All `27` CMS project covers (`1600x1200`) + `projects-project-card-default-fallback` |
| `services` | 10 | 10 | 0 | 10 | 0 | 30 | 606,447 | 497,678 | `5` Home Services isometric stack layers + `5` About Terminal isometric stack layers (`1254x1254`) |
| `timeline` | 7 | 7 | 0 | 7 | 0 | 21 | 926,823 | 607,435 | `7` Timeline milestone artworks (`2020`-`2026`, `1254x1254`) |
| `testimonials` | 6 | 6 | 0 | 6 | 0 | 18 | 555,487 | 248,493 | `6` testimonial avatar/portrait assets |
| `logos` | 8 | 8 | 0 | 8 | 0 | 8 | 19,150 | 19,150 | `8` partner/client SVG marks |
| `icons` | 4 | 3 | 1 | 4 | 0 | 3 | 1,274 | 1,274 | `icons-arrow-left`, `icons-arrow-right`, `icons-rating-star`; `icons-spinner-mask` returned HTTP `404` |
| `textures` | 2 | 2 | 0 | 2 | 0 | 6 | 1,981,833 | 594,249 | `omnira-dark-grain` (`4736x3136`) and `omnira-panel-grain` (`1448x1086`) |
| `fonts` | 62 | 62 | 0 | 62 | 0 | 62 (+`fonts.css`) | 618,228 | 618,228 | `Orbitron` (16), `Chakra Petch` (32), `Inter` (14) WOFF2 files |
| `inline-svg` / `tools` | 289 | 289 | 0 | 289 | 0 | Inline React / SVG | - | - | `289` extracted SVGs in `assets-source/original/icons/inline/` covering UI, tool stack (`tools`), process, pricing, and social icons |

## 3. SHA-256 Deduplication & Missing Asset Resolution (`VERIFIED`)

### 3.1 Exact Binary Duplicate Detected
- **SHA-256 Digest:** `f29bd624819c7e05133d05c616d2f97cb62b44a025487fbb39203639503e9a80`
- **Canonical Asset:** `brand-omnira-favicon` (`https://framerusercontent.com/images/tHX9pPhKmTRRwWGxPYLzOtXho.svg` -> `assets-source/original/brand/omnira-favicon.svg` -> `/assets/brand/omnira-favicon.svg`)
- **Duplicate Asset:** `brand-cdn-assets-omnira-favicon` (`https://framerusercontent.com/assets/tHX9pPhKmTRRwWGxPYLzOtXho.svg`, `duplicateOf: "brand-omnira-favicon"`)
- **Resolution:** Only the canonical asset is emitted into `public/assets/brand/omnira-favicon.svg`.

### 3.2 Missing Upstream Asset (`HTTP 404`)
- **Asset ID:** `icons-spinner-mask`
- **Upstream URL:** `https://framerusercontent.com/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg`
- **Observed Status:** `HTTP 404` during `download-assets.ts` (`research/manifests/assets.json` `missingAssets[0]`).
- **Context:** Referenced inside Framer's Contact form submit button and Works loading spinner CSS (`mask: url(...)`).
- **Resolution:** Replaced with an inline accessible SVG spinner component in Next.js so zero runtime requests fail or hit external CDNs.

## 4. Component-to-Local-Asset Binding (`VERIFIED`)

All runtime UI components bind exclusively to `/assets/...` paths documented in `research/manifests/component-assets.json` and typed in `src/lib/assets.ts`:
- **Fonts:** `/assets/fonts/fonts.css` (`62` local `.woff2` files).
- **Textures:** `/assets/textures/omnira-dark-grain.{webp,avif,jpg}` and `/assets/textures/omnira-panel-grain.{webp,avif,png}`.
- **Hero Halftone Source:** `/assets/images/hero/hero-portrait-dotmatrix.{webp,avif,png}`.
- **Works (`27/27` covers):** `/assets/images/projects/<slug>-cover.{webp,avif,jpg|png}` (`100%` of the 27 CMS items acquired and verified).
- **Services & Terminal Isometric Layers:** `/assets/images/services/service-stack-home-layer-{1..5}.{webp,avif,png}` and `/assets/images/services/service-stack-about-layer-{1..5}.{webp,avif,png}`.
- **Timeline (`2020`-`2026`):** `/assets/images/timeline/timeline-202{0..6}.{webp,avif,png}`.
- **Testimonials & Logos:** `/assets/images/testimonials/*.{webp,avif,png|jpg}` and `/assets/images/logos/partner-logo-{1..8}.svg`.
