'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { OmniraLogo } from '@/components/graphics';
import { ChamferedButton } from '@/components/primitives';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';
import styles from './layout.module.css';

export function SiteHeader() {
  const pathname = usePathname() || '/';
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const menuOpen = openForPath === pathname;
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setOpenForPath(null);
    requestAnimationFrame(() => {
      toggleBtnRef.current?.focus();
    });
  }, []);

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerGrid}>
        <div className={styles.railLeft} aria-hidden="true" />
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoLink} aria-label="Omnira home">
            <OmniraLogo size="sm" />
          </Link>

          <DesktopNavigation currentPath={pathname} />

          <div className={styles.headerCtaDesktop}>
            <ChamferedButton
              variant="outline"
              size="sm"
              cornerCut={6}
              href="/contact"
              ariaLabel="Let's talk"
            >
              {"LET'S TALK"}
            </ChamferedButton>
          </div>

          <button
            ref={toggleBtnRef}
            type="button"
            className={styles.mobileMenuToggle}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setOpenForPath(pathname)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 5.5H17M3 10H17M3 14.5H17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
        <div className={styles.railRight} aria-hidden="true" />
      </div>

      <MobileNavigation
        isOpen={menuOpen}
        currentPath={pathname}
        onClose={closeMenu}
      />
    </header>
  );
}
