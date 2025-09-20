import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

const REELS = ['🍎','🍋','🍒','⭐','💎'];

export default function GameSlots() {
  const [r, setR] = useState(['❔','❔','❔']);
  const [coins, setCoins] = useState<number | null>(null);

  const spin = async () => {
    const next = [0,1,2].map(() => REELS[Math.floor(Math.random()*REELS.length)]);
    setR(next);
    const win = next.every((x) => x === next[0]);
    const delta = win ? 150 : 0;
    setCoins(await awardCoins(delta));
  };

  return (
    <GameShell title="Tragamonedas">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <View style={styles.reels}>
          {r.map((x, i) => (<View key={i} style={styles.reel}><Text style={{ fontSize: 28 }}>{x}</Text></View>))}
        </View>
        <Pressable style={styles.cta} onPress={spin}><Text style={{ fontWeight: '900' }}>Girar</Text></Pressable>
        {coins != null && <Text>Saldo: {coins}</Text>}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  reels: { flexDirection: 'row', gap: 8 },
  reel: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  cta: { height: 44, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center' },
});


