'use client';

import { useState } from 'react';
import { TerminalIsometricGraphic } from '@/components/graphics';
import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading } from '@/components/primitives';
import { profileContent } from '@/content/profile';
import styles from './about.module.css';

function StepIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.1" />
          <path d="M7 4.5V9.5M4.5 7H9.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 1:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2C5 2 3.5 3.4 3.5 5.2C3.5 6.4 4.2 7.3 4.8 8H9.2C9.8 7.3 10.5 6.4 10.5 5.2C10.5 3.4 9 2 7 2Z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5.2 10H8.8M5.8 11.8H8.2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 2:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2L12 4.5L7 7L2 4.5L7 2Z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2 7L7 9.5L12 7M2 9.5L7 12L12 9.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 3:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="2.5" width="10" height="9" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2 5.5H12M5.5 5.5V11.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 10.5L11 3.5M11 3.5H6M11 3.5V8.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}

export function TerminalPanel() {
  const { terminal } = profileContent;
  const [activeStep, setActiveStep] = useState(0);

  const handleEnterCycle = () => {
    setActiveStep((prev) => (prev + 1) % terminal.steps.length);
  };

  return (
    <SectionFrame id="process-system" bottomBorder>
      <div className={styles.terminalSection}>
        <SectionHeading
          badge={terminal.heading}
          titleWhite="BEHIND OMNIRA. THIS IS"
          titleOrange="WHO I AM"
          description={terminal.description}
          align="split"
        />

        <div className={styles.terminalGrid}>
          <ChamferedPanel
            cornerCut={10}
            borderColor="rgba(255, 255, 255, 0.14)"
            backgroundColor="#0c0c0c"
            showGrain
            grainOpacity={0.5}
            className={styles.terminalLeftPanel}
            innerClassName={styles.terminalLeftInner}
          >
            <div className={styles.terminalTopBar}>
              <div className={styles.terminalBarLeft}>
                <span className={styles.terminalTrafficDots} aria-hidden="true">
                  <span className={styles.dotOrange} />
                  <span className={styles.dotDim} />
                  <span className={styles.dotDim} />
                </span>
                <span className={styles.terminalBarTitle}>{terminal.badge}</span>
              </div>
              <div className={styles.terminalBarStatus}>
                <span className={styles.terminalStatusMuted}>{terminal.statusLabel}</span>
                <span className={styles.terminalStatusOrange}>{terminal.statusValue}</span>
              </div>
            </div>

            <div className={styles.terminalBody}>
              <div className={styles.terminalStepsCol} role="tablist" aria-label="Workflow steps">
                {terminal.steps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  return (
                    <button
                      key={step.step}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveStep(idx)}
                      className={`${styles.terminalStepBtn} ${
                        isActive ? styles.terminalStepBtnActive : ''
                      }`.trim()}
                    >
                      <span className={styles.terminalStepIcon}>
                        <StepIcon index={idx} />
                      </span>
                      <span className={styles.terminalStepTitle}>{step.label}</span>
                      <span className={styles.terminalStepDesc}>{step.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.terminalGraphicCol}>
                <TerminalIsometricGraphic activeStep={activeStep} />
              </div>
            </div>

            <div className={styles.terminalCommandBar}>
              <div className={styles.terminalPromptLine}>
                <span className={styles.terminalPrompt}>{terminal.commandPrompt}</span>
                <span className={styles.terminalCommandDesktop}>
                  {terminal.commandTextDesktop}
                </span>
                <span className={styles.terminalCommandMobile}>
                  {terminal.commandTextMobile}
                </span>
                <span className={styles.terminalCursor} aria-hidden="true" />
              </div>

              <button
                type="button"
                onClick={handleEnterCycle}
                className={styles.terminalEnterBtn}
                aria-label="Advance terminal workflow preview step"
              >
                {terminal.enterLabel}
              </button>
            </div>
          </ChamferedPanel>

          <ChamferedPanel
            cornerCut={10}
            borderColor="rgba(255, 255, 255, 0.14)"
            backgroundColor="#0c0c0c"
            showGrain
            grainOpacity={0.5}
            className={styles.terminalRightPanel}
            innerClassName={styles.terminalRightInner}
          >
            <div className={styles.outputHeader}>
              <span className={styles.outputTitle}>{terminal.outputLabel}</span>
              <span className={styles.panelDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>

            <div className={styles.outputStatusBlock}>
              <p className={styles.outputReady}>{profileContent.readyToLaunchHeading}</p>
              <p className={styles.outputSummary}>{terminal.summaryLine}</p>
              <div className={styles.outputProgressTrack} aria-hidden="true">
                <span
                  className={styles.outputProgressFill}
                  style={{ width: `${((activeStep + 1) / terminal.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.systemCheckBlock}>
              <div className={styles.systemCheckHeader}>
                <span>{terminal.systemCheckLabel}</span>
                <span className={styles.systemCheckAllOk}>{terminal.systemCheckStatus}</span>
              </div>

              <ul className={styles.systemCheckList}>
                {terminal.checks.map((chk) => (
                  <li key={chk.label} className={styles.systemCheckRow}>
                    <span className={styles.systemCheckName}>{chk.label.toUpperCase()}</span>
                    <span className={styles.systemCheckOk}>{chk.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ChamferedPanel>
        </div>
      </div>
    </SectionFrame>
  );
}
