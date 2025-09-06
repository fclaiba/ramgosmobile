export type Product = {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  condition: 'new' | 'used' | 'refurbished';
  location: string; // city / area label
  ratingAvg: number; // 0..5
  ratingCount: number;
  badge?: 'popular' | 'new';
  category: 'Ropa' | 'Electrónica' | 'Hogar' | 'Juguetes' | 'Libros' | 'Deportes';
  shipping: 'free' | 'paid';
  createdAt: number; // epoch ms
  coordinate: { latitude: number; longitude: number };
};

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Cámara digital',
    description: 'Cámara compacta de alta resolución, ideal para viajes y fotografía casual.',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 150,
    condition: 'used',
    location: 'Centro',
    ratingAvg: 4.4,
    ratingCount: 28,
    badge: 'popular',
    category: 'Electrónica',
    shipping: 'free',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    coordinate: { latitude: -34.6037, longitude: -58.3816 },
  },
  {
    id: 'p2',
    title: 'Cámara instantánea',
    description: 'Cámara instantánea en excelente estado, incluye 2 cartuchos.',
    images: [
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 80,
    condition: 'used',
    location: 'Norte',
    ratingAvg: 4.2,
    ratingCount: 16,
    category: 'Electrónica',
    shipping: 'paid',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    coordinate: { latitude: -34.608, longitude: -58.377 },
  },
  {
    id: 'p3',
    title: 'Cámara profesional',
    description: 'Cámara mirrorless profesional con lente 24-70mm f/2.8.',
    images: [
      'https://images.unsplash.com/photo-1519183071298-a2962be96f83?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 500,
    condition: 'refurbished',
    location: 'Sur',
    ratingAvg: 4.8,
    ratingCount: 54,
    badge: 'new',
    category: 'Electrónica',
    shipping: 'free',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    coordinate: { latitude: -34.599, longitude: -58.39 },
  },
  {
    id: 'p4',
    title: 'Cámara de video',
    description: 'Videocámara Full HD con estabilización y micrófono externo.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 200,
    condition: 'used',
    location: 'Oeste',
    ratingAvg: 4.5,
    ratingCount: 33,
    category: 'Electrónica',
    shipping: 'paid',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    coordinate: { latitude: -34.61, longitude: -58.384 },
  },
];

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export type NewProductInput = Omit<Product, 'id' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'badge'> & {
  badge?: Product['badge'];
};

export function createProduct(input: NewProductInput): Product {
  const prod: Product = {
    ...input,
    id: `p_${Date.now()}`,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: Date.now(),
  };
  PRODUCTS.unshift(prod);
  return prod;
}


