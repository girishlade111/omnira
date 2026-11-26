import styles from './graphics.module.css';

export interface OmniraLogoProps {
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Renders the geometric Omnira hexagonal mark paired with the Orbitron wordmark.
 */
export function OmniraLogo({ size = 'md', className }: OmniraLogoProps) {
  const iconWidth = size === 'sm' ? 18 : 21;
  const iconHeight = size === 'sm' ? 20 : 24;

  return (
    <span
      className={[
        styles.logo,
        size === 'sm' ? styles.logoSm : styles.logoMd,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 21 24"
        fill="none"
        aria-hidden="true"
        className={styles.logoMark}
      >
        <g clipPath="url(#omniraLogoClip)">
          <path
            fill="#FF9800"
            d="M0 6.169v12.815l10.5 4.663L21 18.985V6.17L10.5.339zm17.685 1.914v8.784L10.5 20.06l-7.185-3.192V8.083l7.185-3.99zM6.633 9.933v4.52l3.868 1.526 3.87-1.527V9.934l-3.87-1.91z"
          />
        </g>
        <defs>
          <clipPath id="omniraLogoClip">
            <path fill="#fff" d="M21 0H0v24h21z" />
          </clipPath>
        </defs>
      </svg>
      <span className={styles.logoWordmark}>OMNIRA</span>
    </span>
  );
}
