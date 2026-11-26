export type ProjectCategoryLabel = 'ALL PROJECTS' | 'AI' | 'BUSINESS' | 'ONE PAGE' | 'PORTFOLIO';

export type ProjectCategorySlug = 'all' | 'ai' | 'business' | 'one-page' | 'portfolio';

export interface ImageVariants {
  webp: string;
  avif: string;
  fallback: string;
  width: number;
  height: number;
  alt: string;
}

export interface ProjectFeaturedFlags {
  inHomeSelectedWork: boolean;
  inHomeAboutBento: boolean;
  inInitialWorksSSR: boolean;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  displayDomain: string;
  externalUrl: string;
  internalDetailRoute: string | null;
  categories: ProjectCategoryLabel[];
  primaryCategory: Exclude<ProjectCategoryLabel, 'ALL PROJECTS'>;
  primaryCategorySlug: Exclude<ProjectCategorySlug, 'all'>;
  thumbnailAssetId: string;
  thumbnailVariants: ImageVariants;
  featured: ProjectFeaturedFlags;
  order: number;
  imageAlt: string;
  referenceEvidence: string;
  sourceVersion: string;
  licenseStatus: string;
  verificationStatus: 'verified' | 'acquired' | 'documented';
}

export interface ProjectCategoryFilter {
  id: string | null;
  label: ProjectCategoryLabel;
  slug: ProjectCategorySlug;
  count: number;
}

export interface ServiceItem {
  id: string;
  index: number;
  code: string;
  layer: number;
  title: string;
  description: string;
  deliverables: string[];
}

export interface ServicesSectionContent {
  badge: string;
  heading: string;
  description: string;
  items: ServiceItem[];
  isometricStackLayers: ImageVariants[];
}

export interface ProcessPhase {
  id: string;
  index: number;
  phaseCode: string;
  title: string;
  description: string;
}

export interface ProcessMetric {
  id: string;
  label: string;
  value: number;
  displaySuffix: string;
  isInfinity?: boolean;
}

export interface ProcessSectionContent {
  badge: string;
  heading: string;
  description: string;
  phases: ProcessPhase[];
  principleChips: string[];
  metrics: ProcessMetric[];
}

export interface KpiStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

export interface AboutCapability {
  code: string;
  text: string;
}

export interface AboutPreviewContent {
  badge: string;
  headingPrefix: string;
  statusBadge: string;
  headline: string;
  stats: KpiStat[];
  tagline: string;
  capabilities: AboutCapability[];
  ctaLabel: string;
  ctaHref: string;
  worldwideBadge: string;
}

export interface TerminalStep {
  step: string;
  label: string;
  description: string;
}

export interface TerminalSystemCheck {
  label: string;
  status: string;
}

export interface TerminalData {
  badge: string;
  heading: string;
  description: string;
  statusLabel: string;
  statusValue: string;
  steps: TerminalStep[];
  commandPrompt: string;
  commandTextDesktop: string;
  commandTextMobile: string;
  enterLabel: string;
  outputLabel: string;
  systemCheckLabel: string;
  systemCheckStatus: string;
  summaryLine: string;
  checks: TerminalSystemCheck[];
  isometricStackLayers: ImageVariants[];
}

export interface ProfileDetailsItem {
  label: string;
  value: string;
}

export interface AboutServiceCard {
  code: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface ProfileData {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  availabilityLabel: string;
  focusLabel: string;
  focusValue: string;
  toolsLabel: string;
  toolsSummary: string;
  portrait: ImageVariants;
  signatureSvgPath: string;
  stats: KpiStat[];
  aboutBadge: string;
  biographyParagraphs: string[];
  details: ProfileDetailsItem[];
  readyToLaunchHeading: string;
  servicesLowerStrip: string[];
  aboutServices: AboutServiceCard[];
  terminal: TerminalData;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  image: ImageVariants;
}

export interface TimelineSectionContent {
  badge: string;
  heading: string;
  description: string;
  items: TimelineItem[];
}

export interface ToolItem {
  index: number;
  code: string;
  name: string;
  description: string;
  url: string;
  iconInlineSvgRef: string;
}

export type ToolCategoryName = 'DESIGN' | 'DEVELOPMENT' | 'MOTION' | '3D / VISUAL';

export interface ToolCategory {
  category: ToolCategoryName;
  slug: string;
  tools: ToolItem[];
}

export interface ToolsSectionContent {
  badge: string;
  heading: string;
  description: string;
  categories: ToolCategory[];
}

export interface TestimonialItem {
  index: number;
  name: string;
  roleAndCompany: string;
  quote: string;
  link: string;
  avatar: ImageVariants;
}

export interface PartnerLogo {
  id: string;
  name: string;
  svgPath: string;
  width: number;
  height: number;
}

export interface TestimonialsSectionContent {
  badge: string;
  heading: string;
  description: string;
  rating: string;
  ratingCaption: string;
  ratingSubcaption: string;
  items: TestimonialItem[];
  partnerLogos: PartnerLogo[];
  controls: {
    arrowLeftSvg: string;
    arrowRightSvg: string;
    ratingStarSvg: string;
  };
}

export interface PricingTier {
  id: string;
  planName: string;
  featured: boolean;
  description: string;
  priceUsd: number;
  formattedPrice: string;
  currency: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface PricingAssuranceItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface PricingSectionContent {
  badge: string;
  heading: string;
  description: string;
  tiers: PricingTier[];
  assuranceStrip: PricingAssuranceItem[];
}

export interface FaqItem {
  number: number;
  code: string;
  question: string;
  answer: string;
}

export interface FaqsSectionContent {
  badge: string;
  heading: string;
  description: string;
  items: FaqItem[];
}

export interface ContactSelectOption {
  value: string;
  label: string;
}

export interface ContactStatusRow {
  label: string;
  value: string;
  tone: 'accent' | 'positive' | 'neutral';
}

export interface ContactFormField {
  id: string;
  name: 'name' | 'email' | 'projectType' | 'budgetRange' | 'timeline' | 'details';
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  placeholder: string;
  required: boolean;
}

export interface ContactConfig {
  badge: string;
  heading: string;
  description: string;
  statusRows: ContactStatusRow[];
  emailLabel: string;
  displayEmail: string;
  mailtoEmail: string;
  mailtoHref: string;
  locationLabel: string;
  locationText: string;
  locationHref: string;
  submitLabel: string;
  fields: ContactFormField[];
  selectOptions: {
    projectType: ContactSelectOption[];
    budgetRange: ContactSelectOption[];
    timeline: ContactSelectOption[];
  };
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface SocialLinkItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  studioName: string;
  brandTitle: string;
  ownerName: string;
  roleTitle: string;
  siteUrl: string;
  description: string;
  email: string;
  location: string;
  clockLabel: string;
  clockRegion: string;
  clockTimeZone: string;
  clockFormat: '12h' | '24h';
  clockShowSeconds: boolean;
  copyrightText: string;
  statusLabel: string;
  statusValue: string;
  ctaSection: {
    heading: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
    statusBadge: string;
  };
  notFound: {
    badge: string;
    code: string;
    heading: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  hero: {
    badge: string;
    headlinePrefix: string;
    rotatingWords: string[];
    rotationIntervalMs: number;
    rotationDurationMs: number;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    statusText: string;
    scrollHint: string;
  };
  navLinks: NavLinkItem[];
  navCta: NavLinkItem;
  socialLinks: SocialLinkItem[];
  demonstrationMode: {
    useLocalAssets: boolean;
    worksInitialPageSize: number;
    enableContactFormDemoFallback: boolean;
  };
}
