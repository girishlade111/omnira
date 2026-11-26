# Framer Code Components & Runtime Architecture Analysis

> **Source Evidence:** Directly inspected from Framer's bundled ES modules in `research/reference/technology/chunks/` (`shared-lib.DwAK3G21.mjs`, `EobXXbbWfB7esIu9E9mR-oWYOkWOMjNJMoyb6HWc2Rw.B7tFxpIP.mjs`, `1jPVe6ELA2ogP4sSWf7-XeWzR8AJzutT3-_cFNcY6sI.D66oSexm.mjs`, `AaRtvYy_c.Br4Q4bg5.mjs`, `script_main.DZZ9_rVU.mjs`, `aspL4zAAs.4wUx_Cd_.mjs`, `kkfyTVuuk.fEKFVKjB.mjs`, `ewDeb3VVFPkyC2MkYdlp-r5GKdMQXdGeE2p0U7UbEFk.CLjMfjOn.mjs`, `yeL9HJlHZi_e4MBgkkEyHKbZLEnWYdp04ShqMZ7eGVM.BLKL2gor.mjs`) and HTML `<style data-framer-css-ssr-minified>` in `research/reference/html/home.html`.

---

## 1. Custom Framer Code Components

### 1.1 Hero Digital Portrait — `Stylokit Image Halftone` (`fr` in `EobXXb...mjs`)
- **Rendering Tech:** **HTML5 `<canvas>` 2D dot-matrix / halftone particle renderer** (not WebGL, not ASCII text, not video, not a plain static `<img>`).
- **Source Asset:** `https://framerusercontent.com/images/Sy1FOpVGp8D2UAJSvei3zr08s.png?width=1254&height=1254`
- **How It Works:**
  1. Loads the portrait image (`crossOrigin = "anonymous"`) and draws it onto an offscreen 2D `<canvas>` scaled to `fit: "cover"` and `imageScale: 1`.
  2. Samples `getImageData(0, 0, w, h)` on a grid stepped by `dotSpacing: 3` (`Math.max(2, Math.round(dotSpacing))`).
  3. Skips transparent pixels (`alpha / 255 < 0.08`). Computes normalized luminance `(r + g + b) / 3 / 255`, applies `contrast: 2` (`(lum - 0.5) * contrast + 0.5`), clamps `[0, 1]`, and selects `pixelMode === "light" ? lum : 1 - lum`.
  4. Filters out pixels below `threshold / 100` (`32%`), computes dot radius `dotSize * u^0.72 * jitter` (`dotSize: 1`, `sizeVariation: 0.01`, deterministic pseudo-random hash `sin(x*12.9898 + y*78.233) * 43758.5453`), and mixes `accentColor` (`accentAmount: 0.1`) vs `primaryColor` (`rgb(255, 255, 255)`).
  5. **Mouse Interaction:** On `pointermove`, tracks pointer position (`mouseRadius: 300`). Dots within `300px` receive radial repulsion `(1 - dist / mouseRadius)^2 * repulsionStrength` (`repulsionStrength: 64`) and spring back via `x += (targetX - x) * returnSpeed` (`returnSpeed: 0.2`) inside `requestAnimationFrame` until settled.
  6. **Performance Guards:** Uses `IntersectionObserver` (`threshold: 0.01`) to pause `requestAnimationFrame` when offscreen, `ResizeObserver` for container resizes, and `devicePixelRatio` scaling.

### 1.2 Loading Preloader — `Initial Loader` (`Hr` in `EobXXb...mjs`)
- **Behavior:** Fullscreen fixed overlay (`zIndex: 2147483647`, `background: "#000000"`, `lockScroll: true`, `showOnce: true`).
- **Readiness Gate:** Waits for `Promise.race([allReady, timeout(maxWait)])`, where `allReady` awaits:
  1. `minDuration: 1.2s`
  2. `document.readyState === "complete"`
  3. `document.fonts.ready`
  4. `document.images` decode (`img.decode()`).
  - Capped at `maxWait: 8s`.
- **Exit Animation:** `exitEffect: "grid"` (`gridSize: 24px`, `fadeDuration: 0.75s`), with alternative modes `"fade"` and `"panels"` (`panelCount: 5`).

### 1.3 Rotating Hero Headline — `Animated Text Block` (`N` in `shared-lib.DwAK3G21.mjs`)
- **Behavior:** Splits `text` (`"Design beyond the interface"`) on `targetWord` (`"interface"`, case-insensitive) and replaces the target word slot with a 3D CSS `rotateX` barrel/prism cycler.
- **3D CSS Mechanics:**
  - Container: `display: inline-grid`, `perspective: 600`, `perspectiveOrigin: 50% 50%`, `transformStyle: "preserve-3d"`.
  - Inner spinner: `transform: translateZ(-22px) rotateX(${-activeIndex * (360 / words.length)}deg)` (`translateZ` is `-14px` when `<= 2` words, `-22px` for 3–8 words).
  - Transition: `transform ${duration}s cubic-bezier(0.76, 0, 0.24, 1)` (`duration: 0.65s`, `interval: 3s`).
  - Each word face: `position: absolute`, `backfaceVisibility: "hidden"`, `transform: rotateX(${idx * (360 / N)}deg) translateZ(22px)`.
  - Highlight gradient: `linear-gradient(0deg, #ff6600, #ffe14a)` (`WebkitBackgroundClip: text`, `WebkitTextFillColor: transparent`).
- **Home Hero Words:** `["interface", "system", "product", "experience"]`. (Used statically with `animate: false` on section headings such as `"CRAFTED DIGITAL EXPERIENCES"`, `"FROM CONCEPT TO LAUNCH"`, `"Years of focused digital craft"`).

### 1.4 Chamfered / Notched HUD Containers & Grain — `BG Border` (`NotchBox` in `shared-lib.DwAK3G21.mjs`)
- **Rendering Tech:** Responsive `ResizeObserver`-measured SVG + CSS overlay (`pointerEvents: "none"`).
- **SVG Geometry:**
  - Computes inner box inset by `padding + strokeWidth / 2`.
  - Supports uniform `cornerCut` or per-corner `cornerMode: "custom"` (`cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`) generating 45-degree chamfered SVG paths (`M ... L ...`).
  - Supports inward/outward trapezoidal notches (`topNotches`, `rightNotches`, `bottomNotches`, `leftNotches`) with `notchWidth`, `notchDepth`, `notchSlant`.
  - Supports diagonal hatch tick lines inside notch recesses (`notchLineCount`, `notchLineGap`, `notchLineOpacity`).
  - Optional `<filter>` `feGaussianBlur` inner/outer glow (`innerGlow`, `outerGlow`).
  - **Spring-Interpolated State Transitions:** Custom `requestAnimationFrame` damped spring (`V`, `springStiffness: 220`, `springDamping: 24`) animates `cornerCut`, `notchDepth`, etc., on hover/active variant changes (e.g., `cornerCut: 12 -> 6` on Project Card hover).
- **Grain Overlay:** Renders `grainImage` (`https://framerusercontent.com/images/clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg?width=4736&height=3136`) with `mixBlendMode: "screen"`, `grainOpacity: 0.8`, `grainScale` (animated `1 -> 1.19` on project card hover).

### 1.5 Tactical Corner Brackets — `Corners` (`Q` in `shared-lib.DwAK3G21.mjs`)
- **Rendering Tech:** `ResizeObserver`-measured full-bleed SVG (`viewBox="0 0 w h"`).
- **Modes (`styleType`):**
  - `"line"`: Four L-shaped corner brackets (`M y y+v L y y L y+v y`, etc.) with `cornerSize`, `thickness`, `inset`.
  - `"triangle"`: Four 45-degree corner triangles (`M y y L y+v y L y y+v Z`, etc.).
- **Animation:** Uses the same `rAF` spring interpolator (`springStiffness: 220`, `springDamping: 24`) to animate `inset`, `cornerSize`, `thickness`, and optional SVG `feGaussianBlur` glow on hover.

### 1.6 Diagonal Hatch / Signal Lines (`J` in `shared-lib.DwAK3G21.mjs`)
- **Rendering Tech:** Pure CSS `repeating-linear-gradient(${rotation}deg, ${lineColor}, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px, transparent ${lineSpacing}px)`.
- **Usage:** Left/Right page side rails (`rotation: 145`, `lineWidth: 1`, `lineSpacing: 4`, `lineColor: rgba(255,255,255,0.03)`), card backdrops, and horizontal section dividers.

### 1.7 Isometric Stacked Layers — Process / Services / Terminal (`Gi` & `Ki` in `AaRtvYy_c.Br4Q4bg5.mjs`)
- **Usage:** Drives the 4-layer interactive stack in Home **Services** (`lQEnhdgHr`, `layerCount: 4`, `activeLayer: 1..4` synced with the 4 service tabs, `hover: true`, `box: true`) and the 5-layer stack in About **Terminal** (`oSuo_xK7Q`, `layerCount: 5`, `hover: false`, `box: false`).
- **Rendering Tech:** Pure React + CSS `clipPath: polygon(...)` + SVG `<polyline>` (NOT WebGL / Three.js):
  - Each layer is an isometric diamond (`top`, `right`, `bottom`, `left` normalized coordinates, e.g. `50,5 -> 98,40 -> 50,75 -> 2,40`).
  - Optional 3D side extrusion (`Ki`) uses two `clipPath: polygon(...)` faces (`left-bottom` light face + `bottom-right` dark face) + bottom edge `<polyline>`.
  - Layer image (`layer1Image..layer5Image`) is masked inside the diamond polygon (`seamFix: 1.2`).
  - Vertical dashed guide lines (`leftLinePoints`, `rightLinePoints`, `frontLinePoints`) connect corners across all stacked layers via an overlaid `<svg viewBox="0 0 100 100">` (`strokeDasharray: "6 6"`).
  - Hovering/activating a layer scales it (`hoverScale: 1.03`), lifts it (`hoverLift: 1`), raises `zIndex`, dims inactive layers (`secondOpacity: 0.72`, `lastOpacity: 0.28`), and supports clicking a layer (`layer1Link..layer4Link`).

### 1.8 Scroll Progress & Dot Tracker (`gt` in `AaRtvYy_c.Br4Q4bg5.mjs`)
- **Usage:**
  - Home **Process** horizontal tracker (`Y4H2qzBQ5`, `direction: "x"`, `axis: "y"`, `cardIds: ["content-1", "content-2", "content-3", "content-4"]`).
  - About **Timeline** vertical tracker (`zXzZWRTFd`, `direction: "y"`, `axis: "y"`, `cardIds: ["timeline-1" .. "timeline-7"]`).
- **How It Works:** On scroll/resize (`rAF`-throttled), queries `document.getElementById(id)` for each card, computes viewport trigger offsets, linearly interpolates track fill progress (`scaleX` or `scaleY` with `will-change: transform`), and toggles active state on indicator dots (`dotSize: 8px`, `dotActiveSize: 12px`, `dotGlow: true`, `dotGlowSize: 14px`).

### 1.9 Live Local Clock (`dn` in `script_main.DZZ9_rVU.mjs`)
- **Timezone Logic:** Uses `Intl.DateTimeFormat` with a hardcoded region lookup table (`fn`) mapping `"Germany — Berlin"` to `"Europe/Berlin"` (NOT visitor's browser local timezone!).
- **Footer Props (`z4B7aRFZZ`):** `region: "Germany — Berlin"`, `format: "12h"`, `showSeconds: true`, `showDay: "no"`, `uppercase: true`, `align: "right"`. Ticks via `setInterval` and formats e.g. `09:42:15 PM` in Berlin time.

### 1.10 Counters, Pricing Effects, Hover Tilt, Status Dot & Smooth Scroll
- **`AnimatedNumber` (`Oi` in `AaRtvYy_c.Br4Q4bg5.mjs`):** Framer Motion `useMotionValue` + `useSpring(value, { damping: 30, stiffness: 100 })`, triggered by `useInView(ref, { once: true, amount: 0.5 })`, formatted with `toFixed(decimals)` and `toLocaleString()` for `>= 1000`.
- **Pricing Rolling Digits (`Go` in `EobXXb...mjs`):** Uses Framer's per-character appear effect (`tokenization: "character"`, initial `{ opacity: 0.001, y: 10, filter: "blur(10px)" }`, `trigger: "onInView"`, `repeat: true`, `threshold: 0.5`, `spring(duration: 0.4, bounce: 0, delay: 0.05)`).
- **`HoverCardMove` (`ns` in `EobXXb...mjs`):** Wraps Process Step Cards; computes normalized pointer offset within element bounds and applies `perspective(...) translate3d(...) rotateX(...) rotateY(...) scale(...)` with `40ms linear` tracking and `180ms ease-out` reset on `pointerleave` (disabled on small screens).
- **`Elements/Indicator animation` (`kkfyTVuuk.fEKFVKjB.mjs`):** 12x12 circular status beacon with a 6x6 solid green core (`#6d9d27` / `#80b82c`) and an outer ring pulsing between `rgba(109, 157, 39, 0.2)` and `rgba(109, 157, 39, 0.05)` every `750ms` (`0.4s ease [0.44, 0, 0.56, 1]`).
- **`Smooth Scroll` (`Dt` in `script_main.DZZ9_rVU.mjs`):** Intercepts wheel events (`intensity: 1`, `smoothness: 14`) to lerp window scroll position smoothly while skipping inner scrollable containers (`Nt` / `Pt`).
- **`Terminal` (`ODa0fqBU0` in `1jPVe6...mjs`):** Static visual mock terminal (no `<input>` or live CLI parser) displaying 5 numbered workflow stages (`01 INPUT`..`05 LAUNCH`), `STAUS: IN PROGRESS`, prompt `omnira@terminal: -$`, command `purpuse + structure + clarity = impact` (note original spelling `"purpuse"` and `"STAUS:"` / `"archittecture"` in Framer source!), `ENTER` hint, `OUTPUT` isometric 5-layer stack, and `SYSTEM CHECK [ALL OK]`.

---

## 2. CSS Design Token Inventory (`--token-*` from `home.html`)

| Framer CSS Token | Resolved Value | Semantic Role |
|---|---|---|
| `--token-f962e50e-0b00-41fe-a53c-89367ecb1ae3` | `#000` (`rgb(0, 0, 0)`) | Primary background (Black) |
| `--token-9eeddc74-3981-48ed-b1f6-db9260f54e0b` | `#121218` | Elevated dark surface |
| `--token-3f6952e7-0bb9-4b60-98e1-3004894f3df7` | `#242734` | Slate surface |
| `--token-241af6ed-d665-433f-9a8d-5dc83d8283f5` | `#24273480` | Slate surface 50% |
| `--token-5e0b86d9-0d0b-4063-bdc8-43e62554268b` | `#0003` (`rgba(0,0,0,0.2)`) | Translucent black overlay |
| `--token-13b18929-c48d-4ed4-8752-b075d7d165c4` | `#fff` (`rgb(255, 255, 255)`) | Primary foreground text (White 100%) |
| `--token-becea183-8eb9-4504-a8a1-482108af648a` | `#fff` | White alias |
| `--token-9532276e-e0f6-48ef-aa02-0100b8fa5f98` | `#ffffffb3` (`rgba(255,255,255,0.7)`) | Secondary body text (White 70%) |
| `--token-8fb1d2a7-4661-404b-bd2e-3d2ecb542fcf` | `#ffffff4d` (`rgba(255,255,255,0.3)`) | Muted labels / borders (White 30%) |
| `--token-c8f36d0d-c2a0-4712-a2a0-22eecb5652cd` | `#ffffff1a` (`rgba(255,255,255,0.1)`) | Hairline grid / divider borders (White 10%) |
| `--token-cc5d68f7-fe29-4c80-849d-13496d297c3b` | `#ffffff0d` (`rgba(255,255,255,0.05)`) | Subtle hatch / track fill (White 5%) |
| `--token-edf0a184-db09-4403-a27f-9e566ce06127` | `#ffffff08` (`rgba(255,255,255,0.03)`) | Card subtle fill (White 3%) |
| `--token-0278b3b4-0442-4287-a2dd-5441631a3e2b` | `#fff0` (`rgba(255,255,255,0)`) | Transparent white |
| `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37` | `#ff9800` | **Primary Brand Accent (Amber/Orange `#ff9800`)** *(Note: fallback strings in compiled JS sometimes say `rgb(255, 212, 0)`, but `:root` resolves `--token-cb86c361...` to `#ff9800`)* |
| `--token-24362e6d-6c07-4fd9-ba7e-c0e296878a22` | `#ffe14a` | Gradient highlight end (Yellow) |
| `--token-2f395c80-dafe-4d14-97f3-05db9f3b6c17` | `#f60` (`#ff6600`) | Gradient highlight start (Orange-Red) |
| `--token-09e9e3e3-e498-487c-a3ea-aa95593a024d` | `#ff980080` | Accent 50% |
| `--token-1d1219df-251e-49ce-ad59-64de5c9ae42b` | `#ff98004d` | Accent 30% |
| `--token-dc89defa-3265-4b06-964c-f773fd849997` | `#ff98001a` | Accent 10% |
| `--token-69b07e5e-cb91-426f-93b6-d0cd51adc8a6` | `#ff980008` | Accent 3% |
| `--token-29ae4940-28e7-4ea1-b67d-c8e3310a111b` | `#ff980000` | Accent 0% |
| `--token-2bae69df-d74c-45f2-9a8e-c4c44960067e` | `#80b82c` | Status online green |
| `--token-e40ca599-3097-4ae8-bdaf-6f17e9ea240a` | `#6d9d2733` | Status pulse ring 20% |
| `--token-18c82374-db1b-494b-89b4-ad44f2f73633` | `#6d9d270d` | Status pulse ring 5% |
| `--token-8ae91014-7686-45fc-8d87-632cbafca936` | `#ff2f24` | Error / alert red |

---

## 3. Framer Breakpoints & Container Width
- **Desktop:** `(min-width: 1200px)` (`max-width: 1400px` centered frame, `96px` side hatch rails)
- **Tablet:** `(min-width: 810px) and (max-width: 1199.98px)` (`48px` side hatch rails)
- **Mobile:** `(max-width: 809.98px)` (`16px` side hatch rails)
