# gospelo-iconcraft-react

SVGからエンボススタイルの装飾的なアイコンシェイプを作成するReactコンポーネント。ハイライト、シャドウ、滑らかなアニメーションを備えた3D風のシェイプを提供します。

## インストール

```bash
npm install gospelo-iconcraft-react
```

## クイックスタート

### ファクトリパターン（推奨）

```tsx
import { IconCraftFactory, IconCraftView } from 'gospelo-iconcraft-react';

const factory = new IconCraftFactory({ mode: 'wax', shapeColor: '#6366f1' });
const icon = factory.create('<svg>...</svg>');

function App() {
  return <IconCraftView instance={icon} />;
}
```

### シンプルな使い方

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

### `<IconCraftView>`（推奨）

インスタンスベースのコンポーネント。回転ダイヤル、レティクル、アニメーションをサポート。`IconCraftFactory` / `IconCraftInstance` と組み合わせて使用します。

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

| Prop | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `instance` | `IconCraftInstance` | 必須 | ファクトリから生成したアイコンインスタンス |
| `animation` | `AnimationType \| AnimationOptions` | - | アニメーションプリセットまたは設定 |
| `animationTarget` | `'shape' \| 'icon' \| 'both'` | `'both'` | アニメーション対象 |
| `animateOnHover` | `boolean` | `false` | ホバー時にアニメーション |
| `showRotationDial` | `boolean` | `false` | 回転ダイヤルオーバーレイを表示 |
| `onRotationChange` | `(deg: number) => void` | - | 回転変更コールバック |
| `rotationSnap` | `number` | `5` | スナップ角度（度） |
| `dialPreset` | `DialPreset` | `dialPresetDotted` | ダイヤルの外観プリセット |
| `showReticle` | `boolean` | `false` | 中心レティクルを表示 |
| `reticlePreset` | `ReticlePreset` | - | レティクルの外観プリセット |
| `renderRing` | `(props: DialRingProps) => ReactNode` | - | カスタムリングレンダラー |
| `renderNotch` | `(props: DialNotchProps) => ReactNode` | - | カスタムノッチレンダラー |
| `renderLabel` | `(props: DialLabelProps) => ReactNode` | - | カスタムラベルレンダラー |
| `renderReticle` | `(props: ReticleProps) => ReactNode` | - | カスタムレティクルレンダラー |
| `zIndex` | `number` | - | レイヤリング用z-index |
| `className` | `string` | - | CSSクラス |
| `style` | `CSSProperties` | - | インラインスタイル |
| `onClick` | `() => void` | - | クリックハンドラ |

### ダイヤルプリセット

回転ダイヤルの外観用に10種類の組み込みプリセット：

```tsx
import { dialPresets, dialPresetDotted } from 'gospelo-iconcraft-react';

// 名前で使用
<IconCraftView instance={icon} showRotationDial dialPreset={dialPresets.dotted} />

// 利用可能なプリセット
// dialPresets.dotted   - ドット円リング（デフォルト）
// dialPresets.dashed   - 破線円リング
// dialPresets.solid    - 実線円リング
// dialPresets.ticks    - 目盛り付きリング
// dialPresets.double   - 二重円リング
// dialPresets.crosshair - クロスヘアスタイル
// dialPresets.minimal  - ミニマルスタイル
// dialPresets.needle   - ニードルインジケーター
// dialPresets.bar      - バーインジケーター
// dialPresets.arrow    - アローインジケーター
```

### レティクルプリセット

中心オーバーレイ用に3種類の組み込みプリセット：

```tsx
import { reticlePresets, reticlePresetCross } from 'gospelo-iconcraft-react';

<IconCraftView instance={icon} showReticle reticlePreset={reticlePresets.cross} />

// 利用可能なプリセット
// reticlePresets.cross    - クロスヘアレティクル
// reticlePresets.bullseye - ブルズアイターゲットレティクル
// reticlePresets.globe    - グローブ/球体レティクル
```

### CSS変数

ダイヤルとレティクルの色はCSS変数でカスタマイズ可能：

```css
:root {
  --iconcraft-dial-color: #0071e3; /* デフォルト */
}
```

### `<IconCraftShape>`

スタンドアロンコンポーネント（ファクトリ不要）。

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
| `mode` | `'sticker' \| 'jelly' \| 'bubble' \| 'wax'` | `'jelly'` | シェイプモード |
| `shapeColor` | `string` | `'#6366f1'` | シェイプのベースカラー（16進数） |
| `iconColor` | `string` | `'#1d1d1f'` | アイコンの色（stroke/fillスタイル用） |
| `iconStyle` | `'original' \| 'emboss' \| 'stroke' \| 'fill'` | `'emboss'` | アイコンのレンダリングスタイル |
| `size` | `number \| string` | - | 幅と高さ |
| `width` | `number \| string` | - | 幅 |
| `height` | `number \| string` | - | 高さ |
| `shadow` | `boolean` | `true` | ドロップシャドウを表示 |
| `highlight` | `boolean` | `true` | ハイライト効果を表示 |
| `rotation` | `number` | `0` | アイコンの回転角度（0-360度）。シェイプが回転後のアイコンに追従 |
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

## ファクトリパターン

`IconCraftFactory` は共有設定を持つ再利用可能な `IconCraftInstance` オブジェクトを生成します：

```tsx
import { IconCraftFactory } from 'gospelo-iconcraft-react';

const factory = new IconCraftFactory({
  mode: 'wax',
  shapeColor: '#6366f1',
  iconStyle: 'emboss',
  size: 100,
});

// 同じ設定で複数のアイコンを作成
const icon1 = factory.create('<svg>...</svg>');
const icon2 = factory.create('<svg>...</svg>');

// 作成後に設定を更新
icon1.config.update({ shapeColor: '#10b981', rotation: 45 });
```

## シェイプモード

| モード | 説明 |
|--------|------|
| `sticker` | Jellyベースのシェイプに紙のようなノイズテクスチャを適用、ハイライトなし |
| `jelly` | アイコンの輪郭に沿った滑らかで有機的なブロブ形状 |
| `bubble` | ガラスのようなハイライトを持つ完全な円/球体 |
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

### 高度なコンテキストフック

```tsx
import {
  useIconCraftSelection,
  useIconCraftCreate,
  useIconCraftEvent,
} from 'gospelo-iconcraft-react';

// 選択管理
function SelectionToolbar() {
  const { selected, count, hasSelection, selectAll, getSelectedInstances } =
    useIconCraftSelection();

  return <span>{count}件選択中</span>;
}

// オプション付きアイコン作成
function IconCreator() {
  const create = useIconCraftCreate({
    config: { mode: 'jelly', shapeColor: '#6366f1' },
    autoSelect: true,
  });

  const handleAdd = (svg: string) => {
    const id = create(svg);
  };
}

// イベント購読
function EventLogger() {
  useIconCraftEvent('*', 'update', (event) => {
    console.log('アイコン更新:', event);
  });
}
```

## バックアップ / リストア

アイコン設定をJSONとして保存・復元：

```tsx
import {
  createBackup,
  downloadBackup,
  loadBackupFromFile,
  validateBackup,
} from 'gospelo-iconcraft-react';

// アイコンデータからバックアップを作成
const backup = createBackup(icons, { license: 'MIT' });

// JSONファイルとしてダウンロード
downloadBackup(backup, 'my-icons.json');

// ファイル入力から読み込み
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const loaded = await loadBackupFromFile(file);
  if (loaded) {
    console.log('読み込んだアイコン:', loaded.icons);
  }
});

// バックアップデータを検証
const result = validateBackup(data);
if (!result.valid) {
  console.error('検証エラー:', result.errors);
}
```

## WasmManager

WASM初期化とキャッシュのシングルトンマネージャー：

```tsx
import { WasmManager } from 'gospelo-iconcraft-react';

// 手動初期化（通常は自動処理）
await WasmManager.init();

// 準備状態の確認
console.log(WasmManager.isReady);

// キャッシュ制御
WasmManager.setMaxCacheSize(200);
console.log('キャッシュ数:', WasmManager.cacheSize);
WasmManager.clearCache();
```

## レジストリ

グローバルなインスタンス追跡と検索：

```tsx
import { globalRegistry, generateIconId, getTimestampFromId } from 'gospelo-iconcraft-react';

// インスタンスの検索
const allIcons = globalRegistry.getAll();
const jellyIcons = globalRegistry.findByMode('jelly');
const blueIcons = globalRegistry.findByColor('#6366f1');

// 時間ベースのクエリ（ULIDベースID）
const recentIcons = globalRegistry.findByTimeRange(startDate, endDate);
const sorted = globalRegistry.getAllSorted('newest');

// 統計情報
const stats = globalRegistry.getStats();

// IDユーティリティ
const id = generateIconId(); // "ic_01HGW..."
const created = getTimestampFromId(id); // Date
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

## ブラウザサポート

WebAssemblyのサポートが必要です。すべてのモダンブラウザで動作します。

## 関連パッケージ

- [gospelo-iconcraft-wasm](https://www.npmjs.com/package/gospelo-iconcraft-wasm) - WASMコアモジュール

## ライセンス

MIT
