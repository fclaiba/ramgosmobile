import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { filterPayments, listPayments } from '../services/payments';
import { listEscrows } from '../services/escrow';
import { filterCouponOrders, expirePastOrders, listOrders } from '../services/history';
import { filterEventOrders, listEventOrders } from '../services/events';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { listUnifiedTransactions, exportTransactionsCsv, rangePresetToDates } from '../services/transactions';

export default function TransactionsHistoryScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all'|'payments'|'escrows'|'coupons'|'events'>('all');
  expirePastOrders();

  const [statusCoupon, setStatusCoupon] = useState<'all'|'active'|'redeemed'|'expired'>('all');
  const [statusEvent, setStatusEvent] = useState<'all'|'active'|'used'|'expired'|'cancelled'>('all');
  const [sortAmount, setSortAmount] = useState<'none'|'asc'|'desc'>('none');
  const [sectorFilter, setSectorFilter] = useState<'all'|'gastronomia'|'aventura'|'bienestar'|'cultura'|'otros'>('all');
  const payments = useMemo(() => filterPayments({ text: query }), [query]);
  const escrowsActive = useMemo(() => listEscrows({}), []);
  const coupons = useMemo(() => filterCouponOrders({ text: query, status: statusCoupon==='all'?undefined:[statusCoupon as any] }), [query, statusCoupon]);
  const eventsOrders = useMemo(() => filterEventOrders({ text: query, status: statusEvent==='all'?undefined:[statusEvent as any] }), [query, statusEvent]);

  // Filtros unificados
  const [datePreset, setDatePreset] = useState<'all'|'7d'|'30d'|'90d'>('all');
  const [typeFilters, setTypeFilters] = useState<{ payments: boolean; escrows: boolean; coupons: boolean; events: boolean }>({ payments: true, escrows: true, coupons: true, events: true });
  const [sortBy, setSortBy] = useState<'date'|'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const unified = useMemo(() => {
    const { from, to } = rangePresetToDates(datePreset);
    const types: ('payment'|'escrow'|'coupon'|'event')[] = [];
    if (typeFilters.payments) types.push('payment');
    if (typeFilters.escrows) types.push('escrow');
    if (typeFilters.coupons) types.push('coupon');
    if (typeFilters.events) types.push('event');
    return listUnifiedTransactions({
      text: query,
      types,
      dateFrom: from,
      dateTo: to,
      sortBy,
      sortDir,
    });
  }, [query, datePreset, typeFilters, sortBy, sortDir]);

  const q = query.trim().toLowerCase();
  const match = (s: string) => (q ? s.toLowerCase().includes(q) : true);

  // Resumen mensual (ingresos/gastos) y progreso
  const monthSummary = useMemo(() => {
    const now = Date.now();
    const start = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
    let incomes = 0; let expenses = 0;
    listPayments().forEach(p => { if (p.createdAt >= start) { if (p.amount >= 0) incomes += p.amount; else expenses += -p.amount; } });
    const total = incomes + expenses || 1;
    const pct = Math.min(100, Math.max(0, (incomes / total) * 100));
    return { incomes, expenses, pct };
  }, []);

  // Flujo mensual últimos 6 meses
  const monthlyFlow = useMemo(() => {
    const now = new Date();
    const arr: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      let income = 0; let expense = 0;
      listPayments().forEach(p => { if (p.createdAt >= start && p.createdAt < end) { if (p.amount >= 0) income += p.amount; else expense += -p.amount; } });
      arr.push({ label: d.toLocaleString(undefined, { month: 'short' }), income, expense });
    }
    const maxVal = Math.max(1, ...arr.map(x => Math.max(x.income, x.expense)));
    return { bars: arr, maxVal };
  }, []);

  // Categorías de gasto desde cupones (sector) + pagos negativos sin sector → otros
  const gastoCategorias = useMemo(() => {
    const totals: Record<string, number> = { Transporte: 0, Comida: 0, Servicios: 0, Otros: 0 };
    // Mapear sectores de cupones a categorías
    listOrders().forEach(o => { if ((o.amount ?? 0) < 0) {
      const abs = Math.abs(o.amount ?? 0);
      if (o.sector === 'gastronomia') totals['Comida'] += abs; else if (o.sector === 'cultura') totals['Servicios'] += abs; else totals['Otros'] += abs;
    }});
    // Pagos negativos adicionales
    listPayments().forEach(p => { if (p.amount < 0) totals['Otros'] += Math.abs(p.amount); });
    const sum = Object.values(totals).reduce((a,b)=>a+b,0) || 1;
    return Object.entries(totals).map(([name, v]) => ({ name, pct: Math.round((v/sum)*100) }));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
        <Pressable style={styles.iconBtn} onPress={async()=>{
          try {
            const rows: string[] = [];
            const add = (a: string[]) => rows.push(a.map((s)=>`"${String(s).replace(/"/g,'""')}"`).join(','));
            add(['Tipo','ID/Título','Estado','Monto','Fecha']);
            payments.forEach(p=>add(['Pago',p.id, p.status, p.amount, new Date(p.createdAt).toISOString()]));
            listEscrows({}).forEach(e=>add(['Escrow', e.id, e.status, '', new Date(e.createdAt).toISOString()]));
            coupons.forEach(c=>add(['Cupón', c.id, c.status, c.amount ?? '', c.createdAt]));
            eventsOrders.forEach(e=>add(['Evento', e.id, e.status, e.amount, new Date(e.date).toISOString()]));
            const csv = rows.join('\n');
            const uri = FileSystem.cacheDirectory + 'transacciones.csv';
            await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar CSV' });
          } catch (e) { Alert.alert('Error', 'No se pudo exportar CSV'); }
        }}><MaterialIcons name={'download'} size={22} color={'#0f172a'} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {/* Resumen Mensual */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Resumen Mensual</Text>
          <View style={{ marginTop: 8 }}>
            <View style={styles.rowBetween}><Text style={styles.muted}>Ingresos</Text><Text style={{ color:'#16a34a', fontWeight:'900' }}>+${monthSummary.incomes.toFixed(2)}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.muted}>Gastos</Text><Text style={{ color:'#dc2626', fontWeight:'900' }}>-${monthSummary.expenses.toFixed(2)}</Text></View>
            <View style={{ height: 16 }} />
            <View style={{ height: 16, borderRadius: 999, backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
              <View style={{ height: 16, width: `${monthSummary.pct}%`, backgroundColor: '#22c55e' }} />
            </View>
          </View>
        </View>

        {/* Flujo Mensual */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionHeader}>Flujo Mensual</Text>
          <View style={{ flexDirection:'row', alignItems:'flex-end', gap: 8, height: 120, marginTop: 12 }}>
            {monthlyFlow.bars.map((m, idx) => (
              <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: '100%', height: `${Math.round((Math.max(m.income, m.expense)/monthlyFlow.maxVal)*100)}%`, backgroundColor: m.income >= m.expense ? '#22c55e' : '#ef4444' }} />
                <Text style={{ color:'#6b7280', fontSize: 12, marginTop: 4 }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categorías de gasto */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionHeader}>Categorías de Gasto</Text>
          <View style={{ marginTop: 8, gap: 12 }}>
            {gastoCategorias.map(c => (
              <View key={c.name}>
                <View style={styles.rowBetween}><Text style={styles.muted}>{c.name}</Text><Text style={{ fontWeight:'800' }}>{c.pct}%</Text></View>
                <View style={{ height: 8, backgroundColor:'#e5e7eb', borderRadius: 999 }}>
                  <View style={{ height: 8, width: `${c.pct}%`, borderRadius: 999, backgroundColor: c.name==='Comida'?'#f59e0b':c.name==='Servicios'?'#a855f7':c.name==='Transporte'?'#3b82f6':'#9ca3af' }} />
                </View>
              </View>
            ))}
          </View>
        </View>
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

        {/* Filtros avanzados unificados */}
        <View style={[styles.filterRow, { marginTop: 8 }]}>
          {(['all','7d','30d','90d'] as const).map(p => (
            <Pressable key={p} style={[styles.filterChip, datePreset===p && styles.filterChipActive]} onPress={()=>setDatePreset(p)}>
              <Text style={[styles.filterChipText, datePreset===p && styles.filterChipTextActive]}>{p==='all'?'Todo':p}</Text>
            </Pressable>
          ))}
          <View style={{ width: 8 }} />
          {(['payments','escrows','coupons','events'] as const).map(t => (
            <Pressable
              key={t}
              style={[styles.filterChip, (t==='payments'?typeFilters.payments:t==='escrows'?typeFilters.escrows:t==='coupons'?typeFilters.coupons:typeFilters.events) && styles.filterChipActive]}
              onPress={()=>setTypeFilters(prev=>({ ...prev, [t]: !(t==='payments'?prev.payments:t==='escrows'?prev.escrows:t==='coupons'?prev.coupons:prev.events) }))}
            >
              <Text style={[styles.filterChipText, (t==='payments'?typeFilters.payments:t==='escrows'?typeFilters.escrows:t==='coupons'?typeFilters.coupons:typeFilters.events) && styles.filterChipTextActive]}>
                {t==='payments'?'Pagos':t==='escrows'?'Escrow':t==='coupons'?'Cupones':'Eventos'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.filterRow, { marginTop: 8 }]}>
          {(['date','amount'] as const).map(s => (
            <Pressable key={s} style={[styles.filterChip, sortBy===s && styles.filterChipActive]} onPress={()=>setSortBy(s)}>
              <Text style={[styles.filterChipText, sortBy===s && styles.filterChipTextActive]}>Orden: {s==='date'?'Fecha':'Importe'}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.filterChip, styles.filterChipActive]} onPress={()=>setSortDir(d=>d==='asc'?'desc':'asc')}>
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{sortDir==='asc'?'Ascendente':'Descendente'}</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, { marginLeft: 'auto' }]} onPress={async()=>{
            try {
              const csv = exportTransactionsCsv(unified);
              const uri = FileSystem.cacheDirectory + 'transacciones.csv';
              await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
              await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar CSV' });
            } catch (e) { Alert.alert('Error', 'No se pudo exportar CSV'); }
          }}>
            <MaterialIcons name={'download'} size={18} color={'#111827'} />
            <Text style={[styles.filterChipText, { marginLeft: 4 }]}>Exportar CSV</Text>
          </Pressable>
        </View>

        {/* Lista unificada */}
        <View style={{ gap: 12, marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Transacciones</Text>
          {unified.map(item => (
            <View key={`${item.type}-${item.id}`} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flexDirection:'row', alignItems:'center', gap: 8, flex: 1 }}>
                  <MaterialIcons name={item.type==='payment'?'paid':item.type==='escrow'?'inbox':item.type==='coupon'?'redeem':'confirmation-number'} size={18} color={'#0f172a'} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                {item.amount != null && (
                  <Text style={[styles.amount, { color: (item.amount ?? 0) >= 0 ? '#16a34a' : '#dc2626' }]}>{item.amount! >= 0?'+':''}${(item.amount ?? 0).toFixed(2)}</Text>
                )}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.cardMeta}>{new Date(item.date).toLocaleString()}</Text>
                <Text style={styles.statusBadge}>{item.status}</Text>
              </View>
            </View>
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
                <View style={{ flexDirection:'row', justifyContent:'flex-end', gap: 12, marginTop: 8 }}>
                  <Pressable onPress={async()=>{
                    try {
                      const csv = `Tipo,ID,Título,Estado,Monto,Fecha\nPago,${p.id},${p.title},${p.status},${p.amount},${new Date(p.createdAt).toISOString()}`;
                      const uri = FileSystem.cacheDirectory + `pago-${p.id}.csv`;
                      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
                      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Descargar pago' });
                    } catch { Alert.alert('Error','No se pudo descargar'); }
                  }}><MaterialIcons name={'download'} size={18} color={'#111827'} /></Pressable>
                  <Pressable onPress={()=>Alert.alert('Reportar','Se ha reportado la transacción.')}><MaterialIcons name={'report'} size={18} color={'#ef4444'} /></Pressable>
                </View>
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all','active','redeemed','expired'] as const).map(s => (
                <Pressable key={s} onPress={() => setStatusCoupon(s)} style={[styles.filterChip, statusCoupon===s && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, statusCoupon===s && styles.filterChipTextActive]}>{s==='all'?'Todas':s}</Text>
                </Pressable>
              ))}
            </View>
            {coupons.filter(c=>match(`${c.id} ${c.title} ${c.merchant}`)).map(c => (
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all','active','used','expired','cancelled'] as const).map(s => (
                <Pressable key={s} onPress={() => setStatusEvent(s)} style={[styles.filterChip, statusEvent===s && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, statusEvent===s && styles.filterChipTextActive]}>{s==='all'?'Todas':s}</Text>
                </Pressable>
              ))}
            </View>
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
      <View style={{ position:'absolute', right: 16, bottom: 16, flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={async()=>{
          try {
            const html = `<html><body><h1>Transacciones</h1><p>Generado ${new Date().toLocaleString()}</p></body></html>`;
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartir PDF' });
          } catch (e) { Alert.alert('Error', 'No se pudo exportar PDF'); }
        }} style={[styles.fab]}>
          <MaterialIcons name={'picture-as-pdf'} size={22} color={'#ffffff'} />
        </Pressable>
      </View>
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
  fab: { height: 48, width: 48, borderRadius: 24, backgroundColor: '#1173d4', alignItems: 'center', justifyContent: 'center', elevation: 2 },
});


