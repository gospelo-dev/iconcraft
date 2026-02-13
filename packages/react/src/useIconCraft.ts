import { useState, useEffect, useCallback } from 'react';
import type { ShapeMode, IconCraftResult, IconStyle } from './types';

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
  bubble: 1,
  sticker: 3,
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

// ============================================
// New API
// ============================================
export interface UseIconCraftOptions {
  /** SVG content string or URL */
  svg: string;
  /** Shape mode */
  mode?: ShapeMode;
  /** Shape color (hex) */
  shapeColor?: string;
  /** Icon style */
  iconStyle?: IconStyle;
  /** Contour offset */
  offset?: number;
  /** Rasterization resolution */
  resolution?: number;
  /** Polygon simplification epsilon */
  simplify?: number;
  /** Icon rotation in degrees (0-360) */
  rotation?: number;
  /** Auto-generate on mount/change */
  autoGenerate?: boolean;
}

export interface UseIconCraftReturn {
  /** Generated result */
  result: IconCraftResult | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Resolved SVG content */
  svgContent: string | null;
  /** Manually trigger generation */
  generate: () => Promise<void>;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for generating IconCraft shapes
 *
 * @example
 * ```tsx
 * const { result, isLoading, error } = useIconCraft({
 *   svg: '<svg>...</svg>',
 *   mode: 'wax',
 *   shapeColor: '#6366f1',
 * });
 * ```
 */
export function useIconCraft(options: UseIconCraftOptions): UseIconCraftReturn {
  const {
    svg,
    mode = 'wax',
    shapeColor = '#6366f1',
    iconStyle = 'emboss',
    offset = 20,
    resolution = 256,
    simplify = 2.0,
    rotation = 0,
    autoGenerate = true,
  } = options;

  const [result, setResult] = useState<IconCraftResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setSvgContent(null);
  }, []);

  const generate = useCallback(async () => {
    if (!svg) {
      setError('SVG content is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Resolve SVG content
      let content = svg;
      if (isUrl(svg)) {
        content = await fetchSvg(svg);
      }
      setSvgContent(content);

      // Initialize WASM
      const wasm = await initWasm();
      const modeValue = shapeModeMap[mode];

      // Generate
      const wasmResult = typeof wasm.generate_clippath_with_rotation === 'function'
        ? wasm.generate_clippath_with_rotation(
            content,
            modeValue,
            offset,
            resolution,
            simplify,
            iconStyle === 'emboss',
            shapeColor,
            rotation
          )
        : wasm.generate_clippath_with_color(
            content,
            modeValue,
            offset,
            resolution,
            simplify,
            iconStyle === 'emboss',
            shapeColor
          );

      if (!wasmResult.success) {
        throw new Error(wasmResult.error || 'Generation failed');
      }

      setResult(wasmResult as IconCraftResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [svg, mode, shapeColor, iconStyle, offset, resolution, simplify, rotation]);

  // Auto-generate when options change
  useEffect(() => {
    if (autoGenerate && svg) {
      generate();
    }
  }, [autoGenerate, generate, svg]);

  return {
    result,
    isLoading,
    error,
    svgContent,
    generate,
    reset,
  };
}

// ============================================
// Legacy API (backwards compatibility)
// ============================================
export interface UseLegacyIconCraftOptions {
  svgContent: string;
  mode?: ShapeMode;
  baseColor?: string;
  offset?: number;
  resolution?: number;
  simplifyEpsilon?: number;
}

export interface UseLegacyIconCraftReturn {
  result: IconCraftResult | null;
  isLoading: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

/**
 * Legacy hook (backwards compatibility)
 * @deprecated Use useIconCraft with new API instead
 */
export function useLegacyIconCraft(options: UseLegacyIconCraftOptions): UseLegacyIconCraftReturn {
  const {
    svgContent,
    mode = 'jelly',
    baseColor = '#6366f1',
    offset = 5.0,
    resolution = 256,
    simplifyEpsilon = 0.5,
  } = options;

  const { result, isLoading, error, generate } = useIconCraft({
    svg: svgContent,
    mode,
    shapeColor: baseColor,
    offset,
    resolution,
    simplify: simplifyEpsilon,
    iconStyle: 'emboss',
  });

  return { result, isLoading, error, generate };
}
