import type { ReactNode } from 'react';
import styles from './layout.module.css';

export interface SectionFrameProps {
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  as?: 'section' | 'div' | 'footer';
  padding?: 'default' | 'compact' | 'none';
  topBorder?: boolean;
  bottomBorder?: boolean;
  className?: string;
  innerClassName?: string;
}

export function SectionFrame({
  children,
  id,
  ariaLabel,
  ariaLabelledBy,
  as: Tag = 'section',
  padding = 'default',
  topBorder = false,
  bottomBorder = true,
  className,
  innerClassName,
}: SectionFrameProps) {
  const frameClasses = [
    styles.sectionFrame,
    topBorder ? styles.sectionTopBorder : '',
    bottomBorder ? styles.sectionBottomBorder : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  const padClass =
    padding === 'compact'
      ? styles.sectionInnerCompact
      : padding === 'none'
        ? styles.sectionInnerNone
        : '';

  const contentClasses = [styles.sectionInner, padClass, innerClassName || '']
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={frameClasses}
    >
      <div className={styles.railLeft} aria-hidden="true" />
      <div className={contentClasses}>{children}</div>
      <div className={styles.railRight} aria-hidden="true" />
    </Tag>
  );
}
