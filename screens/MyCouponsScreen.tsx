import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listOrdersByStatus, CouponOrder, expirePastOrders, listOrders } from '../services/history';
import { useUser } from '../context/UserContext';

type TabKey = 'active' | 'redeemed' | 'expired';

export default function MyCouponsScreen({ navigation }: any) {
  const [tab, setTab] = useState<TabKey>('active');
  const { userId } = useUser();
  expirePastOrders();

  const data = useMemo(() => listOrdersByStatus(tab), [tab]); // demo: sin userId; extender si guardamos owner

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Mis Bonos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.tabsRow}>
          {([
            { key: 'active', label: 'Activos' },
            { key: 'redeemed', label: 'Redimidos' },
            { key: 'expired', label: 'Expirados' },
          ] as Array<{ key: TabKey; label: string }>).map(t => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tabBtn, tab===t.key && styles.tabBtnActive]}>
              <Text style={[styles.tabText, tab===t.key && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          {data.map((o: CouponOrder) => (
            <View key={o.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{o.title}</Text>
                <Text style={styles.cardMeta}>{o.merchant} · Válido hasta {new Date(o.validUntil).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.pill, o.status==='active'?styles.pillActive:o.status==='redeemed'?styles.pillInfo:styles.pillMuted]}>
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
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabBtn: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#1173d4' },
  tabText: { color: '#64748b', fontWeight: '800' },
  tabTextActive: { color: '#1173d4' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  cardTitle: { color: '#0f172a', fontWeight: '800' },
  cardMeta: { color: '#64748b', fontSize: 12 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillActive: { backgroundColor: '#dcfce7' },
  pillInfo: { backgroundColor: '#dbeafe' },
  pillMuted: { backgroundColor: '#e5e7eb' },
  pillText: { color: '#111827', fontSize: 12, fontWeight: '800' },
});


