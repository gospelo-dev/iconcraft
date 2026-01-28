import { useEffect, useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { AnimationType, AnimationOptions, AnimationTarget } from '../types';
import { IconCraftInstance } from '../core/IconCraftInstance';
import {
  parseAnimationOptions,
  getAnimationStyle,
  injectKeyframes,
  getTransformOrigin,
  type TransformOriginValue,
} from '../animations';

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
}: IconCraftViewProps) {
  const [, forceUpdate] = useState({});
  const [isHovering, setIsHovering] = useState(false);

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
      const modes = ['wax', 'jelly', 'droplet'];
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

      // original/white/darkスタイルの場合はアイコン部分を置き換え
      if (iconStyle !== 'emboss') {
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
          const newIconSvg = `<g filter="none">
    <svg x="${layout?.left_percent ?? 28}" y="${layout?.top_percent ?? 28}" width="${layout?.width_percent ?? 44}" height="${layout?.height_percent ?? 44}" viewBox="${viewBox}" overflow="visible">
      ${iconContent}
    </svg>
  </g>`;

          // 既存のアイコン部分を置き換え
          svg = svg.replace(/<g filter="none">[\s\S]*?<\/g>\s*<\/svg>$/, `${newIconSvg}\n</svg>`);
        }
      }

      return svg;
    }

    // Jelly/Dropletモードでembossスタイルの場合
    if (iconStyle === 'emboss' && instance.embossSvg) {
      let svg = instance.embossSvg;
      // SVG内のIDを一意にする（グラデーションIDの衝突を防ぐ）
      const modes = ['wax', 'jelly', 'droplet'];
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
      return svg;
    }

    // emboss以外のスタイル（original, white, dark）
    // clip_pathとsvgContentを使ってレンダリング
    if (!result || !result.svg_paths?.clip) return '';

    const svgContent = instance.svgContent;
    if (!svgContent) return '';

    const color = instance.config.shapeColor;
    const layout = result.icon_layout;

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
    const isJellyOrDroplet = mode === 'jelly' || mode === 'droplet';
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

    // Jelly/Dropletモードの場合は半透明+ハイライト
    const bgGradient = isJellyOrDroplet
      ? `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="${color}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.5"/>
        </linearGradient>
        <linearGradient id="${instanceId}-top-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.6"/>
          <stop offset="30%" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="#fff" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-bottom-shadow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="40%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="70%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="${instanceId}-edge-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#fff" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>`
      : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-top-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>
          <stop offset="40%" stop-color="#fff" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-bottom-shadow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="60%" stop-color="#000" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.25"/>
        </linearGradient>`;

    // Jelly/Dropletのシェイプ描画（半透明+ハイライト）
    const shapeContent = isJellyOrDroplet
      ? `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-bottom-shadow)"/>
        ${highlightPath ? `<path d="${highlightPath}" fill="url(#${instanceId}-edge-highlight)"/>` : ''}`
      : `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-bottom-shadow)"/>`;

    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${bgGradient}
        <clipPath id="${clipId}">
          <path d="${clipPath}"/>
        </clipPath>
        <filter id="${instanceId}-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="6" stdDeviation="8" flood-opacity="0.25"/>
        </filter>
      </defs>
      <!-- シェイプ背景 -->
      <g filter="url(#${instanceId}-shadow)">
        ${shapeContent}
      </g>
      <!-- アイコン（シェイプの上に重ねる） -->
      <svg x="${layout?.left_percent ?? 28}" y="${layout?.top_percent ?? 28}"
           width="${layout?.width_percent ?? 44}" height="${layout?.height_percent ?? 44}"
           viewBox="${viewBox}" overflow="visible">
        ${useOriginalColors ? innerSvg : isStroke ? `<g fill="none" stroke="${iconColor}" stroke-width="1.5">${innerSvg}</g>` : `<g fill="${iconFill}">${innerSvg}</g>`}
      </svg>
    </svg>`;

    return svg;
  }, [instance.id, instance.config.mode, instance.config.iconStyle, instance.config.iconColor, instance.config.shapeColor, instance.embossSvg, instance.result, instance.svgContent]);

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

  // CSS変数でshape/icon個別のアニメーションを制御
  const cssVars: Record<string, string> = {};
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

  return (
    <div
      className={className}
      style={{ ...containerStyle, ...cssVars } as CSSProperties}
      onClick={onClick}
      onMouseEnter={hoverAnim ? () => setIsHovering(true) : undefined}
      onMouseLeave={hoverAnim ? () => setIsHovering(false) : undefined}
      dangerouslySetInnerHTML={{ __html: animationStyles + processedSvg }}
    />
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
