import {
  IconCraftFactory,
  IconCraftInstance,
  WasmManager,
  createBackup,
  dialPresets,
  downloadBackup,
  loadBackupFromFile,
  registerAnimation,
  reticlePresets,
  type AnimationType,
  type DialPresetName,
  type IconBackupData,
  type IconStyle,
  type ReticlePresetName,
  type ShapeMode,
} from "gospelo-iconcraft-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DraggableIcon } from "./DraggableIcon";
import {
  CatalogPanel,
  useCatalog,
  type CatalogSource,
  type IconCatalogIcon,
} from "./features/catalog";

// カスタムアニメーションを登録（アイコンだけ回転）
registerAnimation("rotateIcon", {
  keyframes: `
    @keyframes iconcraft-rotateIcon {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  defaults: {
    duration: 2,
    iterationCount: "infinite",
    timingFunction: "linear",
  },
  transformOrigin: "icon", // アイコンの中心を基準に回転
});

// デフォルトのカタログソース
const DEFAULT_CATALOG_SOURCES: CatalogSource[] = [
  {
    id: "twemoji",
    name: "Twemoji",
    url: "/api/icons/v1/twemoji/index.json",
  },
];

const MODES: ShapeMode[] = ["sticker", "jelly", "bubble", "wax"];
const ICON_STYLES: IconStyle[] = ["original", "emboss", "stroke", "fill"];

// 仮想座標空間（base coordinates）
const ICON_BASE_WIDTH = 600;
const ICON_BASE_HEIGHT = 400;

interface IconItem {
  id: string;
  instance: IconCraftInstance;
  x: number;
  y: number;
  zIndex: number;
  size: number;
  rotation: number;
  animation?: AnimationType;
}

export default function App() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: ICON_BASE_WIDTH,
    height: ICON_BASE_HEIGHT,
  });

  // ResizeObserver でキャンバスサイズを追跡
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  const scaleX = containerSize.width / ICON_BASE_WIDTH;
  const scaleY = containerSize.height / ICON_BASE_HEIGHT;

  // 設定パネル用
  const [selectedMode, setSelectedMode] = useState<ShapeMode>("sticker");
  const [selectedIconStyle, setSelectedIconStyle] =
    useState<IconStyle>("original");
  const [selectedShapeColor, setSelectedShapeColor] = useState("#ffffff");
  const [selectedIconColor, setSelectedIconColor] = useState("#1d1d1f");
  const [selectedSize, setSelectedSize] = useState(80);
  const [selectedAnimation, setSelectedAnimation] = useState<
    AnimationType | undefined
  >(undefined);
  const [selectedDialPreset, setSelectedDialPreset] =
    useState<DialPresetName>("dotted");
  const [selectedReticlePreset, setSelectedReticlePreset] = useState<
    ReticlePresetName | "none"
  >("none");
  const [previewRotation, setPreviewRotation] = useState<number | null>(null);

  // Icon Catalog
  const catalogState = useCatalog({
    initialSources: DEFAULT_CATALOG_SOURCES,
  });

  // カタログからアイコン追加（または選択中アイコンを更新）
  const addIconFromCatalog = (icon: IconCatalogIcon) => {
    const svgUrl = icon.url;

    console.log("Adding icon from catalog:", {
      icon,
      svgUrl,
      selectedMode,
      selectedIconStyle,
      selectedShapeColor,
      selectedSize,
    });

    // キャッシュをクリアして新しい設定で生成
    WasmManager.clearCache();

    // 選択中のアイコンがある場合は、そのアイコンのSVGを更新
    if (selectedId) {
      const icon = icons.find((i) => i.id === selectedId);
      if (icon) {
        const newFactory = new IconCraftFactory({
          mode: icon.instance.config.mode,
          iconStyle: icon.instance.config.iconStyle,
          iconColor: icon.instance.config.iconColor,
          shapeColor: icon.instance.config.shapeColor,
          size: icon.size,
          rotation: icon.instance.config.rotation,
        });
        const newInstance = newFactory.create(svgUrl);

        setIcons((prev) =>
          prev.map((i) =>
            i.id === selectedId ? { ...i, instance: newInstance } : i,
          ),
        );
        return;
      }
    }

    // 選択中のアイコンがない場合は新規追加
    const currentFactory = new IconCraftFactory({
      mode: selectedMode,
      iconStyle: selectedIconStyle,
      iconColor: selectedIconColor,
      shapeColor: selectedShapeColor,
      size: selectedSize,
    });
    const instance = currentFactory.create(svgUrl);

    // デバッグ：インスタンスの設定を確認
    console.log("Instance config:", {
      mode: instance.config.mode,
      iconStyle: instance.config.iconStyle,
      shapeColor: instance.config.shapeColor,
      size: instance.config.size,
    });

    const newIcon: IconItem = {
      id: `icon-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      instance,
      x: 100 + Math.random() * 400,
      y: 60 + Math.random() * 280,
      zIndex: nextZIndex,
      size: selectedSize,
      rotation: 0,
      animation: selectedAnimation,
    };

    setIcons((prev) => [...prev, newIcon]);
    setNextZIndex((prev) => prev + 1);
    setSelectedId(newIcon.id);
  };

  // すべてクリア
  const clearAll = useCallback(() => {
    setIcons([]);
    setSelectedId(null);
    setNextZIndex(1);
    WasmManager.clearCache();
  }, []);

  // 選択
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      // 選択したアイコンを最前面に
      setIcons((prev) =>
        prev.map((icon) =>
          icon.id === id ? { ...icon, zIndex: nextZIndex } : icon,
        ),
      );
      setNextZIndex((prev) => prev + 1);

      // 選択したアイコンの設定をパネルに反映
      const icon = icons.find((i) => i.id === id);
      if (icon) {
        setSelectedMode(icon.instance.config.mode);
        setSelectedIconStyle(icon.instance.config.iconStyle);
        setSelectedIconColor(icon.instance.config.iconColor);
        setSelectedShapeColor(icon.instance.config.shapeColor);
        setSelectedSize(icon.size);
        setSelectedAnimation(icon.animation);
      }
    },
    [nextZIndex, icons],
  );

  // 位置更新
  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      setIcons((prev) =>
        prev.map((icon) => (icon.id === id ? { ...icon, x, y } : icon)),
      );
    },
    [],
  );

  // ドロップ時の処理（ゴミ箱エリアに入ったら削除）
  const handleDrop = useCallback(
    (id: string, clientX: number, clientY: number) => {
      setDraggingId(null);
      if (trashRef.current) {
        const rect = trashRef.current.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          // ゴミ箱エリア内にドロップ → 削除
          setIcons((prev) => prev.filter((icon) => icon.id !== id));
          if (selectedId === id) {
            setSelectedId(null);
          }
        }
      }
    },
    [selectedId],
  );

  // ドラッグ開始
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  // 選択中のアイコン
  const selectedIcon = icons.find((icon) => icon.id === selectedId);

  // 選択中のアイコンのサイズを更新
  const updateSelectedSize = useCallback(
    (size: number) => {
      if (!selectedId) return;
      setIcons((prev) =>
        prev.map((icon) => (icon.id === selectedId ? { ...icon, size } : icon)),
      );
    },
    [selectedId],
  );

  // 選択中のアイコンのアニメーションを更新
  const updateSelectedAnimation = useCallback(
    (animation: AnimationType | undefined) => {
      if (!selectedId) return;
      setIcons((prev) =>
        prev.map((icon) =>
          icon.id === selectedId ? { ...icon, animation } : icon,
        ),
      );
    },
    [selectedId],
  );

  // 選択中のアイコンの回転を更新（再生成）
  const updateSelectedRotation = useCallback(
    (deg: number) => {
      if (!selectedId) return;
      const icon = icons.find((i) => i.id === selectedId);
      if (!icon) return;

      WasmManager.clearCache();
      const newFactory = new IconCraftFactory({
        mode: icon.instance.config.mode,
        iconStyle: icon.instance.config.iconStyle,
        iconColor: icon.instance.config.iconColor,
        shapeColor: icon.instance.config.shapeColor,
        size: icon.size,
        rotation: deg,
      });
      const newInstance = newFactory.create(icon.instance.svg);
      setIcons((prev) =>
        prev.map((i) =>
          i.id === selectedId
            ? { ...i, instance: newInstance, rotation: deg }
            : i,
        ),
      );
    },
    [selectedId, icons],
  );

  // 選択中のアイコンの色を更新（再生成）
  const updateSelectedShapeColor = useCallback(
    (color: string) => {
      if (!selectedId) return;

      const icon = icons.find((i) => i.id === selectedId);
      if (!icon) return;

      // キャッシュをクリアして新しい設定で再生成
      WasmManager.clearCache();

      const newFactory = new IconCraftFactory({
        mode: icon.instance.config.mode,
        iconStyle: icon.instance.config.iconStyle,
        iconColor: icon.instance.config.iconColor,
        shapeColor: color,
        size: icon.size,
        rotation: icon.instance.config.rotation,
      });
      const newInstance = newFactory.create(icon.instance.svg);

      setIcons((prev) =>
        prev.map((i) =>
          i.id === selectedId ? { ...i, instance: newInstance } : i,
        ),
      );
    },
    [selectedId, icons],
  );

  // 選択中のアイコンのスタイルを更新（再生成）
  const updateSelectedIconStyle = useCallback(
    (iconStyle: IconStyle) => {
      if (!selectedId) return;

      const icon = icons.find((i) => i.id === selectedId);
      if (!icon) return;

      // キャッシュをクリアして新しい設定で再生成
      WasmManager.clearCache();

      const newFactory = new IconCraftFactory({
        mode: icon.instance.config.mode,
        iconStyle: iconStyle,
        iconColor: icon.instance.config.iconColor,
        shapeColor: icon.instance.config.shapeColor,
        size: icon.size,
        rotation: icon.instance.config.rotation,
      });
      const newInstance = newFactory.create(icon.instance.svg);

      setIcons((prev) =>
        prev.map((i) =>
          i.id === selectedId ? { ...i, instance: newInstance } : i,
        ),
      );
    },
    [selectedId, icons],
  );

  // 選択中のアイコンのモードを更新（再生成）
  const updateSelectedMode = useCallback(
    (mode: ShapeMode) => {
      if (!selectedId) return;

      const icon = icons.find((i) => i.id === selectedId);
      if (!icon) return;

      // キャッシュをクリアして新しい設定で再生成
      WasmManager.clearCache();

      const newFactory = new IconCraftFactory({
        mode: mode,
        iconStyle: icon.instance.config.iconStyle,
        iconColor: icon.instance.config.iconColor,
        shapeColor: icon.instance.config.shapeColor,
        size: icon.size,
        rotation: icon.instance.config.rotation,
      });
      const newInstance = newFactory.create(icon.instance.svg);

      setIcons((prev) =>
        prev.map((i) =>
          i.id === selectedId ? { ...i, instance: newInstance } : i,
        ),
      );
    },
    [selectedId, icons],
  );

  // 選択中のアイコンのiconColorを更新（再生成）
  const updateSelectedIconColor = useCallback(
    (newIconColor: string) => {
      if (!selectedId) return;

      const icon = icons.find((i) => i.id === selectedId);
      if (!icon) return;

      WasmManager.clearCache();

      const newFactory = new IconCraftFactory({
        mode: icon.instance.config.mode,
        iconStyle: icon.instance.config.iconStyle,
        iconColor: newIconColor,
        shapeColor: icon.instance.config.shapeColor,
        size: icon.size,
        rotation: icon.instance.config.rotation,
      });
      const newInstance = newFactory.create(icon.instance.svg);

      setIcons((prev) =>
        prev.map((i) =>
          i.id === selectedId ? { ...i, instance: newInstance } : i,
        ),
      );
    },
    [selectedId, icons],
  );

  // バックアップをダウンロード
  const handleBackup = useCallback(() => {
    const backupData: IconBackupData[] = icons.map((icon) => ({
      svg: icon.instance.svg,
      mode: icon.instance.config.mode,
      iconStyle: icon.instance.config.iconStyle,
      iconColor: icon.instance.config.iconColor,
      shapeColor: icon.instance.config.shapeColor,
      size: icon.size,
      x: icon.x,
      y: icon.y,
      zIndex: icon.zIndex,
      animation: icon.animation,
    }));

    const backup = createBackup(backupData, {
      settings: {
        defaultMode: selectedMode,
        defaultIconStyle: selectedIconStyle,
        defaultShapeColor: selectedShapeColor,
        defaultSize: selectedSize,
      },
    });

    downloadBackup(backup);
  }, [
    icons,
    selectedMode,
    selectedIconStyle,
    selectedShapeColor,
    selectedSize,
  ]);

  // バックアップから復元
  const handleRestore = useCallback(async (file: File) => {
    const backup = await loadBackupFromFile(file);
    if (!backup) {
      alert("Failed to load backup file");
      return;
    }

    // 既存のアイコンをクリア
    WasmManager.clearCache();

    // バックアップからアイコンを復元
    const restoredIcons: IconItem[] = backup.icons.map((data, index) => {
      const factory = new IconCraftFactory({
        mode: data.mode || "jelly",
        iconStyle: data.iconStyle || "original",
        iconColor: data.iconColor || "#1d1d1f",
        shapeColor: data.shapeColor || "#ffffff",
        size: data.size || 80,
      });
      const instance = factory.create(data.svg);

      return {
        id: `icon-${Date.now()}-${index}`,
        instance,
        x: data.x ?? 100 + Math.random() * 400,
        y: data.y ?? 60 + Math.random() * 280,
        zIndex: data.zIndex ?? index + 1,
        size: data.size || 80,
        rotation: data.rotation ?? 0,
        animation: data.animation,
      };
    });

    setIcons(restoredIcons);
    setNextZIndex(restoredIcons.length + 1);
    setSelectedId(null);

    // 設定を復元
    if (backup.settings) {
      if (backup.settings.defaultMode)
        setSelectedMode(backup.settings.defaultMode);
      if (backup.settings.defaultIconStyle)
        setSelectedIconStyle(backup.settings.defaultIconStyle);
      if (backup.settings.defaultShapeColor)
        setSelectedShapeColor(backup.settings.defaultShapeColor);
      if (backup.settings.defaultSize)
        setSelectedSize(backup.settings.defaultSize);
    }
  }, []);

  // ファイル入力のref
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* サイドパネル */}
      <div
        style={{
          width: 260,
          background: "#fff",
          borderLeft: "1px solid #e5e5e5",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          order: 2,
          overflowY: "auto",
        }}
      >
        <h1
          style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: 0 }}
        >
          IconCraft Demo
        </h1>

        {/* Mode選択 */}
        <div>
          <label
            style={{
              fontSize: 11,
              color: "#86868b",
              display: "block",
              marginBottom: 4,
            }}
          >
            Mode
          </label>
          <div style={{ display: "flex", gap: 4 }}>
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setSelectedMode(mode);
                  if (selectedIcon) {
                    updateSelectedMode(mode);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  border:
                    selectedMode === mode
                      ? "2px solid #0071e3"
                      : "1px solid #d2d2d7",
                  borderRadius: 6,
                  background: selectedMode === mode ? "#e8f4fd" : "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: selectedMode === mode ? 600 : 400,
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Style選択 */}
        <div>
          <label
            style={{
              fontSize: 11,
              color: "#86868b",
              display: "block",
              marginBottom: 4,
            }}
          >
            Icon Style
          </label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {ICON_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => {
                  setSelectedIconStyle(style);
                  if (selectedIcon) {
                    updateSelectedIconStyle(style);
                  }
                }}
                style={{
                  flex: "1 1 45%",
                  padding: "5px 8px",
                  border:
                    selectedIconStyle === style
                      ? "2px solid #0071e3"
                      : "1px solid #d2d2d7",
                  borderRadius: 6,
                  background: selectedIconStyle === style ? "#e8f4fd" : "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: selectedIconStyle === style ? 600 : 400,
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* 色選択 (横並び) */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: "#86868b",
                display: "block",
                marginBottom: 4,
              }}
            >
              Shape Color
            </label>
            <input
              type="color"
              value={selectedShapeColor}
              onChange={(e) => {
                setSelectedShapeColor(e.target.value);
                if (selectedIcon) {
                  updateSelectedShapeColor(e.target.value);
                }
              }}
              style={{
                width: "100%",
                height: 30,
                border: "1px solid #d2d2d7",
                borderRadius: 6,
                cursor: "pointer",
                padding: 2,
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: "#86868b",
                display: "block",
                marginBottom: 4,
              }}
            >
              Icon Color
            </label>
            <input
              type="color"
              value={selectedIconColor}
              onChange={(e) => {
                setSelectedIconColor(e.target.value);
                if (selectedIcon) {
                  updateSelectedIconColor(e.target.value);
                }
              }}
              style={{
                width: "100%",
                height: 30,
                border: "1px solid #d2d2d7",
                borderRadius: 6,
                cursor: "pointer",
                padding: 2,
              }}
              disabled={
                selectedIconStyle !== "stroke" && selectedIconStyle !== "fill"
              }
            />
          </div>
        </div>

        {/* Size & Rotate (横並び) */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: selectedIcon ? "#0071e3" : "#86868b",
                display: "block",
                marginBottom: 4,
              }}
            >
              Size: {selectedIcon ? selectedIcon.size : selectedSize}px
            </label>
            <input
              type="range"
              min={30}
              max={200}
              value={selectedIcon ? selectedIcon.size : selectedSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (selectedIcon) {
                  updateSelectedSize(size);
                } else {
                  setSelectedSize(size);
                }
              }}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: selectedIcon ? "#0071e3" : "#86868b",
                display: "block",
                marginBottom: 4,
              }}
            >
              Rotate: {previewRotation ?? (selectedIcon?.rotation ?? 0)}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={previewRotation ?? (selectedIcon?.rotation ?? 0)}
              onChange={(e) => setPreviewRotation(Number(e.target.value))}
              onMouseUp={() => {
                if (selectedIcon && previewRotation != null) {
                  updateSelectedRotation(previewRotation);
                  setPreviewRotation(null);
                }
              }}
              onTouchEnd={() => {
                if (selectedIcon && previewRotation != null) {
                  updateSelectedRotation(previewRotation);
                  setPreviewRotation(null);
                }
              }}
              disabled={!selectedIcon}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Animation */}
        <div>
          <label
            style={{
              fontSize: 11,
              color: selectedIcon ? "#0071e3" : "#86868b",
              display: "block",
              marginBottom: 4,
            }}
          >
            Animation
          </label>
          <select
            value={
              selectedIcon
                ? (selectedIcon.animation ?? "")
                : (selectedAnimation ?? "")
            }
            onChange={(e) => {
              const anim = (e.target.value as AnimationType) || undefined;
              if (selectedIcon) {
                updateSelectedAnimation(anim);
              } else {
                setSelectedAnimation(anim);
              }
            }}
            style={{
              width: "100%",
              padding: "4px 6px",
              border: "1px solid #d2d2d7",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <option value="">None</option>
            <optgroup label="Loop">
              <option value="float">Float (ふわふわ)</option>
              <option value="pulse">Pulse (脈動)</option>
              <option value="bounce">Bounce (バウンス)</option>
              <option value="heartbeat">Heartbeat (心拍)</option>
              <option value="squish">Squish (ぷにょん)</option>
              <option value="wiggle">Wiggle (揺れ)</option>
              <option value="breathe">Breathe (呼吸)</option>
            </optgroup>
            <optgroup label="Once">
              <option value="shake">Shake (震え)</option>
              <option value="jello">Jello (ゼリー)</option>
              <option value="wobble">Wobble (よろめき)</option>
              <option value="rubberBand">RubberBand (ゴム)</option>
              <option value="swing">Swing (振り子)</option>
              <option value="tada">Tada (注目)</option>
              <option value="flip">Flip (裏返し)</option>
              <option value="drop">Drop (落下)</option>
              <option value="pop">Pop (出現)</option>
            </optgroup>
            <optgroup label="Custom">
              <option value="rotateIcon">Rotate Icon (アイコン回転)</option>
            </optgroup>
          </select>
        </div>

        {/* Dial Style & Reticle */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: "#86868b",
                display: "block",
                marginBottom: 2,
              }}
            >
              Dial Style
            </label>
            <select
              value={selectedDialPreset}
              onChange={(e) =>
                setSelectedDialPreset(e.target.value as DialPresetName)
              }
              style={{
                width: "100%",
                padding: "4px 6px",
                border: "1px solid #d2d2d7",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <option value="dotted">Dotted (ドット)</option>
              <option value="dashed">Dashed (破線)</option>
              <option value="solid">Solid (実線)</option>
              <option value="ticks">Ticks (目盛)</option>
              <option value="double">Double (二重)</option>
              <option value="crosshair">Crosshair (十字)</option>
              <option value="minimal">Minimal (最小)</option>
              <option value="needle">Needle (針)</option>
              <option value="bar">Bar (バー)</option>
              <option value="arrow">Arrow (矢印)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: "#86868b",
                display: "block",
                marginBottom: 2,
              }}
            >
              Reticle
            </label>
            <select
              value={selectedReticlePreset}
              onChange={(e) =>
                setSelectedReticlePreset(
                  e.target.value as ReticlePresetName | "none",
                )
              }
              style={{
                width: "100%",
                padding: "4px 6px",
                border: "1px solid #d2d2d7",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <option value="none">None (なし)</option>
              <option value="cross">Cross (十字)</option>
              <option value="bullseye">Bullseye (的)</option>
              <option value="globe">Globe (地球儀)</option>
            </select>
          </div>
        </div>

        {/* Icon Catalog */}
        {/* Icon Catalog */}
        <CatalogPanel
          catalogState={catalogState}
          onSelectIcon={addIconFromCatalog}
        />

        {/* アクション & ステータス */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: "6px 12px",
              border: "1px solid #d2d2d7",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleBackup}
            disabled={icons.length === 0}
            style={{
              padding: "6px 12px",
              border: "1px solid #d2d2d7",
              borderRadius: 6,
              background: "#fff",
              cursor: icons.length === 0 ? "not-allowed" : "pointer",
              fontSize: 12,
              opacity: icons.length === 0 ? 0.5 : 1,
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "6px 12px",
              border: "1px solid #d2d2d7",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleRestore(file);
                e.target.value = "";
              }
            }}
          />
          <span style={{ fontSize: 10, color: "#86868b" }}>
            {icons.length} icons
          </span>
        </div>
      </div>

      {/* キャンバス */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          position: "relative",
          background: "#fff",
          overflow: "hidden",
        }}
        onClick={() => setSelectedId(null)}
      >
        {/* グリッドオーバーレイ */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            <pattern
              id="grid"
              width={containerSize.width / 12}
              height={containerSize.height / 8}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${containerSize.width / 12} 0 L 0 0 0 ${containerSize.height / 8}`}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {icons.map((icon) => (
          <DraggableIcon
            key={icon.id}
            instance={icon.instance}
            initialX={icon.x}
            initialY={icon.y}
            scaleX={scaleX}
            scaleY={scaleY}
            zIndex={icon.zIndex}
            size={icon.size}
            rotation={icon.rotation}
            animation={icon.animation}
            selected={icon.id === selectedId}
            onSelect={() => handleSelect(icon.id)}
            onPositionChange={(x, y) => handlePositionChange(icon.id, x, y)}
            onRotationChange={(deg) => updateSelectedRotation(deg)}
            onDragStart={() => handleDragStart(icon.id)}
            onDrop={(x, y) => handleDrop(icon.id, x, y)}
            dialPreset={dialPresets[selectedDialPreset]}
            showReticle={
              selectedReticlePreset !== "none" && icon.id === selectedId
            }
            cssRotation={icon.id === selectedId ? previewRotation : null}
            reticlePreset={
              selectedReticlePreset !== "none"
                ? reticlePresets[selectedReticlePreset]
                : undefined
            }
          />
        ))}

        {icons.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#86868b",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              Click an icon to add it
            </p>
            <p style={{ fontSize: 14 }}>Drag icons to move them around</p>
          </div>
        )}

        {/* ゴミ箱エリア */}
        <div
          ref={trashRef}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 60,
            height: 60,
            borderRadius: 12,
            background: draggingId
              ? "rgba(255, 59, 48, 0.2)"
              : "rgba(0, 0, 0, 0.05)",
            border: draggingId ? "2px dashed #ff3b30" : "2px dashed #86868b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={draggingId ? "#ff3b30" : "#86868b"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
      </div>
    </div>
  );
}
