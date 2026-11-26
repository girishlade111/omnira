# Accessibility Report

- **Verification Run**: `task-533` (`scripts/testing/check-a11y-perf.ts` using `@axe-core/playwright`)
- **Timestamp**: `2026-11-26T21:53:16.901Z`
- **Source Report**: `research/reports/a11y-report.json`
- **Standard**: WCAG 2.1 Level A & Level AA
- **First Tab Focus Target**: `"Skip to content"` link verified

## Automated axe-core Results

| Route | Violations | Critical / Serious | Passed Rules | Status |
| --- | --- | --- | --- | --- |
| `/` | `0` | `0` | `28` | `PASS` |
| `/about` | `0` | `0` | `29` | `PASS` |
| `/works` | `0` | `0` | `26` | `PASS` |
| `/contact` | `0` | `0` | `27` | `PASS` |
| `/nonexistent-check-404` | `0` | `0` | `22` | `PASS` |

## Accessibility Engineering Applied

- **Custom Dropdown Controls**: Zero native `<select>` elements (`nativeSelectCount: 0`); Contact form Project Type, Budget, and Timeline use custom ARIA listbox triggers (`TechnicalSelect`) with `aria-expanded`, `aria-controls`, keyboard navigation, and visible error descriptions.
- **ARIA & Roles**: Added `role="img"` and rating `aria-label` on `ClientRating`, corrected button accordion semantics in `ServiceSelector`, and aligned button `aria-label` values with visible labels in `ProjectCard` and `TerminalPanel`.
- **Contrast**: Set `--color-text-muted` to `rgba(255, 255, 255, 0.58)` and adjusted inactive timeline/caption opacities so all text passes WCAG 2.1 AA contrast checks in axe-core.
- **Reduced Motion**: `HeroPortrait`, `HeroHeadline`, `LoadingScreen`, `RevealBlock`, and `StatusIndicator` degrade cleanly when `prefers-reduced-motion: reduce` is enabled.
