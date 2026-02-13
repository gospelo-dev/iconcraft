/**
 * SVG sanitizer using browser-native DOMParser.
 * Removes dangerous elements and attributes to prevent XSS
 * when rendering SVG via dangerouslySetInnerHTML.
 *
 * Defense in depth: usvg already strips non-SVG elements during WASM processing,
 * but this provides an additional safety layer at the rendering boundary.
 */

const DANGEROUS_ELEMENTS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'textarea',
  'button',
  'select',
]);

const DANGEROUS_ATTR_PREFIX = 'on'; // onclick, onload, onerror, etc.

const DANGEROUS_URL_PATTERN = /^\s*javascript\s*:/i;

const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'action', 'formaction']);

let parser: DOMParser | null = null;

function getParser(): DOMParser {
  if (!parser) {
    parser = new DOMParser();
  }
  return parser;
}

/**
 * Sanitize an SVG/HTML string by removing dangerous elements and attributes.
 * Uses the browser's DOMParser for robust parsing.
 */
export function sanitizeSvg(html: string): string {
  if (!html) return '';

  // Preserve SVG <image> elements: text/html parser converts them to <img> (void element),
  // losing attributes and closing tags. Use placeholders to protect them.
  const imagePlaceholders: string[] = [];
  const preserved = html.replace(/<image\b[^>]*\/?\s*>/gi, (match) => {
    imagePlaceholders.push(match);
    return `<!--__IMAGE_${imagePlaceholders.length - 1}__-->`;
  });

  const doc = getParser().parseFromString(preserved, 'text/html');
  sanitizeNode(doc.body);
  let result = doc.body.innerHTML;

  // Restore <image> elements from placeholders
  result = result.replace(/<!--__IMAGE_(\d+)__-->/g, (_, idx) => {
    return imagePlaceholders[parseInt(idx, 10)] ?? '';
  });
  return result;
}

function sanitizeNode(node: Node): void {
  const toRemove: Node[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      if (DANGEROUS_ELEMENTS.has(tagName)) {
        toRemove.push(el);
        continue;
      }

      // Remove dangerous attributes
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();

        // Event handlers (onclick, onload, etc.)
        if (name.startsWith(DANGEROUS_ATTR_PREFIX)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // javascript: URLs
        if (URL_ATTRIBUTES.has(name) && DANGEROUS_URL_PATTERN.test(attr.value)) {
          el.removeAttribute(attr.name);
          continue;
        }
      }

      // Recurse into children
      sanitizeNode(el);
    }
  }

  for (const node of toRemove) {
    node.parentNode?.removeChild(node);
  }
}
