# Omnira Typography Forensics

**Classification Legend:** `VERIFIED` (font-face/stylesheet verified), `BROWSER-MEASURED` (CDP `CSS.getPlatformFontsForNode` & `getComputedStyle` at `1440x900`), `SCREENSHOT-OBSERVED` (visual wrapping check).

**Primary Sources:**
- `research/reference/typography/font-discovery/font-faces.json`
- `research/reference/typography/rendered-fonts/loaded-fonts.json`
- `research/reference/typography/heading-measurements/cdp-typography.json`
- `research/reference/typography/heading-measurements/responsive-wrapping.json`
- `research/reference/typography/font-metrics/typography-scale.json`

---

## 1. Font Families & CDP Platform Verification (`VERIFIED`, `BROWSER-MEASURED`)

Across 339 sampled DOM nodes on `/`, `/about`, `/works`, and `/contact`, CDP `CSS.getPlatformFontsForNode` confirms that **100% of Omnira's rendered UI glyphs use custom web fonts (`isCustomFont: true`)** with zero system font fallback (only Framer's injected `"Create a free website with Framer"` platform badge falls back to `Arial`, `isCustomFont: false`).

| Family | Source & License | Loaded Weights / Styles | Primary Usage |
| --- | --- | --- | --- |
| **Orbitron** | Google Fonts (`fonts.gstatic.com`, SIL OFL 1.1) | `400`, `500`, `600`, `700` (normal) | Brand wordmark (`OMNIRA`), Hero display headline, Section display headings, KPI/Pricing numerals, Sub-headings (`h3`), Card/Project titles (`h5`), FAQ indices (`01`..`08`), Preloader `LOADING` |
| **Chakra Petch** | Google Fonts (`fonts.gstatic.com`, SIL OFL 1.1) | `400`, `500`, `600`, `700` (normal + italic) | Body paragraphs, Project domains, Navigation links, `TechnicalBadge` labels, CTA buttons, Terminal steps/prompt/output, Form labels/inputs/textareas/selects, Footer links & Live Clock |
| **Inter** | Framer CDN (`framerusercontent.com/assets/*.woff2`, SIL OFL 1.1) | `400`, `700` (normal + italic) | Loaded by Framer runtime rich-text presets as a secondary fallback; not observed as primary rendered font on Omnira headings or body nodes |

---

## 2. Exact Type Scale & CDP Measurements (`BROWSER-MEASURED`)

| Role | Sample Text | Computed `font-family` | CDP `familyName` (`isCustomFont`) | Size / Line-Height | Weight | Letter-Spacing | Transform |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brand Wordmark | `OMNIRA` (`p`) | `Orbitron` | `Orbitron` (`true`) | `16px / 24px` | `500` | `2.24px` (`0.14em`) | `uppercase` |
| Hero Display (Home) | `DESIGN BEYOND THE` + `interface`/`system`/`product`/`experience` | `Orbitron` | `Orbitron` (`true`) | `64px / 64px` (`1em` rotating span; `1.15em` wrapper) | `600` | `normal` (`0em`) | `uppercase` |
| Hero Display (About) | `BUILD WITH CLEAR` + `direction` | `Orbitron` | `Orbitron` (`true`) | `64px / 68px` | `600` | `normal` | `uppercase` |
| Section Display Headings | `EXPERIENCES`, `LAUNCH`, `Clean flow`, `Pre-build`, `something` | `Orbitron` | `Orbitron` (`true`) | `36px / 44px` | `500` / `600` | `normal` | `uppercase` |
| KPI & Pricing Numerals | `$1,200`, `$2,400`, `$4,800`, `6+`, `40+`, `10K+` | `Orbitron` | `Orbitron` (`true`) | `36px / 44px` | `600` | `normal` | `none` |
| Sub-headings (`h3`) | `FRAMER DESIGNER & DEVELOPER`, `4.8`, `%`, `infinity` | `Orbitron` | `Orbitron` (`true`) | `24px / 32px` | `600` | `normal` | `uppercase` |
| Card / Project Titles (`h5`) | `Brandora`, `Nivora`, `Codify`, `Design`, `VISUAL SYSTEM` | `Orbitron` | `Orbitron` (`true`) | `18px / 24px` | `600` | `normal` | `none` / `uppercase` |
| FAQ Index Numbers (`h6`) | `01` .. `08` | `Orbitron` | `Orbitron` (`true`) | `16px / 24px` | `600` | `normal` | `none` |
| Body Copy (`p`) | Hero intro, About bio, Services/Testimonials body | `"Chakra Petch"` | `Chakra Petch` (`true`) | `16px / 24px` | `400` | `normal` | `none` |
| Project Domains & Footer Nav | `bradora.studio`, `HOME`, `ABOUT`, `WORKS`, `CONTACT` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` (`true`) | `16px / 24px` | `400` / `500` | `normal` | `none` / `uppercase` |
| FAQ Questions (`h6`) | `How long does it take?`, `STILL HAVE QUESTIONS?` | `"Chakra Petch"` | `Chakra Petch SemiBold` (`true`) | `16px / 24px` | `600` | `normal` | `none` / `uppercase` |
| Badges, Status, Footer Clock | `INTERFACE DESIGNER`, `STATUS:`, `LOCAL TIME:` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` (`true`) | `14px / 20px` | `400` / `500` | `normal` | `uppercase` |
| Process Card Body (`p`) | `Define the goal, audience...` | `"Chakra Petch"` | `Chakra Petch` (`true`) | `14px / 22px` | `400` | `normal` | `none` |
| Terminal & Form Inputs | `omnira@terminal: -$`, `textarea`, `SEND REQUEST` | `"Chakra Petch"` | `Chakra Petch` / `Chakra Petch Medium` (`true`) | `14px / 20px` (`textarea`: `14px / 16.8px`) | `400` / `500` | `normal` | `none` / `uppercase` |

---

## 3. Responsive Line-Wrapping Analysis (`BROWSER-MEASURED`)

Measured across `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, and `320x700`:
- `FRAMER DESIGNER & DEVELOPER` (`24px/32px` Orbitron): holds `2` lines (`width: 420px`, `height: 64px`) from `1440x900` through `768x1024`, narrows to `294px` (`2` lines, `64px`) at `390x844`, and wraps cleanly to `3` lines (`224px`, `96px`) at `320x700`.
- Pricing numerals (`$1,200`, `$2,400`, `$4,800`, `36px/44px` Orbitron): remain single-line (`width: 140px..153px`, `height: 44px`) at all 6 viewports including `320x700`.
- No text clipping or horizontal overflow occurs at any tested breakpoint (`scrollWidth === clientWidth`).
