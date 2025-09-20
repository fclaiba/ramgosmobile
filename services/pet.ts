import AsyncStorage from '@react-native-async-storage/async-storage';

export type PetStats = {
  happiness: number; // 0-100
  hunger: number;    // 0-100 (menor es mejor)
  cleanliness: number; // 0-100
  health: number; // 0-100
  level: number; // >=1
  name: string;
  sleeping: boolean;
};

const STORAGE_KEY = 'pet_state_v1';
const STORAGE_INV = 'pet_inventory_v1';
const STORAGE_COINS = 'pet_coins_v1';
const STORAGE_NUTRITION = 'pet_nutrition_v1';

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

export async function loadPetState(): Promise<PetStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PetStats;
      return normalize(parsed);
    }
  } catch {}
  return normalize({
    happiness: 80,
    hunger: 30,
    cleanliness: 70,
    health: 100,
    level: 1,
    name: 'Pipo',
    sleeping: false,
  });
}

export async function savePetState(state: PetStats): Promise<void> {
  try {
    const normalized = normalize(state);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {}
}

function normalize(s: PetStats): PetStats {
  return {
    happiness: clamp(s.happiness),
    hunger: clamp(s.hunger),
    cleanliness: clamp(s.cleanliness),
    health: clamp(s.health),
    level: Math.max(1, Math.round(s.level || 1)),
    name: s.name || 'Pipo',
    sleeping: !!s.sleeping,
  };
}

// Gameplay logic
export function feed(state: PetStats): PetStats {
  const next = { ...state };
  next.hunger = clamp(state.hunger - 25);
  next.happiness = clamp(state.happiness + 5);
  return evaluateLevel(next);
}

export function play(state: PetStats): PetStats {
  const next = { ...state };
  next.happiness = clamp(state.happiness + 15);
  next.hunger = clamp(state.hunger + 10);
  next.cleanliness = clamp(state.cleanliness - 10);
  return evaluateLevel(next);
}

export function clean(state: PetStats): PetStats {
  const next = { ...state };
  next.cleanliness = clamp(state.cleanliness + 25);
  next.happiness = clamp(state.happiness + 5);
  return evaluateLevel(next);
}

export function heal(state: PetStats): PetStats {
  const next = { ...state };
  next.health = clamp(state.health + 20);
  next.happiness = clamp(state.happiness + 2);
  return evaluateLevel(next);
}

export function toggleSleep(state: PetStats): PetStats {
  const next = { ...state, sleeping: !state.sleeping };
  if (next.sleeping) {
    // Al dormir, mejora salud y baja hambre lentamente (aplicado en tick)
  }
  return next;
}

// Simple leveling based on aggregate wellness
function evaluateLevel(state: PetStats): PetStats {
  const average = (state.happiness + (100 - state.hunger) + state.cleanliness + state.health) / 4;
  const level = 1 + Math.floor(average / 25); // 1..5 con umbrales 0,25,50,75,100
  return { ...state, level };
}

// Background decay/growth per tick (e.g., every app open)
export function applyTick(state: PetStats, hours = 1): PetStats {
  const factor = Math.max(0, Math.min(24, hours));
  const next = { ...state };
  next.hunger = clamp(state.hunger + 3 * factor);
  next.cleanliness = clamp(state.cleanliness - 2 * factor);
  next.happiness = clamp(state.happiness - 1 * factor);
  if (state.sleeping) {
    next.health = clamp(state.health + 2 * factor);
    next.hunger = clamp(next.hunger + 1 * factor);
  } else {
    next.health = clamp(state.health - 0.5 * factor);
  }
  return evaluateLevel(next);
}

export type PetAction = 'feed' | 'play' | 'clean' | 'heal' | 'sleep';

export function reducePet(state: PetStats, action: PetAction): PetStats {
  switch (action) {
    case 'feed':
      return feed(state);
    case 'play':
      return play(state);
    case 'clean':
      return clean(state);
    case 'heal':
      return heal(state);
    case 'sleep':
      return toggleSleep(state);
    default:
      return state;
  }
}

// --- Inventory & feeding with items ---
export type FoodKey = 'apple' | 'bread' | 'carrot' | 'meat' | 'fish' | 'cake';

export type PetInventory = Record<FoodKey, number>;

export type FoodInfo = {
  key: FoodKey;
  label: string;
  emoji: string;
  effect: { hunger: number; happiness?: number; cleanliness?: number; health?: number };
  nutrition: { hydration?: number; protein?: number; carbs?: number; vitamins?: number };
};

export const FOODS: FoodInfo[] = [
  { key: 'apple', label: 'Manzana', emoji: '🍎', effect: { hunger: -10, happiness: 4 }, nutrition: { hydration: 6, vitamins: 10, carbs: 6 } },
  { key: 'bread', label: 'Pan', emoji: '🍞', effect: { hunger: -12 }, nutrition: { carbs: 12 } },
  { key: 'carrot', label: 'Zanahoria', emoji: '🥕', effect: { hunger: -8, health: 2 }, nutrition: { vitamins: 12, hydration: 4, carbs: 4 } },
  { key: 'meat', label: 'Carne', emoji: '🍖', effect: { hunger: -20, happiness: 6, health: 2 }, nutrition: { protein: 16 } },
  { key: 'fish', label: 'Pescado', emoji: '🐟', effect: { hunger: -18, health: 3 }, nutrition: { protein: 14, vitamins: 4 } },
  { key: 'cake', label: 'Pastel', emoji: '🍰', effect: { hunger: -5, happiness: 10, cleanliness: -4 }, nutrition: { carbs: 10, hydration: 2 } },
];

const DEFAULT_INV: PetInventory = { apple: 5, bread: 3, carrot: 8, meat: 2, fish: 4, cake: 1 };

export async function loadPetInventory(): Promise<PetInventory> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_INV);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PetInventory>;
      return { ...DEFAULT_INV, ...parsed } as PetInventory;
    }
  } catch {}
  return { ...DEFAULT_INV };
}

export async function savePetInventory(inv: PetInventory): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_INV, JSON.stringify(inv));
  } catch {}
}

export function feedWithFood(state: PetStats, inv: PetInventory, food: FoodKey): { state: PetStats; inventory: PetInventory } {
  if ((inv[food] || 0) <= 0) return { state, inventory: inv };
  const info = FOODS.find((f) => f.key === food)!;
  let next = { ...state };
  next.hunger = clamp(state.hunger + (info.effect.hunger || 0));
  if (info.effect.happiness) next.happiness = clamp(state.happiness + info.effect.happiness);
  if (info.effect.cleanliness) next.cleanliness = clamp(state.cleanliness + info.effect.cleanliness);
  if (info.effect.health) next.health = clamp(state.health + info.effect.health);
  next = evaluateLevel(next);
  const nextInv: PetInventory = { ...inv, [food]: Math.max(0, (inv[food] || 0) - 1) } as PetInventory;
  return { state: next, inventory: nextInv };
}

export function addFood(inv: PetInventory, food: FoodKey, amount = 1): PetInventory {
  return { ...inv, [food]: Math.max(0, (inv[food] || 0) + amount) } as PetInventory;
}

// --- Coins / wallet ---
export async function loadCoins(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_COINS);
    if (raw) return Math.max(0, parseInt(raw, 10) || 0);
  } catch {}
  return 100; // initial grant
}

export async function saveCoins(amount: number): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_COINS, String(Math.max(0, Math.floor(amount)))); } catch {}
}

// Purchase a basic food pack (+1 each food)
export const FOOD_PACK_COST = 15;

export function purchaseFoodPack(inv: PetInventory, coins: number): { inventory: PetInventory; coins: number; ok: boolean } {
  if (coins < FOOD_PACK_COST) return { inventory: inv, coins, ok: false };
  const next: PetInventory = { ...inv } as PetInventory;
  (Object.keys(next) as FoodKey[]).forEach((k) => { next[k] = (next[k] || 0) + 1; });
  return { inventory: next, coins: coins - FOOD_PACK_COST, ok: true };
}

// --- Nutrition ---
export type PetNutrition = { hydration: number; protein: number; carbs: number; vitamins: number };

export async function loadPetNutrition(): Promise<PetNutrition> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_NUTRITION);
    if (raw) {
      const p = JSON.parse(raw) as PetNutrition;
      return normalizeNutrition(p);
    }
  } catch {}
  return normalizeNutrition({ hydration: 60, protein: 50, carbs: 50, vitamins: 55 });
}

export async function savePetNutrition(n: PetNutrition): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_NUTRITION, JSON.stringify(normalizeNutrition(n))); } catch {}
}

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
function normalizeNutrition(n: PetNutrition): PetNutrition {
  return { hydration: clamp100(n.hydration), protein: clamp100(n.protein), carbs: clamp100(n.carbs), vitamins: clamp100(n.vitamins) };
}


