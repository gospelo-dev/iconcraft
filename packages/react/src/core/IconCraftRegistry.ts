import { ulid, decodeTime } from 'ulid';
import type { ShapeMode } from '../types';
import type { IconCraftInstance } from './IconCraftInstance';

/**
 * ID生成ユーティリティ
 */
export function generateIconId(): string {
  return `ic_${ulid()}`;
}

/**
 * IDからタイムスタンプを抽出
 */
export function getTimestampFromId(id: string): Date | null {
  const ulidPart = id.replace(/^ic_/, '');
  try {
    return new Date(decodeTime(ulidPart));
  } catch {
    return null;
  }
}

/**
 * IconCraft レジストリ
 *
 * インスタンスの管理とプロパティ別検索を提供
 */
export class IconCraftRegistry {
  private byId = new Map<string, IconCraftInstance>();
  private byMode = new Map<ShapeMode, Set<string>>();
  private byColor = new Map<string, Set<string>>();

  /**
   * インスタンスを登録
   */
  register(instance: IconCraftInstance): void {
    const id = instance.id;
    const mode = instance.config.mode;
    const color = instance.config.shapeColor;

    // メインマップに登録
    this.byId.set(id, instance);

    // モード別インデックス
    if (!this.byMode.has(mode)) {
      this.byMode.set(mode, new Set());
    }
    this.byMode.get(mode)!.add(id);

    // 色別インデックス
    if (!this.byColor.has(color)) {
      this.byColor.set(color, new Set());
    }
    this.byColor.get(color)!.add(id);
  }

  /**
   * インスタンスを削除
   */
  unregister(id: string): boolean {
    const instance = this.byId.get(id);
    if (!instance) return false;

    const mode = instance.config.mode;
    const color = instance.config.shapeColor;

    // メインマップから削除
    this.byId.delete(id);

    // モード別インデックスから削除
    this.byMode.get(mode)?.delete(id);
    if (this.byMode.get(mode)?.size === 0) {
      this.byMode.delete(mode);
    }

    // 色別インデックスから削除
    this.byColor.get(color)?.delete(id);
    if (this.byColor.get(color)?.size === 0) {
      this.byColor.delete(color);
    }

    return true;
  }

  /**
   * IDで取得
   */
  get(id: string): IconCraftInstance | undefined {
    return this.byId.get(id);
  }

  /**
   * 全インスタンスを取得
   */
  getAll(): IconCraftInstance[] {
    return Array.from(this.byId.values());
  }

  /**
   * モードで検索
   */
  findByMode(mode: ShapeMode): IconCraftInstance[] {
    const ids = this.byMode.get(mode);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.byId.get(id))
      .filter((inst): inst is IconCraftInstance => inst !== undefined);
  }

  /**
   * 色で検索
   */
  findByColor(color: string): IconCraftInstance[] {
    const ids = this.byColor.get(color);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.byId.get(id))
      .filter((inst): inst is IconCraftInstance => inst !== undefined);
  }

  /**
   * 時間範囲で検索（ULIDのタイムスタンプを利用）
   */
  findByTimeRange(start: Date, end: Date): IconCraftInstance[] {
    const startTime = start.getTime();
    const endTime = end.getTime();

    return Array.from(this.byId.entries())
      .filter(([id]) => {
        const timestamp = getTimestampFromId(id);
        if (!timestamp) return false;
        const time = timestamp.getTime();
        return time >= startTime && time <= endTime;
      })
      .map(([, instance]) => instance);
  }

  /**
   * 作成順でソート（ULIDは辞書順でソート可能）
   */
  getAllSorted(order: 'asc' | 'desc' = 'asc'): IconCraftInstance[] {
    const entries = Array.from(this.byId.entries());
    entries.sort((a, b) => {
      const cmp = a[0].localeCompare(b[0]);
      return order === 'asc' ? cmp : -cmp;
    });
    return entries.map(([, instance]) => instance);
  }

  /**
   * 登録数
   */
  get size(): number {
    return this.byId.size;
  }

  /**
   * すべてクリア
   */
  clear(): void {
    this.byId.clear();
    this.byMode.clear();
    this.byColor.clear();
  }

  /**
   * インデックスの統計情報
   */
  getStats(): {
    total: number;
    byMode: Record<string, number>;
    byColor: Record<string, number>;
  } {
    const byModeStats: Record<string, number> = {};
    for (const [mode, ids] of this.byMode) {
      byModeStats[mode] = ids.size;
    }

    const byColorStats: Record<string, number> = {};
    for (const [color, ids] of this.byColor) {
      byColorStats[color] = ids.size;
    }

    return {
      total: this.byId.size,
      byMode: byModeStats,
      byColor: byColorStats,
    };
  }
}

/**
 * グローバルレジストリ（シングルトン）
 */
export const globalRegistry = new IconCraftRegistry();
