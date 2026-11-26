'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface AnimatedCounterProps {
  value: string | number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

interface ParsedCounter {
  isInfinity: boolean;
  target: number;
  suffix: string;
  finalDisplay: string;
}

function parseCounterInput(value: string | number, extraSuffix?: string): ParsedCounter {
  const raw = String(value).trim();
  const suffixExtra = extraSuffix ?? '';

  if (raw === '∞' || raw.toLowerCase() === 'infinity') {
    return {
      isInfinity: true,
      target: 0,
      suffix: suffixExtra,
      finalDisplay: `∞${suffixExtra}`,
    };
  }

  const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return {
      isInfinity: true,
      target: 0,
      suffix: '',
      finalDisplay: `${raw}${suffixExtra}`,
    };
  }

  const target = Number(match[1]);
  const parsedSuffix = `${match[2] ?? ''}${suffixExtra}`;
  return {
    isInfinity: false,
    target,
    suffix: parsedSuffix,
    finalDisplay: `${target}${parsedSuffix}`,
  };
}

export function AnimatedCounter({
  value,
  suffix,
  durationMs = 900,
  className = '',
}: AnimatedCounterProps) {
  const parsed = useMemo(() => parseCounterInput(value, suffix), [value, suffix]);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const animatedKeyRef = useRef<string | null>(null);
  const [animatedState, setAnimatedState] = useState<{ key: string; text: string } | null>(null);

  useEffect(() => {
    if (parsed.isInfinity || typeof window === 'undefined') {
      return;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const node = spanRef.current;
    if (!node) {
      return;
    }

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || animatedKeyRef.current === parsed.finalDisplay) {
          return;
        }
        animatedKeyRef.current = parsed.finalDisplay;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(parsed.target * eased);
          const nextText = progress < 1 ? `${current}${parsed.suffix}` : parsed.finalDisplay;
          setAnimatedState({ key: parsed.finalDisplay, text: nextText });
          if (progress < 1) {
            rafId = window.requestAnimationFrame(step);
          }
        };

        rafId = window.requestAnimationFrame(step);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [parsed, durationMs]);

  const displayValue =
    animatedState && animatedState.key === parsed.finalDisplay
      ? animatedState.text
      : parsed.finalDisplay;

  return (
    <span ref={spanRef} className={className}>
      {displayValue}
    </span>
  );
}
