import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { awardCoins } from '../services/arcade';
import { GameShell } from './games';

const { width: W, height: H } = Dimensions.get('window');
const S = Math.min(W, H);

type ItemType = 'fruit' | 'spider' | 'skull' | 'power_magnet' | 'power_slow' | 'power_fast';
type Item = { id: number; x: number; y: number; vy: number; type: ItemType };

export default function GameFruits() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [state, setState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [tick, setTick] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mult, setMult] = useState(1);

  const basketWidth = Math.round(S * 0.22);
  const itemSize = Math.round(S * 0.08);

  const basketXAnim = useRef(new Animated.Value(W / 2 - basketWidth / 2)).current;
  const basketXRef = useRef(W / 2 - basketWidth / 2);
  useEffect(() => {
    const sub = basketXAnim.addListener(({ value }) => (basketXRef.current = value));
    return () => basketXAnim.removeListener(sub);
  }, [basketXAnim]);

  const itemsRef = useRef<Item[]>([]);
  const idRef = useRef(1);
  const speedRef = useRef(1);
  const magnetUntil = useRef(0);
  const startAt = useRef(Date.now());
  const spawnAcc = useRef(0);

  useEffect(() => {
    if (state !== 'playing') return;
    let raf = 0;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = Math.min(50, now - last) / 1000;
      last = now;

      // spawn con acumulador para mayor densidad y estabilidad
      const timeFactor = 1 + Math.min(2, (now - startAt.current) / 30000); // 1→3 en 1 minuto
      const spawnRate = 4 * timeFactor; // ítems por segundo (4→12)
      spawnAcc.current += spawnRate * dt;
      const maxOnScreen = 40;
      while (spawnAcc.current >= 1 && itemsRef.current.length < maxOnScreen) {
        spawnAcc.current -= 1;
        const r = Math.random();
        const type: ItemType = r < 0.72 ? 'fruit' : r < 0.83 ? 'spider' : r < 0.9 ? 'skull' : r < 0.95 ? 'power_magnet' : r < 0.98 ? 'power_slow' : 'power_fast';
        const vy = (r < 0.83 ? 160 : r < 0.9 ? 200 : 140) * speedRef.current * timeFactor;
        itemsRef.current.push({ id: idRef.current++, x: Math.random() * (W - itemSize), y: -itemSize, vy, type });
      }

      // update
      const bxCenter = basketXRef.current + basketWidth / 2;
      const magnetActive = now < magnetUntil.current;
      itemsRef.current.forEach((it) => {
        if (magnetActive && it.type === 'fruit') {
          const dir = Math.sign(bxCenter - (it.x + itemSize / 2));
          it.x += dir * 80 * dt; // atrae
        }
        // hazards zig-zag sutil
        if (it.type === 'spider' || it.type === 'skull') {
          it.x += Math.sin((now + it.id * 137) / 350) * 40 * dt;
        }
        it.y += it.vy * dt;
      });

      // collisions & cleanup
      const kept: Item[] = [];
      itemsRef.current.forEach((it) => {
        const collides =
          it.y + itemSize >= H - 120 &&
          it.x < basketXRef.current + basketWidth &&
          it.x + itemSize > basketXRef.current;
        if (collides) {
          if (it.type === 'fruit') {
            setScore((s) => s + 1);
            setStreak((st) => {
              const next = st + 1;
              const m = Math.min(5, 1 + Math.floor(next / 5));
              setMult(m);
              setSessionCoins((c) => c + m);
              return next;
            });
          } else if (it.type === 'spider' || it.type === 'skull') {
            // Peligros: quitan vida, no afectan racha/multiplicador
            setLives((v) => Math.max(0, v - 1));
          }
          else if (it.type === 'power_magnet') magnetUntil.current = now + 5000;
          else if (it.type === 'power_slow') speedRef.current = Math.max(0.6, speedRef.current - 0.2);
          else if (it.type === 'power_fast') speedRef.current = Math.min(1.6, speedRef.current + 0.2);
          return; // consume
        }
        if (it.y < H) kept.push(it); else {
          // Sólo frutas perdidas rompen la racha/multiplicador
          if (it.type === 'fruit') { setStreak(0); setMult(1); }
        }
      });
      itemsRef.current = kept;

      if (lives <= 0) {
        setState('over');
        return;
      }

      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, basketWidth, itemSize, lives]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setSessionCoins(0);
    setStreak(0);
    setMult(1);
    itemsRef.current = [];
    magnetUntil.current = 0;
    speedRef.current = 1;
    startAt.current = Date.now();
    setState('playing');
  };

  const background = '#ffffff';
  const fruitColor = '#f59e0b';
  const hazardColor = '#ef4444';
  const powerColor = '#22c55e';

  return (
    <GameShell title="Atrapa Frutas">
      <View style={{ flex: 1 }}>
        {/* HUD minimal */}
        <View style={styles.hudRow}>
          <Text style={styles.hudText}>🪙 {sessionCoins}</Text>
          <View style={styles.multPill}><Text style={styles.multText}>x{mult}</Text></View>
          <Text style={styles.hudText}>❤️ {lives}</Text>
        </View>

        <View style={{ flex: 1, marginTop: 8, backgroundColor: background, borderRadius: 12, overflow: 'hidden' }}>
          {/* Items */}
          {itemsRef.current.map((it) => (
            <View
              key={it.id}
              style={{ position: 'absolute', left: it.x, top: it.y, width: itemSize, height: itemSize, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: Math.round(itemSize * 0.9) }}>
                {it.type === 'fruit' ? ['🍎','🍌','🍓','🍇','🍉','🍒'][it.id % 6]
                  : it.type === 'spider' ? '🕷️'
                  : it.type === 'skull' ? '💀'
                  : it.type === 'power_magnet' ? '🧲'
                  : it.type === 'power_slow' ? '🐢'
                  : '🐇'}
              </Text>
            </View>
          ))}
          {/* Input layer */}
          <Animated.View
            {...({
              onStartShouldSetResponder: () => true,
              onResponderMove: (e: any) => {
                const x = e.nativeEvent.locationX - basketWidth / 2;
                basketXAnim.setValue(Math.max(0, Math.min(W - basketWidth, x)));
              },
              onResponderGrant: (e: any) => {
                const x = e.nativeEvent.locationX - basketWidth / 2;
                basketXAnim.setValue(Math.max(0, Math.min(W - basketWidth, x)));
                if (state === 'ready') startGame();
              },
            } as any)}
            style={StyleSheet.absoluteFill}
          />
          {/* Basket */}
          <Animated.View style={[styles.basket, { width: basketWidth, transform: [{ translateX: basketXAnim }] }]} />
        </View>

        {state !== 'playing' && (
          <Pressable style={styles.overlay} onPress={startGame}>
            <Text style={styles.overlayTitle}>{state === 'ready' ? 'Toca para comenzar' : 'Game Over'}</Text>
            {state === 'over' && <Text style={styles.overlayHint}>Toca para reintentar • Puntos: {score}</Text>}
          </Pressable>
        )}

        {state === 'over' && (
          <Pressable style={styles.cta} onPress={async () => { const rewarded = await awardCoins(sessionCoins); setCoins(rewarded); }}>
            <Text style={{ fontWeight: '900' }}>{coins == null ? 'Cobrar Monedas' : `Saldo: ${coins}`}</Text>
          </Pressable>
        )}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  hudRow: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudText: { color: '#111827', fontWeight: '800', fontSize: 12 },
  multPill: { backgroundColor: '#dcfce7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  multText: { color: '#16a34a', fontWeight: '900', fontSize: 12 },
  basket: { position: 'absolute', bottom: 0, height: 18, borderRadius: 10, backgroundColor: '#22c55e' },
  overlay: { position: 'absolute', left: 16, right: 16, top: 80, alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12 },
  overlayTitle: { fontWeight: '900', color: '#0f172a' },
  overlayHint: { marginTop: 4, color: '#6b7280' },
  cta: { marginTop: 12, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 999 },
});


