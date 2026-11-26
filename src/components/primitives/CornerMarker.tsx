import styles from './primitives.module.css';

export interface CornerMarkerProps {
  size?: number;
  thickness?: number;
  inset?: number;
  color?: string;
  styleType?: 'line' | 'triangle';
  className?: string;
}

export function CornerMarker({
  size = 4,
  thickness = 1,
  inset = 1,
  color = 'var(--color-accent)',
  styleType = 'line',
  className = '',
}: CornerMarkerProps) {
  return (
    <svg
      className={`${styles.cornerMarkerSvg} ${className}`.trim()}
      aria-hidden="true"
    >
      {styleType === 'triangle' ? (
        <>
          <svg x={inset} y={inset} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <polygon points={`0,0 ${size},0 0,${size}`} fill={color} />
          </svg>
          <svg
            x={`calc(100% - ${size + inset}px)`}
            y={inset}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <polygon points={`0,0 ${size},0 ${size},${size}`} fill={color} />
          </svg>
          <svg
            x={`calc(100% - ${size + inset}px)`}
            y={`calc(100% - ${size + inset}px)`}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <polygon points={`${size},0 ${size},${size} 0,${size}`} fill={color} />
          </svg>
          <svg
            x={inset}
            y={`calc(100% - ${size + inset}px)`}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <polygon points={`0,0 ${size},${size} 0,${size}`} fill={color} />
          </svg>
        </>
      ) : (
        <>
          <svg x={inset} y={inset} width={size + thickness} height={size + thickness}>
            <path
              d={`M ${thickness / 2} ${size} L ${thickness / 2} ${thickness / 2} L ${size} ${thickness / 2}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
          </svg>
          <svg
            x={`calc(100% - ${size + inset + thickness}px)`}
            y={inset}
            width={size + thickness}
            height={size + thickness}
          >
            <path
              d={`M 0 ${thickness / 2} L ${size} ${thickness / 2} L ${size} ${size}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
          </svg>
          <svg
            x={`calc(100% - ${size + inset + thickness}px)`}
            y={`calc(100% - ${size + inset + thickness}px)`}
            width={size + thickness}
            height={size + thickness}
          >
            <path
              d={`M ${size} 0 L ${size} ${size} L 0 ${size}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
          </svg>
          <svg
            x={inset}
            y={`calc(100% - ${size + inset + thickness}px)`}
            width={size + thickness}
            height={size + thickness}
          >
            <path
              d={`M ${thickness / 2} 0 L ${thickness / 2} ${size} L ${size} ${size}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
          </svg>
        </>
      )}
    </svg>
  );
}
