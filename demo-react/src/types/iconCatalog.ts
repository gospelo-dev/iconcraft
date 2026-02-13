/**
 * アイコンカタログJSON形式の型定義
 */

export interface IconCatalogCategory {
  slug: string;
  name: string;
  count: number;
}

export interface IconCatalogIcon {
  slug: string;
  displayName: string;
  url: string;
  codepoint?: string;
  license?: string;
  category: string;
  categoryName?: string;
}

export interface IconCatalog {
  provider: string;
  categories: IconCatalogCategory[];
  icons: IconCatalogIcon[];
}

export interface CatalogSource {
  id: string;
  name: string;
  url: string;
}
