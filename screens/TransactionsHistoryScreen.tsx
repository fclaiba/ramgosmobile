import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { filterPayments, listPayments, Payment } from '../services/payments';
import { listEscrows, EscrowTx } from '../services/escrow';
import { listOrdersByStatus, CouponOrder, expirePastOrders } from '../services/history';
import { listEventOrders, EventOrder } from '../services/events';

export default function TransactionsHistoryScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all'|'payments'|'escrows'|'coupons'|'events'>('all');
  expirePastOrders();

  const payments = useMemo(() => filterPayments({ text: query }), [query]);
  const escrowsActive = useMemo(() => listEscrows({}), []);
  const couponsActive = useMemo(() => listOrdersByStatus('active'), []);
  const couponsExpired = useMemo(() => listOrdersByStatus('expired'), []);
  const eventsOrders = useMemo(() => listEventOrders(), []);

  const q = query.trim().toLowerCase();
  const match = (s: string) => (q ? s.toLowerCase().includes(q) : true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
        <Pressable style={styles.iconBtn}><MaterialIcons name={'download'} size={22} color={'#0f172a'} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View style={styles.searchWrap}>
          <MaterialIcons name={'search'} size={18} color={'#94a3b8'} />
          <TextInput value={query} onChangeText={setQuery} placeholder={'Buscar por ID o concepto...'} placeholderTextColor={'#94a3b8'} style={styles.searchInput} />
        </View>

        <View style={styles.filterRow}>
          {(['all','payments','escrows','coupons','events'] as const).map(f => (
            <Pressable key={f} style={[styles.filterChip, filter===f && styles.filterChipActive]} onPress={()=>setFilter(f)}>
              <Text style={[styles.filterChipText, filter===f && styles.filterChipTextActive]}>{f==='all'?'Todo':f==='payments'?'Pagos':f==='escrows'?'Escrow':f==='coupons'?'Cupones':'Eventos'}</Text>
            </Pressable>
          ))}
        </View>

        {(filter==='all' || filter==='payments') && (
          <View style={{ gap: 12, marginTop: 12 }}>
            {payments.filter(p=>match(`${p.title} ${p.id}`)).map(p => (
              <View key={p.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardMeta}>ID: {p.id}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amount, { color: p.amount>=0?'#16a34a':'#dc2626' }]}>{p.amount>=0?'+':''}${p.amount.toFixed(2)}</Text>
                    <Text style={styles.statusBadge}>{p.status}</Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>{new Date(p.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {(filter==='all' || filter==='escrows') && (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Escrows</Text>
            {escrowsActive.filter(e=>match(`${e.id} ${e.title} ${e.status}`)).map(e => (
              <Pressable key={e.id} style={styles.card} onPress={()=>navigation.navigate('EscrowFlow' as any, { id: e.id })}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>#{e.id} · {e.title}</Text>
                  <Text style={styles.statusBadge}>{e.status}</Text>
                </View>
                <Text style={styles.cardMeta}>Creado: {new Date(e.createdAt).toLocaleString()}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {(filter==='all' || filter==='coupons') && (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Cupones</Text>
            {[...couponsActive, ...couponsExpired].filter(c=>match(`${c.id} ${c.title} ${c.merchant}`)).map(c => (
              <View key={c.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.statusBadge}>{c.status}</Text>
                </View>
                <Text style={styles.cardMeta}>Válido hasta: {new Date(c.validUntil).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        {(filter==='all' || filter==='events') && (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Eventos</Text>
            {eventsOrders.filter(e=>match(`${e.id} ${e.title}`)).map(e => (
              <View key={e.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{e.title}</Text>
                  <Text style={styles.statusBadge}>{e.status}</Text>
                </View>
                <Text style={styles.cardMeta}>{new Date(e.date).toLocaleString()} · ${e.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, paddingHorizontal: 12, backgroundColor: '#ffffff' },
  searchInput: { flex: 1, height: 40, color: '#0f172a' },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f1f5f9' },
  filterChipActive: { backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#93c5fd' },
  filterChipText: { color: '#334155', fontWeight: '700' },
  filterChipTextActive: { color: '#0f172a' },
  sectionTitle: { color: '#0f172a', fontWeight: '900', fontSize: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#0f172a', fontWeight: '800' },
  cardMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  statusBadge: { color: '#0f172a', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 12, overflow: 'hidden' },
  amount: { fontWeight: '900' },
});


