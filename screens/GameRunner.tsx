import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { GameShell } from './games';
import { awardCoins } from '../services/arcade';

const { width: W, height: H } = Dimensions.get('window');
const S = Math.min(W, H);

type ObType = 'cactus' | 'eagle' | 'coin';
type Ob = { id: number; x: number; y: number; w: number; h: number; type: ObType; speed: number };

export default function GameRunner() {
  const groundY = Math.round(H * 0.72);
  const playerSize = Math.round(S * 0.06);
  const playerX = 40;

  const [lives, setLives] = useState(3);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [state, setState] = useState<'ready' | 'playing' | 'over'>('ready');

  const vy = useRef(0);
  const y = useRef(groundY - playerSize);
  const slidingUntil = useRef(0);
  const invulnUntil = useRef(0);
  const timeStart = useRef(Date.now());
  const obs = useRef<Ob[]>([]);
  const nextId = useRef(1);
  const spawnAcc = useRef(0);

  const [hero, setHero] = useState<'dog' | 'cat'>(Math.random() > 0.5 ? 'dog' : 'cat');

  const start = () => {
    setLives(3); setSessionCoins(0); setDistance(0); setState('playing');
    vy.current = 0; y.current = groundY - playerSize; slidingUntil.current = 0; invulnUntil.current = 0;
    obs.current = []; nextId.current = 1; spawnAcc.current = 0; timeStart.current = Date.now();
  };

  const scaleY = useRef(new Animated.Value(1)).current;
  const jump = () => {
    if (state !== 'playing') { start(); return; }
    if (Math.abs(y.current - (groundY - playerSize)) < 2) {
      vy.current = -Math.max(620, S * 1.3);
      Animated.sequence([
        Animated.timing(scaleY, { toValue: 0.9, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleY, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  };

  const slide = () => {
    if (state === 'playing') {
      slidingUntil.current = Date.now() + 500;
      Animated.timing(scaleY, { toValue: 0.6, duration: 120, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(scaleY, { toValue: 1, duration: 120, useNativeDriver: true }).start();
        }, 500);
      });
    }
  };

  useEffect(() => {
    if (state !== 'playing') return;
    let raf = 0; let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = Math.min(50, now - last) / 1000; last = now;

      // dificultad progresiva
      const t = (now - timeStart.current) / 1000; // s
      const baseSpeed = 160 + t * 6; // aumenta con el tiempo

      // spawns por segundo (más espaciados)
      const rate = 1.8 + Math.min(3.2, t / 10);
      spawnAcc.current += rate * dt;
      while (spawnAcc.current >= 1) {
        spawnAcc.current -= 1;
        const r = Math.random();
        let type: ObType = r < 0.7 ? 'cactus' : r < 0.9 ? 'eagle' : 'coin';
        // Espaciado mínimo entre peligros
        const lastHaz = obs.current.reduce<Ob | null>((acc, o) => (o.type !== 'coin' && (!acc || o.x > acc.x) ? o : acc), null);
        const minGap = Math.max(playerSize * 5, W * 0.35);
        const canSpawnHaz = !lastHaz || (W + 20) - lastHaz.x >= minGap;
        if ((type === 'cactus' || type === 'eagle') && !canSpawnHaz) type = 'coin';
        const w = type === 'eagle' ? Math.round(playerSize * 1.1) : Math.round(playerSize * 0.9);
        const h = type === 'eagle' ? Math.round(playerSize * 0.8) : Math.round(playerSize * 1.0);
        const yPos = type === 'eagle' ? groundY - h - Math.round(playerSize * 1.1) : groundY - h; // águila más alta
        obs.current.push({ id: nextId.current++, x: W + 20, y: yPos, w, h, type, speed: baseSpeed + Math.random() * 60 });
      }

      // física jugador
      vy.current += 2200 * dt; // gravedad
      y.current = Math.min(groundY - playerSize, y.current + vy.current * dt);
      if (y.current >= groundY - playerSize) { vy.current = 0; }

      // mover obstáculos y colisiones
      const isSliding = now < slidingUntil.current;
      const playerH = isSliding ? Math.round(playerSize * 0.55) : playerSize;
      const playerY = isSliding ? groundY - playerH : y.current;
      const kept: Ob[] = [];
      obs.current.forEach((o) => {
        o.x -= o.speed * dt;
        // colisión AABB
        const hit = !(
          playerX + playerSize < o.x ||
          playerX > o.x + o.w ||
          playerY + playerH < o.y ||
          playerY > o.y + o.h
        );
        if (hit) {
          if (o.type === 'coin') {
            setSessionCoins((c) => c + 1);
            return; // consumida
          }
          if (now >= invulnUntil.current) {
            setLives((v) => Math.max(0, v - 1));
            invulnUntil.current = now + 900; // iframes
          }
          return; // no mantener obstáculo golpeado
        }
        if (o.x + o.w > -20) kept.push(o);
      });
      obs.current = kept;

      // distancia
      setDistance((d) => d + Math.round(baseSpeed * dt));

      // game over
      if (lives <= 0) { setState('over'); return; }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, lives]);

  return (
    <GameShell title="Carrera de Obstáculos">
      <View style={{ flex: 1 }}>
        {/* HUD */}
        <View style={styles.hudRow}>
          <Text style={styles.hudText}>🪙 {sessionCoins}</Text>
          <Text style={styles.hudText}>⏱️ {Math.floor(distance / 50)}</Text>
          <Text style={styles.hudText}>❤️ {lives}</Text>
        </View>

        {/* Área de juego */}
        <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
          {/* suelo */}
          <View style={{ position: 'absolute', left: 0, right: 0, top: groundY, height: 2, backgroundColor: '#e5e7eb' }} />

          {/* jugador (emoji) con animación */}
          <Animated.View style={{ position: 'absolute', left: playerX, top: y.current, width: playerSize, height: playerSize, alignItems: 'center', justifyContent: 'center', transform: [{ scaleY }] }}>
            <Text style={{ fontSize: Math.round(playerSize * 0.9) }}>{hero === 'dog' ? '🐶' : '🐱'}</Text>
          </Animated.View>

          {/* obstáculos */}
          {obs.current.map((o) => (
            <View key={o.id} style={{ position: 'absolute', left: o.x, top: o.y, width: o.w, height: o.h, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: Math.round(playerSize * 0.9) }}>
                {o.type === 'coin' ? '🪙' : o.type === 'cactus' ? '🌵' : '🦅'}
              </Text>
            </View>
          ))}

          {/* controles: tap salta, longPress se desliza */}
          <Pressable style={StyleSheet.absoluteFill} onPress={jump} onLongPress={slide} />
        </View>

        {/* controles inferiores */}
        {state === 'playing' && (
          <View style={styles.controlsRow}>
            <Pressable onPress={jump} style={[styles.ctrlBtn, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.ctrlText}>Saltar ⤴️</Text>
            </Pressable>
            <Pressable onPress={slide} style={[styles.ctrlBtn, { backgroundColor: '#e5e7eb' }]}>
              <Text style={styles.ctrlText}>Agacharse ↧</Text>
            </Pressable>
          </View>
        )}

        {/* overlays */}
        {state !== 'playing' && (
          <Pressable style={styles.overlay} onPress={start}>
            <Text style={styles.overlayTitle}>{state === 'ready' ? 'Toca para comenzar' : 'Game Over'}</Text>
            {state === 'over' && <Text style={styles.overlayHint}>Toca para reintentar • 🪙 {sessionCoins}</Text>}
          </Pressable>
        )}

        {state === 'over' && (
          <Pressable style={styles.cta} onPress={async () => { const rewarded = await awardCoins(sessionCoins); }}>
            <Text style={{ fontWeight: '900' }}>Cobrar Monedas</Text>
          </Pressable>
        )}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  hudRow: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 5, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: '#111827', fontWeight: '800', fontSize: 12 },
  overlay: { position: 'absolute', left: 16, right: 16, top: 80, alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12 },
  overlayTitle: { fontWeight: '900', color: '#0f172a' },
  overlayHint: { marginTop: 4, color: '#6b7280' },
  cta: { marginTop: 12, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 999 },
  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  ctrlBtn: { flex: 1, height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctrlText: { fontWeight: '900', color: '#0f172a' },
});


