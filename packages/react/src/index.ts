// ============================================
// Core Classes (Factory Pattern)
// ============================================
export {
  IconCraftFactory,
  defaultFactory,
  IconCraftInstance,
  IconCraftConfig,
  DEFAULT_CONFIG,
  WasmManager,
  IconCraftRegistry,
  globalRegistry,
  generateIconId,
  getTimestampFromId,
} from './core';

export type {
  IconCraftConfigOptions,
  WasmGenerateParams,
} from './core';

// ============================================
// Components
// ============================================
export { IconCraftView, IconCraftSimple } from './components';
export type { IconCraftViewProps, IconCraftSimpleProps } from './components';

// Legacy components
export { IconCraftShape } from './IconCraftShape';
export { IconCraft } from './IconCraft';

// ============================================
// Context (State Management)
// ============================================
export {
  IconCraftProvider,
  useIconCraftContext,
  useIconCraftStore,
  useIconCraft as useIconCraftInstance,
  useIconCraftSelection,
  useIconCraftEvent,
  useIconCraftCreate,
  createDispatcher,
  DEFAULT_METADATA,
} from './context';

export type {
  IconCraftProviderProps,
  UseIconCraftReturn as UseIconCraftInstanceReturn,
  UseIconCraftSelectionReturn,
  UseIconCraftCreateOptions,
  IconCraftMetadata,
  IconCraftEvent,
  IconCraftEventType,
  IconCraftEventHandler,
  IconCraftEventFilter,
  IconCraftStoreState,
  IconCraftStoreActions,
  IconCraftDispatcher,
  IconCraftContextValue,
} from './context';

// ============================================
// Hooks (Legacy)
// ============================================
export { useIconCraft, useLegacyIconCraft } from './useIconCraft';

export type {
  UseIconCraftOptions,
  UseIconCraftReturn,
} from './useIconCraft';

// ============================================
// Animations
// ============================================
export {
  // Custom animation registration
  registerAnimation,
  getCustomAnimation,
  getAnimationDefaults,
  getKeyframes,
  getTransformOrigin,
  // Animation utilities
  getAnimationName,
  parseAnimationOptions,
  getAnimationStyle,
  injectKeyframes,
  // Legacy exports (deprecated)
  keyframes,
  animationDefaults,
} from './animations';

export type { CustomAnimationDefinition, TransformOriginPreset, TransformOriginCustom, TransformOriginValue } from './animations';

// ============================================
// Utilities
// ============================================
export {
  createBackup,
  downloadBackup,
  exportBackup,
  validateBackup,
  parseBackup,
  loadBackupFromFile,
  BACKUP_VERSION,
} from './utils';

export type {
  IconBackupData,
  IconCraftBackup,
  BackupValidationResult,
  CreateBackupOptions,
} from './utils';

// ============================================
// Types
// ============================================
export type {
  // Shape & Style
  ShapeMode,
  IconStyle,

  // Animation
  BuiltInAnimationType,
  CustomAnimationRegistry,
  AnimationType,
  AnimationTarget,
  AnimationOptions,

  // Color
  ColorPalette,

  // WASM Result
  IconLayout,
  SvgPaths,
  EmbossPath,
  EmbossIconData,
  IconCraftResult,

  // Component Props (Legacy)
  IconCraftShapeProps,
  IconCraftProps,
} from './types';
