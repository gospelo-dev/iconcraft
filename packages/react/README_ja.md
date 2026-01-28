# gospelo-iconcraft-react

SVGからエンボススタイルの装飾的なアイコンシェイプを作成するReactコンポーネント。ハイライト、シャドウ、滑らかなアニメーションを備えた3D風のシェイプを提供します。

## インストール

```bash
npm install gospelo-iconcraft-react
```

## クイックスタート

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

## コンポーネント

### `<IconCraftShape>`（推奨）

全機能をサポートするモダンなコンポーネント。

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

| Prop | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `svg` | `string` | 必須 | SVGコンテンツ文字列 |
| `mode` | `'jelly' \| 'droplet' \| 'wax'` | `'jelly'` | シェイプモード |
| `shapeColor` | `string` | `'#6366f1'` | シェイプのベースカラー（16進数） |
| `iconColor` | `string` | `'#1d1d1f'` | アイコンの色（stroke/fillスタイル用） |
| `iconStyle` | `'original' \| 'emboss' \| 'stroke' \| 'fill'` | `'emboss'` | アイコンのレンダリングスタイル |
| `size` | `number \| string` | - | 幅と高さ |
| `width` | `number \| string` | - | 幅 |
| `height` | `number \| string` | - | 高さ |
| `shadow` | `boolean` | `true` | ドロップシャドウを表示 |
| `highlight` | `boolean` | `true` | ハイライト効果を表示 |
| `animation` | `AnimationType \| AnimationOptions` | - | アニメーションプリセットまたは設定 |
| `animateOnHover` | `boolean` | `false` | ホバー時にアニメーション |
| `offset` | `number` | `20` | 輪郭オフセット |
| `resolution` | `number` | `256` | ラスタライズ解像度 |
| `simplify` | `number` | `2.0` | ポリゴン簡略化 |
| `className` | `string` | - | CSSクラス |
| `style` | `CSSProperties` | - | インラインスタイル |
| `onLoad` | `(result) => void` | - | 生成完了時に呼び出される |
| `onError` | `(error) => void` | - | エラー時に呼び出される |
| `onClick` | `() => void` | - | クリックハンドラ |

### `<IconCraft>`（レガシー）

後方互換性のための旧コンポーネント。

```tsx
import { IconCraft } from 'gospelo-iconcraft-react';

<IconCraft
  svgContent="<svg>...</svg>"
  mode="wax"
  baseColor="#6366f1"
/>
```

## シェイプモード

| モード | 説明 |
|--------|------|
| `jelly` | アイコンの輪郭に沿った滑らかで有機的なブロブ形状 |
| `droplet` | ガラスのようなハイライトを持つ完全な円/球体 |
| `wax` | 押し込まれたアイコンの凹みを持つ不規則なワックスシール形状 |

## アニメーション

### 組み込みアニメーション（17種類）

```tsx
// 基本的な使い方
<IconCraftShape svg={svg} animation="bounce" />

// オプション付き
<IconCraftShape
  svg={svg}
  animation={{
    type: 'pulse',
    duration: 2,
    iterationCount: 'infinite',
  }}
/>

// ホバー時にアニメーション
<IconCraftShape svg={svg} animation="jello" animateOnHover />
```

#### 利用可能なアニメーション

| アニメーション | 説明 |
|---------------|------|
| `none` | アニメーションなし |
| `shake` | 横揺れ |
| `bounce` | バウンド |
| `pulse` | 拡大縮小パルス |
| `swing` | 振り子スイング |
| `wobble` | ふらふら動き |
| `jello` | ゼリーのような揺れ |
| `heartbeat` | ダブルパルス |
| `float` | 穏やかな浮遊 |
| `spin` | 360°回転 |
| `rubberBand` | ゴムバンド伸縮 |
| `squish` | ぷにょんと潰れる |
| `tada` | 注目を引く |
| `flip` | 3D反転 |
| `drop` | 落下してバウンド |
| `pop` | ポップイン |
| `wiggle` | 左右に揺れる |
| `breathe` | 呼吸するような |

### アニメーションオプション

```tsx
interface AnimationOptions {
  type: AnimationType;
  target?: 'shape' | 'icon' | 'both';  // アニメーション対象
  duration?: number;                    // 秒
  delay?: number;                       // 秒
  iterationCount?: number | 'infinite';
  timingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  playState?: 'running' | 'paused';
}
```

### カスタムアニメーション

```tsx
import { registerAnimation, IconCraftShape } from 'gospelo-iconcraft-react';

// カスタムアニメーションを登録
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

// 使用する
<IconCraftShape svg={svg} animation="myAnimation" />
```

## フック

### `useIconCraft`

WASMに直接アクセスするための低レベルフック。

```tsx
import { useIconCraft } from 'gospelo-iconcraft-react';

function MyComponent() {
  const { result, isLoading, error, generate } = useIconCraft({
    svg: svgContent,
    mode: 'wax',
    shapeColor: '#6366f1',
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div dangerouslySetInnerHTML={{ __html: result?.emboss_svg || '' }} />
  );
}
```

## コンテキスト（状態管理）

複数のアイコンを扱う複雑なアプリケーション向け：

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

完全なTypeScriptサポートと型のエクスポート：

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

## ブラウザサポート

WebAssemblyのサポートが必要です。すべてのモダンブラウザで動作します。

## 関連パッケージ

- [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm) - WASMコアモジュール

## ライセンス

MIT
