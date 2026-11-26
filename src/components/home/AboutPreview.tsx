import Link from 'next/link';
import { SectionFrame } from '@/components/layout';
import {
  AnimatedCounter,
  ChamferedPanel,
  SectionHeading,
  StatusIndicator,
} from '@/components/primitives';
import { aboutPreviewContent } from '@/content/profile';
import type { AboutCapability } from '@/types';
import styles from './home.module.css';

function CapabilityIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="2.5" width="10" height="9" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2 5.5H12" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 1:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="2" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 2:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7.5 2L3.5 7.5H7L6.5 12L10.5 6.5H7L7.5 2Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}

const CAPABILITY_TITLES = [
  'INTERFACE DESIGN',
  'SYSTEM THINKING',
  'FRAMER EXECUTION',
  'VISUAL DIRECTION',
];

export function CapabilityCard({
  capability,
  index,
}: {
  capability: AboutCapability;
  index: number;
}) {
  return (
    <ChamferedPanel
      cornerCut={8}
      borderColor="rgba(255, 255, 255, 0.12)"
      hoverBorderColor="rgba(255, 152, 0, 0.45)"
      backgroundColor="#0b0b0b"
      className={styles.capabilityCard}
      innerClassName={styles.capabilityInner}
    >
      <div className={styles.capabilityLeft}>
        <span className={styles.capabilityIconBox}>
          <CapabilityIcon index={index} />
        </span>
        <div className={styles.capabilityTextGroup}>
          <h3 className={styles.capabilityTitle}>
            {CAPABILITY_TITLES[index] ?? `CAPABILITY ${capability.code}`}
          </h3>
          <p className={styles.capabilityDesc}>{capability.text}</p>
        </div>
      </div>

      <span className={styles.capabilityCode}>{capability.code}</span>
    </ChamferedPanel>
  );
}

export function AboutPreview() {
  return (
    <SectionFrame id="about-preview" bottomBorder>
      <div className={styles.sectionStack}>
        <SectionHeading
          badge={aboutPreviewContent.badge}
          titleWhite="SHARP DESIGN"
          titleOrange="CLEAN FLOW"
          description={aboutPreviewContent.headline}
          align="split"
        />

        <div className={styles.aboutPreviewGrid}>
          <ChamferedPanel
            cornerCut={12}
            borderColor="rgba(255, 255, 255, 0.14)"
            backgroundColor="#0c0c0c"
            showGrain
            grainOpacity={0.6}
            className={styles.aboutProfilePanel}
            innerClassName={styles.aboutProfileInner}
          >
            <div className={styles.aboutStatusTop}>
              <StatusIndicator
                label="STATUS:"
                value={aboutPreviewContent.statusBadge}
                color="green"
                pulse
              />
              <span className={styles.aboutRoleLabel}>FRAMER DESIGNER &amp; DEVELOPER</span>
            </div>

            <div className={styles.aboutStatsGrid}>
              {aboutPreviewContent.stats.map((stat) => (
                <div key={stat.id} className={styles.aboutStatBox}>
                  <div className={styles.aboutStatNum}>
                    <AnimatedCounter value={`${stat.value}${stat.suffix}`} />
                  </div>
                  <div className={styles.aboutStatLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.aboutChipsGrid}>
              {['CLARITY', 'STRUCTURE', 'MOTION', 'IMPACT'].map((chip) => (
                <div key={chip} className={styles.aboutChip}>
                  <span className={styles.aboutChipDot} aria-hidden="true" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>

            <div className={styles.aboutPanelFooter}>
              <p className={styles.aboutTagline}>{aboutPreviewContent.tagline}</p>
              <Link href={aboutPreviewContent.ctaHref} className={styles.aboutPanelLink}>
                <span>{aboutPreviewContent.ctaLabel}</span>
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </ChamferedPanel>

          <div className={styles.capabilitiesColumn}>
            {aboutPreviewContent.capabilities.map((cap, idx) => (
              <CapabilityCard key={cap.code} capability={cap} index={idx} />
            ))}

            <ChamferedPanel
              cornerCut={6}
              borderColor="rgba(255, 255, 255, 0.1)"
              backgroundColor="#090909"
              className={styles.worldwidePanel}
              innerClassName={styles.worldwideInner}
            >
              <span className={styles.worldwideDot} aria-hidden="true" />
              <span>{aboutPreviewContent.worldwideBadge}</span>
            </ChamferedPanel>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
