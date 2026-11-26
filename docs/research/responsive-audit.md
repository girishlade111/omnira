# Omnira Responsive Layout & Breakpoint Audit

**Classification Legend:** `VERIFIED` (Framer `@media` breakpoints verified), `BROWSER-MEASURED` (live Playwright viewport metrics across 7 sizes x 5 routes = 35 checks), `SCREENSHOT-OBSERVED` (visual review of desktop, tablet, and mobile captures).

**Primary Sources:**
- `research/reference/styles/viewport-page-metrics.json`
- `research/reference/styles/breakpoints-and-styles.md`
- `research/reference/design-system/geometry/layout-breakpoints.json`
- `research/reference/typography/heading-measurements/responsive-wrapping.json`

---

## 1. Breakpoint Tiers (`VERIFIED`, `BROWSER-MEASURED`)

| Tier | Media Query | Side Rail Width | Section Padding | Nav Mode | Hero Portrait |
| --- | --- | --- | --- | --- | --- |
| **Desktop** | `>= 1200px` (`max-width: 1400px` frame) | `96px` (`95px` + `1px`) | `96px` | Horizontal 4 links + `LET'S TALK` | Visible (`756x752` at `1440`, `691x688` at `1280`) |
| **Tablet** | `810px` to `1199.98px` | `48px` (`47px` + `1px`) | `80px 48px` | Horizontal 4 links + `LET'S TALK` | Visible / resized (`560px` content col) |
| **Mobile** | `<= 809.98px` | `16px` (`15px` + `1px`) | `64px 16px` | Hamburger drawer (`[data-framer-name="Open"]`, `32x32`) | Hidden (`hidden-wtvrx9`) |

---

## 2. Full 35-Check Overflow & Height Matrix (`BROWSER-MEASURED`)

Every route returned `overflowX: false` (`scrollWidth === clientWidth`) across all 7 tested viewports:

| Route (HTTP Status) | `1920x1080` | `1440x900` | `1280x800` | `1024x768` | `768x1024` | `390x844` | `320x700` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` (`200`) | `1920x17375` | `1440x15683` | `1280x14682` | `1024x11073` | `768x14199` | `390x13211` | `320x13586` |
| `/about` (`200`) | `1920x7265` | `1440x7265` | `1280x7349` | `1024x11091` | `768x10870` | `390x11003` | `320x11793` |
| `/works` (`200`) | `1920x4704` | `1440x4704` | `1280x4429` | `1024x7289` | `768x18914` | `390x11207` | `320x9812` |
| `/contact` (`200`) | `1920x2347` | `1440x2347` | `1280x2347` | `1024x2997` | `768x3361` | `390x3565` | `320x3777` |
| 404 (`404`) | `1920x1565` | `1440x1565` | `1280x1565` | `1024x1333` | `768x2065` | `390x2065` | `320x2089` |

---

## 3. Key Responsive Layout Behaviors (`SCREENSHOT-OBSERVED`, `BROWSER-MEASURED`)

- **Works Grid:** 3 columns on Desktop (`397x375` cards at `1440`), 2 columns on Tablet, 1 column on Mobile.
- **Process Cards:** 4-column horizontal row on Desktop inside `100vh` sticky container; wraps cleanly to 2x2 / 1-column stack on smaller viewports.
- **Services Section:** 2-column split (accordion left + `692x563` isometric diagram right) on Desktop; stacks vertically on Tablet/Mobile with sticky scroll-spacers disabled (`position: relative; top: unset`), explaining why `/` height drops from `15683px` (`1440x900`) to `11073px` (`1024x768`).
- **Mobile Navigation Drawer (`390x844` & `320x700`):** Clicking the `32x32` hamburger icon opens a full-viewport (`100vw x 100dvh`) `#000000` overlay with top `OMNIRA` logo + `X` close icon, left-aligned stacked links (`HOME`, `ABOUT`, `WORKS`, `CONTACT`), and a full-width chamfered `#ff9800` `LET'S TALK` button pinned at the bottom (`home-mobile-menu-open.png`).
- **Ultra-Narrow (`320x700`):** `288px` inner column preserves readable typography without horizontal overflow (`scrollWidth: 320`); sub-headings like `FRAMER DESIGNER & DEVELOPER` wrap cleanly to `3` lines (`224x96`), while pricing figures (`$1,200`..`$4,800`) remain single-line.
