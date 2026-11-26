# Graphics Architecture

## Hero Halftone Portrait (`src/components/graphics/HeroPortrait.tsx`)

Implements a Canvas 2D dot-matrix sampler (`Stylokit Image Halftone` specification) over `/assets/images/hero/hero-portrait-dotmatrix.png` (and WebP):
- Sampling grid: `dotSpacing: 3`, `dotSize: 1`, `threshold: 32`, `contrast: 2`, `pixelMode: 'light'`.
- Pointer repulsion: `mouseRadius: 300`, `repulsionStrength: 64`, `returnSpeed: 0.2`.
- Performance and accessibility: DPR capped at `2`, animation loop paused when offscreen (`IntersectionObserver`) or hidden (`visibilitychange`), static render under `prefers-reduced-motion: reduce`, and hidden on mobile viewports (`<= 809.98px`) matching the reference layout.

## Isometric Stacks (`ServiceIsometricGraphic.tsx`, `TerminalIsometricGraphic.tsx`)

Both isometric visuals share `IsometricLayerStack` in pure React + CSS + SVG (zero WebGL overhead):
- Diamond geometry uses CSS `clip-path: polygon(50% 5%, 98% 40%, 50% 75%, 2% 40%)` over local layer artwork (`servicesHomeLayers` for Home Services 4 layers, `servicesAboutLayers` for About Terminal 5 layers).
- Four SVG dashed corner guide polylines (`strokeDasharray="6 6"`) connect stacked vertices vertically.
- Selecting a layer highlights its border and extrusion in `#ff9800` with a `400ms` CSS transition.

## Brand and Vector Marks (`OmniraLogo.tsx`)

`OmniraLogo` renders the `#ff9800` geometric hexagon emblem (`21x24` SVG viewBox) paired with the Orbitron `OMNIRA` wordmark (`16px/24px`, weight `500`, `letter-spacing: 2.24px`). All 8 partner logos, signature SVG, and 16 tool stack SVGs are served locally from `public/assets/`.
