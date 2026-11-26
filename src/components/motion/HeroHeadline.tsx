'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';
import styles from './motion.module.css';

export interface HeroHeadlineProps {
  prefix?: string;
  words?: string[];
  intervalMs?: number;
  durationMs?: number;
  as?: 'h1' | 'h2';
  className?: string;
}

const DEFAULT_WORDS = siteConfig.hero.rotatingWords;
const TRANSLATE_Z_PX = 22;

export function HeroHeadline({
  prefix = siteConfig.hero.headlinePrefix,
  words = DEFAULT_WORDS,
  intervalMs = siteConfig.hero.rotationIntervalMs,
  durationMs = siteConfig.hero.rotationDurationMs,
  as = 'h1',
  className,
}: HeroHeadlineProps) {
  const safeWords = words.length > 0 ? words : ['experience'];
  const staticWord = safeWords[safeWords.length - 1] ?? 'experience';

  const [step, setStep] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    const initTimer = window.setTimeout(syncPreference, 0);
    mediaQuery.addEventListener('change', syncPreference);

    return () => {
      window.clearTimeout(initTimer);
      mediaQuery.removeEventListener('change', syncPreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || safeWords.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStep((prev) => prev + 1);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, prefersReducedMotion, safeWords.length]);

  const Tag = as;
  const combinedClassName = className
    ? `${styles.heroHeadline} ${className}`
    : styles.heroHeadline;

  const trackStyle = {
    transform: `rotateX(${-step * 90}deg)`,
    '--barrel-duration-ms': `${durationMs}ms`,
  } as CSSProperties;

  const faces = [0, 1, 2, 3].map((slot) => {
    const offset = (slot - (step % 4) + 4) % 4;
    const wordOffset = offset === 3 ? -1 : offset;
    const wordIndex =
      (((step + wordOffset) % safeWords.length) + safeWords.length) %
      safeWords.length;
    return {
      slot,
      word: safeWords[wordIndex],
      angleDeg: slot * 90,
    };
  });

  return (
    <Tag className={combinedClassName}>
      <span className={styles.srOnly}>{`${prefix} ${staticWord}`}</span>
      <span className={styles.heroPrefix} aria-hidden="true">
        {prefix}
      </span>
      <span className={styles.barrelViewport} aria-hidden="true">
        {prefersReducedMotion ? (
          <span className={styles.staticWord}>{staticWord}</span>
        ) : (
          <span className={styles.barrelTrack} style={trackStyle}>
            {faces.map((face) => (
              <span
                key={face.slot}
                className={styles.barrelFace}
                style={{
                  transform: `rotateX(${face.angleDeg}deg) translateZ(${TRANSLATE_Z_PX}px)`,
                }}
              >
                <span className={styles.barrelWord}>{face.word}</span>
              </span>
            ))}
          </span>
        )}
      </span>
    </Tag>
  );
}
