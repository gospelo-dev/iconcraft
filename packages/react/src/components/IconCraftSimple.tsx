import { useMemo } from 'react';
import { IconCraftFactory } from '../core/IconCraftFactory';
import { IconCraftView, type IconCraftViewProps } from './IconCraftView';
import type { ShapeMode, IconStyle, AnimationType, AnimationOptions, AnimationTarget } from '../types';

/**
 * IconCraftSimple Props
 *
 * シンプルなインターフェースでIconCraftを使用するためのコンポーネント
 */
export interface IconCraftSimpleProps {
  /** SVG URL または SVG文字列 */
  src: string;

  /** シェイプモード */
  mode?: ShapeMode;

  /** アイコンスタイル */
  iconStyle?: IconStyle;

  /** アイコンの色（stroke/fillスタイル時） */
  iconColor?: string;

  /** シェイプカラー (hex) */
  shapeColor?: string;

  /** サイズ (px) */
  size?: number;

  /** アニメーション種類 */
  animation?: AnimationType;

  /** アニメーションオプション */
  animationOptions?: AnimationOptions;

  /** アニメーションターゲット */
  animationTarget?: AnimationTarget;

  /** ホバー時にアニメーション */
  animateOnHover?: boolean;

  /** Z-index */
  zIndex?: number;

  /** クラス名 */
  className?: string;

  /** インラインスタイル */
  style?: React.CSSProperties;

  /** クリックイベント */
  onClick?: () => void;

  /** ロード完了コールバック */
  onLoad?: () => void;

  /** エラーコールバック */
  onError?: (error: string) => void;

  /** 詳細設定（IconCraftViewに渡す追加props） */
  viewProps?: Partial<Omit<IconCraftViewProps, 'instance'>>;
}

/**
 * IconCraftSimple
 *
 * 最もシンプルな使い方でIconCraftを利用できるコンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * <IconCraftSimple src="/icon.svg" />
 *
 * // カスタマイズ
 * <IconCraftSimple
 *   src="https://example.com/icon.svg"
 *   mode="jelly"
 *   shapeColor="#6366f1"
 *   size={200}
 *   animation="float"
 * />
 *
 * // SVG文字列を直接渡す
 * <IconCraftSimple
 *   src={`<svg>...</svg>`}
 *   mode="bubble"
 *   iconStyle="emboss"
 * />
 * ```
 */
export function IconCraftSimple({
  src,
  mode = 'jelly',
  iconStyle = 'original',
  iconColor = '#1d1d1f',
  shapeColor = '#ffffff',
  size = 160,
  animation,
  animationOptions,
  animationTarget,
  animateOnHover,
  zIndex,
  className,
  style,
  onClick,
  onLoad,
  onError,
  viewProps,
}: IconCraftSimpleProps) {
  // src, mode, iconStyle, color, size が変わったときだけインスタンスを再生成
  const instance = useMemo(() => {
    const factory = new IconCraftFactory({
      mode,
      iconStyle,
      iconColor,
      shapeColor,
      size,
    });
    return factory.create(src);
  }, [src, mode, iconStyle, iconColor, shapeColor, size]);

  // アニメーション設定をマージ
  const resolvedAnimation = animation && animationOptions
    ? { ...animationOptions, type: animation }
    : animation;

  return (
    <IconCraftView
      instance={instance}
      animation={resolvedAnimation}
      animationTarget={animationTarget}
      animateOnHover={animateOnHover}
      zIndex={zIndex}
      className={className}
      style={style}
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
      {...viewProps}
    />
  );
}
