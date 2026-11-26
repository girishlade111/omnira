# Motion Regression Report

- **Sources**: `research/manifests/animations.json`, `docs/implementation/animations.md`, `check-interactions.ts` (`task-533`)

## Verified Motion Systems

| Animation / Scene | Component | Reference Behavior & Timing | Implementation Behavior & Verification |
| --- | --- | --- | --- |
| Initial Preloader | `LoadingScreen` | 80px grid dissolve on first visit (`minDurationMs: 1200`, `maxWaitMs: 4000`, `exitDurationMs: 750`, stagger `((row+col)/(rows+cols))*0.52s`, transform `cubic-bezier(0.65,0,0.35,1)`). | Session-gated 80px tile dissolve overlay implemented; respects `prefers-reduced-motion` and skips repeat play once `sessionStorage` flag is set. |
| Hero 3D Headline | `HeroHeadline` | 3000ms interval, 650ms `cubic-bezier(0.76,0,0.24,1)` rotating words `INTERFACE`, `SYSTEM`, `PRODUCT`, `EXPERIENCE`, 600px perspective, gradient `#ff6600 -> #ffe14a`. | Verified exact computed gradient, `64px` `Orbitron` weight `600`, and reduced-motion static word fallback. |
| Hero Halftone Portrait | `HeroPortrait` | Canvas 2D dot-matrix (`dotSpacingPx: 3`, `mouseRadiusPx: 300`, `repulsionStrength: 64`, `returnSpeed: 0.2`, hidden `<810px`). | Canvas 2D interactive particle portrait with `DPR <= 2`, `IntersectionObserver` pause offscreen, hidden `<=809px`, and static fallback under reduced motion. |
| Status Indicator Pulse | `StatusIndicator` | 750ms pulse halo (`#6d9d27` / `#80b82c`, `rgba(109,157,39,0.20)`). | CSS keyframe pulse present in Hero, About, Contact, and Footer status bars; pauses under `prefers-reduced-motion`. |
| Chamfered Button Hover | `ChamferedButton` | 6px chamfer + 4 corner triangle fills (`opacity 0 -> 1`). | Implemented with 8 interactive states (default, hover, focus-visible, active, disabled, loading, error, selected). |
| Process Interactive Phases | `ProcessSection` | 4 phases (`DISCOVER`, `DESIGN`, `BUILD`, `REFINE`) + counters (`1 -> 4`, `0% -> 100%`) + amber `#ff9800` border glow. | Implemented interactive phase selection, active border highlighting, progress bar, and animated counters without `470vh` blank spacers. |
| Services 4-Tab Isometric Stack | `ServicesSection` | 400ms spring accordion + 4-layer CSS isometric diamond highlight. | Verified all 4 tabs (`DESIGN`, `DEVELOPMENT`, `VISUAL SYSTEM`, `CREATIVE`) toggle cleanly via `check-interactions.ts`. |
| Footer Berlin Clock | `LiveClock` | `1000ms` tick in `Europe/Berlin` 12-hour format with seconds. | Live client ticker formatted via `Intl.DateTimeFormat` with `Europe/Berlin` timezone. |
