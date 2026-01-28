import { useCallback, useEffect, useMemo } from 'react';
import { useIconCraftContext } from './IconCraftProvider';
import type { IconCraftInstance } from '../core/IconCraftInstance';
import type { IconCraftConfigOptions } from '../core/IconCraftConfig';
import type {
  IconCraftMetadata,
  IconCraftEventType,
  IconCraftEventHandler,
  IconCraftEventFilter,
} from './types';

// ============================================
// useIconCraftStore
// ============================================

/**
 * ストア操作用フック
 *
 * @example
 * ```tsx
 * const { create, remove, getAll } = useIconCraftStore();
 *
 * const handleAdd = () => {
 *   const id = create('<svg>...</svg>', { mode: 'wax' });
 *   console.log('Created:', id);
 * };
 * ```
 */
export function useIconCraftStore() {
  const { actions, state } = useIconCraftContext();

  return useMemo(
    () => ({
      // CRUD
      create: actions.create,
      remove: actions.remove,
      getById: actions.getById,
      getAll: actions.getAll,

      // メタデータ
      getMetadata: actions.getMetadata,
      updateMetadata: actions.updateMetadata,

      // クリア
      clear: actions.clear,

      // 状態（読み取り専用）
      count: state.instances.size,
      ids: Array.from(state.instances.keys()),
    }),
    [actions, state.instances]
  );
}

// ============================================
// useIconCraft
// ============================================

export interface UseIconCraftReturn {
  instance: IconCraftInstance | undefined;
  metadata: IconCraftMetadata | undefined;
  isSelected: boolean;
  exists: boolean;

  // アクション
  remove: () => boolean;
  updateMetadata: (changes: Partial<IconCraftMetadata>) => void;
  select: () => void;
  deselect: () => void;
  toggleSelect: () => void;

  // ショートカット
  move: (x: number, y: number) => void;
  setZIndex: (zIndex: number) => void;
}

/**
 * 特定インスタンス操作用フック
 *
 * @example
 * ```tsx
 * const { instance, metadata, move, select } = useIconCraft('ic_xxx');
 *
 * <div
 *   style={{ transform: `translate(${metadata?.x}px, ${metadata?.y}px)` }}
 *   onClick={select}
 *   onDrag={(e) => move(e.clientX, e.clientY)}
 * >
 *   <IconCraftView instance={instance} />
 * </div>
 * ```
 */
export function useIconCraft(id: string): UseIconCraftReturn {
  const { actions, state } = useIconCraftContext();

  const instance = state.instances.get(id);
  const metadata = state.metadata.get(id);
  const isSelected = state.selection.has(id);

  const remove = useCallback(() => actions.remove(id), [actions, id]);

  const updateMetadata = useCallback(
    (changes: Partial<IconCraftMetadata>) => actions.updateMetadata(id, changes),
    [actions, id]
  );

  const select = useCallback(() => actions.select(id), [actions, id]);
  const deselect = useCallback(() => actions.deselect(id), [actions, id]);
  const toggleSelect = useCallback(() => actions.toggleSelect(id), [actions, id]);

  const move = useCallback(
    (x: number, y: number) => actions.updateMetadata(id, { x, y }),
    [actions, id]
  );

  const setZIndex = useCallback(
    (zIndex: number) => actions.updateMetadata(id, { zIndex }),
    [actions, id]
  );

  return useMemo(
    () => ({
      instance,
      metadata,
      isSelected,
      exists: !!instance,
      remove,
      updateMetadata,
      select,
      deselect,
      toggleSelect,
      move,
      setZIndex,
    }),
    [
      instance,
      metadata,
      isSelected,
      remove,
      updateMetadata,
      select,
      deselect,
      toggleSelect,
      move,
      setZIndex,
    ]
  );
}

// ============================================
// useIconCraftSelection
// ============================================

export interface UseIconCraftSelectionReturn {
  selected: string[];
  count: number;
  hasSelection: boolean;

  // アクション
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;

  // バッチ
  selectAll: () => void;
  getSelectedInstances: () => IconCraftInstance[];
}

/**
 * 選択管理用フック
 *
 * @example
 * ```tsx
 * const { selected, hasSelection, clear, selectAll } = useIconCraftSelection();
 *
 * <button onClick={selectAll}>Select All</button>
 * <button onClick={clear} disabled={!hasSelection}>Clear</button>
 * <span>{selected.length} selected</span>
 * ```
 */
export function useIconCraftSelection(): UseIconCraftSelectionReturn {
  const { actions, state } = useIconCraftContext();

  const selected = useMemo(
    () => Array.from(state.selection),
    [state.selection]
  );

  const selectAll = useCallback(() => {
    for (const id of state.instances.keys()) {
      actions.select(id);
    }
  }, [state.instances, actions]);

  const getSelectedInstances = useCallback(() => {
    return selected
      .map((id) => state.instances.get(id))
      .filter((inst): inst is IconCraftInstance => inst !== undefined);
  }, [selected, state.instances]);

  return useMemo(
    () => ({
      selected,
      count: selected.length,
      hasSelection: selected.length > 0,
      select: actions.select,
      deselect: actions.deselect,
      toggle: actions.toggleSelect,
      clear: actions.clearSelection,
      isSelected: actions.isSelected,
      selectAll,
      getSelectedInstances,
    }),
    [selected, actions, selectAll, getSelectedInstances]
  );
}

// ============================================
// useIconCraftEvent
// ============================================

/**
 * イベント購読用フック
 *
 * @param filter - 対象ID（'*' で全て）
 * @param eventType - イベントタイプ（'*' で全て）
 * @param handler - イベントハンドラー
 *
 * @example
 * ```tsx
 * // 特定IDのmoveイベント
 * useIconCraftEvent('ic_xxx', 'move', (event) => {
 *   console.log('Moved:', event.x, event.y);
 * });
 *
 * // 全インスタンスのselect/deselectイベント
 * useIconCraftEvent('*', ['select', 'deselect'], (event) => {
 *   console.log('Selection changed:', event.id);
 * });
 *
 * // 全イベント
 * useIconCraftEvent('*', '*', (event) => {
 *   console.log('Event:', event.type, event.id);
 * });
 * ```
 */
export function useIconCraftEvent(
  filter: IconCraftEventFilter,
  eventType: IconCraftEventType | IconCraftEventType[] | '*',
  handler: IconCraftEventHandler
): void {
  const { dispatcher } = useIconCraftContext();

  useEffect(() => {
    const unsubscribe = dispatcher.subscribe(filter, eventType, handler);
    return unsubscribe;
  }, [dispatcher, filter, eventType, handler]);
}

// ============================================
// useIconCraftCreate
// ============================================

export interface UseIconCraftCreateOptions {
  config?: Partial<IconCraftConfigOptions>;
  metadata?: Partial<IconCraftMetadata>;
  autoSelect?: boolean;
}

/**
 * インスタンス作成用フック
 *
 * @example
 * ```tsx
 * const createIcon = useIconCraftCreate({
 *   config: { mode: 'wax', shapeColor: '#6366f1' },
 *   autoSelect: true,
 * });
 *
 * <button onClick={() => createIcon('<svg>...</svg>')}>
 *   Add Icon
 * </button>
 * ```
 */
export function useIconCraftCreate(options: UseIconCraftCreateOptions = {}) {
  const { actions } = useIconCraftContext();
  const { config, metadata, autoSelect = false } = options;

  return useCallback(
    (svg: string, overrides?: Partial<IconCraftConfigOptions>): string => {
      const id = actions.create(svg, { ...config, ...overrides }, metadata);
      if (autoSelect) {
        actions.select(id);
      }
      return id;
    },
    [actions, config, metadata, autoSelect]
  );
}
