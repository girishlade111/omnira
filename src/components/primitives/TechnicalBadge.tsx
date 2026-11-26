import { CornerMarker } from './CornerMarker';
import styles from './primitives.module.css';

export interface TechnicalBadgeProps {
  label: string;
  dotColor?: 'orange' | 'green' | 'none';
  variant?: 'amber' | 'yellow' | 'white';
  className?: string;
}

export function TechnicalBadge({
  label,
  dotColor = 'none',
  variant = 'amber',
  className = '',
}: TechnicalBadgeProps) {
  const isWhite = variant === 'white';
  const bracketColor = isWhite ? '#ffffff' : 'var(--color-accent)';

  return (
    <span
      className={`${styles.badgeRoot} ${isWhite ? styles.badgeWhite : styles.badgeAmber} ${className}`.trim()}
    >
      <CornerMarker size={4} thickness={1} inset={1} color={bracketColor} styleType="line" />
      {dotColor !== 'none' ? (
        <span
          aria-hidden="true"
          className={`${styles.badgeDot} ${
            dotColor === 'green' ? styles.badgeDotGreen : styles.badgeDotOrange
          }`}
        />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
