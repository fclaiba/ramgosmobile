export type OrderStatus = 'active' | 'redeemed' | 'expired';

export type CouponOrder = {
  id: string; // order id
  couponId: string;
  title: string;
  merchant: string;
  sector: 'gastronomia' | 'aventura' | 'bienestar' | 'cultura' | 'otros';
  status: OrderStatus;
  validUntil: string; // ISO date
  createdAt: string; // ISO date
  qrCodeUrl: string;
};

const state: { orders: CouponOrder[] } = {
  orders: [],
};

export function addPurchase(order: CouponOrder) {
  state.orders.unshift(order);
}

export function listOrders(): CouponOrder[] {
  return state.orders.slice();
}

export function listOrdersByStatus(status: OrderStatus): CouponOrder[] {
  return state.orders.filter((o) => o.status === status);
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


