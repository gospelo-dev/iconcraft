# gospelo-iconcraft-wasm

A WebAssembly module that generates emboss-style decorative shapes from SVG icons. Creates smooth, 3D-looking clip-paths with highlights and shadows.

## Installation

```bash
npm install gospelo-iconcraft-wasm
```

## Usage

```typescript
import init, { generate_clippath, generate_clippath_with_icon, ShapeMode } from 'gospelo-iconcraft-wasm';

// Initialize WASM module
await init();

// Basic usage - generate clip-path only
const result = generate_clippath(
  svgContent,        // SVG string
  ShapeMode.Jelly,   // Shape mode: Jelly, Droplet, or Wax
  20,                // Offset (padding around icon)
  256,               // Resolution
  1.0                // Simplify epsilon (polygon simplification)
);

// With icon embedding - generates complete emboss SVG
const resultWithIcon = generate_clippath_with_icon(
  svgContent,
  ShapeMode.Wax,
  20,
  256,
  1.0,
  true               // include_icon: generates emboss_svg with gradients
);
```

## API

### Shape Modes

| Mode | Description |
|------|-------------|
| `ShapeMode.Jelly` | Smooth, organic blob shape following icon contours |
| `ShapeMode.Droplet` | Perfect circle/sphere with glass-like highlights |
| `ShapeMode.Wax` | Irregular wax seal shape with pressed icon indent |

### Functions

#### `generate_clippath(svg_content, mode, offset, resolution, simplify_epsilon)`

Generates a clip-path polygon from SVG content.

**Returns:**
```typescript
{
  success: boolean;
  clip_path: string;           // CSS polygon() string
  inner_clip_path?: string;    // Inner shape for Wax mode
  highlight_clip_paths?: string[];
  points_count: number;
  mode: string;
  icon_layout: {
    top_percent: number;
    left_percent: number;
    width_percent: number;
    height_percent: number;
  };
  svg_paths: {
    clip: string;              // SVG path d attribute
    inner?: string;
    shadow?: string;
    highlight?: string;
  };
}
```

#### `generate_clippath_with_icon(svg_content, mode, offset, resolution, simplify_epsilon, include_icon)`

Same as above, but when `include_icon` is true, also returns:
- `emboss_svg`: Complete SVG with gradients, filters, and icon paths
- `icon_paths`: Parsed icon path data for custom rendering

#### `generate_clippath_with_color(svg_content, mode, offset, resolution, simplify_epsilon, include_icon, shape_color)`

Same as `generate_clippath_with_icon`, but uses custom shape color (hex string like `"#6366f1"`) to generate the color palette for gradients.

## Example Output

The generated `emboss_svg` includes:
- Multi-layer gradients for 3D depth effect
- Highlights and shadows
- Drop shadow filter
- Embedded icon with emboss styling

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients and filters -->
  </defs>
  <!-- Main shape with gradient layers -->
  <!-- Inner indent (Wax mode) -->
  <!-- Highlights (Jelly/Droplet mode) -->
  <!-- Embedded icon -->
</svg>
```

## Browser Support

Requires WebAssembly support. Works in all modern browsers.

## Repository

- [GitHub](https://github.com/gospelo-dev/iconcraft/tree/main/packages/wasm) - Package distribution
- [Issues](https://github.com/gospelo-dev/iconcraft/issues) - Bug reports & feature requests

## Related

- [gospelo-iconcraft-react](https://www.npmjs.com/package/gospelo-iconcraft-react) - React components using this WASM module

## License

MIT
