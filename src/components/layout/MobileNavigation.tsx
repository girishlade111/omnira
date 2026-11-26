'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { OmniraLogo } from '@/components/graphics';
import { ChamferedButton } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import styles from './layout.module.css';

export interface MobileNavigationProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
}

function isRouteActive(currentPath: string, href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function MobileNavigation({
  isOpen,
  currentPath,
  onClose,
}: MobileNavigationProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-nav-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className={styles.mobileDrawer}
    >
      <div className={styles.mobileDrawerHeader}>
        <Link href="/" className={styles.logoLink} onClick={onClose} aria-label="Omnira home">
          <OmniraLogo size="sm" />
        </Link>
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.mobileDrawerClose}
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </button>
      </div>

      <nav className={styles.mobileDrawerNav} aria-label="Mobile links">
        <ul className={styles.mobileDrawerList}>
          {siteConfig.navLinks.map((item) => {
            const active = isRouteActive(currentPath, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? `${styles.mobileDrawerLink} ${styles.mobileDrawerLinkActive}`
                      : styles.mobileDrawerLink
                  }
                >
                  <span>{item.label}</span>
                  {active ? <span className={styles.navActiveMarker} aria-hidden="true" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.mobileDrawerFooter}>
        <ChamferedButton
          variant="primary"
          size="lg"
          cornerCut={6}
          fullWidth
          showArrow
          href="/contact"
          onClick={onClose}
        >
          {"LET'S TALK"}
        </ChamferedButton>
      </div>
    </div>
  );
}
