# Architecture

## Stack Summary

- Framework: Next.js 16.4.6 App Router (`src/app/`) with React 19 and TypeScript (`strict`).
- Styling: CSS custom properties in `src/styles/tokens.css` and `src/styles/globals.css`, paired with component-scoped CSS Modules.
- Font Delivery: Local SIL OFL 1.1 WOFF2 files loaded via `/assets/fonts/fonts.css` (`Orbitron`, `Chakra Petch`, `Inter`).
- Validation: Zod schemas in `src/lib/contact-validation.ts` for `/api/contact`.
- Testing: Vitest for unit/API tests (`tests/unit/`), Playwright + Sharp + Pixelmatch + `@axe-core/playwright` for browser verification (`scripts/testing/`).

## Route Structure

- `/` (`src/app/page.tsx`): Homepage (Hero, SelectedWork, ProcessSection, AboutPreview, ServiceSelector, TestimonialsSection, PricingSection, FAQSection).
- `/about` (`src/app/about/page.tsx`): ProfileHero, BiographySection + ProfileDetails, TerminalPanel, ServicesGrid, CareerTimeline, ToolsSelector, TestimonialsSection.
- `/works` (`src/app/works/page.tsx`): Complete 27-project catalog (`WorksCatalog` + `WorksFilterBar`) with URL query sync (`?category=...`).
- `/contact` (`src/app/contact/page.tsx`): ContactHero, ContactStatus, ContactInfoCard, ProjectInquiryForm (`TechnicalSelect`), FAQSection.
- `/_not-found` (`src/app/not-found.tsx`): Custom 404 page returning HTTP 404 for unknown routes (including `/404` and `/works/:slug`).
- `/api/contact` (`src/app/api/contact/route.ts`): Server-side contact inquiry handler with Zod validation, honeypot filtering, sliding-window rate limiting, and local demo/webhook modes.
- `/sitemap.xml` (`src/app/sitemap.ts`) and `/robots.txt` (`src/app/robots.ts`): Generated metadata endpoints.

## Directory Boundaries

- `src/`: Production Next.js application source code.
- `public/assets/`: Optimized delivery media (AVIF, WebP, JPG/PNG fallbacks, SVGs, WOFF2 fonts).
- `assets-source/`: Preserved original downloaded reference masters (excluded from production build).
- `research/`: Forensic captures, DOM/style dumps, manifests, and visual comparison outputs (excluded from Next.js tracing via `next.config.ts`).
- `scripts/`: Standalone research, asset pipeline, and browser verification scripts.
