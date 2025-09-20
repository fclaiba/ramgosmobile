import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

const { width, height } = Dimensions.get('window');

export default function GameDuckHunt() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);
  const duckX = useRef(new Animated.Value(0)).current;
  const duckY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    const loop = () => {
      duckX.setValue(-40);
      duckY.setValue(60 + Math.random() * (height / 3));
      Animated.timing(duckX, { toValue: width, duration: 2500, useNativeDriver: true }).start(() => loop());
    };
    loop();
    return () => duckX.stopAnimation();
  }, [duckX, duckY]);

  return (
    <GameShell title="Duck Hunt">
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '900' }}>Puntos: {score}</Text>
        <View style={{ flex: 1 }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setScore((s) => s - 1)} />
          <Animated.View style={[styles.duck, { transform: [{ translateX: duckX }, { translateY: duckY }] }]}>
            <Pressable onPress={() => setScore((s) => s + 5)} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
        <Pressable style={styles.cta} onPress={async () => { const rewarded = await awardCoins(Math.min(200, score * 2)); setCoins(rewarded); setScore(0); }}>
          <Text style={{ fontWeight: '900' }}>{coins == null ? 'Cobrar Monedas' : `Saldo: ${coins}`}</Text>
        </Pressable>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  duck: { position: 'absolute', width: 40, height: 30, backgroundColor: '#fde047', borderRadius: 6 },
  cta: { marginTop: 12, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 999 },
});


