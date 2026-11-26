# Animations and Motion

## Initial Loader (`src/components/motion/LoadingScreen.tsx`)

- Fullscreen `#000000` overlay displaying `LOADING` while waiting for `document.fonts.ready` and `minDurationMs` (`1200ms`, capped at `maxWaitMs: 4000ms`).
- Exits via an `80px` diagonal grid cell dissolve (`fadeDurationMs: 750ms`, max cell stagger `520ms`).
- Persists completion per browser session via `sessionStorage` (`omnira_initial_loader_seen`) and skips immediately under `prefers-reduced-motion: reduce`.

## Hero Headline Barrel (`src/components/motion/HeroHeadline.tsx`)

- Cycles `['interface', 'system', 'product', 'experience']` inside a 3D `rotateX` barrel (`perspective: 600px`, `translateZ: 22px`, `650ms cubic-bezier(0.76, 0, 0.24, 1)`, `3000ms` interval).
- Applies vertical `0deg` gradient `#ff6600 -> #ffe14a` via `background-clip: text`.
- Exposes a single `.sr-only` text readout so screen readers do not announce rotating duplicates, and renders static `EXPERIENCE` when reduced motion is preferred.

## Interactive Transitions and Counters

- `AnimatedCounter`: Smooth `requestAnimationFrame` ease-out count-up triggered once on viewport entry, resolving immediately under `prefers-reduced-motion: reduce`.
- `FAQItem`: Smooth CSS Grid row transition (`grid-template-rows: 0fr -> 1fr`) with `+` to `-` icon rotation (`180ms`) and unclipped answer text.
- `ProcessSection`, `ServiceSelector`, `TerminalPanel`, `ToolsSelector`, and `TestimonialsSection`: Deterministic state transitions without multi-thousand-pixel empty scroll spacers, keeping all sections immediately usable via click and keyboard.
