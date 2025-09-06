export type ReferralInfo = {
  code: string;
  influencerName: string;
  discountPct: number; // 0..100
};

const REFERRAL_CODES: Record<string, ReferralInfo> = {
  'SOPHIA10': { code: 'SOPHIA10', influencerName: 'Sophia Clark', discountPct: 10 },
  'MAX15': { code: 'MAX15', influencerName: 'Max Rivera', discountPct: 15 },
  'VIP20': { code: 'VIP20', influencerName: 'Elite VIP', discountPct: 20 },
};

export async function validateReferralCode(code: string): Promise<ReferralInfo | null> {
  // Simula llamada a backend. En producción validarías contra API.
  await new Promise((r) => setTimeout(r, 400));
  const key = code.trim().toUpperCase();
  return REFERRAL_CODES[key] ?? null;
}


