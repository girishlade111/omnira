'use client';

import {
  ChamferedButton,
  ChamferedPanel,
  TechnicalBadge,
} from '@/components/primitives';
import styles from './common.module.css';

export interface ContactSupportCardProps {
  mode?: 'home' | 'contact';
}

export function ContactSupportCard({ mode = 'home' }: ContactSupportCardProps) {
  const handleScrollToForm = () => {
    const formEl = document.getElementById('contact-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ChamferedPanel
      cornerCut={12}
      showGrain
      grainOpacity={0.8}
      borderColor="rgba(255, 255, 255, 0.14)"
      backgroundColor="rgba(255, 255, 255, 0.02)"
      className={styles.supportCardPanel}
      innerClassName={styles.supportCardInner}
    >
      <div>
        <TechnicalBadge label="SUPPORT" dotColor="orange" />
      </div>
      <h3 className={styles.supportCardTitle}>Still have questions?</h3>
      <p className={styles.supportCardCopy}>
        Send a quick note with your project goals, timeline, or scope questions and get a clear answer within 24 hours.
      </p>
      {mode === 'contact' ? (
        <ChamferedButton
          variant="primary"
          size="md"
          cornerCut={6}
          showArrow
          onClick={handleScrollToForm}
        >
          CONTACT US
        </ChamferedButton>
      ) : (
        <ChamferedButton
          variant="primary"
          size="md"
          cornerCut={6}
          showArrow
          href="/contact"
        >
          CONTACT US
        </ChamferedButton>
      )}
    </ChamferedPanel>
  );
}
