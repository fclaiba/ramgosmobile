// Simple in-memory moderation service to manage pending items and history.
// In a real app this would live in a backend service.

export type ModerationType = 'profile_photo' | 'bio' | 'comment' | 'video';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'banned' | 'escalated';
export type ModerationAction = 'approve' | 'reject' | 'ban' | 'escalate';

export type ModerationItem = {
  id: string;
  userHandle: string; // @usuario
  type: ModerationType;
  reason: string; // spam, contenido inapropiado, etc
  confidence: number; // 0..1
  currentContent?: string; // url o texto según type
  suggestedContent?: string; // url o texto
  reportedAt: number; // epoch
  status: ModerationStatus;
};

export type ModerationDecision = {
  id: string;
  itemId: string;
  contentLabel: string; // human readable summary
  action: ModerationAction;
  moderator: string; // user id/handle
  decidedAt: number; // epoch
};

type State = {
  queue: ModerationItem[];
  history: ModerationDecision[];
};

const state: State = {
  queue: [
    {
      id: 'm1',
      userHandle: '@usuario_x',
      type: 'profile_photo',
      reason: 'Contenido inapropiado',
      confidence: 0.65,
      currentContent:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDWc7rlBdDRK4JEIpNlnT0NyWl1jvF-F-4Muq4UGqwI0F2zI9yPuHoQ_ODHWedZgOu5QGdFmlg-xF3UXAzQ_xeFKDGjPYlOPalFIrvvvHJlTh4qC8TuFLC1EBAZY3pkGLBw9TTx0SPsGr-TIxMC4UXOSnXSOXO5ppdOak8moIq6eUPIxtHjWMkdC6G3dKANREFdj9tKnCTTDiLDzRdsCPbP2yVvpqV8ltkaYkMI2cPIdmahQjiLKnsFyMLkz0xNdpedas5EJmNpPyY9',
      suggestedContent:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-uRCMYqFTl1htXdDLpF-2J-1IGSWtOZuH0AnXW9XFmsd9JbO2b8qaZSrLsj0CBbOCeSnnmXqUKZmszXQ9CsSOp9PB2mK9LpN-p48foPCJHF8Esto5g9JWpxC4TNA2f-X610_vrcx81-lhKzbol-tRiHMKP4-lwAKRLRI3b1ZHMCfEfU_3OdKz9jbiozYmXI6oH4l99XBjcfVruOrN9Zf0HQjJ5981k5Kk0bzsBGfxKI3VWKU1dAp6t2qI-jJRSWd9ICRxleQq-lXT',
      reportedAt: Date.now() - 3600 * 1000,
      status: 'pending',
    },
    {
      id: 'm2',
      userHandle: '@otro_usuario',
      type: 'bio',
      reason: 'Spam',
      confidence: 0.2,
      currentContent: '"Sígueme para ganar dinero fácil! Link en mi perfil!"',
      reportedAt: Date.now() - 2 * 3600 * 1000,
      status: 'pending',
    },
  ],
  history: [
    { id: 'd1', itemId: 'h1', contentLabel: 'Biografía de @juanperez', action: 'approve', moderator: 'admin', decidedAt: Date.now() - 2 * 3600 * 1000 },
    { id: 'd2', itemId: 'h2', contentLabel: 'Foto de @anagarcia', action: 'reject', moderator: 'admin', decidedAt: Date.now() - 5 * 3600 * 1000 },
    { id: 'd3', itemId: 'h3', contentLabel: 'Comentario de @luis_r', action: 'ban', moderator: 'mod_01', decidedAt: Date.now() - 24 * 3600 * 1000 },
    { id: 'd4', itemId: 'h4', contentLabel: 'Video de @sofia_m', action: 'escalate', moderator: 'mod_02', decidedAt: Date.now() - 2 * 24 * 3600 * 1000 },
  ],
};

export function listPending(filter?: { minConfidence?: number }): ModerationItem[] {
  const min = filter?.minConfidence ?? 0;
  return state.queue.filter((i) => i.status === 'pending' && i.confidence >= min);
}

export function listHistory(): ModerationDecision[] {
  return state.history.slice().sort((a, b) => b.decidedAt - a.decidedAt);
}

export function actOnItem(params: { id: string; action: ModerationAction; moderator: string }): { ok: true } | { ok: false; error: string } {
  const item = state.queue.find((q) => q.id === params.id);
  if (!item) return { ok: false, error: 'Item not found' };
  const now = Date.now();
  let status: ModerationStatus = 'pending';
  switch (params.action) {
    case 'approve':
      status = 'approved';
      break;
    case 'reject':
      status = 'rejected';
      break;
    case 'ban':
      status = 'banned';
      break;
    case 'escalate':
      status = 'escalated';
      break;
  }
  item.status = status;
  state.history.unshift({
    id: `d_${Math.random().toString(36).slice(2, 8)}`,
    itemId: item.id,
    contentLabel: labelForItem(item),
    action: params.action,
    moderator: params.moderator,
    decidedAt: now,
  });
  // Remove from queue once decided
  state.queue = state.queue.filter((q) => q.status === 'pending');
  return { ok: true };
}

function labelForItem(i: ModerationItem): string {
  const typeLabel = i.type === 'profile_photo' ? 'Foto de perfil' : i.type === 'bio' ? 'Biografía' : i.type === 'comment' ? 'Comentario' : 'Video';
  return `${typeLabel} de ${i.userHandle}`;
}

export function seedItem(it: ModerationItem) {
  state.queue.unshift(it);
}


