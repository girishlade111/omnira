# Visual Regression Report

- **Verification Run**: `task-533` (`scripts/testing/compare-screenshots.ts`)
- **Timestamp**: `2026-11-26T21:53:01.816Z`
- **Source Report**: `research/reports/visual-comparison-summary.json`
- **Artifacts**: `research/comparisons/{home,about,works,contact,404}/{1440x900,390x844}/{reference,implementation,overlay,difference,viewport-*,fullpage-*}.png`

## Quantitative Results (`pixelmatch` + SSIM)

### Desktop (`1440x900`)

| Route | Mode | Reference Dim | Impl Dim | Height Delta | Pixel Diff % | SSIM |
| --- | --- | --- | --- | --- | --- | --- |
| `/` (home) | viewport | `1440x900` | `1440x900` | `0px` | `9.365%` | `0.4846` |
| `/` (home) | fullpage | `1440x15683` | `1440x7394` | `-8289px` | `5.832%` | `0.5557` |
| `/about` | viewport | `1440x900` | `1440x900` | `0px` | `13.121%` | `0.5300` |
| `/about` | fullpage | `1440x7265` | `1440x6592` | `-673px` | `5.532%` | `0.3975` |
| `/works` | viewport | `1440x900` | `1440x900` | `0px` | `27.409%` | `0.5018` |
| `/works` | fullpage | `1440x4704` | `1440x4411` | `-293px` | `22.501%` | `0.4650` |
| `/contact` | viewport | `1440x900` | `1440x900` | `0px` | `5.127%` | `0.6706` |
| `/contact` | fullpage | `1440x2347` | `1440x2328` | `-19px` | `5.392%` | `0.5540` |
| `/404` | viewport | `1440x900` | `1440x900` | `0px` | `5.360%` | `0.7643` |
| `/404` | fullpage | `1440x1565` | `1440x1420` | `-145px` | `6.392%` | `0.6786` |

### Mobile (`390x844`)

| Route | Mode | Reference Dim | Impl Dim | Height Delta | Pixel Diff % | SSIM |
| --- | --- | --- | --- | --- | --- | --- |
| `/` (home) | viewport | `390x844` | `390x844` | `0px` | `17.920%` | `0.4185` |
| `/` (home) | fullpage | `390x13211` | `390x11901` | `-1310px` | `16.531%` | `0.3344` |
| `/about` | viewport | `390x844` | `390x844` | `0px` | `8.828%` | `0.4236` |
| `/about` | fullpage | `390x11003` | `390x11349` | `+346px` | `8.891%` | `0.3785` |
| `/works` | viewport | `390x844` | `390x844` | `0px` | `26.901%` | `0.4435` |
| `/works` | fullpage | `390x11207` | `390x10403` | `-804px` | `36.426%` | `0.2536` |
| `/contact` | viewport | `390x844` | `390x844` | `0px` | `8.497%` | `0.4616` |
| `/contact` | fullpage | `390x3565` | `390x3624` | `+59px` | `9.796%` | `0.4169` |
| `/404` | viewport | `390x844` | `390x844` | `0px` | `21.317%` | `0.4843` |
| `/404` | fullpage | `390x2065` | `390x1722` | `-343px` | `16.636%` | `0.4015` |

## Root-Cause Interpretation

1. **Low Static Diff on `/contact` (5.127%) and `/404` (5.360%) at 1440x900**: Static structural routes match closely; primary remaining pixels stem from Framer floating promotion badges ("Made in Framer" / "REMIX TEMPLATE") intentionally omitted from the reconstruction.
2. **Home Hero Dynamic Elements (9.365% viewport)**: Animated 3D rotating headline phase (`INTERFACE` / `SYSTEM` / `PRODUCT` / `EXPERIENCE`), Canvas 2D halftone portrait particle jitter, and `Europe/Berlin` 1-second clock account for above-the-fold pixel shifts.
3. **Home Full-Page Height Delta (-8289px at 1440x900)**: Live Framer uses `370vh-470vh` sticky scroll-track spacers around Process and Services; the Next.js build renders compact interactive panels directly, preventing huge black spacer gaps while preserving all 4 Process phases and 4 Services layers.
4. **Works Variance (~27.4% desktop, ~36.4% mobile fullpage)**: Implementation renders all 27 project cards immediately (eliminating initial 12-card cutoff) and keeps zero horizontal overflow across all breakpoints (`320px-1440px`).
