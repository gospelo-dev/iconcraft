import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CatalogSource,
  IconCatalogCategory,
  IconCatalogCategoryFile,
  IconCatalogIcon,
  IconCatalogIndex,
} from "./types";

interface UseCatalogOptions {
  /** 初期カタログソース一覧 */
  initialSources?: CatalogSource[];
}

interface UseCatalogReturn {
  /** 登録されているカタログソース一覧 */
  sources: CatalogSource[];
  /** 現在選択中のソースID */
  selectedSourceId: string | null;
  /** 現在のカタログインデックス */
  catalogIndex: IconCatalogIndex | null;
  /** インデックス読み込み中 */
  loadingIndex: boolean;
  /** カテゴリアイコン読み込み中 */
  loadingIcons: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 選択中のカテゴリslug */
  selectedCategory: string | null;
  /** 現在のカテゴリのアイコン一覧 */
  icons: IconCatalogIcon[];
  /** フィルタリングされたアイコン一覧 */
  filteredIcons: IconCatalogIcon[];
  /** 検索クエリ */
  searchQuery: string;
  /** カタログソースを追加 */
  addSource: (source: CatalogSource) => void;
  /** カタログソースを削除 */
  removeSource: (id: string) => void;
  /** ソースを選択して読み込み */
  selectSource: (id: string) => void;
  /** カテゴリを選択 */
  selectCategory: (slug: string) => void;
  /** 検索クエリを設定 */
  setSearchQuery: (query: string) => void;
  /** URLから直接カタログを読み込み */
  loadFromUrl: (url: string) => Promise<void>;
}

/** インデックスファイルを取得 */
async function fetchIndex(url: string): Promise<IconCatalogIndex> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog index: ${response.statusText}`);
  }
  return response.json();
}

/** カテゴリ別ファイルを取得 */
async function fetchCategoryFile(url: string): Promise<IconCatalogCategoryFile> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.statusText}`);
  }
  return response.json();
}

/** URLのベースパスを取得 */
function getBaseUrl(url: string): string {
  return url.substring(0, url.lastIndexOf("/") + 1);
}

export function useCatalog(options: UseCatalogOptions = {}): UseCatalogReturn {
  const [sources, setSources] = useState<CatalogSource[]>(
    options.initialSources ?? []
  );
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [catalogIndex, setCatalogIndex] = useState<IconCatalogIndex | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [loadingIcons, setLoadingIcons] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconCatalogIcon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 現在のベースURLを保持
  const baseUrlRef = useRef<string>("");
  // カテゴリ別アイコンのキャッシュ
  const categoryCache = useRef<Map<string, IconCatalogIcon[]>>(new Map());

  // インデックスを読み込む
  const loadIndex = useCallback(async (url: string) => {
    setLoadingIndex(true);
    setError(null);
    setIcons([]);
    categoryCache.current.clear();

    try {
      const data = await fetchIndex(url);
      setCatalogIndex(data);
      baseUrlRef.current = getBaseUrl(url);

      // 最初のカテゴリを選択
      if (data.categories.length > 0) {
        setSelectedCategory(data.categories[0].slug);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCatalogIndex(null);
    } finally {
      setLoadingIndex(false);
    }
  }, []);

  // カテゴリのアイコンを読み込む
  const loadCategoryIcons = useCallback(
    async (category: IconCatalogCategory) => {
      // キャッシュがあればそれを使用
      const cached = categoryCache.current.get(category.slug);
      if (cached) {
        setIcons(cached);
        return;
      }

      setLoadingIcons(true);
      setError(null);

      try {
        const url = baseUrlRef.current + category.file;
        const data = await fetchCategoryFile(url);
        categoryCache.current.set(category.slug, data.icons);
        setIcons(data.icons);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setIcons([]);
      } finally {
        setLoadingIcons(false);
      }
    },
    []
  );

  // カテゴリ選択時にアイコンを読み込む
  useEffect(() => {
    if (!catalogIndex || !selectedCategory) return;

    const category = catalogIndex.categories.find(
      (c) => c.slug === selectedCategory
    );
    if (category) {
      loadCategoryIcons(category);
    }
  }, [catalogIndex, selectedCategory, loadCategoryIcons]);

  // ソースを選択
  const selectSource = useCallback(
    (id: string) => {
      const source = sources.find((s) => s.id === id);
      if (source) {
        setSelectedSourceId(id);
        loadIndex(source.url);
      }
    },
    [sources, loadIndex]
  );

  // ソースを追加
  const addSource = useCallback((source: CatalogSource) => {
    setSources((prev) => {
      if (prev.some((s) => s.id === source.id)) {
        return prev;
      }
      return [...prev, source];
    });
  }, []);

  // ソースを削除
  const removeSource = useCallback(
    (id: string) => {
      setSources((prev) => prev.filter((s) => s.id !== id));
      if (selectedSourceId === id) {
        setSelectedSourceId(null);
        setCatalogIndex(null);
        setIcons([]);
      }
    },
    [selectedSourceId]
  );

  // URLから直接読み込み
  const loadFromUrl = useCallback(
    async (url: string) => {
      setSelectedSourceId(null);
      await loadIndex(url);
    },
    [loadIndex]
  );

  // カテゴリを選択
  const selectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug);
  }, []);

  // フィルタリングされたアイコン
  const filteredIcons = icons.filter((icon) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      icon.displayName.toLowerCase().includes(query) ||
      icon.name.toLowerCase().includes(query)
    );
  });

  // 初期ソースがあれば最初のものを選択
  useEffect(() => {
    if (sources.length > 0 && !selectedSourceId && !catalogIndex) {
      selectSource(sources[0].id);
    }
  }, [sources, selectedSourceId, catalogIndex, selectSource]);

  return {
    sources,
    selectedSourceId,
    catalogIndex,
    loadingIndex,
    loadingIcons,
    error,
    selectedCategory,
    icons,
    filteredIcons,
    searchQuery,
    addSource,
    removeSource,
    selectSource,
    selectCategory,
    setSearchQuery,
    loadFromUrl,
  };
}
