import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SectionFrame } from '@/components/layout';
import { WorksCatalog } from '@/components/works';

export const metadata: Metadata = {
  title: 'Works',
  description:
    'Complete 27-project showcase across AI, Business, One Page, and Portfolio categories.',
};

export default function WorksPage() {
  return (
    <SectionFrame ariaLabel="Works catalog" bottomBorder>
      <Suspense fallback={null}>
        <WorksCatalog />
      </Suspense>
    </SectionFrame>
  );
}
