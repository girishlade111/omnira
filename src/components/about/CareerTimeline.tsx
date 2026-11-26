'use client';

import { useState } from 'react';
import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading } from '@/components/primitives';
import { timelineContent } from '@/content/timeline';
import styles from './about.module.css';

const DEFAULT_FEATURED_YEARS = new Set(['2020', '2023', '2026']);

export function CareerTimeline() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  return (
    <SectionFrame id="timeline" bottomBorder>
      <div className={styles.timelineSection}>
        <SectionHeading
          badge={timelineContent.badge}
          titleWhite="YEARS OF FOCUSED"
          titleOrange="DIGITAL CRAFT"
          description={timelineContent.description}
          align="split"
        />

        <div className={styles.timelineList}>
          {timelineContent.items.map((item, idx) => {
            const isHighlighted = selectedYear
              ? selectedYear === item.year
              : DEFAULT_FEATURED_YEARS.has(item.year);

            return (
              <div
                key={item.id}
                className={`${styles.timelineRow} ${
                  isHighlighted ? styles.timelineRowActive : ''
                }`.trim()}
              >
                <div className={styles.timelineYearCol}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedYear((prev) => (prev === item.year ? null : item.year))
                    }
                    className={styles.timelineYearBtn}
                    aria-pressed={selectedYear === item.year}
                  >
                    {item.year}
                  </button>
                </div>

                <div className={styles.timelineTrackCol} aria-hidden="true">
                  {idx > 0 ? <span className={styles.timelineLineTop} /> : <span className={styles.timelineLineSpacer} />}
                  <span
                    className={`${styles.timelineNode} ${
                      isHighlighted ? styles.timelineNodeActive : ''
                    }`.trim()}
                  />
                  {idx < timelineContent.items.length - 1 ? (
                    <span className={styles.timelineLineBottom} />
                  ) : (
                    <span className={styles.timelineLineSpacer} />
                  )}
                </div>

                <ChamferedPanel
                  cornerCut={8}
                  borderColor={
                    isHighlighted ? 'rgba(255, 152, 0, 0.35)' : 'rgba(255, 255, 255, 0.1)'
                  }
                  hoverBorderColor="rgba(255, 152, 0, 0.45)"
                  backgroundColor="#0b0b0b"
                  className={styles.timelineCard}
                  innerClassName={styles.timelineCardInner}
                >
                  <div className={styles.timelineCardCopy}>
                    <h3 className={styles.timelineTitle}>{item.title.toUpperCase()}</h3>
                    <p className={styles.timelineDesc}>{item.description}</p>
                  </div>

                  <div className={styles.timelineArtWrap}>
                    <picture className={styles.timelinePicture}>
                      <source type="image/avif" srcSet={item.image.avif} />
                      <source type="image/webp" srcSet={item.image.webp} />
                      <img
                        src={item.image.fallback}
                        alt={item.image.alt}
                        width={item.image.width}
                        height={item.image.height}
                        loading="lazy"
                        className={styles.timelineImg}
                      />
                    </picture>
                  </div>
                </ChamferedPanel>
              </div>
            );
          })}
        </div>
      </div>
    </SectionFrame>
  );
}
