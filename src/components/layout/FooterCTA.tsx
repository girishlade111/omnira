import { ChamferedPanel, OrangeText } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import { FooterStatusBar } from './FooterStatusBar';
import { SocialPanel } from './SocialPanel';
import styles from './layout.module.css';

export function FooterCTA() {
  return (
    <ChamferedPanel
      cornerCut={12}
      hasTopNotch
      hasBottomNotch
      notchDepth={8}
      notchWidth={140}
      showGrain
      grainOpacity={0.8}
      borderColor="rgba(255, 255, 255, 0.14)"
      backgroundColor="rgba(255, 255, 255, 0.02)"
      className={styles.footerCtaPanel}
    >
      <div className={styles.footerCtaInner}>
        <div className={styles.footerCtaLead}>
          <h2 className={styles.footerCtaHeading}>
            {"LET'S BUILD "}
            <OrangeText>SOMETHING</OrangeText>
          </h2>
          <div className={styles.footerCtaRule} aria-hidden="true" />
          <p className={styles.footerCtaCopy}>
            {siteConfig.ctaSection.description}
          </p>
        </div>

        <SocialPanel />
      </div>

      <FooterStatusBar />
    </ChamferedPanel>
  );
}
