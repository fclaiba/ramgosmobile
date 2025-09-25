import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCoins as loadPetCoins, saveCoins as savePetCoins } from './pet';

export type TamagotchiStore = {
  coins: number;
};

const STORAGE_KEY = 'tamagotchi_store_v1';

let store: TamagotchiStore = { coins: 0 };
let initialized = false;
const subscribers = new Set<() => void>();

async function initOnce() {
  if (initialized) return;
  initialized = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TamagotchiStore>;
      store = { coins: typeof parsed.coins === 'number' ? Math.max(0, Math.floor(parsed.coins)) : 0 };
    } else {
      // fall back to pet coin storage if present
      const coins = await loadPetCoins();
      store = { coins };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    const coins = await loadPetCoins();
    store = { coins };
  }
}

async function persist() {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  try { await savePetCoins(store.coins); } catch {}
}

export function getTamagotchi(): TamagotchiStore {
  return store;
}

export function subscribeTamagotchi(fn: () => void): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

function notify() {
  for (const s of Array.from(subscribers)) {
    try { s(); } catch {}
  }
}

export async function ensureTamagotchiReady(): Promise<void> {
  await initOnce();
}

export function spendCoins(amount: number): boolean {
  const amt = Math.max(0, Math.floor(amount));
  if (store.coins < amt) return false;
  store = { ...store, coins: store.coins - amt };
  void persist();
  notify();
  return true;
}

export function addCoins(amount: number): number {
  const amt = Math.max(0, Math.floor(amount));
  store = { ...store, coins: Math.max(0, store.coins + amt) };
  void persist();
  notify();
  return store.coins;
}

// Initialize on import asynchronously
void ensureTamagotchiReady();


