import type { SiteConfig } from '@/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const siteConfig: SiteConfig = {
  studioName: 'OMNIRA',
  brandTitle: 'Omnira',
  ownerName: 'Adrian Voss',
  roleTitle: 'Interface Designer & Framer Developer',
  siteUrl,
  description:
    'Omnira is a dark futuristic portfolio with cinematic visuals, sharp typography, and high-tech interface details.',
  email: 'hello@omnira.studio',
  location: 'Berlin, Germany',
  clockLabel: 'LOCAL TIME:',
  clockRegion: 'Germany, Berlin',
  clockTimeZone: 'Europe/Berlin',
  clockFormat: '12h',
  clockShowSeconds: true,
  copyrightText: '(c) MADE IN STYLOKIT',
  statusLabel: 'STATUS:',
  statusValue: 'OPEN FOR WORK',
  ctaSection: {
    heading: 'Lets talk about your project',
    description:
      "I'm currently available for select projects and collaborations. Let's create digital experiences that leave a lasting impact.",
    buttonLabel: "LET'S CONNECT",
    buttonHref: '/contact',
    statusBadge: 'OPEN FOR WORK',
  },
  notFound: {
    badge: 'ERROR',
    code: '404',
    heading: 'PAGE NOT FOUND',
    description:
      "The page you're looking for doesn't exist or has been moved to another dimension.",
    primaryCtaLabel: 'BACK TO HOME',
    primaryCtaHref: '/',
    secondaryCtaLabel: 'Contact me',
    secondaryCtaHref: '/contact',
  },
  hero: {
    badge: 'INTERFACE DESIGNER',
    headlinePrefix: 'Design beyond the',
    rotatingWords: ['interface', 'system', 'product', 'experience'],
    rotationIntervalMs: 3000,
    rotationDurationMs: 650,
    description:
      'I design and build futuristic digital experiences with cinematic visuals, sharp layouts, and high-tech interactions. My work blends strategy, creativity, and clean execution to create portfolios that feel bold, immersive, and unforgettable.',
    primaryCtaLabel: 'VIEW WORKS',
    primaryCtaHref: '/works',
    secondaryCtaLabel: 'EXPLORE PROCESS',
    secondaryCtaHref: '/#process',
    statusText: 'AVAILABLE FOR HIRE',
    scrollHint: 'SCROLL TO EXPLORE',
  },
  navLinks: [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT', href: '/about' },
    { label: 'WORKS', href: '/works' },
    { label: 'CONTACT', href: '/contact' },
  ],
  navCta: {
    label: "LET'S CONNECT",
    href: '/contact',
  },
  socialLinks: [
    { label: 'Email', href: 'mailto:hello@omnira.studio' },
    { label: 'X', href: 'https://x.com/Dmytri_Design' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dmytri-design/' },
  ],
  demonstrationMode: {
    useLocalAssets: true,
    worksInitialPageSize: 12,
    enableContactFormDemoFallback: true,
  },
};
