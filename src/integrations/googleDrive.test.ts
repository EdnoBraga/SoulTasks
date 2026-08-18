import { describe, expect, it } from 'vitest';
import { getWorkspaceDriveUrl, isGoogleDriveUrl } from './googleDrive';

describe('Google Drive integration', () => {
  it('uses the configured shared folder and validates Drive links', () => {
    expect(getWorkspaceDriveUrl('https://drive.google.com/drive/folders/soulfork')).toContain('/folders/soulfork');
    expect(isGoogleDriveUrl('https://drive.google.com/file/d/abc/view')).toBe(true);
    expect(isGoogleDriveUrl('https://example.com/file')).toBe(false);
  });
});
