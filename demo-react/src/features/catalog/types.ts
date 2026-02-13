/**
 * アイコンカタログJSON形式の型定義
 * カテゴリ別ファイル分割対応版
 */

/** カテゴリ情報（インデックスファイル用） */
export interface IconCatalogCategory {
  /** カテゴリ識別子 (例: "animals", "faces") */
  slug: string;
  /** カテゴリ表示名 (例: "動物", "顔・感情") */
  displayName: string;
  /** カテゴリ内のアイコン数 */
  count: number;
  /** カテゴリ別JSONファイル名 (例: "animals.json") */
  file: string;
}

/** アイコン情報 */
export interface IconCatalogIcon {
  /** アイコン識別子/英語名 (例: "1st place medal") */
  name: string;
  /** アイコン表示名 (例: "金メダル") */
  displayName: string;
  /** SVG URL */
  url: string;
  /** Unicodeコードポイント (例: "1f947") */
  codepoint?: string;
  /** ライセンス */
  license?: string;
}

/** インデックスファイル (icons.json) */
export interface IconCatalogIndex {
  /** プロバイダー名 */
  provider: string;
  /** 全アイコン数 */
  totalIcons: number;
  /** ライセンス情報 */
  license?: string;
  /** 帰属表示 */
  attribution?: string;
  /** リポジトリURL */
  repository?: string;
  /** カテゴリ一覧 */
  categories: IconCatalogCategory[];
}

/** カテゴリ別ファイル (animals.json等) */
export interface IconCatalogCategoryFile {
  /** カテゴリ表示名 */
  category: string;
  /** アイコン数 */
  count: number;
  /** ライセンス */
  license?: string;
  /** アイコン一覧 */
  icons: IconCatalogIcon[];
}

/** カタログソースの設定 */
export interface CatalogSource {
  /** ソース識別子 */
  id: string;
  /** ソース表示名 */
  name: string;
  /** インデックスファイル(icons.json)のURL */
  url: string;
}
