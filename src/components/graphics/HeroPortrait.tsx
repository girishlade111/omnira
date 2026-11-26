'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PUBLIC_ASSETS } from '@/lib/assets';
import styles from './graphics.module.css';

interface HalftoneDot {
  ox: number;
  oy: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
}

export interface HeroPortraitProps {
  className?: string;
}

const HALFTONE_CONFIG = {
  dotSpacing: 3,
  dotSize: 1,
  threshold: 32,
  contrast: 2,
  pixelMode: 'light' as const,
  sizeVariation: 0.01,
  dotOpacity: 1,
  primaryColor: 'rgb(255, 255, 255)',
  accentColor: 'rgb(255, 255, 255)',
  accentAmount: 0.1,
  mouseRadius: 300,
  repulsionStrength: 64,
  returnSpeed: 0.2,
  imageScale: 1,
  fit: 'cover' as const,
};

/**
 * Interactive 2D Canvas halftone dot-matrix portrait with radial pointer repulsion.
 * Pauses animation when offscreen or hidden and renders statically for reduced motion.
 */
export function HeroPortrait({ className }: HeroPortraitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dotsRef = useRef<HalftoneDot[]>([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const sizeRef = useRef({ width: 1, height: 1, dpr: 1 });
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const [failed, setFailed] = useState(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    runningRef.current = false;
  }, []);

  const drawFrame = useCallback(function step() {
    const canvas = canvasRef.current;
    if (!canvas || !visibleRef.current || document.hidden) {
      runningRef.current = false;
      rafRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      runningRef.current = false;
      rafRef.current = null;
      return;
    }

    const { width, height, dpr } = sizeRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const dots = dotsRef.current;
    const pointer = pointerRef.current;
    const radius = HALFTONE_CONFIG.mouseRadius;
    const radiusSq = radius * radius;
    const allowMotion = !reducedMotionRef.current;
    let keepAnimating = allowMotion && pointer.active;
    let lastColor = '';
    let lastAlpha = -1;

    for (let i = 0; i < dots.length; i += 1) {
      const dot = dots[i];
      let targetX = dot.ox;
      let targetY = dot.oy;

      if (allowMotion && pointer.active) {
        const dx = dot.ox - pointer.x;
        const dy = dot.oy - pointer.y;
        if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const force =
              Math.pow(1 - dist / radius, 2) * HALFTONE_CONFIG.repulsionStrength;
            targetX = dot.ox + (dx / dist) * force;
            targetY = dot.oy + (dy / dist) * force;
          }
        }
      }

      const nextX = allowMotion
        ? dot.x + (targetX - dot.x) * HALFTONE_CONFIG.returnSpeed
        : dot.ox;
      const nextY = allowMotion
        ? dot.y + (targetY - dot.y) * HALFTONE_CONFIG.returnSpeed
        : dot.oy;

      if (
        allowMotion &&
        !keepAnimating &&
        (Math.abs(nextX - dot.x) > 0.01 || Math.abs(nextY - dot.y) > 0.01)
      ) {
        keepAnimating = true;
      }

      dot.x = nextX;
      dot.y = nextY;

      if (dot.alpha !== lastAlpha) {
        ctx.globalAlpha = dot.alpha;
        lastAlpha = dot.alpha;
      }
      if (dot.color !== lastColor) {
        ctx.fillStyle = dot.color;
        lastColor = dot.color;
      }

      if (dot.size <= 1) {
        const box = Math.max(1, dot.size);
        ctx.fillRect(dot.x - box / 2, dot.y - box / 2, box, box);
      } else {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    if (keepAnimating) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      rafRef.current = null;
      runningRef.current = false;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (!visibleRef.current || document.hidden || runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(drawFrame);
  }, [drawFrame]);

  const samplePortrait = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!container || !canvas || !img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(container.clientWidth || rect.width));
    const height = Math.max(1, Math.floor(container.clientHeight || rect.height));
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    sizeRef.current = { width, height, dpr };
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.clearRect(0, 0, width, height);
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (imgRatio > boxRatio) {
      drawH = height * HALFTONE_CONFIG.imageScale;
      drawW = height * imgRatio * HALFTONE_CONFIG.imageScale;
    } else {
      drawW = width * HALFTONE_CONFIG.imageScale;
      drawH = (width / imgRatio) * HALFTONE_CONFIG.imageScale;
    }

    const offsetX = width / 2 - drawW / 2;
    const offsetY = height / 2 - drawH / 2;
    offCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

    const pixels = offCtx.getImageData(0, 0, width, height).data;
    const dots: HalftoneDot[] = [];
    const spacing = Math.max(2, Math.round(HALFTONE_CONFIG.dotSpacing));
    const thresholdNorm = HALFTONE_CONFIG.threshold / 100;
    const contrast = HALFTONE_CONFIG.contrast;

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
        const alpha = pixels[idx + 3] / 255;
        if (alpha < 0.08) continue;

        const lumRaw = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3 / 255;
        const contrasted = Math.max(0, Math.min(1, (lumRaw - 0.5) * contrast + 0.5));
        const value = HALFTONE_CONFIG.pixelMode === 'light' ? contrasted : 1 - contrasted;
        if (value < thresholdNorm) continue;

        const normalized = (value - thresholdNorm) / Math.max(0.001, 1 - thresholdNorm);
        const hashSize = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const jitter =
          1 + (hashSize - Math.floor(hashSize) - 0.5) * 2 * HALFTONE_CONFIG.sizeVariation;
        const dotSize = HALFTONE_CONFIG.dotSize * Math.pow(normalized, 0.72) * Math.max(0.2, jitter);
        const hashColor = Math.sin(x * 4.112 + y * 9.331) * 9182.381;
        const colorPick = hashColor - Math.floor(hashColor);

        dots.push({
          ox: x,
          oy: y,
          x,
          y,
          size: dotSize,
          alpha: normalized * HALFTONE_CONFIG.dotOpacity,
          color:
            colorPick < HALFTONE_CONFIG.accentAmount
              ? HALFTONE_CONFIG.accentColor
              : HALFTONE_CONFIG.primaryColor,
        });
      }
    }

    dotsRef.current = dots;
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPref = () => {
      reducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        pointerRef.current.active = false;
        drawFrame();
      }
    };
    syncMotionPref();
    mediaQuery.addEventListener('change', syncMotionPref);
    return () => mediaQuery.removeEventListener('change', syncMotionPref);
  }, [drawFrame]);

  useEffect(() => {
    let cancelled = false;
    const primaryImg = new Image();
    const fallbackImg = new Image();

    primaryImg.onload = () => {
      if (cancelled) return;
      setFailed(false);
      imageRef.current = primaryImg;
      samplePortrait();
    };
    primaryImg.onerror = () => {
      if (cancelled) return;
      fallbackImg.onload = () => {
        if (cancelled) return;
        setFailed(false);
        imageRef.current = fallbackImg;
        samplePortrait();
      };
      fallbackImg.onerror = () => {
        if (cancelled) return;
        imageRef.current = null;
        dotsRef.current = [];
        setFailed(true);
      };
      fallbackImg.src = PUBLIC_ASSETS.hero.portraitDotMatrix.fallback;
    };
    primaryImg.src = PUBLIC_ASSETS.hero.portraitDotMatrix.webp;

    return () => {
      cancelled = true;
      primaryImg.onload = null;
      primaryImg.onerror = null;
      fallbackImg.onload = null;
      fallbackImg.onerror = null;
    };
  }, [samplePortrait]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => samplePortrait();
    window.addEventListener('resize', handleResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              visibleRef.current = entry.isIntersecting;
              if (entry.isIntersecting) {
                samplePortrait();
              } else {
                stopLoop();
              }
            },
            { threshold: 0.01 },
          )
        : null;
    intersectionObserver?.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (visibleRef.current) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLoop();
    };
  }, [samplePortrait, startLoop, stopLoop]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current || !visibleRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = sizeRef.current.width / rect.width;
    const scaleY = sizeRef.current.height / rect.height;
    pointerRef.current.x = (event.clientX - rect.left) * scaleX;
    pointerRef.current.y = (event.clientY - rect.top) * scaleY;
    pointerRef.current.active = true;
    startLoop();
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    startLoop();
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={PUBLIC_ASSETS.hero.portraitDotMatrix.alt}
      className={[styles.heroPortrait, className].filter(Boolean).join(' ')}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas ref={canvasRef} className={styles.heroPortraitCanvas} aria-hidden="true" />
      {failed ? (
        <Image
          src={PUBLIC_ASSETS.hero.portraitDotMatrix.fallback}
          alt=""
          fill
          unoptimized
          aria-hidden="true"
          className={styles.heroPortraitFallback}
        />
      ) : null}
    </div>
  );
}
