import { IconCraftConfig, type IconCraftConfigOptions } from './IconCraftConfig';
import { IconCraftInstance } from './IconCraftInstance';

/**
 * IconCraft Factory
 *
 * 設定をプロトタイプとして保持し、そこからインスタンスを生成する
 *
 * @example
 * ```ts
 * // Factoryを作成（共通設定）
 * const factory = new IconCraftFactory({
 *   mode: 'wax',
 *   color: '#6366f1',
 *   size: 64,
 * });
 *
 * // インスタンスを生成
 * const icon1 = factory.create('<svg>...</svg>');
 * const icon2 = factory.create('<svg>...</svg>', { color: '#ef4444' }); // 色だけ変更
 *
 * // 生成
 * const result = await icon1.generate();
 * console.log(result.emboss_svg);
 * ```
 */
export class IconCraftFactory {
  private readonly prototype: IconCraftConfig;

  constructor(options: IconCraftConfigOptions = {}) {
    this.prototype = new IconCraftConfig(options);
  }

  /**
   * 新しいインスタンスを生成
   *
   * @param svg - SVGコンテンツまたはURL
   * @param overrides - このインスタンス固有の設定（オプション）
   */
  create(svg: string, overrides?: IconCraftConfigOptions): IconCraftInstance {
    const config = overrides ? this.prototype.clone(overrides) : this.prototype;
    return new IconCraftInstance(svg, config);
  }

  /**
   * プロトタイプ設定を取得
   */
  getConfig(): IconCraftConfig {
    return this.prototype;
  }

  /**
   * 新しい設定でFactoryを複製
   */
  clone(overrides: IconCraftConfigOptions): IconCraftFactory {
    const newConfig = this.prototype.clone(overrides);
    return new IconCraftFactory({
      mode: newConfig.mode,
      shapeColor: newConfig.shapeColor,
      iconStyle: newConfig.iconStyle,
      shadow: newConfig.shadow,
      highlight: newConfig.highlight,
      offset: newConfig.offset,
      resolution: newConfig.resolution,
      simplify: newConfig.simplify,
      size: newConfig.size,
      width: newConfig.width,
      height: newConfig.height,
      animation: newConfig.animation,
      animateOnHover: newConfig.animateOnHover,
    });
  }

  /**
   * 複数のSVGから一括でインスタンスを生成
   */
  createMany(svgs: string[], overrides?: IconCraftConfigOptions): IconCraftInstance[] {
    return svgs.map((svg) => this.create(svg, overrides));
  }

  /**
   * 複数のSVGを一括生成
   */
  async generateMany(
    svgs: string[],
    overrides?: IconCraftConfigOptions
  ): Promise<IconCraftInstance[]> {
    const instances = this.createMany(svgs, overrides);
    await Promise.all(instances.map((inst) => inst.generate()));
    return instances;
  }
}

/**
 * デフォルトのFactory（グローバル設定）
 */
export const defaultFactory = new IconCraftFactory();
