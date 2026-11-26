import Image from 'next/image';
import type { ProfileDetailsItem } from '@/types';
import styles from './about.module.css';

export interface ProfileDetailsProps {
  details: ProfileDetailsItem[];
}

function DetailRowIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2.5 12C2.5 9.8 4.5 8.2 7 8.2C9.5 8.2 11.5 9.8 11.5 12" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 1:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="10" height="8" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5 6.5H9" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 2:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 3:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2L8.4 5.2L12 5.6L9.3 8L10 11.5L7 9.7L4 11.5L4.7 8L2 5.6L5.6 5.2L7 2Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 12.2C7 12.2 11 8.6 11 5.6C11 3.4 9.2 1.8 7 1.8C4.8 1.8 3 3.4 3 5.6C3 8.6 7 12.2 7 12.2Z" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="7" cy="5.5" r="1.4" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}

export function ProfileDetails({ details }: ProfileDetailsProps) {
  return (
    <div className={styles.detailsWrap}>
      <div className={styles.detailsHeader}>
        <span className={styles.detailsHeaderLabel}>PROFILE</span>
        <span className={styles.panelDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>

      <dl className={styles.detailsList}>
        {details.map((row, idx) => (
          <div key={row.label} className={styles.detailRow}>
            <dt className={styles.detailTerm}>
              <span className={styles.detailIconBox}>
                <DetailRowIcon index={idx} />
              </span>
              <span>{row.label.toUpperCase()}</span>
            </dt>
            <dd className={styles.detailVal}>{row.value}</dd>
          </div>
        ))}

        <div className={styles.detailRow}>
          <dt className={styles.detailTerm}>
            <span className={styles.detailIconBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
                <rect x="8" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
                <rect x="2" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
                <rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </span>
            <span>TOOLS</span>
          </dt>
          <dd className={styles.detailToolsRow}>
            <Image src="/assets/icons/tools/inline-160-avatar-ccf185.svg" alt="Figma" width={14} height={14} unoptimized />
            <Image src="/assets/icons/tools/inline-166-avatar-9cef2b.svg" alt="Framer" width={14} height={14} unoptimized />
            <Image src="/assets/icons/tools/inline-172-avatar-cf00af.svg" alt="GSAP" width={14} height={14} unoptimized />
            <Image src="/assets/icons/tools/inline-178-avatar-7d5e39.svg" alt="Spline" width={14} height={14} unoptimized />
          </dd>
        </div>
      </dl>
    </div>
  );
}
