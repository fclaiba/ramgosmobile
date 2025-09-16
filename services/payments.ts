export type PaymentStatus = 'completed' | 'pending' | 'cancelled' | 'refunded' | 'failed';
export type PaymentMethod = 'card' | 'wallet' | 'cash' | 'transfer';
export type PaymentKind = 'purchase' | 'payout' | 'refund' | 'fee' | 'escrow_release' | 'escrow_hold';

export type Payment = {
  id: string;
  title: string;
  amount: number; // positive income, negative expense
  status: PaymentStatus;
  kind: PaymentKind;
  method: PaymentMethod;
  createdAt: number;
  meta?: Record<string, any>;
};

let PAYMENTS: Payment[] = [
  { id: 'TXN123456', title: 'Compra de Laptop', amount: -1200, status: 'completed', kind: 'purchase', method: 'card', createdAt: Date.now() - 3 * 24 * 3600 * 1000 },
  { id: 'TXN789012', title: 'Pago de Cliente', amount: 850, status: 'pending', kind: 'escrow_hold', method: 'card', createdAt: Date.now() - 2 * 24 * 3600 * 1000 },
  { id: 'TXN345678', title: 'Reembolso de Vuelo', amount: 350.5, status: 'cancelled', kind: 'refund', method: 'card', createdAt: Date.now() - 4 * 24 * 3600 * 1000 },
];

export function listPayments(): Payment[] { return PAYMENTS.slice().sort((a,b)=>b.createdAt-a.createdAt); }
export function addPayment(p: Payment) { PAYMENTS.unshift(p); }
export function updatePayment(id: string, partial: Partial<Payment>) {
  const idx = PAYMENTS.findIndex(p=>p.id===id); if (idx>=0) PAYMENTS[idx] = { ...PAYMENTS[idx], ...partial };
}
export function filterPayments(filter?: { status?: PaymentStatus[]; kinds?: PaymentKind[]; text?: string; method?: PaymentMethod }): Payment[] {
  const q = filter?.text?.trim().toLowerCase();
  return listPayments().filter(p => (
    (!filter?.status || filter.status.includes(p.status)) &&
    (!filter?.kinds || filter.kinds.includes(p.kind)) &&
    (!filter?.method || filter.method === p.method) &&
    (!q || `${p.title} ${p.id}`.toLowerCase().includes(q))
  ));
}

export function monthlySummary(now: number = Date.now()): { incomes: number; expenses: number } {
  const start = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
  let incomes = 0; let expenses = 0;
  listPayments().forEach(p => {
    if (p.createdAt >= start) {
      if (p.amount >= 0) incomes += p.amount; else expenses += -p.amount;
    }
  });
  return { incomes, expenses };
}


