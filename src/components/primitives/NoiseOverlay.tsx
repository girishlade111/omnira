import { PUBLIC_ASSETS } from '@/lib/assets';
import styles from './primitives.module.css';

export interface NoiseOverlayProps {
  opacity?: number;
  blendMode?: 'screen' | 'normal';
  variant?: 'darkGrain' | 'panelGrain';
  className?: string;
}

export function NoiseOverlay({
  opacity = 0.8,
  blendMode = 'screen',
  variant = 'darkGrain',
  className = '',
}: NoiseOverlayProps) {
  const texture =
    variant === 'panelGrain' ? PUBLIC_ASSETS.textures.panelGrain : PUBLIC_ASSETS.textures.darkGrain;

  return (
    <div
      aria-hidden="true"
      className={`${styles.noiseOverlay} ${className}`.trim()}
      style={{ opacity, mixBlendMode: blendMode }}
    >
      <picture>
        <source srcSet={texture.avif} type="image/avif" />
        <source srcSet={texture.webp} type="image/webp" />
        <img
          src={texture.fallback}
          alt=""
          width={texture.width}
          height={texture.height}
          className={styles.noiseOverlayImg}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
}
