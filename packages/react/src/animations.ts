import type { AnimationType, AnimationOptions, BuiltInAnimationType } from './types';

// ============================================
// Custom Animation Registry
// ============================================

/**
 * Transform origin preset for icon animations
 * - 'center': Element center using transform-box: fill-box (default)
 * - 'icon': Same as 'center' but semantically for icon-only animations
 * - 'top': Top center (50% 0%)
 * - 'bottom': Bottom center (50% 100%)
 * - 'left': Left center (0% 50%)
 * - 'right': Right center (100% 50%)
 * - 'top-left': Top left corner (0% 0%)
 * - 'top-right': Top right corner (100% 0%)
 * - 'bottom-left': Bottom left corner (0% 100%)
 * - 'bottom-right': Bottom right corner (100% 100%)
 */
export type TransformOriginPreset =
  | 'center'
  | 'icon'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Custom transform origin coordinates (type-safe)
 * @example
 * { x: '50%', y: 0 }    // top center
 * { x: 0, y: '100%' }   // bottom left
 * { x: '25%', y: '75%' } // custom position
 */
export interface TransformOriginCustom {
  /** X coordinate - number (px) or string (%, px, etc.) */
  x: string | number;
  /** Y coordinate - number (px) or string (%, px, etc.) */
  y: string | number;
}

/**
 * Transform origin value - preset or custom coordinates
 * @example
 * 'center'              // preset
 * 'top-left'            // preset
 * { x: '50%', y: 0 }    // custom (type-safe)
 * { x: 0, y: '100%' }   // custom (type-safe)
 */
export type TransformOriginValue = TransformOriginPreset | TransformOriginCustom;

export interface CustomAnimationDefinition {
  /** CSS @keyframes rule string */
  keyframes: string;
  /** Default animation options */
  defaults?: Omit<AnimationOptions, 'type'>;
  /**
   * Transform origin for the animation.
   * Can be a preset ('center', 'icon', 'top', etc.) or a custom CSS value ('50% 0%', etc.)
   * @default 'center'
   */
  transformOrigin?: TransformOriginValue;
}

/** Registry for custom animations */
const customAnimationRegistry = new Map<string, CustomAnimationDefinition>();

/**
 * Register a custom animation.
 *
 * @example
 * ```typescript
 * registerAnimation('tada', {
 *   keyframes: `
 *     @keyframes iconcraft-tada {
 *       0% { transform: scale(1) rotate(0deg); }
 *       10%, 20% { transform: scale(0.9) rotate(-3deg); }
 *       30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
 *       40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
 *       100% { transform: scale(1) rotate(0deg); }
 *     }
 *   `,
 *   defaults: { duration: 1, iterationCount: 1 }
 * });
 * ```
 */
export function registerAnimation(name: string, definition: CustomAnimationDefinition): void {
  customAnimationRegistry.set(name, definition);
}

/**
 * Get custom animation definition
 */
export function getCustomAnimation(name: string): CustomAnimationDefinition | undefined {
  return customAnimationRegistry.get(name);
}

/**
 * Get transform origin value for an animation type
 */
export function getTransformOrigin(type: AnimationType): TransformOriginValue {
  const custom = customAnimationRegistry.get(type);
  return custom?.transformOrigin ?? 'center';
}

// ============================================
// Built-in Keyframes
// ============================================

/**
 * CSS keyframes for built-in animation types
 */
const builtInKeyframes: Record<BuiltInAnimationType, string> = {
  none: '',

  shake: `
    @keyframes iconcraft-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `,

  bounce: `
    @keyframes iconcraft-bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-15px); }
      60% { transform: translateY(-8px); }
    }
  `,

  pulse: `
    @keyframes iconcraft-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
  `,

  swing: `
    @keyframes iconcraft-swing {
      0%, 100% { transform: rotate(0deg); transform-origin: top center; }
      20% { transform: rotate(12deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(4deg); }
      80% { transform: rotate(-4deg); }
    }
  `,

  wobble: `
    @keyframes iconcraft-wobble {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      15% { transform: translateX(-8px) rotate(-5deg); }
      30% { transform: translateX(6px) rotate(3deg); }
      45% { transform: translateX(-5px) rotate(-3deg); }
      60% { transform: translateX(3px) rotate(2deg); }
      75% { transform: translateX(-2px) rotate(-1deg); }
    }
  `,

  jello: `
    @keyframes iconcraft-jello {
      0%, 100% { transform: scale3d(1, 1, 1); }
      30% { transform: scale3d(1.15, 0.85, 1); }
      40% { transform: scale3d(0.85, 1.15, 1); }
      50% { transform: scale3d(1.08, 0.92, 1); }
      65% { transform: scale3d(0.95, 1.05, 1); }
      75% { transform: scale3d(1.03, 0.97, 1); }
    }
  `,

  heartbeat: `
    @keyframes iconcraft-heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.15); }
      28% { transform: scale(1); }
      42% { transform: scale(1.15); }
      70% { transform: scale(1); }
    }
  `,

  float: `
    @keyframes iconcraft-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `,

  spin: `
    @keyframes iconcraft-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,

  rubberBand: `
    @keyframes iconcraft-rubberBand {
      0%, 100% { transform: scale3d(1, 1, 1); }
      30% { transform: scale3d(1.2, 0.8, 1); }
      40% { transform: scale3d(0.8, 1.2, 1); }
      50% { transform: scale3d(1.1, 0.9, 1); }
      65% { transform: scale3d(0.95, 1.05, 1); }
      75% { transform: scale3d(1.02, 0.98, 1); }
    }
  `,

  // === New fun animations ===

  squish: `
    @keyframes iconcraft-squish {
      0%, 100% { transform: scale(1, 1); }
      25% { transform: scale(1.2, 0.8); }
      50% { transform: scale(0.9, 1.1); }
      75% { transform: scale(1.05, 0.95); }
    }
  `,

  tada: `
    @keyframes iconcraft-tada {
      0% { transform: scale(1) rotate(0deg); }
      10%, 20% { transform: scale(0.9) rotate(-3deg); }
      30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
      40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
  `,

  flip: `
    @keyframes iconcraft-flip {
      0% { transform: perspective(400px) rotateY(0deg); }
      40% { transform: perspective(400px) rotateY(-180deg); }
      100% { transform: perspective(400px) rotateY(-360deg); }
    }
  `,

  drop: `
    @keyframes iconcraft-drop {
      0% { transform: translateY(-30px) scale(1, 1); opacity: 0; }
      50% { transform: translateY(0) scale(1.15, 0.85); opacity: 1; }
      65% { transform: translateY(-8px) scale(0.95, 1.05); }
      80% { transform: translateY(0) scale(1.03, 0.97); }
      100% { transform: translateY(0) scale(1, 1); }
    }
  `,

  pop: `
    @keyframes iconcraft-pop {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
  `,

  wiggle: `
    @keyframes iconcraft-wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    }
  `,

  breathe: `
    @keyframes iconcraft-breathe {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
  `,
};

/**
 * Default animation settings for built-in types
 */
const builtInAnimationDefaults: Record<BuiltInAnimationType, Omit<AnimationOptions, 'type'>> = {
  none: {},
  shake: { duration: 0.6, iterationCount: 1, timingFunction: 'ease' },
  bounce: { duration: 1, iterationCount: 'infinite', timingFunction: 'ease' },
  pulse: { duration: 1.5, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
  swing: { duration: 1, iterationCount: 1, timingFunction: 'ease-in-out' },
  wobble: { duration: 1, iterationCount: 1, timingFunction: 'ease-in-out' },
  jello: { duration: 0.9, iterationCount: 1, timingFunction: 'ease' },
  heartbeat: { duration: 1.3, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
  float: { duration: 2, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
  spin: { duration: 1.5, iterationCount: 'infinite', timingFunction: 'linear' },
  rubberBand: { duration: 1, iterationCount: 1, timingFunction: 'ease' },
  // New fun animations
  squish: { duration: 0.6, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
  tada: { duration: 1, iterationCount: 1, timingFunction: 'ease' },
  flip: { duration: 1.2, iterationCount: 1, timingFunction: 'ease-in-out' },
  drop: { duration: 0.8, iterationCount: 1, timingFunction: 'ease-out' },
  pop: { duration: 0.5, iterationCount: 1, timingFunction: 'ease-out' },
  wiggle: { duration: 0.5, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
  breathe: { duration: 3, iterationCount: 'infinite', timingFunction: 'ease-in-out' },
};

/**
 * Get animation defaults (built-in or custom)
 */
export function getAnimationDefaults(type: AnimationType): Omit<AnimationOptions, 'type'> {
  // Check built-in first
  if (type in builtInAnimationDefaults) {
    return builtInAnimationDefaults[type as BuiltInAnimationType];
  }
  // Check custom registry
  const custom = customAnimationRegistry.get(type);
  if (custom?.defaults) {
    return custom.defaults;
  }
  // Default fallback
  return { duration: 1, iterationCount: 1, timingFunction: 'ease' };
}

/** @deprecated Use getAnimationDefaults instead */
export const animationDefaults = builtInAnimationDefaults;

/**
 * Get animation name from type
 */
export function getAnimationName(type: AnimationType): string {
  if (type === 'none') return 'none';
  return `iconcraft-${type}`;
}

/**
 * Parse animation prop into full options
 */
export function parseAnimationOptions(
  animation: AnimationType | AnimationOptions | undefined
): AnimationOptions | null {
  if (!animation || animation === 'none') return null;

  if (typeof animation === 'string') {
    return {
      type: animation,
      ...getAnimationDefaults(animation),
    };
  }

  return {
    ...getAnimationDefaults(animation.type),
    ...animation,
  };
}

/**
 * Generate CSS animation string
 */
export function getAnimationStyle(options: AnimationOptions | null): string {
  if (!options || options.type === 'none') return 'none';

  const name = getAnimationName(options.type);
  const duration = options.duration ?? 1;
  const timing = options.timingFunction ?? 'ease';
  const delay = options.delay ?? 0;
  const iterations = options.iterationCount ?? 1;

  return `${name} ${duration}s ${timing} ${delay}s ${iterations}`;
}

/**
 * Get keyframes CSS for an animation type (built-in or custom)
 */
export function getKeyframes(type: AnimationType): string {
  // Check built-in first
  if (type in builtInKeyframes) {
    return builtInKeyframes[type as BuiltInAnimationType];
  }
  // Check custom registry
  const custom = customAnimationRegistry.get(type);
  if (custom) {
    return custom.keyframes;
  }
  return '';
}

/** @deprecated Use getKeyframes instead */
export const keyframes = builtInKeyframes;

/**
 * Inject keyframes into document (once per animation type)
 */
const injectedKeyframes = new Set<string>();

export function injectKeyframes(type: AnimationType): void {
  if (type === 'none' || injectedKeyframes.has(type)) return;

  if (typeof document === 'undefined') return;

  const keyframesCss = getKeyframes(type);
  if (!keyframesCss) return;

  const style = document.createElement('style');
  style.textContent = keyframesCss;
  document.head.appendChild(style);
  injectedKeyframes.add(type);
}
