import { CSSProperties, ReactNode } from 'react';
import * as gospelo_iconcraft_wasm from 'gospelo-iconcraft-wasm';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ShapeMode = 'jelly' | 'bubble' | 'wax' | 'sticker';
type IconStyle = 'original' | 'emboss' | 'stroke' | 'fill';
/** Built-in animation types */
type BuiltInAnimationType = 'none' | 'shake' | 'bounce' | 'pulse' | 'swing' | 'wobble' | 'jello' | 'heartbeat' | 'float' | 'spin' | 'rubberBand' | 'squish' | 'tada' | 'flip' | 'drop' | 'pop' | 'wiggle' | 'breathe';
/**
 * Custom animation registry for module augmentation.
 *
 * Users can extend this interface to add type-safe custom animations:
 *
 * @example
 * ```typescript
 * // types/iconcraft.d.ts
 * declare module '@gospelo-dev/iconcraft-react' {
 *   interface CustomAnimationRegistry {
 *     tada: true;
 *     flip: true;
 *   }
 * }
 * ```
 */
interface CustomAnimationRegistry {
}
/** All animation types (built-in + custom) */
type AnimationType = BuiltInAnimationType | keyof CustomAnimationRegistry;
/**
 * Animation target - which part of the component to animate
 * - 'shape': Animate only the background shape (SVG container)
 * - 'icon': Animate only the icon inside the shape
 * - 'both': Animate the entire component (default, legacy behavior)
 */
type AnimationTarget = 'shape' | 'icon' | 'both';
interface AnimationOptions {
    type: AnimationType;
    /** Animation target: 'shape', 'icon', or 'both' (default) */
    target?: AnimationTarget;
    duration?: number;
    delay?: number;
    iterationCount?: number | 'infinite';
    timingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    playState?: 'running' | 'paused';
}
interface ColorPalette {
    very_light: string;
    light: string;
    mid: string;
    dark: string;
    very_dark: string;
}
interface IconLayout {
    top_percent: number;
    left_percent: number;
    width_percent: number;
    height_percent: number;
}
interface SvgPaths {
    clip: string | null;
    inner: string | null;
    shadow: string | null;
    highlight: string | null;
}
interface EmbossPath {
    d: string;
    fill: string | null;
    stroke: string | null;
    stroke_width: number | null;
    transform: string | null;
    fill_rule: string | null;
}
interface EmbossIconData {
    view_box: string | null;
    paths: EmbossPath[];
    width: number | null;
    height: number | null;
}
interface IconCraftResult {
    success: boolean;
    clip_path: string | null;
    inner_clip_path: string | null;
    highlight_clip_paths: string[] | null;
    points_count: number;
    mode: string;
    error: string | null;
    icon_layout: IconLayout | null;
    svg_paths: SvgPaths | null;
    emboss_svg: string | null;
    icon_paths: EmbossIconData | null;
    rotation: number;
}
interface IconCraftShapeProps {
    /** SVG content string or URL */
    svg: string;
    /** Shape mode: jelly, bubble, or wax */
    mode?: ShapeMode;
    /** Base color for the shape (hex) */
    shapeColor?: string;
    /** Custom color palette (overrides color) */
    palette?: Partial<ColorPalette>;
    /** Icon rendering style */
    iconStyle?: IconStyle;
    /** Show drop shadow on shape */
    shadow?: boolean;
    /** Show highlight effect */
    highlight?: boolean;
    /** Icon rotation in degrees (0-360). Applied at WASM level so shape follows rotated icon. */
    rotation?: number;
    /** Contour offset (default: 20) */
    offset?: number;
    /** Rasterization resolution (default: 256) */
    resolution?: number;
    /** Polygon simplification epsilon (default: 2.0) */
    simplify?: number;
    /** Width of the component */
    width?: number | string;
    /** Height of the component */
    height?: number | string;
    /** Size shorthand (sets both width and height) */
    size?: number | string;
    /** Animation preset or custom options */
    animation?: AnimationType | AnimationOptions;
    /** Trigger animation on hover */
    animateOnHover?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** Called when generation is complete */
    onLoad?: (result: IconCraftResult) => void;
    /** Called on error */
    onError?: (error: string) => void;
    /** Click handler */
    onClick?: () => void;
}
interface IconCraftProps {
    svgContent: string;
    mode?: ShapeMode;
    baseColor?: string;
    offset?: number;
    resolution?: number;
    simplifyEpsilon?: number;
    showShadow?: boolean;
    showHighlight?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * IconCraft 設定インターフェース
 */
interface IconCraftConfigOptions {
    mode?: ShapeMode;
    shapeColor?: string;
    iconStyle?: IconStyle;
    iconColor?: string;
    shadow?: boolean;
    highlight?: boolean;
    offset?: number;
    resolution?: number;
    simplify?: number;
    rotation?: number;
    size?: number | string;
    width?: number | string;
    height?: number | string;
    animation?: AnimationType | AnimationOptions;
    animateOnHover?: boolean;
}
/**
 * デフォルト設定
 */
declare const DEFAULT_CONFIG: Required<Omit<IconCraftConfigOptions, 'width' | 'height' | 'animation'>> & Pick<IconCraftConfigOptions, 'width' | 'height' | 'animation'>;
/**
 * IconCraft 設定クラス（プロトタイプ）
 *
 * このクラスをベースに clone() でユニークなインスタンスを生成する
 */
declare class IconCraftConfig {
    readonly mode: ShapeMode;
    readonly shapeColor: string;
    readonly iconStyle: IconStyle;
    readonly iconColor: string;
    readonly shadow: boolean;
    readonly highlight: boolean;
    readonly offset: number;
    readonly resolution: number;
    readonly simplify: number;
    readonly rotation: number;
    readonly size: number | string;
    readonly width?: number | string;
    readonly height?: number | string;
    readonly animation?: AnimationType | AnimationOptions;
    readonly animateOnHover: boolean;
    constructor(options?: IconCraftConfigOptions);
    /**
     * 設定を部分的に上書きした新しいConfigを生成
     */
    clone(overrides?: IconCraftConfigOptions): IconCraftConfig;
    /**
     * WASM呼び出し用のパラメータを取得
     */
    getWasmParams(): {
        mode: ShapeMode;
        offset: number;
        resolution: number;
        simplify: number;
        includeIcon: boolean;
        shapeColor: string;
        rotation: number;
        iconColor: string;
    };
    /**
     * スタイル用のサイズを取得
     */
    getSize(): {
        width: string;
        height: string;
    };
}

/**
 * IconCraft インスタンス
 *
 * Factoryから生成されるユニークなオブジェクト
 * 各インスタンスは独自のID、状態（SVG、生成結果）を持つ
 *
 * ID形式: ic_{ULID}
 * 例: ic_01HY7X3K8GQZN5RVXJ2TMCBDEF
 */
declare class IconCraftInstance {
    private readonly _id;
    private readonly _svg;
    private readonly _config;
    private _svgState;
    private _generateState;
    private _generatePromise;
    constructor(svg: string, config: IconCraftConfig, id?: string);
    get id(): string;
    get svg(): string;
    get config(): IconCraftConfig;
    get isUrl(): boolean;
    get svgContent(): string | null;
    get result(): IconCraftResult | null;
    get embossSvg(): string | null;
    get isLoading(): boolean;
    get isReady(): boolean;
    get error(): string | null;
    /**
     * SVGコンテンツを取得
     */
    fetchSvg(): Promise<string>;
    /**
     * アイコンを生成
     */
    generate(): Promise<IconCraftResult>;
    private _doGenerate;
    /**
     * 新しい設定でクローン
     */
    clone(overrides?: IconCraftConfigOptions): IconCraftInstance;
    /**
     * 別のSVGで新しいインスタンスを作成
     */
    withSvg(svg: string): IconCraftInstance;
    /**
     * 状態をリセット
     */
    reset(): void;
}

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
declare class IconCraftFactory {
    private readonly prototype;
    constructor(options?: IconCraftConfigOptions);
    /**
     * 新しいインスタンスを生成
     *
     * @param svg - SVGコンテンツまたはURL
     * @param overrides - このインスタンス固有の設定（オプション）
     */
    create(svg: string, overrides?: IconCraftConfigOptions): IconCraftInstance;
    /**
     * プロトタイプ設定を取得
     */
    getConfig(): IconCraftConfig;
    /**
     * 新しい設定でFactoryを複製
     */
    clone(overrides: IconCraftConfigOptions): IconCraftFactory;
    /**
     * 複数のSVGから一括でインスタンスを生成
     */
    createMany(svgs: string[], overrides?: IconCraftConfigOptions): IconCraftInstance[];
    /**
     * 複数のSVGを一括生成
     */
    generateMany(svgs: string[], overrides?: IconCraftConfigOptions): Promise<IconCraftInstance[]>;
}
/**
 * デフォルトのFactory（グローバル設定）
 */
declare const defaultFactory: IconCraftFactory;

/**
 * WASM生成パラメータ
 */
interface WasmGenerateParams {
    svgContent: string;
    mode: ShapeMode;
    offset: number;
    resolution: number;
    simplify: number;
    includeIcon: boolean;
    shapeColor: string;
    rotation?: number;
    iconColor?: string;
}
/**
 * WASMマネージャー（Singleton）
 *
 * - WASMモジュールの初期化を一元管理
 * - 生成結果のキャッシュ
 * - 並列呼び出しのキュー管理
 */
declare class WasmManagerClass {
    private module;
    private initPromise;
    private cache;
    private maxCacheSize;
    /**
     * WASMモジュールを初期化
     */
    init(): Promise<typeof gospelo_iconcraft_wasm>;
    /**
     * 初期化済みかどうか
     */
    get isReady(): boolean;
    /**
     * アイコンを生成（キャッシュ付き）
     */
    generate(params: WasmGenerateParams): Promise<IconCraftResult>;
    /**
     * キャッシュに追加（LRU）
     */
    private addToCache;
    /**
     * キャッシュをクリア
     */
    clearCache(): void;
    /**
     * キャッシュサイズを設定
     */
    setMaxCacheSize(size: number): void;
    /**
     * 現在のキャッシュ数
     */
    get cacheSize(): number;
}
/**
 * WASMマネージャーのシングルトンインスタンス
 */
declare const WasmManager: WasmManagerClass;

/**
 * ID生成ユーティリティ
 */
declare function generateIconId(): string;
/**
 * IDからタイムスタンプを抽出
 */
declare function getTimestampFromId(id: string): Date | null;
/**
 * IconCraft レジストリ
 *
 * インスタンスの管理とプロパティ別検索を提供
 */
declare class IconCraftRegistry {
    private byId;
    private byMode;
    private byColor;
    /**
     * インスタンスを登録
     */
    register(instance: IconCraftInstance): void;
    /**
     * インスタンスを削除
     */
    unregister(id: string): boolean;
    /**
     * IDで取得
     */
    get(id: string): IconCraftInstance | undefined;
    /**
     * 全インスタンスを取得
     */
    getAll(): IconCraftInstance[];
    /**
     * モードで検索
     */
    findByMode(mode: ShapeMode): IconCraftInstance[];
    /**
     * 色で検索
     */
    findByColor(color: string): IconCraftInstance[];
    /**
     * 時間範囲で検索（ULIDのタイムスタンプを利用）
     */
    findByTimeRange(start: Date, end: Date): IconCraftInstance[];
    /**
     * 作成順でソート（ULIDは辞書順でソート可能）
     */
    getAllSorted(order?: 'asc' | 'desc'): IconCraftInstance[];
    /**
     * 登録数
     */
    get size(): number;
    /**
     * すべてクリア
     */
    clear(): void;
    /**
     * インデックスの統計情報
     */
    getStats(): {
        total: number;
        byMode: Record<string, number>;
        byColor: Record<string, number>;
    };
}
/**
 * グローバルレジストリ（シングルトン）
 */
declare const globalRegistry: IconCraftRegistry;

/**
 * Dial preset definition
 */
interface DialPreset {
    name: string;
    renderRing: (props: DialRingProps) => React.ReactNode;
    renderNotch: (props: DialNotchProps) => React.ReactNode;
    renderLabel?: (props: DialLabelProps) => React.ReactNode;
}
/** Default: dashed ring with circle notch */
declare const dialPresetDashed: DialPreset;
/** Solid thin ring with diamond notch */
declare const dialPresetSolid: DialPreset;
/** Tick marks ring with arrow notch */
declare const dialPresetTicks: DialPreset;
/** Dotted ring with square notch */
declare const dialPresetDotted: DialPreset;
/** Double ring with pill-shaped notch */
declare const dialPresetDouble: DialPreset;
/** Crosshair style with + shaped notch */
declare const dialPresetCrosshair: DialPreset;
/** Minimal: only quarter arcs with triangle notch */
declare const dialPresetMinimal: DialPreset;
/** Needle: dashed ring with elongated needle notch */
declare const dialPresetNeedle: DialPreset;
/** Bar: solid ring with rounded bar notch */
declare const dialPresetBar: DialPreset;
/** Arrow: tick ring with arrow-head notch */
declare const dialPresetArrow: DialPreset;
/** All presets for easy iteration */
declare const dialPresets: {
    readonly dotted: DialPreset;
    readonly dashed: DialPreset;
    readonly solid: DialPreset;
    readonly ticks: DialPreset;
    readonly double: DialPreset;
    readonly crosshair: DialPreset;
    readonly minimal: DialPreset;
    readonly needle: DialPreset;
    readonly bar: DialPreset;
    readonly arrow: DialPreset;
};
type DialPresetName = keyof typeof dialPresets;
/**
 * Reticle preset definition
 */
interface ReticlePreset {
    name: string;
    render: (props: ReticleProps) => React.ReactNode;
}
/** Cross: back=bottom+right arms, front=top+left arms + center dot */
declare const reticlePresetCross: ReticlePreset;
/** Bullseye: circle + center dot */
declare const reticlePresetBullseye: ReticlePreset;
/** Globe: wireframe sphere — all lines split into back (far side) and front (near side) */
declare const reticlePresetGlobe: ReticlePreset;
/** All reticle presets */
declare const reticlePresets: {
    readonly cross: ReticlePreset;
    readonly bullseye: ReticlePreset;
    readonly globe: ReticlePreset;
};
type ReticlePresetName = keyof typeof reticlePresets;

interface IconCraftViewProps {
    /** IconCraftInstance */
    instance: IconCraftInstance;
    /** Animation override */
    animation?: AnimationType | AnimationOptions;
    /**
     * Animation target override.
     * - 'shape': Animate only the background shape
     * - 'icon': Animate only the icon inside
     * - 'both': Animate entire component (default)
     */
    animationTarget?: AnimationTarget;
    /** Animate on hover */
    animateOnHover?: boolean;
    /** Z-index for layering */
    zIndex?: number;
    /** Additional CSS class */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** Click handler */
    onClick?: () => void;
    /** Load callback */
    onLoad?: () => void;
    /** Error callback */
    onError?: (error: string) => void;
    /** Show rotation dial overlay */
    showRotationDial?: boolean;
    /** Rotation change callback (called on mouseup with final degree) */
    onRotationChange?: (deg: number) => void;
    /** Snap angle in degrees (default: 5) */
    rotationSnap?: number;
    /** Custom ring SVG renderer */
    renderRing?: (props: DialRingProps) => React.ReactNode;
    /** Custom notch SVG renderer */
    renderNotch?: (props: DialNotchProps) => React.ReactNode;
    /** Custom label SVG renderer */
    renderLabel?: (props: DialLabelProps) => React.ReactNode;
    /** Dial preset object (overrides renderRing/renderNotch/renderLabel) */
    dialPreset?: DialPreset;
    /** Show center reticle */
    showReticle?: boolean;
    /** Custom reticle SVG renderer */
    renderReticle?: (props: ReticleProps) => React.ReactNode;
    /** Reticle preset object (overrides renderReticle) */
    reticlePreset?: ReticlePreset;
    /** Dial ring color (default: '#000') */
    dialColor?: string;
    /** Notch color (default: '#000') */
    notchColor?: string;
    /** Reticle color (default: '#000') */
    reticleColor?: string;
    /**
     * External CSS rotation preview (degrees).
     * Applied only to the shape+icon layer via CSS transform,
     * keeping dial and reticle layers fixed.
     * Set to null/undefined to disable.
     */
    cssRotation?: number | null;
}
/** Props passed to custom reticle renderer */
interface ReticleProps {
    cx: number;
    cy: number;
    size: number;
    /** Which layer is being rendered: 'back' (behind icon) or 'front' (above icon) */
    layer: 'back' | 'front';
}
/** Props passed to custom ring renderer */
interface DialRingProps {
    cx: number;
    cy: number;
    radius: number;
}
/** Props passed to custom notch renderer */
interface DialNotchProps {
    x: number;
    y: number;
    /** Current angle in degrees (0 = top) */
    degrees: number;
    onMouseDown: (e: React.MouseEvent) => void;
}
/** Props passed to custom label renderer */
interface DialLabelProps {
    x: number;
    y: number;
    degrees: number;
}
/**
 * IconCraftView - インスタンスからSVGを表示するコンポーネント
 *
 * @example
 * ```tsx
 * const factory = new IconCraftFactory({ mode: 'wax', shapeColor: '#6366f1' });
 * const icon = factory.create('<svg>...</svg>');
 *
 * <IconCraftView instance={icon} zIndex={10} />
 * ```
 */
declare function IconCraftView({ instance, animation, animationTarget, animateOnHover, zIndex, className, style, onClick, onLoad, onError, showRotationDial, onRotationChange, rotationSnap, renderRing: renderRingProp, renderNotch: renderNotchProp, renderLabel: renderLabelProp, dialPreset, showReticle, renderReticle: renderReticleProp, reticlePreset, dialColor: dialColorProp, notchColor: notchColorProp, reticleColor: reticleColorProp, cssRotation, }: IconCraftViewProps): react_jsx_runtime.JSX.Element | null;

/**
 * IconCraftSimple Props
 *
 * シンプルなインターフェースでIconCraftを使用するためのコンポーネント
 */
interface IconCraftSimpleProps {
    /** SVG URL または SVG文字列 */
    src: string;
    /** シェイプモード */
    mode?: ShapeMode;
    /** アイコンスタイル */
    iconStyle?: IconStyle;
    /** アイコンの色（stroke/fillスタイル時） */
    iconColor?: string;
    /** シェイプカラー (hex) */
    shapeColor?: string;
    /** サイズ (px) */
    size?: number;
    /** アニメーション種類 */
    animation?: AnimationType;
    /** アニメーションオプション */
    animationOptions?: AnimationOptions;
    /** アニメーションターゲット */
    animationTarget?: AnimationTarget;
    /** ホバー時にアニメーション */
    animateOnHover?: boolean;
    /** Z-index */
    zIndex?: number;
    /** クラス名 */
    className?: string;
    /** インラインスタイル */
    style?: React.CSSProperties;
    /** クリックイベント */
    onClick?: () => void;
    /** ロード完了コールバック */
    onLoad?: () => void;
    /** エラーコールバック */
    onError?: (error: string) => void;
    /** 詳細設定（IconCraftViewに渡す追加props） */
    viewProps?: Partial<Omit<IconCraftViewProps, 'instance'>>;
}
/**
 * IconCraftSimple
 *
 * 最もシンプルな使い方でIconCraftを利用できるコンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * <IconCraftSimple src="/icon.svg" />
 *
 * // カスタマイズ
 * <IconCraftSimple
 *   src="https://example.com/icon.svg"
 *   mode="jelly"
 *   shapeColor="#6366f1"
 *   size={200}
 *   animation="float"
 * />
 *
 * // SVG文字列を直接渡す
 * <IconCraftSimple
 *   src={`<svg>...</svg>`}
 *   mode="bubble"
 *   iconStyle="emboss"
 * />
 * ```
 */
declare function IconCraftSimple({ src, mode, iconStyle, iconColor, shapeColor, size, animation, animationOptions, animationTarget, animateOnHover, zIndex, className, style, onClick, onLoad, onError, viewProps, }: IconCraftSimpleProps): react_jsx_runtime.JSX.Element;

/**
 * IconCraftShape - Full-featured emboss icon component
 *
 * @example
 * ```tsx
 * <IconCraftShape
 *   svg="<svg>...</svg>"
 *   mode="wax"
 *   shapeColor="#6366f1"
 *   size={120}
 *   animation="float"
 * />
 * ```
 */
declare function IconCraftShape({ svg, mode, shapeColor, iconStyle, shadow: _shadow, highlight: _highlight, offset, resolution, simplify, rotation, width, height, size, animation, animateOnHover, className, style, onLoad, onError, onClick, }: IconCraftShapeProps): react_jsx_runtime.JSX.Element | null;

/**
 * Legacy IconCraft component
 * @deprecated Use IconCraftView with IconCraftFactory instead
 */
declare function IconCraft({ svgContent, mode, baseColor, offset, resolution, simplifyEpsilon, showShadow: _showShadow, showHighlight: _showHighlight, className, style, }: IconCraftProps): react_jsx_runtime.JSX.Element | null;

/**
 * インスタンスのメタデータ（位置、サイズ、選択状態など）
 */
interface IconCraftMetadata {
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
declare const DEFAULT_METADATA: IconCraftMetadata;
/**
 * イベントタイプ
 */
type IconCraftEventType = 'created' | 'removed' | 'ready' | 'error' | 'select' | 'deselect' | 'move' | 'resize' | 'zIndex' | 'transform' | 'config' | 'metadata' | 'custom';
/**
 * イベントペイロード
 */
type IconCraftEvent = {
    type: 'created';
    id: string;
    instance: IconCraftInstance;
} | {
    type: 'removed';
    id: string;
} | {
    type: 'ready';
    id: string;
    result: IconCraftResult;
} | {
    type: 'error';
    id: string;
    error: string;
} | {
    type: 'select';
    id: string;
} | {
    type: 'deselect';
    id: string;
} | {
    type: 'move';
    id: string;
    x: number;
    y: number;
} | {
    type: 'resize';
    id: string;
    width: number;
    height: number;
} | {
    type: 'zIndex';
    id: string;
    zIndex: number;
} | {
    type: 'transform';
    id: string;
    changes: Partial<IconCraftMetadata>;
} | {
    type: 'config';
    id: string;
    changes: Partial<IconCraftConfigOptions>;
} | {
    type: 'metadata';
    id: string;
    changes: Partial<IconCraftMetadata>;
} | {
    type: 'custom';
    id: string;
    name: string;
    payload: unknown;
};
/**
 * イベントハンドラー
 */
type IconCraftEventHandler<T extends IconCraftEvent = IconCraftEvent> = (event: T) => void;
/**
 * イベントフィルター（'*' で全イベント）
 */
type IconCraftEventFilter = string | '*';
/**
 * ストアの状態
 */
interface IconCraftStoreState {
    instances: Map<string, IconCraftInstance>;
    metadata: Map<string, IconCraftMetadata>;
    selection: Set<string>;
}
/**
 * ストアのアクション
 */
interface IconCraftStoreActions {
    create: (svg: string, config?: Partial<IconCraftConfigOptions>, metadata?: Partial<IconCraftMetadata>) => string;
    remove: (id: string) => boolean;
    getById: (id: string) => IconCraftInstance | undefined;
    getAll: () => IconCraftInstance[];
    getMetadata: (id: string) => IconCraftMetadata | undefined;
    updateMetadata: (id: string, changes: Partial<IconCraftMetadata>) => void;
    select: (id: string) => void;
    deselect: (id: string) => void;
    toggleSelect: (id: string) => void;
    clearSelection: () => void;
    getSelected: () => string[];
    isSelected: (id: string) => boolean;
    clear: () => void;
}
/**
 * イベントディスパッチャー
 */
interface IconCraftDispatcher {
    dispatch: (event: IconCraftEvent) => void;
    subscribe: (filter: IconCraftEventFilter, eventType: IconCraftEventType | IconCraftEventType[] | '*', handler: IconCraftEventHandler) => () => void;
}
/**
 * Contextの値
 */
interface IconCraftContextValue {
    state: IconCraftStoreState;
    actions: IconCraftStoreActions;
    dispatcher: IconCraftDispatcher;
    defaultConfig: Partial<IconCraftConfigOptions>;
}

interface IconCraftProviderProps {
    children: ReactNode;
    defaultConfig?: Partial<IconCraftConfigOptions>;
}
declare function IconCraftProvider({ children, defaultConfig, }: IconCraftProviderProps): react_jsx_runtime.JSX.Element;
declare function useIconCraftContext(): IconCraftContextValue;

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
declare function useIconCraftStore(): {
    create: (svg: string, config?: Partial<IconCraftConfigOptions>, metadata?: Partial<IconCraftMetadata>) => string;
    remove: (id: string) => boolean;
    getById: (id: string) => IconCraftInstance | undefined;
    getAll: () => IconCraftInstance[];
    getMetadata: (id: string) => IconCraftMetadata | undefined;
    updateMetadata: (id: string, changes: Partial<IconCraftMetadata>) => void;
    clear: () => void;
    count: number;
    ids: string[];
};
interface UseIconCraftReturn$1 {
    instance: IconCraftInstance | undefined;
    metadata: IconCraftMetadata | undefined;
    isSelected: boolean;
    exists: boolean;
    remove: () => boolean;
    updateMetadata: (changes: Partial<IconCraftMetadata>) => void;
    select: () => void;
    deselect: () => void;
    toggleSelect: () => void;
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
declare function useIconCraft$1(id: string): UseIconCraftReturn$1;
interface UseIconCraftSelectionReturn {
    selected: string[];
    count: number;
    hasSelection: boolean;
    select: (id: string) => void;
    deselect: (id: string) => void;
    toggle: (id: string) => void;
    clear: () => void;
    isSelected: (id: string) => boolean;
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
declare function useIconCraftSelection(): UseIconCraftSelectionReturn;
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
declare function useIconCraftEvent(filter: IconCraftEventFilter, eventType: IconCraftEventType | IconCraftEventType[] | '*', handler: IconCraftEventHandler): void;
interface UseIconCraftCreateOptions {
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
declare function useIconCraftCreate(options?: UseIconCraftCreateOptions): (svg: string, overrides?: Partial<IconCraftConfigOptions>) => string;

/**
 * イベントディスパッチャーの作成
 */
declare function createDispatcher(): IconCraftDispatcher;

interface UseIconCraftOptions {
    /** SVG content string or URL */
    svg: string;
    /** Shape mode */
    mode?: ShapeMode;
    /** Shape color (hex) */
    shapeColor?: string;
    /** Icon style */
    iconStyle?: IconStyle;
    /** Contour offset */
    offset?: number;
    /** Rasterization resolution */
    resolution?: number;
    /** Polygon simplification epsilon */
    simplify?: number;
    /** Icon rotation in degrees (0-360) */
    rotation?: number;
    /** Auto-generate on mount/change */
    autoGenerate?: boolean;
}
interface UseIconCraftReturn {
    /** Generated result */
    result: IconCraftResult | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Resolved SVG content */
    svgContent: string | null;
    /** Manually trigger generation */
    generate: () => Promise<void>;
    /** Reset state */
    reset: () => void;
}
/**
 * Hook for generating IconCraft shapes
 *
 * @example
 * ```tsx
 * const { result, isLoading, error } = useIconCraft({
 *   svg: '<svg>...</svg>',
 *   mode: 'wax',
 *   shapeColor: '#6366f1',
 * });
 * ```
 */
declare function useIconCraft(options: UseIconCraftOptions): UseIconCraftReturn;
interface UseLegacyIconCraftOptions {
    svgContent: string;
    mode?: ShapeMode;
    baseColor?: string;
    offset?: number;
    resolution?: number;
    simplifyEpsilon?: number;
}
interface UseLegacyIconCraftReturn {
    result: IconCraftResult | null;
    isLoading: boolean;
    error: string | null;
    generate: () => Promise<void>;
}
/**
 * Legacy hook (backwards compatibility)
 * @deprecated Use useIconCraft with new API instead
 */
declare function useLegacyIconCraft(options: UseLegacyIconCraftOptions): UseLegacyIconCraftReturn;

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
type TransformOriginPreset = 'center' | 'icon' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/**
 * Custom transform origin coordinates (type-safe)
 * @example
 * { x: '50%', y: 0 }    // top center
 * { x: 0, y: '100%' }   // bottom left
 * { x: '25%', y: '75%' } // custom position
 */
interface TransformOriginCustom {
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
type TransformOriginValue = TransformOriginPreset | TransformOriginCustom;
interface CustomAnimationDefinition {
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
declare function registerAnimation(name: string, definition: CustomAnimationDefinition): void;
/**
 * Get custom animation definition
 */
declare function getCustomAnimation(name: string): CustomAnimationDefinition | undefined;
/**
 * Get transform origin value for an animation type
 */
declare function getTransformOrigin(type: AnimationType): TransformOriginValue;
/**
 * Get animation defaults (built-in or custom)
 */
declare function getAnimationDefaults(type: AnimationType): Omit<AnimationOptions, 'type'>;
/** @deprecated Use getAnimationDefaults instead */
declare const animationDefaults: Record<BuiltInAnimationType, Omit<AnimationOptions, "type">>;
/**
 * Get animation name from type
 */
declare function getAnimationName(type: AnimationType): string;
/**
 * Parse animation prop into full options
 */
declare function parseAnimationOptions(animation: AnimationType | AnimationOptions | undefined): AnimationOptions | null;
/**
 * Generate CSS animation string
 */
declare function getAnimationStyle(options: AnimationOptions | null): string;
/**
 * Get keyframes CSS for an animation type (built-in or custom)
 */
declare function getKeyframes(type: AnimationType): string;
/** @deprecated Use getKeyframes instead */
declare const keyframes: Record<BuiltInAnimationType, string>;
declare function injectKeyframes(type: AnimationType): void;

/**
 * バックアップ用のアイコンデータ
 */
interface IconBackupData {
    /** SVG URL または SVG文字列 */
    svg: string;
    /** シェイプモード */
    mode: ShapeMode;
    /** アイコンスタイル */
    iconStyle: IconStyle;
    /** シェイプカラー */
    shapeColor: string;
    /** サイズ */
    size: number;
    /** X座標（オプション） */
    x?: number;
    /** Y座標（オプション） */
    y?: number;
    /** Z-index（オプション） */
    zIndex?: number;
    /** アイコンの色（オプション） */
    iconColor?: string;
    /** 回転角度（オプション） */
    rotation?: number;
    /** アニメーション（オプション） */
    animation?: AnimationType;
    /** カスタムメタデータ（オプション） */
    metadata?: Record<string, unknown>;
}
/**
 * バックアップファイルの形式
 */
interface IconCraftBackup {
    /** バージョン */
    version: string;
    /** 作成日時 */
    createdAt: string;
    /** ライセンス（オプション） */
    license?: string;
    /** ライセンス元URL（オプション） */
    licenseUrl?: string;
    /** アイコンデータの配列 */
    icons: IconBackupData[];
    /** グローバル設定（オプション） */
    settings?: {
        defaultMode?: ShapeMode;
        defaultIconStyle?: IconStyle;
        defaultShapeColor?: string;
        defaultSize?: number;
    };
}
/**
 * 現在のバックアップバージョン
 */
declare const BACKUP_VERSION = "1.0.0";
/**
 * バックアップ作成オプション
 */
interface CreateBackupOptions {
    /** グローバル設定 */
    settings?: IconCraftBackup['settings'];
    /** ライセンス */
    license?: string;
    /** ライセンス元URL */
    licenseUrl?: string;
}
/**
 * バックアップデータを作成
 */
declare function createBackup(icons: IconBackupData[], options?: CreateBackupOptions): IconCraftBackup;
/**
 * バックアップをJSONファイルとしてダウンロード
 */
declare function downloadBackup(backup: IconCraftBackup, filename?: string): void;
/**
 * バックアップをエクスポート（JSON文字列として）
 */
declare function exportBackup(backup: IconCraftBackup): string;
/**
 * バックアップの検証結果
 */
interface BackupValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * バックアップデータを検証
 */
declare function validateBackup(data: unknown): BackupValidationResult;
/**
 * JSONファイルからバックアップを読み込み
 */
declare function parseBackup(json: string): IconCraftBackup | null;
/**
 * ファイル入力からバックアップを読み込み
 */
declare function loadBackupFromFile(file: File): Promise<IconCraftBackup | null>;

export { type AnimationOptions, type AnimationTarget, type AnimationType, BACKUP_VERSION, type BackupValidationResult, type BuiltInAnimationType, type ColorPalette, type CreateBackupOptions, type CustomAnimationDefinition, type CustomAnimationRegistry, DEFAULT_CONFIG, DEFAULT_METADATA, type DialLabelProps, type DialNotchProps, type DialPreset, type DialPresetName, type DialRingProps, type EmbossIconData, type EmbossPath, type IconBackupData, IconCraft, type IconCraftBackup, IconCraftConfig, type IconCraftConfigOptions, type IconCraftContextValue, type IconCraftDispatcher, type IconCraftEvent, type IconCraftEventFilter, type IconCraftEventHandler, type IconCraftEventType, IconCraftFactory, IconCraftInstance, type IconCraftMetadata, type IconCraftProps, IconCraftProvider, type IconCraftProviderProps, IconCraftRegistry, type IconCraftResult, IconCraftShape, type IconCraftShapeProps, IconCraftSimple, type IconCraftSimpleProps, type IconCraftStoreActions, type IconCraftStoreState, IconCraftView, type IconCraftViewProps, type IconLayout, type IconStyle, type ReticlePreset, type ReticlePresetName, type ReticleProps, type ShapeMode, type SvgPaths, type TransformOriginCustom, type TransformOriginPreset, type TransformOriginValue, type UseIconCraftCreateOptions, type UseIconCraftReturn$1 as UseIconCraftInstanceReturn, type UseIconCraftOptions, type UseIconCraftReturn, type UseIconCraftSelectionReturn, type WasmGenerateParams, WasmManager, animationDefaults, createBackup, createDispatcher, defaultFactory, dialPresetArrow, dialPresetBar, dialPresetCrosshair, dialPresetDashed, dialPresetDotted, dialPresetDouble, dialPresetMinimal, dialPresetNeedle, dialPresetSolid, dialPresetTicks, dialPresets, downloadBackup, exportBackup, generateIconId, getAnimationDefaults, getAnimationName, getAnimationStyle, getCustomAnimation, getKeyframes, getTimestampFromId, getTransformOrigin, globalRegistry, injectKeyframes, keyframes, loadBackupFromFile, parseAnimationOptions, parseBackup, registerAnimation, reticlePresetBullseye, reticlePresetCross, reticlePresetGlobe, reticlePresets, useIconCraft, useIconCraftContext, useIconCraftCreate, useIconCraftEvent, useIconCraft$1 as useIconCraftInstance, useIconCraftSelection, useIconCraftStore, useLegacyIconCraft, validateBackup };
