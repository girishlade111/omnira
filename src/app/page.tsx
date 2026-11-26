import type { Metadata } from 'next';
import { FAQSection, TestimonialsSection } from '@/components/common';
import {
  AboutPreview,
  Hero,
  PricingSection,
  ProcessSection,
  SelectedWorks,
  ServiceSelector,
} from '@/components/home';

export const metadata: Metadata = {
  title: 'Omnira | Futuristic Portfolio & Digital Systems',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWorks />
      <ProcessSection />
      <AboutPreview />
      <ServiceSelector />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection mode="home" />
    </>
  );
}
