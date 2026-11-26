# Components

## Primitives (`src/components/primitives/`)

- `ChamferedPanel`: Measures element dimensions via `ResizeObserver` and renders an SVG polygon perimeter with configurable `cornerCut`, optional center notches (`hasTopNotch`, `hasBottomNotch`, `hasLeftNotch`, `hasRightNotch`), optional SVG-clipped `omnira-dark-grain.webp` `screen` overlay, and hover border transition.
- `ChamferedButton`: Supports `primary`, `outline`, and `secondary` variants in `sm`, `md`, and `lg` sizes across `<Link>`, `<a>`, and `<button>` elements with 6px chamfered corners, optional 6px corner triangles, loading spinner, disabled, selected, and error states.
- `TechnicalBadge`: `4px 12px` HUD label with four 4px SVG L-brackets (`CornerMarker`).
- `StatusIndicator`: 12x12 pulsing beacon paired with label and value.
- `SectionHeading`: Split or left-aligned heading block with `TechnicalBadge`, Orbitron `titleWhite` + `OrangeText`, optional horizontal orange rule, and muted description.
- `AnimatedCounter`: Viewport-triggered numeric counter (`IntersectionObserver`) supporting `6+`, `40+`, `10K+`, `4`, `100%`, and static symbol `infinity` with `prefers-reduced-motion` immediate settlement.
- `CornerMarker`, `HatchedPattern`, `NoiseOverlay`, `OrangeText`, `GradientText`, `ExternalLinkIndicator`, `TechnicalDivider`.

## Layout and Shared Sections (`src/components/layout/`, `src/components/common/`)

- `SiteFrame` and `SectionFrame`: Outer `1400px` frame with responsive `repeating-linear-gradient(145deg, ...)` side rails (`16px` mobile, `48px` tablet >=810px, `96px` desktop >=1200px) and `1px` vertical boundary lines.
- `SiteHeader`, `DesktopNavigation`, `MobileNavigation`: Sticky blurred navigation bar with `OmniraLogo`, active `#ff9800` link marker, `LET'S TALK` CTA, and accessible mobile drawer.
- `SiteFooter` (`FooterCTA`, `SocialPanel`, `LiveClock`, `FooterStatusBar`, `FooterNavigation`): Upper chamfered CTA panel (`cornerCut: 12`, top/bottom notches), `LET'S CONNECT` panel, `Europe/Berlin` 12-hour `LiveClock` with seconds, and lower chamfered navigation bar (`(c) MADE IN STYLOKIT`).
- `ProjectCard`, `TestimonialsSection`, `ClientRating`, `PartnerLogoPanel`, `FAQSection`, `FAQItem`, `ContactSupportCard`.

## Page Modules

- `src/components/home/`: `Hero`, `SelectedWorks`, `ProcessSection`, `ProcessPhaseCard`, `ProcessMetrics`, `AboutPreview`, `CapabilityCard`, `ServiceSelector`, `PricingSection`, `PricingCard`.
- `src/components/works/`: `WorksCatalog`, `WorksFilterBar`.
- `src/components/about/`: `ProfileHero`, `BiographySection`, `ProfileDetails`, `TerminalPanel`, `ServicesGrid`, `CareerTimeline`, `ToolsSelector`.
- `src/components/contact/`: `ContactHero`, `ContactStatus`, `ContactInfoCard`, `TechnicalSelect` (custom ARIA combobox/listbox, no native `<select>`), `ProjectInquiryForm`.
