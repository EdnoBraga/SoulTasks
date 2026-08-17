export type MemberRole = 'admin' | 'member';
export type MemberStatus = 'pending' | 'active' | 'suspended';
export type PresenceStatus = 'online' | 'away' | 'offline';

export type WorkspaceMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  displayName: string;
  email?: string;
  status: MemberStatus;
};

export type ChatChannel = {
  id: string;
  workspaceId: string;
  kind: 'general' | 'direct';
  name: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};
