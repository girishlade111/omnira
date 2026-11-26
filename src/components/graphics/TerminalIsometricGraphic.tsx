'use client';

import { profileContent } from '@/content/profile';
import {
  IsometricLayerStack,
  type IsometricLayerGeometry,
} from './ServiceIsometricGraphic';

export interface TerminalIsometricGraphicProps {
  activeStep: number;
  className?: string;
}

const TERMINAL_GEOMETRY: IsometricLayerGeometry = {
  layerWidth: 92,
  layerHeight: 38,
  baseX: 50,
  baseY: 28,
  stepY: 11,
  showExtrusion: false,
  boxHeight: 1,
  interactive: false,
};

/**
 * 5-layer isometric diamond stack for the About Process Terminal section.
 */
export function TerminalIsometricGraphic({
  activeStep,
  className,
}: TerminalIsometricGraphicProps) {
  const layers = profileContent.terminal.isometricStackLayers.slice(0, 5);
  const clampedIndex = Math.max(0, Math.min(layers.length - 1, activeStep));
  const currentStep = profileContent.terminal.steps[clampedIndex];

  return (
    <IsometricLayerStack
      layers={layers}
      activeIndex={clampedIndex}
      geometry={TERMINAL_GEOMETRY}
      ariaLabel={`Terminal workflow stack highlighting step ${currentStep?.label ?? 'INPUT'}`}
      className={className}
    />
  );
}
