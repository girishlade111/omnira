import { PUBLIC_ASSETS } from '@/lib/assets';
import type { ServicesSectionContent } from '@/types';

export const servicesContent: ServicesSectionContent = {
  badge: 'CORE SERVICES',
  heading: 'WHAT I CREATE',
  description:
    'High-impact services for sharp interfaces, visual systems, and polished Framer execution.',
  items: [
    {
      id: 'service-design',
      index: 1,
      code: '01',
      layer: 1,
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
      id: 'service-development',
      index: 2,
      code: '02',
      layer: 2,
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
      id: 'service-visual-system',
      index: 3,
      code: '03',
      layer: 3,
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
      id: 'service-creative',
      index: 4,
      code: '04',
      layer: 4,
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
  isometricStackLayers: PUBLIC_ASSETS.servicesHomeLayers,
};
