# Technology Audit and Framer Component Architecture

> **Evidence Classification Key:** `VERIFIED` (extracted directly from downloaded `.mjs` bundles, HTML `<style>` tokens, and `.framercms` binary files in `research/reference/technology/`), `BROWSER-MEASURED` (verified at runtime in `research/reference/content/live-extraction.json`).

## 1. Reference Platform Stack (`VERIFIED`)

- **Platform:** Framer SSR + React hydration (`rolldown` ES module chunks hosted on `https://framerusercontent.com/sites/1HrE3gsgOhQ42xJpkCrHpk/`).
- **Motion & Runtime Libraries:** React, Framer Runtime (`framer.CiH02BTg.mjs`), Framer Motion (`motion.ClfF2ZCo.mjs`), DataLoader + binary `.framercms` client queries (`mD0yv0kks.BkFopPY8.mjs`, `a_FhlAd4Y.D-UWAPuV.mjs`).
- **Styling Delivery:** All CSS rules, `@font-face` declarations, and 25 `--token-*` custom properties are inlined per page inside `<style data-framer-css-ssr-minified>` (no external `.css` stylesheet links).
- **Breakpoints (`__framer__breakpoints`):**
  - Desktop: `(min-width: 1200px)` (centered max-width `1400px`, `96px` side rails)
  - Tablet: `(min-width: 810px) and (max-width: 1199.98px)` (`48px` side rails)
  - Mobile: `(max-width: 809.98px)` (`16px` side rails)

## 2. Typography Stack (`VERIFIED`)

All three font families are licensed under **SIL Open Font License 1.1** and prepared locally in `public/assets/fonts/` (`62` WOFF2 files, `618,228` bytes total, `research/reference/assets/fonts-prepared.json`):
- **Orbitron** (`400`, `500`, `600`, `700`): Primary display & section headings (`fonts.gstatic.com`).
- **Chakra Petch** (`400`, `500`, `600`, `700`, normal & italic): HUD badges, monospace-feel labels, buttons, nav links, clock (`fonts.gstatic.com`).
- **Inter** (`400`, `700`, normal & italic): Body paragraphs and form input copy (`framerusercontent.com/assets/*.woff2`).

## 3. Design Token Inventory (`VERIFIED`)

Extracted from `research/reference/html/home.html` (`research/reference/technology/framer-components-analysis.md`):
- **Surfaces:** `#000` (`--token-f962e50e...`, primary black), `#121218` (`--token-9eeddc74...`), `#242734` (`--token-3f6952e7...`), `rgba(255,255,255,0.03)` (`--token-edf0a184...`, card fill), `rgba(255,255,255,0.05)` (`--token-cc5d68f7...`), `rgba(0,0,0,0.2)` (`--token-5e0b86d9...`).
- **Text & Borders:** `#fff` (`--token-13b18929...`), `rgba(255,255,255,0.7)` (`--token-9532276e...`), `rgba(255,255,255,0.3)` (`--token-8fb1d2a7...`), `rgba(255,255,255,0.1)` (`--token-c8f36d0d...`).
- **Accents:** `#ff9800` (`--token-cb86c361...`, primary amber-orange), `#ff6600` (`--token-2f395c80...`), `#ffe14a` (`--token-24362e6d...`), `#ff980080` / `#ff98004d` / `#ff98001a` / `#ff980008`.
- **Semantic Status:** `#80b82c` (`--token-2bae69df...`, online green), `#6d9d2733` / `#6d9d270d` (pulse rings), `#ff2f24` (`--token-8ae91014...`, error red).

## 4. Custom Framer Code Components (`VERIFIED`)

1. **`Stylokit Image Halftone` (Hero Portrait, `fr` in `EobXXb...mjs`):** HTML5 2D `<canvas>` dot-matrix particle renderer with luminance thresholding and pointer repulsion. (Detailed in `docs/research/hero-effect.md`.)
2. **`Initial Loader` (`Hr` in `EobXXb...mjs`):** Fullscreen `#000000` preloader (`zIndex: 2147483647`, `showOnce: true`, `lockScroll: true`) awaiting `minDuration: 1.2s`, `document.readyState === "complete"`, `document.fonts.ready`, and image decode (capped by `maxWait: 8s`), exiting via `exitEffect: "grid"` (`gridSize: 24px`, `fadeDuration: 0.75s`).
3. **`Animated Text Block` (`N` in `shared-lib.DwAK3G21.mjs`):** 3D CSS `rotateX` barrel/prism word rotator (`perspective: 600`, `translateZ: +-22px`, `cubic-bezier(0.76, 0, 0.24, 1)`). Cycles `["interface", "system", "product", "experience"]` every `3s` (`0.65s` transition) inside `"Design beyond the interface"` with `0deg` gradient `#ff6600` to `#ffe14a`.
4. **`BG Border` / `NotchBox` (`shared-lib.DwAK3G21.mjs`):** `ResizeObserver`-measured SVG path generator supporting uniform or custom `cornerCut` (45-degree chamfers), trapezoidal `top/right/bottom/leftNotches`, `notchLineCount` diagonal recess ticks, optional `feGaussianBlur` inner/outer glow, `rAF` damped spring (`stiffness: 220`, `damping: 24`) on hover, and a `screen`-blended grain texture overlay (`omnira-dark-grain`, `4736x3136`, `grainOpacity: 0.8`).
5. **`Corners` (`Q` in `shared-lib.DwAK3G21.mjs`):** `ResizeObserver`-measured SVG tactical corner brackets (`styleType: "line"` or `"triangle"`) with spring-animated `inset`, `cornerSize`, `thickness`, and optional glow.
6. **`Hatch / Diagonal Line` (`J` in `shared-lib.DwAK3G21.mjs`):** Pure CSS `repeating-linear-gradient(145deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)` used on left/right side rails and dividers.
7. **Isometric Stacked Layers (`Gi` & `Ki` in `AaRtvYy_c.Br4Q4bg5.mjs`):** Pure React + CSS `clipPath: polygon(...)` diamond stack + overlaid `<svg viewBox="0 0 100 100">` dashed corner polylines (`strokeDasharray: "6 6"`), NOT WebGL or Three.js. Drives Home Services (`4` interactive layers with 3D box edges `Ki`) and About Terminal (`5` layers).
8. **Scroll Progress & Dot Tracker (`gt` in `AaRtvYy_c.Br4Q4bg5.mjs`):** `rAF`-throttled scroll tracker measuring `document.getElementById(id)` positions; drives Home Process horizontal progress (`#content-1..4`) and About Timeline vertical progress (`#timeline-1..7`).
9. **`LocalClock` (`dn` in `script_main.DZZ9_rVU.mjs`):** Uses `Intl.DateTimeFormat` pinned to `Europe/Berlin` (region label for Berlin, Germany, `12h`, `showSeconds: true`, `uppercase: true`). Confirmed by Playwright (`live-extraction.json`): rendered `09:44:47 PM` (Berlin) while local system clock was `12:44:48 PM` (`America/Los_Angeles`).
10. **Motion & Micro-Components:**
    - `AnimatedNumber` (`Oi`): `useMotionValue` + `useSpring({ damping: 30, stiffness: 100 })` on `useInView({ once: true, amount: 0.5 })`.
    - Pricing Digits (`Go`): per-character blur-in (`opacity: 0.001 -> 1`, `y: 10 -> 0`, `blur(10px) -> 0`, `spring(0.4s)`).
    - `HoverCardMove` (`ns`): 3D pointer tilt/translate (`40ms linear` move, `180ms ease-out` reset).
    - `Indicator` (`kkfyTVuuk.fEKFVKjB.mjs`): 12x12 green pulse dot toggling every `750ms`.
    - `Smooth Scroll` (`Dt`): custom wheel lerping (`intensity: 1`, `smoothness: 14`).
    - `Terminal` (`ODa0fqBU0`): visual-only 5-step static mock terminal (no live input).

## 5. Target Next.js Architecture Mapping (`INFERRED`)

- Replace Framer's 441 procedural border SVGs with clean reusable React/CSS chamfer (`clip-path` + SVG hairline) and corner-bracket components.
- Implement `Stylokit Image Halftone` as a typed React `<canvas>` component loading `/assets/images/hero/hero-portrait-dotmatrix.webp` with `prefers-reduced-motion` static fallback.
- Implement `IsometricLayerStack` with pure React + CSS `clip-path` + SVG polylines, matching `Gi`/`Ki` geometry and local `/assets/images/{services,terminal}/` images.
- Replace the broken upstream contact spinner mask SVG (`404`) with an accessible inline SVG spinner.
