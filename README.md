# IconCraft

Generate beautiful emboss-style decorative shapes from SVG icons.

## Packages

| Package                                     | Description      | npm                             |
| ------------------------------------------- | ---------------- | ------------------------------- |
| [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm)   | WASM core module | `npm i gospelo-iconcraft-wasm`  |
| [gospelo-iconcraft-react](https://www.npmjs.com/package/gospelo-iconcraft-react) | React components | `npm i gospelo-iconcraft-react` |

## Shape Modes

| Mode    | Description                          |
| ------- | ------------------------------------ |
| Jelly   | Organic shape following icon contour |
| Droplet | Fixed spherical (circular) shape     |
| Wax     | Wavy circle with icon-shaped recess  |

## Demo

```bash
pnpm install
pnpm demo
# Open http://localhost:3000/demo/
```

## Usage

### React

```tsx
import { IconCraftShape } from "gospelo-iconcraft-react";

function App() {
  return (
    <IconCraftShape svg="<svg>...</svg>" mode="wax" shapeColor="#6366f1" />
  );
}
```

### WASM (Direct)

```javascript
import init, {
  generate_clippath_with_color,
  ShapeMode,
} from "gospelo-iconcraft-wasm";

await init();

const result = generate_clippath_with_color(
  svgContent,
  ShapeMode.Wax, // 0=Jelly, 1=Droplet, 2=Wax
  5.0, // offset
  256, // resolution
  0.5, // simplify_epsilon
  true, // include_icon
  "#6366f1", // shape_color
);

console.log(result.emboss_svg);
```

## License

MIT
