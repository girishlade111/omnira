# Omnira Design System & Geometry Forensics

**Method:** Live Playwright `getComputedStyle` & `getBoundingClientRect` across 7 breakpoints (`1920x1080`, `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, `320x700`), user-provided screenshot pixel analysis (`1910px` captures), and Framer chunk verification.

---

## 1. Frame Architecture & Side Rails

The page is framed by a `max-width: 1400px` outer HUD container centered horizontally on wide viewports (`>= 1400px`), bounded on left and right by fixed-width diagonal-striped rails separated from the main content column by `1px solid rgba(255, 255, 255, 0.10)` vertical borders.

| Breakpoint | Viewport | Outer Frame Width | Side Rail Width (Each) | Stripe Area + Border | Main Inner Content Width | Section Padding |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop (`>= 1200px`) | `1920x1080` | `1400px` (`x: 260..1660`) | `96px` | `95px` + `1px` | `1208px` | `96px` |
| Desktop (`>= 1200px`) | `1440x900` | `1400px` (`x: 20..1420`) | `96px` | `95px` + `1px` | `1208px` | `96px` |
| Desktop (`>= 1200px`) | `1280x800` | `1280px` (`x: 0..1280`) | `96px` | `95px` + `1px` | `1088px` | `96px` |
| Tablet (`810..1199.98px`) | `1024x768` | `1024px` (`x: 0..1024`) | `48px` | `47px` + `1px` | `928px` | `80px 48px` |
| Mobile (`<= 809.98px`) | `768x1024` | `768px` (`x: 0..768`) | `16px` | `15px` + `1px` | `736px` | `64px 16px` |
| Mobile (`<= 809.98px`) | `390x844` | `390px` (`x: 0..390`) | `16px` | `15px` + `1px` | `358px` | `64px 16px` |
| Mobile (`<= 809.98px`) | `320x700` | `320px` (`x: 0..320`) | `16px` | `15px` + `1px` | `288px` | `64px 16px` |

### Side Rail Exact CSS
- **Mechanism:** Pure CSS `repeating-linear-gradient` (not SVG or raster image), `opacity: 1`.
- **Gradient:** `repeating-linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 4px)`
- **Geometry:** `145deg` diagonal angle, `1px` stripe thickness, `3px` transparent gap, `4px` total period.
- **HUD Divider Hatch:** Hero bottom bar (`630.97px x 2px`) and Footer divider (`217.41px x 2px`) use `repeating-linear-gradient(72deg, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 1px, rgba(255, 255, 255, 0.3) 1px, rgba(255, 255, 255, 0.3) 2px)` at `opacity: 0.55`.

---

## 2. Color Tokens

| Token Role | Exact Value | Framer `:root` Token ID |
| --- | --- | --- |
| Primary Canvas | `#000000` | `--token-f962e50e-0b00-41fe-a53c-89367ecb1ae3` |
| Elevated Dark / Terminal | `#121218` / `#0d0d0d` | `--token-9eeddc74-3981-48ed-b1f6-db9260f54e0b` |
| Dark Slate Surface | `#242734` / `rgba(36,39,52,0.5)` | `--token-3f6952e7-0bb9-4b60-98e1-3004894f3df7` |
| Translucent Card Surface | `rgba(255,255,255,0.01)` / `0.03` / `0.05` | `--token-edf0a184-...`, `--token-cc5d68f7-...` |
| Primary Amber Accent | `#ff9800` | `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37` |
| Amber Translucent / Border | `rgba(255,152,0,0.03)` / `0.10` / `0.30` / `0.50` | `--token-69b07e5e-...`, `--token-dc89defa-...`, `--token-1d1219df-...`, `--token-09e9e3e3-...` |
| Rotating Headline Gradient | `linear-gradient(0deg, #ff6600, #ffe14a)` | `--token-2f395c80-...` -> `--token-24362e6d-...` |
| Text Primary / Secondary / Muted | `#ffffff` / `rgba(255,255,255,0.70)` / `rgba(255,255,255,0.30)` | `--token-13b18929-...`, `--token-9532276e-...`, `--token-8fb1d2a7-...` |
| Hairline Border | `rgba(255,255,255,0.10)` | `--token-c8f36d0d-c2a0-4712-a2a0-22eecb5652cd` |
| Status Green / Pulse Glow | `#80b82c` / `rgba(109,157,39,0.20)` / `rgba(109,157,39,0.05)` | `--token-2bae69df-...`, `--token-e40ca599-...`, `--token-18c82374-...` |

Note: Individual Framer code components carry `#ffd400` in `defaultProps`, which is overridden at `:root` across all pages to `#ff9800`.

---

## 3. Chamfered Panels & `TechnicalBadge` Geometry

Chamfered frames are **NOT** CSS `clip-path: polygon(...)` on HTML divs — they are rendered by an inline `<svg>` overlay (`G` / `NotchBox` in `shared-lib`) measured via `ResizeObserver` so border strokes, corner cuts, trapezoidal notches, inner/outer SVG blur glows, and clipped grain textures remain crisp at every size:

- **Outer Hero Frame (`1400x906`):** `cornerCut: 12px`, 1 trapezoidal notch (`notchDepth: 8px`) per side, `stroke: rgba(255,152,0,0.30)`, grain enabled.
- **Large Cards (Process, Pricing, Project Cards, Contact Form, Footer):** `cornerCut: 12px` (`11px` on Featured Work outer card), `notchDepth: 8px` on left/right of Process cards. Active Process card uses `#ff9800` stroke + `glowStrength: 8`, `innerGlowOpacity: 0.2`, `outerGlowOpacity: 0.1`.
- **Buttons:**
  - `Primary | md` (`VIEW WORKS`, `138x44`, `padding: 10px 20px`): `cornerCut: 6px` (`9px` on About CTA), fill `#ff9800`, text `#000000`.
  - `Secondary | md` (`EXPLORE PROCESS`, `184x44`, `padding: 10px 20px`): `cornerCut: 6px`, `strokeWidth: 0.5px`, `stroke: rgba(255,255,255,0.70)`.
  - `Secondary | sm` (`LET'S TALK` header, `103x36`, `padding: 6px 16px`): `cornerCut: 6px`.
  - Hover state illuminates 4 small corner triangles (`6x6` right triangles at each corner) via an overlay `<svg>`.
- **Medium Panels & Pills:** `cornerCut: 8px` (System Stack cards, Nav containers, Footer strips), `cornerCut: 5px` (Testimonial avatars), `cornerCut: 4px` (form inputs, small pills, Terminal steps).
- **`TechnicalBadge` (`Elements/Badge`):** `padding: 4px 12px`, `Chakra Petch` `14px/20px` uppercase. Brackets are **4 SVG L-shaped corner paths** (`cornerSize: 4px`, `thickness: 1px`, `inset: 1px`, `glow: false`) in `#ff9800` (Yellow variant, `rgba(255,152,0,0.03)` bg) or `#ffffff` (White variant, `rgba(255,255,255,0.03)` bg).

---

## 4. Dark Grain Texture (`clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg`)

- **Source:** `4736x3136` high-resolution dark noise/grain JPEG (`clI6TcTdwfgaDLeA7qOuGlEUTCY.jpg`).
- **Usage in Chamfered Panels:** Rendered as an `<svg><image href="..." preserveAspectRatio="xMidYMid slice" opacity="0.8" style="mix-blend-mode: screen" clip-path="url(#sci-fi-clip-...)" /></svg>` clipped inside each chamfered panel's exact polygon path.
- **Usage in Section Backdrops:** Rendered as an `<img>` (`object-fit: fill`, `opacity: 1`, `mix-blend-mode: normal`) inside About/Home dark card containers.
