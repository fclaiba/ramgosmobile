import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PetStats, loadPetState, savePetState, reducePet } from '../services/pet';
import { useNavigation } from '@react-navigation/native';

export default function PetScreen() {
  const [state, setState] = useState<PetStats | null>(null);
  const nav = useNavigation<any>();

  useEffect(() => {
    (async () => {
      const initial = await loadPetState();
      setState(initial);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (state) await savePetState(state);
    })();
  }, [state]);

  const dispatch = useCallback((action: 'feed' | 'play' | 'clean' | 'heal' | 'sleep') => {
    setState((s) => (s ? reducePet(s, action) : s));
  }, []);

  if (!state) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>Mascota</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCxxq5x5uaULVst4mcVkpVakAB4Qd26kxrxWqmIFtkU5T6snbvtIjyFnOE1G_kuGIvAJutsrh2RkICHhTNKtCLMmkNWNcePOX7woqPir7thCGc9gdYaAoNsOxHTbzAA3rluurIXwcrLhyauheZXzaBug5Wi3SqO9vE8IRlXEQ0IzbfqSYvA4poRPrklfxt6RFh8DWpvtTpMztfnzMjH_kpqgTkCbghrOk0kI9B8Z-f3VTXiM5ikBPnqvDmP_IpmYTZJVg7EDYFanXb' }}
              style={styles.avatar}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.petName}>{state.name}</Text>
            <Text style={styles.level}>Nivel {state.level}</Text>
          </View>
        </View>

        <View style={styles.grid}> 
          <StatCard label="Felicidad" value={`${state.happiness}%`} />
          <StatCard label="Hambre" value={`${state.hunger}%`} />
          <StatCard label="Limpieza" value={`${state.cleanliness}%`} />
          <StatCard label="Salud" value={`${state.health}%`} />
        </View>

        <View style={styles.buttonsGrid}>
          <PrimaryButton icon="restaurant" text="Alimentar" onPress={() => nav.navigate('PetFeed' as any)} />
          <PrimaryButton icon="sports-esports" text="Jugar" onPress={() => nav.navigate('Arcade' as any)} />
          <PrimaryButton icon="clean-hands" text="Limpiar" onPress={() => dispatch('clean')} />
          <PrimaryButton icon="healing" text="Curar" onPress={() => dispatch('heal')} />
        </View>

        <Pressable style={[styles.sleepBtn, state.sleeping && { opacity: 0.85 }]} onPress={() => dispatch('sleep')}>
          <MaterialIcons name="bedtime" size={20} color="#111" />
          <Text style={styles.sleepText}>{state.sleeping ? 'Despertar' : 'Dormir'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({ icon, text, onPress }: { icon: any; text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.primaryBtn} onPress={onPress}>
      <MaterialIcons name={icon} size={18} color="#000" />
      <Text style={styles.primaryBtnText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontWeight: '700' },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)' },
  avatarWrap: { width: 128, height: 128, borderRadius: 999, overflow: 'hidden', backgroundColor: '#eee' },
  avatar: { width: '100%', height: '100%' },
  petName: { fontSize: 28, fontWeight: '800' },
  level: { textAlign: 'center', color: '#6b7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { flexBasis: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800' },
  buttonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  primaryBtn: { flexBasis: '48%', backgroundColor: '#2bee2b', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { fontWeight: '800', color: '#000' },
  sleepBtn: { backgroundColor: 'rgba(43,238,43,0.25)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  sleepText: { fontWeight: '800' },
});


