import type { PricingSectionContent } from '@/types';

export const pricingContent: PricingSectionContent = {
  badge: 'PRICING',
  heading: 'PACKAGES',
  description:
    'Choose a focused package for sharp interfaces, polished Framer builds, and launch-ready digital experiences.',
  tiers: [
    {
      id: 'starter',
      planName: 'STARTER',
      featured: false,
      description: 'For focused landing pages',
      priceUsd: 1200,
      formattedPrice: '$1,200',
      currency: 'USD',
      features: [
        'Landing page',
        'Framer build',
        'Responsive layout',
        'Basic interactions',
        'Launch support',
      ],
      ctaLabel: "LET'S CONNECT",
      ctaHref: '/contact?plan=starter',
    },
    {
      id: 'pro',
      planName: 'PRO',
      featured: true,
      description: 'Complete website system',
      priceUsd: 2400,
      formattedPrice: '$2,400',
      currency: 'USD',
      features: [
        'Multi-page website',
        'Design system setup',
        'CMS structure',
        'Advanced interactions',
        'Launch optimization',
      ],
      ctaLabel: "LET'S CONNECT",
      ctaHref: '/contact?plan=pro',
    },
    {
      id: 'custom',
      planName: 'Custom',
      featured: false,
      description: 'Advanced systems and CMS',
      priceUsd: 4800,
      formattedPrice: '$4,800',
      currency: 'USD',
      features: [
        'Custom page structure',
        'Complex CMS',
        'Motion direction',
        'Component library',
        'Ongoing support',
      ],
      ctaLabel: "LET'S CONNECT",
      ctaHref: '/contact?plan=custom',
    },
  ],
  assuranceStrip: [
    {
      id: 'secure',
      title: 'SECURE',
      subtitle: 'Safe project handling',
    },
    {
      id: 'fast-delivery',
      title: 'FAST DELIVERY',
      subtitle: 'On-time, every time',
    },
    {
      id: 'process',
      title: 'PROCESS',
      subtitle: 'Simple focused workflow',
    },
    {
      id: 'support',
      title: 'SUPPORT',
      subtitle: 'Help after launch',
    },
  ],
};
