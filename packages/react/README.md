# gospelo-iconcraft-react

React components for creating emboss-style decorative icon shapes from SVG. Features 3D-looking shapes with highlights, shadows, and smooth animations.

## Installation

```bash
npm install gospelo-iconcraft-react
```

## Quick Start

### Factory Pattern (Recommended)

```tsx
import { IconCraftFactory, IconCraftView } from 'gospelo-iconcraft-react';

const factory = new IconCraftFactory({ mode: 'wax', shapeColor: '#6366f1' });
const icon = factory.create('<svg>...</svg>');

function App() {
  return <IconCraftView instance={icon} />;
}
```

### Simple Usage

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

### `<IconCraftView>` (Recommended)

Instance-based component with rotation dial, reticle, and animation support. Works with `IconCraftFactory` / `IconCraftInstance`.

```tsx
import { IconCraftFactory, IconCraftView } from 'gospelo-iconcraft-react';

const factory = new IconCraftFactory({
  mode: 'jelly',
  shapeColor: '#10b981',
  size: 120,
});

const icon = factory.create('<svg>...</svg>');

<IconCraftView
  instance={icon}
  animation="bounce"
  showRotationDial
  onRotationChange={(deg) => console.log(deg)}
  dialPreset={dialPresetDotted}
  showReticle
  reticlePreset={reticlePresetCross}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instance` | `IconCraftInstance` | required | Icon instance from factory |
| `animation` | `AnimationType \| AnimationOptions` | - | Animation preset or config |
| `animationTarget` | `'shape' \| 'icon' \| 'both'` | `'both'` | Animation target |
| `animateOnHover` | `boolean` | `false` | Trigger animation on hover |
| `showRotationDial` | `boolean` | `false` | Show rotation dial overlay |
| `onRotationChange` | `(deg: number) => void` | - | Rotation change callback |
| `rotationSnap` | `number` | `5` | Snap angle in degrees |
| `dialPreset` | `DialPreset` | `dialPresetDotted` | Dial visual preset |
| `showReticle` | `boolean` | `false` | Show center reticle |
| `reticlePreset` | `ReticlePreset` | - | Reticle visual preset |
| `renderRing` | `(props: DialRingProps) => ReactNode` | - | Custom ring renderer |
| `renderNotch` | `(props: DialNotchProps) => ReactNode` | - | Custom notch renderer |
| `renderLabel` | `(props: DialLabelProps) => ReactNode` | - | Custom label renderer |
| `renderReticle` | `(props: ReticleProps) => ReactNode` | - | Custom reticle renderer |
| `zIndex` | `number` | - | Z-index for layering |
| `className` | `string` | - | CSS class |
| `style` | `CSSProperties` | - | Inline styles |
| `onClick` | `() => void` | - | Click handler |

### Dial Presets

10 built-in dial presets for the rotation dial appearance:

```tsx
import { dialPresets, dialPresetDotted } from 'gospelo-iconcraft-react';

// Use by name
<IconCraftView instance={icon} showRotationDial dialPreset={dialPresets.dotted} />

// Available presets
// dialPresets.dotted   - Dotted circle ring (default)
// dialPresets.dashed   - Dashed circle ring
// dialPresets.solid    - Solid circle ring
// dialPresets.ticks    - Tick marks around the ring
// dialPresets.double   - Double circle ring
// dialPresets.crosshair - Crosshair style
// dialPresets.minimal  - Minimal style
// dialPresets.needle   - Needle indicator
// dialPresets.bar      - Bar indicator
// dialPresets.arrow    - Arrow indicator
```

### Reticle Presets

3 built-in reticle presets for center overlay:

```tsx
import { reticlePresets, reticlePresetCross } from 'gospelo-iconcraft-react';

<IconCraftView instance={icon} showReticle reticlePreset={reticlePresets.cross} />

// Available presets
// reticlePresets.cross    - Crosshair reticle
// reticlePresets.bullseye - Bullseye target reticle
// reticlePresets.globe    - Globe/sphere reticle
```

### CSS Variables

The dial and reticle color can be customized via CSS variable:

```css
:root {
  --iconcraft-dial-color: #0071e3; /* default */
}
```

### `<IconCraftShape>`

Standalone component with full feature support (no factory needed).

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
| `mode` | `'sticker' \| 'jelly' \| 'bubble' \| 'wax'` | `'jelly'` | Shape mode |
| `shapeColor` | `string` | `'#6366f1'` | Shape base color (hex) |
| `iconColor` | `string` | `'#1d1d1f'` | Icon color (for stroke/fill styles) |
| `iconStyle` | `'original' \| 'emboss' \| 'stroke' \| 'fill'` | `'emboss'` | Icon rendering style |
| `size` | `number \| string` | - | Width and height |
| `width` | `number \| string` | - | Width |
| `height` | `number \| string` | - | Height |
| `shadow` | `boolean` | `true` | Show drop shadow |
| `highlight` | `boolean` | `true` | Show highlight effect |
| `rotation` | `number` | `0` | Icon rotation in degrees (0-360). Shape follows rotated icon. |
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

## Factory Pattern

`IconCraftFactory` creates reusable `IconCraftInstance` objects with shared configuration:

```tsx
import { IconCraftFactory } from 'gospelo-iconcraft-react';

const factory = new IconCraftFactory({
  mode: 'wax',
  shapeColor: '#6366f1',
  iconStyle: 'emboss',
  size: 100,
});

// Create multiple icons with same config
const icon1 = factory.create('<svg>...</svg>');
const icon2 = factory.create('<svg>...</svg>');

// Update config after creation
icon1.config.update({ shapeColor: '#10b981', rotation: 45 });
```

## Shape Modes

| Mode | Description |
|------|-------------|
| `sticker` | Jelly-based shape with paper-like noise texture, no highlights |
| `jelly` | Smooth, organic blob shape following icon contours |
| `bubble` | Perfect circle/sphere with glass-like highlights |
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

### Advanced Context Hooks

```tsx
import {
  useIconCraftSelection,
  useIconCraftCreate,
  useIconCraftEvent,
} from 'gospelo-iconcraft-react';

// Selection management
function SelectionToolbar() {
  const { selected, count, hasSelection, selectAll, getSelectedInstances } =
    useIconCraftSelection();

  return <span>{count} selected</span>;
}

// Create icons with options
function IconCreator() {
  const create = useIconCraftCreate({
    config: { mode: 'jelly', shapeColor: '#6366f1' },
    autoSelect: true,
  });

  const handleAdd = (svg: string) => {
    const id = create(svg);
  };
}

// Event subscription
function EventLogger() {
  useIconCraftEvent('*', 'update', (event) => {
    console.log('Icon updated:', event);
  });
}
```

## Backup / Restore

Save and restore icon configurations as JSON:

```tsx
import {
  createBackup,
  downloadBackup,
  loadBackupFromFile,
  validateBackup,
} from 'gospelo-iconcraft-react';

// Create backup from icon data
const backup = createBackup(icons, { license: 'MIT' });

// Download as JSON file
downloadBackup(backup, 'my-icons.json');

// Load from file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const loaded = await loadBackupFromFile(file);
  if (loaded) {
    console.log('Loaded icons:', loaded.icons);
  }
});

// Validate backup data
const result = validateBackup(data);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## WasmManager

Singleton manager for WASM initialization and caching:

```tsx
import { WasmManager } from 'gospelo-iconcraft-react';

// Manually initialize (usually handled automatically)
await WasmManager.init();

// Check readiness
console.log(WasmManager.isReady);

// Cache control
WasmManager.setMaxCacheSize(200);
console.log('Cached:', WasmManager.cacheSize);
WasmManager.clearCache();
```

## Registry

Global instance tracking and search:

```tsx
import { globalRegistry, generateIconId, getTimestampFromId } from 'gospelo-iconcraft-react';

// Query instances
const allIcons = globalRegistry.getAll();
const jellyIcons = globalRegistry.findByMode('jelly');
const blueIcons = globalRegistry.findByColor('#6366f1');

// Time-based queries (ULID-based IDs)
const recentIcons = globalRegistry.findByTimeRange(startDate, endDate);
const sorted = globalRegistry.getAllSorted('newest');

// Stats
const stats = globalRegistry.getStats();

// ID utilities
const id = generateIconId(); // "ic_01HGW..."
const created = getTimestampFromId(id); // Date
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
  IconCraftViewProps,
  IconCraftConfigOptions,
  DialPreset,
  DialPresetName,
  ReticlePreset,
  ReticlePresetName,
  DialRingProps,
  DialNotchProps,
  DialLabelProps,
  ReticleProps,
  IconBackupData,
  IconCraftBackup,
  BackupValidationResult,
  CustomAnimationDefinition,
  TransformOriginValue,
  IconCraftMetadata,
  IconCraftEvent,
  IconCraftEventType,
} from 'gospelo-iconcraft-react';
```

## Browser Support

Requires WebAssembly support. Works in all modern browsers.

## Related

- [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm) - WASM core module

## License

MIT
