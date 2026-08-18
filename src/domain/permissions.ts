export type Permission = 'admin' | 'editor' | 'commenter' | 'viewer';
export type PermissionAction = 'read' | 'comment' | 'edit_card' | 'invite' | 'manage_permissions' | 'delete';

const labels: Record<Permission, string> = { admin: 'Administrador', editor: 'Editor', commenter: 'Comentarista', viewer: 'Visualizador' };
const actions: Record<Permission, PermissionAction[]> = {
  admin: ['read', 'comment', 'edit_card', 'invite', 'manage_permissions', 'delete'],
  editor: ['read', 'comment', 'edit_card'],
  commenter: ['read', 'comment'],
  viewer: ['read'],
};

export function can(permission: Permission | undefined, action: PermissionAction) { return Boolean(permission && actions[permission].includes(action)); }
export function permissionLabel(permission: Permission) { return labels[permission]; }
