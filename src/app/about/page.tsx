import type { Metadata } from 'next';
import {
  BiographySection,
  CareerTimeline,
  ProfileHero,
  ServicesGrid,
  TerminalPanel,
  ToolsSelector,
} from '@/components/about';
import { TestimonialsSection } from '@/components/common';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Profile system, career timeline, interactive workflow terminal, services, and tool stack behind Omnira.',
};

export default function AboutPage() {
  return (
    <>
      <ProfileHero />
      <BiographySection />
      <TerminalPanel />
      <ServicesGrid />
      <CareerTimeline />
      <ToolsSelector />
      <TestimonialsSection />
    </>
  );
}
