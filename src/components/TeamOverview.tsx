import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';
import type { ChatChannel, ChatMessage, PresenceStatus, WorkspaceMember } from '../collaboration/types';
import WorkspaceMembers from './WorkspaceMembers';
import ChatPanel from './ChatPanel';
import CallRoom from './CallRoom';

type Props = {
  session: SupabaseSession;
  config: SupabaseConfig;
  members: WorkspaceMember[];
  presence: Record<string, PresenceStatus>;
  isAdmin: boolean;
  onInvite: (email: string, displayName: string) => Promise<void>;
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

export default function TeamOverview({ session, config, members, presence, isAdmin, onInvite, onNotify, chatOpen, channels, messages, activeChannelId, onSelectChannel, onSend, onCloseChat, onOpenChat }: Props) {
  return <section className="team-overview" aria-label="Equipe e sala de equipe"><WorkspaceMembers members={members} presence={presence} isAdmin={isAdmin} onInvite={onInvite} onOpenChat={onOpenChat} /><CallRoom session={session} config={config} members={members} onNotify={onNotify} />{chatOpen && <ChatPanel channels={channels} messages={messages} activeChannelId={activeChannelId} currentUserId={session.user.id} onSelectChannel={onSelectChannel} onSend={onSend} onClose={onCloseChat} />}</section>;
}
