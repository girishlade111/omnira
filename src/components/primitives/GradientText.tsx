import type { ElementType, ReactNode } from 'react';
import styles from './primitives.module.css';

export interface GradientTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function GradientText({
  children,
  as: Component = 'span',
  className = '',
}: GradientTextProps) {
  return <Component className={`${styles.gradientText} ${className}`.trim()}>{children}</Component>;
}
