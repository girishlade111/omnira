# Omnira Background Textures, Side Rails & HUD Hatch Patterns

**Classification Legend:** `VERIFIED` (Framer source & computed CSS verified), `BROWSER-MEASURED` (live `getComputedStyle` & `getBoundingClientRect` across breakpoints), `SCREENSHOT-OBSERVED` (inspected in captures).

**Primary Sources:**
- `research/reference/design-system/textures/grain-and-rails.json`
- `research/reference/design-system/geometry/layout-breakpoints.json`
- `research/reference/technology/chunks/shared-lib.DwAK3G21.mjs`
- `research/reference/technology/chunks/DgU2rXDjH.D__nZvxV.mjs`

---

## 1. Diagonal-Striped Side Rails (`VERIFIED`, `BROWSER-MEASURED`)

The left and right vertical framing rails running down every page (`/`, `/about`, `/works`, `/contact`, `/404`) are rendered with **pure CSS `repeating-linear-gradient`** (`J` component in `shared-lib.DwAK3G21.mjs`), not SVG or raster tiles.

### Exact Computed CSS
```css
background-image: repeating-linear-gradient(
  145deg,
  rgba(255, 255, 255, 0.05),
  rgba(255, 255, 255, 0.05) 1px,
  rgba(0, 0, 0, 0) 1px,
  rgba(0, 0, 0, 0) 4px
);
opacity: 1;
```
- **Stripe Angle:** `145deg` (`VERIFIED` via `getComputedStyle`).
- **Stripe Thickness:** `1px` line of `rgba(255, 255, 255, 0.05)` followed by `3px` transparent gap (`4px` total repeating period).
- **Inner Vertical Divider:** `1px solid rgba(255, 255, 255, 0.10)` separating each rail from the main content container.
- **Responsive Rail Widths (`BROWSER-MEASURED`):**
  - Desktop (`>= 1200px`): `96px` total (`95px` hatched area + `1px` border)
  - Tablet (`810px` to `1199.98px`): `48px` total (`47px` hatched area + `1px` border)
  - Mobile (`<= 809.98px`): `16px` total (`15px` hatched area + `1px` border)

---

## 2. HUD Progress & Divider Hatch Bars (`VERIFIED`, `BROWSER-MEASURED`)

The horizontal telemetry bars in the Hero status footer (`630.97px x 2px` at `1440x900`) and main Footer (`217.41px x 2px`) use a tighter CSS hatch component (`DgU2rXDjH.D__nZvxV.mjs`):
```css
height: 2px;
opacity: 0.55;
background-image: repeating-linear-gradient(
  72deg,
  rgba(0, 0, 0, 0) 0px,
  rgba(0, 0, 0, 0) 1px,
  rgba(255, 255, 255, 0.3) 1px,
  rgba(255, 255, 255, 0.3) 2px
);
```
- **Active Segment:** `15%` width solid line (`rgba(255, 255, 255, 0.30)`) followed by a `7px` gap, then the `72deg` hatched track (`hatchSpacing: 2px`, `hatchThickness: 1px`, `opacity: 0.55`).

---

## 3. Dark Grain Texture (`clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg`) (`VERIFIED`, `BROWSER-MEASURED`)

- **Source Asset:** `https://framerusercontent.com/images/clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg?width=4736&height=3136` (`4736x3136` dark photographic film/grain texture, locally optimized in `public/assets/textures/`).
- **Mode A - Chamfered Panel Surface Grain:** Inside every `NotchBox` SVG panel where `grain: true`, the texture renders as an `<svg><image>` clipped by the panel's chamfered `<clipPath>` with:
  - `opacity: 0.8`
  - `mix-blend-mode: screen`
  - `preserveAspectRatio: "xMidYMid slice"`
  - `grainScale: 1`
- **Mode B - Section Image Backdrop:** Inside dark feature containers (e.g., Home/About preview backdrops), it also renders as a standard `<img>` (`opacity: 1`, `mix-blend-mode: normal`, `object-fit: fill`).

---

## 4. Subtle Grid Pattern (`SCREENSHOT-OBSERVED`)

- Behind the **Services 4-layer isometric stack** (`692x563` chamfered frame on Home) and behind the **About profile portrait card**, a subtle dark square-grid SVG/image pattern (`~24px` cells at low opacity with small `#ff9800` corner marker triangles) provides spatial depth without competing with foreground typography.
