'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OmniraLogo } from '@/components/graphics';
import { ChamferedPanel } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import styles from './layout.module.css';

export function FooterNavigation() {
  const pathname = usePathname() || '/';

  return (
    <ChamferedPanel
      cornerCut={8}
      borderColor="rgba(255, 255, 255, 0.10)"
      backgroundColor="rgba(255, 255, 255, 0.02)"
      innerClassName={styles.footerNavBarInner}
    >
      <Link href="/" className={styles.logoLink} aria-label="Omnira home">
        <OmniraLogo size="sm" />
      </Link>

      <nav aria-label="Footer navigation">
        <ul className={styles.footerNavList}>
          {siteConfig.navLinks.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? `${styles.footerNavLink} ${styles.footerNavLinkActive}`
                      : styles.footerNavLink
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className={styles.footerCopyright}>&copy; MADE IN STYLOKIT</p>
    </ChamferedPanel>
  );
}
