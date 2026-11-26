'use client';

import type { ImageVariants } from '@/types';
import { servicesContent } from '@/content/services';
import styles from './graphics.module.css';

export interface IsometricLayerGeometry {
  layerWidth: number;
  layerHeight: number;
  baseX: number;
  baseY: number;
  stepY: number;
  showExtrusion: boolean;
  boxHeight: number;
  interactive: boolean;
}

export interface IsometricLayerStackProps {
  layers: ImageVariants[];
  activeIndex: number;
  geometry: IsometricLayerGeometry;
  ariaLabel: string;
  onSelectLayer?: (index: number) => void;
  className?: string;
}

const DIAMOND_VERTICES = {
  top: { x: 50, y: 5 },
  right: { x: 98, y: 40 },
  bottom: { x: 50, y: 75 },
  left: { x: 2, y: 40 },
};

const DIAMOND_CLIP_PATH = 'polygon(50% 5%, 98% 40%, 50% 75%, 2% 40%)';

function getVertexCoordinate(
  layerIndex: number,
  vertex: { x: number; y: number },
  geometry: IsometricLayerGeometry,
) {
  const centerX = geometry.baseX;
  const centerY = geometry.baseY + layerIndex * geometry.stepY;
  return {
    x: centerX + ((vertex.x - 50) / 100) * geometry.layerWidth,
    y: centerY + ((vertex.y - 50) / 100) * geometry.layerHeight,
  };
}

function buildConnectorPoints(
  count: number,
  vertex: { x: number; y: number },
  geometry: IsometricLayerGeometry,
): string {
  return Array.from({ length: count })
    .map((_, idx) => {
      const pt = getVertexCoordinate(idx, vertex, geometry);
      return `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
    })
    .join(' ');
}

/**
 * Shared pure React + CSS clip-path isometric diamond stack with SVG dashed vertical guides.
 */
export function IsometricLayerStack({
  layers,
  activeIndex,
  geometry,
  ariaLabel,
  onSelectLayer,
  className,
}: IsometricLayerStackProps) {
  const count = layers.length;
  const leftLinePoints = buildConnectorPoints(count, DIAMOND_VERTICES.left, geometry);
  const rightLinePoints = buildConnectorPoints(count, DIAMOND_VERTICES.right, geometry);
  const frontLinePoints = buildConnectorPoints(count, DIAMOND_VERTICES.bottom, geometry);

  return (
    <div
      className={[styles.isometricRoot, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={ariaLabel}
    >
      {layers.map((layer, idx) => {
        const isActive = idx === activeIndex;
        const centerY = geometry.baseY + idx * geometry.stepY;
        const zIndex = isActive ? count + 50 : count - idx + 1;
        const distanceRatio = count <= 2 ? 1 : Math.max(0, idx - 1) / Math.max(1, count - 2);
        const inactiveOpacity = 0.72 + (0.28 - 0.72) * Math.min(1, distanceRatio);
        const layerOpacity = isActive ? 1 : geometry.showExtrusion ? inactiveOpacity : 0.62;
        const translateY = isActive ? -3 : 0;
        const scale = isActive && geometry.interactive ? 1.03 : 1;

        const leftExtrusionClip = `polygon(${DIAMOND_VERTICES.left.x}% ${DIAMOND_VERTICES.left.y}%, ${DIAMOND_VERTICES.bottom.x}% ${DIAMOND_VERTICES.bottom.y}%, ${DIAMOND_VERTICES.bottom.x}% calc(${DIAMOND_VERTICES.bottom.y}% + ${geometry.boxHeight}px), ${DIAMOND_VERTICES.left.x}% calc(${DIAMOND_VERTICES.left.y}% + ${geometry.boxHeight}px))`;
        const rightExtrusionClip = `polygon(${DIAMOND_VERTICES.bottom.x}% ${DIAMOND_VERTICES.bottom.y}%, ${DIAMOND_VERTICES.right.x}% ${DIAMOND_VERTICES.right.y}%, ${DIAMOND_VERTICES.right.x}% calc(${DIAMOND_VERTICES.right.y}% + ${geometry.boxHeight}px), ${DIAMOND_VERTICES.bottom.x}% calc(${DIAMOND_VERTICES.bottom.y}% + ${geometry.boxHeight}px))`;

        return (
          <div
            key={layer.webp}
            className={[
              styles.isometricLayer,
              isActive ? styles.isometricLayerActive : styles.isometricLayerInactive,
              geometry.interactive && onSelectLayer ? styles.isometricLayerClickable : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${geometry.baseX}%`,
              top: `${centerY}%`,
              width: `${geometry.layerWidth}%`,
              height: `${geometry.layerHeight}%`,
              zIndex,
              opacity: layerOpacity,
              transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
            }}
            onClick={
              geometry.interactive && onSelectLayer ? () => onSelectLayer(idx) : undefined
            }
          >
            {geometry.showExtrusion ? (
              <div className={styles.isometricExtrusion} aria-hidden="true">
                <div
                  className={styles.isometricExtrusionLeft}
                  style={{ clipPath: leftExtrusionClip }}
                />
                <div
                  className={styles.isometricExtrusionRight}
                  style={{ clipPath: rightExtrusionClip }}
                />
              </div>
            ) : null}

            <div className={styles.isometricSurface} style={{ clipPath: DIAMOND_CLIP_PATH }}>
              <picture>
                <source srcSet={layer.avif} type="image/avif" />
                <source srcSet={layer.webp} type="image/webp" />
                <img
                  src={layer.fallback}
                  alt=""
                  aria-hidden="true"
                  className={styles.isometricLayerImage}
                  loading="lazy"
                />
              </picture>
            </div>

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className={styles.isometricBorderSvg}
              aria-hidden="true"
            >
              <polygon
                points={`${DIAMOND_VERTICES.top.x},${DIAMOND_VERTICES.top.y} ${DIAMOND_VERTICES.right.x},${DIAMOND_VERTICES.right.y} ${DIAMOND_VERTICES.bottom.x},${DIAMOND_VERTICES.bottom.y} ${DIAMOND_VERTICES.left.x},${DIAMOND_VERTICES.left.y}`}
                fill="none"
                stroke={isActive ? '#ff9800' : 'rgba(255, 152, 0, 0.35)'}
                strokeWidth={isActive ? 1.4 : 0.9}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        );
      })}

      {count > 1 ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={styles.isometricConnectorsSvg}
          aria-hidden="true"
        >
          <polyline
            points={leftLinePoints}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={0.75}
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={rightLinePoints}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={0.75}
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={frontLinePoints}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={0.75}
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </div>
  );
}

export interface ServiceIsometricGraphicProps {
  activeIndex: number;
  onSelectLayer?: (index: number) => void;
  className?: string;
}

const SERVICE_GEOMETRY: IsometricLayerGeometry = {
  layerWidth: 80,
  layerHeight: 40,
  baseX: 50,
  baseY: 26,
  stepY: 16,
  showExtrusion: true,
  boxHeight: 6,
  interactive: true,
};

/**
 * 4-layer interactive isometric diamond stack for the Home Services section.
 */
export function ServiceIsometricGraphic({
  activeIndex,
  onSelectLayer,
  className,
}: ServiceIsometricGraphicProps) {
  const layers = servicesContent.isometricStackLayers.slice(0, 4);
  const clampedIndex = Math.max(0, Math.min(layers.length - 1, activeIndex));
  const activeService = servicesContent.items[clampedIndex];

  return (
    <IsometricLayerStack
      layers={layers}
      activeIndex={clampedIndex}
      geometry={SERVICE_GEOMETRY}
      ariaLabel={`Isometric architecture stack highlighting ${activeService?.title ?? 'Design'}`}
      onSelectLayer={onSelectLayer}
      className={className}
    />
  );
}
