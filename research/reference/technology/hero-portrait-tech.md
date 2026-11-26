# Hero Portrait & Loading Screen Technology Forensics

**Evidence:** Live Playwright DOM/Canvas/Pointer-Move Forensics (`hero-portrait-forensics.json`) + Pixel Diff Comparison (`sharp`) + Framer Chunk Analysis (`EobXXbbWfB7esIu9E9mR-oWYOkWOMjNJMoyb6HWc2Rw.B7tFxpIP.mjs`).

---

## 1. Hero Portrait Exact Rendering Technology

**Conclusion (`VERIFIED`):** The Hero portrait is **NOT** WebGL, Three.js, `<video>`, SVG, or a static image. It is an interactive **HTML5 2D `<canvas>` particle halftone renderer** (`Stylokit Image Halftone` component `fr`).

### Live Browser Proof (`1440x900`)
- **DOM Element:** Single `<canvas>` inside `[data-framer-name="Hero image (Absolute)"]` (`x: 616, y: 98, width: 756, height: 752`).
- **Context:** `canvas.getContext("2d")` (`webgl`/`webgl2` are null; `canvas.toDataURL()` succeeds cleanly).
- **Pointer-Move Verification:** Moving the cursor across 5 coordinates inside the portrait (`center (994, 474)`, `top-left (707, 188)`, `top-right (1281, 188)`, `bottom-left (707, 760)`, `bottom-right (1281, 760)`) produced distinct `toDataURL()` outputs and significant pixel deltas inside the `756x752` canvas bounds:
  - `center` vs `top-left`: `63,613` changed pixels
  - `center` vs `top-right`: `63,398` changed pixels
  - `center` vs `bottom-left`: `73,765` changed pixels
  - `center` vs `bottom-right`: `67,014` changed pixels

### Exact Algorithm & Parameters (`fr` Props on Home)
- **Source Image:** `https://framerusercontent.com/images/Sy1FOpVGp8D2UAJSvei3zr08s.png?width=1254&height=1254` (`fit: "cover"`, `imageScale: 1`, `transparentBackground: true`).
- **Grid Sampling:** Offscreen 2D canvas reads pixel brightness `s = (r + g + b) / 3 / 255` at step `dotSpacing = 3` CSS px (alpha `< 0.08` skipped).
- **Contrast & Threshold:** `s = clamp((s - 0.5) * contrast + 0.5, 0, 1)` with `contrast = 2`, `pixelMode = "light"`, `threshold = 32` (`l >= 0.32`).
- **Particle Sizing & Deterministic Hash:**
  - `u = (l - 0.32) / (1 - 0.32)`
  - `hashSize = fract(sin(x * 12.9898 + y * 78.233) * 43758.5453)` -> `variation = 1 + (hashSize - 0.5) * 2 * 0.01` (`sizeVariation = 0.01`)
  - `size = dotSize * pow(u, 0.72) * max(0.2, variation)` (`dotSize = 1`, `dotOpacity = 1`), rendered via `fillRect` (`size <= 1`) or `arc` (`size > 1`) in `rgb(255, 255, 255)` (`primaryColor = accentColor = rgb(255, 255, 255)`, `accentAmount = 0.1`).
- **Pointer Repulsion Physics:**
  - `mouseRadius = 300`, `repulsionStrength = 64`, `returnSpeed = 0.2`.
  - When pointer is within `300px` of origin `(ox, oy)`, target shifts radially outward by `((1 - dist / 300) ** 2) * 64`.
  - Each `requestAnimationFrame` lerps `x += (targetX - x) * 0.2`, `y += (targetY - y) * 0.2` and pauses RAF loop once settled within `0.01px` or when scrolled offscreen (`IntersectionObserver` threshold `0.01`).
- **Responsive Visibility:** Hidden on Mobile (`<= 809.98px`, class `hidden-wtvrx9`).

---

## 2. Initial Loading Screen (`Hr` + `Br`)

- **Overlay:** Fixed `100vw x 100dvh`, `z-index: 2147483647`, `#000000` background, centered uppercase Orbitron `LOADING` text.
- **Timing:** `minDuration: 1.2s`, `maxWait: 4s` (on Home instance, gating on `window.load` + `document.fonts.ready` + image `decode()`), `showOnce: true` (`sessionStorage` key `stylokit-initial-loader-seen`, cleared on browser reload).
- **Exit Effect (`grid`):** Breaks viewport into `80px` (`gridSize: 80`) square tiles (`Br`) that shrink (`scale(1) -> scale(0.15)`, `0.75s cubic-bezier(0.65, 0, 0.35, 1)`) and fade (`opacity: 1 -> 0`, `0.75s ease-out`) with diagonal wave stagger `((row + col) / (rows + cols)) * 0.52s`.

---

## 3. Hero Rotating Headline (`Animated Text Block`)

- **Mechanism:** 3D CSS `rotateX` barrel (`perspective: 600px`, `transform-style: preserve-3d`), 4 faces at `90deg` intervals (`translateZ: ±22px`), `transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)` every `3s` cycling `interface` -> `system` -> `product` -> `experience` (`linear-gradient(0deg, #ff6600, #ffe14a)` text-clip gradient).
