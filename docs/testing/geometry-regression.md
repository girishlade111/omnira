# Geometry Regression Report

- **Verification Run**: `task-533` (`scripts/testing/compare-geometry.ts`)
- **Timestamp**: `2026-11-26T21:52:19.340Z`
- **Source Report**: `research/reports/geometry-comparison.json`
- **Aggregate Flags**: `allOverflowFree: true`, `implCustomFontsOk: true`

## Measured Frame, Rail, Header, and Footer Geometry

| Route | Viewport | Expected Rail | Measured Rails (4 samples) | Outer Frame Width | Header Height | Footer Height | Overflow X | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `home` | `1440x900` | `96px` | `96, 96, 96, 96` | `1398px` (max `1400`) | `73px` | `591px` | `false` | `PASS` |
| `about` | `1440x900` | `96px` | `96, 96, 96, 96` | `1398px` | `73px` | `591px` | `false` | `PASS` |
| `works` | `1440x900` | `96px` | `96, 96, 96, 96` | `1398px` | `73px` | `591px` | `false` | `PASS` |
| `contact` | `1440x900` | `96px` | `96, 96, 96, 96` | `1398px` | `73px` | `591px` | `false` | `PASS` |
| `not-found` | `1440x900` | `96px` | `96, 96, 96, 96` | `1398px` | `73px` | `591px` | `false` | `PASS` |
| `home` | `1024x768` | `48px` | `48, 48, 48, 48` | `1022px` (max `1024`) | `73px` | `567px` | `false` | `PASS` |
| `about` | `1024x768` | `48px` | `48, 48, 48, 48` | `1022px` | `73px` | `567px` | `false` | `PASS` |
| `works` | `1024x768` | `48px` | `48, 48, 48, 48` | `1022px` | `73px` | `567px` | `false` | `PASS` |
| `contact` | `1024x768` | `48px` | `48, 48, 48, 48` | `1022px` | `73px` | `567px` | `false` | `PASS` |
| `not-found` | `1024x768` | `48px` | `48, 48, 48, 48` | `1022px` | `73px` | `567px` | `false` | `PASS` |
| `home` | `390x844` | `16px` | `16, 16, 16, 16` | `388px` (max `390`) | `65px` | `913px` | `false` | `PASS` |
| `about` | `390x844` | `16px` | `16, 16, 16, 16` | `388px` | `65px` | `913px` | `false` | `PASS` |
| `works` | `390x844` | `16px` | `16, 16, 16, 16` | `388px` | `65px` | `913px` | `false` | `PASS` |
| `contact` | `390x844` | `16px` | `16, 16, 16, 16` | `388px` | `65px` | `913px` | `false` | `PASS` |
| `not-found` | `390x844` | `16px` | `16, 16, 16, 16` | `388px` | `65px` | `913px` | `false` | `PASS` |

## Height Deltas vs Live Reference

- `contact` @ `1440x900`: `2328px` vs `2347px` (`-19px`)
- `not-found` @ `1440x900`: `1420px` vs `1565px` (`-145px`)
- `works` @ `1440x900`: `4411px` vs `4704px` (`-293px`)
- `about` @ `1440x900`: `6592px` vs `7265px` (`-673px`)
- `home` @ `1440x900`: `7394px` vs `15683px` (`-8289px`, intentional removal of Framer empty sticky scroll spacer bands)
