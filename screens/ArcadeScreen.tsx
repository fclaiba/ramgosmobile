import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCoins, getDailyChallengeInfo, completeDailyChallenge } from '../services/arcade';
import { useNavigation } from '@react-navigation/native';

export default function ArcadeScreen() {
  const nav = useNavigation<any>();
  const [coins, setCoins] = useState<number>(0);
  const [challenge, setChallenge] = useState<{ available: boolean; remainingMs: number; reward: number }>({ available: true, remainingMs: 0, reward: 200 });

  useEffect(() => {
    (async () => {
      setCoins(await getCoins());
      setChallenge(await getDailyChallengeInfo());
    })();
  }, []);

  const remainingText = useMemo(() => {
    const ms = challenge.remainingMs;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [challenge.remainingMs]);

  return (
    <SafeAreaView style={styles.safe}> 
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
        </Pressable>
        <Text style={styles.title}>Pipo's Arcade</Text>
        <View style={styles.coinPill}>
          <MaterialIcons name={'toll'} size={16} color={'#ca8a04'} />
          <Text style={{ fontWeight: '900', color: '#ca8a04' }}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.challengeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.challengeTitle}>Desafío Diario</Text>
            <View style={styles.timerPill}>
              <MaterialIcons name={'timer'} size={14} color={'#ffffff'} />
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>{challenge.available ? '¡Listo!' : remainingText}</Text>
            </View>
          </View>
          <Text style={{ color: '#ecfdf5', marginTop: 8 }}>¡Completa este desafío para obtener una gran recompensa!</Text>
          <View style={{ height: 120, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Pressable
              style={styles.playBtn}
              onPress={async () => {
                if (!challenge.available) return;
                const res = await completeDailyChallenge();
                setCoins(res.coins);
                setChallenge(await getDailyChallengeInfo());
              }}
            >
              <MaterialIcons name={'play-arrow'} size={20} color={'#16a34a'} />
              <Text style={{ color: '#16a34a', fontWeight: '900' }}>Jugar Ahora</Text>
            </Pressable>
          </View>
          <Text style={{ textAlign: 'center', color: '#fff', marginTop: 10, fontWeight: '800' }}>Recompensa: 🔥 +{challenge.reward} Monedas</Text>
        </View>

        <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 20, marginTop: 16 }}>Otros Juegos</Text>
        <Text style={{ color: '#6b7280' }}>Elige un juego para divertirte con Pipo.</Text>

        {[
          { key: 'fruits', icon: 'catching-pokemon', title: 'Atrapa Frutas', desc: 'Toca o desliza para mover la cesta.' },
          { key: 'runner', icon: 'directions-run', title: 'Carrera de Obstáculos', desc: 'Toca la pantalla para que Pipo salte.' },
          { key: 'memory', icon: 'memory', title: 'Juego de Memoria', desc: 'Encuentra los pares de juguetes.' },
          { key: 'duckhunt', icon: 'sports-esports', title: 'Duck Hunt', desc: 'Apunta y dispara a los patos.' },
          { key: 'roulette', icon: 'casino', title: 'Ruleta', desc: 'Gira y gana recompensas.' },
          { key: 'slots', icon: 'slot-machine', title: 'Tragamonedas', desc: 'Prueba tu suerte.' },
        ].map((g) => (
          <Pressable key={g.key} style={styles.gameItem} onPress={() => nav.navigate('Game_' + g.key as any)}>
            <View style={styles.gameIconWrap}>
              <MaterialIcons name={g.icon as any} size={28} color={'#22c55e'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800' }}>{g.title}</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>{g.desc}</Text>
            </View>
            <MaterialIcons name={'play-circle'} size={20} color={'#9ca3af'} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8f6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)' },
  title: { fontWeight: '800' },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(250,204,21,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  challengeCard: { backgroundColor: '#22c55e', borderRadius: 20, padding: 16 },
  challengeTitle: { color: '#ffffff', fontWeight: '900', fontSize: 24 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  playBtn: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8 },
  gameItem: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  gameIconWrap: { backgroundColor: '#dcfce7', padding: 8, borderRadius: 12 },
});


