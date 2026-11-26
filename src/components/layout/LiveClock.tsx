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
  const [timeText, setTimeText] = useState<string>(() =>
    overrideIso ? formatBerlinTime(new Date(overrideIso), timeZone) : '--:--:-- --',
  );

  useEffect(() => {
    if (overrideIso) {
      setTimeText(formatBerlinTime(new Date(overrideIso), timeZone));
      return;
    }

    const update = () => setTimeText(formatBerlinTime(new Date(), timeZone));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [overrideIso, timeZone]);

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
