# Performance Report

- **Verification Run**: `task-533` (`scripts/testing/check-a11y-perf.ts` on `http://localhost:3050`, viewport `1440x900`)
- **Timestamp**: `2026-11-26T21:53:16.903Z`
- **Source Report**: `research/reports/perf-report.json`

## Core Web Vitals & Load Timings (Local Production Build `next start`)

| Route | LCP (ms) | CLS | CLS Sources | TTFB (ms) | DOM Interactive (ms) | Load Event (ms) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `636ms` | `0` | `[]` | `4ms` | `54ms` | `117ms` |
| `/about` | `152ms` | `0` | `[]` | `5ms` | `33ms` | `76ms` |
| `/works` | `124ms` | `0` | `[]` | `2ms` | `31ms` | `72ms` |
| `/contact` | `312ms` | `0` | `[]` | `2ms` | `24ms` | `65ms` |
| `/nonexistent-check-404` | `128ms` | `0` | `[]` | `3ms` | `35ms` | `90ms` |

## Optimization Measures Implemented

1. **Zero Layout Shift (`CLS = 0` on all 5 routes)**: Removed `<Suspense fallback={null}>` around `WorksContent`, enforced explicit image container aspect ratios (`16/10` project covers), and preloaded primary WOFF2 font faces in `src/app/layout.tsx`.
2. **Image Pipeline**: Converted 74 source raster/SVG assets into `190` optimized AVIF/WebP/fallback derivatives with eager loading restricted to hero/above-the-fold assets and lazy loading below the fold.
3. **Self-Hosted Font Delivery**: Served 62 latin/latin-ext WOFF2 files locally with `font-display: swap`, eliminating third-party DNS/TLS font waterfalls.
4. **Canvas 2D Halftone Guardrails**: `HeroPortrait` caps `devicePixelRatio` at `2`, disables on mobile `<= 809px`, and pauses `requestAnimationFrame` via `IntersectionObserver` when scrolled offscreen.
