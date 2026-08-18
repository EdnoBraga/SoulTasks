import { describe, expect, it } from 'vitest';
import { can, permissionLabel, type Permission } from './permissions';

describe('workspace permissions', () => {
  it('allows each permission level only the intended actions', () => {
    expect(can('admin', 'invite')).toBe(true);
    expect(can('editor', 'edit_card')).toBe(true);
    expect(can('commenter', 'comment')).toBe(true);
    expect(can('commenter', 'edit_card')).toBe(false);
    expect(can('viewer', 'read')).toBe(true);
    expect(can('viewer', 'comment')).toBe(false);
  });

  it('provides Portuguese labels for all levels', () => {
    expect((['admin', 'editor', 'commenter', 'viewer'] as Permission[]).map(permissionLabel)).toEqual(['Administrador', 'Editor', 'Comentarista', 'Visualizador']);
  });
});
