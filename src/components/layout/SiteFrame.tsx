import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import styles from './layout.module.css';

export interface SiteFrameProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function SiteFrame({
  children,
  className,
  showHeader = true,
  showFooter = true,
}: SiteFrameProps) {
  return (
    <div className={className ? `${styles.siteFrame} ${className}` : styles.siteFrame}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      {showHeader ? <SiteHeader /> : null}
      <main id="main-content" className={styles.mainContent}>
        {children}
      </main>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
