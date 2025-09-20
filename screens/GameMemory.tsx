import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

type Card = { id: number; icon: string; matched: boolean; revealed: boolean };

export default function GameMemory() {
  const icons = ['🐶','🐱','🦴','🧸','🪀','🟢'];
  const [cards, setCards] = useState<Card[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ id: i, icon, matched: false, revealed: false }));
    setCards(deck);
  }, []);

  const onFlip = (id: number) => {
    setCards((prev) => prev.map((c) => (c.id === id && !c.matched ? { ...c, revealed: !c.revealed } : c)));
    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.matched) return;
    if (sel == null) { setSel(id); return; }
    const first = cards.find((c) => c.id === sel);
    if (first && first.icon === clicked.icon) {
      setCards((prev) => prev.map((c) => (c.icon === first.icon ? { ...c, matched: true } : c)));
      setScore((s) => s + 10);
    } else {
      setTimeout(() => setCards((prev) => prev.map((c) => (c.id === id || c.id === sel ? { ...c, revealed: false } : c))), 500);
    }
    setSel(null);
  };

  return (
    <GameShell title="Juego de Memoria">
      <Text style={{ fontWeight: '900' }}>Puntos: {score}</Text>
      <View style={styles.grid}>
        {cards.map((c) => (
          <Pressable key={c.id} style={[styles.card, c.matched && styles.cardMatched]} onPress={() => onFlip(c.id)}>
            <Text style={{ fontSize: 24 }}>{c.revealed || c.matched ? c.icon : '❓'}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.cta} onPress={async () => {
        const rewarded = await awardCoins(Math.min(200, score));
        setCoins(rewarded);
        setScore(0);
      }}>
        <Text style={{ fontWeight: '900' }}>{coins == null ? 'Cobrar Monedas' : `Saldo: ${coins}`}</Text>
      </Pressable>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  card: { width: '22%', aspectRatio: 1, backgroundColor: '#ffffff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  cardMatched: { backgroundColor: '#dcfce7' },
  cta: { marginTop: 12, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 999 },
});


