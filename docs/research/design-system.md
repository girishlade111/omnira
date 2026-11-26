# Omnira Design System Specification

**Classification Legend:** `VERIFIED` (code/DOM/stylesheet verified), `BROWSER-MEASURED` (live Playwright `getComputedStyle` / `getBoundingClientRect`), `SCREENSHOT-OBSERVED` (inspected in captured PNGs).

**Primary Sources:**
- `research/reference/design-system/colors/tokens.json`
- `research/reference/design-system/raw-design-system-forensics.json`
- `research/reference/design-system/geometry/layout-breakpoints.json`
- `research/reference/design-system/design-system-forensics.md`

---

## 1. Color Token Architecture (`VERIFIED`, `BROWSER-MEASURED`)

Omnira uses a pure-black `#000000` canvas paired with dark charcoal/slate surfaces, subtle translucent white overlays (`1%` to `10%` opacity), crisp `#ff9800` amber accents, and `#80b82c` status green indicators. While individual Framer code components specify `#ffd400` in their `defaultProps` fallback, `:root` overrides `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37` to `#ff9800` across every rendered page (`VERIFIED`).

| Token Category | Semantic Role | Value | Framer Token ID |
| --- | --- | --- | --- |
| Canvas | Primary page background | `#000000` | `--token-f962e50e-0b00-41fe-a53c-89367ecb1ae3` |
| Canvas | Elevated dark card / footer strip | `#0d0d0d` | `BROWSER-MEASURED` |
| Canvas | Terminal surface | `#121218` | `--token-9eeddc74-3981-48ed-b1f6-db9260f54e0b` |
| Canvas | Dark slate accent surface | `#242734` | `--token-3f6952e7-0bb9-4b60-98e1-3004894f3df7` |
| Canvas | Dark slate translucent | `rgba(36, 39, 52, 0.50)` | `--token-241af6ed-d665-433f-9a8d-5dc83d8283f5` |
| Surface | Subtle card fill (1% white) | `rgba(255, 255, 255, 0.01)` | `--token-edf0a184-db09-4403-a27f-9e566ce06127` |
| Surface | Card fill (3% white) | `rgba(255, 255, 255, 0.03)` | `--token-edf0a184-db09-4403-a27f-9e566ce06127` |
| Surface | Elevated card fill (5% white) | `rgba(255, 255, 255, 0.05)` | `--token-cc5d68f7-fe29-4c80-849d-13496d297c3b` |
| Surface | Amber badge fill (3% amber) | `rgba(255, 152, 0, 0.03)` | `--token-69b07e5e-cb91-426f-93b6-d0cd51adc8a6` |
| Surface | Amber highlight fill (10% amber) | `rgba(255, 152, 0, 0.10)` | `--token-dc89defa-3265-4b06-964c-f773fd849997` |
| Text | Primary text | `#ffffff` | `--token-13b18929-c48d-4ed4-8752-b075d7d165c4` |
| Text | Secondary body text (70% white) | `rgba(255, 255, 255, 0.70)` | `--token-9532276e-e0f6-48ef-aa02-0100b8fa5f98` |
| Text | Muted / inactive text (30% white) | `rgba(255, 255, 255, 0.30)` | `--token-8fb1d2a7-4661-404b-bd2e-3d2ecb542fcf` |
| Text | Text on primary amber CTA | `#000000` | `--token-f962e50e-0b00-41fe-a53c-89367ecb1ae3` |
| Accent | Primary amber / orange | `#ff9800` | `--token-cb86c361-33be-47d3-86fd-5eb54d5dcd37` |
| Accent | Amber border (30% / 50%) | `rgba(255, 152, 0, 0.30)` / `0.50` | `--token-1d1219df-...`, `--token-09e9e3e3-...` |
| Accent | Headline gradient stops | `linear-gradient(0deg, #ff6600, #ffe14a)` | `--token-2f395c80-...`, `--token-24362e6d-...` |
| Accent | Status indicator green | `#80b82c` | `--token-2bae69df-d74c-45f2-9a8e-c4c44960067e` |
| Accent | Status halo green (20% / 5%) | `rgba(109, 157, 39, 0.20)` / `0.05` | `--token-e40ca599-...`, `--token-18c82374-...` |
| Accent | Error / danger red | `#ff2f24` | `--token-8ae91014-7686-45fc-8d87-632cbafca936` |
| Border | Structural hairline (10% white) | `rgba(255, 255, 255, 0.10)` | `--token-c8f36d0d-c2a0-4712-a2a0-22eecb5652cd` |
| Border | Subtle frame border (30% white) | `rgba(255, 255, 255, 0.30)` | `--token-8fb1d2a7-4661-404b-bd2e-3d2ecb542fcf` |

---

## 2. Layout Grid, Frame Geometry & Spacing (`BROWSER-MEASURED`)

- **Outer Frame:** `max-width: 1400px` centered horizontally (`x: 260..1660` at `1920x1080`; `x: 20..1420` at `1440x900`; `100%` width below `1400px`).
- **Side Rails:** Paired left and right diagonal-hatched rails separated from the main column by `1px solid rgba(255, 255, 255, 0.10)` vertical borders:
  - Desktop (`>= 1200px`): `96px` each (`95px` stripe + `1px` border), yielding `1208px` inner width at `1440px` (`1088px` at `1280px`).
  - Tablet (`810px` to `1199.98px`): `48px` each (`47px` stripe + `1px` border), yielding `928px` inner width at `1024px`.
  - Mobile (`<= 809.98px`): `16px` each (`15px` stripe + `1px` border), yielding `736px` at `768px`, `358px` at `390px`, `288px` at `320px`.
- **Section Padding:** `96px` on Desktop (`>= 1200px`), `80px 48px` on Tablet (`810px..1199.98px`), `64px 16px` on Mobile (`<= 809.98px`).
- **Header Height:** Fixed/sticky `~84px` (`padding: 24px` desktop, `12px 16px` mobile) containing `OMNIRA` mark (`112x24` mobile, `115x24` desktop), 4 uppercase nav links, and `LET'S TALK` (`103x36`).

---

## 3. Component Visual Primitives (`VERIFIED`, `SCREENSHOT-OBSERVED`)

- **TechnicalBadge (`Elements/Badge`):** `padding: 4px 12px`, `Chakra Petch` `14px/20px` uppercase. Framed by 4 SVG L-shaped corner brackets (`cornerSize: 4px`, `thickness: 1px`, `inset: 1px`, `glow: false`). Two variants: `Yellow` (`#ff9800` text + brackets, `rgba(255, 152, 0, 0.03)` background) and `White` (`#ffffff` text + brackets, `rgba(255, 255, 255, 0.03)` background).
- **Chamfered Panels (`NotchBox`):** SVG vector polygons sized via `ResizeObserver` (`cornerCut`: `12px`, `11px`, `9px`, `8px`, `6px`, `5px`, `4px`) with optional side notches (`8px` depth), SVG blur glows, and screen-blended dark grain.
- **Buttons:** Primary `#ff9800` (`VIEW WORKS`, `138x44`, `padding: 10px 20px`, `cornerCut: 6px`), Secondary dark (`EXPLORE PROCESS`, `184x44`, `0.5px` stroke `rgba(255,255,255,0.70)`), Header CTA (`LET'S TALK`, `103x36`, `padding: 6px 16px`), all revealing 4 `6x6` corner triangles on hover.
- **Icon Badges (`56x56`, `padding: 12px`):** Square containers framed by 4 SVG corner brackets (`#ff9800` when active, muted `#ffffff` when inactive).
