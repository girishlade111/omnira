import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading, TechnicalBadge } from '@/components/primitives';
import { profileContent } from '@/content/profile';
import { servicesContent } from '@/content/services';
import styles from './about.module.css';

function ServiceCardIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5.2V8L10 9.4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 1:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5.5 5L2.5 8L5.5 11M10.5 5L13.5 8L10.5 11M9 3.5L7 12.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 2:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="2.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="2.5" y="9" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="9" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4.8 10.5C3.2 10.5 2 9.4 2 8C2 6.6 3.2 5.5 4.8 5.5C6.5 5.5 9.5 10.5 11.2 10.5C12.8 10.5 14 9.4 14 8C14 6.6 12.8 5.5 11.2 5.5C9.5 5.5 6.5 10.5 4.8 10.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
  }
}

export function ServicesGrid() {
  return (
    <SectionFrame id="services-overview" bottomBorder>
      <div className={styles.servicesSection}>
        <SectionHeading
          badge={servicesContent.heading}
          titleWhite="DIGITAL SYSTEMS FOR"
          titleOrange="BOLD BRANDS"
          description={servicesContent.description}
          align="split"
        />

        <div className={styles.servicesGrid}>
          {profileContent.aboutServices.map((svc, idx) => (
            <div key={svc.code} className={styles.serviceSlot} data-step={idx}>
              <ChamferedPanel
                cornerCut={8}
                borderColor="rgba(255, 255, 255, 0.14)"
                hoverBorderColor="rgba(255, 152, 0, 0.45)"
                backgroundColor="#0d0d0d"
                showGrain
                grainOpacity={0.55}
                className={styles.serviceCard}
                innerClassName={styles.serviceCardInner}
              >
                <div className={styles.serviceCardTop}>
                  <span className={styles.serviceCode}>{svc.code}</span>
                  <span className={styles.panelDots} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>

                <div className={styles.serviceIconBadge}>
                  <TechnicalBadge label="" className={styles.serviceIconFrame} />
                  <span className={styles.serviceIconGlyph}>
                    <ServiceCardIcon index={idx} />
                  </span>
                </div>

                <h3 className={styles.serviceTitle}>{svc.title.toUpperCase()}</h3>
                <p className={styles.serviceDesc}>{svc.description}</p>

                <ul className={styles.serviceDeliverables}>
                  {svc.deliverables.map((item) => (
                    <li key={item} className={styles.serviceDeliverableItem}>
                      <span className={styles.serviceCheck} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.2L4.1 7.2L8 3" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ChamferedPanel>
            </div>
          ))}
        </div>

        <div className={styles.servicesStrip} aria-hidden="true">
          {profileContent.servicesLowerStrip.map((label, idx) => (
            <span key={label} className={styles.servicesStripItem}>
              {idx > 0 ? <span className={styles.servicesStripDot} /> : null}
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
