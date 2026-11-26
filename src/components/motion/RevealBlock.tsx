'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './motion.module.css';

export interface RevealBlockProps {
  children: ReactNode;
  delayMs?: number;
  distancePx?: number;
  as?: 'div' | 'section' | 'article';
  className?: string;
}

export function RevealBlock({
  children,
  delayMs = 0,
  distancePx = 56,
  as = 'div',
  className,
}: RevealBlockProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let fallbackTimerId: number | undefined;

    const rafId = window.requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.96) {
        return;
      }

      setIsPending(true);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIsPending(false);
              observer?.disconnect();
              break;
            }
          }
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -24px 0px',
        },
      );

      observer.observe(node);

      fallbackTimerId = window.setTimeout(() => {
        const currentRect = node.getBoundingClientRect();
        if (currentRect.top <= window.innerHeight * 1.1) {
          setIsPending(false);
          observer?.disconnect();
        }
      }, 1600);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      if (fallbackTimerId !== undefined) {
        window.clearTimeout(fallbackTimerId);
      }
    };
  }, []);

  const Tag = as;
  const combinedClassName = [
    styles.revealBlock,
    isPending ? styles.revealPending : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyle = {
    '--reveal-delay-ms': `${delayMs}ms`,
    '--reveal-distance-px': `${distancePx}px`,
  } as CSSProperties;

  return (
    <Tag
      ref={containerRef as never}
      className={combinedClassName}
      style={inlineStyle}
    >
      {children}
    </Tag>
  );
}
