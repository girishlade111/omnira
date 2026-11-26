import type { ContactStatusRow } from '@/types';
import styles from './contact.module.css';

export interface ContactStatusProps {
  rows: ContactStatusRow[];
}

function StatusRowIcon({ index }: { index: number }) {
  if (index === 0) {
    return <span className={styles.statusDotOrange} aria-hidden="true" />;
  }
  if (index === 1) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" />
        <path d="M6 3.5V6L7.7 7.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="7.5" width="2" height="3" fill="currentColor" />
      <rect x="5" y="5" width="2" height="5.5" fill="currentColor" />
      <rect x="8.5" y="2" width="2" height="8.5" fill="currentColor" />
    </svg>
  );
}

export function ContactStatus({ rows }: ContactStatusProps) {
  return (
    <ul className={styles.statusList} aria-label="Contact availability status">
      {rows.map((row, idx) => (
        <li key={row.label} className={styles.statusRow}>
          <span className={styles.statusIconWrap}>
            <StatusRowIcon index={idx} />
          </span>
          <span className={styles.statusLabel}>{row.label.toUpperCase()}</span>
          <span className={styles.statusValue}>{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
