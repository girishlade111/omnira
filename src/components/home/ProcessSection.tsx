'use client';

import { useState } from 'react';
import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading, AnimatedCounter } from '@/components/primitives';
import { processContent } from '@/content/process';
import type { ProcessMetric, ProcessPhase } from '@/types';
import styles from './home.module.css';

function PhaseIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6.2" cy="6.2" r="3.8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9.2 9.2L12 12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 1:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2.2" y="2.2" width="9.6" height="9.6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.2 5.5H11.8M5.5 5.5V11.8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 2:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 4.2L2.2 7L5 9.8M9 4.2L11.8 7L9 9.8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2L8.3 5.2L11.8 5.5L9.1 7.8L9.9 11.3L7 9.4L4.1 11.3L4.9 7.8L2.2 5.5L5.7 5.2L7 2Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}

export function ProcessPhaseCard({
  phase,
  index,
  active,
  onSelect,
}: {
  phase: ProcessPhase;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={styles.phaseButton}
    >
      <ChamferedPanel
        cornerCut={8}
        borderColor={active ? '#ff9800' : 'rgba(255, 255, 255, 0.12)'}
        hoverBorderColor="rgba(255, 152, 0, 0.65)"
        backgroundColor={active ? 'rgba(255, 152, 0, 0.04)' : '#0b0b0b'}
        showGrain={active}
        grainOpacity={0.45}
        className={styles.phaseCard}
        innerClassName={styles.phaseCardInner}
      >
        <div className={styles.phaseTop}>
          <span className={`${styles.phaseIconBox} ${active ? styles.phaseIconBoxActive : ''}`.trim()}>
            <PhaseIcon index={index} />
          </span>
          <span className={styles.panelDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>

        <h3 className={styles.phaseTitle}>{phase.title.toUpperCase()}</h3>
        <p className={styles.phaseDesc}>{phase.description}</p>

        <div className={styles.phaseFoot}>
          <span className={`${styles.phaseCode} ${active ? styles.phaseCodeActive : ''}`.trim()}>
            {phase.phaseCode}
          </span>
          <span className={styles.phaseBarTrack} aria-hidden="true">
            <span className={`${styles.phaseBarFill} ${active ? styles.phaseBarFillActive : ''}`.trim()} />
          </span>
        </div>
      </ChamferedPanel>
    </button>
  );
}

export function ProcessMetrics({ metrics }: { metrics: ProcessMetric[] }) {
  return (
    <div className={styles.processMetricsRow}>
      {metrics.map((metric) => (
        <div key={metric.id} className={styles.processMetricItem}>
          <div className={styles.processMetricValue}>
            {metric.isInfinity ? (
              <span>&#8734;</span>
            ) : (
              <AnimatedCounter value={`${metric.value}${metric.displaySuffix}`} />
            )}
          </div>
          <div className={styles.processMetricLabel}>{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ProcessSection() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <SectionFrame id="process" bottomBorder>
      <div className={styles.sectionStack}>
        <SectionHeading
          badge={processContent.badge}
          titleWhite="FROM CONCEPT TO"
          titleOrange="LAUNCH"
          description={processContent.description}
          align="split"
        />

        <div className={styles.processGrid}>
          {processContent.phases.map((phase, idx) => (
            <ProcessPhaseCard
              key={phase.id}
              phase={phase}
              index={idx}
              active={idx === activePhase}
              onSelect={() => setActivePhase(idx)}
            />
          ))}
        </div>

        <ProcessMetrics metrics={processContent.metrics} />
      </div>
    </SectionFrame>
  );
}
