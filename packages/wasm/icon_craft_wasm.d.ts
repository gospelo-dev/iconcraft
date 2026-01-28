/* tslint:disable */
/* eslint-disable */

/**
 * Shape mode for clip-path generation
 */
export enum ShapeMode {
    Jelly = 0,
    Droplet = 1,
    Wax = 2,
}

/**
 * Generate clip-path from SVG content
 */
export function generate_clippath(svg_content: string, mode: ShapeMode, offset: number, resolution: number, simplify_epsilon: number): any;

/**
 * Generate clip-path with icon and custom base color for gradients
 * base_color: hex color string (e.g., "#6366f1") - used to generate color palette
 */
export function generate_clippath_with_color(svg_content: string, mode: ShapeMode, offset: number, resolution: number, simplify_epsilon: number, include_icon: boolean, base_color: string): any;

/**
 * Generate clip-path from SVG content with icon embedding option
 * When include_icon is true, generates complete emboss SVG with icon paths
 */
export function generate_clippath_with_icon(svg_content: string, mode: ShapeMode, offset: number, resolution: number, simplify_epsilon: number, include_icon: boolean): any;

export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly generate_clippath: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly generate_clippath_with_color: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly generate_clippath_with_icon: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
    readonly init: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
