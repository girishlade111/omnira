import { getProjectCoverVariants } from '@/lib/assets';
import type {
  Project,
  ProjectCategoryFilter,
  ProjectCategoryLabel,
  ProjectCategorySlug,
} from '@/types';

interface RawProjectSeed {
  order: number;
  id: string;
  name: string;
  slug: string;
  displayDomain: string;
  externalUrl: string;
  primaryCategory: Exclude<ProjectCategoryLabel, 'ALL PROJECTS'>;
  primaryCategorySlug: Exclude<ProjectCategorySlug, 'all'>;
  fallbackExt?: 'jpg' | 'png';
  inHomeSelectedWork?: boolean;
  inHomeAboutBento?: boolean;
  inInitialWorksSSR?: boolean;
}

const LICENSE_NOTE =
  'Framer Marketplace Single-Use Commercial License (Template Demo Media)';
const SOURCE_EVIDENCE =
  'Decoded Framer CMS chunk mD0yv0kks-chunk-default-0.framercms + live /works verification';

const RAW_PROJECTS: RawProjectSeed[] = [
  {
    order: 1,
    id: 'xBLzQ310r',
    name: 'Brandora',
    slug: 'brandora',
    displayDomain: 'bradora.studio',
    externalUrl: 'https://brandora.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
    inHomeSelectedWork: true,
    inHomeAboutBento: true,
    inInitialWorksSSR: true,
  },
  {
    order: 2,
    id: 'doFmNYbAn',
    name: 'Nivora',
    slug: 'nivora',
    displayDomain: 'nivora.studio',
    externalUrl: 'https://nivora.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
    inHomeSelectedWork: true,
    inHomeAboutBento: true,
    inInitialWorksSSR: true,
  },
  {
    order: 3,
    id: 'MrDMPzoiT',
    name: 'Codify',
    slug: 'codify',
    displayDomain: 'codify.pro',
    externalUrl: 'https://codify.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
    inHomeSelectedWork: true,
    inHomeAboutBento: true,
    inInitialWorksSSR: true,
  },
  {
    order: 4,
    id: 'SYepgO67U',
    name: 'Neutra',
    slug: 'neutra',
    displayDomain: 'neutra.studio',
    externalUrl: 'https://neutra.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
    inHomeSelectedWork: true,
    inHomeAboutBento: true,
    inInitialWorksSSR: true,
  },
  {
    order: 5,
    id: 'deeZ3a7X0',
    name: 'AI Nest',
    slug: 'ai-nest',
    displayDomain: 'ainest.io',
    externalUrl: 'https://ainest.framer.website/',
    primaryCategory: 'AI',
    primaryCategorySlug: 'ai',
    fallbackExt: 'png',
    inHomeSelectedWork: true,
    inInitialWorksSSR: true,
  },
  {
    order: 6,
    id: 'bkEWZVjqy',
    name: 'Studyflow',
    slug: 'studyflow',
    displayDomain: 'studyflow.com',
    externalUrl: 'https://studyflow.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
    inHomeSelectedWork: true,
    inInitialWorksSSR: true,
  },
  {
    order: 7,
    id: 'xbAHNKNlM',
    name: 'Todofusion',
    slug: 'todofusion',
    displayDomain: 'todofusion.io',
    externalUrl: 'https://todofusion.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
    inInitialWorksSSR: true,
  },
  {
    order: 8,
    id: 'ivZEXC1Aq',
    name: 'Snapkit',
    slug: 'snapkit',
    displayDomain: 'snapkit.co',
    externalUrl: 'https://snapkit.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
    inInitialWorksSSR: true,
  },
  {
    order: 9,
    id: 'tQgJglhyM',
    name: 'Grido',
    slug: 'grido',
    displayDomain: 'girdo.studio',
    externalUrl: 'https://grido.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
    inInitialWorksSSR: true,
  },
  {
    order: 10,
    id: 'zYLgugeuj',
    name: 'Trainly',
    slug: 'trainly',
    displayDomain: 'trainly.com',
    externalUrl: 'https://trainly.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
    inInitialWorksSSR: true,
  },
  {
    order: 11,
    id: 'QRIAhA0et',
    name: 'Stickify',
    slug: 'stickify',
    displayDomain: 'stickify.pro',
    externalUrl: 'https://stickify.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
    inInitialWorksSSR: true,
  },
  {
    order: 12,
    id: 'OubmC1nSx',
    name: 'Landify',
    slug: 'landify',
    displayDomain: 'landify.com',
    externalUrl: 'https://landify.framer.website/',
    primaryCategory: 'ONE PAGE',
    primaryCategorySlug: 'one-page',
    inInitialWorksSSR: true,
  },
  {
    order: 13,
    id: 'tl_CENBPk',
    name: 'Thinkbot',
    slug: 'thinkbot',
    displayDomain: 'thinkbot.io',
    externalUrl: 'https://thinkbot.framer.ai/',
    primaryCategory: 'AI',
    primaryCategorySlug: 'ai',
  },
  {
    order: 14,
    id: 'wpoEx1Tcf',
    name: 'Groomix',
    slug: 'groomix',
    displayDomain: 'groomix.co',
    externalUrl: 'https://groomix.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 15,
    id: 'YlPQfvyFd',
    name: 'Gradia',
    slug: 'gradia',
    displayDomain: 'gradia.com',
    externalUrl: 'https://gradia.framer.website/',
    primaryCategory: 'ONE PAGE',
    primaryCategorySlug: 'one-page',
  },
  {
    order: 16,
    id: 'mvtl73ptN',
    name: 'Designor',
    slug: 'designor',
    displayDomain: 'designer.com',
    externalUrl: 'https://designor.framer.website/',
    primaryCategory: 'ONE PAGE',
    primaryCategorySlug: 'one-page',
  },
  {
    order: 17,
    id: 'lDXhSXgyW',
    name: 'Pixor',
    slug: 'pixor',
    displayDomain: 'pixor.com',
    externalUrl: 'https://pixor.framer.website/',
    primaryCategory: 'ONE PAGE',
    primaryCategorySlug: 'one-page',
  },
  {
    order: 18,
    id: 'phC3zBHI5',
    name: 'Kavro',
    slug: 'kavro',
    displayDomain: 'kavro.studio',
    externalUrl: 'https://kavro.framer.website/',
    primaryCategory: 'ONE PAGE',
    primaryCategorySlug: 'one-page',
  },
  {
    order: 19,
    id: 'vAJw5gdlm',
    name: 'Taskify',
    slug: 'taskify',
    displayDomain: 'taskify.com',
    externalUrl: 'https://taskify.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 20,
    id: 'ALH21iIKv',
    name: 'Flexify',
    slug: 'flexify',
    displayDomain: 'flexify.com',
    externalUrl: 'https://flexify.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 21,
    id: 'lrgtSZMqI',
    name: 'Nexus AI',
    slug: 'nexusai',
    displayDomain: 'nexusai.io',
    externalUrl: 'https://nexusai.framer.website/',
    primaryCategory: 'AI',
    primaryCategorySlug: 'ai',
  },
  {
    order: 22,
    id: 'CK3Kg9Vvx',
    name: 'Dailyhub',
    slug: 'dailyhub',
    displayDomain: 'dailyhub.supply',
    externalUrl: 'https://dailyhub.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 23,
    id: 'n4iBvtWcZ',
    name: 'Agentify',
    slug: 'agentify',
    displayDomain: 'agentify.studio',
    externalUrl: 'https://agentify.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
  },
  {
    order: 24,
    id: 'C8XcBAbwW',
    name: 'Protify',
    slug: 'protify',
    displayDomain: 'protify.studio',
    externalUrl: 'https://protify.framer.website/',
    primaryCategory: 'PORTFOLIO',
    primaryCategorySlug: 'portfolio',
  },
  {
    order: 25,
    id: 'F32lunQf2',
    name: 'Startify',
    slug: 'startify',
    displayDomain: 'startify.com',
    externalUrl: 'https://startify.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 26,
    id: 'SdcouobK4',
    name: 'Flowboard',
    slug: 'flowboard',
    displayDomain: 'flowboard.com',
    externalUrl: 'https://flowboard.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
  {
    order: 27,
    id: 'TCTTuikaP',
    name: 'Platify',
    slug: 'platify',
    displayDomain: 'platify.com',
    externalUrl: 'https://platify.framer.website/',
    primaryCategory: 'BUSINESS',
    primaryCategorySlug: 'business',
  },
];

export const projects: Project[] = RAW_PROJECTS.map((item) => {
  const thumbnailVariants = getProjectCoverVariants(
    item.slug,
    item.name,
    item.fallbackExt ?? 'jpg',
  );

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    displayDomain: item.displayDomain,
    externalUrl: item.externalUrl,
    internalDetailRoute: null,
    categories: ['ALL PROJECTS', item.primaryCategory],
    primaryCategory: item.primaryCategory,
    primaryCategorySlug: item.primaryCategorySlug,
    thumbnailAssetId: `project-${item.slug}-cover`,
    thumbnailVariants,
    featured: {
      inHomeSelectedWork: Boolean(item.inHomeSelectedWork),
      inHomeAboutBento: Boolean(item.inHomeAboutBento),
      inInitialWorksSSR: Boolean(item.inInitialWorksSSR),
    },
    order: item.order,
    imageAlt: thumbnailVariants.alt,
    referenceEvidence: SOURCE_EVIDENCE,
    sourceVersion: 'omnira.framer.website (Framer c9b3949)',
    licenseStatus: LICENSE_NOTE,
    verificationStatus: 'verified',
  };
});

export const projectCategoryFilters: ProjectCategoryFilter[] = [
  { id: null, label: 'ALL PROJECTS', slug: 'all', count: 27 },
  { id: 'sCjTByVW3', label: 'AI', slug: 'ai', count: 3 },
  { id: 'hPM5LXyjX', label: 'BUSINESS', slug: 'business', count: 12 },
  { id: 'KuZC2UqsA', label: 'ONE PAGE', slug: 'one-page', count: 5 },
  { id: 'uEcIAASIa', label: 'PORTFOLIO', slug: 'portfolio', count: 7 },
];

export const selectedWorkProjects = projects.filter(
  (p) => p.featured.inHomeSelectedWork,
);

export const aboutPreviewProjects = projects.filter(
  (p) => p.featured.inHomeAboutBento,
);

export const selectedWorkCopy = {
  badge: 'SELECTED WORK',
  heading: 'FEATURED PROJECTS',
  description:
    'A curated collection of digital experiences shaped with strong visual direction, clean interaction, and futuristic design systems.',
  viewAllLabel: 'VIEW ALL WORKS',
  viewAllHref: '/works',
};

export const worksPageCopy = {
  badge: 'SELECTED WORK',
  heading: 'SELECTED WORK',
  description:
    'A curated collection of digital experiences shaped with strong visual direction, clean interaction, and futuristic design systems.',
  loadMoreLabel: 'LOAD MORE PROJECTS',
};
