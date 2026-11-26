# Responsive Tests Report

- **Verification Run**: `task-533` (`scripts/testing/check-overflow.ts`)
- **Source Report**: `research/reports/overflow-check.json`
- **Matrix**: `5` routes x `5` viewports = `25` checks (`25/25 PASS`, `0` horizontal overflow offenders)

## Full Viewport Matrix (`check-overflow.ts`)

| Route | `1440x900` | `1024x768` | `768x1024` | `390x844` | `320x700` |
| --- | --- | --- | --- | --- | --- |
| `/` | `1440/1440`, `0` offenders | `1024/1024`, `0` offenders | `768/768`, `0` offenders | `390/390`, `0` offenders | `320/320`, `0` offenders |
| `/about` | `1440/1440`, `0` offenders | `1024/1024`, `0` offenders | `768/768`, `0` offenders | `390/390`, `0` offenders | `320/320`, `0` offenders |
| `/works` | `1440/1440`, `0` offenders | `1024/1024`, `0` offenders | `768/768`, `0` offenders | `390/390`, `0` offenders | `320/320`, `0` offenders |
| `/contact` | `1440/1440`, `0` offenders | `1024/1024`, `0` offenders | `768/768`, `0` offenders | `390/390`, `0` offenders | `320/320`, `0` offenders |
| `/nonexistent-check-404` | `1440/1440`, `0` offenders | `1024/1024`, `0` offenders | `768/768`, `0` offenders | `390/390`, `0` offenders | `320/320`, `0` offenders |

## Responsive Behavior Verified

- **Rail System**: `96px` desktop (`>= 1200px`), `48px` tablet (`810px-1199px`), `16px` mobile (`<= 809px`).
- **Hero Portrait Canvas**: Active on desktop/tablet (`>= 810px`), automatically hidden below `810px` to preserve above-the-fold typography spacing on mobile.
- **Navigation**: Desktop inline links + top active indicator bar (`>= 810px`); drawer menu toggle + full-height mobile drawer (`<= 809px`, `65px` header height).
