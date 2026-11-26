# Typography Regression Report

- **Verification Run**: `task-533` (`scripts/testing/check-assets.ts` + `scripts/testing/compare-geometry.ts`)
- **Timestamp**: `2026-11-26T21:52:19.340Z`
- **Sources**: `research/reports/geometry-comparison.json`, `public/assets/fonts/fonts.css`

## Font Loading Verification

- **Self-hosted Font Inventory**: 62 WOFF2 files in `public/assets/fonts/`, served via `public/assets/fonts/fonts.css` (SIL OFL 1.1: `Orbitron`, `Chakra Petch`, `Inter`).
- **Remediation Completed**: Added missing `orbitron-600-normal-latin.woff2` and removed stray ` };` tokens in `public/assets/fonts/fonts.css` prior to `task-533`.
- **Loaded Families (`document.fonts`)**: `Chakra Petch,Orbitron` confirmed loaded on `/`, `/about`, `/works`, `/contact`, and `/nonexistent-check-404`.
- **`implCustomFontsOk`**: `true`.

## Computed Typography Comparison (Home `1440x900`)

| Element Role | Reference Computed | Implementation Measured (`geometry-comparison.json`) | Platform Custom Font Used |
| --- | --- | --- | --- |
| Hero `h1` (`geom-t-6`) | `Orbitron`, `64px`, `lineHeight: 64px`, `weight: 600` (`Orbitron-SemiBold`) | `Orbitron, sans-serif`, `64px`, `lineHeight: 64px`, `weight: 600` | `Orbitron` (`isCustomFont: true`) |
| Hero Subcopy (`geom-t-7`) | `Chakra Petch`, `14px`, `lineHeight: 22px`, `weight: 400` | `"Chakra Petch", sans-serif`, `14px`, `lineHeight: 22px`, `weight: 400`, `rgba(255,255,255,0.58)` | `Chakra Petch` (`isCustomFont: true`) |
| Section Heading `h2` (`geom-t-8`, `geom-t-22`, `geom-t-32`) | `Orbitron`, `36px`, `lineHeight: 44px`, `weight: 500` | `Orbitron, sans-serif`, `36px`, `lineHeight: 44px`, `weight: 500`, `rgb(255,255,255)` | `Orbitron` (`isCustomFont: true`) |
| Section Lead `p` (`geom-t-9`, `geom-t-23`, `geom-t-33`) | `Chakra Petch`, `16px`, `lineHeight: 24px`, `weight: 400` | `"Chakra Petch", sans-serif`, `16px`, `lineHeight: 24px`, `weight: 400`, `rgba(255,255,255,0.72)` | `Chakra Petch` (`isCustomFont: true`) |
| Project Card Title `h3` (`geom-t-10..20`) | `Orbitron`, `18px`, `lineHeight: 24px`, `weight: 600` | `Orbitron, sans-serif`, `18px`, `lineHeight: 24px`, `weight: 600` | `Orbitron` (`isCustomFont: true`) |
| Nav Link (`geom-t-1..4`) | `Chakra Petch`, `14px`, `lineHeight: 20px`, `weight: 500` | `"Chakra Petch", sans-serif`, `14px`, `lineHeight: 20px`, `weight: 500` | `Chakra Petch Medium` (`isCustomFont: true`) |
