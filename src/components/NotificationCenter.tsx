import { Bell, CalendarClock, MessageCircle, UserPlus, X } from 'lucide-react';
import type { AppNotification } from '../domain/notifications';

type NotificationCenterProps = { notifications: AppNotification[]; open: boolean; onToggle: () => void; onClose: () => void; onOpenCard: (cardId: string) => void };

const icons = { assignment: UserPlus, comment: MessageCircle, due: CalendarClock };

export default function NotificationCenter({ notifications, open, onToggle, onClose, onOpenCard }: NotificationCenterProps) {
  return <div className="notification-wrap">
    <button className="icon-button notification-trigger" aria-label="Notificações" aria-expanded={open} onClick={onToggle}>
      <Bell size={18} />{notifications.length > 0 && <span className="notification-badge" aria-label={`${notifications.length} notificações`}>{notifications.length > 9 ? '9+' : notifications.length}</span>}
    </button>
    {open && <div className="notification-panel" role="dialog" aria-label="Notificações">
      <div className="notification-heading"><div><span className="section-kicker">central de avisos</span><h2>Notificações</h2></div><button className="icon-button" aria-label="Fechar notificações" onClick={onClose}><X size={16} /></button></div>
      {notifications.length ? <div className="notification-list">{notifications.map((notification) => { const Icon = icons[notification.kind]; return <button className="notification-item" key={notification.id} onClick={() => { onOpenCard(notification.cardId); onClose(); }}><span className={`notification-icon ${notification.kind}`}><Icon size={15} /></span><span><strong>{notification.title}</strong><small>{notification.message}</small></span></button>; })}</div> : <div className="notification-empty"><Bell size={18} /><p>Nenhum aviso novo por enquanto.</p></div>}
    </div>}
  </div>;
}
