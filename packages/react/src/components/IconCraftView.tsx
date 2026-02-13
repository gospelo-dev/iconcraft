import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { AnimationType, AnimationOptions, AnimationTarget } from '../types';
import { IconCraftInstance } from '../core/IconCraftInstance';
import { dialPresetDotted } from './dialPresets';
import {
  parseAnimationOptions,
  getAnimationStyle,
  injectKeyframes,
  getTransformOrigin,
  type TransformOriginValue,
} from '../animations';
import { sanitizeSvg } from '../utils/sanitize';

/**
 * Format coordinate value for CSS
 */
function formatCoordinate(value: string | number): string {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }
  return value;
}

/**
 * Convert transform origin preset/value to CSS value
 */
function resolveTransformOrigin(value: TransformOriginValue): string {
  // Handle custom object format
  if (typeof value === 'object' && value !== null) {
    const x = formatCoordinate(value.x);
    const y = formatCoordinate(value.y);
    return `${x} ${y}`;
  }

  // Handle preset strings
  switch (value) {
    case 'center':
    case 'icon':
      return 'center center';
    case 'top':
      return '50% 0%';
    case 'bottom':
      return '50% 100%';
    case 'left':
      return '0% 50%';
    case 'right':
      return '100% 50%';
    case 'top-left':
      return '0% 0%';
    case 'top-right':
      return '100% 0%';
    case 'bottom-left':
      return '0% 100%';
    case 'bottom-right':
      return '100% 100%';
    default:
      return 'center center';
  }
}

// Custom rotate cursor (circular arrow SVG)
const ROTATE_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>`;
const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ROTATE_CURSOR_SVG)}") 12 12, pointer`;

export interface IconCraftViewProps {
  /** IconCraftInstance */
  instance: IconCraftInstance;

  /** Animation override */
  animation?: AnimationType | AnimationOptions;

  /**
   * Animation target override.
   * - 'shape': Animate only the background shape
   * - 'icon': Animate only the icon inside
   * - 'both': Animate entire component (default)
   */
  animationTarget?: AnimationTarget;

  /** Animate on hover */
  animateOnHover?: boolean;

  /** Z-index for layering */
  zIndex?: number;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Click handler */
  onClick?: () => void;

  /** Load callback */
  onLoad?: () => void;

  /** Error callback */
  onError?: (error: string) => void;

  /** Show rotation dial overlay */
  showRotationDial?: boolean;

  /** Rotation change callback (called on mouseup with final degree) */
  onRotationChange?: (deg: number) => void;

  /** Snap angle in degrees (default: 5) */
  rotationSnap?: number;

  /** Custom ring SVG renderer */
  renderRing?: (props: DialRingProps) => React.ReactNode;

  /** Custom notch SVG renderer */
  renderNotch?: (props: DialNotchProps) => React.ReactNode;

  /** Custom label SVG renderer */
  renderLabel?: (props: DialLabelProps) => React.ReactNode;

  /** Dial preset object (overrides renderRing/renderNotch/renderLabel) */
  dialPreset?: import('./dialPresets').DialPreset;

  /** Show center reticle */
  showReticle?: boolean;

  /** Custom reticle SVG renderer */
  renderReticle?: (props: ReticleProps) => React.ReactNode;

  /** Reticle preset object (overrides renderReticle) */
  reticlePreset?: import('./dialPresets').ReticlePreset;

  /** Dial ring color (default: '#000') */
  dialColor?: string;

  /** Notch color (default: '#000') */
  notchColor?: string;

  /** Reticle color (default: '#000') */
  reticleColor?: string;

  /**
   * External CSS rotation preview (degrees).
   * Applied only to the shape+icon layer via CSS transform,
   * keeping dial and reticle layers fixed.
   * Set to null/undefined to disable.
   */
  cssRotation?: number | null;
}

/** Props passed to custom reticle renderer */
export interface ReticleProps {
  cx: number;
  cy: number;
  size: number;
  /** Which layer is being rendered: 'back' (behind icon) or 'front' (above icon) */
  layer: 'back' | 'front';
}

/** Props passed to custom ring renderer */
export interface DialRingProps {
  cx: number;
  cy: number;
  radius: number;
}

/** Props passed to custom notch renderer */
export interface DialNotchProps {
  x: number;
  y: number;
  /** Current angle in degrees (0 = top) */
  degrees: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

/** Props passed to custom label renderer */
export interface DialLabelProps {
  x: number;
  y: number;
  degrees: number;
}

/**
 * IconCraftView - インスタンスからSVGを表示するコンポーネント
 *
 * @example
 * ```tsx
 * const factory = new IconCraftFactory({ mode: 'wax', shapeColor: '#6366f1' });
 * const icon = factory.create('<svg>...</svg>');
 *
 * <IconCraftView instance={icon} zIndex={10} />
 * ```
 */
export function IconCraftView({
  instance,
  animation,
  animationTarget,
  animateOnHover = false,
  zIndex,
  className,
  style,
  onClick,
  onLoad,
  onError,
  showRotationDial = false,
  onRotationChange,
  rotationSnap = 5,
  renderRing: renderRingProp,
  renderNotch: renderNotchProp,
  renderLabel: renderLabelProp,
  dialPreset,
  showReticle = false,
  renderReticle: renderReticleProp,
  reticlePreset,
  dialColor: dialColorProp,
  notchColor: notchColorProp,
  reticleColor: reticleColorProp,
  cssRotation,
}: IconCraftViewProps) {
  // Resolve render functions: dialPreset > individual props > built-in Dotted default
  const resolvedDial = dialPreset ?? (renderRingProp || renderNotchProp || renderLabelProp ? undefined : dialPresetDotted);
  const renderRing = resolvedDial?.renderRing ?? renderRingProp;
  const renderNotch = resolvedDial?.renderNotch ?? renderNotchProp;
  const renderLabel = resolvedDial?.renderLabel ?? renderLabelProp;
  const renderReticle = reticlePreset?.render ?? renderReticleProp;

  const [, forceUpdate] = useState({});
  const [isHovering, setIsHovering] = useState(false);

  // --- Rotation dial state ---
  const rotation = instance.config.rotation ?? 0;
  const [dialDeg, setDialDeg] = useState(rotation);
  const [isRotating, setIsRotating] = useState(false);
  const rotateCenterRef = useRef<{ cx: number; cy: number } | null>(null);
  const dialContainerRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState<number>(0);

  // ResizeObserverで実際の描画サイズを取得
  useEffect(() => {
    if (!showRotationDial || !dialContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredSize(entry.contentRect.width);
      }
    });
    observer.observe(dialContainerRef.current);
    return () => observer.disconnect();
  }, [showRotationDial]);

  // Sync dialDeg when instance rotation changes
  useEffect(() => {
    if (!isRotating) {
      setDialDeg(rotation);
    }
  }, [rotation, isRotating]);

  const handleNotchMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dialContainerRef.current) {
      const rect = dialContainerRef.current.getBoundingClientRect();
      rotateCenterRef.current = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
    }
    setIsRotating(true);
  }, []);

  const handleRotateMove = useCallback((e: MouseEvent) => {
    if (!isRotating || !rotateCenterRef.current) return;
    const { cx, cy } = rotateCenterRef.current;
    const rawAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
    const normalized = ((rawAngle % 360) + 360) % 360;
    const snapped = Math.round(normalized / rotationSnap) * rotationSnap % 360;
    setDialDeg(snapped);
  }, [isRotating, rotationSnap]);

  const handleRotateUp = useCallback(() => {
    if (isRotating) {
      onRotationChange?.(dialDeg);
    }
    setIsRotating(false);
  }, [isRotating, dialDeg, onRotationChange]);

  useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateUp);
      return () => {
        window.removeEventListener('mousemove', handleRotateMove);
        window.removeEventListener('mouseup', handleRotateUp);
      };
    }
  }, [isRotating, handleRotateMove, handleRotateUp]);

  // アニメーション設定（propsまたはinstanceのconfig）
  const animationOptions = useMemo(() => {
    const anim = animation ?? instance.config.animation;
    return parseAnimationOptions(anim);
  }, [animation, instance.config.animation]);

  // Keyframesを注入
  useEffect(() => {
    if (animationOptions?.type) {
      injectKeyframes(animationOptions.type);
    }
  }, [animationOptions?.type]);

  // 生成を実行
  useEffect(() => {
    if (instance.isReady) {
      onLoad?.();
      return;
    }

    instance.generate()
      .then(() => {
        forceUpdate({});
        onLoad?.();
      })
      .catch((err) => {
        forceUpdate({});
        onError?.(err.message);
      });
  }, [instance, onLoad, onError]);

  // iconStyleに応じたSVGを生成
  // Note: フックは早期リターンの前に配置する必要がある
  const renderedSvg = useMemo(() => {
    const instanceId = instance.id;
    const iconStyle = instance.config.iconStyle;
    const iconColor = instance.config.iconColor;
    const result = instance.result;

    const mode = instance.config.mode;
    const isWax = mode === 'wax';

    // Waxモードの場合は常にemboss_svgをベースに使用（凹んだ3D形状のため）
    // embossスタイル: そのまま使用
    // original/white/dark: アイコン部分を置き換え
    if (isWax && instance.embossSvg) {
      let svg = instance.embossSvg;
      // SVG内のIDを一意にする（グラデーションIDの衝突を防ぐ）
      const modes = ['wax', 'jelly', 'bubble', 'sticker'];
      for (const m of modes) {
        svg = svg.replace(
          new RegExp(`id="${m}-`, 'g'),
          `id="${instanceId}-${m}-`
        );
        svg = svg.replace(
          new RegExp(`url\\(#${m}-`, 'g'),
          `url(#${instanceId}-${m}-`
        );
      }

      // embossスタイルの場合：WASMが既にアイコン回転を適用済みなのでそのまま返す
      if (iconStyle === 'emboss') {
        return svg;
      }

      // original/fill/strokeスタイルの場合はアイコン部分を置き換え
      {
        const svgContent = instance.svgContent;
        if (svgContent) {
          // viewBoxを抽出
          const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
          const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 36 36';

          // SVGタグを除去してpath部分だけ取得
          let innerSvg = svgContent.replace(/<\/?svg[^>]*>/g, '');

          // アイコンの色・描画方法を決定
          let iconContent: string;

          switch (iconStyle) {
            case 'fill':
              innerSvg = innerSvg.replace(/fill="[^"]*"/g, '');
              iconContent = `<g fill="${iconColor}">${innerSvg}</g>`;
              break;
            case 'stroke':
              innerSvg = innerSvg.replace(/fill="[^"]*"/g, '');
              innerSvg = innerSvg.replace(/stroke="[^"]*"/g, '');
              innerSvg = innerSvg.replace(/stroke-width="[^"]*"/g, '');
              iconContent = `<g fill="none" stroke="${iconColor}" stroke-width="1.5">${innerSvg}</g>`;
              break;
            case 'original':
            default:
              iconContent = innerSvg;
              break;
          }

          // emboss_svgからアイコン部分（<g filter="none">...</g>）を置き換え
          const layout = result?.icon_layout;
          const rotation = instance.config.rotation;
          const iconCx = (layout?.left_percent ?? 28) + (layout?.width_percent ?? 44) / 2;
          const iconCy = (layout?.top_percent ?? 28) + (layout?.height_percent ?? 44) / 2;
          const rotateAttr = rotation ? ` transform="rotate(${rotation}, ${iconCx.toFixed(2)}, ${iconCy.toFixed(2)})"` : '';
          const newIconSvg = `<g filter="none"${rotateAttr}>
    <svg x="${layout?.left_percent ?? 28}" y="${layout?.top_percent ?? 28}" width="${layout?.width_percent ?? 44}" height="${layout?.height_percent ?? 44}" viewBox="${viewBox}" overflow="visible">
      ${iconContent}
    </svg>
  </g>`;

          // 既存のアイコン部分を置き換え（rotation時はtransform属性が付くためオプショナルに）
          svg = svg.replace(/<g filter="none"[^>]*>[\s\S]*?<\/g>\s*<\/svg>$/, `${newIconSvg}\n</svg>`);
        }
      }

      return svg;
    }

    // Jelly/Bubbleモードでembossスタイルの場合
    if (iconStyle === 'emboss' && instance.embossSvg) {
      let svg = instance.embossSvg;
      // SVG内のIDを一意にする（グラデーションIDの衝突を防ぐ）
      const modes = ['wax', 'jelly', 'bubble', 'sticker'];
      for (const m of modes) {
        svg = svg.replace(
          new RegExp(`id="${m}-`, 'g'),
          `id="${instanceId}-${m}-`
        );
        svg = svg.replace(
          new RegExp(`url\\(#${m}-`, 'g'),
          `url(#${instanceId}-${m}-`
        );
      }
      // WASMが既にアイコン回転を適用済みなのでそのまま返す
      return svg;
    }

    // emboss以外のスタイル（original, white, dark）
    // clip_pathとsvgContentを使ってレンダリング
    if (!result || !result.svg_paths?.clip) return '';

    const svgContent = instance.svgContent;
    if (!svgContent) return '';

    const color = instance.config.shapeColor;
    const layout = result.icon_layout;
    const rotation = instance.config.rotation;

    // Jellyのみ外形が回転するため逆回転が必要。Bubbleは固定円なので不要。
    // Jelly外形はジオメトリが事前回転済み（SVG transformなし）なので
    // feDropShadow/グラデーション共に逆回転不要
    const shadowDx = 4;
    const shadowDy = 5;
    const gradTransform = '';

    // アイコンの色・描画方法を決定
    let useOriginalColors = false;
    let isStroke = false;
    let iconFill: string;
    switch (iconStyle) {
      case 'fill':
        iconFill = iconColor;
        break;
      case 'stroke':
        iconFill = 'none';
        isStroke = true;
        break;
      case 'original':
      default:
        iconFill = 'currentColor';
        useOriginalColors = true;
        break;
    }

    // シェイプ内にアイコンを配置するSVGを生成
    const clipPath = result.svg_paths.clip;
    const highlightPath = result.svg_paths.highlight;
    const isSticker = mode === 'sticker';
    const isJellyOrBubble = mode === 'jelly' || mode === 'bubble' || isSticker;
    const gradientId = `${instanceId}-bg-grad`;
    const clipId = `${instanceId}-clip`;

    // viewBoxを抽出
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // SVGタグを除去してpath部分だけ取得
    let innerSvg = svgContent.replace(/<\/?svg[^>]*>/g, '');

    // fill/strokeスタイルの場合は元のfill属性を削除して単色にする
    if (iconStyle === 'fill' || iconStyle === 'stroke') {
      innerSvg = innerSvg.replace(/fill="[^"]*"/g, '');
    }
    if (isStroke) {
      innerSvg = innerSvg.replace(/stroke="[^"]*"/g, '');
      innerSvg = innerSvg.replace(/stroke-width="[^"]*"/g, '');
    }

    // Jelly/Bubbleモードの場合は半透明+ハイライト
    // Jelly/Bubble: userSpaceOnUse でワールド座標固定（viewBox 0 0 100 100）
    const bgGradient = isJellyOrBubble
      ? `<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="${color}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.5"/>
        </linearGradient>
        ${isSticker ? '' : `<linearGradient id="${instanceId}-top-highlight" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="50" y2="100">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.6"/>
          <stop offset="30%" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="#fff" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-bottom-shadow" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="50" y2="100">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="40%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="70%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="${instanceId}-edge-highlight" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#fff" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>`}`
      : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"${gradTransform}>
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-top-highlight" x1="50%" y1="0%" x2="50%" y2="100%"${gradTransform}>
          <stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>
          <stop offset="40%" stop-color="#fff" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-bottom-shadow" x1="50%" y1="0%" x2="50%" y2="100%"${gradTransform}>
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="60%" stop-color="#000" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.25"/>
        </linearGradient>`;

    // シェイプ描画
    const shapeContent = isJellyOrBubble
      ? (isSticker
        ? `<path d="${clipPath}" fill="url(#${gradientId})"/>`
        : `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-bottom-shadow)"/>
        ${highlightPath ? `<path d="${highlightPath}" fill="url(#${instanceId}-edge-highlight)"/>` : ''}`)
      : `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-bottom-shadow)"/>`;

    const iconContent = (() => {
      const base = useOriginalColors ? innerSvg : isStroke ? `<g fill="none" stroke="${iconColor}" stroke-width="1.5">${innerSvg}</g>` : `<g fill="${iconFill}">${innerSvg}</g>`;
      if (rotation !== 0) {
        const parts = viewBox.split(/\s+/);
        const vbX = parseFloat(parts[0] || '0');
        const vbY = parseFloat(parts[1] || '0');
        const vbW = parseFloat(parts[2] || '24');
        const vbH = parseFloat(parts[3] || '24');
        const cx = vbX + vbW / 2;
        const cy = vbY + vbH / 2;
        return `<g transform="rotate(${rotation}, ${cx}, ${cy})">${base}</g>`;
      }
      return base;
    })();

    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${bgGradient}
        <clipPath id="${clipId}">
          <path d="${clipPath}"/>
        </clipPath>
        <filter id="${instanceId}-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="${shadowDx.toFixed(2)}" dy="${shadowDy.toFixed(2)}" stdDeviation="8" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#${instanceId}-shadow)">
        ${shapeContent}
      </g>
      <svg x="${layout?.left_percent ?? 28}" y="${layout?.top_percent ?? 28}"
           width="${layout?.width_percent ?? 44}" height="${layout?.height_percent ?? 44}"
           viewBox="${viewBox}" overflow="visible">
        ${iconContent}
      </svg>
    </svg>`;

    return svg;
  }, [instance.id, instance.config.mode, instance.config.iconStyle, instance.config.iconColor, instance.config.shapeColor, instance.config.rotation, instance.embossSvg, instance.result, instance.svgContent]);

  // サイズを取得
  const { width, height } = instance.config.getSize();

  // アニメーションスタイル
  const hoverAnim = animateOnHover ?? instance.config.animateOnHover;
  const shouldAnimate = hoverAnim ? isHovering : true;
  const animStyle = shouldAnimate ? getAnimationStyle(animationOptions) : 'none';

  // Animation target: props > animationOptions.target > 'both'
  const target: AnimationTarget = animationTarget ?? animationOptions?.target ?? 'both';

  // コンテナスタイル（target='both'の場合のみコンテナにアニメーション適用）
  const containerStyle: CSSProperties = {
    width,
    height,
    display: 'inline-block',
    position: 'relative',
    cursor: onClick ? 'pointer' : undefined,
    animation: target === 'both' ? animStyle : undefined,
    zIndex,
    ...style,
  };

  // CSS変数でカラーを制御
  const cssVars: Record<string, string> = {};
  if (dialColorProp) cssVars['--iconcraft-dial-color'] = dialColorProp;
  if (notchColorProp) cssVars['--iconcraft-notch-color'] = notchColorProp;
  if (reticleColorProp) cssVars['--iconcraft-reticle-color'] = reticleColorProp;
  if (target === 'shape') {
    cssVars['--iconcraft-shape-animation'] = animStyle;
    cssVars['--iconcraft-icon-animation'] = 'none';
  } else if (target === 'icon') {
    cssVars['--iconcraft-shape-animation'] = 'none';
    cssVars['--iconcraft-icon-animation'] = animStyle;
  } else {
    cssVars['--iconcraft-shape-animation'] = 'none';
    cssVars['--iconcraft-icon-animation'] = 'none';
  }

  // カスタムアニメーションのtransformOrigin設定を取得
  const transformOriginValue = animationOptions?.type
    ? getTransformOrigin(animationOptions.type)
    : 'center';
  const transformOriginCss = resolveTransformOrigin(transformOriginValue);

  // shape/icon個別アニメーション用のスタイル
  // SVGのtransform-originはデフォルトでviewBox座標系を使用
  // transform-box: fill-box を使うとその要素のバウンディングボックスが基準になる
  const animationStyles = target !== 'both' ? `
    <style>
      .iconcraft-shape {
        animation: var(--iconcraft-shape-animation, none);
        transform-origin: ${transformOriginCss};
        transform-box: fill-box;
      }
      .iconcraft-icon-wrapper {
        animation: var(--iconcraft-icon-animation, none);
        transform-origin: ${transformOriginCss};
        transform-box: fill-box;
      }
    </style>
  ` : '';

  // SVGにクラスを付与（shape/icon個別アニメーション対応）
  // NOTE: useMemoは早期リターンの前に配置（Hooksのルール）
  const processedSvg = useMemo(() => {
    if (!renderedSvg) return '';
    if (target === 'both') return renderedSvg;

    let svg = renderedSvg;

    // シェイプ部分（filter="url(#..."）にクラスを付与
    svg = svg.replace(
      /<g filter="url\(#[^"]*-shadow"\)/g,
      '$& class="iconcraft-shape"'
    );

    // アイコン部分: <g filter="none">の直後にある<svg>要素をラップ
    // パターン: <g filter="none">\n    <svg x="..." ... </svg>\n  </g>
    svg = svg.replace(
      /(<g filter="none">)\s*(<svg[^>]*>[\s\S]*?<\/svg>)\s*(<\/g>)/g,
      '$1<g class="iconcraft-icon-wrapper">$2</g>$3'
    );

    // ルートSVG直下のアイコン用SVG（filter="none"がない場合）もラップ
    // パターン: </g>\n<!-- アイコン...\n<svg x="..." で始まるアイコン部分
    svg = svg.replace(
      /(<\/g>\s*<!-- アイコン[^>]*-->\s*)(<svg[^>]*x="[^"]*"[^>]*y="[^"]*"[^>]*>[\s\S]*?<\/svg>)/g,
      '$1<g class="iconcraft-icon-wrapper">$2</g>'
    );

    return svg;
  }, [renderedSvg, target]);

  // ローディング中
  if (instance.isLoading) {
    return (
      <div className={className} style={containerStyle}>
        <LoadingIndicator />
      </div>
    );
  }

  // エラー
  if (instance.error) {
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
          fontSize: '11px',
          padding: '8px',
          textAlign: 'center',
        }}
      >
        {instance.error}
      </div>
    );
  }

  // 結果がない
  if (!processedSvg) {
    return null;
  }

  const previewDeg = isRotating ? dialDeg - rotation : 0;
  const cssRotateDeg = cssRotation != null ? cssRotation - rotation : 0;
  const shapeTransformDeg = previewDeg || cssRotateDeg;

  // ダイヤルなし・レティクルなしの場合はシンプルにレンダリング
  if (!showRotationDial && !showReticle) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          ...cssVars,
          ...(shapeTransformDeg ? { transform: `rotate(${shapeTransformDeg}deg)` } : {}),
        } as CSSProperties}
        onClick={onClick}
        onMouseEnter={hoverAnim ? () => setIsHovering(true) : undefined}
        onMouseLeave={hoverAnim ? () => setIsHovering(false) : undefined}
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(animationStyles + processedSvg) }}
      />
    );
  }

  // ダイヤル付きレンダリング
  const dialDegValue = isRotating ? dialDeg : cssRotation != null ? cssRotation : rotation;
  const dialPadding = 14;
  const actualWidth = measuredSize || (containerStyle.width as number | undefined) || 0;
  const dialSvgSize = actualWidth ? actualWidth + dialPadding * 2 : 0;
  const dialCenter = dialSvgSize / 2;
  const ringRadius = actualWidth ? actualWidth / 2 + 6 : 0;
  const notchRad = (dialDegValue - 90) * Math.PI / 180;
  const notchX = dialCenter + ringRadius * Math.cos(notchRad);
  const notchY = dialCenter + ringRadius * Math.sin(notchRad);

  return (
    <div
      ref={dialContainerRef}
      className={className}
      style={{ ...containerStyle, position: 'relative' } as CSSProperties}
      onClick={onClick}
      onMouseEnter={hoverAnim ? () => setIsHovering(true) : undefined}
      onMouseLeave={hoverAnim ? () => setIsHovering(false) : undefined}
    >
      {/* Reticle back layer (behind icon) */}
      {showReticle && actualWidth > 0 && (() => {
        const reticleSize = actualWidth * 0.9;
        const reticleProps = { cx: dialCenter, cy: dialCenter, size: reticleSize, layer: 'back' as const };
        return (
          <svg
            style={{
              position: 'absolute',
              left: -dialPadding,
              top: -dialPadding,
              width: dialSvgSize,
              height: dialSvgSize,
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 0,
            }}
          >
            {renderReticle
              ? renderReticle(reticleProps)
              : (
                <g opacity={0.45}>
                  <ellipse
                    cx={dialCenter} cy={dialCenter}
                    rx={reticleSize * 0.5} ry={reticleSize * 0.15}
                    fill="none" stroke="var(--iconcraft-reticle-color, #000)"
                    strokeWidth="1" strokeDasharray="3 2"
                  />
                  <ellipse
                    cx={dialCenter} cy={dialCenter}
                    rx={reticleSize * 0.15} ry={reticleSize * 0.5}
                    fill="none" stroke="var(--iconcraft-reticle-color, #000)"
                    strokeWidth="1" strokeDasharray="3 2"
                  />
                </g>
              )
            }
          </svg>
        );
      })()}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          ...(cssVars as Record<string, string>),
          ...(shapeTransformDeg ? { transform: `rotate(${shapeTransformDeg}deg)` } : {}),
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(animationStyles + processedSvg) }}
      />
      {/* Reticle front layer (above icon) */}
      {showReticle && actualWidth > 0 && (() => {
        const reticleSize = actualWidth * 0.9;
        const reticleProps = { cx: dialCenter, cy: dialCenter, size: reticleSize, layer: 'front' as const };
        return (
          <svg
            style={{
              position: 'absolute',
              left: -dialPadding,
              top: -dialPadding,
              width: dialSvgSize,
              height: dialSvgSize,
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 2,
            }}
          >
            {renderReticle
              ? renderReticle(reticleProps)
              : (
                <g opacity={0.45}>
                  <ellipse
                    cx={dialCenter} cy={dialCenter}
                    rx={reticleSize * 0.5} ry={reticleSize * 0.3}
                    fill="none" stroke="var(--iconcraft-reticle-color, #000)"
                    strokeWidth="1.2"
                    transform={`rotate(45, ${dialCenter}, ${dialCenter})`}
                  />
                  <circle
                    cx={dialCenter} cy={dialCenter} r="2"
                    fill="var(--iconcraft-reticle-color, #000)"
                  />
                </g>
              )
            }
          </svg>
        );
      })()}
      {actualWidth > 0 && showRotationDial && (
        <svg
          style={{
            position: 'absolute',
            left: -dialPadding,
            top: -dialPadding,
            width: dialSvgSize,
            height: dialSvgSize,
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 3,
          }}
        >
          {renderRing
            ? renderRing({ cx: dialCenter, cy: dialCenter, radius: ringRadius })
            : (
              <circle
                cx={dialCenter}
                cy={dialCenter}
                r={ringRadius}
                fill="none"
                stroke="var(--iconcraft-dial-color, #000)"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity={0.7}
              />
            )
          }
          <style>{`
            .iconcraft-notch {
              transition: r 0.15s ease, filter 0.15s ease;
              filter: none;
            }
            .iconcraft-notch:hover {
              r: 9;
              filter: drop-shadow(0 0 3px rgba(0,0,0,0.4));
            }
          `}</style>
          {renderNotch
            ? renderNotch({ x: notchX, y: notchY, degrees: dialDegValue, onMouseDown: handleNotchMouseDown })
            : (
              <circle
                className="iconcraft-notch"
                cx={notchX}
                cy={notchY}
                r={7}
                fill="var(--iconcraft-notch-color, #000)"
                stroke="#fff"
                strokeWidth="2"
                style={{ pointerEvents: 'auto', cursor: ROTATE_CURSOR }}
                onMouseDown={handleNotchMouseDown}
              />
            )
          }
          {isRotating && (() => {
            const labelOffset = 32;
            const labelRad = (dialDegValue - 90) * Math.PI / 180;
            const labelX = dialCenter + (ringRadius + labelOffset) * Math.cos(labelRad);
            const labelY = dialCenter + (ringRadius + labelOffset) * Math.sin(labelRad);
            return renderLabel
              ? renderLabel({ x: labelX, y: labelY, degrees: dialDeg })
              : (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--iconcraft-dial-color, #000)"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {dialDeg}°
                </text>
              );
          })()}
        </svg>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '50%',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <style>
          {`@keyframes iconcraft-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#ccc"
          strokeWidth="2"
          fill="none"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
          style={{ animation: 'iconcraft-spin 1s linear infinite' }}
        />
      </svg>
    </div>
  );
}
