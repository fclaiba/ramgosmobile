import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SideDrawer from '../components/SideDrawer';
import { useNavigation } from '@react-navigation/native';

const BLUE = '#1172d4';

export default function MerchantHomeScreen() {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => setOpen(true)} style={styles.navBtn}>
            <MaterialIcons name={"menu" as any} size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Inicio</Text>
          <Pressable style={styles.settingsBtn}>
            <MaterialIcons name="settings" size={22} color="#4b5563" />
          </Pressable>
        </View>

        {/* Scan QR */}
        <View style={styles.sectionPad}>
          <Pressable style={styles.scanRow} onPress={() => navigation.navigate('Scan') }>
            <View style={styles.scanIconCircle}>
              <MaterialIcons name={"qr_code_scanner" as any} size={22} color="#ffffff" />
            </View>
            <Text style={styles.scanText}>Escanear QR</Text>
            <MaterialIcons name={"arrow_forward_ios" as any} size={18} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Estadísticas */}
        <View style={styles.sectionPad}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estadísticas</Text>
            <View style={{ gap: 8 }}>
              <Text style={styles.metricLabel}>Redenciones</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={styles.metricValue}>120</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#6b7280' }}>Este mes</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <MaterialIcons name={"arrow_upward" as any} size={14} color="#16a34a" />
                    <Text style={{ color: '#16a34a', fontWeight: '600' }}>15%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bars */}
            <View style={styles.barsGrid}>
              {['Ene','Feb','Mar','Abr','May','Jun'].map((m, idx) => (
                <View key={m} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { height: (140 * [100,90,60,60,70,10][idx]) / 100 },
                    ]} />
                  </View>
                  <Text style={styles.barLabel}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Publicar bono */}
        <View style={styles.publishPad}>
          <Pressable style={styles.publishBtn}>
            <MaterialIcons name={"add_circle" as any} size={22} color="#ffffff" />
            <Text style={styles.publishText}>Publicar bono</Text>
          </Pressable>
        </View>

        {/* Alertas */}
        <View style={styles.sectionPad}>
          <Text style={styles.alertsTitle}>Alertas</Text>
          <View style={styles.alertRow}>
            <View style={styles.alertIconCircle}>
              <MaterialIcons name="sell" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle} numberOfLines={1}>Bono de descuento del 20%</Text>
              <Text style={styles.alertSub}>Expira en 3 días</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { paddingBottom: 16 },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111827' },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 14, marginLeft: 0 },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  sectionPad: { paddingHorizontal: 16, paddingTop: 12 },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 1,
  },
  scanIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  scanText: { flex: 1, color: '#1f2937', fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, elevation: 1 },
  cardTitle: { color: '#1f2937', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  metricLabel: { color: '#6b7280' },
  metricValue: { color: '#111827', fontSize: 40, fontWeight: '800' },
  barsGrid: {
    minHeight: 180,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 8,
    gap: 12,
  },
  barCol: { alignItems: 'center', width: '16%' },
  barTrack: { height: 140, width: '100%', backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden' },
  barFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: BLUE, borderRadius: 8 },
  barLabel: { marginTop: 6, fontSize: 12, color: '#6b7280', fontWeight: '600' },
  publishPad: { paddingHorizontal: 16, paddingTop: 8 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: BLUE, height: 56, borderRadius: 14 },
  publishText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  alertsTitle: { color: '#1f2937', fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingBottom: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 16, padding: 16, borderRadius: 16, gap: 12 },
  alertIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: '#111827', fontWeight: '600' },
  alertSub: { color: '#dc2626' },
});


