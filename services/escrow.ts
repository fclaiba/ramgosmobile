import AsyncStorage from '@react-native-async-storage/async-storage';

export type EscrowStatus = 'held' | 'shipped' | 'delivered' | 'released' | 'disputed' | 'abandoned' | 'cancelled';

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
  buyerId?: string;
  sellerId?: string;
  status: EscrowStatus;
  tracking?: string;
  createdAt: number;
  countdownEndsAt: number; // dispute window
  messages: EscrowMessage[];
};

let ESCROWS: EscrowTx[] = [];
const STORAGE_KEY = 'ESCROW_TXS_V1';

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function emit() {
  listeners.forEach((l) => {
    try { l(); } catch {}
  });
}

async function save() {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ESCROWS)); } catch {}
}

export async function initEscrowStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: EscrowTx[] = JSON.parse(raw);
      // Basic validation and sort by createdAt desc
      ESCROWS = Array.isArray(parsed) ? parsed.sort((a, b) => b.createdAt - a.createdAt) : [];
    }
    if (ESCROWS.length === 0) {
      // Seed demo data for buyer and seller views
      const now = Date.now();
      ESCROWS = [
        { id: 'A4B8C1', productId: 'p1', title: 'Cámara digital', buyerId: 'u_me', sellerId: 'u1', status: 'shipped', tracking: 'XY123456789', createdAt: now - 3*24*3600*1000, countdownEndsAt: now + 72*3600*1000, messages: [] },
        { id: 'A7D2K9', productId: 'p2', title: 'Servicio de reparación', buyerId: 'u2', sellerId: 'u_me', status: 'held', createdAt: now - 2*24*3600*1000, countdownEndsAt: now + 48*3600*1000, messages: [] },
        { id: 'A5M3Q4', productId: 'p3', title: 'Curso online', buyerId: 'u_me', sellerId: 'u3', status: 'delivered', createdAt: now - 5*24*3600*1000, countdownEndsAt: now + 24*3600*1000, messages: [] },
        { id: 'A1Z9Y8', productId: 'p4', title: 'Accesorios', buyerId: 'u_me', sellerId: 'u1', status: 'released', createdAt: now - 12*24*3600*1000, countdownEndsAt: now - 6*24*3600*1000, messages: [] },
        { id: 'A2D1X0', productId: 'p5', title: 'Publicación abandonada', buyerId: 'u_me', sellerId: 'u2', status: 'abandoned', createdAt: now - 10*24*3600*1000, countdownEndsAt: now - 8*24*3600*1000, messages: [] },
        { id: 'A3C7P2', productId: 'p6', title: 'Venta cancelada', buyerId: 'u2', sellerId: 'u_me', status: 'cancelled', createdAt: now - 7*24*3600*1000, countdownEndsAt: now - 6*24*3600*1000, messages: [] },
      ];
      await save();
    }
  } catch {
    // ignore
  }
}

export function subscribeEscrow(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function createEscrow(params: { productId: string; title: string; windowHours?: number; buyerId?: string; sellerId?: string }): EscrowTx {
  const now = Date.now();
  const tx: EscrowTx = {
    id: `A${Math.random().toString(36).slice(2,7).toUpperCase()}`,
    productId: params.productId,
    title: params.title,
    buyerId: params.buyerId,
    sellerId: params.sellerId,
    status: 'held',
    createdAt: now,
    countdownEndsAt: now + (params.windowHours ?? 72) * 60 * 60 * 1000,
    messages: [],
  };
  ESCROWS.unshift(tx);
  save();
  emit();
  return tx;
}

export function getEscrowById(id: string): EscrowTx | undefined { return ESCROWS.find((e) => e.id === id); }

export function confirmShipment(id: string, tracking: string) {
  const tx = getEscrowById(id); if (!tx) return; tx.status = 'shipped'; tx.tracking = tracking;
  tx.messages.push({ id: `${Date.now()}_sys`, author: 'seller', text: `Envío confirmado · Tracking ${tracking}`, at: Date.now() });
  save();
  emit();
}
export function confirmDelivery(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'delivered'; tx.messages.push({ id: `${Date.now()}_sys`, author: 'buyer', text: 'Producto recibido confirmado por comprador', at: Date.now() }); save(); emit(); }
export function releaseFunds(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'released'; tx.messages.push({ id: `${Date.now()}_sys`, author: 'buyer', text: 'Fondos liberados al vendedor', at: Date.now() }); save(); emit(); }
export function openDispute(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'disputed'; tx.messages.push({ id: `${Date.now()}_sys`, author: 'buyer', text: 'Disputa iniciada por el comprador', at: Date.now() }); save(); emit(); }

export function sendMessage(id: string, author: 'buyer'|'seller', text: string) {
  const tx = getEscrowById(id); if (!tx) return; tx.messages.push({ id: `${Date.now()}`, author, text, at: Date.now() });
  save();
  emit();
}

// Reset a estado inicial (pago retenido) para demos/flows guiados
export function resetEscrowToHeld(id: string) {
  const tx = getEscrowById(id); if (!tx) return;
  tx.status = 'held';
  tx.tracking = undefined;
  tx.messages = [];
  tx.countdownEndsAt = Date.now() + 72*3600*1000;
  save();
  emit();
}

export function getRemaining(id: string): { hours: number; minutes: number; seconds: number } {
  const tx = getEscrowById(id); if (!tx) return { hours: 0, minutes: 0, seconds: 0 };
  const ms = Math.max(0, tx.countdownEndsAt - Date.now());
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms - hours * 60 * 60 * 1000) / 1000 / 60);
  const seconds = Math.floor((ms - hours * 60 * 60 * 1000 - minutes * 60 * 1000) / 1000);
  return { hours, minutes, seconds };
}

// Listing helpers
export function listEscrows(filter?: { status?: EscrowStatus[]; buyerId?: string; sellerId?: string }): EscrowTx[] {
  const arr = ESCROWS.slice();
  return arr.filter(e => (
    (!filter?.status || filter.status.includes(e.status)) &&
    (!filter?.buyerId || e.buyerId === filter.buyerId) &&
    (!filter?.sellerId || e.sellerId === filter.sellerId)
  ));
}

export function markAbandoned(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'abandoned'; save(); emit(); }
export function cancelEscrow(id: string) { const tx = getEscrowById(id); if (!tx) return; tx.status = 'cancelled'; save(); emit(); }


