import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';
import type { ChatChannel, ChatMessage, MemberPermission, PresenceStatus, WorkspaceMember } from '../collaboration/types';
import WorkspaceMembers from './WorkspaceMembers';
import ChatPanel from './ChatPanel';
import CallRoom from './CallRoom';
import { formatOnlineDuration } from '../domain/presenceDuration';

type Props = {
  session: SupabaseSession;
  config: SupabaseConfig;
  members: WorkspaceMember[];
  presence: Record<string, PresenceStatus>;
  isAdmin: boolean;
  onInvite: (email: string, displayName: string) => Promise<void>;
  onUpdatePermission?: (memberId: string, permission: MemberPermission) => Promise<void>;
  onlineDurations?: Record<string, number>;
  onNotify: (message: string) => void;
  chatOpen: boolean;
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChannelId?: string;
  onSelectChannel: (id: string) => void;
  onSend: (content: string) => void;
  onCloseChat: () => void;
  onOpenChat?: () => void;
};

export default function TeamOverview({ session, config, members, presence, isAdmin, onInvite, onUpdatePermission, onlineDurations = {}, onNotify, chatOpen, channels, messages, activeChannelId, onSelectChannel, onSend, onCloseChat, onOpenChat }: Props) {
  return <section className="team-overview" aria-label="Equipe e sala de equipe"><WorkspaceMembers members={members} presence={presence} isAdmin={isAdmin} onInvite={onInvite} onUpdatePermission={onUpdatePermission} onOpenChat={onOpenChat} />{isAdmin && <div className="online-duration-panel" aria-label="Tempo online dos integrantes"><span className="section-kicker">somente administrador</span><h3>Tempo online</h3>{members.map((member) => <div className="online-duration-row" key={member.userId}><span>{member.displayName}</span><strong>{formatOnlineDuration(onlineDurations[member.userId] ?? 0)}</strong></div>)}</div>}<CallRoom session={session} config={config} members={members} onNotify={onNotify} />{chatOpen && <ChatPanel channels={channels} messages={messages} activeChannelId={activeChannelId} currentUserId={session.user.id} onSelectChannel={onSelectChannel} onSend={onSend} onClose={onCloseChat} />}</section>;
}
