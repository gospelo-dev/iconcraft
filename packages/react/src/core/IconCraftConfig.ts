import type { ShapeMode, IconStyle, AnimationType, AnimationOptions } from '../types';

/**
 * IconCraft 設定インターフェース
 */
export interface IconCraftConfigOptions {
  // Shape
  mode?: ShapeMode;
  shapeColor?: string;

  // Icon
  iconStyle?: IconStyle;
  iconColor?: string;

  // Effects
  shadow?: boolean;
  highlight?: boolean;

  // WASM Parameters
  offset?: number;
  resolution?: number;
  simplify?: number;

  // Size
  size?: number | string;
  width?: number | string;
  height?: number | string;

  // Animation
  animation?: AnimationType | AnimationOptions;
  animateOnHover?: boolean;
}

/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG: Required<Omit<IconCraftConfigOptions, 'width' | 'height' | 'animation'>> &
  Pick<IconCraftConfigOptions, 'width' | 'height' | 'animation'> = {
  mode: 'wax',
  shapeColor: '#6366f1',
  iconStyle: 'emboss',
  iconColor: '#1d1d1f',
  shadow: true,
  highlight: true,
  offset: 20,
  resolution: 256,
  simplify: 2.0,
  size: 120,
  width: undefined,
  height: undefined,
  animation: undefined,
  animateOnHover: false,
};

/**
 * IconCraft 設定クラス（プロトタイプ）
 *
 * このクラスをベースに clone() でユニークなインスタンスを生成する
 */
export class IconCraftConfig {
  readonly mode: ShapeMode;
  readonly shapeColor: string;
  readonly iconStyle: IconStyle;
  readonly iconColor: string;
  readonly shadow: boolean;
  readonly highlight: boolean;
  readonly offset: number;
  readonly resolution: number;
  readonly simplify: number;
  readonly size: number | string;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly animation?: AnimationType | AnimationOptions;
  readonly animateOnHover: boolean;

  constructor(options: IconCraftConfigOptions = {}) {
    this.mode = options.mode ?? DEFAULT_CONFIG.mode;
    this.shapeColor = options.shapeColor ?? DEFAULT_CONFIG.shapeColor;
    this.iconStyle = options.iconStyle ?? DEFAULT_CONFIG.iconStyle;
    this.iconColor = options.iconColor ?? DEFAULT_CONFIG.iconColor;
    this.shadow = options.shadow ?? DEFAULT_CONFIG.shadow;
    this.highlight = options.highlight ?? DEFAULT_CONFIG.highlight;
    this.offset = options.offset ?? DEFAULT_CONFIG.offset;
    this.resolution = options.resolution ?? DEFAULT_CONFIG.resolution;
    this.simplify = options.simplify ?? DEFAULT_CONFIG.simplify;
    this.size = options.size ?? DEFAULT_CONFIG.size;
    this.width = options.width;
    this.height = options.height;
    this.animation = options.animation;
    this.animateOnHover = options.animateOnHover ?? DEFAULT_CONFIG.animateOnHover;
  }

  /**
   * 設定を部分的に上書きした新しいConfigを生成
   */
  clone(overrides: IconCraftConfigOptions = {}): IconCraftConfig {
    return new IconCraftConfig({
      mode: overrides.mode ?? this.mode,
      shapeColor: overrides.shapeColor ?? this.shapeColor,
      iconStyle: overrides.iconStyle ?? this.iconStyle,
      iconColor: overrides.iconColor ?? this.iconColor,
      shadow: overrides.shadow ?? this.shadow,
      highlight: overrides.highlight ?? this.highlight,
      offset: overrides.offset ?? this.offset,
      resolution: overrides.resolution ?? this.resolution,
      simplify: overrides.simplify ?? this.simplify,
      size: overrides.size ?? this.size,
      width: overrides.width ?? this.width,
      height: overrides.height ?? this.height,
      animation: overrides.animation ?? this.animation,
      animateOnHover: overrides.animateOnHover ?? this.animateOnHover,
    });
  }

  /**
   * WASM呼び出し用のパラメータを取得
   */
  getWasmParams() {
    // Waxモードは凹んだ3D形状のため、常にemboss_svgが必要
    // Jelly/Dropletモードはembossスタイルの場合のみ必要
    const needsEmbossSvg = this.mode === 'wax' || this.iconStyle === 'emboss';
    return {
      mode: this.mode,
      offset: this.offset,
      resolution: this.resolution,
      simplify: this.simplify,
      includeIcon: needsEmbossSvg,
      shapeColor: this.shapeColor,
    };
  }

  /**
   * スタイル用のサイズを取得
   */
  getSize() {
    const w = this.width ?? this.size;
    const h = this.height ?? this.size;
    return {
      width: typeof w === 'number' ? `${w}px` : w,
      height: typeof h === 'number' ? `${h}px` : h,
    };
  }
}
