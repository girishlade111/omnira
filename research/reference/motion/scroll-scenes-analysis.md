# Scroll-Scene & Animation Forensics (Why User-Provided Screenshots Have Long Dark Bands)

**Evidence:** `home-scroll-5pct.json`, `process-services-forensics.json`, `about-scroll-10pct.json`, user-provided PNG pixel band analysis (`1910x17187`), and Framer chunk CSS/variant inspection.

---

## 1. Root Cause of Long Dark Regions in User-Provided Homepage Screenshot (`1910x17187`)

Pixel-band scanning of `screencapture-omnira-framer-website-2026-11-26-09_53_46.png` (`1910x17187`) detected two massive solid-black horizontal bands:
1. **`y = 3200..7700` (`4500px` tall)** — around the **Process** section.
2. **`y = 9580..13310` (`3730px` tall)** — around the **Services** section.

### Why They Happen (`VERIFIED` in Live DOM + Framer CSS)
Both **Process** and **Services** on Desktop (`>= 1200px`) use **`position: sticky` panels mounted above tall, empty `#000000` scroll-spacer tracks** (`370vh` to `470vh` tall):

1. **Process (`framer-tf15jr`):**
   - Sticky viewport container (`.framer-1h46l7m`): `height: 100vh`, `position: sticky`, `top: 0px`, `padding: 96px`, `z-index: 2`.
   - Followed immediately by **4 invisible scroll-section trigger divs**: `.framer-1rr8kft`, `.framer-c9zbed`, `.framer-5j3qoa` (`100vh` each) and `.framer-jgi6vj` (`70vh`) = `370vh`–`470vh` (`~4500px` at ~`1000px` extension capture height!).
   - In our `1440x900` 5% scroll trace (`home-scroll-5pct.json`), `"Content (Sticky)"` stays pinned at `yViewport = 0` (`height: 900`) continuously from `15%` (`scrollY = 2217`) through `40%` (`scrollY = 5913`).
   - Full-page screenshot stitchers (like GoFullPage) capture one viewport per scroll step or strip `sticky` positioning, leaving the empty `#000000` scroll-spacer divs exposed as a `4500px` dark void!

2. **Services (`framer-laqeih`):**
   - Sticky content container (`.framer-utv0xo`): `position: sticky`, `top: 96px`, `z-index: 1` (`height: 747px`).
   - Followed immediately by **4 invisible scroll-section trigger divs** (`:LttSpfmKi`, `:VswhjuzAp`, `:JWhYXjp5J`, `:FuDG6vusW`): `.framer-rczxcj` (`70vh`) + `.framer-nv5h89`, `.framer-xp5tw1`, `.framer-qihe90` (`100vh` each) = `370vh` (`~3730px` at ~`1000px` capture height!).
   - In our `1440x900` 5% scroll trace, Services `"Content"` stays pinned at `yViewport = 96` (`height: 747`) continuously from `60%` (`scrollY = 8870`) through `75%` (`scrollY = 11087`).
   - As each spacer enters `threshold: 0.5`, Framer switches the Services component (`OoaWMAEca`) between 4 variants (`hkTujllPa` -> `WcJDb4tkb` -> `kQI4F0Wsw` -> `YnykX6skv`) with `spring(bounce: 0, duration: 0.4s)`:
     - Expands the active accordion card (`DESIGN`, `DEVELOPMENT`, `VISUAL SYSTEM`, `CREATIVE`) with its 2x2 checkmark deliverables.
     - Illuminates the matching layer in the **4-layer isometric stacked UI diagram** (`692x563` grid card) in `#ff9800` while dimming the other 3 layers.

### Tablet & Mobile Differences
- At Tablet (`810..1199.98px`) and Mobile (`<= 809.98px`), `.framer-utv0xo` reverts to `position: relative; top: unset;` and the sticky scroll-spacer height collapses (cutting `/` `scrollHeight` from `15683px` at `1440x900` down to `11073px` at `1024x768`). Tabs switch directly on click instead of scroll triggers.

---

## 2. Other Scroll & Reveal Animations Observed

- **Process Metric Counters:** Scrolling through Process increments `PHASES` (`1 -> 3 -> 4`) and `PRECISION` (`87% -> 99% -> 100%`) as observed in `process-services-forensics.json` steps `2..4` (`y=3037..6073`).
- **About Preview (`/`):** Stats (`6+`, `40+`, `10K+`) and capabilities reveal on scroll (`y ~ 7592`).
- **About Page (`/about`) Timeline (`2020..2026`):** `scrollHeight: 7265px` at `1440x900` with `1` sticky element tracked across `0%..100%` scroll increments (`about-scroll-10pct.json`).
- **Section Entry Animations:** `whileInView` WAAPI spring transitions (`y: 56 -> 0`, `opacity: 0 -> 1`, `stiffness: 500, damping: 60, mass: 0.3`) across cards, Testimonials (`animateOnce` / carousel), Pricing (`character` blur-in), FAQ accordion height transitions, and Footer reveal.
