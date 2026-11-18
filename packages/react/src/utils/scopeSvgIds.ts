/**
 * Make every id inside an SVG string unique by adding a prefix.
 *
 * SVGs embedded inline in the same HTML document share one id namespace.
 * Icon sets such as Noto Color Emoji reuse ids like `SVGID_1_` in every file,
 * so `url(#SVGID_1_)` in one icon resolves to the gradient of whichever icon
 * appeared first on the page. Prefixing each embedded copy keeps them apart.
 *
 * Rewritten (only for ids defined in the same string, external refs are kept):
 * - `id="X"`
 * - `url(#X)` in attributes, `style` attributes and `<style>` blocks
 * - `href="#X"` and `xlink:href="#X"`
 * - `#X` selectors inside `<style>` blocks
 */

/** `id="X"` / `id='X'` as an attribute (preceded by whitespace, so `data-id` is not matched) */
const ID_ATTR = /(?<=\s)id\s*=\s*(["'])([^"']+)\1/g;
const URL_REF = /url\(\s*(["']?)#([^"')\s]+)\1\s*\)/g;
const HREF_REF = /(\s(?:xlink:)?href\s*=\s*)(["'])#([^"']+)\2/g;
const STYLE_BLOCK = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;
const CSS_ID_SELECTOR = /#([A-Za-z_][\w-]*)/g;

/**
 * Turn a React `useId()` value (`:r1:`, `«r1»`, `_r_1_` ...) into a prefix
 * that is safe inside an id and a CSS selector.
 */
export function toSvgIdPrefix(reactId: string): string {
  return `ic${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;
}

export function scopeSvgIds(svg: string, prefix: string): string {
  if (!svg || !prefix) return svg;

  const ids = new Set<string>();
  for (const m of svg.matchAll(ID_ATTR)) ids.add(m[2]);
  if (ids.size === 0) return svg;

  const scoped = (id: string): string | null => (ids.has(id) ? `${prefix}-${id}` : null);

  let out = svg.replace(ID_ATTR, (_all, q: string, id: string) => `id=${q}${prefix}-${id}${q}`);

  out = out.replace(URL_REF, (all, q: string, id: string) => {
    const next = scoped(id);
    return next ? `url(${q}#${next}${q})` : all;
  });

  out = out.replace(HREF_REF, (all, attr: string, q: string, id: string) => {
    const next = scoped(id);
    return next ? `${attr}${q}#${next}${q}` : all;
  });

  out = out.replace(STYLE_BLOCK, (_all, open: string, css: string, close: string) => {
    const rewritten = css.replace(CSS_ID_SELECTOR, (sel, id: string) => {
      const next = scoped(id);
      return next ? `#${next}` : sel;
    });
    return open + rewritten + close;
  });

  return out;
}
