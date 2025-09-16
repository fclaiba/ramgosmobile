import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, SectionList, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { EscrowTx, listEscrows, subscribeEscrow } from '../services/escrow';
import { listOrdersByStatus } from '../services/history';
import { listPayments, monthlySummary } from '../services/payments';
import { useUser } from '../context/UserContext';

export default function EscrowRegistryScreen() {
  const nav = useNavigation<any>();
  const { role } = useUser();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsub = subscribeEscrow(() => setVersion((v) => v + 1));
    return () => unsub();
  }, []);

  const buyerId = role !== 'business' ? 'u_me' : undefined;
  const sellerId = role === 'business' ? 'u_me' : undefined;

  const active: EscrowTx[] = listEscrows({ status: ['held','shipped','delivered'], buyerId, sellerId });
  const disputed: EscrowTx[] = listEscrows({ status: ['disputed'], buyerId, sellerId });
  const cancelled: EscrowTx[] = listEscrows({ status: ['cancelled'], buyerId, sellerId });
  const abandoned: EscrowTx[] = listEscrows({ status: ['abandoned'], buyerId, sellerId });

  const payments = listPayments();
  const sum = monthlySummary();
  const couponsActive = listOrdersByStatus('active');
  const couponsExpired = listOrdersByStatus('expired');

  const sections = [
    { title: 'Activos', data: active },
    { title: 'En disputa', data: disputed },
    { title: 'Cancelados', data: cancelled },
    { title: 'Abandonados', data: abandoned },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.headerRow, { paddingHorizontal: 16 }] }>
        <Pressable onPress={() => nav.goBack()} style={styles.iconBtn} accessibilityLabel="Atrás">
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>Registro de Ventas/Compras</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen Mensual</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>+${sum.incomes.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>-${sum.expenses.toFixed(2)}</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (sum.incomes/(sum.incomes+sum.expenses||1))*100)}%` }]} /></View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={styles.sectionTitle}>Escrow Activos</Text>
        </View>

        <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
        )}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => nav.navigate('EscrowFlow' as any, { id: item.id } as any)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>#{item.id} · {item.title}</Text>
              <Text style={styles.rowMeta}>Estado: {item.status}</Text>
            </View>
            <MaterialIcons name={'chevron-right'} size={22} color={'#94a3b8'} />
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eaeaea', marginLeft: 16 }} />}
        style={{ maxHeight: 320 }}
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Cupones</Text>
        {couponsActive.map(c => (
          <View key={c.id} style={styles.row}> 
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{c.title}</Text>
              <Text style={styles.rowMeta}>Vence: {new Date(c.validUntil).toLocaleDateString()} · Estado: {c.status}</Text>
            </View>
          </View>
        ))}
        {couponsExpired.map(c => (
          <View key={c.id} style={styles.row}> 
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{c.title}</Text>
              <Text style={styles.rowMeta}>Expiró: {new Date(c.validUntil).toLocaleDateString()} · Estado: {c.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={styles.sectionTitle}>Pagos</Text>
        {payments.map(p => (
          <View key={p.id} style={styles.row}> 
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.title}</Text>
              <Text style={styles.rowMeta}>ID: {p.id} · {new Date(p.createdAt).toLocaleString()} · {p.status}</Text>
            </View>
            <Text style={[styles.amount, { color: p.amount >= 0 ? '#16a34a' : '#dc2626' }]}>{p.amount >= 0 ? '+' : ''}${p.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, backgroundColor: '#ffffff' },
  sectionTitle: { color: '#0f172a', fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff' },
  rowTitle: { color: '#0f172a', fontWeight: '800' },
  rowMeta: { color: '#64748b', fontSize: 12 },
});


