import { useState, useCallback, useRef } from 'react';
import {
  IconCraftFactory,
  IconCraftInstance,
  WasmManager,
  registerAnimation,
  createBackup,
  downloadBackup,
  loadBackupFromFile,
  type ShapeMode,
  type IconStyle,
  type AnimationType,
  type IconBackupData,
} from 'gospelo-iconcraft-react';
import { DraggableIcon } from './DraggableIcon';

// カスタムアニメーションを登録（アイコンだけ回転）
registerAnimation('rotateIcon', {
  keyframes: `
    @keyframes iconcraft-rotateIcon {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  defaults: { duration: 2, iterationCount: 'infinite', timingFunction: 'linear' },
  transformOrigin: 'icon', // アイコンの中心を基準に回転
});

// Twemoji カテゴリとアイコン定義
interface EmojiItem {
  code: string;
  name: string;
}

interface EmojiCategory {
  name: string;
  emojis: EmojiItem[];
}

const TWEMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Animals',
    emojis: [
      { code: '1f400', name: 'Rat' },
      { code: '1f401', name: 'Mouse' },
      { code: '1f402', name: 'Ox' },
      { code: '1f403', name: 'Water Buffalo' },
      { code: '1f404', name: 'Cow' },
      { code: '1f405', name: 'Tiger' },
      { code: '1f406', name: 'Leopard' },
      { code: '1f407', name: 'Rabbit' },
      { code: '1f408', name: 'Cat' },
      { code: '1f409', name: 'Dragon' },
      { code: '1f40a', name: 'Crocodile' },
      { code: '1f40b', name: 'Whale' },
      { code: '1f40c', name: 'Snail' },
      { code: '1f40d', name: 'Snake' },
      { code: '1f40e', name: 'Horse' },
      { code: '1f40f', name: 'Ram' },
      { code: '1f410', name: 'Goat' },
      { code: '1f411', name: 'Sheep' },
      { code: '1f412', name: 'Monkey' },
      { code: '1f413', name: 'Rooster' },
      { code: '1f414', name: 'Chicken' },
      { code: '1f415', name: 'Dog' },
      { code: '1f416', name: 'Pig' },
      { code: '1f417', name: 'Boar' },
      { code: '1f418', name: 'Elephant' },
      { code: '1f419', name: 'Octopus' },
      { code: '1f41a', name: 'Shell' },
      { code: '1f41b', name: 'Bug' },
      { code: '1f41c', name: 'Ant' },
      { code: '1f41d', name: 'Bee' },
    ],
  },
  {
    name: 'Faces',
    emojis: [
      { code: '1f600', name: 'Grinning' },
      { code: '1f601', name: 'Beaming' },
      { code: '1f602', name: 'Joy' },
      { code: '1f603', name: 'Smiley' },
      { code: '1f604', name: 'Smile' },
      { code: '1f605', name: 'Sweat Smile' },
      { code: '1f606', name: 'Laughing' },
      { code: '1f607', name: 'Innocent' },
      { code: '1f608', name: 'Smiling Imp' },
      { code: '1f609', name: 'Wink' },
      { code: '1f60a', name: 'Blush' },
      { code: '1f60b', name: 'Yum' },
      { code: '1f60c', name: 'Relieved' },
      { code: '1f60d', name: 'Heart Eyes' },
      { code: '1f60e', name: 'Sunglasses' },
      { code: '1f60f', name: 'Smirk' },
    ],
  },
  {
    name: 'Food',
    emojis: [
      { code: '1f34e', name: 'Red Apple' },
      { code: '1f34f', name: 'Green Apple' },
      { code: '1f350', name: 'Pear' },
      { code: '1f351', name: 'Peach' },
      { code: '1f352', name: 'Cherries' },
      { code: '1f353', name: 'Strawberry' },
      { code: '1f354', name: 'Hamburger' },
      { code: '1f355', name: 'Pizza' },
      { code: '1f356', name: 'Meat' },
      { code: '1f357', name: 'Poultry' },
      { code: '1f358', name: 'Rice Cracker' },
      { code: '1f359', name: 'Rice Ball' },
      { code: '1f35a', name: 'Cooked Rice' },
      { code: '1f35b', name: 'Curry' },
      { code: '1f35c', name: 'Ramen' },
      { code: '1f35d', name: 'Spaghetti' },
    ],
  },
  {
    name: 'Nature',
    emojis: [
      { code: '1f331', name: 'Seedling' },
      { code: '1f332', name: 'Evergreen' },
      { code: '1f333', name: 'Deciduous Tree' },
      { code: '1f334', name: 'Palm Tree' },
      { code: '1f335', name: 'Cactus' },
      { code: '1f337', name: 'Tulip' },
      { code: '1f338', name: 'Cherry Blossom' },
      { code: '1f339', name: 'Rose' },
      { code: '1f33a', name: 'Hibiscus' },
      { code: '1f33b', name: 'Sunflower' },
      { code: '1f33c', name: 'Blossom' },
      { code: '1f33d', name: 'Corn' },
      { code: '1f33e', name: 'Ear of Rice' },
      { code: '1f33f', name: 'Herb' },
      { code: '1f340', name: 'Four Leaf Clover' },
      { code: '1f341', name: 'Maple Leaf' },
    ],
  },
  {
    name: 'Objects',
    emojis: [
      { code: '1f4a1', name: 'Light Bulb' },
      { code: '1f4a3', name: 'Bomb' },
      { code: '1f4a5', name: 'Boom' },
      { code: '1f4a7', name: 'Droplet' },
      { code: '1f4a8', name: 'Dash' },
      { code: '1f4ab', name: 'Dizzy' },
      { code: '1f4af', name: '100' },
      { code: '1f4b0', name: 'Money Bag' },
      { code: '1f4bb', name: 'Laptop' },
      { code: '1f4be', name: 'Floppy Disk' },
      { code: '1f4bf', name: 'CD' },
      { code: '1f4c1', name: 'Folder' },
      { code: '1f4c4', name: 'Document' },
      { code: '1f4d6', name: 'Open Book' },
      { code: '1f4e6', name: 'Package' },
      { code: '1f4f1', name: 'Mobile Phone' },
    ],
  },
  {
    name: 'Symbols',
    emojis: [
      { code: '2b50', name: 'Star' },
      { code: '2764', name: 'Red Heart' },
      { code: '1f31f', name: 'Glowing Star' },
      { code: '1f4a2', name: 'Anger' },
      { code: '1f4a4', name: 'Zzz' },
      { code: '1f4a6', name: 'Sweat' },
      { code: '1f525', name: 'Fire' },
      { code: '1f389', name: 'Party Popper' },
      { code: '1f38a', name: 'Confetti Ball' },
      { code: '1f3af', name: 'Direct Hit' },
      { code: '1f3c6', name: 'Trophy' },
      { code: '1f451', name: 'Crown' },
      { code: '1f48e', name: 'Gem' },
      { code: '1f680', name: 'Rocket' },
      { code: '1f6a8', name: 'Police Light' },
      { code: '26a1', name: 'Lightning' },
    ],
  },
];

// Twemoji CDN URL生成
const getTwemojiUrl = (code: string) =>
  `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;

const MODES: ShapeMode[] = ['jelly', 'droplet', 'wax'];
const ICON_STYLES: IconStyle[] = ['original', 'emboss', 'stroke', 'fill'];

interface IconItem {
  id: string;
  instance: IconCraftInstance;
  x: number;
  y: number;
  zIndex: number;
  size: number;
  animation?: AnimationType;
}

export default function App() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  // 設定パネル用
  const [selectedMode, setSelectedMode] = useState<ShapeMode>('jelly');
  const [selectedIconStyle, setSelectedIconStyle] = useState<IconStyle>('original');
  const [selectedShapeColor, setSelectedShapeColor] = useState('#ffffff');
  const [selectedIconColor, setSelectedIconColor] = useState('#1d1d1f');
  const [selectedSize, setSelectedSize] = useState(160);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | undefined>(undefined);

  // Icon Catalog
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // カテゴリ内の絵文字をフィルタリング
  const filteredEmojis = TWEMOJI_CATEGORIES[selectedCategory].emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Twemoji URLからアイコン追加（または選択中アイコンを更新）
  const addIconFromTwemoji = (emojiCode: string) => {
    const svgUrl = getTwemojiUrl(emojiCode);

    console.log('Adding Twemoji icon:', { emojiCode, svgUrl, selectedMode, selectedIconStyle, selectedShapeColor, selectedSize });

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
        });
        const newInstance = newFactory.create(svgUrl);

        setIcons((prev) =>
          prev.map((i) =>
            i.id === selectedId ? { ...i, instance: newInstance } : i
          )
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
    console.log('Instance config:', {
      mode: instance.config.mode,
      iconStyle: instance.config.iconStyle,
      shapeColor: instance.config.shapeColor,
      size: instance.config.size,
    });

    const newIcon: IconItem = {
      id: `icon-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      instance,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      zIndex: nextZIndex,
      size: selectedSize,
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
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    // 選択したアイコンを最前面に
    setIcons((prev) =>
      prev.map((icon) =>
        icon.id === id ? { ...icon, zIndex: nextZIndex } : icon
      )
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
  }, [nextZIndex, icons]);

  // 位置更新
  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setIcons((prev) =>
      prev.map((icon) =>
        icon.id === id ? { ...icon, x, y } : icon
      )
    );
  }, []);

  // ドロップ時の処理（ゴミ箱エリアに入ったら削除）
  const handleDrop = useCallback((id: string, clientX: number, clientY: number) => {
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
  }, [selectedId]);

  // ドラッグ開始
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  // 選択中のアイコン
  const selectedIcon = icons.find((icon) => icon.id === selectedId);

  // 選択中のアイコンのサイズを更新
  const updateSelectedSize = useCallback((size: number) => {
    if (!selectedId) return;
    setIcons((prev) =>
      prev.map((icon) =>
        icon.id === selectedId ? { ...icon, size } : icon
      )
    );
  }, [selectedId]);

  // 選択中のアイコンのアニメーションを更新
  const updateSelectedAnimation = useCallback((animation: AnimationType | undefined) => {
    if (!selectedId) return;
    setIcons((prev) =>
      prev.map((icon) =>
        icon.id === selectedId ? { ...icon, animation } : icon
      )
    );
  }, [selectedId]);

  // 選択中のアイコンの色を更新（再生成）
  const updateSelectedShapeColor = useCallback((color: string) => {
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
    });
    const newInstance = newFactory.create(icon.instance.svg);

    setIcons((prev) =>
      prev.map((i) =>
        i.id === selectedId ? { ...i, instance: newInstance } : i
      )
    );
  }, [selectedId, icons]);

  // 選択中のアイコンのスタイルを更新（再生成）
  const updateSelectedIconStyle = useCallback((iconStyle: IconStyle) => {
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
    });
    const newInstance = newFactory.create(icon.instance.svg);

    setIcons((prev) =>
      prev.map((i) =>
        i.id === selectedId ? { ...i, instance: newInstance } : i
      )
    );
  }, [selectedId, icons]);

  // 選択中のアイコンのモードを更新（再生成）
  const updateSelectedMode = useCallback((mode: ShapeMode) => {
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
    });
    const newInstance = newFactory.create(icon.instance.svg);

    setIcons((prev) =>
      prev.map((i) =>
        i.id === selectedId ? { ...i, instance: newInstance } : i
      )
    );
  }, [selectedId, icons]);

  // 選択中のアイコンのiconColorを更新（再生成）
  const updateSelectedIconColor = useCallback((newIconColor: string) => {
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
    });
    const newInstance = newFactory.create(icon.instance.svg);

    setIcons((prev) =>
      prev.map((i) =>
        i.id === selectedId ? { ...i, instance: newInstance } : i
      )
    );
  }, [selectedId, icons]);

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
      defaultMode: selectedMode,
      defaultIconStyle: selectedIconStyle,
      defaultShapeColor: selectedShapeColor,
      defaultSize: selectedSize,
    });

    downloadBackup(backup);
  }, [icons, selectedMode, selectedIconStyle, selectedShapeColor, selectedSize]);

  // バックアップから復元
  const handleRestore = useCallback(async (file: File) => {
    const backup = await loadBackupFromFile(file);
    if (!backup) {
      alert('Failed to load backup file');
      return;
    }

    // 既存のアイコンをクリア
    WasmManager.clearCache();

    // バックアップからアイコンを復元
    const restoredIcons: IconItem[] = backup.icons.map((data, index) => {
      const factory = new IconCraftFactory({
        mode: data.mode || 'jelly',
        iconStyle: data.iconStyle || 'original',
        iconColor: data.iconColor || '#1d1d1f',
        shapeColor: data.shapeColor || '#ffffff',
        size: data.size || 160,
      });
      const instance = factory.create(data.svg);

      return {
        id: `icon-${Date.now()}-${index}`,
        instance,
        x: data.x ?? 100 + Math.random() * 400,
        y: data.y ?? 100 + Math.random() * 300,
        zIndex: data.zIndex ?? index + 1,
        size: data.size || 160,
        animation: data.animation,
      };
    });

    setIcons(restoredIcons);
    setNextZIndex(restoredIcons.length + 1);
    setSelectedId(null);

    // 設定を復元
    if (backup.settings) {
      if (backup.settings.defaultMode) setSelectedMode(backup.settings.defaultMode);
      if (backup.settings.defaultIconStyle) setSelectedIconStyle(backup.settings.defaultIconStyle);
      if (backup.settings.defaultShapeColor) setSelectedShapeColor(backup.settings.defaultShapeColor);
      if (backup.settings.defaultSize) setSelectedSize(backup.settings.defaultSize);
    }
  }, []);

  // ファイル入力のref
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* サイドパネル */}
      <div
        style={{
          width: 260,
          background: '#fff',
          borderLeft: '1px solid #e5e5e5',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          order: 2,
          overflowY: 'auto',
        }}
      >
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>
          IconCraft Demo
        </h1>

        {/* Mode選択 */}
        <div>
          <label style={{ fontSize: 11, color: '#86868b', display: 'block', marginBottom: 4 }}>
            Mode
          </label>
          <div style={{ display: 'flex', gap: 4 }}>
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
                  padding: '5px 8px',
                  border: selectedMode === mode ? '2px solid #0071e3' : '1px solid #d2d2d7',
                  borderRadius: 6,
                  background: selectedMode === mode ? '#e8f4fd' : '#fff',
                  cursor: 'pointer',
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
          <label style={{ fontSize: 11, color: '#86868b', display: 'block', marginBottom: 4 }}>
            Icon Style
          </label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
                  flex: '1 1 45%',
                  padding: '5px 8px',
                  border: selectedIconStyle === style ? '2px solid #0071e3' : '1px solid #d2d2d7',
                  borderRadius: 6,
                  background: selectedIconStyle === style ? '#e8f4fd' : '#fff',
                  cursor: 'pointer',
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
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#86868b', display: 'block', marginBottom: 4 }}>
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
                width: '100%',
                height: 30,
                border: '1px solid #d2d2d7',
                borderRadius: 6,
                cursor: 'pointer',
                padding: 2,
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#86868b', display: 'block', marginBottom: 4 }}>
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
                width: '100%',
                height: 30,
                border: '1px solid #d2d2d7',
                borderRadius: 6,
                cursor: 'pointer',
                padding: 2,
              }}
              disabled={selectedIconStyle !== 'stroke' && selectedIconStyle !== 'fill'}
            />
          </div>
        </div>

        {/* サイズ & アニメーション (横並び) */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: selectedIcon ? '#0071e3' : '#86868b', display: 'block', marginBottom: 4 }}>
              Size: {selectedIcon ? selectedIcon.size : selectedSize}px
            </label>
            <input
              type="range"
              min={100}
              max={500}
              value={selectedIcon ? selectedIcon.size : selectedSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (selectedIcon) {
                  updateSelectedSize(size);
                } else {
                  setSelectedSize(size);
                }
              }}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: selectedIcon ? '#0071e3' : '#86868b', display: 'block', marginBottom: 4 }}>
              Animation
            </label>
            <select
              value={selectedIcon ? (selectedIcon.animation ?? '') : (selectedAnimation ?? '')}
              onChange={(e) => {
                const anim = e.target.value as AnimationType || undefined;
                if (selectedIcon) {
                  updateSelectedAnimation(anim);
                } else {
                  setSelectedAnimation(anim);
                }
              }}
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d2d2d7',
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
        </div>

        {/* Icon Catalog */}
        <div>
          <label style={{ fontSize: 11, color: '#86868b', display: 'block', marginBottom: 4 }}>
            Icon Catalog
          </label>

          {/* Category & Search (横並び) */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              style={{
                flex: 1,
                padding: '4px 6px',
                border: '1px solid #d2d2d7',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {TWEMOJI_CATEGORIES.map((cat, i) => (
                <option key={cat.name} value={i}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 6px',
                border: '1px solid #d2d2d7',
                borderRadius: 6,
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />

          </div>

          {/* Icon Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 2,
              maxHeight: 180,
              overflowY: 'auto',
              padding: 4,
              background: '#f5f5f7',
              borderRadius: 6,
              alignContent: 'start',
            }}
          >
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji.code}
                type="button"
                onClick={() => addIconFromTwemoji(emoji.code)}
                title={emoji.name}
                style={{
                  width: 32,
                  height: 32,
                  padding: 2,
                  border: '1px solid transparent',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0071e3';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={getTwemojiUrl(emoji.code)}
                  alt={emoji.name}
                  style={{ width: 22, height: 22 }}
                />
              </button>
            ))}
          </div>

          {filteredEmojis.length === 0 && (
            <div style={{ textAlign: 'center', padding: 12, color: '#86868b', fontSize: 11 }}>
              No icons found
            </div>
          )}
        </div>

        {/* アクション & ステータス */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: '6px 12px',
              border: '1px solid #d2d2d7',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
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
              padding: '6px 12px',
              border: '1px solid #d2d2d7',
              borderRadius: 6,
              background: '#fff',
              cursor: icons.length === 0 ? 'not-allowed' : 'pointer',
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
              padding: '6px 12px',
              border: '1px solid #d2d2d7',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleRestore(file);
                e.target.value = '';
              }
            }}
          />
          <span style={{ fontSize: 10, color: '#86868b' }}>
            {icons.length} icons
          </span>
        </div>
      </div>

      {/* キャンバス */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: `
            linear-gradient(45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(-45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e8e8e8 75%),
            linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          overflow: 'hidden',
        }}
        onClick={() => setSelectedId(null)}
      >
        {icons.map((icon) => (
          <DraggableIcon
            key={icon.id}
            instance={icon.instance}
            initialX={icon.x}
            initialY={icon.y}
            zIndex={icon.zIndex}
            size={icon.size}
            animation={icon.animation}
            selected={icon.id === selectedId}
            onSelect={() => handleSelect(icon.id)}
            onPositionChange={(x, y) => handlePositionChange(icon.id, x, y)}
            onDragStart={() => handleDragStart(icon.id)}
            onDrop={(x, y) => handleDrop(icon.id, x, y)}
          />
        ))}

        {icons.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#86868b',
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 8 }}>Click an icon to add it</p>
            <p style={{ fontSize: 14 }}>Drag icons to move them around</p>
          </div>
        )}

        {/* ゴミ箱エリア */}
        <div
          ref={trashRef}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 60,
            height: 60,
            borderRadius: 12,
            background: draggingId ? 'rgba(255, 59, 48, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            border: draggingId ? '2px dashed #ff3b30' : '2px dashed #86868b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={draggingId ? '#ff3b30' : '#86868b'}
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
