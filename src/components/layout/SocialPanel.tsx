import {
  ChamferedButton,
  ChamferedPanel,
  ExternalLinkIndicator,
  TechnicalBadge,
} from '@/components/primitives';
import styles from './layout.module.css';

const SOCIAL_ROWS = [
  {
    label: 'Email',
    displayValue: 'hello@omnira.studio',
    href: 'mailto:hello@omnira.studio',
    external: false,
  },
  {
    label: 'X',
    displayValue: '@omnira_design',
    href: 'https://x.com/Dmytri_Design',
    external: true,
  },
  {
    label: 'LinkedIn',
    displayValue: 'linkedin.com/in/omnira',
    href: 'https://www.linkedin.com/in/dmytri-design/',
    external: true,
  },
] as const;

export function SocialPanel() {
  return (
    <ChamferedPanel
      cornerCut={8}
      borderColor="rgba(255, 255, 255, 0.12)"
      backgroundColor="rgba(13, 13, 13, 0.9)"
      innerClassName={styles.socialPanelInner}
    >
      <div className={styles.socialPanelHeader}>
        <h3 className={styles.socialPanelTitle}>{"LET'S CONNECT"}</h3>
        <TechnicalBadge label="CHANNEL" dotColor="orange" />
      </div>

      <div className={styles.socialRows}>
        {SOCIAL_ROWS.map((row) => (
          <a
            key={row.label}
            href={row.href}
            target={row.external ? '_blank' : undefined}
            rel={row.external ? 'noopener noreferrer' : undefined}
            className={styles.socialRowLink}
          >
            <span className={styles.socialRowLeft}>
              <span className={styles.socialRowLabel}>{row.label}</span>
              <span className={styles.socialRowValue}>{row.displayValue}</span>
            </span>
            <ExternalLinkIndicator size={14} />
          </a>
        ))}
      </div>

      <ChamferedButton
        variant="primary"
        size="md"
        cornerCut={6}
        fullWidth
        showArrow
        href="/contact"
      >
        START A PROJECT
      </ChamferedButton>
    </ChamferedPanel>
  );
}
