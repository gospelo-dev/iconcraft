import { useIconCraft } from './useIconCraft';
import type { IconCraftProps } from './types';

/**
 * Legacy IconCraft component
 * @deprecated Use IconCraftView with IconCraftFactory instead
 */
export function IconCraft({
  svgContent,
  mode = 'jelly',
  baseColor = '#6366f1',
  offset = 5.0,
  resolution = 256,
  simplifyEpsilon = 0.5,
  showShadow: _showShadow = true,
  showHighlight: _showHighlight = true,
  className,
  style,
}: IconCraftProps) {
  const { result, isLoading, error } = useIconCraft({
    svg: svgContent,
    mode,
    shapeColor: baseColor,
    offset,
    resolution,
    simplify: simplifyEpsilon,
  });

  if (isLoading) {
    return (
      <div className={className} style={style}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={style}>
        Error: {error}
      </div>
    );
  }

  if (!result?.emboss_svg) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        width: '100%',
        height: '100%',
      }}
      dangerouslySetInnerHTML={{ __html: result.emboss_svg }}
    />
  );
}
