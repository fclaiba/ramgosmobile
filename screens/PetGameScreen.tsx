import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';

export default function PetGameScreen({ navigation }: any) {
  const { identity, stats, feed, play, rest } = usePet();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={()=>navigation.goBack?.()}><MaterialIcons name={'arrow-back'} size={22} color={'#111827'} /></Pressable>
        <Text style={styles.headerTitle}>Mi Perro</Text>
        <Pressable style={styles.iconBtn} onPress={()=>navigation.navigate?.('PetProfile')}><MaterialIcons name={'pets'} size={22} color={'#111827'} /></Pressable>
      </View>

      <View style={styles.center}>
        <Image source={{ uri: identity.avatarUrl }} style={styles.dog} />
        <Text style={styles.name}>{identity.name}</Text>
        <Text style={styles.meta}>{identity.breed}</Text>

        <View style={styles.statsRow}>
          <Stat label="Hambre" value={100 - stats.hunger} color="#ef4444" />
          <Stat label="Energía" value={stats.energy} color="#06b6d4" />
          <Stat label="Ánimo" value={stats.mood} color="#22c55e" />
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#fde68a' }]} onPress={feed}>
            <MaterialIcons name={'restaurant'} size={20} color={'#b45309'} />
            <Text style={styles.actionText}>Dar de comer</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#bfdbfe' }]} onPress={play}>
            <MaterialIcons name={'sports-tennis'} size={20} color={'#1d4ed8'} />
            <Text style={styles.actionText}>Jugar</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#ddd6fe' }]} onPress={rest}>
            <MaterialIcons name={'bedtime'} size={20} color={'#6d28d9'} />
            <Text style={styles.actionText}>Descansar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems:'center', gap: 6 }}>
      <Text style={{ fontWeight:'800', color:'#111827' }}>{label}</Text>
      <View style={{ width: 90, height: 10, backgroundColor:'#e5e7eb', borderRadius: 999, overflow:'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: color }} />
      </View>
      <Text style={{ color:'#6b7280', fontWeight:'700' }}>{Math.max(0, Math.min(100, Math.round(value)))}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  center: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  dog: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  meta: {
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 10,
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {
    fontWeight: '800',
    color: '#111827',
  },
});

