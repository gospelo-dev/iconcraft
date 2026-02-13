import type { DialRingProps, DialNotchProps, DialLabelProps, ReticleProps } from './IconCraftView';

/**
 * Dial preset definition
 */
export interface DialPreset {
  name: string;
  renderRing: (props: DialRingProps) => React.ReactNode;
  renderNotch: (props: DialNotchProps) => React.ReactNode;
  renderLabel?: (props: DialLabelProps) => React.ReactNode;
}

const dialColor = 'var(--iconcraft-dial-color, #000)';
const notchColor = 'var(--iconcraft-notch-color, #000)';
const reticleColor = 'var(--iconcraft-reticle-color, #000)';

/** Default: dashed ring with circle notch */
export const dialPresetDashed: DialPreset = {
  name: 'dashed',
  renderRing: ({ cx, cy, radius }) => (
    <circle
      cx={cx} cy={cy} r={radius}
      fill="none" stroke={dialColor}
      strokeWidth="1.2" strokeDasharray="6 4" opacity={0.5}
    />
  ),
  renderNotch: ({ x, y, onMouseDown }) => (
    <circle
      cx={x} cy={y} r="7"
      fill={notchColor} stroke="#fff" strokeWidth="2"
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    />
  ),
};

/** Solid thin ring with diamond notch */
export const dialPresetSolid: DialPreset = {
  name: 'solid',
  renderRing: ({ cx, cy, radius }) => (
    <circle
      cx={cx} cy={cy} r={radius}
      fill="none" stroke={dialColor}
      strokeWidth="1.5" opacity={0.5}
    />
  ),
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g
      transform={`translate(${x},${y}) rotate(${degrees + 45})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <rect x="-5" y="-5" width="10" height="10"
        fill={notchColor} stroke="#fff" strokeWidth="1.5" rx="1"
      />
    </g>
  ),
};

/** Tick marks ring with arrow notch */
export const dialPresetTicks: DialPreset = {
  name: 'ticks',
  renderRing: ({ cx, cy, radius }) => {
    const ticks = [];
    for (let i = 0; i < 72; i++) {
      const deg = i * 5;
      const rad = (deg - 90) * Math.PI / 180;
      const isMajor = deg % 30 === 0;
      const len = isMajor ? 5 : 2.5;
      const x1 = cx + (radius - len) * Math.cos(rad);
      const y1 = cy + (radius - len) * Math.sin(rad);
      const x2 = cx + radius * Math.cos(rad);
      const y2 = cy + radius * Math.sin(rad);
      ticks.push(
        <line key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={dialColor} strokeWidth={isMajor ? 1.5 : 0.8}
          opacity={isMajor ? 0.7 : 0.4}
        />
      );
    }
    return <>{ticks}</>;
  },
  renderNotch: ({ x, y, onMouseDown }) => {
    // Triangle arrow pointing outward
    return (
      <circle
        cx={x} cy={y} r="5"
        fill={notchColor} stroke="#fff" strokeWidth="1.5"
        style={{ pointerEvents: 'auto', cursor: 'grab' }}
        onMouseDown={onMouseDown}
      />
    );
  },
};

/** Dotted ring with square notch */
export const dialPresetDotted: DialPreset = {
  name: 'dotted',
  renderRing: ({ cx, cy, radius }) => {
    const dots = [];
    for (let i = 0; i < 36; i++) {
      const deg = i * 10;
      const rad = (deg - 90) * Math.PI / 180;
      const dx = cx + radius * Math.cos(rad);
      const dy = cy + radius * Math.sin(rad);
      dots.push(
        <circle key={i}
          cx={dx} cy={dy} r={deg % 90 === 0 ? 1.8 : 1}
          fill={dialColor} opacity={deg % 90 === 0 ? 0.8 : 0.4}
        />
      );
    }
    return <>{dots}</>;
  },
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees + 180})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <polygon
        points="0,-2 -5,10 5,10"
        fill={notchColor} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"
      />
    </g>
  ),
};

/** Double ring with pill-shaped notch */
export const dialPresetDouble: DialPreset = {
  name: 'double',
  renderRing: ({ cx, cy, radius }) => {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const deg = i * 45;
      const rad = (deg - 90) * Math.PI / 180;
      const x1 = cx + (radius - 4) * Math.cos(rad);
      const y1 = cy + (radius - 4) * Math.sin(rad);
      const x2 = cx + radius * Math.cos(rad);
      const y2 = cy + radius * Math.sin(rad);
      lines.push(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={dialColor} strokeWidth="0.8" opacity={0.3}
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={dialColor} strokeWidth="1" opacity={0.3} />
        <circle cx={cx} cy={cy} r={radius - 4} fill="none" stroke={dialColor} strokeWidth="1" opacity={0.3} />
        {lines}
      </>
    );
  },
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <rect x="-3" y="-8" width="6" height="16" rx="3"
        fill={notchColor} stroke="#fff" strokeWidth="1.5"
      />
    </g>
  ),
};

/** Crosshair style with + shaped notch */
export const dialPresetCrosshair: DialPreset = {
  name: 'crosshair',
  renderRing: ({ cx, cy, radius }) => {
    const marks = [];
    for (let i = 0; i < 4; i++) {
      const deg = i * 90;
      const rad = (deg - 90) * Math.PI / 180;
      const x1 = cx + (radius - 8) * Math.cos(rad);
      const y1 = cy + (radius - 8) * Math.sin(rad);
      const x2 = cx + radius * Math.cos(rad);
      const y2 = cy + radius * Math.sin(rad);
      marks.push(
        <line key={`m${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={dialColor} strokeWidth="2" opacity={0.5}
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={cy} r={radius} fill="none"
          stroke={dialColor} strokeWidth="1" strokeDasharray="2 6" opacity={0.4}
        />
        {marks}
      </>
    );
  },
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }} onMouseDown={onMouseDown}
    >
      <line x1={-6} y1={0} x2={6} y2={0} stroke={notchColor} strokeWidth="2" />
      <line x1={0} y1={-6} x2={0} y2={6} stroke={notchColor} strokeWidth="2" />
      <circle cx={0} cy={0} r="3" fill="#fff" stroke={notchColor} strokeWidth="1.5" />
    </g>
  ),
};

/** Minimal: only quarter arcs with triangle notch */
export const dialPresetMinimal: DialPreset = {
  name: 'minimal',
  renderRing: ({ cx, cy, radius }) => {
    const arcs = [];
    for (let i = 0; i < 4; i++) {
      const startDeg = i * 90 + 10;
      const endDeg = i * 90 + 80;
      const startRad = (startDeg - 90) * Math.PI / 180;
      const endRad = (endDeg - 90) * Math.PI / 180;
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      arcs.push(
        <path key={i}
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
          fill="none" stroke={dialColor} strokeWidth="2" opacity={0.5}
          strokeLinecap="round"
        />
      );
    }
    return <>{arcs}</>;
  },
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <polygon
        points="0,-8 -5,4 5,4"
        fill={notchColor} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"
      />
    </g>
  ),
};

/** Needle: dashed ring with elongated needle notch */
export const dialPresetNeedle: DialPreset = {
  name: 'needle',
  renderRing: ({ cx, cy, radius }) => (
    <circle
      cx={cx} cy={cy} r={radius}
      fill="none" stroke={dialColor}
      strokeWidth="1.5" strokeDasharray="4 3" opacity={0.5}
    />
  ),
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <path
        d="M 0,-12 L 2,-2 0,4 -2,-2 Z"
        fill={notchColor} stroke="#fff" strokeWidth="1" strokeLinejoin="round"
      />
    </g>
  ),
};

/** Bar: solid ring with rounded bar notch */
export const dialPresetBar: DialPreset = {
  name: 'bar',
  renderRing: ({ cx, cy, radius }) => (
    <circle
      cx={cx} cy={cy} r={radius}
      fill="none" stroke={dialColor}
      strokeWidth="1" opacity={0.4}
    />
  ),
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <rect x="-2" y="-10" width="4" height="20" rx="2"
        fill={notchColor} stroke="#fff" strokeWidth="1.5"
      />
    </g>
  ),
};

/** Arrow: tick ring with arrow-head notch */
export const dialPresetArrow: DialPreset = {
  name: 'arrow',
  renderRing: ({ cx, cy, radius }) => {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const deg = i * 30;
      const rad = (deg - 90) * Math.PI / 180;
      const len = deg % 90 === 0 ? 6 : 3;
      const x1 = cx + (radius - len) * Math.cos(rad);
      const y1 = cy + (radius - len) * Math.sin(rad);
      const x2 = cx + radius * Math.cos(rad);
      const y2 = cy + radius * Math.sin(rad);
      ticks.push(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={dialColor} strokeWidth={deg % 90 === 0 ? 2 : 1} opacity={0.5}
        />
      );
    }
    return <>{ticks}</>;
  },
  renderNotch: ({ x, y, degrees, onMouseDown }) => (
    <g transform={`translate(${x},${y}) rotate(${degrees})`}
      style={{ pointerEvents: 'auto', cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <path
        d="M 0,-11 L 4,-3 1,-3 1,5 -1,5 -1,-3 -4,-3 Z"
        fill={notchColor} stroke="#fff" strokeWidth="1" strokeLinejoin="round"
      />
    </g>
  ),
};

/** All presets for easy iteration */
export const dialPresets = {
  dotted: dialPresetDotted,
  dashed: dialPresetDashed,
  solid: dialPresetSolid,
  ticks: dialPresetTicks,
  double: dialPresetDouble,
  crosshair: dialPresetCrosshair,
  minimal: dialPresetMinimal,
  needle: dialPresetNeedle,
  bar: dialPresetBar,
  arrow: dialPresetArrow,
} as const;

export type DialPresetName = keyof typeof dialPresets;

/**
 * Reticle preset definition
 */
export interface ReticlePreset {
  name: string;
  render: (props: ReticleProps) => React.ReactNode;
}


/** Cross: back=bottom+right arms, front=top+left arms + center dot */
export const reticlePresetCross: ReticlePreset = {
  name: 'cross',
  render: ({ cx, cy, size, layer }) => {
    const half = size * 0.15;
    if (layer === 'back') return null;
    return (
      <g opacity={0.5}>
        <line x1={cx} y1={cy - half} x2={cx} y2={cy + half}
          stroke={reticleColor} strokeWidth="1" />
        <line x1={cx - half} y1={cy} x2={cx + half} y2={cy}
          stroke={reticleColor} strokeWidth="1" />
        <circle cx={cx} cy={cy} r="2" fill={reticleColor} />
      </g>
    );
  },
};

/** Bullseye: circle + center dot */
export const reticlePresetBullseye: ReticlePreset = {
  name: 'bullseye',
  render: ({ cx, cy, size, layer }) => {
    const r = size * 0.22;
    if (layer === 'back') return null;
    return (
      <g opacity={0.5}>
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke={reticleColor} strokeWidth="1" />
        <circle cx={cx} cy={cy} r="2.5" fill={reticleColor} />
      </g>
    );
  },
};


/** Globe: wireframe sphere — all lines split into back (far side) and front (near side) */
export const reticlePresetGlobe: ReticlePreset = {
  name: 'globe',
  render: ({ cx, cy, size, layer }) => {
    const r = size * 0.5;
    const sw = 0.8;
    const latFractions = [0.3, 0.6];
    const lonFractions = [0.3, 0.6, 0.9];

    if (layer === 'back') {
      // Back (behind icon): far side of sphere
      // Outer circle left half, longitude left arcs, latitude back arcs, equator back arc
      return (
        <g opacity={0.2}>
          {/* Longitude - back arcs (far side, bulges away from viewer) */}
          {lonFractions.map((f, i) => {
            const lx = r * f;
            const ly = Math.sqrt(r * r - lx * lx);
            const rx = ly * 0.15;
            return (
              <g key={`lon-${i}`}>
                {/* Right longitude: back arc bulges right */}
                <path d={`M ${cx + lx} ${cy - ly} A ${rx} ${ly} 0 0 0 ${cx + lx} ${cy + ly}`}
                  fill="none" stroke={reticleColor} strokeWidth={sw} />
                {/* Left longitude: back arc bulges left */}
                <path d={`M ${cx - lx} ${cy - ly} A ${rx} ${ly} 0 0 1 ${cx - lx} ${cy + ly}`}
                  fill="none" stroke={reticleColor} strokeWidth={sw} />
              </g>
            );
          })}
          {/* Equator - horizontal line */}
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
            stroke={reticleColor} strokeWidth={sw} />
          {/* Latitude - back arcs (away from viewer) */}
          {latFractions.map((f, i) => {
            const ly = r * f;
            const lx = Math.sqrt(r * r - ly * ly);
            const ry = lx * 0.15;
            return (
              <g key={`lat-${i}`}>
                {/* Upper lat: back arc bulges upward */}
                <path d={`M ${cx - lx} ${cy - ly} A ${lx} ${ry} 0 0 0 ${cx + lx} ${cy - ly}`}
                  fill="none" stroke={reticleColor} strokeWidth={sw} />
                {/* Lower lat: back arc bulges downward */}
                <path d={`M ${cx - lx} ${cy + ly} A ${lx} ${ry} 0 0 1 ${cx + lx} ${cy + ly}`}
                  fill="none" stroke={reticleColor} strokeWidth={sw} />
              </g>
            );
          })}
        </g>
      );
    }
    // Front (above icon): near side of sphere
    return (
      <g opacity={0.4}>
        {/* Outer circle (full) */}
        <circle cx={cx} cy={cy} r={r}
          fill="none" stroke={reticleColor} strokeWidth={sw} />
        {/* Central meridian */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r}
          stroke={reticleColor} strokeWidth={sw} />
        {/* Longitude - front arcs (near side, bulges toward viewer) */}
        {lonFractions.map((f, i) => {
          const lx = r * f;
          const ly = Math.sqrt(r * r - lx * lx);
          const rx = ly * 0.15;
          return (
            <g key={`lon-${i}`}>
              {/* Right longitude: front arc bulges left */}
              <path d={`M ${cx + lx} ${cy - ly} A ${rx} ${ly} 0 0 1 ${cx + lx} ${cy + ly}`}
                fill="none" stroke={reticleColor} strokeWidth={sw} />
              {/* Left longitude: front arc bulges right */}
              <path d={`M ${cx - lx} ${cy - ly} A ${rx} ${ly} 0 0 0 ${cx - lx} ${cy + ly}`}
                fill="none" stroke={reticleColor} strokeWidth={sw} />
            </g>
          );
        })}
        {/* Equator - horizontal line */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          stroke={reticleColor} strokeWidth={sw} />
        {/* Latitude - front arcs */}
        {latFractions.map((f, i) => {
          const ly = r * f;
          const lx = Math.sqrt(r * r - ly * ly);
          const ry = lx * 0.15;
          return (
            <g key={`lat-${i}`}>
              <path d={`M ${cx - lx} ${cy - ly} A ${lx} ${ry} 0 0 1 ${cx + lx} ${cy - ly}`}
                fill="none" stroke={reticleColor} strokeWidth={sw} />
              <path d={`M ${cx - lx} ${cy + ly} A ${lx} ${ry} 0 0 0 ${cx + lx} ${cy + ly}`}
                fill="none" stroke={reticleColor} strokeWidth={sw} />
            </g>
          );
        })}
      </g>
    );
  },
};

/** All reticle presets */
export const reticlePresets = {
  cross: reticlePresetCross,
  bullseye: reticlePresetBullseye,
  globe: reticlePresetGlobe,
} as const;

export type ReticlePresetName = keyof typeof reticlePresets;
