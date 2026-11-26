# Hero Visual Effect Forensics (`Stylokit Image Halftone`)

> **Evidence Classification Key:** `VERIFIED` (exact source code extracted from `research/reference/technology/chunks/EobXXbbWfB7esIu9E9mR-oWYOkWOMjNJMoyb6HWc2Rw.B7tFxpIP.mjs` and `research/reference/technology/chunks/shared-lib.DwAK3G21.mjs`), `BROWSER-MEASURED` (asset metadata in `research/manifests/assets.json` & `research/manifests/component-assets.json`).

## 1. Classification of the Hero Visual (`VERIFIED`)

The Omnira homepage hero portrait is **not** a static `<img>`, **not** a `<video>`, **not** WebGL/Three.js, and **not** DOM ASCII text. It is a custom Framer React code component named **`Stylokit Image Halftone`** (`function fr(e)` in `EobXXbbWfB7esIu9E9mR-oWYOkWOMjNJMoyb6HWc2Rw.B7tFxpIP.mjs`) rendering an interactive **HTML5 2D `<canvas>` dot-matrix halftone particle grid** sampled from a raster portrait image.

## 2. Source Portrait Asset (`VERIFIED`, `BROWSER-MEASURED`)

- **Upstream URL:** `https://framerusercontent.com/images/Sy1FOpVGp8D2UAJSvei3zr08s.png?width=1254&height=1254`
- **Intrinsic Dimensions:** `1254 x 1254` px
- **Local Source Path:** `assets-source/original/hero/hero-portrait-dotmatrix.png`
- **Local Public Derivatives:**
  - `/assets/images/hero/hero-portrait-dotmatrix.webp` (primary)
  - `/assets/images/hero/hero-portrait-dotmatrix.avif`
  - `/assets/images/hero/hero-portrait-dotmatrix.png` (fallback)

## 3. Exact Algorithm & Runtime Configuration (`VERIFIED`)

### Instance Props (`nodeId: r0sDNwvKu` on Desktop Home)
| Property | Exact Value | Purpose |
|---|---|---|
| `fit` | `"cover"` | Image scaling mode inside canvas bounds |
| `imageScale` | `1` | Base scale multiplier |
| `pixelMode` | `"light"` | Bright pixels yield larger/denser dots (`lum`, vs `1 - lum`) |
| `contrast` | `2` | Linear contrast boost `(lum - 0.5) * contrast + 0.5` |
| `threshold` | `32` | Minimum luminance percentage (`0.32`) below which dots are omitted |
| `dotSpacing` | `3` | Sampling grid step in CSS px (`Math.max(2, Math.round(dotSpacing))`) |
| `dotSize` | `1` | Base radius/size scale in CSS px |
| `sizeVariation` | `0.01` | Deterministic per-pixel hash jitter `sin(x*12.9898 + y*78.233) * 43758.5453` |
| `dotOpacity` | `1` | Alpha multiplier (`u * dotOpacity`) |
| `primaryColor` | `"rgb(255, 255, 255)"` | Primary dot fill |
| `accentColor` | `"rgb(255, 255, 255)"` | Secondary dot fill |
| `accentAmount` | `0.1` | Probability threshold from deterministic hash `sin(x*4.112 + y*9.331) * 9182.381` |
| `transparentBackground` | `true` | Clears canvas transparently instead of filling `backgroundColor` |
| `mouseRadius` | `300` | Pointer repulsion radius in CSS px |
| `repulsionStrength` | `64` | Maximum radial displacement in CSS px |
| `returnSpeed` | `0.2` | Spring-back easing factor per animation frame |
| `showBorder` | `false` | No border drawn around canvas container |

### Rendering Pipeline (`VERIFIED`)
1. **Sampling Pass (`E`):** Creates an offscreen `<canvas>` at container CSS width/height, draws the portrait image using `fit: "cover"` math, and reads `getImageData(0, 0, c, l).data`.
2. **Particle Grid Generation:** Loops `y = 0..h` and `x = 0..w` in steps of `dotSpacing` (`3px`). Skips transparent pixels (`alpha / 255 < 0.08`). Computes normalized luminance `s = (r + g + b) / 3 / 255`, applies contrast `2` and clamps to `[0, 1]`. If `l >= 0.32`, computes normalized intensity `u = (l - k) / (1 - k)` and dot size `dotSize * u^0.72 * jitter`, storing `{ ox, oy, x, y, size, alpha, color }`.
3. **Interactive Render Loop (`w`):** Scales main `<canvas>` by `window.devicePixelRatio`. On `pointermove`, tracks `{ x, y, active }`. Each frame pushes dots within `mouseRadius` (`300px`) radially outward by `(1 - dist / mouseRadius)^2 * repulsionStrength` (`64px`) and eases all dots toward target position via `x += (targetX - x) * returnSpeed` (`0.2`). Stops `requestAnimationFrame` automatically once all dots settle within `0.01px`.
4. **Draw Optimization:** Batches fill/alpha state changes; draws `fillRect` when `size <= 1` and `arc` when `size > 1`.
5. **Lifecycle & Responsive:** Uses `ResizeObserver` + `window.resize` to rebuild grid, `IntersectionObserver` (`threshold: 0.01`) to pause loop offscreen, and hides the portrait container on Tablet/Mobile (`hidden-wtvrx9` on Home, matching responsive layout).

## 4. Accompanying Hero Rotating Word Effect (`VERIFIED`)

In the same hero section (`Animated Text Block`, `X7wtXUNop` in `shared-lib.DwAK3G21.mjs`):
- Renders `"Design beyond the interface"` where `"interface"` cycles through `["interface", "system", "product", "experience"]`.
- Uses a 4-face 3D CSS `rotateX` prism (`perspective: 600`, `translateZ(-22px) rotateX(${-index * 90}deg)`, `transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)`, `interval: 3s`) with `linear-gradient(0deg, #ff6600, #ffe14a)` clipped to text.

## 5. Next.js Rebuild Guidance (`INFERRED`)

- Implement `HeroHalftonePortrait` in `src/components/home/` using the exact Canvas 2D algorithm and parameters above against `/assets/images/hero/hero-portrait-dotmatrix.webp` (with fallback `/assets/images/hero/hero-portrait-dotmatrix.png`).
- Respect `prefers-reduced-motion: reduce` by rendering the static sampled halftone canvas without pointer repulsion loop.
- Provide a clean `role="img"` / `aria-label` on the canvas container so accessibility checks pass without missing alt text.
