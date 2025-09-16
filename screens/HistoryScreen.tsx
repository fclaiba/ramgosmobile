import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listOrdersByStatus, expirePastOrders, CouponOrder } from '../services/history';

type TabKey = 'active' | 'redeemed' | 'expired';

export default function HistoryScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState<TabKey>('active');
  const [sectorFilter, setSectorFilter] = useState<'all' | CouponOrder['sector']>('all');

  expirePastOrders();

  const filtered = useMemo(() => {
    const data = listOrdersByStatus(tab);
    const q = query.trim().toLowerCase();
    return data.filter((o) => {
      if (q && !(`${o.title} ${o.merchant}`.toLowerCase().includes(q))) return false;
      if (sectorFilter !== 'all' && o.sector !== sectorFilter) return false;
      return true;
    });
  }, [query, tab, sectorFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.navBtn} onPress={() => navigation.goBack()} accessibilityLabel="Atrás">
          <MaterialIcons name={'arrow-back'} size={22} color={'#111418'} />
        </Pressable>
        <Text style={styles.headerTitle}>Historial de Bonos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 16 }}>
          <View style={styles.searchWrap}>
            <MaterialIcons name={'search'} size={18} color={'#94a3b8'} />
            <TextInput
              placeholder="Buscar en historial..."
              placeholderTextColor={'#94a3b8'}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filtros</Text>
            <Pressable style={styles.filterPill} onPress={() => setShowFilters(s => !s)}>
              <MaterialIcons name={'filter-list'} size={16} color={'#111827'} />
              <Text style={styles.filterPillText}>{showFilters ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>
          {showFilters && (
            <View style={styles.filtersCard}>
              <Text style={styles.inputLabel}>Sector</Text>
              <View style={styles.chipsRow}>
                {(['all', 'gastronomia', 'bienestar', 'aventura', 'cultura', 'otros'] as Array<'all' | CouponOrder['sector']>).map((s) => (
                  <Pressable key={s} onPress={() => setSectorFilter(s)} style={[styles.chip, sectorFilter === s && styles.chipActive]}>
                    <Text style={[styles.chipText, sectorFilter === s && styles.chipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        <View>
          <View style={styles.tabsRow}>
            {[
              { key: 'active', label: 'Activos' },
              { key: 'redeemed', label: 'Redimidos' },
              { key: 'expired', label: 'Expirados' },
            ].map((t) => (
              <Pressable key={t.key} onPress={() => setTab(t.key as TabKey)} style={[styles.tabBtn, tab === (t.key as TabKey) && styles.tabBtnActive]}>
                <Text style={[styles.tabText, tab === (t.key as TabKey) && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ padding: 16, gap: 12 }}>
            {filtered.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{o.title}</Text>
                    <Text style={styles.cardSubtitle}>{o.merchant}</Text>
                    <Text style={styles.cardMeta}>Válido hasta: {new Date(o.validUntil).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statusPill, o.status === 'active' ? styles.pillActive : o.status === 'redeemed' ? styles.pillRedeemed : styles.pillExpired]}>
                    <Text style={[styles.pillText, o.status === 'expired' && { color: '#475569' }]}>
                      {o.status === 'active' ? 'Activo' : o.status === 'redeemed' ? 'Redimido' : 'Expirado'}
                    </Text>
                  </View>
                  <Pressable style={{ marginLeft: 8 }} onPress={() => {}}>
                    <MaterialIcons name={'more-vert'} size={20} color={'#6b7280'} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  navBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#ffffff' },
  searchInput: { flex: 1, paddingVertical: 10, color: '#0f172a' },
  filtersHeader: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filtersTitle: { color: '#334155', fontWeight: '800' },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  filterPillText: { color: '#111827', fontWeight: '700' },
  filtersCard: { marginTop: 12, backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  inputLabel: { color: '#1f2937', fontWeight: '700', fontSize: 13 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#cbd5e1' },
  chipActive: { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' },
  chipText: { color: '#374151', fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#0ea5e9' },

  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginTop: 8, paddingHorizontal: 16 },
  tabBtn: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#1173d4' },
  tabText: { color: '#64748b', fontWeight: '800' },
  tabTextActive: { color: '#1173d4' },

  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, boxShadow: '0px 8px 16px rgba(0,0,0,0.04)', elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#0f172a', fontWeight: '800' },
  cardSubtitle: { color: '#6b7280', fontSize: 12 },
  cardMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillActive: { backgroundColor: '#dcfce7' },
  pillRedeemed: { backgroundColor: '#dbeafe' },
  pillExpired: { backgroundColor: '#e5e7eb' },
  pillText: { color: '#047857', fontWeight: '800', fontSize: 12 },
});


