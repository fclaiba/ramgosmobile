import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { markRedeemed } from '../services/history';

export default function ScanVoucherScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [manual, setManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<null | { status: 'valid' | 'invalid' | 'error'; message: string }>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    // Simulación: códigos que empiezan con 'ord_' son válidos
    if (data.startsWith('ord_')) {
      markRedeemed(data);
      setResult({ status: 'valid', message: 'Bono redimido correctamente.' });
    } else if (data.startsWith('err_')) {
      setResult({ status: 'error', message: 'Error de conexión. Se sincronizará más tarde.' });
    } else {
      setResult({ status: 'invalid', message: 'Bono inválido o expirado.' });
    }
  };

  const onValidateManual = () => {
    setManual(false);
    handleScan({ data: manualCode.trim() });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name={'close'} size={20} color={'#ffffff'} />
        </Pressable>
        <Text style={styles.headerTitle}>Escanear Bono</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraWrap}>
        {hasPermission === true ? (
          <BarCodeScanner
            onBarCodeScanned={handleScan}
            style={StyleSheet.absoluteFillObject}
            torchMode={flash}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#e5e7eb' }}>Permiso de cámara {hasPermission === false ? 'denegado' : 'pendiente'}.</Text>
          </View>
        )}
        <View pointerEvents="none" style={styles.frame} />
      </View>

      <View style={styles.footer}
      >
        <Pressable style={styles.footerBtn} onPress={() => setFlash((f) => (f === 'on' ? 'off' : 'on'))}>
          <MaterialIcons name={flash === 'on' ? ('flashlight-on' as any) : ('flashlight-off' as any)} size={18} color={'#ffffff'} />
          <Text style={styles.footerText}>Linterna</Text>
        </Pressable>
        <Pressable style={styles.footerBtn} onPress={() => setManual(true)}>
          <MaterialIcons name={'keyboard'} size={18} color={'#ffffff'} />
          <Text style={styles.footerText}>Modo Manual</Text>
        </Pressable>
      </View>

      <Modal visible={manual} transparent animationType="slide" onRequestClose={() => setManual(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Ingresar Código Manualmente</Text>
              <Pressable onPress={() => setManual(false)}><MaterialIcons name={'close'} size={18} color={'#e5e7eb'} /></Pressable>
            </View>
            <Text style={styles.modalHint}>Introduce el código del bono para validarlo.</Text>
            <TextInput value={manualCode} onChangeText={setManualCode} placeholder="CÓDIGO-DEL-BONO" placeholderTextColor={'#94a3b8'} style={styles.modalInput} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={styles.modalBtnSecondary} onPress={() => setManual(false)}><Text style={styles.modalBtnText}>Cancelar</Text></Pressable>
              <Pressable style={styles.modalBtnPrimary} onPress={onValidateManual}><Text style={[styles.modalBtnText, { color: '#0b1320' }]}>Validar Bono</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!result} transparent animationType="fade" onRequestClose={() => { setResult(null); setScanned(false); }}>
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={[styles.resultIcon, result?.status === 'valid' ? styles.resultValid : result?.status === 'invalid' ? styles.resultInvalid : styles.resultError]}>
              <MaterialIcons name={result?.status === 'valid' ? ('check-circle' as any) : result?.status === 'invalid' ? ('cancel' as any) : ('signal-wifi-off' as any)} size={40} color={'#ffffff'} />
            </View>
            <Text style={styles.resultTitle}>{result?.status === 'valid' ? 'Bono Válido' : result?.status === 'invalid' ? 'Bono Inválido' : 'Error de Conexión'}</Text>
            <Text style={styles.resultHint}>{result?.message}</Text>
            <Pressable style={styles.resultBtn} onPress={() => { setResult(null); setScanned(false); }}><Text style={styles.resultBtnText}>Aceptar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1320' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  iconBtn: { height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  cameraWrap: { flex: 1, margin: 16, borderRadius: 24, overflow: 'hidden' },
  frame: { position: 'absolute', inset: 16, borderWidth: 4, borderColor: 'rgba(255,255,255,0.85)', borderRadius: 24 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  footerBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'row' },
  footerText: { color: '#ffffff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1f2937', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  modalHint: { color: '#cbd5e1' },
  modalInput: { marginTop: 4, backgroundColor: '#334155', color: '#ffffff', padding: 12, borderRadius: 8, textAlign: 'center', letterSpacing: 2 },
  modalBtnSecondary: { flex: 1, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnPrimary: { flex: 1, backgroundColor: '#38bdf8', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { color: '#ffffff', fontWeight: '800' },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  resultCard: { backgroundColor: '#111827', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  resultIcon: { height: 96, width: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  resultValid: { backgroundColor: 'rgba(34,197,94,0.85)' },
  resultInvalid: { backgroundColor: 'rgba(239,68,68,0.85)' },
  resultError: { backgroundColor: 'rgba(234,179,8,0.85)' },
  resultTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  resultHint: { color: '#cbd5e1', textAlign: 'center' },
  resultBtn: { marginTop: 8, backgroundColor: '#ffffff', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  resultBtnText: { color: '#0b1320', fontWeight: '800' },
});


