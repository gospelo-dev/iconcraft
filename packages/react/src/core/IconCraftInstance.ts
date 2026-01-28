import type { IconCraftResult } from '../types';
import { IconCraftConfig, type IconCraftConfigOptions } from './IconCraftConfig';
import { WasmManager } from './WasmManager';
import { generateIconId } from './IconCraftRegistry';

/**
 * SVG取得状態
 */
type SvgState =
  | { status: 'pending' }
  | { status: 'loading' }
  | { status: 'ready'; content: string }
  | { status: 'error'; error: string };

/**
 * 生成状態
 */
type GenerateState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; result: IconCraftResult }
  | { status: 'error'; error: string };

/**
 * IconCraft インスタンス
 *
 * Factoryから生成されるユニークなオブジェクト
 * 各インスタンスは独自のID、状態（SVG、生成結果）を持つ
 *
 * ID形式: ic_{ULID}
 * 例: ic_01HY7X3K8GQZN5RVXJ2TMCBDEF
 */
export class IconCraftInstance {
  private readonly _id: string;
  private readonly _svg: string;
  private readonly _config: IconCraftConfig;
  private _svgState: SvgState = { status: 'pending' };
  private _generateState: GenerateState = { status: 'idle' };
  private _generatePromise: Promise<IconCraftResult> | null = null;

  constructor(svg: string, config: IconCraftConfig, id?: string) {
    this._id = id ?? generateIconId();
    this._svg = svg;
    this._config = config;
  }

  // ============================================
  // Getters
  // ============================================

  get id(): string {
    return this._id;
  }

  get svg(): string {
    return this._svg;
  }

  get config(): IconCraftConfig {
    return this._config;
  }

  get isUrl(): boolean {
    return this._svg.startsWith('http://') ||
           this._svg.startsWith('https://') ||
           this._svg.startsWith('/');
  }

  get svgContent(): string | null {
    return this._svgState.status === 'ready' ? this._svgState.content : null;
  }

  get result(): IconCraftResult | null {
    return this._generateState.status === 'done' ? this._generateState.result : null;
  }

  get embossSvg(): string | null {
    return this.result?.emboss_svg ?? null;
  }

  get isLoading(): boolean {
    return this._svgState.status === 'loading' || this._generateState.status === 'generating';
  }

  get isReady(): boolean {
    return this._generateState.status === 'done';
  }

  get error(): string | null {
    if (this._svgState.status === 'error') return this._svgState.error;
    if (this._generateState.status === 'error') return this._generateState.error;
    return null;
  }

  // ============================================
  // Methods
  // ============================================

  /**
   * SVGコンテンツを取得
   */
  async fetchSvg(): Promise<string> {
    if (this._svgState.status === 'ready') {
      return this._svgState.content;
    }

    if (!this.isUrl) {
      this._svgState = { status: 'ready', content: this._svg };
      return this._svg;
    }

    this._svgState = { status: 'loading' };

    try {
      const response = await fetch(this._svg);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }
      const content = await response.text();
      this._svgState = { status: 'ready', content };
      return content;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      this._svgState = { status: 'error', error };
      throw err;
    }
  }

  /**
   * アイコンを生成
   */
  async generate(): Promise<IconCraftResult> {
    // 既に生成中なら同じPromiseを返す
    if (this._generatePromise) {
      return this._generatePromise;
    }

    // 既に生成済みなら結果を返す
    if (this._generateState.status === 'done') {
      return this._generateState.result;
    }

    this._generatePromise = this._doGenerate();
    return this._generatePromise;
  }

  private async _doGenerate(): Promise<IconCraftResult> {
    this._generateState = { status: 'generating' };

    try {
      // SVGを取得
      const svgContent = await this.fetchSvg();

      // WASMで生成
      const params = this._config.getWasmParams();
      console.log('[IconCraftInstance] Generating with params:', {
        id: this._id,
        mode: params.mode,
        shapeColor: params.shapeColor,
      });
      const result = await WasmManager.generate({
        svgContent,
        mode: params.mode,
        offset: params.offset,
        resolution: params.resolution,
        simplify: params.simplify,
        includeIcon: params.includeIcon,
        shapeColor: params.shapeColor,
      });

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('[IconCraftInstance] Generated result:', {
        id: this._id,
        success: result.success,
        embossSvgPreview: result.emboss_svg?.slice(0, 300),
      });
      this._generateState = { status: 'done', result };
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      this._generateState = { status: 'error', error };
      throw err;
    } finally {
      this._generatePromise = null;
    }
  }

  /**
   * 新しい設定でクローン
   */
  clone(overrides?: IconCraftConfigOptions): IconCraftInstance {
    const newConfig = overrides ? this._config.clone(overrides) : this._config;
    return new IconCraftInstance(this._svg, newConfig);
  }

  /**
   * 別のSVGで新しいインスタンスを作成
   */
  withSvg(svg: string): IconCraftInstance {
    return new IconCraftInstance(svg, this._config);
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this._svgState = { status: 'pending' };
    this._generateState = { status: 'idle' };
    this._generatePromise = null;
  }
}
