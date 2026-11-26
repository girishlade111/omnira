import styles from './primitives.module.css';

export interface StatusIndicatorProps {
  label?: string;
  value?: string;
  color?: 'green' | 'orange';
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  label,
  value,
  color = 'green',
  pulse = true,
  className = '',
}: StatusIndicatorProps) {
  return (
    <span
      className={`${styles.statusRoot} ${
        color === 'orange' ? styles.statusOrange : styles.statusGreen
      } ${className}`.trim()}
    >
      <span className={styles.statusBeacon} aria-hidden="true">
        <span
          className={`${styles.statusBeaconRing} ${pulse ? styles.statusBeaconRingPulse : ''}`.trim()}
        />
        <span className={styles.statusBeaconCore} />
      </span>
      {label ? <span className={styles.statusLabel}>{label}</span> : null}
      {value ? <span className={styles.statusValue}>{value}</span> : null}
    </span>
  );
}
