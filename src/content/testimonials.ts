import { PUBLIC_ASSETS } from '@/lib/assets';
import type { TestimonialsSectionContent } from '@/types';

export const testimonialsContent: TestimonialsSectionContent = {
  badge: 'TESTIMONIALS',
  heading: 'CLIENT FEEDBACK',
  description:
    'Feedback from founders and teams who needed sharp visuals, clear systems, and polished digital execution.',
  rating: '4.8',
  ratingCaption: 'CLIENT SATISFACTION',
  ratingSubcaption: 'FROM 24 CLIENT PROJECTS',
  items: [
    {
      index: 1,
      name: 'Marko Ivanov',
      roleAndCompany: 'Director, Vanta',
      quote:
        'Omnira delivered a sharp website with clear structure, strong visuals, and smooth execution from start to finish.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide1,
    },
    {
      index: 2,
      name: 'Daniel Kim',
      roleAndCompany: 'Founder, Lumen',
      quote:
        'The process felt focused and fast, with polished details that made our product feel truly premium.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide2,
    },
    {
      index: 3,
      name: 'Sarah Chen',
      roleAndCompany: 'Product Lead, Statik',
      quote:
        'A clean system, strong direction, and excellent Framer execution. Everything felt intentional and launch-ready.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide3,
    },
    {
      index: 4,
      name: 'Leon Hart',
      roleAndCompany: 'Director, Vanta',
      quote:
        'Omnira turned our rough direction into a polished website with strong structure, smooth motion, and memorable visual impact.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide4,
    },
    {
      index: 5,
      name: 'Sofia Brand',
      roleAndCompany: 'Founder, Lumen',
      quote:
        'We needed a bold digital presence, and Omnira delivered a clean, futuristic experience that felt instantly premium.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide5,
    },
    {
      index: 6,
      name: 'Mira Klein',
      roleAndCompany: 'Product Lead, Statik',
      quote:
        'We needed a bold digital presence, and Omnira delivered a clean, futuristic experience that felt instantly premium.',
      link: 'https://x.com/Dmytri_Design',
      avatar: PUBLIC_ASSETS.testimonials.slide6,
    },
  ],
  partnerLogos: [...PUBLIC_ASSETS.partnerLogos],
  controls: {
    arrowLeftSvg: PUBLIC_ASSETS.icons.arrowLeft,
    arrowRightSvg: PUBLIC_ASSETS.icons.arrowRight,
    ratingStarSvg: PUBLIC_ASSETS.icons.ratingStar,
  },
};
