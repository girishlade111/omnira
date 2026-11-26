import { PUBLIC_ASSETS } from '@/lib/assets';
import type { TimelineSectionContent } from '@/types';

export const timelineContent: TimelineSectionContent = {
  badge: 'TIMELINE ARCHIVE',
  heading: 'TIMELINE ARCHIVE',
  description:
    'A timeline of design, development, and creative direction, shaped through systems, motion, and launch-ready digital work.',
  items: [
    {
      id: 'timeline-1',
      year: '2020',
      title: 'Design foundation',
      description:
        'Began my journey in UI/UX design, crafting interfaces that are clean, intuitive and user-focused.',
      image: PUBLIC_ASSETS.timeline['2020'],
    },
    {
      id: 'timeline-2',
      year: '2021',
      title: 'Product systems',
      description:
        'Started building visual systems, reusable layouts, and scalable design patterns for consistent digital experiences.',
      image: PUBLIC_ASSETS.timeline['2021'],
    },
    {
      id: 'timeline-3',
      year: '2022',
      title: 'Web evolution',
      description:
        'Expanded from static interface design into responsive websites, interactive layouts, and polished digital storytelling.',
      image: PUBLIC_ASSETS.timeline['2022'],
    },
    {
      id: 'timeline-4',
      year: '2023',
      title: 'Framer builds',
      description:
        'Specialized in Framer builds, motion, CMS structure, and fast launch-ready websites with clean execution.',
      image: PUBLIC_ASSETS.timeline['2023'],
    },
    {
      id: 'timeline-5',
      year: '2024',
      title: 'Motion language',
      description:
        'Developed stronger design languages with typography, color, components, and motion working as one clear system.',
      image: PUBLIC_ASSETS.timeline['2024'],
    },
    {
      id: 'timeline-6',
      year: '2025',
      title: 'Creative direction',
      description:
        'Pushed visual direction toward cinematic, high-impact digital experiences with bold systems and immersive interfaces.',
      image: PUBLIC_ASSETS.timeline['2025'],
    },
    {
      id: 'timeline-7',
      year: '2026',
      title: 'Sharper systems',
      description:
        'Creating advanced portfolio templates, interactive components, and high-end Framer systems for bold digital brands.',
      image: PUBLIC_ASSETS.timeline['2026'],
    },
  ],
};
