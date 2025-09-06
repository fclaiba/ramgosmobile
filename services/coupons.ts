export type Coupon = {
  id: string;
  title: string;
  description: string;
  images: string[];
  sector: 'gastronomia' | 'aventura' | 'bienestar' | 'cultura';
  price: number;
  originalPrice?: number;
  distanceKm: number;
  badge?: 'popular' | 'nuevo';
  remaining: number;
  offerEndsAt: string; // ISO date
  ratingAvg: number; // 0..5
  ratingCount: number;
  ratingDistribution: { stars: 1 | 2 | 3 | 4 | 5; percent: number }[];
  location: { lat: number; lng: number };
};

export const COUPONS: Coupon[] = [
  {
    id: 'c1',
    title: 'Bono de Aventura Extrema',
    description:
      'Atrévete a vivir emociones fuertes con escalada, tirolesa y rapel guiado por expertos. Incluye equipo y seguro.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1AznY0dxFoMQ8aS2xSW3VtXSfoIZB87asmAhv51D9WWeIXSLHL74_9gl01ztM9UWdmhoezXyz10NwjkH57nC2vdC_XDuBDf02RpPvuvZQ4hMJDRTltwrgzX-KgljMtgc52chx9GlrMyh800yTa_uunnh1wCB3sx52_2h5HbHK5ll-wSsbrtoObidJ2rcoFPOLoucLPDNqD0YUQqmV8ehYKGrxSdm_0BAaEj1xe0tVD_neB-QMvEmvqxjgDADFmXCPjyIYjJJ4875M',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
    ],
    sector: 'aventura',
    price: 49,
    originalPrice: 79,
    distanceKm: 2.1,
    badge: 'popular',
    remaining: 8,
    offerEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 52).toISOString(),
    ratingAvg: 4.6,
    ratingCount: 87,
    ratingDistribution: [
      { stars: 5, percent: 48 },
      { stars: 4, percent: 31 },
      { stars: 3, percent: 12 },
      { stars: 2, percent: 6 },
      { stars: 1, percent: 3 },
    ],
    location: { lat: 28.9, lng: -81.3 },
  },
  {
    id: 'c2',
    title: 'Bono de Gastronomía',
    description:
      'Disfruta de experiencias culinarias en un menú degustación de 5 tiempos con maridaje incluido.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAsd-CdoY0VnkCTVeLU26lDRcoYXdC3ba6w5yt3mnYBXIDYq99vkaEPriWLVX4z2R6ZmfqUw89g_7B59PS1R1lSExOdv-gf0FUcSg9bwy5HClw3OIy-i_6T_uxnKPTs12P4s59DoczdaQHnxrRAfEu7U4o3kzTEge3OMc445ZwtogznetKYwcrehy4-syt0wbMouLV71m2kF8kHOhU0l5F6DQ0wvRzIxeitRSjYZHI9Bn9JPY4HZlkrsZF8nSjjMS0NMkWnCqxemaTo',
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    ],
    sector: 'gastronomia',
    price: 35,
    originalPrice: 50,
    distanceKm: 6.5,
    badge: 'nuevo',
    remaining: 12,
    offerEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 80).toISOString(),
    ratingAvg: 4.4,
    ratingCount: 120,
    ratingDistribution: [
      { stars: 5, percent: 40 },
      { stars: 4, percent: 30 },
      { stars: 3, percent: 15 },
      { stars: 2, percent: 10 },
      { stars: 1, percent: 5 },
    ],
    location: { lat: 28.9, lng: -81.3 },
  },
  {
    id: 'c3',
    title: 'Bono de Bienestar y Relax',
    description: 'Relájate y rejuvenece con spa, sauna y masaje relajante de 60 minutos.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAK0hz1gGapZ57ECPIOgTJXYH15yYgwdRyY5GWCRngHmfwaFhy1xTdnZh0Xl1H9yweM2naLhV6RmiJzWf7CAY7L_Jiox8GXnbwMHj_jvi2wBE6e1WUQ9Lg361EcrEQJRUPMDdQzPPKRMNYopJFo0mDqL6BqjvcwHLzf9GjqwwcOb_5W3GDofP3OTgVf2BXE-4-2PbUr7A-vqw4mncpL5R1vbKS6BEvFYRqSZbGyID6S0eeGKDkrNzSoTZSrM_kdV6nSGG_ZGuYQ9tG7',
      'https://images.unsplash.com/photo-1556228724-4a76c06013f7?q=80&w=1200&auto=format&fit=crop',
    ],
    sector: 'bienestar',
    price: 59,
    originalPrice: 89,
    distanceKm: 10.2,
    remaining: 5,
    offerEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
    ratingAvg: 4.8,
    ratingCount: 62,
    ratingDistribution: [
      { stars: 5, percent: 60 },
      { stars: 4, percent: 28 },
      { stars: 3, percent: 8 },
      { stars: 2, percent: 3 },
      { stars: 1, percent: 1 },
    ],
    location: { lat: 28.9, lng: -81.3 },
  },
  {
    id: 'c4',
    title: 'Bono de Cultura y Arte',
    description: 'Sumérgete en el arte y la cultura con acceso a exposiciones y taller guiado.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcGlmqszA_bqVaqmGjOO2QvzbIGdd3wsFAE2Yh0eKjiRnawfRHix4KJPTbcOznSXJgCo0YKpkVGqF9hsO4zPlLvFJS_yw5TBUPbj9D14AsfZ9ffQ3B1Xt1KHVPyg4TfkquJDIBSp-OpnmR_63GycBYAJSA7R2RLEyTP2uCcHqrfj10TFAegYqrUvpchw9Hy9XejhPy3T4pJ7fHCyGMbZ9JvGFD-c-nFqMYQbqHdaWZShWZ3Enqykz_2cTpSGvR5NhiWLIK8_dkaclK',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    ],
    sector: 'cultura',
    price: 29,
    distanceKm: 1.8,
    remaining: 20,
    offerEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    ratingAvg: 4.2,
    ratingCount: 44,
    ratingDistribution: [
      { stars: 5, percent: 38 },
      { stars: 4, percent: 34 },
      { stars: 3, percent: 16 },
      { stars: 2, percent: 8 },
      { stars: 1, percent: 4 },
    ],
    location: { lat: 28.9, lng: -81.3 },
  },
];

export function getCoupons(): Coupon[] {
  return COUPONS;
}

export function getCouponById(id: string): Coupon | undefined {
  return COUPONS.find((c) => c.id === id);
}


