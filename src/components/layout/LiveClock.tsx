'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';
import styles from './layout.module.css';

export interface LiveClockProps {
  timeZone?: string;
  overrideIso?: string;
  className?: string;
}

export function formatBerlinTime(date: Date, timeZone = 'Europe/Berlin'): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function LiveClock({
  timeZone = siteConfig.clockTimeZone,
  overrideIso,
  className,
}: LiveClockProps) {
  const [liveText, setLiveText] = useState<string>('--:--:-- --');

  useEffect(() => {
    if (overrideIso) return;

    const update = () => setLiveText(formatBerlinTime(new Date(), timeZone));
    const initialTimer = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [overrideIso, timeZone]);

  const timeText = overrideIso
    ? formatBerlinTime(new Date(overrideIso), timeZone)
    : liveText;

  return (
    <div className={className ? `${styles.liveClockWrap} ${className}` : styles.liveClockWrap}>
      <span className={styles.liveClockLabel}>{siteConfig.clockLabel}</span>
      <time
        className={styles.liveClockTime}
        dateTime={overrideIso}
        suppressHydrationWarning
      >
        {timeText}
      </time>
    </div>
  );
}
