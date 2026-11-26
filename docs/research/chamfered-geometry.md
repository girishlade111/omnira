# Omnira Chamfered Geometry & SVG Panel Architecture

**Classification Legend:** `VERIFIED` (Framer component code verified), `BROWSER-MEASURED` (live SVG path/DOM measurement), `SCREENSHOT-OBSERVED` (rendered screenshot inspection).

**Primary Sources:**
- `research/reference/design-system/chamfers/chamfer-specs.json`
- `research/reference/design-system/raw-design-system-forensics.json`
- `research/reference/technology/chunks/shared-lib.DwAK3G21.mjs`

---

## 1. Implementation Mechanism (`VERIFIED`, `BROWSER-MEASURED`)

Omnira's chamfered panels, notched HUD borders, and corner-bracket badges are **not** built with CSS `clip-path: polygon(...)` on HTML elements (because CSS `clip-path` clips standard CSS borders on diagonal edges). Instead, Framer renders an absolutely positioned inline `<svg>` overlay (`G` / `NotchBox` in `shared-lib.DwAK3G21.mjs`) that uses `ResizeObserver` to measure pixel `(width, height)` and compute exact mitered SVG `<path>` geometry:

1. **Main Polygon Path (`_e`):** Traces an 8-point chamfered rectangle with `strokeWidth / 2` inset and optional per-corner cuts (`cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`) plus optional trapezoidal notches (`notchWidth`, `notchDepth`, `notchSlant`) along any edge.
2. **Clipped Fill & Grain (`<clipPath>`):** Uses `<clipPath id="sci-fi-clip-...">` to clip the panel's translucent fill color and the `clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg` screen-blended grain `<image>` cleanly inside the chamfered boundary.
3. **Optional SVG Glow Filters:** Active panels add `<feGaussianBlur>` filters for `glow` (`stdDeviation: glowStrength`, `opacity: 0.35`), `innerGlow` (clipped inside polygon), and `outerGlow` (masked outside polygon via `<mask>`).
4. **Hover Corner Triangles (`Q`):** Buttons and interactive cards layer a second `ResizeObserver` `<svg>` (`styleType: "triangle"`, `cornerSize: 6px`) that fills 4 right triangles in the excised corner regions on hover.

---

## 2. Measured Chamfer Sizes by Component Role (`VERIFIED`, `BROWSER-MEASURED`)

| Component Role | `cornerCut` | Notches / Corner Accents | Stroke / Fill | Glow / Grain |
| --- | --- | --- | --- | --- |
| **Outer Hero HUD Frame** (`1400x906` at `1440`) | `12px` | `top: 1, right: 1, bottom: 1, left: 1`, `notchDepth: 8px` | `rgba(255, 152, 0, 0.30)` stroke, transparent fill | `glow: false`, `grain: true` (`0.8`) |
| **Process Card (Active)** | `12px` | `leftNotches: 1, rightNotches: 1`, `notchDepth: 8px` | `#ff9800` stroke | `glow: true` (`glowStrength: 8`), `innerGlow: 0.2`, `outerGlow: 0.1`, `grain: true` |
| **Process Card (Inactive)** | `12px` | `notchDepth: 8px` | `rgba(255, 255, 255, 0.30)` stroke, `rgba(255, 255, 255, 0.03)` fill | `glow: false`, `grain: true` |
| **Pricing / Project / Contact / Footer Cards** | `12px` (`11px` Featured Work outer) | Optional asymmetric variant (`TL: 0, TR/BR/BL: 12px`) | `rgba(255, 255, 255, 0.10..0.30)` stroke, `0.01..0.05` white fill | `grain: true` (`0.8 screen`) |
| **About Primary CTA Button** | `9px` | None | `#ff9800` fill, `#000000` text | `glow: false`, `grain: true` |
| **Medium Panels (System Stack, Nav Bar, Footer Strip)** | `8px` | None | `rgba(255, 255, 255, 0.03..0.05)` fill | `grain: true` |
| **Hero & Header Buttons (`138x44`, `184x44`, `103x36`)** | `6px` | `6x6` hover corner triangles (`Q`) | Primary: `#ff9800` fill; Secondary: `0.5px` `rgba(255,255,255,0.70)` stroke | `glow: false` |
| **Testimonial Avatars** | `5px` | `notchLineCount: 56` | Transparent fill | `grain: true` |
| **Form Inputs, Pills, Terminal Steps, Footer Bar** | `4px` | Optional `leftNotches: 1, notchDepth: 8px` on Terminal BG | `#000000` or `0.01..0.03` white fill | `grain: true` |

---

## 3. `TechnicalBadge` & Icon Corner Brackets (`VERIFIED`, `BROWSER-MEASURED`)

- **TechnicalBadge (`Elements/Badge`):** Flex row, `padding: 4px 12px` (`163x28` for `[ INTERFACE DESIGNER ]`), background `rgba(255, 152, 0, 0.03)` (Yellow) or `rgba(255, 255, 255, 0.03)` (White).
- **Corner Brackets (`Q` with `styleType: "line"`):** Four L-shaped SVG strokes (`cornerSize: 4px`, `thickness: 1px`, `inset: 1px`, `glow: false`, `vectorEffect: "non-scaling-stroke"`). They are crisp vector corner ticks, not literal `[` `]` text characters (`SCREENSHOT-OBSERVED`, `VERIFIED`).
- **Icon Badges (`56x56`, `padding: 12px`):** Same 4-corner L-bracket SVG overlay around `24x24` service/process icons.
