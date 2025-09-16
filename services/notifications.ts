export type NotificationKind = 'payment' | 'follower' | 'system' | 'message';

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read?: boolean;
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
};

let NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', kind: 'payment', title: 'Pago Recibido', body: 'El pago de la suscripción de @usuario_nuevo ha sido procesado con éxito.', createdAt: Date.now() - 15*60*1000, read: false, data: { invoiceId: 'INV-1001' }, priority: 'normal' },
  { id: 'n2', kind: 'follower', title: 'Nuevo seguidor', body: '@juanperez te ha seguido.', createdAt: Date.now() - 60*60*1000, read: false, data: { userId: 'u2' }, priority: 'normal' },
  { id: 'n3', kind: 'system', title: 'Alerta del Sistema', body: 'Mantenimiento programado para esta noche a las 2:00 AM. El servicio podría verse afectado temporalmente.', createdAt: Date.now() - 26*60*60*1000, read: true, priority: 'high' },
  { id: 'n4', kind: 'message', title: 'Nuevo Mensaje', body: 'Has recibido un nuevo mensaje de @anagarcia.', createdAt: Date.now() - 27*60*60*1000, read: false, data: { threadId: 't1', from: 'u3' }, priority: 'normal' },
];

export function listNotifications(filter?: { kind?: NotificationKind | 'all'; onlyUnread?: boolean; priority?: 'high' | 'normal' | 'all' }): NotificationItem[] {
  const f = filter || { kind: 'all', priority: 'all' };
  return NOTIFICATIONS
    .slice()
    .filter(n => (f.kind && f.kind!=='all' ? n.kind===f.kind : true))
    .filter(n => (f.priority && f.priority!=='all' ? (n.priority || 'normal')===f.priority : true))
    .filter(n => (!f.onlyUnread || !n.read))
    .sort((a,b)=>b.createdAt-a.createdAt);
}

export function markRead(id: string) { const n = NOTIFICATIONS.find(x=>x.id===id); if (n) n.read = true; }
export function markAllRead() { NOTIFICATIONS.forEach(n=>n.read=true); }
export function archive(id: string) { NOTIFICATIONS = NOTIFICATIONS.filter(n=>n.id!==id); }
export function remind(id: string, whenMs: number) { const n = NOTIFICATIONS.find(x=>x.id===id); if (n) n.createdAt = Date.now()+whenMs; }


