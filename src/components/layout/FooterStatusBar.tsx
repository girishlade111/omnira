import { StatusIndicator } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import { LiveClock } from './LiveClock';
import styles from './layout.module.css';

export interface FooterStatusBarProps {
  overrideIso?: string;
}

export function FooterStatusBar({ overrideIso }: FooterStatusBarProps) {
  return (
    <div className={styles.footerStatusBar}>
      <StatusIndicator
        label={siteConfig.statusLabel}
        value={siteConfig.statusValue}
        color="green"
        pulse
      />

      <div className={styles.statusSignalStrip} aria-hidden="true">
        <svg
          width="116"
          height="18"
          viewBox="0 0 116 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 9H18L24 3L31 15L38 6L44 12L51 9H66L72 2L79 16L86 5L92 12L98 9H115"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1"
            strokeLinecap="square"
          />
          <circle cx="72" cy="2" r="1.5" fill="#ff9800" />
        </svg>
        <div className={styles.statusHatchDivider} />
      </div>

      <LiveClock overrideIso={overrideIso} />
    </div>
  );
}
