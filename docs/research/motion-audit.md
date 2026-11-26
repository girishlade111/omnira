# Omnira Motion & Interaction Timing Audit

**Classification Legend:** `VERIFIED` (Framer component code verified), `BROWSER-MEASURED` (live WAAPI `document.getAnimations()` & frame captures), `SCREENSHOT-OBSERVED` (loading/headline/portrait frames).

**Primary Sources:**
- `research/manifests/animations.json`
- `research/reference/motion/loading-sequence.json`
- `research/reference/motion/hero-headline-timing.json`
- `research/reference/technology/hero-portrait-forensics.json`
- `research/reference/technology/hero-portrait-tech.md`

---

## 1. Initial Preloader (`InitialLoader` / `Hr` + `Br`) (`VERIFIED`, `SCREENSHOT-OBSERVED`)

- **Visual:** Full-viewport (`100vw x 100dvh`, `z-index: 2147483647`) `#000000` overlay with centered Orbitron uppercase `LOADING` text (`loading-1600ms.png`..`loading-3400ms.png`).
- **Gating & Timing:** `minDuration: 1200ms`, `maxWait: 4000ms` (Home instance), waits for `document.readyState === "complete"`, `document.fonts.ready`, and `img.decode()`. Runs once per browser session (`sessionStorage` key `stylokit-initial-loader-seen`, cleared on reload).
- **Exit Dissolve (`exitEffect: "grid"`):** Splits viewport into `80px` (`gridSize: 80`) square tiles animating `opacity: 1 -> 0` (`750ms ease-out`) and `scale: 1 -> 0.15` (`750ms cubic-bezier(0.65, 0, 0.35, 1)`) with diagonal stagger `((row + col) / (rows + cols)) * 520ms`.

---

## 2. Hero 3D Rotating Headline (`AnimatedTextBlock`) (`VERIFIED`, `BROWSER-MEASURED`)

- **Structure:** Fixed white prefix `DESIGN BEYOND THE` above a 3D `rotateX` barrel (`perspective: 600px`, `transform-style: preserve-3d`, `translateZ: ±22px`, `90deg` per face) cycling 4 words: `interface` -> `system` -> `product` -> `experience`.
- **Timing & Easing:** `interval: 3000ms` (`3s`), `duration: 650ms`, `easing: cubic-bezier(0.76, 0, 0.24, 1)`.
- **Live Browser Proof:** Captured mid-rotation `matrix3d(1, 0, 0, 0, 0, 0.850685, -0.525677, ...)` and `matrix3d(1, 0, 0, 0, 0, 0, 1, ...)` in `hero-portrait-forensics.json` and `desktop/1440x900/home-viewport.png`.
- **Highlight Gradient:** `linear-gradient(0deg, #ff6600, #ffe14a)` clipped to text (`background-clip: text`).

---

## 3. Hero Interactive Halftone Portrait (`Stylokit Image Halftone`) (`VERIFIED`, `BROWSER-MEASURED`)

- **Technology:** HTML5 2D `<canvas>` (`756x752` at `1440x900`, `x: 616, y: 98`), **not** WebGL/Three.js/video.
- **Sampling Parameters:** Source `Sy1FOpVGp8D2UAJSvei3zr08s.png` (`1254x1254`), `dotSpacing: 3`, `dotSize: 1`, `threshold: 32`, `contrast: 2`, `pixelMode: "light"`, `sizeVariation: 0.01`, `dotOpacity: 1`, `primaryColor: rgb(255,255,255)`.
- **Pointer Repulsion Physics:** `mouseRadius: 300px`, `repulsionStrength: 64`, `returnSpeed: 0.2`. Verified via 5 pointer moves producing `63,398` to `73,765` changed pixels inside the canvas bounds. Pauses RAF automatically when settled (`< 0.01px`) or offscreen (`IntersectionObserver` threshold `0.01`); hidden on Mobile (`<= 809.98px`).

---

## 4. Scroll-Triggered, Hover & Micro-Animations (`VERIFIED`, `BROWSER-MEASURED`)

| Animation | Trigger | Timing / Easing | Behavior |
| --- | --- | --- | --- |
| **Section Scroll Reveals** | `whileInView` | Spring (`stiffness: 500`, `damping: 60`, `mass: 0.3`, `duration: 300ms`) | `opacity: 0 -> 1`, `translateY: 56px -> 0` |
| **Services Variant Switch** | Scroll (`threshold: 0.5`, Desktop) / Click | Spring (`bounce: 0`, `duration: 400ms`) | Accordion expand + 4-layer isometric highlight |
| **CTA Corner Triangles** | Hover | Spring (`stiffness: 220`, `damping: 24`) | 4 `6x6` corner triangles illuminate at chamfer cuts |
| **Pricing Digit Blur-In** | `whileInView` | Per-character blur-in | `$1,200`, `$2,400`, `$4,800` digits settle upward |
| **Status Green Pulse** | Infinite loop | `750ms` cycle | `#6d9d27` / `#80b82c` dot with `rgba(109,157,39,0.20)` halo |
| **Testimonials Carousel** | Click `Previous` / `Next` | Spring transition | Cycles 6 client testimonial cards + partner strip |
| **FAQ Accordion** | Click row | Smooth height/opacity transition | Toggles `+` / `-` icon across 8 items |
| **Footer Live Clock** | `1000ms` interval | `Intl.DateTimeFormat` (`Europe/Berlin`) | 12-hour clock with seconds (`09:44:47 PM` etc.) |
