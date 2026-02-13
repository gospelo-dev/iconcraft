# アイコンカタログ機能 仕様書

## 概要

demo-reactにおいて、外部JSONファイルからアイコンカタログを読み込み、複数のカタログソースを切り替えて使用できる機能を実装した。

---

## カタログJSON形式

### ファイル構造

```json
{
  "provider": "twemoji",
  "categories": [...],
  "icons": [...]
}
```

### categories（カテゴリ一覧）

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `name` | string | ✓ | カテゴリ識別子（例: `"animals"`, `"faces"`） |
| `displayName` | string | ✓ | カテゴリ表示名（例: `"動物"`, `"顔・感情"`） |
| `count` | number | ✓ | カテゴリ内のアイコン数 |

```json
{
  "name": "animals",
  "displayName": "動物",
  "count": 115
}
```

### icons（アイコン一覧）

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `name` | string | ✓ | アイコン識別子/英語名（例: `"1st place medal"`） |
| `displayName` | string | ✓ | アイコン表示名（例: `"金メダル"`） |
| `url` | string | ✓ | SVGファイルのURL |
| `codepoint` | string | | Unicodeコードポイント（例: `"1f947"`） |
| `license` | string | | ライセンス情報（例: `"CC-BY 4.0"`） |
| `category` | string | ✓ | 所属カテゴリ識別子（`categories[].name`と一致） |
| `categoryName` | string | | 所属カテゴリ表示名 |

```json
{
  "name": "1st place medal",
  "displayName": "金メダル",
  "url": "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f947.svg",
  "codepoint": "1f947",
  "license": "CC-BY 4.0",
  "category": "other",
  "categoryName": "その他"
}
```

---

## ディレクトリ構成

```
demo-react/
├── public/
│   └── api/icons/v1/twemoji/
│       └── icons.json          # デフォルトカタログ
└── src/
    └── features/
        └── catalog/
            ├── index.ts        # エクスポート
            ├── types.ts        # 型定義
            ├── useCatalog.ts   # カタログ管理hook
            ├── CatalogPanel.tsx # UIコンポーネント
            └── SPEC.md         # 本仕様書
```

---

## API

### useCatalog hook

カタログの読み込み・管理を行うReact hook。

#### オプション

```typescript
interface UseCatalogOptions {
  initialSources?: CatalogSource[];  // 初期カタログソース一覧
}
```

#### 戻り値

```typescript
interface UseCatalogReturn {
  // 状態
  sources: CatalogSource[];           // 登録されているカタログソース一覧
  selectedSourceId: string | null;    // 現在選択中のソースID
  catalog: IconCatalog | null;        // 現在のカタログデータ
  loading: boolean;                   // 読み込み中フラグ
  error: string | null;               // エラーメッセージ
  selectedCategory: string | null;    // 選択中のカテゴリ名
  filteredIcons: IconCatalogIcon[];   // フィルタリングされたアイコン一覧
  searchQuery: string;                // 検索クエリ

  // アクション
  addSource: (source: CatalogSource) => void;       // ソース追加
  removeSource: (id: string) => void;               // ソース削除
  selectSource: (id: string) => void;               // ソース選択
  selectCategory: (categoryName: string | null) => void;  // カテゴリ選択
  setSearchQuery: (query: string) => void;          // 検索クエリ設定
  loadFromUrl: (url: string) => Promise<void>;      // URLから直接読み込み
}
```

#### 使用例

```typescript
import { useCatalog, CatalogPanel } from "./features/catalog";

const catalogState = useCatalog({
  initialSources: [
    { id: "twemoji", name: "Twemoji", url: "/api/icons/v1/twemoji/icons.json" },
    { id: "custom", name: "Custom", url: "https://example.com/icons.json" },
  ],
});

// アイコン選択時の処理
const handleSelectIcon = (icon: IconCatalogIcon) => {
  console.log("Selected:", icon.name, icon.url);
};

// JSX
<CatalogPanel
  catalogState={catalogState}
  onSelectIcon={handleSelectIcon}
/>
```

### CatalogPanel コンポーネント

カタログUIを表示するReactコンポーネント。

#### Props

```typescript
interface CatalogPanelProps {
  catalogState: ReturnType<typeof useCatalog>;  // useCatalogの戻り値
  onSelectIcon: (icon: IconCatalogIcon) => void;  // アイコン選択時コールバック
}
```

#### 機能

- 複数カタログソースの切り替え（2つ以上ある場合のみ表示）
- カテゴリフィルター
- アイコン名検索（name, displayName両方で検索）
- アイコングリッド表示
- ローディング・エラー状態の表示

---

## 型定義

```typescript
// カテゴリ
interface IconCatalogCategory {
  name: string;        // カテゴリ識別子
  displayName: string; // カテゴリ表示名
  count: number;       // アイコン数
}

// アイコン
interface IconCatalogIcon {
  name: string;         // アイコン識別子/英語名
  displayName: string;  // アイコン表示名
  url: string;          // SVG URL
  codepoint?: string;   // Unicodeコードポイント
  license?: string;     // ライセンス
  category: string;     // 所属カテゴリ識別子
  categoryName?: string; // 所属カテゴリ表示名
}

// カタログ全体
interface IconCatalog {
  provider: string;                  // プロバイダー名
  categories: IconCatalogCategory[]; // カテゴリ一覧
  icons: IconCatalogIcon[];          // アイコン一覧
}

// カタログソース設定
interface CatalogSource {
  id: string;   // ソース識別子
  name: string; // ソース表示名
  url: string;  // カタログJSONのURL
}
```

---

## 変更履歴

### v1.0.0 (2024-XX-XX)

- 初期実装
- JSONカタログ形式の定義
- useCatalog hook実装
- CatalogPanel コンポーネント実装
- 旧ハードコードカタログ（TWEMOJI_CATEGORIES）を削除
