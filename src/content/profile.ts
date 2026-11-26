import { PUBLIC_ASSETS } from '@/lib/assets';
import type { AboutPreviewContent, ProfileData } from '@/types';

export const aboutPreviewContent: AboutPreviewContent = {
  badge: 'ABOUT ME',
  headingPrefix: 'OMNIRA',
  statusBadge: 'OPEN FOR WORK',
  headline:
    'I create high-impact websites and product interfaces shaped by strategy, systems, and clean execution.',
  stats: [
    { id: 'stat-years', label: 'YEARS', value: 6, suffix: '+' },
    { id: 'stat-projects', label: 'PROJECTS', value: 40, suffix: '+' },
    { id: 'stat-clients', label: 'CLIENTS', value: 10, suffix: 'K+' },
  ],
  tagline: 'Built for bold digital experiences.',
  capabilities: [
    { code: '01', text: 'Clear interfaces with strong hierarchy' },
    { code: '02', text: 'Scalable systems built for growth' },
    { code: '03', text: 'Fast builds with polished interactions' },
    { code: '04', text: 'Distinct visuals with future energy' },
  ],
  ctaLabel: 'ABOUT ME',
  ctaHref: '/about',
  worldwideBadge: 'WORKING WORLDWIDE',
};

export const profileContent: ProfileData = {
  heroBadge: 'PROFILE SYSTEM',
  heroTitle: 'OMNIRA',
  heroDescription:
    'I craft futuristic websites and digital experiences that combine clean aesthetics with powerful interactions. Every project is built with purpose, precision, and a focus on what truly matters.',
  availabilityLabel: 'OPEN FOR WORK',
  focusLabel: 'FOCUS',
  focusValue: 'Web design, UI/UX, Framer development, Design system',
  toolsLabel: 'TOOLS',
  toolsSummary: 'Figma, Framer, GSAP, SPLINE, THREE.JS, WEBFLOW',
  portrait: PUBLIC_ASSETS.about.profilePortrait,
  signatureSvgPath: PUBLIC_ASSETS.brand.profileSignature,
  stats: [
    { id: 'about-stat-years', label: 'YEARS', value: 6, suffix: '+' },
    { id: 'about-stat-projects', label: 'PROJECTS', value: 40, suffix: '+' },
    { id: 'about-stat-clients', label: 'CLIENTS', value: 10, suffix: 'K+' },
  ],
  aboutBadge: 'ABOUT ME',
  biographyParagraphs: [
    "I'm Adrian Voss, an interface designer and Framer developer based in Berlin, Germany, creating futuristic websites for bold brands and independent creators.",
    'My work blends visual direction, interaction design, and clean development to build digital experiences that feel sharp, immersive, and easy to use.',
    'I care about clarity, structure, motion, and meaningful details, turning ideas into interfaces that look distinctive and perform with purpose.',
  ],
  details: [
    { label: 'NAME', value: 'Adrian Voss' },
    { label: 'Role', value: 'Graphic designer' },
    { label: 'Focus', value: 'Web design' },
    { label: 'EXPERIENCE', value: '6+ years' },
    { label: 'LOCATION', value: 'Germany, Berlin' },
  ],
  readyToLaunchHeading: 'READY TO LAUNCH',
  servicesLowerStrip: ['STRATEGY', 'DESIGN', 'DEVELOPMENT', 'IMPACT'],
  aboutServices: [
    {
      code: '01',
      title: 'Design',
      description: 'Websites, landing pages, and product interfaces.',
      deliverables: [
        'UX structure',
        'Visual hierarchy',
        'Responsive layouts',
        'Interaction-ready',
      ],
    },
    {
      code: '02',
      title: 'Development',
      description: 'Fast, responsive Framer builds ready to launch.',
      deliverables: [
        'Component setup',
        'CMS structure',
        'Smooth interactions',
        'Launch optimization',
      ],
    },
    {
      code: '03',
      title: 'VISUAL SYSTEM',
      description: 'Reusable styles, components, and interface rules.',
      deliverables: [
        'Design tokens',
        'UI components',
        'Style guidelines',
        'Consistent layouts',
      ],
    },
    {
      code: '04',
      title: 'CREATIVE',
      description: 'Strong concepts and visual systems for bold brands.',
      deliverables: [
        'Art direction',
        'Motion ideas',
        'Brand atmosphere',
        'Visual storytelling',
      ],
    },
  ],
  terminal: {
    badge: 'TERMINAL',
    heading: 'PROCESS SYSTEM',
    description:
      'Every step is built to keep the work clear, responsive, and ready to perform before launch.',
    statusLabel: 'STATUS:',
    statusValue: 'IN PROGRESS',
    steps: [
      {
        step: '01',
        label: 'INPUT',
        description: 'Understand your goals, audience and context',
      },
      {
        step: '02',
        label: 'STRATEGY',
        description: 'Analyze the market, competitors and opportunities.',
      },
      {
        step: '03',
        label: 'STRUCTURE',
        description: 'Build the information architecture and user flow.',
      },
      {
        step: '04',
        label: 'INTERFACE',
        description: 'Design the UI system, layouts and interactions.',
      },
      {
        step: '05',
        label: 'LAUNCH',
        description: 'Build in Framer, test thoroughly and deliver.',
      },
    ],
    commandPrompt: 'omnira@terminal: -$',
    commandTextDesktop: 'purpose + structure + clarity = impact',
    commandTextMobile: 'purpose',
    enterLabel: 'ENTER',
    outputLabel: 'OUTPUT',
    systemCheckLabel: 'SYSTEM CHECK',
    systemCheckStatus: '[ALL OK]',
    summaryLine: 'Polished interface system',
    checks: [
      { label: 'CLARITY', status: 'OK' },
      { label: 'RESPONSIVE', status: 'OK' },
      { label: 'MOTION', status: 'OK' },
      { label: 'Performance', status: 'OK' },
    ],
    isometricStackLayers: PUBLIC_ASSETS.servicesAboutLayers,
  },
};
