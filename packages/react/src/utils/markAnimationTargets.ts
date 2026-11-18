/**
 * Add classes for shape-only / icon-only animation (animationTarget = 'shape' | 'icon').
 *
 * - Shape: the group drawn with the drop-shadow filter, `<g filter="url(#...-shadow)">`,
 *   gets `class="iconcraft-shape"`.
 * - Icon: the nested `<svg x=".." y="..">` that holds the icon is wrapped in
 *   `<g class="iconcraft-icon-wrapper">`. Two layouts exist:
 *   - emboss / wax: `<g filter="none" [transform=..]><svg ..>..</svg></g>` (from WASM or IconCraftView)
 *   - other styles: `<svg x=".." y="..">..</svg>` right after the shape group's `</g>`
 */

/** `<g filter="url(#...-shadow)"` (the id may contain any prefix) */
const SHAPE_GROUP = /<g filter="url\(#[^"()]*-shadow\)"/g;

/** emboss / wax: `<g filter="none" ...>` + icon `<svg>` + `</g>` (attributes such as transform allowed) */
const EMBOSS_ICON = /(<g filter="none"[^>]*>)\s*(<svg\b[^>]*>[\s\S]*?<\/svg>)\s*(<\/g>)/g;

/** other styles: icon `<svg x=".." y="..">` placed right after the shape group's `</g>` */
const PLAIN_ICON = /(<\/g>\s*)(<svg\s+x="[^"]*"\s+y="[^"]*"[^>]*>[\s\S]*?<\/svg>)/g;

export function markAnimationTargets(svg: string): string {
  if (!svg) return svg;

  let out = svg.replace(SHAPE_GROUP, '$& class="iconcraft-shape"');
  out = out.replace(EMBOSS_ICON, '$1<g class="iconcraft-icon-wrapper">$2</g>$3');
  out = out.replace(PLAIN_ICON, '$1<g class="iconcraft-icon-wrapper">$2</g>');
  return out;
}
