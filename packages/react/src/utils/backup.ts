import type { ShapeMode, IconStyle, AnimationType } from '../types';

/**
 * バックアップ用のアイコンデータ
 */
export interface IconBackupData {
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
  /** アニメーション（オプション） */
  animation?: AnimationType;
  /** カスタムメタデータ（オプション） */
  metadata?: Record<string, unknown>;
}

/**
 * バックアップファイルの形式
 */
export interface IconCraftBackup {
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
export const BACKUP_VERSION = '1.0.0';

/**
 * バックアップ作成オプション
 */
export interface CreateBackupOptions {
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
export function createBackup(
  icons: IconBackupData[],
  options?: CreateBackupOptions
): IconCraftBackup {
  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    license: options?.license,
    licenseUrl: options?.licenseUrl,
    icons,
    settings: options?.settings,
  };
}

/**
 * バックアップをJSONファイルとしてダウンロード
 */
export function downloadBackup(
  backup: IconCraftBackup,
  filename?: string
): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `iconcraft-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * バックアップをエクスポート（JSON文字列として）
 */
export function exportBackup(backup: IconCraftBackup): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * バックアップの検証結果
 */
export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * バックアップデータを検証
 */
export function validateBackup(data: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid backup format'], warnings: [] };
  }

  const backup = data as Partial<IconCraftBackup>;

  // バージョンチェック
  if (!backup.version) {
    errors.push('Missing version field');
  } else if (backup.version !== BACKUP_VERSION) {
    warnings.push(`Version mismatch: expected ${BACKUP_VERSION}, got ${backup.version}`);
  }

  // アイコン配列チェック
  if (!Array.isArray(backup.icons)) {
    errors.push('Missing or invalid icons array');
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
    warnings,
  };
}

/**
 * JSONファイルからバックアップを読み込み
 */
export function parseBackup(json: string): IconCraftBackup | null {
  try {
    const data = JSON.parse(json);
    const validation = validateBackup(data);

    if (!validation.valid) {
      console.error('Backup validation failed:', validation.errors);
      return null;
    }

    if (validation.warnings.length > 0) {
      console.warn('Backup warnings:', validation.warnings);
    }

    return data as IconCraftBackup;
  } catch (e) {
    console.error('Failed to parse backup:', e);
    return null;
  }
}

/**
 * ファイル入力からバックアップを読み込み
 */
export function loadBackupFromFile(file: File): Promise<IconCraftBackup | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      resolve(parseBackup(json));
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      resolve(null);
    };
    reader.readAsText(file);
  });
}
