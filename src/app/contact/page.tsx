import type { Metadata } from 'next';
import { FAQSection } from '@/components/common';
import { ContactHero, ProjectInquiryForm } from '@/components/contact';
import { SectionFrame } from '@/components/layout';
import styles from '@/components/contact/contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send project details for interface design, Framer builds, visual systems, and creative direction.',
};

export default function ContactPage() {
  return (
    <>
      <SectionFrame ariaLabel="Contact channel and project inquiry" bottomBorder>
        <div className={styles.contactSplit}>
          <ContactHero />
          <div className={styles.formColumn}>
            <ProjectInquiryForm />
          </div>
        </div>
      </SectionFrame>

      <FAQSection mode="contact" />
    </>
  );
}
