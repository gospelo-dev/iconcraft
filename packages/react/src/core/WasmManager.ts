import type { IconCraftResult, ShapeMode } from '../types';

/**
 * WASM生成パラメータ
 */
export interface WasmGenerateParams {
  svgContent: string;
  mode: ShapeMode;
  offset: number;
  resolution: number;
  simplify: number;
  includeIcon: boolean;
  shapeColor: string;
  rotation?: number;
  iconColor?: string;
}

/**
 * キャッシュキー生成
 */
function createCacheKey(params: WasmGenerateParams): string {
  return JSON.stringify({
    svg: params.svgContent.slice(0, 100), // SVGの先頭100文字でハッシュ
    svgLen: params.svgContent.length,
    mode: params.mode,
    offset: params.offset,
    resolution: params.resolution,
    simplify: params.simplify,
    includeIcon: params.includeIcon,
    shapeColor: params.shapeColor,
    rotation: params.rotation ?? 0,
    iconColor: params.iconColor ?? '',
  });
}

const shapeModeMap: Record<ShapeMode, number> = {
  jelly: 0,
  bubble: 1,
  wax: 2,
  sticker: 3,
};

/**
 * WASMマネージャー（Singleton）
 *
 * - WASMモジュールの初期化を一元管理
 * - 生成結果のキャッシュ
 * - 並列呼び出しのキュー管理
 */
class WasmManagerClass {
  private module: typeof import('gospelo-iconcraft-wasm') | null = null;
  private initPromise: Promise<typeof import('gospelo-iconcraft-wasm')> | null = null;
  private cache = new Map<string, IconCraftResult>();
  private maxCacheSize = 100;

  /**
   * WASMモジュールを初期化
   */
  async init(): Promise<typeof import('gospelo-iconcraft-wasm')> {
    if (this.module) return this.module;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const wasm = await import('gospelo-iconcraft-wasm');
      await wasm.default();
      this.module = wasm;
      return wasm;
    })();

    return this.initPromise;
  }

  /**
   * 初期化済みかどうか
   */
  get isReady(): boolean {
    return this.module !== null;
  }

  /**
   * アイコンを生成（キャッシュ付き）
   */
  async generate(params: WasmGenerateParams): Promise<IconCraftResult> {
    // キャッシュチェック
    const cacheKey = createCacheKey(params);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // WASMを初期化
    const wasm = await this.init();

    // 生成実行
    const rotation = params.rotation ?? 0;
    const iconColor = params.iconColor ?? null;
    const result = (typeof wasm.generate_clippath_with_rotation === 'function'
      ? wasm.generate_clippath_with_rotation(
          params.svgContent,
          shapeModeMap[params.mode],
          params.offset,
          params.resolution,
          params.simplify,
          params.includeIcon,
          params.shapeColor,
          rotation,
          iconColor
        )
      : wasm.generate_clippath_with_color(
          params.svgContent,
          shapeModeMap[params.mode],
          params.offset,
          params.resolution,
          params.simplify,
          params.includeIcon,
          params.shapeColor
        )
    ) as IconCraftResult;

    // キャッシュに保存
    if (result.success) {
      this.addToCache(cacheKey, result);
    }

    return result;
  }

  /**
   * キャッシュに追加（LRU）
   */
  private addToCache(key: string, result: IconCraftResult): void {
    // 最大サイズを超えたら古いものを削除
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, result);
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * キャッシュサイズを設定
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
  }

  /**
   * 現在のキャッシュ数
   */
  get cacheSize(): number {
    return this.cache.size;
  }
}

/**
 * WASMマネージャーのシングルトンインスタンス
 */
export const WasmManager = new WasmManagerClass();
