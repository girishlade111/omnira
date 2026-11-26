import Link from 'next/link';
import { ChamferedPanel } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import styles from './layout.module.css';

export interface DesktopNavigationProps {
  currentPath: string;
}

function isRouteActive(currentPath: string, href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function DesktopNavigation({ currentPath }: DesktopNavigationProps) {
  return (
    <nav className={styles.desktopNavWrap} aria-label="Primary navigation">
      <ChamferedPanel
        cornerCut={8}
        borderColor="rgba(255, 255, 255, 0.10)"
        backgroundColor="rgba(255, 255, 255, 0.03)"
        innerClassName={styles.desktopNavPanel}
      >
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
      </ChamferedPanel>
    </nav>
  );
}
