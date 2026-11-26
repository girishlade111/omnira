import { HatchedPattern } from './HatchedPattern';
import styles from './primitives.module.css';

export interface TechnicalDividerProps {
  orientation?: 'horizontal' | 'vertical';
  hatched?: boolean;
  accentRule?: boolean;
  className?: string;
}

export function TechnicalDivider({
  orientation = 'horizontal',
  hatched = false,
  accentRule = false,
  className = '',
}: TechnicalDividerProps) {
  if (accentRule) {
    return <div aria-hidden="true" className={`${styles.dividerAccentRule} ${className}`.trim()} />;
  }

  if (hatched) {
    return <HatchedPattern variant="divider" className={className} />;
  }

  return (
    <div
      aria-hidden="true"
      className={`${
        orientation === 'vertical' ? styles.dividerVertical : styles.dividerHorizontal
      } ${className}`.trim()}
    />
  );
}
