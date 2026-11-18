export { sanitizeSvg } from './sanitize';
export { scopeSvgIds, toSvgIdPrefix } from './scopeSvgIds';

export {
  createBackup,
  downloadBackup,
  exportBackup,
  validateBackup,
  parseBackup,
  loadBackupFromFile,
  BACKUP_VERSION,
} from './backup';

export type {
  IconBackupData,
  IconCraftBackup,
  BackupValidationResult,
  CreateBackupOptions,
} from './backup';
