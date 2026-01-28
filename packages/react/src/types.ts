import type { CSSProperties } from 'react';

// ============================================
// Shape Modes
// ============================================
export type ShapeMode = 'jelly' | 'droplet' | 'wax';

// ============================================
// Icon Styles
// ============================================
export type IconStyle = 'original' | 'emboss' | 'stroke' | 'fill';

// ============================================
// Animation Types
// ============================================

/** Built-in animation types */
export type BuiltInAnimationType =
  | 'none'
  | 'shake'
  | 'bounce'
  | 'pulse'
  | 'swing'
  | 'wobble'
  | 'jello'
  | 'heartbeat'
  | 'float'
  | 'spin'
  | 'rubberBand'
  // New fun animations
  | 'squish'      // ぷにょんと潰れる
  | 'tada'        // 注目を引く
  | 'flip'        // 裏返し
  | 'drop'        // 落下してバウンド
  | 'pop'         // ポップイン
  | 'wiggle'      // 左右に揺れる
  | 'breathe';    // 呼吸するような

/**
 * Custom animation registry for module augmentation.
 *
 * Users can extend this interface to add type-safe custom animations:
 *
 * @example
 * ```typescript
 * // types/iconcraft.d.ts
 * declare module '@gospelo-dev/iconcraft-react' {
 *   interface CustomAnimationRegistry {
 *     tada: true;
 *     flip: true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomAnimationRegistry {}

/** All animation types (built-in + custom) */
export type AnimationType = BuiltInAnimationType | keyof CustomAnimationRegistry;

/**
 * Animation target - which part of the component to animate
 * - 'shape': Animate only the background shape (SVG container)
 * - 'icon': Animate only the icon inside the shape
 * - 'both': Animate the entire component (default, legacy behavior)
 */
export type AnimationTarget = 'shape' | 'icon' | 'both';

export interface AnimationOptions {
  type: AnimationType;
  /** Animation target: 'shape', 'icon', or 'both' (default) */
  target?: AnimationTarget;
  duration?: number;      // seconds
  delay?: number;         // seconds
  iterationCount?: number | 'infinite';
  timingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  playState?: 'running' | 'paused';
}

// ============================================
// Color Palette
// ============================================
export interface ColorPalette {
  very_light: string;
  light: string;
  mid: string;
  dark: string;
  very_dark: string;
}

// ============================================
// WASM Result Types
// ============================================
export interface IconLayout {
  top_percent: number;
  left_percent: number;
  width_percent: number;
  height_percent: number;
}

export interface SvgPaths {
  clip: string | null;
  inner: string | null;
  shadow: string | null;
  highlight: string | null;
}

export interface EmbossPath {
  d: string;
  fill: string | null;
  stroke: string | null;
  stroke_width: number | null;
  transform: string | null;
  fill_rule: string | null;
}

export interface EmbossIconData {
  view_box: string | null;
  paths: EmbossPath[];
  width: number | null;
  height: number | null;
}

export interface IconCraftResult {
  success: boolean;
  clip_path: string | null;
  inner_clip_path: string | null;
  highlight_clip_paths: string[] | null;
  points_count: number;
  mode: string;
  error: string | null;
  icon_layout: IconLayout | null;
  svg_paths: SvgPaths | null;
  emboss_svg: string | null;
  icon_paths: EmbossIconData | null;
}

// ============================================
// Component Props
// ============================================
export interface IconCraftShapeProps {
  // === Required ===
  /** SVG content string or URL */
  svg: string;

  // === Shape Settings ===
  /** Shape mode: jelly, droplet, or wax */
  mode?: ShapeMode;
  /** Base color for the shape (hex) */
  shapeColor?: string;
  /** Custom color palette (overrides color) */
  palette?: Partial<ColorPalette>;

  // === Icon Style ===
  /** Icon rendering style */
  iconStyle?: IconStyle;

  // === Effects ===
  /** Show drop shadow on shape */
  shadow?: boolean;
  /** Show highlight effect */
  highlight?: boolean;

  // === WASM Parameters ===
  /** Contour offset (default: 20) */
  offset?: number;
  /** Rasterization resolution (default: 256) */
  resolution?: number;
  /** Polygon simplification epsilon (default: 2.0) */
  simplify?: number;

  // === Size & Layout ===
  /** Width of the component */
  width?: number | string;
  /** Height of the component */
  height?: number | string;
  /** Size shorthand (sets both width and height) */
  size?: number | string;

  // === Animation ===
  /** Animation preset or custom options */
  animation?: AnimationType | AnimationOptions;
  /** Trigger animation on hover */
  animateOnHover?: boolean;

  // === Styling ===
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;

  // === Events ===
  /** Called when generation is complete */
  onLoad?: (result: IconCraftResult) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Click handler */
  onClick?: () => void;
}

// Legacy props (for backwards compatibility)
export interface IconCraftProps {
  svgContent: string;
  mode?: ShapeMode;
  baseColor?: string;
  offset?: number;
  resolution?: number;
  simplifyEpsilon?: number;
  showShadow?: boolean;
  showHighlight?: boolean;
  className?: string;
  style?: CSSProperties;
}
