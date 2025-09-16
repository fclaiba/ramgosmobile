export type Review = {
  id: string;
  userId: string; // profile owner
  author: { name: string; avatarUrl?: string };
  rating: number; // 1..5
  text: string;
  createdAt: number;
};

let REVIEWS: Review[] = [
  { id: 'r1', userId: 'u1', author: { name: 'Cliente Satisfecho', avatarUrl: 'https://i.pravatar.cc/100?img=12' }, rating: 4, text: '¡Excelente servicio y productos de alta calidad! Totalmente recomendado.', createdAt: Date.now() - 2*3600*1000 },
  { id: 'r2', userId: 'u1', author: { name: 'Otro Cliente', avatarUrl: 'https://i.pravatar.cc/100?img=18' }, rating: 5, text: 'La atención fue increíble, resolvieron todas mis dudas. Volveré a comprar.', createdAt: Date.now() - 26*3600*1000 },
];

export function listReviewsByUser(userId: string): Review[] {
  return REVIEWS.filter(r => r.userId === userId).sort((a,b)=>b.createdAt-a.createdAt);
}

export function getAverageRating(userId: string): { avg: number; count: number } {
  const arr = REVIEWS.filter(r => r.userId === userId);
  if (arr.length === 0) return { avg: 0, count: 0 };
  const avg = arr.reduce((s,r)=>s+r.rating,0) / arr.length;
  return { avg: Math.round(avg*10)/10, count: arr.length };
}

export function addReview(input: Omit<Review,'id'|'createdAt'>): Review {
  const r: Review = { ...input, id: 'r_'+Math.random().toString(36).slice(2,8), createdAt: Date.now() };
  REVIEWS.unshift(r);
  return r;
}


