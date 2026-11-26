'use client';

import { ChamferedPanel } from '@/components/primitives';
import type { FaqItem as FaqItemData } from '@/types';
import styles from './common.module.css';

export interface FAQItemProps {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ item, isOpen, onToggle }: FAQItemProps) {
  const buttonId = `faq-trigger-${item.code}`;
  const panelId = `faq-panel-${item.code}`;

  return (
    <ChamferedPanel
      cornerCut={8}
      borderColor={isOpen ? '#ff9800' : 'rgba(255, 255, 255, 0.12)'}
      hoverBorderColor="rgba(255, 152, 0, 0.7)"
      backgroundColor={isOpen ? 'rgba(255, 152, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)'}
      className={styles.faqItemPanel}
    >
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={styles.faqTrigger}
      >
        <span
          className={
            isOpen ? `${styles.faqNumber} ${styles.faqNumberOpen}` : styles.faqNumber
          }
        >
          {item.code}
        </span>
        <span className={styles.faqVerticalDivider} aria-hidden="true" />
        <span className={styles.faqQuestion}>{item.question}</span>
        <span className={styles.faqPlusMinus} aria-hidden="true">
          <span className={styles.faqBarHorizontal} />
          <span
            className={
              isOpen
                ? `${styles.faqBarVertical} ${styles.faqBarVerticalOpen}`
                : styles.faqBarVertical
            }
          />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={
          isOpen
            ? `${styles.faqAnswerCollapse} ${styles.faqAnswerCollapseOpen}`
            : styles.faqAnswerCollapse
        }
      >
        <div className={styles.faqAnswerInner}>
          <p className={styles.faqAnswerText}>{item.answer}</p>
        </div>
      </div>
    </ChamferedPanel>
  );
}
