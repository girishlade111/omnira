import type { ProcessSectionContent } from '@/types';

export const processContent: ProcessSectionContent = {
  badge: 'PROCESS',
  heading: 'FROM CONCEPT TO LAUNCH',
  description:
    'A focused workflow for turning early ideas into polished digital experiences through clear direction, refined interface design, and smooth execution.',
  phases: [
    {
      id: 'content-1',
      index: 1,
      phaseCode: 'PHASES 01',
      title: 'DISCOVER',
      description:
        'Define the goal, audience, visual direction, and project structure before moving into focused design.',
    },
    {
      id: 'content-2',
      index: 2,
      phaseCode: 'PHASES 02',
      title: 'Design',
      description:
        'Create high-impact interface concepts with strong hierarchy, futuristic detail, and responsive.',
    },
    {
      id: 'content-3',
      index: 3,
      phaseCode: 'PHASES 03',
      title: 'Build',
      description:
        'Turn the approved direction into a clean Framer experience with interaction, motion, and precision.',
    },
    {
      id: 'content-4',
      index: 4,
      phaseCode: 'PHASES 04',
      title: 'Refine',
      description:
        'Polish spacing, performance, responsiveness, and final details to make the experience launch ready.',
    },
  ],
  principleChips: ['CLARITY', 'STRUCTURE', 'MOTION', 'IMPACT'],
  metrics: [
    {
      id: 'metric-phases',
      label: 'PHASES',
      value: 4,
      displaySuffix: '',
    },
    {
      id: 'metric-precision',
      label: 'PRECISION',
      value: 100,
      displaySuffix: '%',
    },
    {
      id: 'metric-possibilities',
      label: 'POSSIBILITIES',
      value: 100,
      displaySuffix: '',
      isInfinity: true,
    },
  ],
};
