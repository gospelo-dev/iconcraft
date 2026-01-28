// src/core/IconCraftConfig.ts
var DEFAULT_CONFIG = {
  mode: "wax",
  shapeColor: "#6366f1",
  iconStyle: "emboss",
  iconColor: "#1d1d1f",
  shadow: true,
  highlight: true,
  offset: 20,
  resolution: 256,
  simplify: 2,
  size: 120,
  width: void 0,
  height: void 0,
  animation: void 0,
  animateOnHover: false
};
var IconCraftConfig = class _IconCraftConfig {
  constructor(options = {}) {
    this.mode = options.mode ?? DEFAULT_CONFIG.mode;
    this.shapeColor = options.shapeColor ?? DEFAULT_CONFIG.shapeColor;
    this.iconStyle = options.iconStyle ?? DEFAULT_CONFIG.iconStyle;
    this.iconColor = options.iconColor ?? DEFAULT_CONFIG.iconColor;
    this.shadow = options.shadow ?? DEFAULT_CONFIG.shadow;
    this.highlight = options.highlight ?? DEFAULT_CONFIG.highlight;
    this.offset = options.offset ?? DEFAULT_CONFIG.offset;
    this.resolution = options.resolution ?? DEFAULT_CONFIG.resolution;
    this.simplify = options.simplify ?? DEFAULT_CONFIG.simplify;
    this.size = options.size ?? DEFAULT_CONFIG.size;
    this.width = options.width;
    this.height = options.height;
    this.animation = options.animation;
    this.animateOnHover = options.animateOnHover ?? DEFAULT_CONFIG.animateOnHover;
  }
  /**
   * 設定を部分的に上書きした新しいConfigを生成
   */
  clone(overrides = {}) {
    return new _IconCraftConfig({
      mode: overrides.mode ?? this.mode,
      shapeColor: overrides.shapeColor ?? this.shapeColor,
      iconStyle: overrides.iconStyle ?? this.iconStyle,
      iconColor: overrides.iconColor ?? this.iconColor,
      shadow: overrides.shadow ?? this.shadow,
      highlight: overrides.highlight ?? this.highlight,
      offset: overrides.offset ?? this.offset,
      resolution: overrides.resolution ?? this.resolution,
      simplify: overrides.simplify ?? this.simplify,
      size: overrides.size ?? this.size,
      width: overrides.width ?? this.width,
      height: overrides.height ?? this.height,
      animation: overrides.animation ?? this.animation,
      animateOnHover: overrides.animateOnHover ?? this.animateOnHover
    });
  }
  /**
   * WASM呼び出し用のパラメータを取得
   */
  getWasmParams() {
    const needsEmbossSvg = this.mode === "wax" || this.iconStyle === "emboss";
    return {
      mode: this.mode,
      offset: this.offset,
      resolution: this.resolution,
      simplify: this.simplify,
      includeIcon: needsEmbossSvg,
      shapeColor: this.shapeColor
    };
  }
  /**
   * スタイル用のサイズを取得
   */
  getSize() {
    const w = this.width ?? this.size;
    const h = this.height ?? this.size;
    return {
      width: typeof w === "number" ? `${w}px` : w,
      height: typeof h === "number" ? `${h}px` : h
    };
  }
};

// src/core/WasmManager.ts
function createCacheKey(params) {
  return JSON.stringify({
    svg: params.svgContent.slice(0, 100),
    // SVGの先頭100文字でハッシュ
    svgLen: params.svgContent.length,
    mode: params.mode,
    offset: params.offset,
    resolution: params.resolution,
    simplify: params.simplify,
    includeIcon: params.includeIcon,
    shapeColor: params.shapeColor
  });
}
var shapeModeMap = {
  jelly: 0,
  droplet: 1,
  wax: 2
};
var WasmManagerClass = class {
  constructor() {
    this.module = null;
    this.initPromise = null;
    this.cache = /* @__PURE__ */ new Map();
    this.maxCacheSize = 100;
  }
  /**
   * WASMモジュールを初期化
   */
  async init() {
    if (this.module) return this.module;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const wasm = await import("gospelo-iconcraft-wasm");
      await wasm.default();
      this.module = wasm;
      return wasm;
    })();
    return this.initPromise;
  }
  /**
   * 初期化済みかどうか
   */
  get isReady() {
    return this.module !== null;
  }
  /**
   * アイコンを生成（キャッシュ付き）
   */
  async generate(params) {
    const cacheKey = createCacheKey(params);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const wasm = await this.init();
    const result = wasm.generate_clippath_with_color(
      params.svgContent,
      shapeModeMap[params.mode],
      params.offset,
      params.resolution,
      params.simplify,
      params.includeIcon,
      params.shapeColor
    );
    if (result.success) {
      this.addToCache(cacheKey, result);
    }
    return result;
  }
  /**
   * キャッシュに追加（LRU）
   */
  addToCache(key, result) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, result);
  }
  /**
   * キャッシュをクリア
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * キャッシュサイズを設定
   */
  setMaxCacheSize(size) {
    this.maxCacheSize = size;
  }
  /**
   * 現在のキャッシュ数
   */
  get cacheSize() {
    return this.cache.size;
  }
};
var WasmManager = new WasmManagerClass();

// src/core/IconCraftRegistry.ts
import { ulid, decodeTime } from "ulid";
function generateIconId() {
  return `ic_${ulid()}`;
}
function getTimestampFromId(id) {
  const ulidPart = id.replace(/^ic_/, "");
  try {
    return new Date(decodeTime(ulidPart));
  } catch {
    return null;
  }
}
var IconCraftRegistry = class {
  constructor() {
    this.byId = /* @__PURE__ */ new Map();
    this.byMode = /* @__PURE__ */ new Map();
    this.byColor = /* @__PURE__ */ new Map();
  }
  /**
   * インスタンスを登録
   */
  register(instance) {
    const id = instance.id;
    const mode = instance.config.mode;
    const color = instance.config.shapeColor;
    this.byId.set(id, instance);
    if (!this.byMode.has(mode)) {
      this.byMode.set(mode, /* @__PURE__ */ new Set());
    }
    this.byMode.get(mode).add(id);
    if (!this.byColor.has(color)) {
      this.byColor.set(color, /* @__PURE__ */ new Set());
    }
    this.byColor.get(color).add(id);
  }
  /**
   * インスタンスを削除
   */
  unregister(id) {
    const instance = this.byId.get(id);
    if (!instance) return false;
    const mode = instance.config.mode;
    const color = instance.config.shapeColor;
    this.byId.delete(id);
    this.byMode.get(mode)?.delete(id);
    if (this.byMode.get(mode)?.size === 0) {
      this.byMode.delete(mode);
    }
    this.byColor.get(color)?.delete(id);
    if (this.byColor.get(color)?.size === 0) {
      this.byColor.delete(color);
    }
    return true;
  }
  /**
   * IDで取得
   */
  get(id) {
    return this.byId.get(id);
  }
  /**
   * 全インスタンスを取得
   */
  getAll() {
    return Array.from(this.byId.values());
  }
  /**
   * モードで検索
   */
  findByMode(mode) {
    const ids = this.byMode.get(mode);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.byId.get(id)).filter((inst) => inst !== void 0);
  }
  /**
   * 色で検索
   */
  findByColor(color) {
    const ids = this.byColor.get(color);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.byId.get(id)).filter((inst) => inst !== void 0);
  }
  /**
   * 時間範囲で検索（ULIDのタイムスタンプを利用）
   */
  findByTimeRange(start, end) {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return Array.from(this.byId.entries()).filter(([id]) => {
      const timestamp = getTimestampFromId(id);
      if (!timestamp) return false;
      const time = timestamp.getTime();
      return time >= startTime && time <= endTime;
    }).map(([, instance]) => instance);
  }
  /**
   * 作成順でソート（ULIDは辞書順でソート可能）
   */
  getAllSorted(order = "asc") {
    const entries = Array.from(this.byId.entries());
    entries.sort((a, b) => {
      const cmp = a[0].localeCompare(b[0]);
      return order === "asc" ? cmp : -cmp;
    });
    return entries.map(([, instance]) => instance);
  }
  /**
   * 登録数
   */
  get size() {
    return this.byId.size;
  }
  /**
   * すべてクリア
   */
  clear() {
    this.byId.clear();
    this.byMode.clear();
    this.byColor.clear();
  }
  /**
   * インデックスの統計情報
   */
  getStats() {
    const byModeStats = {};
    for (const [mode, ids] of this.byMode) {
      byModeStats[mode] = ids.size;
    }
    const byColorStats = {};
    for (const [color, ids] of this.byColor) {
      byColorStats[color] = ids.size;
    }
    return {
      total: this.byId.size,
      byMode: byModeStats,
      byColor: byColorStats
    };
  }
};
var globalRegistry = new IconCraftRegistry();

// src/core/IconCraftInstance.ts
var IconCraftInstance = class _IconCraftInstance {
  constructor(svg, config, id) {
    this._svgState = { status: "pending" };
    this._generateState = { status: "idle" };
    this._generatePromise = null;
    this._id = id ?? generateIconId();
    this._svg = svg;
    this._config = config;
  }
  // ============================================
  // Getters
  // ============================================
  get id() {
    return this._id;
  }
  get svg() {
    return this._svg;
  }
  get config() {
    return this._config;
  }
  get isUrl() {
    return this._svg.startsWith("http://") || this._svg.startsWith("https://") || this._svg.startsWith("/");
  }
  get svgContent() {
    return this._svgState.status === "ready" ? this._svgState.content : null;
  }
  get result() {
    return this._generateState.status === "done" ? this._generateState.result : null;
  }
  get embossSvg() {
    return this.result?.emboss_svg ?? null;
  }
  get isLoading() {
    return this._svgState.status === "loading" || this._generateState.status === "generating";
  }
  get isReady() {
    return this._generateState.status === "done";
  }
  get error() {
    if (this._svgState.status === "error") return this._svgState.error;
    if (this._generateState.status === "error") return this._generateState.error;
    return null;
  }
  // ============================================
  // Methods
  // ============================================
  /**
   * SVGコンテンツを取得
   */
  async fetchSvg() {
    if (this._svgState.status === "ready") {
      return this._svgState.content;
    }
    if (!this.isUrl) {
      this._svgState = { status: "ready", content: this._svg };
      return this._svg;
    }
    this._svgState = { status: "loading" };
    try {
      const response = await fetch(this._svg);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }
      const content = await response.text();
      this._svgState = { status: "ready", content };
      return content;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      this._svgState = { status: "error", error };
      throw err;
    }
  }
  /**
   * アイコンを生成
   */
  async generate() {
    if (this._generatePromise) {
      return this._generatePromise;
    }
    if (this._generateState.status === "done") {
      return this._generateState.result;
    }
    this._generatePromise = this._doGenerate();
    return this._generatePromise;
  }
  async _doGenerate() {
    this._generateState = { status: "generating" };
    try {
      const svgContent = await this.fetchSvg();
      const params = this._config.getWasmParams();
      console.log("[IconCraftInstance] Generating with params:", {
        id: this._id,
        mode: params.mode,
        shapeColor: params.shapeColor
      });
      const result = await WasmManager.generate({
        svgContent,
        mode: params.mode,
        offset: params.offset,
        resolution: params.resolution,
        simplify: params.simplify,
        includeIcon: params.includeIcon,
        shapeColor: params.shapeColor
      });
      if (!result.success) {
        throw new Error(result.error || "Generation failed");
      }
      console.log("[IconCraftInstance] Generated result:", {
        id: this._id,
        success: result.success,
        embossSvgPreview: result.emboss_svg?.slice(0, 300)
      });
      this._generateState = { status: "done", result };
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      this._generateState = { status: "error", error };
      throw err;
    } finally {
      this._generatePromise = null;
    }
  }
  /**
   * 新しい設定でクローン
   */
  clone(overrides) {
    const newConfig = overrides ? this._config.clone(overrides) : this._config;
    return new _IconCraftInstance(this._svg, newConfig);
  }
  /**
   * 別のSVGで新しいインスタンスを作成
   */
  withSvg(svg) {
    return new _IconCraftInstance(svg, this._config);
  }
  /**
   * 状態をリセット
   */
  reset() {
    this._svgState = { status: "pending" };
    this._generateState = { status: "idle" };
    this._generatePromise = null;
  }
};

// src/core/IconCraftFactory.ts
var IconCraftFactory = class _IconCraftFactory {
  constructor(options = {}) {
    this.prototype = new IconCraftConfig(options);
  }
  /**
   * 新しいインスタンスを生成
   *
   * @param svg - SVGコンテンツまたはURL
   * @param overrides - このインスタンス固有の設定（オプション）
   */
  create(svg, overrides) {
    const config = overrides ? this.prototype.clone(overrides) : this.prototype;
    return new IconCraftInstance(svg, config);
  }
  /**
   * プロトタイプ設定を取得
   */
  getConfig() {
    return this.prototype;
  }
  /**
   * 新しい設定でFactoryを複製
   */
  clone(overrides) {
    const newConfig = this.prototype.clone(overrides);
    return new _IconCraftFactory({
      mode: newConfig.mode,
      shapeColor: newConfig.shapeColor,
      iconStyle: newConfig.iconStyle,
      shadow: newConfig.shadow,
      highlight: newConfig.highlight,
      offset: newConfig.offset,
      resolution: newConfig.resolution,
      simplify: newConfig.simplify,
      size: newConfig.size,
      width: newConfig.width,
      height: newConfig.height,
      animation: newConfig.animation,
      animateOnHover: newConfig.animateOnHover
    });
  }
  /**
   * 複数のSVGから一括でインスタンスを生成
   */
  createMany(svgs, overrides) {
    return svgs.map((svg) => this.create(svg, overrides));
  }
  /**
   * 複数のSVGを一括生成
   */
  async generateMany(svgs, overrides) {
    const instances = this.createMany(svgs, overrides);
    await Promise.all(instances.map((inst) => inst.generate()));
    return instances;
  }
};
var defaultFactory = new IconCraftFactory();

// src/components/IconCraftView.tsx
import { useEffect, useState, useMemo } from "react";

// src/animations.ts
var customAnimationRegistry = /* @__PURE__ */ new Map();
function registerAnimation(name, definition) {
  customAnimationRegistry.set(name, definition);
}
function getCustomAnimation(name) {
  return customAnimationRegistry.get(name);
}
function getTransformOrigin(type) {
  const custom = customAnimationRegistry.get(type);
  return custom?.transformOrigin ?? "center";
}
var builtInKeyframes = {
  none: "",
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
  `
};
var builtInAnimationDefaults = {
  none: {},
  shake: { duration: 0.6, iterationCount: 1, timingFunction: "ease" },
  bounce: { duration: 1, iterationCount: "infinite", timingFunction: "ease" },
  pulse: { duration: 1.5, iterationCount: "infinite", timingFunction: "ease-in-out" },
  swing: { duration: 1, iterationCount: 1, timingFunction: "ease-in-out" },
  wobble: { duration: 1, iterationCount: 1, timingFunction: "ease-in-out" },
  jello: { duration: 0.9, iterationCount: 1, timingFunction: "ease" },
  heartbeat: { duration: 1.3, iterationCount: "infinite", timingFunction: "ease-in-out" },
  float: { duration: 2, iterationCount: "infinite", timingFunction: "ease-in-out" },
  spin: { duration: 1.5, iterationCount: "infinite", timingFunction: "linear" },
  rubberBand: { duration: 1, iterationCount: 1, timingFunction: "ease" },
  // New fun animations
  squish: { duration: 0.6, iterationCount: "infinite", timingFunction: "ease-in-out" },
  tada: { duration: 1, iterationCount: 1, timingFunction: "ease" },
  flip: { duration: 1.2, iterationCount: 1, timingFunction: "ease-in-out" },
  drop: { duration: 0.8, iterationCount: 1, timingFunction: "ease-out" },
  pop: { duration: 0.5, iterationCount: 1, timingFunction: "ease-out" },
  wiggle: { duration: 0.5, iterationCount: "infinite", timingFunction: "ease-in-out" },
  breathe: { duration: 3, iterationCount: "infinite", timingFunction: "ease-in-out" }
};
function getAnimationDefaults(type) {
  if (type in builtInAnimationDefaults) {
    return builtInAnimationDefaults[type];
  }
  const custom = customAnimationRegistry.get(type);
  if (custom?.defaults) {
    return custom.defaults;
  }
  return { duration: 1, iterationCount: 1, timingFunction: "ease" };
}
var animationDefaults = builtInAnimationDefaults;
function getAnimationName(type) {
  if (type === "none") return "none";
  return `iconcraft-${type}`;
}
function parseAnimationOptions(animation) {
  if (!animation || animation === "none") return null;
  if (typeof animation === "string") {
    return {
      type: animation,
      ...getAnimationDefaults(animation)
    };
  }
  return {
    ...getAnimationDefaults(animation.type),
    ...animation
  };
}
function getAnimationStyle(options) {
  if (!options || options.type === "none") return "none";
  const name = getAnimationName(options.type);
  const duration = options.duration ?? 1;
  const timing = options.timingFunction ?? "ease";
  const delay = options.delay ?? 0;
  const iterations = options.iterationCount ?? 1;
  return `${name} ${duration}s ${timing} ${delay}s ${iterations}`;
}
function getKeyframes(type) {
  if (type in builtInKeyframes) {
    return builtInKeyframes[type];
  }
  const custom = customAnimationRegistry.get(type);
  if (custom) {
    return custom.keyframes;
  }
  return "";
}
var keyframes = builtInKeyframes;
var injectedKeyframes = /* @__PURE__ */ new Set();
function injectKeyframes(type) {
  if (type === "none" || injectedKeyframes.has(type)) return;
  if (typeof document === "undefined") return;
  const keyframesCss = getKeyframes(type);
  if (!keyframesCss) return;
  const style = document.createElement("style");
  style.textContent = keyframesCss;
  document.head.appendChild(style);
  injectedKeyframes.add(type);
}

// src/components/IconCraftView.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function formatCoordinate(value) {
  if (typeof value === "number") {
    return value === 0 ? "0" : `${value}px`;
  }
  return value;
}
function resolveTransformOrigin(value) {
  if (typeof value === "object" && value !== null) {
    const x = formatCoordinate(value.x);
    const y = formatCoordinate(value.y);
    return `${x} ${y}`;
  }
  switch (value) {
    case "center":
    case "icon":
      return "center center";
    case "top":
      return "50% 0%";
    case "bottom":
      return "50% 100%";
    case "left":
      return "0% 50%";
    case "right":
      return "100% 50%";
    case "top-left":
      return "0% 0%";
    case "top-right":
      return "100% 0%";
    case "bottom-left":
      return "0% 100%";
    case "bottom-right":
      return "100% 100%";
    default:
      return "center center";
  }
}
function IconCraftView({
  instance,
  animation,
  animationTarget,
  animateOnHover = false,
  zIndex,
  className,
  style,
  onClick,
  onLoad,
  onError
}) {
  const [, forceUpdate] = useState({});
  const [isHovering, setIsHovering] = useState(false);
  const animationOptions = useMemo(() => {
    const anim = animation ?? instance.config.animation;
    return parseAnimationOptions(anim);
  }, [animation, instance.config.animation]);
  useEffect(() => {
    if (animationOptions?.type) {
      injectKeyframes(animationOptions.type);
    }
  }, [animationOptions?.type]);
  useEffect(() => {
    if (instance.isReady) {
      onLoad?.();
      return;
    }
    instance.generate().then(() => {
      forceUpdate({});
      onLoad?.();
    }).catch((err) => {
      forceUpdate({});
      onError?.(err.message);
    });
  }, [instance, onLoad, onError]);
  const renderedSvg = useMemo(() => {
    const instanceId = instance.id;
    const iconStyle = instance.config.iconStyle;
    const iconColor = instance.config.iconColor;
    const result = instance.result;
    const mode = instance.config.mode;
    const isWax = mode === "wax";
    if (isWax && instance.embossSvg) {
      let svg2 = instance.embossSvg;
      const modes = ["wax", "jelly", "droplet"];
      for (const m of modes) {
        svg2 = svg2.replace(
          new RegExp(`id="${m}-`, "g"),
          `id="${instanceId}-${m}-`
        );
        svg2 = svg2.replace(
          new RegExp(`url\\(#${m}-`, "g"),
          `url(#${instanceId}-${m}-`
        );
      }
      if (iconStyle !== "emboss") {
        const svgContent2 = instance.svgContent;
        if (svgContent2) {
          const viewBoxMatch2 = svgContent2.match(/viewBox="([^"]*)"/);
          const viewBox2 = viewBoxMatch2 ? viewBoxMatch2[1] : "0 0 36 36";
          let innerSvg2 = svgContent2.replace(/<\/?svg[^>]*>/g, "");
          let iconContent;
          switch (iconStyle) {
            case "fill":
              innerSvg2 = innerSvg2.replace(/fill="[^"]*"/g, "");
              iconContent = `<g fill="${iconColor}">${innerSvg2}</g>`;
              break;
            case "stroke":
              innerSvg2 = innerSvg2.replace(/fill="[^"]*"/g, "");
              innerSvg2 = innerSvg2.replace(/stroke="[^"]*"/g, "");
              innerSvg2 = innerSvg2.replace(/stroke-width="[^"]*"/g, "");
              iconContent = `<g fill="none" stroke="${iconColor}" stroke-width="1.5">${innerSvg2}</g>`;
              break;
            case "original":
            default:
              iconContent = innerSvg2;
              break;
          }
          const layout2 = result?.icon_layout;
          const newIconSvg = `<g filter="none">
    <svg x="${layout2?.left_percent ?? 28}" y="${layout2?.top_percent ?? 28}" width="${layout2?.width_percent ?? 44}" height="${layout2?.height_percent ?? 44}" viewBox="${viewBox2}" overflow="visible">
      ${iconContent}
    </svg>
  </g>`;
          svg2 = svg2.replace(/<g filter="none">[\s\S]*?<\/g>\s*<\/svg>$/, `${newIconSvg}
</svg>`);
        }
      }
      return svg2;
    }
    if (iconStyle === "emboss" && instance.embossSvg) {
      let svg2 = instance.embossSvg;
      const modes = ["wax", "jelly", "droplet"];
      for (const m of modes) {
        svg2 = svg2.replace(
          new RegExp(`id="${m}-`, "g"),
          `id="${instanceId}-${m}-`
        );
        svg2 = svg2.replace(
          new RegExp(`url\\(#${m}-`, "g"),
          `url(#${instanceId}-${m}-`
        );
      }
      return svg2;
    }
    if (!result || !result.svg_paths?.clip) return "";
    const svgContent = instance.svgContent;
    if (!svgContent) return "";
    const color = instance.config.shapeColor;
    const layout = result.icon_layout;
    let useOriginalColors = false;
    let isStroke = false;
    let iconFill;
    switch (iconStyle) {
      case "fill":
        iconFill = iconColor;
        break;
      case "stroke":
        iconFill = "none";
        isStroke = true;
        break;
      case "original":
      default:
        iconFill = "currentColor";
        useOriginalColors = true;
        break;
    }
    const clipPath = result.svg_paths.clip;
    const highlightPath = result.svg_paths.highlight;
    const isJellyOrDroplet = mode === "jelly" || mode === "droplet";
    const gradientId = `${instanceId}-bg-grad`;
    const clipId = `${instanceId}-clip`;
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
    let innerSvg = svgContent.replace(/<\/?svg[^>]*>/g, "");
    if (iconStyle === "fill" || iconStyle === "stroke") {
      innerSvg = innerSvg.replace(/fill="[^"]*"/g, "");
    }
    if (isStroke) {
      innerSvg = innerSvg.replace(/stroke="[^"]*"/g, "");
      innerSvg = innerSvg.replace(/stroke-width="[^"]*"/g, "");
    }
    const bgGradient = isJellyOrDroplet ? `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="${color}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.5"/>
        </linearGradient>
        <linearGradient id="${instanceId}-top-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.6"/>
          <stop offset="30%" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="#fff" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-bottom-shadow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="40%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="70%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="${instanceId}-edge-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#fff" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>` : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-top-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>
          <stop offset="40%" stop-color="#fff" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${instanceId}-wax-bottom-shadow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="60%" stop-color="#000" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.25"/>
        </linearGradient>`;
    const shapeContent = isJellyOrDroplet ? `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-bottom-shadow)"/>
        ${highlightPath ? `<path d="${highlightPath}" fill="url(#${instanceId}-edge-highlight)"/>` : ""}` : `<path d="${clipPath}" fill="url(#${gradientId})"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-top-highlight)"/>
        <path d="${clipPath}" fill="url(#${instanceId}-wax-bottom-shadow)"/>`;
    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${bgGradient}
        <clipPath id="${clipId}">
          <path d="${clipPath}"/>
        </clipPath>
        <filter id="${instanceId}-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="6" stdDeviation="8" flood-opacity="0.25"/>
        </filter>
      </defs>
      <!-- \u30B7\u30A7\u30A4\u30D7\u80CC\u666F -->
      <g filter="url(#${instanceId}-shadow)">
        ${shapeContent}
      </g>
      <!-- \u30A2\u30A4\u30B3\u30F3\uFF08\u30B7\u30A7\u30A4\u30D7\u306E\u4E0A\u306B\u91CD\u306D\u308B\uFF09 -->
      <svg x="${layout?.left_percent ?? 28}" y="${layout?.top_percent ?? 28}"
           width="${layout?.width_percent ?? 44}" height="${layout?.height_percent ?? 44}"
           viewBox="${viewBox}" overflow="visible">
        ${useOriginalColors ? innerSvg : isStroke ? `<g fill="none" stroke="${iconColor}" stroke-width="1.5">${innerSvg}</g>` : `<g fill="${iconFill}">${innerSvg}</g>`}
      </svg>
    </svg>`;
    return svg;
  }, [instance.id, instance.config.mode, instance.config.iconStyle, instance.config.iconColor, instance.config.shapeColor, instance.embossSvg, instance.result, instance.svgContent]);
  const { width, height } = instance.config.getSize();
  const hoverAnim = animateOnHover ?? instance.config.animateOnHover;
  const shouldAnimate = hoverAnim ? isHovering : true;
  const animStyle = shouldAnimate ? getAnimationStyle(animationOptions) : "none";
  const target = animationTarget ?? animationOptions?.target ?? "both";
  const containerStyle = {
    width,
    height,
    display: "inline-block",
    position: "relative",
    cursor: onClick ? "pointer" : void 0,
    animation: target === "both" ? animStyle : void 0,
    zIndex,
    ...style
  };
  const cssVars = {};
  if (target === "shape") {
    cssVars["--iconcraft-shape-animation"] = animStyle;
    cssVars["--iconcraft-icon-animation"] = "none";
  } else if (target === "icon") {
    cssVars["--iconcraft-shape-animation"] = "none";
    cssVars["--iconcraft-icon-animation"] = animStyle;
  } else {
    cssVars["--iconcraft-shape-animation"] = "none";
    cssVars["--iconcraft-icon-animation"] = "none";
  }
  const transformOriginValue = animationOptions?.type ? getTransformOrigin(animationOptions.type) : "center";
  const transformOriginCss = resolveTransformOrigin(transformOriginValue);
  const animationStyles = target !== "both" ? `
    <style>
      .iconcraft-shape {
        animation: var(--iconcraft-shape-animation, none);
        transform-origin: ${transformOriginCss};
        transform-box: fill-box;
      }
      .iconcraft-icon-wrapper {
        animation: var(--iconcraft-icon-animation, none);
        transform-origin: ${transformOriginCss};
        transform-box: fill-box;
      }
    </style>
  ` : "";
  const processedSvg = useMemo(() => {
    if (!renderedSvg) return "";
    if (target === "both") return renderedSvg;
    let svg = renderedSvg;
    svg = svg.replace(
      /<g filter="url\(#[^"]*-shadow"\)/g,
      '$& class="iconcraft-shape"'
    );
    svg = svg.replace(
      /(<g filter="none">)\s*(<svg[^>]*>[\s\S]*?<\/svg>)\s*(<\/g>)/g,
      '$1<g class="iconcraft-icon-wrapper">$2</g>$3'
    );
    svg = svg.replace(
      /(<\/g>\s*<!-- アイコン[^>]*-->\s*)(<svg[^>]*x="[^"]*"[^>]*y="[^"]*"[^>]*>[\s\S]*?<\/svg>)/g,
      '$1<g class="iconcraft-icon-wrapper">$2</g>'
    );
    return svg;
  }, [renderedSvg, target]);
  if (instance.isLoading) {
    return /* @__PURE__ */ jsx("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx(LoadingIndicator, {}) });
  }
  if (instance.error) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className,
        style: {
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fee",
          borderRadius: "8px",
          color: "#c00",
          fontSize: "11px",
          padding: "8px",
          textAlign: "center"
        },
        children: instance.error
      }
    );
  }
  if (!processedSvg) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className,
      style: { ...containerStyle, ...cssVars },
      onClick,
      onMouseEnter: hoverAnim ? () => setIsHovering(true) : void 0,
      onMouseLeave: hoverAnim ? () => setIsHovering(false) : void 0,
      dangerouslySetInnerHTML: { __html: animationStyles + processedSvg }
    }
  );
}
function LoadingIndicator() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.03)",
        borderRadius: "50%"
      },
      children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", children: [
        /* @__PURE__ */ jsx("style", { children: `@keyframes iconcraft-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "#ccc",
            strokeWidth: "2",
            fill: "none",
            strokeDasharray: "31.4 31.4",
            strokeLinecap: "round",
            style: { animation: "iconcraft-spin 1s linear infinite" }
          }
        )
      ] })
    }
  );
}

// src/components/IconCraftSimple.tsx
import { useMemo as useMemo2 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function IconCraftSimple({
  src,
  mode = "jelly",
  iconStyle = "original",
  iconColor = "#1d1d1f",
  shapeColor = "#ffffff",
  size = 160,
  animation,
  animationOptions,
  animationTarget,
  animateOnHover,
  zIndex,
  className,
  style,
  onClick,
  onLoad,
  onError,
  viewProps
}) {
  const instance = useMemo2(() => {
    const factory = new IconCraftFactory({
      mode,
      iconStyle,
      iconColor,
      shapeColor,
      size
    });
    return factory.create(src);
  }, [src, mode, iconStyle, iconColor, shapeColor, size]);
  const resolvedAnimation = animation && animationOptions ? { ...animationOptions, type: animation } : animation;
  return /* @__PURE__ */ jsx2(
    IconCraftView,
    {
      instance,
      animation: resolvedAnimation,
      animationTarget,
      animateOnHover,
      zIndex,
      className,
      style,
      onClick,
      onLoad,
      onError,
      ...viewProps
    }
  );
}

// src/IconCraftShape.tsx
import { useEffect as useEffect2, useState as useState2, useMemo as useMemo3, useCallback } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var wasmModule = null;
var wasmInitPromise = null;
async function initWasm() {
  if (wasmModule) return wasmModule;
  if (wasmInitPromise) return wasmInitPromise;
  wasmInitPromise = (async () => {
    const wasm = await import("gospelo-iconcraft-wasm");
    await wasm.default();
    wasmModule = wasm;
    return wasm;
  })();
  return wasmInitPromise;
}
var shapeModeMap2 = {
  jelly: 0,
  droplet: 1,
  wax: 2
};
function isUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");
}
async function fetchSvg(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status}`);
  }
  return response.text();
}
function IconCraftShape({
  // Required
  svg,
  // Shape Settings
  mode = "wax",
  shapeColor = "#6366f1",
  // Icon Style
  iconStyle = "emboss",
  // Effects (reserved for future use)
  shadow: _shadow = true,
  highlight: _highlight = true,
  // WASM Parameters
  offset = 20,
  resolution = 256,
  simplify = 2,
  // Size & Layout
  width,
  height,
  size,
  // Animation
  animation,
  animateOnHover = false,
  // Styling
  className,
  style,
  // Events
  onLoad,
  onError,
  onClick
}) {
  const [result, setResult] = useState2(null);
  const [isLoading, setIsLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const [isHovering, setIsHovering] = useState2(false);
  const animationOptions = useMemo3(
    () => parseAnimationOptions(animation),
    [animation]
  );
  useEffect2(() => {
    if (animationOptions?.type) {
      injectKeyframes(animationOptions.type);
    }
  }, [animationOptions?.type]);
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let svgContent = svg;
      if (isUrl(svg)) {
        svgContent = await fetchSvg(svg);
      }
      const wasm = await initWasm();
      const modeValue = shapeModeMap2[mode];
      const wasmResult = wasm.generate_clippath_with_color(
        svgContent,
        modeValue,
        offset,
        resolution,
        simplify,
        iconStyle === "emboss",
        // include_icon
        shapeColor
      );
      if (!wasmResult.success) {
        throw new Error(wasmResult.error || "Generation failed");
      }
      setResult(wasmResult);
      onLoad?.(wasmResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [svg, mode, shapeColor, iconStyle, offset, resolution, simplify, onLoad, onError]);
  useEffect2(() => {
    generate();
  }, [generate]);
  const computedWidth = size ?? width ?? 120;
  const computedHeight = size ?? height ?? 120;
  const shouldAnimate = animateOnHover ? isHovering : true;
  const animationStyle = shouldAnimate ? getAnimationStyle(animationOptions) : "none";
  const containerStyle = {
    width: typeof computedWidth === "number" ? `${computedWidth}px` : computedWidth,
    height: typeof computedHeight === "number" ? `${computedHeight}px` : computedHeight,
    display: "inline-block",
    position: "relative",
    cursor: onClick ? "pointer" : void 0,
    animation: animationStyle,
    ...style
  };
  const handleMouseEnter = animateOnHover ? () => setIsHovering(true) : void 0;
  const handleMouseLeave = animateOnHover ? () => setIsHovering(false) : void 0;
  if (isLoading) {
    return /* @__PURE__ */ jsx3(
      "div",
      {
        className,
        style: {
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          borderRadius: "50%"
        },
        children: /* @__PURE__ */ jsx3(LoadingSpinner, {})
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsx3(
      "div",
      {
        className,
        style: {
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fee",
          borderRadius: "8px",
          color: "#c00",
          fontSize: "12px",
          padding: "8px",
          textAlign: "center"
        },
        children: error
      }
    );
  }
  if (!result?.emboss_svg) {
    return null;
  }
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className,
      style: containerStyle,
      onClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      dangerouslySetInnerHTML: { __html: result.emboss_svg }
    }
  );
}
function LoadingSpinner() {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      style: {
        animation: "spin 1s linear infinite"
      },
      children: [
        /* @__PURE__ */ jsx3("style", { children: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }),
        /* @__PURE__ */ jsx3(
          "circle",
          {
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "#ccc",
            strokeWidth: "3",
            fill: "none",
            strokeDasharray: "31.4 31.4",
            strokeLinecap: "round"
          }
        )
      ]
    }
  );
}

// src/useIconCraft.ts
import { useState as useState3, useEffect as useEffect3, useCallback as useCallback2 } from "react";
var wasmModule2 = null;
var wasmInitPromise2 = null;
async function initWasm2() {
  if (wasmModule2) return wasmModule2;
  if (wasmInitPromise2) return wasmInitPromise2;
  wasmInitPromise2 = (async () => {
    const wasm = await import("gospelo-iconcraft-wasm");
    await wasm.default();
    wasmModule2 = wasm;
    return wasm;
  })();
  return wasmInitPromise2;
}
var shapeModeMap3 = {
  jelly: 0,
  droplet: 1,
  wax: 2
};
function isUrl2(str) {
  return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");
}
async function fetchSvg2(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${response.status}`);
  }
  return response.text();
}
function useIconCraft(options) {
  const {
    svg,
    mode = "wax",
    shapeColor = "#6366f1",
    iconStyle = "emboss",
    offset = 20,
    resolution = 256,
    simplify = 2,
    autoGenerate = true
  } = options;
  const [result, setResult] = useState3(null);
  const [isLoading, setIsLoading] = useState3(false);
  const [error, setError] = useState3(null);
  const [svgContent, setSvgContent] = useState3(null);
  const reset = useCallback2(() => {
    setResult(null);
    setError(null);
    setSvgContent(null);
  }, []);
  const generate = useCallback2(async () => {
    if (!svg) {
      setError("SVG content is required");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let content = svg;
      if (isUrl2(svg)) {
        content = await fetchSvg2(svg);
      }
      setSvgContent(content);
      const wasm = await initWasm2();
      const modeValue = shapeModeMap3[mode];
      const wasmResult = wasm.generate_clippath_with_color(
        content,
        modeValue,
        offset,
        resolution,
        simplify,
        iconStyle === "emboss",
        shapeColor
      );
      if (!wasmResult.success) {
        throw new Error(wasmResult.error || "Generation failed");
      }
      setResult(wasmResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [svg, mode, shapeColor, iconStyle, offset, resolution, simplify]);
  useEffect3(() => {
    if (autoGenerate && svg) {
      generate();
    }
  }, [autoGenerate, generate, svg]);
  return {
    result,
    isLoading,
    error,
    svgContent,
    generate,
    reset
  };
}
function useLegacyIconCraft(options) {
  const {
    svgContent,
    mode = "jelly",
    baseColor = "#6366f1",
    offset = 5,
    resolution = 256,
    simplifyEpsilon = 0.5
  } = options;
  const { result, isLoading, error, generate } = useIconCraft({
    svg: svgContent,
    mode,
    shapeColor: baseColor,
    offset,
    resolution,
    simplify: simplifyEpsilon,
    iconStyle: "emboss"
  });
  return { result, isLoading, error, generate };
}

// src/IconCraft.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function IconCraft({
  svgContent,
  mode = "jelly",
  baseColor = "#6366f1",
  offset = 5,
  resolution = 256,
  simplifyEpsilon = 0.5,
  showShadow: _showShadow = true,
  showHighlight: _showHighlight = true,
  className,
  style
}) {
  const { result, isLoading, error } = useIconCraft({
    svg: svgContent,
    mode,
    shapeColor: baseColor,
    offset,
    resolution,
    simplify: simplifyEpsilon
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx4("div", { className, style, children: "Loading..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs3("div", { className, style, children: [
      "Error: ",
      error
    ] });
  }
  if (!result?.emboss_svg) {
    return null;
  }
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className,
      style: {
        ...style,
        width: "100%",
        height: "100%"
      },
      dangerouslySetInnerHTML: { __html: result.emboss_svg }
    }
  );
}

// src/context/IconCraftProvider.tsx
import {
  createContext,
  useContext,
  useReducer,
  useCallback as useCallback3,
  useMemo as useMemo4,
  useRef
} from "react";

// src/context/IconCraftDispatcher.ts
function createDispatcher() {
  const subscriptions = /* @__PURE__ */ new Set();
  const dispatch = (event) => {
    for (const sub of subscriptions) {
      if (sub.filter !== "*" && sub.filter !== event.id) {
        continue;
      }
      if (sub.eventTypes !== "*" && !sub.eventTypes.has(event.type)) {
        continue;
      }
      try {
        sub.handler(event);
      } catch (err) {
        console.error("[IconCraft] Event handler error:", err);
      }
    }
  };
  const subscribe = (filter, eventType, handler) => {
    const eventTypes = eventType === "*" ? "*" : new Set(Array.isArray(eventType) ? eventType : [eventType]);
    const subscription = {
      filter,
      eventTypes,
      handler
    };
    subscriptions.add(subscription);
    return () => {
      subscriptions.delete(subscription);
    };
  };
  return { dispatch, subscribe };
}

// src/context/types.ts
var DEFAULT_METADATA = {
  x: 0,
  y: 0,
  zIndex: 0
};

// src/context/IconCraftProvider.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var IconCraftContext = createContext(null);
function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const newInstances = new Map(state.instances);
      const newMetadata = new Map(state.metadata);
      newInstances.set(action.id, action.instance);
      newMetadata.set(action.id, action.metadata);
      return { ...state, instances: newInstances, metadata: newMetadata };
    }
    case "REMOVE": {
      const newInstances = new Map(state.instances);
      const newMetadata = new Map(state.metadata);
      const newSelection = new Set(state.selection);
      newInstances.delete(action.id);
      newMetadata.delete(action.id);
      newSelection.delete(action.id);
      return { instances: newInstances, metadata: newMetadata, selection: newSelection };
    }
    case "UPDATE_METADATA": {
      const existing = state.metadata.get(action.id);
      if (!existing) return state;
      const newMetadata = new Map(state.metadata);
      newMetadata.set(action.id, { ...existing, ...action.changes });
      return { ...state, metadata: newMetadata };
    }
    case "SELECT": {
      if (state.selection.has(action.id)) return state;
      const newSelection = new Set(state.selection);
      newSelection.add(action.id);
      return { ...state, selection: newSelection };
    }
    case "DESELECT": {
      if (!state.selection.has(action.id)) return state;
      const newSelection = new Set(state.selection);
      newSelection.delete(action.id);
      return { ...state, selection: newSelection };
    }
    case "TOGGLE_SELECT": {
      const newSelection = new Set(state.selection);
      if (newSelection.has(action.id)) {
        newSelection.delete(action.id);
      } else {
        newSelection.add(action.id);
      }
      return { ...state, selection: newSelection };
    }
    case "CLEAR_SELECTION": {
      if (state.selection.size === 0) return state;
      return { ...state, selection: /* @__PURE__ */ new Set() };
    }
    case "CLEAR_ALL": {
      return {
        instances: /* @__PURE__ */ new Map(),
        metadata: /* @__PURE__ */ new Map(),
        selection: /* @__PURE__ */ new Set()
      };
    }
    default:
      return state;
  }
}
var initialState = {
  instances: /* @__PURE__ */ new Map(),
  metadata: /* @__PURE__ */ new Map(),
  selection: /* @__PURE__ */ new Set()
};
function IconCraftProvider({
  children,
  defaultConfig = {}
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatcherRef = useRef(null);
  if (!dispatcherRef.current) {
    dispatcherRef.current = createDispatcher();
  }
  const dispatcher = dispatcherRef.current;
  const zIndexRef = useRef(0);
  const factory = useMemo4(
    () => new IconCraftFactory(defaultConfig),
    [defaultConfig]
  );
  const create = useCallback3(
    (svg, config, metadataOverrides) => {
      const instance = config ? factory.create(svg, config) : factory.create(svg);
      const id = instance.id;
      zIndexRef.current += 1;
      const metadata = {
        ...DEFAULT_METADATA,
        zIndex: zIndexRef.current,
        ...metadataOverrides
      };
      dispatch({ type: "ADD", id, instance, metadata });
      dispatcher.dispatch({ type: "created", id, instance });
      return id;
    },
    [factory, dispatcher]
  );
  const remove = useCallback3(
    (id) => {
      if (!state.instances.has(id)) return false;
      dispatch({ type: "REMOVE", id });
      dispatcher.dispatch({ type: "removed", id });
      return true;
    },
    [state.instances, dispatcher]
  );
  const getById = useCallback3(
    (id) => state.instances.get(id),
    [state.instances]
  );
  const getAll = useCallback3(
    () => Array.from(state.instances.values()),
    [state.instances]
  );
  const getMetadata = useCallback3(
    (id) => state.metadata.get(id),
    [state.metadata]
  );
  const updateMetadata = useCallback3(
    (id, changes) => {
      dispatch({ type: "UPDATE_METADATA", id, changes });
      dispatcher.dispatch({ type: "metadata", id, changes });
      if (changes.x !== void 0 || changes.y !== void 0) {
        const meta = state.metadata.get(id);
        if (meta) {
          dispatcher.dispatch({
            type: "move",
            id,
            x: changes.x ?? meta.x,
            y: changes.y ?? meta.y
          });
        }
      }
      if (changes.zIndex !== void 0) {
        dispatcher.dispatch({ type: "zIndex", id, zIndex: changes.zIndex });
      }
    },
    [state.metadata, dispatcher]
  );
  const select = useCallback3(
    (id) => {
      dispatch({ type: "SELECT", id });
      dispatcher.dispatch({ type: "select", id });
    },
    [dispatcher]
  );
  const deselect = useCallback3(
    (id) => {
      dispatch({ type: "DESELECT", id });
      dispatcher.dispatch({ type: "deselect", id });
    },
    [dispatcher]
  );
  const toggleSelect = useCallback3(
    (id) => {
      const wasSelected = state.selection.has(id);
      dispatch({ type: "TOGGLE_SELECT", id });
      dispatcher.dispatch({ type: wasSelected ? "deselect" : "select", id });
    },
    [state.selection, dispatcher]
  );
  const clearSelection = useCallback3(() => {
    for (const id of state.selection) {
      dispatcher.dispatch({ type: "deselect", id });
    }
    dispatch({ type: "CLEAR_SELECTION" });
  }, [state.selection, dispatcher]);
  const getSelected = useCallback3(
    () => Array.from(state.selection),
    [state.selection]
  );
  const isSelected = useCallback3(
    (id) => state.selection.has(id),
    [state.selection]
  );
  const clear = useCallback3(() => {
    for (const id of state.instances.keys()) {
      dispatcher.dispatch({ type: "removed", id });
    }
    dispatch({ type: "CLEAR_ALL" });
  }, [state.instances, dispatcher]);
  const contextValue = useMemo4(
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
        clear
      },
      dispatcher,
      defaultConfig
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
      defaultConfig
    ]
  );
  return /* @__PURE__ */ jsx5(IconCraftContext.Provider, { value: contextValue, children });
}
function useIconCraftContext() {
  const context = useContext(IconCraftContext);
  if (!context) {
    throw new Error("useIconCraftContext must be used within IconCraftProvider");
  }
  return context;
}

// src/context/hooks.ts
import { useCallback as useCallback4, useEffect as useEffect4, useMemo as useMemo5 } from "react";
function useIconCraftStore() {
  const { actions, state } = useIconCraftContext();
  return useMemo5(
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
      ids: Array.from(state.instances.keys())
    }),
    [actions, state.instances]
  );
}
function useIconCraft2(id) {
  const { actions, state } = useIconCraftContext();
  const instance = state.instances.get(id);
  const metadata = state.metadata.get(id);
  const isSelected = state.selection.has(id);
  const remove = useCallback4(() => actions.remove(id), [actions, id]);
  const updateMetadata = useCallback4(
    (changes) => actions.updateMetadata(id, changes),
    [actions, id]
  );
  const select = useCallback4(() => actions.select(id), [actions, id]);
  const deselect = useCallback4(() => actions.deselect(id), [actions, id]);
  const toggleSelect = useCallback4(() => actions.toggleSelect(id), [actions, id]);
  const move = useCallback4(
    (x, y) => actions.updateMetadata(id, { x, y }),
    [actions, id]
  );
  const setZIndex = useCallback4(
    (zIndex) => actions.updateMetadata(id, { zIndex }),
    [actions, id]
  );
  return useMemo5(
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
      setZIndex
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
      setZIndex
    ]
  );
}
function useIconCraftSelection() {
  const { actions, state } = useIconCraftContext();
  const selected = useMemo5(
    () => Array.from(state.selection),
    [state.selection]
  );
  const selectAll = useCallback4(() => {
    for (const id of state.instances.keys()) {
      actions.select(id);
    }
  }, [state.instances, actions]);
  const getSelectedInstances = useCallback4(() => {
    return selected.map((id) => state.instances.get(id)).filter((inst) => inst !== void 0);
  }, [selected, state.instances]);
  return useMemo5(
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
      getSelectedInstances
    }),
    [selected, actions, selectAll, getSelectedInstances]
  );
}
function useIconCraftEvent(filter, eventType, handler) {
  const { dispatcher } = useIconCraftContext();
  useEffect4(() => {
    const unsubscribe = dispatcher.subscribe(filter, eventType, handler);
    return unsubscribe;
  }, [dispatcher, filter, eventType, handler]);
}
function useIconCraftCreate(options = {}) {
  const { actions } = useIconCraftContext();
  const { config, metadata, autoSelect = false } = options;
  return useCallback4(
    (svg, overrides) => {
      const id = actions.create(svg, { ...config, ...overrides }, metadata);
      if (autoSelect) {
        actions.select(id);
      }
      return id;
    },
    [actions, config, metadata, autoSelect]
  );
}

// src/utils/backup.ts
var BACKUP_VERSION = "1.0.0";
function createBackup(icons, options) {
  return {
    version: BACKUP_VERSION,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    license: options?.license,
    licenseUrl: options?.licenseUrl,
    icons,
    settings: options?.settings
  };
}
function downloadBackup(backup, filename) {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `iconcraft-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function exportBackup(backup) {
  return JSON.stringify(backup, null, 2);
}
function validateBackup(data) {
  const errors = [];
  const warnings = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid backup format"], warnings: [] };
  }
  const backup = data;
  if (!backup.version) {
    errors.push("Missing version field");
  } else if (backup.version !== BACKUP_VERSION) {
    warnings.push(`Version mismatch: expected ${BACKUP_VERSION}, got ${backup.version}`);
  }
  if (!Array.isArray(backup.icons)) {
    errors.push("Missing or invalid icons array");
  } else {
    backup.icons.forEach((icon, index) => {
      if (!icon.svg) {
        errors.push(`Icon ${index}: missing svg field`);
      }
      if (!icon.mode) {
        warnings.push(`Icon ${index}: missing mode, will use default`);
      }
      if (!icon.shapeColor) {
        warnings.push(`Icon ${index}: missing shapeColor, will use default`);
      }
    });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
function parseBackup(json) {
  try {
    const data = JSON.parse(json);
    const validation = validateBackup(data);
    if (!validation.valid) {
      console.error("Backup validation failed:", validation.errors);
      return null;
    }
    if (validation.warnings.length > 0) {
      console.warn("Backup warnings:", validation.warnings);
    }
    return data;
  } catch (e) {
    console.error("Failed to parse backup:", e);
    return null;
  }
}
function loadBackupFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result;
      resolve(parseBackup(json));
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      resolve(null);
    };
    reader.readAsText(file);
  });
}
export {
  BACKUP_VERSION,
  DEFAULT_CONFIG,
  DEFAULT_METADATA,
  IconCraft,
  IconCraftConfig,
  IconCraftFactory,
  IconCraftInstance,
  IconCraftProvider,
  IconCraftRegistry,
  IconCraftShape,
  IconCraftSimple,
  IconCraftView,
  WasmManager,
  animationDefaults,
  createBackup,
  createDispatcher,
  defaultFactory,
  downloadBackup,
  exportBackup,
  generateIconId,
  getAnimationDefaults,
  getAnimationName,
  getAnimationStyle,
  getCustomAnimation,
  getKeyframes,
  getTimestampFromId,
  getTransformOrigin,
  globalRegistry,
  injectKeyframes,
  keyframes,
  loadBackupFromFile,
  parseAnimationOptions,
  parseBackup,
  registerAnimation,
  useIconCraft,
  useIconCraftContext,
  useIconCraftCreate,
  useIconCraftEvent,
  useIconCraft2 as useIconCraftInstance,
  useIconCraftSelection,
  useIconCraftStore,
  useLegacyIconCraft,
  validateBackup
};
