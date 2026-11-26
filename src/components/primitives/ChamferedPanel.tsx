'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PUBLIC_ASSETS } from '@/lib/assets';
import { CornerMarker } from './CornerMarker';
import styles from './primitives.module.css';

export interface ChamferedPanelProps {
  children: ReactNode;
  cornerCut?: number;
  notchDepth?: number;
  notchWidth?: number;
  hasTopNotch?: boolean;
  hasBottomNotch?: boolean;
  hasLeftNotch?: boolean;
  hasRightNotch?: boolean;
  borderColor?: string;
  hoverBorderColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  showGrain?: boolean;
  grainOpacity?: number;
  cornerAccents?: boolean;
  glowColor?: string;
  className?: string;
  innerClassName?: string;
  as?: ElementType;
}

function buildChamferPath(
  w: number,
  h: number,
  cut: number,
  notchDepth: number,
  notchWidth: number,
  hasTopNotch: boolean,
  hasBottomNotch: boolean,
  hasLeftNotch: boolean,
  hasRightNotch: boolean,
  inset: number
): string {
  const x0 = inset;
  const y0 = inset;
  const x1 = Math.max(inset + 2, w - inset);
  const y1 = Math.max(inset + 2, h - inset);
  const c = Math.min(cut, (x1 - x0) / 3, (y1 - y0) / 3);
  const nd = Math.min(notchDepth, (x1 - x0) / 6, (y1 - y0) / 6);
  const nw = Math.min(notchWidth, Math.max(0, x1 - x0 - 2 * (c + nd + 8)));
  const nh = Math.min(notchWidth, Math.max(0, y1 - y0 - 2 * (c + nd + 8)));

  const pts: Array<[number, number]> = [];
  pts.push([x0 + c, y0]);

  if (hasTopNotch && nw > 4 && nd > 0) {
    const midX = (x0 + x1) / 2;
    const half = nw / 2;
    pts.push([midX - half - nd, y0]);
    pts.push([midX - half, y0 + nd]);
    pts.push([midX + half, y0 + nd]);
    pts.push([midX + half + nd, y0]);
  }

  pts.push([x1 - c, y0]);
  pts.push([x1, y0 + c]);

  if (hasRightNotch && nh > 4 && nd > 0) {
    const midY = (y0 + y1) / 2;
    const half = nh / 2;
    pts.push([x1, midY - half - nd]);
    pts.push([x1 - nd, midY - half]);
    pts.push([x1 - nd, midY + half]);
    pts.push([x1, midY + half + nd]);
  }

  pts.push([x1, y1 - c]);
  pts.push([x1 - c, y1]);

  if (hasBottomNotch && nw > 4 && nd > 0) {
    const midX = (x0 + x1) / 2;
    const half = nw / 2;
    pts.push([midX + half + nd, y1]);
    pts.push([midX + half, y1 - nd]);
    pts.push([midX - half, y1 - nd]);
    pts.push([midX - half - nd, y1]);
  }

  pts.push([x0 + c, y1]);
  pts.push([x0, y1 - c]);

  if (hasLeftNotch && nh > 4 && nd > 0) {
    const midY = (y0 + y1) / 2;
    const half = nh / 2;
    pts.push([x0, midY + half + nd]);
    pts.push([x0 + nd, midY + half]);
    pts.push([x0 + nd, midY - half]);
    pts.push([x0, midY - half - nd]);
  }

  pts.push([x0, y0 + c]);

  return pts.map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`).join(' ') + ' Z';
}

export function ChamferedPanel({
  children,
  cornerCut = 12,
  notchDepth = 8,
  notchWidth = 120,
  hasTopNotch = false,
  hasBottomNotch = false,
  hasLeftNotch = false,
  hasRightNotch = false,
  borderColor = 'var(--color-border-hairline)',
  hoverBorderColor,
  backgroundColor = 'var(--color-surface-card)',
  strokeWidth = 1,
  showGrain = false,
  grainOpacity = 0.8,
  cornerAccents = false,
  glowColor,
  className = '',
  innerClassName = '',
  as: Component = 'div',
}: ChamferedPanelProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rawId = useId().replace(/:/g, '');
  const clipId = `panel-clip-${rawId}`;
  const glowId = `panel-glow-${rawId}`;
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const pathData = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return '';
    }
    return buildChamferPath(
      size.width,
      size.height,
      cornerCut,
      notchDepth,
      notchWidth,
      hasTopNotch,
      hasBottomNotch,
      hasLeftNotch,
      hasRightNotch,
      strokeWidth / 2
    );
  }, [
    size.width,
    size.height,
    cornerCut,
    notchDepth,
    notchWidth,
    hasTopNotch,
    hasBottomNotch,
    hasLeftNotch,
    hasRightNotch,
    strokeWidth,
  ]);

  const fallbackClipStyle: CSSProperties =
    size.width === 0
      ? {
          clipPath: `polygon(${cornerCut}px 0, calc(100% - ${cornerCut}px) 0, 100% ${cornerCut}px, 100% calc(100% - ${cornerCut}px), calc(100% - ${cornerCut}px) 100%, ${cornerCut}px 100%, 0 calc(100% - ${cornerCut}px), 0 ${cornerCut}px)`,
        }
      : {};

  const cssVars = hoverBorderColor
    ? ({ '--panel-hover-border': hoverBorderColor } as CSSProperties)
    : undefined;

  return (
    <Component
      ref={rootRef}
      className={`${styles.panelRoot} ${className}`.trim()}
      style={cssVars}
    >
      {size.width > 0 && size.height > 0 ? (
        <svg
          className={styles.panelSvg}
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={pathData} />
            </clipPath>
            {glowColor ? (
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ) : null}
          </defs>

          <path
            d={pathData}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
            className={styles.panelPath}
            data-has-hover={hoverBorderColor ? 'true' : 'false'}
            filter={glowColor ? `url(#${glowId})` : undefined}
          />

          {showGrain ? (
            <image
              href={PUBLIC_ASSETS.textures.darkGrain.webp}
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              preserveAspectRatio="xMidYMid slice"
              opacity={grainOpacity}
              clipPath={`url(#${clipId})`}
              style={{ mixBlendMode: 'screen' }}
            />
          ) : null}
        </svg>
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor,
            border: `${strokeWidth}px solid ${borderColor}`,
            pointerEvents: 'none',
            ...fallbackClipStyle,
          }}
        />
      )}

      {cornerAccents ? (
        <CornerMarker
          size={6}
          thickness={1}
          inset={2}
          color={borderColor}
          styleType="line"
        />
      ) : null}

      <div className={`${styles.panelInner} ${innerClassName}`.trim()}>{children}</div>
    </Component>
  );
}
