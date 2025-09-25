import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCoins, saveCoins } from './pet';
import { addCoins as addTamaCoins, ensureTamagotchiReady } from './tamagotchi';

const STORAGE_CHALLENGE = 'arcade_daily_challenge_v1';

export type ChallengeState = {
  lastCompletedAt: number | null; // ms epoch
};

export async function getCoins(): Promise<number> { return loadCoins(); }
export async function setCoins(amount: number): Promise<void> { return saveCoins(amount); }
// Award coins once: write to pet storage for backwards compatibility and to tamagotchi store
export async function awardCoins(delta: number): Promise<number> {
  const current = await loadCoins();
  const next = Math.max(0, current + Math.floor(delta));
  await saveCoins(next);
  await ensureTamagotchiReady();
  addTamaCoins(Math.max(0, Math.floor(delta)));
  return next;
}

async function loadChallenge(): Promise<ChallengeState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_CHALLENGE);
    if (raw) return JSON.parse(raw) as ChallengeState;
  } catch {}
  return { lastCompletedAt: null };
}

async function saveChallenge(s: ChallengeState): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_CHALLENGE, JSON.stringify(s)); } catch {}
}

export type DailyChallengeInfo = { available: boolean; remainingMs: number; reward: number };

export async function getDailyChallengeInfo(now = Date.now()): Promise<DailyChallengeInfo> {
  const s = await loadChallenge();
  const reward = 200;
  if (!s.lastCompletedAt) return { available: true, remainingMs: 0, reward };
  const elapsed = now - s.lastCompletedAt;
  const period = 24 * 60 * 60 * 1000; // 24h
  if (elapsed >= period) return { available: true, remainingMs: 0, reward };
  return { available: false, remainingMs: period - elapsed, reward };
}

export async function completeDailyChallenge(): Promise<{ coins: number }>
{
  const info = await getDailyChallengeInfo();
  if (!info.available) return { coins: await loadCoins() };
  const coins = await awardCoins(info.reward);
  await saveChallenge({ lastCompletedAt: Date.now() });
  return { coins };
}


