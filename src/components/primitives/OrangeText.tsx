import type { ElementType, ReactNode } from 'react';
import styles from './primitives.module.css';

export interface OrangeTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function OrangeText({
  children,
  as: Component = 'span',
  className = '',
}: OrangeTextProps) {
  return <Component className={`${styles.orangeText} ${className}`.trim()}>{children}</Component>;
}
