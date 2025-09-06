import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { EscrowTx, getEscrowById, getRemaining, sendMessage, confirmDelivery, openDispute, confirmShipment, releaseFunds } from '../services/escrow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type Param = { EscrowFlow: { id: string } };

export default function EscrowFlowScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Param, 'EscrowFlow'>>();
  const [tick, setTick] = useState(0);
  const [input, setInput] = useState('');
  const [tracking, setTracking] = useState('');
  const tx: EscrowTx | undefined = getEscrowById(route.params?.id);

  useEffect(() => { const i = setInterval(() => setTick((x) => x + 1), 60 * 1000); return () => clearInterval(i); }, []);

  if (!tx) return (
    <SafeAreaView style={styles.safe}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Transacción no encontrada</Text></View></SafeAreaView>
  );

  const remaining = getRemaining(tx.id);
  const onSend = () => { if (!input.trim()) return; sendMessage(tx.id, 'buyer', input.trim()); setInput(''); };
  const onConfirm = () => { confirmDelivery(tx.id); };
  const onDispute = () => { openDispute(tx.id); };
  const onShip = () => { if (!tracking.trim()) return; confirmShipment(tx.id, tracking.trim()); setTracking(''); };
  const onRelease = () => { releaseFunds(tx.id); };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => nav.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Flujo de Escrow</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Transacción #{tx.id}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fef3c7', borderRadius: 999 }}>
            <Text style={{ color: '#92400e', fontWeight: '800' }}>{tx.status === 'disputed' ? 'En disputa' : 'Activo'}</Text>
          </View>
        </View>
        <Text style={{ color: '#64748b', marginTop: 4 }}>{tx.title}</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Text style={{ fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>Progreso de la transacción</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'center', marginRight: 16 }}>
            {['held','shipped','delivered','released'].map((step, idx) => (
              <View key={step} style={{ alignItems: 'center' }}>
                <View style={[styles.stepCircle, (tx.status === step || (idx < ['held','shipped','delivered','released'].indexOf(tx.status))) && styles.stepActive]}>
                  <MaterialIcons name={idx===0?'check':idx===1?'local-shipping':idx===2?'inventory-2':'paid'} size={16} color={(tx.status === step || (idx < ['held','shipped','delivered','released'].indexOf(tx.status))) ? '#ffffff' : '#6b7280'} />
                </View>
                {idx < 3 && <View style={[styles.stepLine, (idx < ['held','shipped','delivered','released'].indexOf(tx.status)) && styles.stepLineActive]} />}
              </View>
            ))}
          </View>
          <View style={{ flex: 1, gap: 18 }}>
            <View>
              <Text style={{ color: '#4f46e5', fontWeight: '800' }}>Pago retenido</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>{new Date(tx.createdAt).toLocaleString()}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>El pago del comprador ha sido recibido y está seguro en Escrow.</Text>
            </View>
            <View>
              <Text style={{ color: '#4f46e5', fontWeight: '800' }}>Envío confirmado</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>{tx.tracking ? 'Confirmado' : 'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Número de seguimiento: <Text style={{ color: '#2563eb', fontFamily: 'monospace' }}>{tx.tracking ?? '—'}</Text></Text>
            </View>
            <View>
              <Text style={{ color: tx.status==='delivered'?'#4f46e5':'#6b7280', fontWeight: '800' }}>Producto recibido</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{tx.status==='delivered'?'Confirmado':'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Esperando confirmación de recepción del producto.</Text>
            </View>
            <View>
              <Text style={{ color: tx.status==='released'?'#4f46e5':'#6b7280', fontWeight: '800' }}>Fondos liberados</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{tx.status==='released'?'Hecho':'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Se liberarán al confirmar recepción.</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={{ fontWeight: '800', color: '#0f172a' }}>Acciones</Text>
        <View style={{ height: 8 }} />
        {tx.status === 'held' && (
          <View>
            <Text style={{ color: '#64748b', marginBottom: 6 }}>El vendedor puede confirmar el envío e ingresar un número de seguimiento.</Text>
            <View style={styles.shipRow}>
              <TextInput value={tracking} onChangeText={setTracking} placeholder={'Número de seguimiento'} placeholderTextColor={'#94a3b8'} style={styles.shipInput} />
              <Pressable style={[styles.btnPrimary, { height: 40 }]} onPress={onShip}>
                <MaterialIcons name={'local-shipping'} size={18} color={'#ffffff'} />
                <Text style={styles.btnPrimaryText}>Confirmar envío</Text>
              </Pressable>
            </View>
          </View>
        )}
        {tx.status !== 'held' && (
          <Pressable style={styles.btnPrimary} onPress={onConfirm} disabled={tx.status!=='shipped'}>
          <MaterialIcons name={'check-circle'} size={18} color={'#ffffff'} />
          <Text style={styles.btnPrimaryText}>Confirmar Recepción</Text>
          </Pressable>
        )}
        {tx.status === 'delivered' && (
          <>
            <View style={{ height: 8 }} />
            <Pressable style={[styles.btnPrimary, { backgroundColor: '#10b981' }]} onPress={onRelease}>
              <MaterialIcons name={'paid'} size={18} color={'#ffffff'} />
              <Text style={styles.btnPrimaryText}>Liberar fondos</Text>
            </Pressable>
          </>
        )}
        <View style={{ height: 8 }} />
        <View style={styles.disputeBox}>
          <Text style={{ color: '#b91c1c', fontWeight: '800', textAlign: 'center' }}>¿Problemas? Inicia una disputa</Text>
          <Text style={{ color: '#dc2626', fontWeight: '900', fontSize: 18, textAlign: 'center', marginTop: 4 }}>{remaining.hours}h {remaining.minutes}m restantes</Text>
          <Pressable style={styles.btnOutline} onPress={onDispute}>
            <MaterialIcons name={'report-problem'} size={18} color={'#b91c1c'} />
            <Text style={styles.btnOutlineText}>Iniciar Disputa</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={{ fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>Chat de la transacción</Text>
        <FlatList
          data={[...(tx.messages || [])]}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={{ alignItems: item.author==='buyer' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <View style={[styles.bubble, item.author==='buyer' ? styles.bubbleBuyer : styles.bubbleSeller]}>
                <View style={{ flexDirection: 'row', justifyContent: item.author==='buyer' ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.bubbleMeta, item.author==='buyer' && { color: 'rgba(255,255,255,0.8)' }]}>{item.author==='buyer'?'Tú':'Vendedor'} · {new Date(item.at).toLocaleTimeString().slice(0,5)}</Text>
                </View>
                <Text style={[styles.bubbleText, item.author==='buyer' && { color: '#ffffff' }]}>{item.text}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        />
        <View style={styles.chatInputRow}>
          <TextInput style={styles.chatInput} placeholder={'Escribe un mensaje...'} placeholderTextColor={'#94a3b8'} value={input} onChangeText={setInput} />
          <Pressable style={styles.chatSend} onPress={onSend}><MaterialIcons name={'send'} size={18} color={'#ffffff'} /></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#0f172a' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 16 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  stepActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  stepLine: { width: 2, height: 56, backgroundColor: '#e5e7eb', marginVertical: 4 },
  stepLineActive: { backgroundColor: '#4f46e5' },
  btnPrimary: { height: 44, borderRadius: 8, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnPrimaryText: { color: '#ffffff', fontWeight: '900' },
  disputeBox: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', alignItems: 'center' },
  btnOutline: { height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginTop: 8 },
  btnOutlineText: { color: '#b91c1c', fontWeight: '800' },
  bubble: { maxWidth: 320, padding: 10, borderRadius: 12 },
  bubbleSeller: { backgroundColor: '#f3f4f6' },
  bubbleBuyer: { backgroundColor: '#4f46e5' },
  bubbleMeta: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  bubbleText: { color: '#0f172a' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  chatInput: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, backgroundColor: '#ffffff', color: '#0f172a' },
  chatSend: { marginLeft: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
});


