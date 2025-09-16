import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listEventOrders } from '../services/events';
import { useUser } from '../context/UserContext';

export default function MyEventsScreen({ navigation }: any) {
  const { userId } = useUser();
  const orders = listEventOrders({ userId });
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Mis Entradas</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={{ gap: 12 }}>
          {orders.map(o => (
            <View key={o.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{o.title}</Text>
                <Text style={styles.cardMeta}>{new Date(o.date).toLocaleString()} · ${o.amount.toFixed(2)}</Text>
              </View>
              <View style={[styles.pill, o.status==='active'?styles.pillActive:o.status==='used'?styles.pillInfo:styles.pillMuted]}>
                <Text style={styles.pillText}>{o.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  cardTitle: { color: '#0f172a', fontWeight: '800' },
  cardMeta: { color: '#64748b', fontSize: 12 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillActive: { backgroundColor: '#dcfce7' },
  pillInfo: { backgroundColor: '#dbeafe' },
  pillMuted: { backgroundColor: '#e5e7eb' },
  pillText: { color: '#111827', fontSize: 12, fontWeight: '800' },
});


