import type { ImageVariants } from '@/types';

export const PUBLIC_ASSETS = {
  fontsCss: '/assets/fonts/fonts.css',
  brand: {
    navLogo: '/assets/brand/omnira-logo-nav.svg',
    footerLogo: '/assets/brand/omnira-logo-footer.svg',
    favicon: '/assets/brand/omnira-favicon.svg',
    appleTouchIcon: '/assets/brand/omnira-apple-touch-icon.svg',
    profileSignature: '/assets/brand/profile-signature.svg',
    ogImage: {
      webp: '/assets/brand/omnira-og-image.webp',
      avif: '/assets/brand/omnira-og-image.avif',
      fallback: '/assets/brand/omnira-og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Omnira Futuristic Portfolio Preview',
    } satisfies ImageVariants,
  },
  textures: {
    darkGrain: {
      webp: '/assets/textures/omnira-dark-grain.webp',
      avif: '/assets/textures/omnira-dark-grain.avif',
      fallback: '/assets/textures/omnira-dark-grain.jpg',
      width: 4736,
      height: 3136,
      alt: 'Omnira dark grain surface texture',
    } satisfies ImageVariants,
    panelGrain: {
      webp: '/assets/textures/omnira-panel-grain.webp',
      avif: '/assets/textures/omnira-panel-grain.avif',
      fallback: '/assets/textures/omnira-panel-grain.png',
      width: 1448,
      height: 1086,
      alt: 'Omnira panel grain surface texture',
    } satisfies ImageVariants,
  },
  hero: {
    portraitDotMatrix: {
      webp: '/assets/images/hero/hero-portrait-dotmatrix.webp',
      avif: '/assets/images/hero/hero-portrait-dotmatrix.avif',
      fallback: '/assets/images/hero/hero-portrait-dotmatrix.png',
      width: 1254,
      height: 1254,
      alt: 'Futuristic designer portrait rendered in interactive halftone dot matrix',
    } satisfies ImageVariants,
  },
  about: {
    profilePortrait: {
      webp: '/assets/images/about/about-profile-portrait.webp',
      avif: '/assets/images/about/about-profile-portrait.avif',
      fallback: '/assets/images/about/about-profile-portrait.png',
      width: 1254,
      height: 1254,
      alt: 'Adrian Voss profile portrait',
    } satisfies ImageVariants,
  },
  icons: {
    arrowLeft: '/assets/icons/arrow-left.svg',
    arrowRight: '/assets/icons/arrow-right.svg',
    ratingStar: '/assets/icons/rating-star.svg',
  },
  partnerLogos: [
    { id: 'partner-logo-01', name: 'Partner 01', svgPath: '/assets/images/logos/partner-logo-01.svg', width: 108, height: 26 },
    { id: 'partner-logo-02', name: 'Partner 02', svgPath: '/assets/images/logos/partner-logo-02.svg', width: 106, height: 26 },
    { id: 'partner-logo-03', name: 'Partner 03', svgPath: '/assets/images/logos/partner-logo-03.svg', width: 124, height: 24 },
    { id: 'partner-logo-04', name: 'Partner 04', svgPath: '/assets/images/logos/partner-logo-04.svg', width: 133, height: 26 },
    { id: 'partner-logo-05', name: 'Partner 05', svgPath: '/assets/images/logos/partner-logo-05.svg', width: 153, height: 26 },
    { id: 'partner-logo-06', name: 'Partner 06', svgPath: '/assets/images/logos/partner-logo-06.svg', width: 113, height: 26 },
    { id: 'partner-logo-07', name: 'Partner 07', svgPath: '/assets/images/logos/partner-logo-07.svg', width: 106, height: 26 },
    { id: 'partner-logo-08', name: 'Partner 08', svgPath: '/assets/images/logos/partner-logo-08.svg', width: 109, height: 26 },
  ],
  servicesHomeLayers: [1, 2, 3, 4, 5].map(
    (n): ImageVariants => ({
      webp: `/assets/images/services/service-stack-home-layer-${n}.webp`,
      avif: `/assets/images/services/service-stack-home-layer-${n}.avif`,
      fallback: `/assets/images/services/service-stack-home-layer-${n}.png`,
      width: 1254,
      height: 1254,
      alt: `Home services isometric stack layer ${n}`,
    }),
  ),
  servicesAboutLayers: [1, 2, 3, 4, 5].map(
    (n): ImageVariants => ({
      webp: `/assets/images/services/service-stack-about-layer-${n}.webp`,
      avif: `/assets/images/services/service-stack-about-layer-${n}.avif`,
      fallback: `/assets/images/services/service-stack-about-layer-${n}.png`,
      width: 1254,
      height: 1254,
      alt: `About system isometric stack layer ${n}`,
    }),
  ),
  timeline: {
    '2020': makePngVariants('/assets/images/timeline/timeline-2020', 1254, 1254, 'Timeline 2020 - Design foundation'),
    '2021': makePngVariants('/assets/images/timeline/timeline-2021', 1254, 1254, 'Timeline 2021 - Product systems'),
    '2022': makePngVariants('/assets/images/timeline/timeline-2022', 1254, 1254, 'Timeline 2022 - Web evolution'),
    '2023': makePngVariants('/assets/images/timeline/timeline-2023', 1254, 1254, 'Timeline 2023 - Framer builds'),
    '2024': makePngVariants('/assets/images/timeline/timeline-2024', 1254, 1254, 'Timeline 2024 - Motion language'),
    '2025': makePngVariants('/assets/images/timeline/timeline-2025', 1254, 1254, 'Timeline 2025 - Creative direction'),
    '2026': makePngVariants('/assets/images/timeline/timeline-2026', 1254, 1254, 'Timeline 2026 - Sharper systems'),
  },
  testimonials: {
    slide1: makeJpgVariants('/assets/images/testimonials/testimonial-01-default', 2244, 2244, 'Marko Ivanov portrait'),
    slide2: makePngVariants('/assets/images/testimonials/testimonial-02-daniel-kim', 288, 288, 'Daniel Kim portrait'),
    slide3: makeJpgVariants('/assets/images/testimonials/testimonial-03-sarah-chen', 555, 555, 'Sarah Chen portrait'),
    slide4: makeJpgVariants('/assets/images/testimonials/testimonial-04-leon-hart', 541, 541, 'Leon Hart portrait'),
    slide5: makePngVariants('/assets/images/testimonials/testimonial-05-sofia-brand', 288, 288, 'Sofia Brand portrait'),
    slide6: makeJpgVariants('/assets/images/testimonials/testimonial-06-mira-klein', 504, 504, 'Mira Klein portrait'),
  },
  projectFallback: makeJpgVariants(
    '/assets/images/projects/project-card-default-fallback',
    1600,
    1200,
    'Default project showcase preview',
  ),
} as const;

function makePngVariants(base: string, width: number, height: number, alt: string): ImageVariants {
  return {
    webp: `${base}.webp`,
    avif: `${base}.avif`,
    fallback: `${base}.png`,
    width,
    height,
    alt,
  };
}

function makeJpgVariants(base: string, width: number, height: number, alt: string): ImageVariants {
  return {
    webp: `${base}.webp`,
    avif: `${base}.avif`,
    fallback: `${base}.jpg`,
    width,
    height,
    alt,
  };
}

export function getProjectCoverVariants(
  slug: string,
  title: string,
  fallbackExt: 'jpg' | 'png' = 'jpg',
): ImageVariants {
  const base = `/assets/images/projects/${slug}-cover`;
  return {
    webp: `${base}.webp`,
    avif: `${base}.avif`,
    fallback: `${base}.${fallbackExt}`,
    width: 1600,
    height: 1200,
    alt: `${title} website showcase preview`,
  };
}
