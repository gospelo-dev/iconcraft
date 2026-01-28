# gospelo-iconcraft-react

React components for creating emboss-style decorative icon shapes from SVG. Features 3D-looking shapes with highlights, shadows, and smooth animations.

## Installation

```bash
npm install gospelo-iconcraft-react
```

## Quick Start

```tsx
import { IconCraftShape } from 'gospelo-iconcraft-react';

function App() {
  return (
    <IconCraftShape
      svg="<svg>...</svg>"
      mode="wax"
      shapeColor="#6366f1"
    />
  );
}
```

## Components

### `<IconCraftShape>` (Recommended)

Modern component with full feature support.

```tsx
import { IconCraftShape } from 'gospelo-iconcraft-react';

<IconCraftShape
  svg="<svg>...</svg>"
  mode="jelly"
  shapeColor="#10b981"
  iconColor="#1d1d1f"
  size={120}
  animation="bounce"
  shadow
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `svg` | `string` | required | SVG content string |
| `mode` | `'jelly' \| 'droplet' \| 'wax'` | `'jelly'` | Shape mode |
| `shapeColor` | `string` | `'#6366f1'` | Shape base color (hex) |
| `iconColor` | `string` | `'#1d1d1f'` | Icon color (for stroke/fill styles) |
| `iconStyle` | `'original' \| 'emboss' \| 'stroke' \| 'fill'` | `'emboss'` | Icon rendering style |
| `size` | `number \| string` | - | Width and height |
| `width` | `number \| string` | - | Width |
| `height` | `number \| string` | - | Height |
| `shadow` | `boolean` | `true` | Show drop shadow |
| `highlight` | `boolean` | `true` | Show highlight effect |
| `animation` | `AnimationType \| AnimationOptions` | - | Animation preset or config |
| `animateOnHover` | `boolean` | `false` | Trigger animation on hover |
| `offset` | `number` | `20` | Contour offset |
| `resolution` | `number` | `256` | Rasterization resolution |
| `simplify` | `number` | `2.0` | Polygon simplification |
| `className` | `string` | - | CSS class |
| `style` | `CSSProperties` | - | Inline styles |
| `onLoad` | `(result) => void` | - | Called when generation completes |
| `onError` | `(error) => void` | - | Called on error |
| `onClick` | `() => void` | - | Click handler |

### `<IconCraft>` (Legacy)

Original component for backwards compatibility.

```tsx
import { IconCraft } from 'gospelo-iconcraft-react';

<IconCraft
  svgContent="<svg>...</svg>"
  mode="wax"
  baseColor="#6366f1"
/>
```

## Shape Modes

| Mode | Description |
|------|-------------|
| `jelly` | Smooth, organic blob shape following icon contours |
| `droplet` | Perfect circle/sphere with glass-like highlights |
| `wax` | Irregular wax seal shape with pressed icon indent |

## Animations

### Built-in Animations (17 types)

```tsx
// Basic usage
<IconCraftShape svg={svg} animation="bounce" />

// With options
<IconCraftShape
  svg={svg}
  animation={{
    type: 'pulse',
    duration: 2,
    iterationCount: 'infinite',
  }}
/>

// Animate on hover
<IconCraftShape svg={svg} animation="jello" animateOnHover />
```

#### Available Animations

| Animation | Description |
|-----------|-------------|
| `none` | No animation |
| `shake` | Horizontal shake |
| `bounce` | Vertical bounce |
| `pulse` | Scale pulse |
| `swing` | Pendulum swing |
| `wobble` | Wobbly movement |
| `jello` | Jelly-like squish |
| `heartbeat` | Double pulse |
| `float` | Gentle floating |
| `spin` | 360° rotation |
| `rubberBand` | Rubber band stretch |
| `squish` | Squish deformation |
| `tada` | Attention-grabbing |
| `flip` | 3D flip |
| `drop` | Drop with bounce |
| `pop` | Pop-in effect |
| `wiggle` | Left-right wiggle |
| `breathe` | Breathing effect |

### Animation Options

```tsx
interface AnimationOptions {
  type: AnimationType;
  target?: 'shape' | 'icon' | 'both';  // What to animate
  duration?: number;                    // Seconds
  delay?: number;                       // Seconds
  iterationCount?: number | 'infinite';
  timingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  playState?: 'running' | 'paused';
}
```

### Custom Animations

```tsx
import { registerAnimation, IconCraftShape } from 'gospelo-iconcraft-react';

// Register custom animation
registerAnimation('myAnimation', {
  keyframes: `
    @keyframes iconcraft-myAnimation {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.5) rotate(10deg); }
    }
  `,
  defaults: {
    duration: 1,
    iterationCount: 'infinite',
  },
  transformOrigin: 'center',
});

// Use it
<IconCraftShape svg={svg} animation="myAnimation" />
```

## Hooks

### `useIconCraft`

Low-level hook for direct WASM access.

```tsx
import { useIconCraft } from 'gospelo-iconcraft-react';

function MyComponent() {
  const { result, isLoading, error, generate } = useIconCraft({
    svg: svgContent,
    mode: 'wax',
    shapeColor: '#6366f1',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div dangerouslySetInnerHTML={{ __html: result?.emboss_svg || '' }} />
  );
}
```

## Context (State Management)

For complex applications with multiple icons:

```tsx
import {
  IconCraftProvider,
  useIconCraftStore,
  IconCraftView,
} from 'gospelo-iconcraft-react';

function App() {
  return (
    <IconCraftProvider>
      <IconGallery />
    </IconCraftProvider>
  );
}

function IconGallery() {
  const { icons, createIcon } = useIconCraftStore();

  return (
    <div>
      {icons.map(icon => (
        <IconCraftView key={icon.id} instance={icon} />
      ))}
    </div>
  );
}
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  ShapeMode,
  IconStyle,
  AnimationType,
  AnimationOptions,
  IconCraftResult,
  IconCraftShapeProps,
} from 'gospelo-iconcraft-react';
```

## Browser Support

Requires WebAssembly support. Works in all modern browsers.

## Related

- [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm) - WASM core module

## License

MIT
