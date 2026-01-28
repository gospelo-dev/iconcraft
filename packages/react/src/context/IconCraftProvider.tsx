import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { IconCraftFactory } from '../core/IconCraftFactory';
import { IconCraftInstance } from '../core/IconCraftInstance';
import type { IconCraftConfigOptions } from '../core/IconCraftConfig';
import { createDispatcher } from './IconCraftDispatcher';
import {
  type IconCraftContextValue,
  type IconCraftStoreState,
  type IconCraftMetadata,
  type IconCraftDispatcher,
  DEFAULT_METADATA,
} from './types';

// ============================================
// Context
// ============================================

const IconCraftContext = createContext<IconCraftContextValue | null>(null);

// ============================================
// Reducer
// ============================================

type Action =
  | { type: 'ADD'; id: string; instance: IconCraftInstance; metadata: IconCraftMetadata }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE_METADATA'; id: string; changes: Partial<IconCraftMetadata> }
  | { type: 'SELECT'; id: string }
  | { type: 'DESELECT'; id: string }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CLEAR_ALL' };

function reducer(state: IconCraftStoreState, action: Action): IconCraftStoreState {
  switch (action.type) {
    case 'ADD': {
      const newInstances = new Map(state.instances);
      const newMetadata = new Map(state.metadata);
      newInstances.set(action.id, action.instance);
      newMetadata.set(action.id, action.metadata);
      return { ...state, instances: newInstances, metadata: newMetadata };
    }

    case 'REMOVE': {
      const newInstances = new Map(state.instances);
      const newMetadata = new Map(state.metadata);
      const newSelection = new Set(state.selection);
      newInstances.delete(action.id);
      newMetadata.delete(action.id);
      newSelection.delete(action.id);
      return { instances: newInstances, metadata: newMetadata, selection: newSelection };
    }

    case 'UPDATE_METADATA': {
      const existing = state.metadata.get(action.id);
      if (!existing) return state;
      const newMetadata = new Map(state.metadata);
      newMetadata.set(action.id, { ...existing, ...action.changes });
      return { ...state, metadata: newMetadata };
    }

    case 'SELECT': {
      if (state.selection.has(action.id)) return state;
      const newSelection = new Set(state.selection);
      newSelection.add(action.id);
      return { ...state, selection: newSelection };
    }

    case 'DESELECT': {
      if (!state.selection.has(action.id)) return state;
      const newSelection = new Set(state.selection);
      newSelection.delete(action.id);
      return { ...state, selection: newSelection };
    }

    case 'TOGGLE_SELECT': {
      const newSelection = new Set(state.selection);
      if (newSelection.has(action.id)) {
        newSelection.delete(action.id);
      } else {
        newSelection.add(action.id);
      }
      return { ...state, selection: newSelection };
    }

    case 'CLEAR_SELECTION': {
      if (state.selection.size === 0) return state;
      return { ...state, selection: new Set<string>() };
    }

    case 'CLEAR_ALL': {
      return {
        instances: new Map<string, IconCraftInstance>(),
        metadata: new Map<string, IconCraftMetadata>(),
        selection: new Set<string>(),
      };
    }

    default:
      return state;
  }
}

// ============================================
// Provider Props
// ============================================

export interface IconCraftProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<IconCraftConfigOptions>;
}

// ============================================
// Provider Component
// ============================================

const initialState: IconCraftStoreState = {
  instances: new Map<string, IconCraftInstance>(),
  metadata: new Map<string, IconCraftMetadata>(),
  selection: new Set<string>(),
};

export function IconCraftProvider({
  children,
  defaultConfig = {},
}: IconCraftProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ディスパッチャー（安定参照）
  const dispatcherRef = useRef<IconCraftDispatcher | null>(null);
  if (!dispatcherRef.current) {
    dispatcherRef.current = createDispatcher();
  }
  const dispatcher = dispatcherRef.current;

  // zIndex カウンター
  const zIndexRef = useRef(0);

  // Factory（defaultConfig変更時に再作成）
  const factory = useMemo(
    () => new IconCraftFactory(defaultConfig),
    [defaultConfig]
  );

  // ============================================
  // Actions
  // ============================================

  const create = useCallback(
    (
      svg: string,
      config?: Partial<IconCraftConfigOptions>,
      metadataOverrides?: Partial<IconCraftMetadata>
    ): string => {
      const instance = config
        ? factory.create(svg, config)
        : factory.create(svg);

      const id = instance.id;
      zIndexRef.current += 1;

      const metadata: IconCraftMetadata = {
        ...DEFAULT_METADATA,
        zIndex: zIndexRef.current,
        ...metadataOverrides,
      };

      dispatch({ type: 'ADD', id, instance, metadata });
      dispatcher.dispatch({ type: 'created', id, instance });

      return id;
    },
    [factory, dispatcher]
  );

  const remove = useCallback(
    (id: string): boolean => {
      if (!state.instances.has(id)) return false;
      dispatch({ type: 'REMOVE', id });
      dispatcher.dispatch({ type: 'removed', id });
      return true;
    },
    [state.instances, dispatcher]
  );

  const getById = useCallback(
    (id: string) => state.instances.get(id),
    [state.instances]
  );

  const getAll = useCallback(
    () => Array.from(state.instances.values()),
    [state.instances]
  );

  const getMetadata = useCallback(
    (id: string) => state.metadata.get(id),
    [state.metadata]
  );

  const updateMetadata = useCallback(
    (id: string, changes: Partial<IconCraftMetadata>): void => {
      dispatch({ type: 'UPDATE_METADATA', id, changes });
      dispatcher.dispatch({ type: 'metadata', id, changes });

      // 特定の変更に対して追加イベント
      if (changes.x !== undefined || changes.y !== undefined) {
        const meta = state.metadata.get(id);
        if (meta) {
          dispatcher.dispatch({
            type: 'move',
            id,
            x: changes.x ?? meta.x,
            y: changes.y ?? meta.y,
          });
        }
      }
      if (changes.zIndex !== undefined) {
        dispatcher.dispatch({ type: 'zIndex', id, zIndex: changes.zIndex });
      }
    },
    [state.metadata, dispatcher]
  );

  const select = useCallback(
    (id: string): void => {
      dispatch({ type: 'SELECT', id });
      dispatcher.dispatch({ type: 'select', id });
    },
    [dispatcher]
  );

  const deselect = useCallback(
    (id: string): void => {
      dispatch({ type: 'DESELECT', id });
      dispatcher.dispatch({ type: 'deselect', id });
    },
    [dispatcher]
  );

  const toggleSelect = useCallback(
    (id: string): void => {
      const wasSelected = state.selection.has(id);
      dispatch({ type: 'TOGGLE_SELECT', id });
      dispatcher.dispatch({ type: wasSelected ? 'deselect' : 'select', id });
    },
    [state.selection, dispatcher]
  );

  const clearSelection = useCallback((): void => {
    for (const id of state.selection) {
      dispatcher.dispatch({ type: 'deselect', id });
    }
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [state.selection, dispatcher]);

  const getSelected = useCallback(
    () => Array.from(state.selection),
    [state.selection]
  );

  const isSelected = useCallback(
    (id: string) => state.selection.has(id),
    [state.selection]
  );

  const clear = useCallback((): void => {
    for (const id of state.instances.keys()) {
      dispatcher.dispatch({ type: 'removed', id });
    }
    dispatch({ type: 'CLEAR_ALL' });
  }, [state.instances, dispatcher]);

  // ============================================
  // Context Value
  // ============================================

  const contextValue = useMemo<IconCraftContextValue>(
    () => ({
      state,
      actions: {
        create,
        remove,
        getById,
        getAll,
        getMetadata,
        updateMetadata,
        select,
        deselect,
        toggleSelect,
        clearSelection,
        getSelected,
        isSelected,
        clear,
      },
      dispatcher,
      defaultConfig,
    }),
    [
      state,
      create,
      remove,
      getById,
      getAll,
      getMetadata,
      updateMetadata,
      select,
      deselect,
      toggleSelect,
      clearSelection,
      getSelected,
      isSelected,
      clear,
      dispatcher,
      defaultConfig,
    ]
  );

  return (
    <IconCraftContext.Provider value={contextValue}>
      {children}
    </IconCraftContext.Provider>
  );
}

// ============================================
// Hook to access context
// ============================================

export function useIconCraftContext(): IconCraftContextValue {
  const context = useContext(IconCraftContext);
  if (!context) {
    throw new Error('useIconCraftContext must be used within IconCraftProvider');
  }
  return context;
}
