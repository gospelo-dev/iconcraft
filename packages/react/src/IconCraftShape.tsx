import { useEffect, useState, useMemo, useCallback } from 'react';
import type { IconCraftShapeProps, IconCraftResult, ShapeMode } from './types';
import {
  parseAnimationOptions,
  getAnimationStyle,
  injectKeyframes,
} from './animations';

// WASM module singleton
let wasmModule: typeof import('gospelo-iconcraft-wasm') | null = null;
let wasmInitPromise: Promise<typeof import('gospelo-iconcraft-wasm')> | null = null;

async function initWasm() {
  if (wasmModule) return wasmModule;
  if (wasmInitPromise) return wasmInitPromise;

  wasmInitPromise = (async () => {
    const wasm = await import('gospelo-iconcraft-wasm');
    await wasm.default();
    wasmModule = wasm;
    return wasm;
  })();

  return wasmInitPromise;
}

const shapeModeMap: Record<ShapeMode, number> = {
  jelly: 0,
  droplet: 1,
  wax: 2,
};

/**
 * Check if string is a URL
 */
function isUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
}

/**
 * Fetch SVG content from URL
 */
async function fetchSvg(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status}`);
  }
  return response.text();
}

/**
 * IconCraftShape - Full-featured emboss icon component
 *
 * @example
 * ```tsx
 * <IconCraftShape
 *   svg="<svg>...</svg>"
 *   mode="wax"
 *   shapeColor="#6366f1"
 *   size={120}
 *   animation="float"
 * />
 * ```
 */
export function IconCraftShape({
  // Required
  svg,

  // Shape Settings
  mode = 'wax',
  shapeColor = '#6366f1',

  // Icon Style
  iconStyle = 'emboss',

  // Effects (reserved for future use)
  shadow: _shadow = true,
  highlight: _highlight = true,

  // WASM Parameters
  offset = 20,
  resolution = 256,
  simplify = 2.0,

  // Size & Layout
  width,
  height,
  size,

  // Animation
  animation,
  animateOnHover = false,

  // Styling
  className,
  style,

  // Events
  onLoad,
  onError,
  onClick,
}: IconCraftShapeProps) {
  const [result, setResult] = useState<IconCraftResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Parse animation options
  const animationOptions = useMemo(
    () => parseAnimationOptions(animation),
    [animation]
  );

  // Inject keyframes when animation type changes
  useEffect(() => {
    if (animationOptions?.type) {
      injectKeyframes(animationOptions.type);
    }
  }, [animationOptions?.type]);

  // Generate shape
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Resolve SVG content
      let svgContent = svg;
      if (isUrl(svg)) {
        svgContent = await fetchSvg(svg);
      }

      // Initialize WASM
      const wasm = await initWasm();
      const modeValue = shapeModeMap[mode];

      // Generate with WASM
      const wasmResult = wasm.generate_clippath_with_color(
        svgContent,
        modeValue,
        offset,
        resolution,
        simplify,
        iconStyle === 'emboss', // include_icon
        shapeColor
      );

      if (!wasmResult.success) {
        throw new Error(wasmResult.error || 'Generation failed');
      }

      setResult(wasmResult as IconCraftResult);
      onLoad?.(wasmResult as IconCraftResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [svg, mode, shapeColor, iconStyle, offset, resolution, simplify, onLoad, onError]);

  // Regenerate when props change
  useEffect(() => {
    generate();
  }, [generate]);

  // Compute dimensions
  const computedWidth = size ?? width ?? 120;
  const computedHeight = size ?? height ?? 120;

  // Compute animation style
  const shouldAnimate = animateOnHover ? isHovering : true;
  const animationStyle = shouldAnimate
    ? getAnimationStyle(animationOptions)
    : 'none';

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth,
    height: typeof computedHeight === 'number' ? `${computedHeight}px` : computedHeight,
    display: 'inline-block',
    position: 'relative',
    cursor: onClick ? 'pointer' : undefined,
    animation: animationStyle,
    ...style,
  };

  // Event handlers
  const handleMouseEnter = animateOnHover ? () => setIsHovering(true) : undefined;
  const handleMouseLeave = animateOnHover ? () => setIsHovering(false) : undefined;

  // Loading state
  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          borderRadius: '50%',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fee',
          borderRadius: '8px',
          color: '#c00',
          fontSize: '12px',
          padding: '8px',
          textAlign: 'center',
        }}
      >
        {error}
      </div>
    );
  }

  // No result
  if (!result?.emboss_svg) {
    return null;
  }

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      dangerouslySetInnerHTML={{ __html: result.emboss_svg }}
    />
  );
}

/**
 * Simple loading spinner
 */
function LoadingSpinner() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#ccc"
        strokeWidth="3"
        fill="none"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
