# Discrepancy Ledger

- **Verification Run**: `task-533`
- **Machine-Readable Ledger**: `research/manifests/discrepancies.json`

## Summary

- **Total Logged Items**: `14`
- **Resolved During Reconstruction**: `8`
- **Intentional / Upstream Architectural Choices**: `6`
- **Open Blocking Defects**: `0`

## Complete Ledger

| ID | Category | Status | Reference Observation | Reconstruction Resolution & Verification |
| --- | --- | --- | --- | --- |
| `DISC-001` | Content Inventory | Resolved | `/works` SSR loads `12` projects while live CMS `mD0yv0kks` + screenshot hold `27` projects. | All `27` projects rendered with verified counts (`ALL PROJECTS: 27`, `AI: 3`, `BUSINESS: 12`, `ONE PAGE: 5`, `PORTFOLIO: 7`); verified in `check-interactions.ts`. |
| `DISC-002` | Asset | Resolved | Upstream contact spinner mask SVG returned HTTP `404`. | Replaced with inline accessible SVG spinner inside `ContactForm`. |
| `DISC-003` | Typography | Resolved | Hero `Orbitron` weight `600` missing locally; `fonts.css` had stray ` };` tokens. | Added `orbitron-600-normal-latin.woff2` and cleaned `fonts.css`; `geometry-comparison.json` confirms `Orbitron` `600` custom font active. |
| `DISC-004` | Hydration | Resolved | React `#418` mismatch on `/works/brandora` 404 active nav check. | Exact `currentPath === href` check in Desktop/Mobile nav; `check-routes.ts` shows `0` hydration errors on 404. |
| `DISC-005` | Performance | Resolved | Initial `/works` `CLS` caused by `<Suspense fallback={null}>`. | Removed `Suspense` null fallback and preloaded WOFF2 fonts; `CLS = 0` on all 5 routes. |
| `DISC-006` | Accessibility | Resolved | Initial axe-core contrast and ARIA findings (`ClientRating`, `ServiceSelector`, muted text, button labels). | Added `role="img"`, accordion buttons, `--color-text-muted: rgba(255,255,255,0.58)`; `0` axe-core violations on all 5 routes. |
| `DISC-007` | Asset | Resolved | `/404` encrypted vortex portal art. | Captured clean `676x556` visual and generated `not-found-portal.{avif,webp,jpg}`; verified `broken=0`. |
| `DISC-008` | Asset | Resolved | About System Stack requires `16` standalone tool SVG icons. | Extracted `16/16` SVGs to `public/assets/icons/tools/`; verified `imgs=40, broken=0`. |
| `DISC-009` | Geometry / Scroll | Intentional | Live `/` uses `370vh-470vh` sticky spacer tracks (`15683px` height). | Implemented interactive state controls without multi-thousand-pixel black gaps (`7394px` height). |
| `DISC-010` | Platform Chrome | Intentional | Live site displays floating `Made in Framer` / `REMIX TEMPLATE` badges. | Omitted Framer platform marketing badges from clean Next.js build. |
| `DISC-011` | Visual Diff | Documented | `/works` visual diff `27.409%` (`1440x900`) from immediate 27-card grid vs initial 12-card spacing and wrapping. | Verified zero overflow across `320px-1440px` and exact grid layout. |
| `DISC-012` | Dynamic Frame | Documented | Home Canvas 2D halftone, 3s rotating headline word, and 1Hz Berlin clock shift pixel-by-pixel between captures. | Accounts for `9.365%` Home viewport pixel diff while geometry and typography match 1:1. |
| `DISC-013` | Upstream Typos | Documented | Reference contains `bradora.studio`, `girdo.studio`, `hello@omniro.studio` text on `mailto:hello@omnira.studio`, `Not suire yet`, `Landing poge`, `STAUS:` / `purpuse`. | Preserved project display captions (`bradora.studio`, `girdo.studio`) and normalized user-facing email/select labels (`hello@omnira.studio`, `Not sure yet`, `Landing page`). |
| `DISC-014` | Routing | Verified 1:1 | Live sitemap has only `/`, `/about`, `/works`, `/contact`, `/404`; cards link externally. | Matched 1:1; nonexistent paths return HTTP `404`. |
