export type EscrowStatus = 'held' | 'shipped' | 'delivered' | 'released' | 'disputed';

export type EscrowMessage = {
  id: string;
  author: 'buyer' | 'seller';
  text: string;
  at: number;
};

export type EscrowTx = {
  id: string; // human-friendly code
  productId: string;
  title: string;
  status: EscrowStatus;
  tracking?: string;
  createdAt: number;
  countdownEndsAt: number; // dispute window
  messages: EscrowMessage[];
};

const ESCROWS: EscrowTx[] = [];

export function createEscrow(params: { productId: string; title: string; windowHours?: number }): EscrowTx {
  const now = Date.now();
  const tx: EscrowTx = {
    id: `A${Math.random().toString(36).slice(2,7).toUpperCase()}`,
    productId: params.productId,
    title: params.title,
    status: 'held',
    createdAt: now,
    countdownEndsAt: now + (params.windowHours ?? 72) * 60 * 60 * 1000,
    messages: [],
  };
  ESCROWS.unshift(tx);
  return tx;
}

export function getEscrowById(id: string): EscrowTx | undefined { return ESCROWS.find((e) => e.id === id); }

export function confirmShipment(id: string, tracking: string) {
  const tx = getEscrowById(id); if (!tx) return; tx.status = 'shipped'; tx.tracking = tracking;
}
export function confirmDelivery(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'delivered'; }
export function releaseFunds(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'released'; }
export function openDispute(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'disputed'; }

export function sendMessage(id: string, author: 'buyer'|'seller', text: string) {
  const tx = getEscrowById(id); if (!tx) return; tx.messages.push({ id: `${Date.now()}`, author, text, at: Date.now() });
}

export function getRemaining(id: string): { hours: number; minutes: number } {
  const tx = getEscrowById(id); if (!tx) return { hours: 0, minutes: 0 };
  const ms = Math.max(0, tx.countdownEndsAt - Date.now());
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms - hours * 60 * 60 * 1000) / 1000 / 60);
  return { hours, minutes };
}


