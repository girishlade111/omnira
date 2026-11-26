import { ChamferedPanel } from '@/components/primitives';
import styles from './contact.module.css';

export interface ContactInfoCardProps {
  icon: 'email' | 'location';
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

function CardIcon({ icon }: { icon: 'email' | 'location' }) {
  if (icon === 'email') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3.5" width="12" height="9" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 4.2L8 8.6L13.5 4.2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14C8 14 12.5 9.8 12.5 6.3C12.5 3.8 10.5 2 8 2C5.5 2 3.5 3.8 3.5 6.3C3.5 9.8 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="6.2" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function ContactInfoCard({
  icon,
  label,
  value,
  href,
  external = false,
}: ContactInfoCardProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={styles.infoCardLink}
    >
      <ChamferedPanel
        cornerCut={8}
        borderColor="rgba(255, 255, 255, 0.14)"
        hoverBorderColor="#ff9800"
        backgroundColor="rgba(255, 255, 255, 0.02)"
        className={styles.infoCardPanel}
        innerClassName={styles.infoCardInner}
      >
        <div className={styles.infoIconBox} aria-hidden="true">
          <CardIcon icon={icon} />
        </div>
        <div className={styles.infoText}>
          <span className={styles.infoLabel}>{label}</span>
          <span className={styles.infoValue}>{value}</span>
        </div>
      </ChamferedPanel>
    </a>
  );
}
