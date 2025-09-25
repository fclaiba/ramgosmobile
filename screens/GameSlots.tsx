import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';
import { spendCoins, addCoins } from '../services/tamagotchi';

const REELS = ['🍎','🍋','🍒','⭐','💎'];

export default function GameSlots() {
  const [r, setR] = useState(['❔','❔','❔']);
  const chips = [1,5,10,25,100];
  const [activeChip, setActiveChip] = useState(10);
  const [bet, setBet] = useState(10);

  const spin = async () => {
    if (!spendCoins(bet)) return;
    const next = [0,1,2].map(() => REELS[Math.floor(Math.random()*REELS.length)]);
    setR(next);
    const win = next.every((x) => x === next[0]);
    const prize = win ? 150 : 0;
    if (prize > 0) addCoins(prize);
  };

  return (
    <GameShell title="Tragamonedas">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <View style={styles.reels}>
          {r.map((x, i) => (<View key={i} style={styles.reel}><Text style={{ fontSize: 28 }}>{x}</Text></View>))}
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {chips.map((c) => (
              <TouchableOpacity key={`chip-${c}`} onPress={() => { setActiveChip(c); setBet(c); }} style={[styles.chipBtn, activeChip === c && styles.chipActive]}>
                <Text style={[styles.chipText, activeChip === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setBet((b) => Math.max(0, b - activeChip))} style={styles.adjustBtn}><Text>-{activeChip}</Text></TouchableOpacity>
            <TextInput value={String(bet)} onChangeText={(t) => setBet(Math.max(0, Math.floor(Number((t || '0').replace(/\D/g, '')))))} keyboardType={'numeric'} style={styles.amountInput} />
            <TouchableOpacity onPress={() => setBet((b) => b + activeChip)} style={styles.adjustBtn}><Text>+{activeChip}</Text></TouchableOpacity>
          </View>
          <Pressable style={styles.cta} onPress={spin}><Text style={{ fontWeight: '900' }}>Girar</Text></Pressable>
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  reels: { flexDirection: 'row', gap: 8 },
  reel: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  cta: { height: 44, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center' },
  chipBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#e6f2ea', margin: 4, backgroundColor: '#ffffff' },
  chipActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  chipText: { color: '#0f172a', fontWeight: '800' },
  chipTextActive: { color: '#166534' },
  amountInput: { minWidth: 80, textAlign: 'center', paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 8, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', fontWeight: '800' },
  adjustBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e6f2ea', marginHorizontal: 12 },
});


