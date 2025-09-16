export type EventItem = {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  location: string;
  date: number; // epoch
  category: 'Música' | 'Tecnología' | 'Deportes' | 'Arte' | 'Gastronomía';
  ratingAvg: number;
  ratingCount: number;
  coordinate?: { latitude: number; longitude: number };
};

const EVENTS: EventItem[] = [
  { id: 'e1', title: 'Festival de Música Indie', description: 'Bandas locales y food trucks.', images: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop'], price: 25, location: 'Centro', date: Date.now() + 7*24*3600*1000, category: 'Música', ratingAvg: 4.6, ratingCount: 120, coordinate: { latitude: -34.6037, longitude: -58.3816 } },
  { id: 'e2', title: 'Conferencia Tech', description: 'Charlas de IA y Cloud.', images: ['https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'], price: 0, location: 'Norte', date: Date.now() + 14*24*3600*1000, category: 'Tecnología', ratingAvg: 4.4, ratingCount: 85, coordinate: { latitude: -34.608, longitude: -58.377 } },
  { id: 'e3', title: 'Feria Gastronómica', description: 'Sabores del mundo.', images: ['https://images.unsplash.com/photo-1533777324565-a040eb52fac1?q=80&w=1200&auto=format&fit=crop'], price: 10, location: 'Sur', date: Date.now() + 3*24*3600*1000, category: 'Gastronomía', ratingAvg: 4.7, ratingCount: 150, coordinate: { latitude: -34.61, longitude: -58.39 } },
];

export function getEvents(): EventItem[] { return EVENTS; }
export function getEventById(id: string): EventItem | undefined { return EVENTS.find(e=>e.id===id); }

export function getRatingDistribution(avg: number): { stars: 1|2|3|4|5; percent: number }[] {
  // Simple distribution model: peak near avg
  const base = [5,4,3,2,1] as const;
  const weights = base.map((s) => {
    const d = Math.abs(avg - s);
    return Math.max(0, 1.5 - d); // triangular
  });
  const sum = weights.reduce((a,b)=>a+b,0) || 1;
  return base.map((s, i) => ({ stars: s, percent: Math.round((weights[i]/sum)*100) })) as any;
}

// Tickets / órdenes de eventos
export type EventOrderStatus = 'active' | 'used' | 'expired' | 'cancelled';
export type EventOrder = {
  id: string;
  eventId: string;
  title: string;
  status: EventOrderStatus;
  date: number;
  amount: number;
  userId: string;
};

let EVENT_ORDERS: EventOrder[] = [];

export function addEventOrder(o: EventOrder) { EVENT_ORDERS.unshift(o); }
export function listEventOrders(filter?: { status?: EventOrderStatus[]; userId?: string }): EventOrder[] {
  const arr = EVENT_ORDERS.slice();
  return arr.filter(o => (
    (!filter?.status || filter.status.includes(o.status)) &&
    (!filter?.userId || o.userId === filter.userId)
  ));
}

export function filterEventOrders(filter?: { status?: EventOrderStatus[]; text?: string; userId?: string }): EventOrder[] {
  const q = filter?.text?.trim().toLowerCase();
  return EVENT_ORDERS.slice().filter(o => (
    (!filter?.status || filter.status.includes(o.status)) &&
    (!filter?.userId || o.userId === filter.userId) &&
    (!q || `${o.id} ${o.title}`.toLowerCase().includes(q))
  ));
}

// Seed demo
if (EVENT_ORDERS.length === 0) {
  EVENT_ORDERS = [
    { id: 'EVT-1001', eventId: 'e1', title: 'Festival de Música Indie', status: 'active', date: Date.now() + 5*24*3600*1000, amount: 25, userId: 'u_me' },
    { id: 'EVT-1002', eventId: 'e2', title: 'Conferencia Tech', status: 'used', date: Date.now() - 1*24*3600*1000, amount: 0, userId: 'u_me' },
    { id: 'EVT-1003', eventId: 'e3', title: 'Feria Gastronómica', status: 'expired', date: Date.now() - 10*24*3600*1000, amount: 10, userId: 'u1' },
  ];
}


