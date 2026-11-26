'use client';

import { useState } from 'react';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { SectionHeading } from '@/components/primitives';
import { faqsContent } from '@/content/faqs';
import { ContactSupportCard } from './ContactSupportCard';
import { FAQItem } from './FAQItem';
import styles from './common.module.css';

export interface FAQSectionProps {
  mode?: 'home' | 'contact';
  defaultOpenIndex?: number | null;
}

export function FAQSection({
  mode = 'home',
  defaultOpenIndex = null,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <SectionFrame id="faq" bottomBorder>
      <SectionHeading
        badge={faqsContent.badge}
        titleWhite="CLEAR ANSWERS"
        titleOrange="PRE-BUILD"
        description={faqsContent.description}
        align="split"
        showOrangeRule
      />

      <div className={styles.faqLayoutGrid}>
        <ContactSupportCard mode={mode} />

        <div className={styles.faqList}>
          {faqsContent.items.map((item, idx) => (
            <FAQItem
              key={item.code}
              item={item}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
            />
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
