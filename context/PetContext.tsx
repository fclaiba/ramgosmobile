import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type PetIdentity = {
  name: string;
  breed: string;
  avatarUrl?: string;
  accentColor?: string;
};

export type PetStats = {
  hunger: number; // 0-100 (0 lleno, 100 con hambre)
  energy: number; // 0-100
  mood: number;   // 0-100
  lastUpdatedMs: number;
};

type PetContextType = {
  identity: PetIdentity;
  setIdentity: (p: Partial<PetIdentity>) => void;
  stats: PetStats;
  feed: () => void;
  play: () => void;
  rest: () => void;
  dogGallery: string[];
};

const DEFAULT_DOGS: string[] = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=1200&auto=format&fit=crop',
];

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentityState] = useState<PetIdentity>({
    name: 'Firulais',
    breed: 'Labrador',
    avatarUrl: DEFAULT_DOGS[0],
    accentColor: '#f59e0b',
  });
  const [stats, setStats] = useState<PetStats>({ hunger: 40, energy: 70, mood: 75, lastUpdatedMs: Date.now() });

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const setIdentity = useCallback((p: Partial<PetIdentity>) => {
    setIdentityState((prev: PetIdentity) => ({ ...prev, ...p }));
  }, []);

  const feed = useCallback(() => {
    setStats((s: PetStats) => ({ hunger: clamp(s.hunger - 30), energy: clamp(s.energy + 5), mood: clamp(s.mood + 10), lastUpdatedMs: Date.now() }));
  }, []);

  const play = useCallback(() => {
    setStats((s: PetStats) => ({ hunger: clamp(s.hunger + 10), energy: clamp(s.energy - 20), mood: clamp(s.mood + 15), lastUpdatedMs: Date.now() }));
  }, []);

  const rest = useCallback(() => {
    setStats((s: PetStats) => ({ hunger: clamp(s.hunger + 5), energy: clamp(s.energy + 30), mood: clamp(s.mood + 5), lastUpdatedMs: Date.now() }));
  }, []);

  const value = useMemo<PetContextType>(() => ({ identity, setIdentity, stats, feed, play, rest, dogGallery: DEFAULT_DOGS }), [identity, setIdentity, stats, feed, play, rest]);

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used within PetProvider');
  return ctx;
}

