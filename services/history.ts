export type OrderStatus = 'active' | 'redeemed' | 'expired';

export type CouponOrder = {
  id: string; // order id
  couponId: string;
  title: string;
  merchant: string;
  sector: 'gastronomia' | 'aventura' | 'bienestar' | 'cultura' | 'otros';
  status: OrderStatus;
  amount?: number; // negative expense
  validUntil: string; // ISO date
  createdAt: string; // ISO date
  qrCodeUrl: string;
};

const state: { orders: CouponOrder[] } = {
  orders: [],
};

// Seed demo data
if (state.orders.length === 0) {
  state.orders = [
    { id: 'ORD-1001', couponId: 'c1', title: 'Bono de Aventura Extrema', merchant: 'Aventura SRL', sector: 'aventura', status: 'active', amount: -49, validUntil: new Date(Date.now() + 15*24*3600*1000).toISOString(), createdAt: new Date().toISOString(), qrCodeUrl: '' },
    { id: 'ORD-1002', couponId: 'c2', title: 'Bono de Gastronomía', merchant: 'Restó Central', sector: 'gastronomia', status: 'redeemed', amount: -35, validUntil: new Date(Date.now() - 1*24*3600*1000).toISOString(), createdAt: new Date(Date.now() - 5*24*3600*1000).toISOString(), qrCodeUrl: '' },
    { id: 'ORD-1003', couponId: 'c3', title: 'Bono de Bienestar y Relax', merchant: 'Spa Bella', sector: 'bienestar', status: 'expired', amount: -59, validUntil: new Date(Date.now() - 10*24*3600*1000).toISOString(), createdAt: new Date(Date.now() - 30*24*3600*1000).toISOString(), qrCodeUrl: '' },
  ];
}

export function addPurchase(order: CouponOrder) {
  state.orders.unshift(order);
}

export function listOrders(): CouponOrder[] {
  return state.orders.slice();
}

export function listOrdersByStatus(status: OrderStatus): CouponOrder[] {
  return state.orders.filter((o) => o.status === status);
}

export function filterCouponOrders(filter?: { status?: OrderStatus[]; text?: string; sector?: CouponOrder['sector'][] }): CouponOrder[] {
  const q = filter?.text?.trim().toLowerCase();
  return state.orders
    .filter((o) => (
      (!filter?.status || filter.status.includes(o.status)) &&
      (!filter?.sector || filter.sector.includes(o.sector)) &&
      (!q || `${o.id} ${o.title} ${o.merchant}`.toLowerCase().includes(q))
    ))
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markRedeemed(id: string) {
  const o = state.orders.find((x) => x.id === id);
  if (o) o.status = 'redeemed';
}

export function expirePastOrders(now: number = Date.now()) {
  state.orders.forEach((o) => {
    if (o.status === 'active' && new Date(o.validUntil).getTime() < now) {
      o.status = 'expired';
    }
  });
}


