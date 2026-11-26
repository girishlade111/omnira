# Omnira Scroll-Scene Forensics & Dark-Band Investigation

**Classification Legend:** `VERIFIED` (Framer CSS/scroll-target code verified), `BROWSER-MEASURED` (live 5%/10% scroll snapshots in Playwright), `SCREENSHOT-OBSERVED` (inspected in user-provided & captured PNGs).

**Primary Sources:**
- `research/reference/motion/home-scroll-5pct.json`
- `research/reference/motion/process-services-forensics.json`
- `research/reference/motion/about-scroll-10pct.json`
- `research/reference/motion/scroll-scenes-analysis.md`

---

## 1. Why the User-Provided Homepage Screenshot Has Long Dark Regions (`VERIFIED`, `BROWSER-MEASURED`)

Pixel-brightness scanning of the user-provided full-page screenshot (`screencapture-omnira-framer-website-2026-11-26-09_53_46.png`, `1910x17187`) revealed two huge solid-black bands:
1. **`y = 3200..7700` (`4500px` height)** around the **Process** section.
2. **`y = 9580..13310` (`3730px` height)** around the **Services** section.

Live Playwright 5% scroll sampling (`1440x900`, `scrollHeight: 15683px`) and Framer CSS/chunk inspection prove the exact structural cause: on Desktop (`>= 1200px`), **both Process and Services place a `position: sticky` viewport panel above 4 tall, empty `#000000` scroll-section spacer divs (`370vh` to `470vh`)**:

1. **Process Scroll-Track (`framer-tf15jr`):**
   - Sticky viewport box (`.framer-1h46l7m`): `height: 100vh`, `position: sticky`, `top: 0px`, `padding: 96px`, `z-index: 2`.
   - Followed by 4 invisible scroll-section trigger divs: `.framer-1rr8kft`, `.framer-c9zbed`, `.framer-5j3qoa` (`100vh` each) + `.framer-jgi6vj` (`70vh`).
   - In `home-scroll-5pct.json`, `"Content (Sticky)"` stays pinned at `yViewport = 0` (`height: 900px`) from `15%` (`scrollY = 2217`) through `40%` (`scrollY = 5913`).
   - When a full-page browser extension (such as GoFullPage) scrolls and stitches the page, `sticky` positioning keeps the Process panel pinned at the top of its track (or is neutralized after the initial frame), exposing the `~4500px` empty `#000000` scroll-spacer track underneath!

2. **Services Scroll-Track (`framer-laqeih`):**
   - Sticky content box (`.framer-utv0xo`): `position: sticky`, `top: 96px`, `z-index: 1`, `height: 747px`.
   - Followed by 4 invisible scroll-section trigger divs (`:LttSpfmKi`, `:VswhjuzAp`, `:JWhYXjp5J`, `:FuDG6vusW`): `.framer-rczxcj` (`70vh`) + `.framer-nv5h89`, `.framer-xp5tw1`, `.framer-qihe90` (`100vh` each) = `370vh` (`~3730px` at a ~`1000px` capture viewport).
   - In `home-scroll-5pct.json`, Services `"Content"` stays pinned at `yViewport = 96` from `60%` (`scrollY = 8870`) through `75%` (`scrollY = 11087`).

---

## 2. Home 5% Scroll Trace (`1440x900`, `BROWSER-MEASURED`)

| Scroll % | `scrollY` | Pinned Sticky Element | Active WAAPI Animations | Active Section / Visual State |
| --- | --- | --- | --- | --- |
| `0%..10%` | `0..1478` | None yet (`Process` at `y=2048..570`) | `10..11` | Hero (`y=0`) + Selected Work 6-card grid (`y=1478`) |
| `15%..40%` | `2217..5913` | `Process Content (Sticky)` pinned at `y=0` (`900px`) | `10..11` | Phases `01..04` (`DISCOVER -> DESIGN -> BUILD -> REFINE`) highlight sequentially; metrics count `PHASES 1->4`, `PRECISION 87%->99%->100%` |
| `45%..55%` | `6652..8131` | Process unpins (`y=-374..-1853`), About Preview reveals | `10..11` | About Preview (`6+`, `40+`, `10K+`, 4 Bento cards) |
| `60%..75%` | `8870..11087` | `Services Content` pinned at `y=96` (`747px`) | `8..97` | Services switches variants (`DESIGN` -> `DEVELOPMENT` -> `VISUAL SYSTEM` -> `CREATIVE`) and illuminates matching layer `1..4` in the 4-layer isometric stack |
| `80%..100%` | `11826..14783` | Services unpins (`y=-257..-3214`) | `8..9` | Testimonials (`y~12736`), Pricing (`y~13305`), FAQ (`y~14009`), Footer (`y~14783`) |

---

## 3. Tablet, Mobile & `/about` Timeline (`VERIFIED`, `BROWSER-MEASURED`)

- **Tablet & Mobile Services:** At `<= 1199.98px`, `.framer-utv0xo` switches to `position: relative; top: unset;` and removes the `370vh` scroll spacers (reducing `/` `scrollHeight` from `15683px` at `1440x900` to `11073px` at `1024x768`). Tabs switch via click.
- **About Timeline (`2020..2026`):** `/about` (`scrollHeight: 7265px` at `1440x900`) maintains `1` sticky container across `0%..100%` scroll increments (`about-scroll-10pct.json`), progressively highlighting milestone cards `2020` through `2026`.
- **Implementation Note for Next.js Rebuild:** Avoid leaving blank multi-thousand-pixel dark voids in static full-page screenshots by keeping scroll-pinned scenes tightly bounded (`scroll-section` height proportional and visually anchored) or supporting clean progressive reveal without dead black tracks.
