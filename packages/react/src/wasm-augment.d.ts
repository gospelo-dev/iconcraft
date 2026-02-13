/* eslint-disable */
/**
 * Type augmentation for gospelo-iconcraft-wasm@0.3.0
 *
 * The installed WASM package (0.1.0) does not include generate_clippath_with_rotation.
 * This declaration adds the function signature so TypeScript can compile.
 * Remove this file once gospelo-iconcraft-wasm@0.3.0+ is installed.
 */
import 'gospelo-iconcraft-wasm';

declare module 'gospelo-iconcraft-wasm' {
  export function generate_clippath_with_rotation(
    svg_content: string,
    mode: number,
    offset: number,
    resolution: number,
    simplify_epsilon: number,
    include_icon: boolean,
    base_color: string,
    rotation_degrees: number,
    icon_color?: string | null
  ): any;
}
