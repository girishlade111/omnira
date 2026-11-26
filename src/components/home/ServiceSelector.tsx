'use client';

import { useState } from 'react';
import { ServiceIsometricGraphic } from '@/components/graphics';
import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading } from '@/components/primitives';
import { servicesContent } from '@/content/services';
import styles from './home.module.css';

function ServiceItemIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9.8 2.2L11.8 4.2L5.2 10.8L2.5 11.5L3.2 8.8L9.8 2.2Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 1:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 4.2L2.2 7L5 9.8M9 4.2L11.8 7L9 9.8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 2:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="2" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.1" />
          <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}

export function ServiceSelector() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <SectionFrame id="services" bottomBorder>
      <div className={styles.sectionStack}>
        <SectionHeading
          badge={servicesContent.heading}
          titleWhite="DIGITAL SYSTEMS FOR"
          titleOrange="BOLD BRANDS"
          description={servicesContent.description}
          align="split"
        />

        <div className={styles.servicesSplit}>
          <div className={styles.servicesAccordionCol}>
            {servicesContent.items.map((service, idx) => {
              const isOpen = idx === activeIndex;
              const panelId = `service-panel-${service.id}`;
              return (
                <ChamferedPanel
                  key={service.id}
                  cornerCut={8}
                  borderColor={isOpen ? '#ff9800' : 'rgba(255, 255, 255, 0.12)'}
                  hoverBorderColor="rgba(255, 152, 0, 0.5)"
                  backgroundColor={isOpen ? 'rgba(255, 152, 0, 0.04)' : '#0b0b0b'}
                  showGrain={isOpen}
                  grainOpacity={0.45}
                  className={styles.serviceAccordionCard}
                  innerClassName={styles.serviceAccordionInner}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setActiveIndex(idx)}
                    className={styles.serviceTabBtn}
                  >
                    <span className={styles.serviceTabLeft}>
                      <span
                        className={`${styles.serviceTabIcon} ${
                          isOpen ? styles.serviceTabIconActive : ''
                        }`.trim()}
                      >
                        <ServiceItemIcon index={idx} />
                      </span>
                      <span className={styles.serviceTabTitle}>{service.title.toUpperCase()}</span>
                    </span>

                    <span className={styles.serviceTabArrow} aria-hidden="true">
                      {isOpen ? '-' : '+'}
                    </span>
                  </button>

                  {isOpen ? (
                    <div id={panelId} className={styles.serviceTabBody}>
                      <p className={styles.serviceTabDesc}>{service.description}</p>
                      <ul className={styles.serviceDeliverableList}>
                        {service.deliverables.map((del) => (
                          <li key={del} className={styles.serviceDeliverableItem}>
                            <span className={styles.serviceCheckIcon} aria-hidden="true">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5.2L4.1 7.2L8 3" stroke="currentColor" strokeWidth="1.3" />
                              </svg>
                            </span>
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </ChamferedPanel>
              );
            })}
          </div>

          <div className={styles.servicesGraphicCol}>
            <ServiceIsometricGraphic
              activeIndex={activeIndex}
              onSelectLayer={(layerIdx) => setActiveIndex(layerIdx)}
            />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
