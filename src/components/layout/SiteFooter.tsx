import { SectionFrame } from './SectionFrame';
import { FooterCTA } from './FooterCTA';
import { FooterNavigation } from './FooterNavigation';
import styles from './layout.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <SectionFrame as="div" padding="compact" bottomBorder={false}>
        <div className={styles.footerStack}>
          <FooterCTA />
          <FooterNavigation />
        </div>
      </SectionFrame>
    </footer>
  );
}
