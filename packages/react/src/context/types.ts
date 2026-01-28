import type { IconCraftInstance } from '../core/IconCraftInstance';
import type { IconCraftConfigOptions } from '../core/IconCraftConfig';
import type { IconCraftResult, AnimationType } from '../types';

// ============================================
// Metadata
// ============================================

/**
 * インスタンスのメタデータ（位置、サイズ、選択状態など）
 */
export interface IconCraftMetadata {
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  animation?: AnimationType;
  custom?: Record<string, unknown>;
}

export const DEFAULT_METADATA: IconCraftMetadata = {
  x: 0,
  y: 0,
  zIndex: 0,
};

// ============================================
// Events
// ============================================

/**
 * イベントタイプ
 */
export type IconCraftEventType =
  // ライフサイクル
  | 'created'
  | 'removed'
  | 'ready'
  | 'error'
  // 選択
  | 'select'
  | 'deselect'
  // トランスフォーム
  | 'move'
  | 'resize'
  | 'zIndex'
  | 'transform'
  // 設定変更
  | 'config'
  // メタデータ
  | 'metadata'
  // カスタム
  | 'custom';

/**
 * イベントペイロード
 */
export type IconCraftEvent =
  // ライフサイクル
  | { type: 'created'; id: string; instance: IconCraftInstance }
  | { type: 'removed'; id: string }
  | { type: 'ready'; id: string; result: IconCraftResult }
  | { type: 'error'; id: string; error: string }
  // 選択
  | { type: 'select'; id: string }
  | { type: 'deselect'; id: string }
  // トランスフォーム
  | { type: 'move'; id: string; x: number; y: number }
  | { type: 'resize'; id: string; width: number; height: number }
  | { type: 'zIndex'; id: string; zIndex: number }
  | { type: 'transform'; id: string; changes: Partial<IconCraftMetadata> }
  // 設定変更
  | { type: 'config'; id: string; changes: Partial<IconCraftConfigOptions> }
  // メタデータ
  | { type: 'metadata'; id: string; changes: Partial<IconCraftMetadata> }
  // カスタム
  | { type: 'custom'; id: string; name: string; payload: unknown };

/**
 * イベントハンドラー
 */
export type IconCraftEventHandler<T extends IconCraftEvent = IconCraftEvent> = (
  event: T
) => void;

/**
 * イベントフィルター（'*' で全イベント）
 */
export type IconCraftEventFilter = string | '*';

// ============================================
// Store State
// ============================================

/**
 * ストアの状態
 */
export interface IconCraftStoreState {
  instances: Map<string, IconCraftInstance>;
  metadata: Map<string, IconCraftMetadata>;
  selection: Set<string>;
}

// ============================================
// Store Actions
// ============================================

/**
 * ストアのアクション
 */
export interface IconCraftStoreActions {
  // CRUD
  create: (svg: string, config?: Partial<IconCraftConfigOptions>, metadata?: Partial<IconCraftMetadata>) => string;
  remove: (id: string) => boolean;
  getById: (id: string) => IconCraftInstance | undefined;
  getAll: () => IconCraftInstance[];

  // メタデータ
  getMetadata: (id: string) => IconCraftMetadata | undefined;
  updateMetadata: (id: string, changes: Partial<IconCraftMetadata>) => void;

  // 選択
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  getSelected: () => string[];
  isSelected: (id: string) => boolean;

  // バッチ操作
  clear: () => void;
}

// ============================================
// Dispatcher
// ============================================

/**
 * イベントディスパッチャー
 */
export interface IconCraftDispatcher {
  dispatch: (event: IconCraftEvent) => void;
  subscribe: (
    filter: IconCraftEventFilter,
    eventType: IconCraftEventType | IconCraftEventType[] | '*',
    handler: IconCraftEventHandler
  ) => () => void;
}

// ============================================
// Context Value
// ============================================

/**
 * Contextの値
 */
export interface IconCraftContextValue {
  state: IconCraftStoreState;
  actions: IconCraftStoreActions;
  dispatcher: IconCraftDispatcher;
  defaultConfig: Partial<IconCraftConfigOptions>;
}
