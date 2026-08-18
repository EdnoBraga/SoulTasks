const DEFAULT_DRIVE_URL = 'https://drive.google.com/drive/my-drive';

export function getWorkspaceDriveUrl(configuredUrl?: string) {
  const url = configuredUrl?.trim() || (typeof import.meta !== 'undefined' ? (import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_URL as string | undefined)?.trim() : undefined);
  return url || DEFAULT_DRIVE_URL;
}

export function isGoogleDriveUrl(value: string) { try { return new URL(value).hostname.endsWith('drive.google.com'); } catch { return false; } }
