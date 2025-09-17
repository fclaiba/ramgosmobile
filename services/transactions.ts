import { Payment, PaymentStatus, PaymentKind, PaymentMethod, listPayments } from './payments';
import { EscrowTx, EscrowStatus, listEscrows } from './escrow';
import { CouponOrder, OrderStatus, listOrders } from './history';
import { EventOrder, listEventOrders } from './events';

export type UnifiedTransactionType = 'payment' | 'escrow' | 'coupon' | 'event';

export type UnifiedTransaction = {
  type: UnifiedTransactionType;
  id: string;
  title: string;
  date: number; // epoch ms
  amount?: number; // positive income, negative expense, undefined if not applicable
  status: string;
  meta?: Record<string, any>;
};

export type TransactionsFilter = {
  text?: string;
  types?: UnifiedTransactionType[];
  dateFrom?: number; // epoch ms inclusive
  dateTo?: number;   // epoch ms inclusive
  // Per-type status filters (optional)
  paymentStatuses?: PaymentStatus[];
  paymentMethods?: PaymentMethod[];
  paymentKinds?: PaymentKind[];
  escrowStatuses?: EscrowStatus[];
  couponStatuses?: OrderStatus[];
  couponSectors?: CouponOrder['sector'][];
  eventStatuses?: EventOrder['status'][];
  // Sort
  sortBy?: 'date' | 'amount';
  sortDir?: 'asc' | 'desc';
  // Amount range (applies to items that have amount)
  amountMin?: number;
  amountMax?: number;
};

function inRange(ts: number, from?: number, to?: number): boolean {
  if (from != null && ts < from) return false;
  if (to != null && ts > to) return false;
  return true;
}

function matchesText(haystack: string, q?: string): boolean {
  const s = q?.trim().toLowerCase();
  if (!s) return true;
  return haystack.toLowerCase().includes(s);
}

export function listUnifiedTransactions(filter?: TransactionsFilter): UnifiedTransaction[] {
  const types = new Set<UnifiedTransactionType>(filter?.types || ['payment','escrow','coupon','event']);
  const t: UnifiedTransaction[] = [];

  if (types.has('payment')) {
    const arr = listPayments()
      .filter(p => (!filter?.paymentStatuses || filter.paymentStatuses.includes(p.status)))
      .filter(p => (!filter?.paymentMethods || filter.paymentMethods.includes(p.method)))
      .filter(p => (!filter?.paymentKinds || filter.paymentKinds.includes(p.kind)))
      .filter(p => inRange(p.createdAt, filter?.dateFrom, filter?.dateTo))
      .filter(p => matchesText(`${p.title} ${p.id}`, filter?.text))
      .filter(p => (filter?.amountMin == null || p.amount >= filter.amountMin!))
      .filter(p => (filter?.amountMax == null || p.amount <= filter.amountMax!))
      .map<UnifiedTransaction>((p) => ({
        type: 'payment',
        id: p.id,
        title: p.title,
        date: p.createdAt,
        amount: p.amount,
        status: p.status,
        meta: { kind: p.kind, method: p.method },
      }));
    t.push(...arr);
  }

  if (types.has('escrow')) {
    const arr = listEscrows({})
      .filter(e => (!filter?.escrowStatuses || filter.escrowStatuses.includes(e.status)))
      .filter(e => inRange(e.createdAt, filter?.dateFrom, filter?.dateTo))
      .filter(e => matchesText(`${e.id} ${e.title} ${e.status}`, filter?.text))
      .map<UnifiedTransaction>((e) => ({
        type: 'escrow',
        id: e.id,
        title: e.title,
        date: e.createdAt,
        amount: undefined,
        status: e.status,
        meta: { tracking: e.tracking },
      }));
    t.push(...arr);
  }

  if (types.has('coupon')) {
    const arr = listOrders()
      .filter(c => (!filter?.couponStatuses || filter.couponStatuses.includes(c.status)))
      .filter(c => (!filter?.couponSectors || filter.couponSectors.includes(c.sector)))
      .filter(c => inRange(new Date(c.createdAt).getTime(), filter?.dateFrom, filter?.dateTo))
      .filter(c => matchesText(`${c.id} ${c.title} ${c.merchant}`, filter?.text))
      .filter(c => (filter?.amountMin == null || (c.amount ?? 0) >= filter.amountMin!))
      .filter(c => (filter?.amountMax == null || (c.amount ?? 0) <= filter.amountMax!))
      .map<UnifiedTransaction>((c) => ({
        type: 'coupon',
        id: c.id,
        title: c.title,
        date: new Date(c.createdAt).getTime(),
        amount: c.amount,
        status: c.status,
        meta: { sector: c.sector, validUntil: c.validUntil },
      }));
    t.push(...arr);
  }

  if (types.has('event')) {
    const arr = listEventOrders()
      .filter(e => (!filter?.eventStatuses || filter.eventStatuses.includes(e.status)))
      .filter(e => inRange(e.date, filter?.dateFrom, filter?.dateTo))
      .filter(e => matchesText(`${e.id} ${e.title}`, filter?.text))
      .filter(e => (filter?.amountMin == null || e.amount >= filter.amountMin!))
      .filter(e => (filter?.amountMax == null || e.amount <= filter.amountMax!))
      .map<UnifiedTransaction>((e) => ({
        type: 'event',
        id: e.id,
        title: e.title,
        date: e.date,
        amount: e.amount,
        status: e.status,
      }));
    t.push(...arr);
  }

  // Sorting
  const sortBy = filter?.sortBy || 'date';
  const dir = filter?.sortDir || 'desc';
  t.sort((a, b) => {
    let av = 0; let bv = 0;
    if (sortBy === 'date') { av = a.date; bv = b.date; }
    else {
      av = (a.amount ?? 0);
      bv = (b.amount ?? 0);
    }
    return dir === 'asc' ? av - bv : bv - av;
  });

  return t;
}

export function exportTransactionsCsv(rows: UnifiedTransaction[]): string {
  const header = ['Tipo','ID/Título','Estado','Monto','Fecha'];
  const esc = (s: any) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const body = rows.map(r => [
    r.type,
    `${r.id} · ${r.title}`,
    r.status,
    r.amount != null ? r.amount : '',
    new Date(r.date).toISOString(),
  ].map(esc).join(','));
  return [header.map(esc).join(','), ...body].join('\n');
}

export function rangePresetToDates(preset: 'all' | '7d' | '30d' | '90d'): { from?: number; to?: number } {
  if (preset === 'all') return {};
  const now = Date.now();
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  return { from: now - days * 24 * 3600 * 1000, to: now };
}


