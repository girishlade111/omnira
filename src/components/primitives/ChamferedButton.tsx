'use client';

import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { CornerMarker } from './CornerMarker';
import { ExternalLinkIndicator } from './ExternalLinkIndicator';
import styles from './primitives.module.css';

export type ChamferedButtonVariant = 'primary' | 'outline' | 'secondary';
export type ChamferedButtonSize = 'sm' | 'md' | 'lg';

export interface ChamferedButtonProps {
  children: ReactNode;
  variant?: ChamferedButtonVariant;
  size?: ChamferedButtonSize;
  cornerCut?: number;
  showCornerTriangles?: boolean;
  showArrow?: boolean;
  href?: string;
  external?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  error?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export function ChamferedButton({
  children,
  variant = 'primary',
  size = 'md',
  cornerCut = 6,
  showCornerTriangles = true,
  showArrow = false,
  href,
  external = false,
  fullWidth = false,
  disabled = false,
  loading = false,
  selected = false,
  error = false,
  type = 'button',
  onClick,
  className = '',
  ariaLabel,
  ariaExpanded,
  ariaControls,
}: ChamferedButtonProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const node = elRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setDims((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isPrimary = variant === 'primary' || selected;
  const isOutline = variant === 'outline' && !selected;

  const fillColor = isPrimary ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0)';
  const strokeColor = error
    ? 'var(--color-error)'
    : isPrimary
      ? 'var(--color-accent)'
      : isOutline
        ? 'var(--color-accent)'
        : 'var(--color-border-button)';
  const strokeWidth = isPrimary ? 1 : isOutline ? 1 : 0.75;
  const triangleColor = isPrimary ? '#000000' : isOutline ? 'var(--color-accent)' : '#ffffff';

  const variantClass = selected
    ? styles.buttonSelected
    : variant === 'primary'
      ? styles.buttonVariantPrimary
      : variant === 'outline'
        ? styles.buttonVariantOutline
        : styles.buttonVariantSecondary;

  const sizeClass =
    size === 'sm'
      ? styles.buttonSizeSm
      : size === 'lg'
        ? styles.buttonSizeLg
        : styles.buttonSizeMd;

  const combinedClassName = [
    styles.buttonRoot,
    variantClass,
    sizeClass,
    fullWidth ? styles.buttonFullWidth : '',
    error ? styles.buttonError : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const c = Math.min(cornerCut, dims.width / 3 || cornerCut, dims.height / 3 || cornerCut);
  const inset = strokeWidth / 2;
  const w = dims.width;
  const h = dims.height;
  const svgPath =
    w > 0 && h > 0
      ? `M ${inset + c} ${inset} L ${w - inset - c} ${inset} L ${w - inset} ${inset + c} L ${w - inset} ${h - inset - c} L ${w - inset - c} ${h - inset} L ${inset + c} ${h - inset} L ${inset} ${h - inset - c} L ${inset} ${inset + c} Z`
      : '';

  const innerContent = (
    <>
      {w > 0 && h > 0 ? (
        <svg
          className={styles.buttonSvg}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={svgPath} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      ) : null}

      {showCornerTriangles ? (
        <CornerMarker
          size={6}
          inset={1}
          color={triangleColor}
          styleType="triangle"
          className={styles.buttonTriangles}
        />
      ) : null}

      <span className={styles.buttonContent}>
        {loading ? <span className={styles.buttonSpinner} aria-hidden="true" /> : null}
        <span>{children}</span>
        {showArrow ? <ExternalLinkIndicator size={12} /> : null}
      </span>
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a
          ref={(node) => {
            elRef.current = node;
          }}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClassName}
          aria-label={ariaLabel}
          onClick={onClick}
        >
          {innerContent}
        </a>
      );
    }

    return (
      <Link
        ref={(node) => {
          elRef.current = node;
        }}
        href={href}
        className={combinedClassName}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      ref={(node) => {
        elRef.current = node;
      }}
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
      className={combinedClassName}
    >
      {innerContent}
    </button>
  );
}
