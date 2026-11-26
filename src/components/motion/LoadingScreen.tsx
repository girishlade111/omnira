'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './motion.module.css';

export interface LoadingScreenProps {
  minDurationMs?: number;
  fadeDurationMs?: number;
  maxWaitMs?: number;
  gridSizePx?: number;
  sessionKey?: string;
  onComplete?: () => void;
}

type LoaderPhase = 'active' | 'exiting' | 'done';

const STAGGER_MAX_MS = 520;
const DEFAULT_SESSION_KEY = 'omnira_initial_loader_seen';

export function LoadingScreen({
  minDurationMs = 1200,
  fadeDurationMs = 750,
  maxWaitMs = 4000,
  gridSizePx = 80,
  sessionKey = DEFAULT_SESSION_KEY,
  onComplete,
}: LoadingScreenProps) {
  const [phase, setPhase] = useState<LoaderPhase>('active');
  const [grid, setGrid] = useState<{ cols: number; rows: number }>({
    cols: 16,
    rows: 10,
  });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let exitTimerId: number | undefined;
    let doneTimerId: number | undefined;

    const finishImmediately = () => {
      if (cancelled) {
        return;
      }
      setPhase('done');
      onCompleteRef.current?.();
    };

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let alreadySeen = false;
    try {
      const stored = window.sessionStorage.getItem(sessionKey);
      alreadySeen = stored === '1' || stored === 'true';
    } catch {
      alreadySeen = false;
    }

    if (reducedMotion || alreadySeen) {
      const immediateId = window.setTimeout(finishImmediately, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(immediateId);
      };
    }

    const updateGrid = () => {
      const cols = Math.max(1, Math.ceil(window.innerWidth / gridSizePx));
      const rows = Math.max(1, Math.ceil(window.innerHeight / gridSizePx));
      setGrid((prev) =>
        prev.cols === cols && prev.rows === rows ? prev : { cols, rows },
      );
    };

    const rafId = window.requestAnimationFrame(updateGrid);
    window.addEventListener('resize', updateGrid);

    let exitStarted = false;
    const startExit = () => {
      if (cancelled || exitStarted) {
        return;
      }
      exitStarted = true;
      try {
        window.sessionStorage.setItem(sessionKey, '1');
      } catch {
        // Ignore storage errors in restricted browsing contexts.
      }
      setPhase('exiting');
      doneTimerId = window.setTimeout(() => {
        finishImmediately();
      }, fadeDurationMs + STAGGER_MAX_MS);
    };

    const minDelayPromise = new Promise<void>((resolve) => {
      exitTimerId = window.setTimeout(resolve, minDurationMs);
    });

    const fontsReadyPromise: Promise<unknown> =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    Promise.all([minDelayPromise, fontsReadyPromise]).then(() => {
      startExit();
    });

    const maxWaitTimerId = window.setTimeout(() => {
      startExit();
    }, maxWaitMs);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateGrid);
      if (exitTimerId !== undefined) {
        window.clearTimeout(exitTimerId);
      }
      if (doneTimerId !== undefined) {
        window.clearTimeout(doneTimerId);
      }
      window.clearTimeout(maxWaitTimerId);
    };
  }, [fadeDurationMs, gridSizePx, maxWaitMs, minDurationMs, sessionKey]);

  const tiles = useMemo(() => {
    const total = grid.cols * grid.rows;
    const maxDiagonal = Math.max(1, grid.cols + grid.rows);
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / grid.cols);
      const col = index % grid.cols;
      const delayMs = Math.round(((row + col) / maxDiagonal) * STAGGER_MAX_MS);
      return { index, delayMs };
    });
  }, [grid.cols, grid.rows]);

  if (phase === 'done') {
    return null;
  }

  const overlayStyle = {
    gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
    '--loader-fade-ms': `${fadeDurationMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={
        phase === 'exiting'
          ? `${styles.loaderOverlay} ${styles.loaderOverlayExiting}`
          : styles.loaderOverlay
      }
      style={overlayStyle}
      aria-hidden="true"
      role="presentation"
      data-phase={phase}
    >
      {tiles.map((tile) => (
        <div
          key={tile.index}
          className={
            phase === 'exiting'
              ? `${styles.loaderTile} ${styles.loaderTileExiting}`
              : styles.loaderTile
          }
          style={{ '--tile-delay': `${tile.delayMs}ms` } as CSSProperties}
        />
      ))}
    </div>
  );
}
