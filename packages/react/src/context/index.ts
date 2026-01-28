// Provider
export { IconCraftProvider, useIconCraftContext } from './IconCraftProvider';
export type { IconCraftProviderProps } from './IconCraftProvider';

// Hooks
export {
  useIconCraftStore,
  useIconCraft,
  useIconCraftSelection,
  useIconCraftEvent,
  useIconCraftCreate,
} from './hooks';
export type { UseIconCraftReturn, UseIconCraftSelectionReturn, UseIconCraftCreateOptions } from './hooks';

// Types
export type {
  IconCraftMetadata,
  IconCraftEvent,
  IconCraftEventType,
  IconCraftEventHandler,
  IconCraftEventFilter,
  IconCraftStoreState,
  IconCraftStoreActions,
  IconCraftDispatcher,
  IconCraftContextValue,
} from './types';
export { DEFAULT_METADATA } from './types';

// Dispatcher (for advanced use)
export { createDispatcher } from './IconCraftDispatcher';
