# Omnira Breakpoints & Computed Layout Metrics

**Measured Viewports:** `1920x1080`, `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, `320x700` across `/`, `/about`, `/works`, `/contact`, and 404 (`/nonexistent-check-404`).

---

## 1. Breakpoint Definitions (Verified from Framer CSS `@media` Rules)

| Tier | Media Query | Framer Base Width | Side Rail Width | Section Padding | Sticky Behavior |
| --- | --- | --- | --- | --- | --- |
| **Desktop** | `min-width: 1200px` | `1200px` (`max-width: 1400px`) | `96px` (`95px` + `1px`) | `96px` | Process (`sticky top: 0`) & Services (`sticky top: 96px`) enabled |
| **Tablet** | `(min-width: 810px) and (max-width: 1199.98px)` | `810px` | `48px` (`47px` + `1px`) | `80px 48px` | Services sticky disabled (`position: relative; top: unset`); 2-col grids |
| **Mobile** | `(max-width: 809.98px)` | `390px` | `16px` (`15px` + `1px`) | `64px 16px` | Hero portrait hidden (`hidden-wtvrx9`); Hamburger menu (`32x32` `[data-framer-name="Open"]`) |

---

## 2. Measured Document Dimensions & Zero-Overflow Check

All 35 route × viewport checks returned `overflowX: false` (`scrollWidth === clientWidth`):

| Route | `1920x1080` | `1440x900` | `1280x800` | `1024x768` | `768x1024` | `390x844` | `320x700` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` (`200`) | `1920x17375` | `1440x15683` | `1280x14682` | `1024x11073` | `768x14199` | `390x13211` | `320x13586` |
| `/about` (`200`) | `1920x7265` | `1440x7265` | `1280x7349` | `1024x11091` | `768x10870` | `390x11003` | `320x11793` |
| `/works` (`200`) | `1920x4704` | `1440x4704` | `1280x4429` | `1024x7289` | `768x18914` | `390x11207` | `320x9812` |
| `/contact` (`200`) | `1920x2347` | `1440x2347` | `1280x2347` | `1024x2997` | `768x3361` | `390x3565` | `320x3777` |
| 404 (`404`) | `1920x1565` | `1440x1565` | `1280x1565` | `1024x1333` | `768x2065` | `390x2065` | `320x2089` |

Note: `/` is significantly shorter at `1024x768` (`11073px`) than at `1440x900` (`15683px`) because Tablet disables the `370vh` sticky scroll-spacer track on Services and shrinks `100vh` from `900px` to `768px`.

---

## 3. Mobile Menu State (`390x844` & `320x700`)

- Closed header shows left `OMNIRA` logo (`112x24`) and right `32x32` hamburger icon (`[data-framer-name="Open"]`).
- Clicking the hamburger icon opens a full-viewport (`100vw x 100dvh`) `#000000` drawer with:
  - Top bar: `OMNIRA` logo + `X` close button.
  - Vertical uppercase links (`HOME`, `ABOUT`, `WORKS`, `CONTACT`).
  - Full-width chamfered `#ff9800` `LET'S TALK` button anchored at bottom.
