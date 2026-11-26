import { ChamferedPanel } from '@/components/primitives';
import { testimonialsContent } from '@/content/testimonials';
import styles from './common.module.css';

export function PartnerLogoPanel() {
  return (
    <ChamferedPanel
      cornerCut={12}
      borderColor="rgba(255, 255, 255, 0.14)"
      backgroundColor="rgba(255, 255, 255, 0.02)"
      innerClassName={styles.partnerLogoPanelInner}
    >
      {testimonialsContent.partnerLogos.map((logo) => (
        <div key={logo.id} className={styles.partnerLogoSlot}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.svgPath}
            alt={logo.name}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            decoding="async"
            className={styles.partnerLogoImg}
          />
        </div>
      ))}
    </ChamferedPanel>
  );
}
