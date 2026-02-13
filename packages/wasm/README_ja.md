# gospelo-iconcraft-wasm

SVGアイコンからエンボススタイルの装飾的なシェイプを生成するWebAssemblyモジュール。ハイライトとシャドウを備えた、滑らかな3D風のclip-pathを作成します。

## インストール

```bash
npm install gospelo-iconcraft-wasm
```

## 使い方

```typescript
import init, { generate_clippath, generate_clippath_with_icon, ShapeMode } from 'gospelo-iconcraft-wasm';

// WASMモジュールを初期化
await init();

// 基本的な使い方 - clip-pathのみ生成
const result = generate_clippath(
  svgContent,        // SVG文字列
  ShapeMode.Jelly,   // シェイプモード: Sticker, Jelly, Bubble, Wax
  20,                // オフセット（アイコン周囲のパディング）
  256,               // 解像度
  1.0                // 簡略化イプシロン（ポリゴン簡略化）
);

// アイコン埋め込み付き - グラデーション付きの完全なエンボスSVGを生成
const resultWithIcon = generate_clippath_with_icon(
  svgContent,
  ShapeMode.Wax,
  20,
  256,
  1.0,
  true               // include_icon: emboss_svgを生成
);
```

## API

### シェイプモード

| モード | 説明 |
|--------|------|
| `ShapeMode.Sticker` | Jellyベースのシェイプに紙のようなノイズテクスチャを適用、ハイライトなし |
| `ShapeMode.Jelly` | アイコンの輪郭に沿った滑らかで有機的なブロブ形状 |
| `ShapeMode.Bubble` | ガラスのようなハイライトを持つ完全な円/球体 |
| `ShapeMode.Wax` | 押し込まれたアイコンの凹みを持つ不規則なワックスシール形状 |

### 関数

#### `generate_clippath(svg_content, mode, offset, resolution, simplify_epsilon)`

SVGコンテンツからclip-pathポリゴンを生成します。

**戻り値:**
```typescript
{
  success: boolean;
  clip_path: string;           // CSS polygon() 文字列
  inner_clip_path?: string;    // Waxモード用の内側シェイプ
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
    clip: string;              // SVGパスのd属性
    inner?: string;
    shadow?: string;
    highlight?: string;
  };
  rotation: number;            // 適用された回転角度（度）
}
```

#### `generate_clippath_with_icon(svg_content, mode, offset, resolution, simplify_epsilon, include_icon)`

上記と同じですが、`include_icon` が true の場合、以下も返します：
- `emboss_svg`: グラデーション、フィルター、アイコンパスを含む完全なSVG
- `icon_paths`: カスタムレンダリング用の解析済みアイコンパスデータ

#### `generate_clippath_with_color(svg_content, mode, offset, resolution, simplify_epsilon, include_icon, shape_color)`

`generate_clippath_with_icon` と同じですが、カスタムシェイプカラー（`"#6366f1"` のような16進数文字列）を使用してグラデーション用のカラーパレットを生成します。

#### `generate_clippath_with_rotation(svg_content, mode, offset, resolution, simplify_epsilon, include_icon, shape_color, rotation_degrees)`

`generate_clippath_with_color` と同じですが、アイコンの回転に対応しています。ラスタライズ前にアイコンを回転させるため、生成されるシェイプが回転後のアイコン輪郭に追従します。影の方向も一貫した光源を維持するよう調整されます。

- `rotation_degrees`: 回転角度（0-360度）

```typescript
const result = generate_clippath_with_rotation(
  svgContent,
  ShapeMode.Jelly,
  20, 256, 1.0,
  true,
  "#6366f1",
  45.0  // アイコンを45度回転
);

console.log(result.rotation); // 45
```

## 出力例

生成される `emboss_svg` には以下が含まれます：
- 3D深度効果のための多層グラデーション
- ハイライトとシャドウ
- ドロップシャドウフィルター
- エンボススタイリング付きの埋め込みアイコン

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- グラデーションとフィルター -->
  </defs>
  <!-- グラデーションレイヤー付きのメインシェイプ -->
  <!-- 内側の凹み（Waxモード） -->
  <!-- ハイライト（Jelly/Bubbleモード） -->
  <!-- 埋め込みアイコン -->
</svg>
```

## ブラウザサポート

WebAssemblyのサポートが必要です。すべてのモダンブラウザで動作します。

## 公開

リポジトリルートから：

```bash
make publish OTP=123456 BUMP=patch
```

## リポジトリ

- [GitHub](https://github.com/gospelo-dev/iconcraft/tree/main/packages/wasm) - パッケージ配布
- [Issues](https://github.com/gospelo-dev/iconcraft/issues) - バグ報告・機能要望

## 関連パッケージ

- [gospelo-iconcraft-react](https://www.npmjs.com/package/gospelo-iconcraft-react) - このWASMモジュールを使用するReactコンポーネント

## ライセンス

MIT
