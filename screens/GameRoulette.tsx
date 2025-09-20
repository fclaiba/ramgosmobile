import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

export default function GameRoulette() {
  const [result, setResult] = useState<string | null>(null);
  const [coins, setCoins] = useState<number | null>(null);

  const spin = async () => {
    const outcomes = ['Ganaste +50', 'Ganaste +100', 'Perdiste', 'Ganaste +25'];
    const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
    setResult(pick);
    const delta = pick.includes('Perdiste') ? 0 : parseInt(pick.replace(/\D+/g, ''));
    setCoins(await awardCoins(delta));
  };

  return (
    <GameShell title="Ruleta">
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text style={{ marginBottom: 12, fontWeight: '900' }}>{result ?? 'Gira para probar tu suerte'}</Text>
        <Pressable style={styles.cta} onPress={spin}><Text style={{ fontWeight: '900' }}>Girar</Text></Pressable>
        {coins != null && <Text style={{ marginTop: 8, color: '#0f172a' }}>Saldo: {coins}</Text>}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({ cta: { height: 44, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center' } });


