import { listPayments } from './payments';

export type RangeKey = '7d' | '30d' | '90d';

function rangeToMs(range: RangeKey): number {
  return range === '7d' ? 7 * 24 * 3600 * 1000 : range === '30d' ? 30 * 24 * 3600 * 1000 : 90 * 24 * 3600 * 1000;
}

export function getFunnel(range: RangeKey): { visitors: number; signups: number; completed: number; active: number } {
  const now = Date.now();
  const from = now - rangeToMs(range);
  const payments = listPayments().filter((p) => p.createdAt >= from);
  const txs = payments.length;
  const visitors = 10000 + Math.floor(txs * 12.7);
  const signups = Math.floor(visitors * 0.75);
  const completed = Math.floor(signups * 0.66);
  const active = Math.floor(completed * 0.5);
  return { visitors, signups, completed, active };
}

export function getActivityHeatmap(range: RangeKey): number[][] {
  // 4 rows x 7 days, values 0..1
  const rows = 4;
  const cols = 7;
  const base: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const seed = (r * 7 + c + (range === '7d' ? 3 : range === '30d' ? 12 : 20)) % 10;
      row.push((seed + 2) / 10);
    }
    base.push(row);
  }
  return base;
}

export function getTransactionsSeries(range: RangeKey): { label: string; value: number }[] {
  const now = Date.now();
  const from = now - rangeToMs(range);
  const payments = listPayments().filter((p) => p.createdAt >= from);
  // Group by day
  const byDay = new Map<string, number>();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 30; // bucket to max 30 points
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, 0);
  }
  payments.forEach((p) => {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + Math.abs(p.amount));
  });
  return Array.from(byDay.entries()).map(([k, v]) => ({ label: k.slice(5), value: Math.round(v) }));
}

export function getGeoDistribution(range: RangeKey): { region: string; percent: number }[] {
  // Simple static distribution that can be refined later
  const base = [
    { region: 'Norte', percent: 35 },
    { region: 'Centro', percent: 25 },
    { region: 'Sur', percent: 20 },
    { region: 'Este', percent: 10 },
    { region: 'Oeste', percent: 10 },
  ];
  return base;
}


