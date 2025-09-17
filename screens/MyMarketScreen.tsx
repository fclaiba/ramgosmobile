import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listEscrows, EscrowTx } from '../services/escrow';
import { useUser } from '../context/UserContext';

type TabKey = 'purchases' | 'sales';

export default function MyMarketScreen({ navigation }: any) {
  const [tab, setTab] = useState<TabKey>('purchases');
  const { userId } = useUser();
  // Filtrar por usuario actual simulado 'u_me'
  const purchases = useMemo(() => listEscrows({ buyerId: userId }), [userId]);
  const sales = useMemo(() => listEscrows({ sellerId: userId }), [userId]);
  const data = tab==='purchases' ? purchases : sales;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Mi Marketplace</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.tabsRow}>
          {([
            { key: 'purchases', label: 'Compras' },
            { key: 'sales', label: 'Ventas' },
          ] as Array<{ key: TabKey; label: string }>).map(t => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tabBtn, tab===t.key && styles.tabBtnActive]}>
              <Text style={[styles.tabText, tab===t.key && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          {data.map((e: EscrowTx) => (
            <Pressable key={e.id} style={styles.card} onPress={()=>navigation.navigate('EscrowFlow' as any, { id: e.id } as any)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>#{e.id} · {e.title}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
                  <Text style={styles.cardMeta}>Estado: {e.status}</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor:'#f1f5f9', borderRadius: 999 }}>
                    <Text style={[styles.cardMeta, { fontWeight:'800', color:'#0f172a' }]}>{tab==='purchases'?'Compra':'Venta'}</Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name={'chevron-right'} size={22} color={'#94a3b8'} />
            </Pressable>
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
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabBtn: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#1173d4' },
  tabText: { color: '#64748b', fontWeight: '800' },
  tabTextActive: { color: '#1173d4' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  cardTitle: { color: '#0f172a', fontWeight: '800' },
  cardMeta: { color: '#64748b', fontSize: 12 },
});


