import styles from './primitives.module.css';

export interface ExternalLinkIndicatorProps {
  size?: number;
  className?: string;
}

export function ExternalLinkIndicator({
  size = 12,
  className = '',
}: ExternalLinkIndicatorProps) {
  return (
    <span className={`${styles.externalLinkIcon} ${className}`.trim()} aria-hidden="true">
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}
