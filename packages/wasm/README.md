# IconCraft WASM

Rust source code for the IconCraft WASM module. This repository contains the private source code that builds the [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm) npm package.

## Overview

A WebAssembly module that generates emboss-style decorative shapes from SVG icons. Creates smooth, 3D-looking clip-paths with highlights and shadows.

### Shape Modes

| Mode | Description |
|------|-------------|
| **Sticker** | Jelly-based shape with paper-like noise texture, no highlights |
| **Jelly** | Smooth, organic blob shape following icon contours |
| **Bubble** | Perfect circle/sphere with glass-like highlights |
| **Wax** | Irregular wax seal shape with pressed icon indent |

## Build

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

### Build Commands

```bash
# Build WASM package
wasm-pack build --target web

# Output: pkg/
```

### Build Output

```
pkg/
├── icon_craft_wasm.js       # JavaScript bindings
├── icon_craft_wasm.d.ts     # TypeScript definitions
├── icon_craft_wasm_bg.wasm  # WASM binary
└── package.json             # npm package config
```

## Development

### Run Tests

```bash
cargo test
```

### WASM Tests

```bash
wasm-pack test --headless --firefox
```

## Distribution

The built `pkg/` directory is copied to the public repository for npm distribution:

```bash
# Copy binaries to public repository
cp pkg/*.js pkg/*.wasm pkg/*.d.ts ../iconcraft/packages/wasm/
```

### Publishing

Publishing is done from the public repository root:

```bash
make publish OTP=123456 BUMP=patch
```

## Architecture

### Core Pipeline

1. **SVG Parsing** - Parse input SVG using `usvg`
2. **Rasterization** - Render to bitmap with `resvg` + `tiny-skia`
3. **Contour Extraction** - Find contours using `imageproc`
4. **Shape Processing** - Convex hull, Gaussian blur, simplification
5. **Output Generation** - CSS polygon, SVG path, emboss SVG

### Key Dependencies

| Crate | Purpose |
|-------|---------|
| `wasm-bindgen` | Rust-JavaScript interop |
| `resvg` / `usvg` | SVG parsing and rasterization |
| `tiny-skia` | 2D graphics rendering |
| `image` / `imageproc` | Image processing, contour detection |
| `serde` | Serialization for JS interop |

## API

### Exported Functions

```rust
// Basic clip-path generation
generate_clippath(svg_content, mode, offset, resolution, simplify_epsilon) -> ClipPathResult

// With icon embedding
generate_clippath_with_icon(svg_content, mode, offset, resolution, simplify_epsilon, include_icon) -> ClipPathResult

// With custom color palette
generate_clippath_with_color(svg_content, mode, offset, resolution, simplify_epsilon, include_icon, base_color) -> ClipPathResult

// With rotation (shape follows rotated icon, shadow direction adjusted)
generate_clippath_with_rotation(svg_content, mode, offset, resolution, simplify_epsilon, include_icon, base_color, rotation_degrees) -> ClipPathResult
```

### Result Structure

```rust
pub struct ClipPathResult {
    pub success: bool,
    pub clip_path: Option<String>,        // CSS polygon()
    pub inner_clip_path: Option<String>,  // For Wax mode
    pub highlight_clip_paths: Option<Vec<String>>,
    pub points_count: usize,
    pub mode: String,
    pub error: Option<String>,
    pub icon_layout: Option<IconLayout>,
    pub svg_paths: Option<SvgPaths>,
    pub emboss_svg: Option<String>,       // Complete emboss SVG
    pub icon_paths: Option<EmbossIconData>,
    pub rotation: f32,                    // Applied rotation (degrees)
}
```

## License

Source code is private. Built binaries are distributed under MIT license.
