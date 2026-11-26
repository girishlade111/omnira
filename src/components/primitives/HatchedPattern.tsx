import type { CSSProperties } from 'react';
import styles from './primitives.module.css';

export interface HatchedPatternProps {
  variant?: 'rail' | 'divider' | 'card';
  angleDeg?: number;
  opacity?: number;
  className?: string;
}

export function HatchedPattern({
  variant = 'rail',
  angleDeg,
  opacity,
  className = '',
}: HatchedPatternProps) {
  const variantClass =
    variant === 'divider'
      ? styles.hatchDivider
      : variant === 'card'
        ? styles.hatchCard
        : styles.hatchRail;

  const customStyle: CSSProperties = {};
  if (typeof angleDeg === 'number') {
    const color =
      variant === 'divider' ? 'var(--color-border-strong)' : 'var(--color-rail-stripe)';
    const gap = variant === 'divider' ? 2 : 4;
    customStyle.backgroundImage = `repeating-linear-gradient(${angleDeg}deg, ${color}, ${color} 1px, transparent 1px, transparent ${gap}px)`;
  }
  if (typeof opacity === 'number') {
    customStyle.opacity = opacity;
  }

  return (
    <div
      aria-hidden="true"
      className={`${variantClass} ${className}`.trim()}
      style={customStyle}
    />
  );
}
