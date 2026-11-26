import Link from 'next/link';
import { siteConfig } from '@/config/site';
import styles from './layout.module.css';

export interface DesktopNavigationProps {
  currentPath: string;
}

function isRouteActive(currentPath: string, href: string): boolean {
  return currentPath === href;
}

export function DesktopNavigation({ currentPath }: DesktopNavigationProps) {
  return (
    <nav className={styles.desktopNavWrap} aria-label="Primary navigation">
      <ul className={styles.desktopNavList}>
        {siteConfig.navLinks.map((item) => {
          const active = isRouteActive(currentPath, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? `${styles.desktopNavLink} ${styles.desktopNavLinkActive}`
                    : styles.desktopNavLink
                }
              >
                {active ? <span className={styles.navActiveMarker} aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
