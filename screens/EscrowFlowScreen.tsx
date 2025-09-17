import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, FlatList, ScrollView, Alert, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { EscrowTx, getEscrowById, getRemaining, sendMessage, confirmDelivery, openDispute, confirmShipment, releaseFunds, subscribeEscrow } from '../services/escrow';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

type Param = { EscrowFlow: { id: string } };

export default function EscrowFlowScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<Param, 'EscrowFlow'>>();
  const { role, userId } = useUser();
  const { width, height } = useWindowDimensions();
  const [tick, setTick] = useState(0);
  const [input, setInput] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [localStatus, setLocalStatus] = useState<EscrowTx['status'] | undefined>(undefined);
  const [localTracking, setLocalTracking] = useState<string | undefined>(undefined);
  const tx: EscrowTx | undefined = getEscrowById(route.params?.id);

  const horizontalPadding = width < 380 ? 12 : 16;
  const containerMaxWidth = Math.min(800, width - horizontalPadding * 2);
  const bubbleMaxWidth = Math.min(360, width * 0.78);
  const chatMaxHeight = Math.min(360, Math.max(160, Math.floor(height * 0.35)));

  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 1000);
    const unsub = subscribeEscrow(() => setTick((x) => x + 1));
    return () => { clearInterval(i); unsub(); };
  }, []);

  useEffect(() => {
    if (tx) {
      setLocalStatus(tx.status);
      setLocalTracking(tx.tracking);
    }
  }, [tx?.status, tx?.tracking]);

  if (!tx) return (
    <SafeAreaView style={styles.safe}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Transacción no encontrada</Text></View></SafeAreaView>
  );

  // Determinar el rol del usuario en esta negociación (comprador/vendedor)
  const participantRole: 'buyer' | 'seller' | 'viewer' = tx.buyerId===userId ? 'buyer' : tx.sellerId===userId ? 'seller' : 'viewer';
  const isSeller = participantRole === 'seller';
  const modeLabel = participantRole === 'buyer' ? 'Compra' : participantRole === 'seller' ? 'Venta' : 'Escrow';
  const remaining = getRemaining(tx.id);
  const onSend = () => { if (!input.trim()) return; sendMessage(tx.id, 'buyer', input.trim()); setInput(''); };
  const onConfirm = () => {
    if (busy) return;
    setBusy(true);
    try {
      if ((localStatus ?? tx.status) === 'held') {
        const code = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        confirmShipment(tx.id, code);
        setLocalTracking(code);
        setLocalStatus('shipped');
      }
      if ((localStatus ?? tx.status) !== 'delivered') { confirmDelivery(tx.id); setLocalStatus('delivered'); }
      Alert.alert('Confirmado', 'Has confirmado la recepción del producto.');
    } finally { setBusy(false); }
  };
  const onDispute = () => {
    if (busy) return;
    setBusy(true);
    try { openDispute(tx.id); setLocalStatus('disputed'); Alert.alert('Disputa iniciada', 'Hemos registrado tu disputa.'); } finally { setBusy(false); }
  };
  const onShip = () => {
    if (busy) return;
    if ((localStatus ?? tx.status) !== 'held') { Alert.alert('Acción no disponible', 'El envío solo puede confirmarse cuando el pago está retenido.'); return; }
    setBusy(true);
    try {
      const code = (tracking && tracking.trim()) || `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      confirmShipment(tx.id, code);
      setTracking('');
      setLocalTracking(code);
      setLocalStatus('shipped');
      Alert.alert('Envío confirmado', `Tracking: ${code}`);
    } finally { setBusy(false); }
  };
  const onRelease = () => {
    if (busy) return;
    setBusy(true);
    try {
      if ((localStatus ?? tx.status) === 'held') {
        const code = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        confirmShipment(tx.id, code);
        confirmDelivery(tx.id);
        setLocalTracking(code);
        setLocalStatus('delivered');
      }
      if ((localStatus ?? tx.status) === 'shipped') { confirmDelivery(tx.id); setLocalStatus('delivered'); }
      releaseFunds(tx.id);
      setLocalStatus('released');
      Alert.alert('Fondos liberados', 'Se liberaron los fondos al vendedor.');
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => nav.goBack()} style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></Pressable>
        <Text style={styles.headerTitle}>Flujo de Escrow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps={'handled'}>
        <View style={[styles.card, { marginHorizontal: horizontalPadding, width: containerMaxWidth, alignSelf: 'center' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Transacción #{tx.id}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fef3c7', borderRadius: 999 }}>
            <Text style={{ color: '#92400e', fontWeight: '800' }}>{(localStatus ?? tx.status) === 'disputed' ? 'En disputa' : 'Activo'}</Text>
          </View>
        </View>
        <Text style={{ color: '#64748b', marginTop: 4 }}>{tx.title}</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap: 8, marginTop: 8 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor:'#e5e7eb', borderRadius: 999 }}>
            <Text style={{ color:'#111827', fontWeight:'800' }}>Modo: {modeLabel}</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor:'#f1f5f9', borderRadius: 999 }}>
            <Text style={{ color:'#0f172a', fontWeight:'800' }}>Tu rol: {participantRole==='buyer'?'Comprador':participantRole==='seller'?'Vendedor':'Observador'}</Text>
          </View>
        </View>
        </View>

        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 12 }}>
        <Text style={{ fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>Progreso de la transacción</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'center', marginRight: 16 }}>
            {['held','shipped','delivered','released'].map((step, idx) => (
              <View key={step} style={{ alignItems: 'center' }}>
                <View style={[styles.stepCircle, (((localStatus ?? tx.status) === step) || (idx < ['held','shipped','delivered','released'].indexOf(localStatus ?? tx.status))) && styles.stepActive]}>
                  <MaterialIcons name={idx===0?'check':idx===1?'local-shipping':idx===2?'inventory-2':'paid'} size={16} color={(((localStatus ?? tx.status) === step) || (idx < ['held','shipped','delivered','released'].indexOf(localStatus ?? tx.status))) ? '#ffffff' : '#6b7280'} />
                </View>
                {idx < 3 && <View style={[styles.stepLine, (idx < ['held','shipped','delivered','released'].indexOf(localStatus ?? tx.status)) && styles.stepLineActive]} />}
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
              <Text style={{ color: '#64748b', fontSize: 12 }}>{(localTracking ?? tx.tracking) ? 'Confirmado' : 'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Número de seguimiento: <Text style={{ color: '#2563eb', fontFamily: 'monospace' }}>{localTracking ?? tx.tracking ?? '—'}</Text></Text>
            </View>
            <View>
              <Text style={{ color: (localStatus ?? tx.status)==='delivered'?'#4f46e5':'#6b7280', fontWeight: '800' }}>Producto recibido</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{(localStatus ?? tx.status)==='delivered'?'Confirmado':'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Esperando confirmación de recepción del producto.</Text>
            </View>
            <View>
              <Text style={{ color: (localStatus ?? tx.status)==='released'?'#4f46e5':'#6b7280', fontWeight: '800' }}>Fondos liberados</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{(localStatus ?? tx.status)==='released'?'Hecho':'Pendiente'}</Text>
              <Text style={{ color: '#334155', marginTop: 4 }}>Se liberarán al confirmar recepción.</Text>
            </View>
          </View>
        </View>
        </View>

        <View style={[styles.card, { marginHorizontal: horizontalPadding, width: containerMaxWidth, alignSelf: 'center' }]}>
        <Text style={{ fontWeight: '800', color: '#0f172a' }}>Acciones</Text>
        <View style={{ height: 8 }} />
        {/* Un solo botón por fase y rol */}
        {(() => {
          const status = localStatus ?? tx.status;
          if (isSeller) {
            if (status === 'held') {
              return (
                <View>
                  <Text style={{ color: '#64748b', marginBottom: 6 }}>Confirma el envío e ingresa (o genera) el número de seguimiento.</Text>
                  <View style={styles.shipRow}>
                    <TextInput value={tracking} onChangeText={setTracking} placeholder={'Número de seguimiento'} placeholderTextColor={'#94a3b8'} style={styles.shipInput} />
                    <Pressable style={[styles.btnPrimary, { height: 40 }, (busy) && { opacity: 0.6 }]} onPress={onShip} disabled={busy}>
                      <MaterialIcons name={'local-shipping'} size={18} color={'#ffffff'} />
                      <Text style={styles.btnPrimaryText}>Confirmar envío</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }
            return <Text style={{ color: '#64748b' }}>Esperando acciones del comprador…</Text>;
          }
          // Comprador
          if (status === 'shipped') {
            return (
              <Pressable style={[styles.btnPrimary, busy && { opacity: 0.6 }]} onPress={onConfirm} disabled={busy}>
                <MaterialIcons name={'check-circle'} size={18} color={'#ffffff'} />
                <Text style={styles.btnPrimaryText}>Confirmar Recepción</Text>
              </Pressable>
            );
          }
          if (status === 'delivered') {
            return (
              <Pressable style={[styles.btnPrimary, { backgroundColor: '#10b981' }, busy && { opacity: 0.6 }]} onPress={onRelease} disabled={busy}>
                <MaterialIcons name={'paid'} size={18} color={'#ffffff'} />
                <Text style={styles.btnPrimaryText}>Liberar fondos</Text>
              </Pressable>
            );
          }
          if (status === 'held') return <Text style={{ color: '#64748b' }}>Esperando envío del vendedor…</Text>;
          return null;
        })()}
        <View style={{ height: 8 }} />
        <View style={styles.disputeBox}>
          <Text style={{ color: '#b91c1c', fontWeight: '800', textAlign: 'center' }}>¿Problemas? Inicia una disputa</Text>
          <Text style={{ color: '#dc2626', fontWeight: '900', fontSize: 18, textAlign: 'center', marginTop: 4 }}>{remaining.hours}h {remaining.minutes}m {remaining.seconds}s restantes</Text>
          <Pressable style={styles.btnOutline} onPress={onDispute}>
            <MaterialIcons name={'report-problem'} size={18} color={'#b91c1c'} />
            <Text style={styles.btnOutlineText}>Iniciar Disputa</Text>
          </Pressable>
        </View>
        </View>

        <View style={[styles.card, { marginHorizontal: horizontalPadding, width: containerMaxWidth, alignSelf: 'center' }]}>
        <Text style={{ fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>Chat de la transacción</Text>
        <FlatList
          data={[...(tx.messages || [])]}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={{ alignItems: item.author==='buyer' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <View style={[styles.bubble, { maxWidth: bubbleMaxWidth }, item.author==='buyer' ? styles.bubbleBuyer : styles.bubbleSeller]}>
                <View style={{ flexDirection: 'row', justifyContent: item.author==='buyer' ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.bubbleMeta, item.author==='buyer' && { color: 'rgba(255,255,255,0.8)' }]}>{item.author==='buyer'?'Tú':'Vendedor'} · {new Date(item.at).toLocaleTimeString().slice(0,5)}</Text>
                </View>
                <Text style={[styles.bubbleText, item.author==='buyer' && { color: '#ffffff' }]}>{item.text}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          style={{ maxHeight: chatMaxHeight }}
          nestedScrollEnabled
        />
        <View style={styles.chatInputRow}>
          <TextInput style={styles.chatInput} placeholder={'Escribe un mensaje...'} placeholderTextColor={'#94a3b8'} value={input} onChangeText={setInput} />
          <Pressable style={styles.chatSend} onPress={onSend}><MaterialIcons name={'send'} size={18} color={'#ffffff'} /></Pressable>
        </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Pressable style={styles.btnSupport} onPress={() => { try { (nav as any).navigate?.('SocialChat' as any, { userId: 'support' } as any); } catch {} }}>
            <MaterialIcons name={'support-agent'} size={18} color={'#0f172a'} />
            <Text style={{ color: '#0f172a', fontWeight: '800' }}>Contactar Soporte Urgente</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  shipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shipInput: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, backgroundColor: '#ffffff', color: '#0f172a' },
  bubble: { maxWidth: 320, padding: 10, borderRadius: 12 },
  bubbleSeller: { backgroundColor: '#f3f4f6' },
  bubbleBuyer: { backgroundColor: '#4f46e5' },
  bubbleMeta: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  bubbleText: { color: '#0f172a' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  chatInput: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, backgroundColor: '#ffffff', color: '#0f172a' },
  chatSend: { marginLeft: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  btnSupport: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});


