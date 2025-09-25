import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

type Card = { id: number; icon: string; matched: boolean; revealed: boolean };

export default function GameMemory() {
  const baseIcons = ['🐶','🐱','🦴','🧸','🪀','🟢','🦴','🐾'];
  const [cards, setCards] = useState<Card[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [state, setState] = useState<'ready' | 'playing' | 'won' | 'over'>('ready');

  const initDeck = () => {
    const chosen = baseIcons.slice(0, 8);
    const deck = [...chosen, ...chosen]
      .map((icon, i) => ({ id: i + 1, icon, matched: false, revealed: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
  };

  useEffect(() => {
    initDeck();
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    const allMatched = cards.length > 0 && cards.every((c) => c.matched);
    if (allMatched) { setState('won'); }
  }, [cards, state]);

  const setToastMsg = (msg: string, ms = 1200) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const applyRandomEffect = () => {
    // Probabilidades: vida+ (15%), revelar (12%), mezclar (10%), vida- (8%), autocompletar (2%)
    const r = Math.random();
    if (r < 0.15) {
      setLives((v) => Math.min(5, v + 1));
      setToastMsg('Vida extra ❤️');
      return;
    }
    if (r < 0.27) {
      // Revelar todos brevemente
      setToastMsg('Mostrando todas las cartas 👀');
      const prev = cards;
      setCards((cs) => cs.map((c) => ({ ...c, revealed: true })));
      setLock(true);
      setTimeout(() => {
        setCards((cs) => cs.map((c, idx) => ({ ...c, revealed: prev[idx].matched })));
        setLock(false);
      }, 1200);
      return;
    }
    if (r < 0.37) {
      // Barajar
      setToastMsg('Barajando 🔀');
      setCards((cs) => [...cs].sort(() => Math.random() - 0.5));
      return;
    }
    if (r < 0.45) {
      // Perder vida
      setToastMsg('¡Ups! Pierdes una vida 💔');
      setLives((v) => Math.max(0, v - 1));
      return;
    }
    if (r < 0.47) {
      // Autocompletar (raro)
      setToastMsg('¡Golpe de suerte! Todo resuelto ✨');
      setCards((cs) => cs.map((c) => ({ ...c, matched: true, revealed: true })));
      return;
    }
  };

  const onFlip = (id: number) => {
    if (lock || state !== 'playing') return;
    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.matched || clicked.revealed) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, revealed: true } : c)));
    if (sel == null) { setSel(id); return; }
    const first = cards.find((c) => c.id === sel);
    if (!first) { setSel(null); return; }
    setLock(true);
    if (first.icon === clicked.icon) {
      // Match
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === first.id || c.id === id ? { ...c, matched: true } : c)));
        setScore((s) => s + 10);
        setLock(false);
        applyRandomEffect();
      }, 250);
    } else {
      // Mismatch => perder vida
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === first.id || c.id === id ? { ...c, revealed: false } : c)));
        setLives((v) => Math.max(0, v - 1));
        setLock(false);
      }, 350);
    }
    setSel(null);
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (lives <= 0) setState('over');
  }, [lives, state]);

  const start = () => {
    setScore(0);
    setLives(3);
    setSel(null);
    setLock(false);
    setToast(null);
    initDeck();
    setState('playing');
  };

  const matchedCount = useMemo(() => cards.filter((c) => c.matched).length, [cards]);

  return (
    <GameShell title="Juego de Memoria">
      <View style={styles.hudRow}>
        <Text style={styles.hudText}>❤️ {lives}</Text>
        <Text style={styles.hudText}>Puntos: {score}</Text>
        <Text style={styles.hudText}>✔️ {matchedCount}/{cards.length}</Text>
      </View>

      {toast ? (
        <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>
      ) : null}

      <View style={styles.grid}>
        {cards.map((c) => (
          <Pressable key={c.id} style={[styles.card, c.matched && styles.cardMatched]} onPress={() => onFlip(c.id)}>
            <Text style={{ fontSize: 24 }}>{c.revealed || c.matched ? c.icon : '❓'}</Text>
          </Pressable>
        ))}
      </View>

      {state !== 'playing' && (
        <Pressable style={styles.cta} onPress={start}>
          <Text style={{ fontWeight: '900' }}>{state === 'ready' ? 'Comenzar' : state === 'won' ? '¡Ganaste! Reintentar' : 'Game Over · Reintentar'}</Text>
        </Pressable>
      )}

      {(state === 'won' || state === 'over') && (
        <Pressable style={[styles.cta, { marginTop: 8 }]} onPress={async () => { const rewarded = await awardCoins(Math.min(300, score)); setCoins(rewarded); }}>
          <Text style={{ fontWeight: '900' }}>{coins == null ? 'Cobrar Monedas' : `Saldo: ${coins}`}</Text>
        </Pressable>
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  hudText: { color: '#0f172a', fontWeight: '800' },
  toast: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#111827', borderRadius: 999 },
  toastText: { color: '#f9fafb', fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  card: { width: '22%', aspectRatio: 1, backgroundColor: '#ffffff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  cardMatched: { backgroundColor: '#dcfce7' },
  cta: { marginTop: 12, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 999 },
});


