# Omnira Portfolio Reconstruction

Independent Next.js App Router + TypeScript reconstruction of the [Omnira](https://omnira.framer.website/) portfolio website, built from controlled browser forensics, decoded CMS schemas, verified typography (`Orbitron`, `Chakra Petch`, `Inter`), local optimized assets, and automated visual/geometry/accessibility verification.

## Routes

- `/` : Homepage (Loading dissolve, asymmetric Hero with Canvas 2D dot-matrix halftone portrait and 3D `rotateX` barrel headline, 6 featured projects, 4-phase Process section, About preview, click-only Services selector with 4-layer isometric stack, 6-slide Testimonials carousel + 8 partner logos, 3 Pricing tiers, 8-item FAQ, and technical Footer).
- `/works` : Complete 27-project portfolio catalog reconciled across SSR (`12`) and client-side CMS (`27`) with URL-synced category filters (`ALL PROJECTS`, `AI`, `BUSINESS`, `ONE PAGE`, `PORTFOLIO`).
- `/about` : Profile System hero with monochrome portrait frame, biography + signature + `ProfileDetails`, 5-step interactive `TerminalPanel` with 5-layer isometric stack and safe demonstration runner, 4-column `ServicesGrid`, 7-year `CareerTimeline` (`2020`-`2026`), 4-category `ToolsSelector` (`16` tools), and Testimonials.
- `/contact` : Contact channel status, Email and Location cards, `ProjectInquiryForm` with custom ARIA `TechnicalSelect` dropdowns (zero native `<select>`), and 8-item FAQ.
- `/_not-found` : Custom 404 page returning HTTP 404 for unknown routes.
- `/api/contact` : Zod-validated `POST` endpoint with honeypot filtering, sliding-window rate limiting, and explicit `demo` vs `webhook` delivery modes.
- `/sitemap.xml` and `/robots.txt` : Dynamic Next.js metadata routes.

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Production build (Next.js App Router)
npm run start       # Start production preview server
npm run typecheck   # TypeScript type checking (tsc --noEmit)
npm run lint        # ESLint across repository
npx vitest run      # Unit and API route integration tests
```

## Verification Suite (`scripts/testing/`)

- `scripts/testing/run-all.ts` : Boots a production preview server and runs:
  - `check-routes.ts` : HTTP statuses (200/404), console/page errors.
  - `check-assets.ts` : Image decoding, WOFF2 font loading (`Orbitron`, `Chakra Petch`), zero-size SVG checks.
  - `check-overflow.ts` : Horizontal overflow audit at `1440`, `1024`, `768`, `390`, `320px`.
  - `check-interactions.ts` : Works filters, Services tabs, Testimonials carousel, FAQ accordions, Terminal steps, System Stack tabs, Contact validation + custom dropdowns + demo submit, Mobile drawer.
  - `compare-geometry.ts` : Computed typography, rail widths, and frame geometry vs live reference measurements.
  - `compare-screenshots.ts` : Pixelmatch and SSIM visual regression (`research/comparisons/`).
  - `check-a11y-perf.ts` : `@axe-core/playwright` WCAG 2.1 AA audit and LCP/CLS measurement.

## Environment Setup

Copy `.env.example` to `.env.local` and configure as needed. By default, `CONTACT_FORM_MODE=demo` validates and simulates form submissions locally without transmitting external emails.

## Documentation

- Research findings: `docs/research/`
- Implementation guides: `docs/implementation/`
- Verification reports: `docs/testing/`
