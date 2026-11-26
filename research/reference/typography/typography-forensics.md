# Omnira Typography Forensics

**Target:** `https://omnira.framer.website/` (routes `/`, `/about`, `/works`, `/contact`)  
**Method:** Playwright + Chrome DevTools Protocol (`DOM.enable`, `CSS.enable`, `CSS.getPlatformFontsForNode`) + `document.fonts` + `CSSFontFaceRule` extraction + Framer chunk inspection.

---

## 1. Loaded & Rendered Font Families (`@font-face` + CDP `CSS.getPlatformFontsForNode`)

All site typography renders exclusively with custom web fonts (`isCustomFont: true` in CDP); **no system fallback fonts** (`Arial`, `Segoe UI`, etc.) are used by Omnira's own UI (only Framer's injected `"Made in Framer"` badge uses `Arial`).

| Font Family | Source | Weights & Styles | Used For |
| --- | --- | --- | --- |
| **Orbitron** | Google Fonts (`fonts.gstatic.com`, SIL OFL 1.1) | `400`, `500`, `600`, `700` (normal) | Brand wordmark (`OMNIRA`), Hero display (`DESIGN BEYOND THE ...`), Section display headings (`EXPERIENCES`, `LAUNCH`, `BOLD BRANDS`, `Pre-build`, `something`), Project card titles, Pricing figures (`$1,200`, `$2,400`, `$4,800`), KPI numerals (`6+`, `40+`, `10K+`, `4.8`), FAQ numbers (`01`..`08`), Loading screen text (`LOADING`) |
| **Chakra Petch** | Google Fonts (`fonts.gstatic.com`, SIL OFL 1.1) | `400`, `500`, `600`, `700` (normal + italic) | Body copy, Header & Footer nav links, `TechnicalBadge` labels (`INTERFACE DESIGNER`, `PROCESS`, `WHAT I CREATE`, etc.), CTA buttons (`VIEW WORKS`, `EXPLORE PROCESS`, `LET'S TALK`), Project domains (`bradora.studio`, etc.), Terminal lines & prompt (`omnira@terminal: -$`), Form labels/inputs/textareas/selects, Footer clock & copyright |
| **Inter** | Framer CDN (`framerusercontent.com/assets/*.woff2`) | `400`, `700` (normal + italic) | Loaded by Framer runtime as a fallback/rich-text bold-italic preset (`--framer-font-family-bold` in `1whjwl2`), not directly observed as primary rendered font on headings or body nodes in CDP |

---

## 2. Exact Typography Scale & CDP Platform Font Measurements (`1440x900`)

| Role | Element / Sample Text | Computed Font Family | CDP Platform Font (`isCustomFont: true`) | Size / Line-Height | Weight | Letter-Spacing | Transform |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brand Wordmark | `OMNIRA` (`p`) | `Orbitron` | `Orbitron` | `16px / 24px` | `500` | `2.24px` (`0.14em`) | `uppercase` |
| Hero Display | `DESIGN BEYOND THE` + rotating word (`interface`, `system`, `product`, `experience`) | `Orbitron` | `Orbitron` | `64px / 64px` (rotating `span`: `1em`; wrapper `1.15em`) | `600` | `normal` (`0em`) | `uppercase` |
| About Hero Display | `BUILD WITH CLEAR` + `direction` | `Orbitron` | `Orbitron` | `64px / 68px` | `600` | `normal` | `uppercase` |
| Section Display Headings | `EXPERIENCES`, `LAUNCH`, `Clean flow`, `Pre-build`, `something` | `Orbitron` | `Orbitron` | `36px / 44px` | `500` / `600` | `normal` | `uppercase` |
| KPI & Pricing Numerals | `$1,200`, `$2,400`, `$4,800`, `6+`, `40+`, `10K+` | `Orbitron` | `Orbitron` | `36px / 44px` | `600` | `normal` | `none` |
| Sub-headings (`h3`) | `FRAMER DESIGNER & DEVELOPER`, `4.8`, `%`, `∞` | `Orbitron` | `Orbitron` | `24px / 32px` | `600` | `normal` | `uppercase` |
| Card / Project Titles (`h5`) | `Brandora`, `Nivora`, `Codify`, `Design`, `VISUAL SYSTEM` | `Orbitron` | `Orbitron` | `18px / 24px` | `600` | `normal` | `none` / `uppercase` |
| FAQ Index Numbers (`h6`) | `01` .. `08` | `Orbitron` | `Orbitron` | `16px / 24px` | `600` | `normal` | `none` |
| Body Copy (`p`) | Hero intro, About bio, Services/Testimonials body | `"Chakra Petch"` | `Chakra Petch` | `16px / 24px` | `400` | `normal` | `none` |
| Project Domain & Nav Links | `bradora.studio`, `HOME`, `ABOUT`, `WORKS`, `CONTACT` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` | `16px / 24px` (footer nav `500`), `14px / 20px` (header nav) | `400` / `500` | `normal` | `uppercase` (nav) / `none` (domain) |
| FAQ Questions (`h6`) & `STILL HAVE QUESTIONS?` | `How long does it take?` | `"Chakra Petch"` | `Chakra Petch SemiBold` | `16px / 24px` | `600` | `normal` | `none` / `uppercase` |
| Technical Badges & Labels | `INTERFACE DESIGNER`, `PROCESS`, `STATUS:`, `LOCAL TIME:` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` | `14px / 20px` | `400` / `500` | `normal` | `uppercase` |
| Card Body / Terminal / Form Inputs | Process descriptions, `omnira@terminal: -$`, `textarea`, `SEND REQUEST` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` | `14px / 22px` (process), `14px / 20px` (terminal/buttons), `14px / 16.8px` (`textarea`) | `400` / `500` | `normal` | `none` / `uppercase` |

---

## 3. Responsive Heading & Line-Wrapping Behavior

Measured across `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, and `320x700`:
- `FRAMER DESIGNER & DEVELOPER` (`h3`, `24px/32px`, `Orbitron`):
  - `1440x900`..`768x1024`: `width: 420px`, `lines: 2` (`height: 64px`)
  - `390x844`: `width: 294px`, `lines: 2` (`height: 64px`)
  - `320x700`: `width: 224px`, `lines: 3` (`height: 96px`)
- Pricing figures (`$1,200`, `$2,400`, `$4,800`, `h2`, `36px/44px`, `Orbitron`): stay on `1` line across all 6 viewports (`width: 140px..153px`, `height: 44px`).
- Hero display (`DESIGN BEYOND THE <word>`): `64px` on Desktop (`>= 1200px`), scales down cleanly at Tablet (`810px..1199.98px`) and Mobile (`<= 809.98px`) with zero horizontal overflow (`scrollWidth === clientWidth` across all 35 route × viewport checks).

---

## 4. Raw Artifacts
- [`font-faces.json`](./font-discovery/font-faces.json) (`@font-face` rules extracted from `document.styleSheets`)
- [`loaded-fonts.json`](./rendered-fonts/loaded-fonts.json) (`document.fonts` status per route)
- [`cdp-typography.json`](./heading-measurements/cdp-typography.json) (339 element measurements with CDP `CSS.getPlatformFontsForNode`)
- [`responsive-wrapping.json`](./heading-measurements/responsive-wrapping.json) (heading widths/line counts across 6 breakpoints)
- [`typography-scale.json`](./font-metrics/typography-scale.json) (structured token summary)
