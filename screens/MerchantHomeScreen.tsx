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
  const [dashRange, setDashRange] = useState<'7d'|'30d'|'90d'>('30d');
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

        {/* Herramientas de Promoción */}
        <View style={styles.sectionPad}>
          <Text style={styles.cardTitle}>Herramientas de Promoción</Text>
          <View style={styles.promoCard}>
            {/* Preview banner */}
            <View style={styles.bannerPreview}>
              <Text style={styles.bannerTitle}>Título del Banner</Text>
              <Text style={styles.bannerDesc}>Texto descriptivo de la promoción</Text>
            </View>
            {/* Controles simples */}
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 12 }}>
              <Pressable style={[styles.outlineBtn]}> 
                <MaterialIcons name={'download'} size={18} color={'#111827'} />
                <Text style={styles.outlineBtnText}>Descargar</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn}> 
                <Text style={styles.primaryBtnText}>Probar Diseño</Text>
              </Pressable>
            </View>
          </View>
          {/* Generador de enlaces UTM */}
          <View style={[styles.card, { marginTop: 12 }] }>
            <Text style={{ color:'#111827', fontWeight:'800', fontSize:18 }}>Generador de Enlaces</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.muted}>Enlace con seguimiento UTM</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 8, marginTop: 6 }}>
                <View style={{ flex:1, backgroundColor:'#f3f4f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ color:'#111827' }} numberOfLines={1}>https://tuweb.com/promo?utm_source=social</Text>
                </View>
                <Pressable style={styles.iconBtnSm}><MaterialIcons name={'content-copy'} size={18} color={'#374151'} /></Pressable>
              </View>
              <Pressable style={[styles.primaryBtn, { marginTop: 12 }]}>
                <MaterialIcons name={'add-link'} size={18} color={'#ffffff'} />
                <Text style={styles.primaryBtnText}>Generar Nuevo Enlace</Text>
              </Pressable>
            </View>
          </View>
          {/* Estadísticas de clics */}
          <View style={[styles.card, { marginTop: 12 }] }>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
              <Text style={{ color:'#111827', fontWeight:'800', fontSize:18 }}>Clics por Enlace</Text>
              <View style={{ backgroundColor:'#f3f4f6', borderRadius:8, paddingHorizontal:8, paddingVertical:6 }}><Text style={{ color:'#111827' }}>Últimos 7 días</Text></View>
            </View>
            <View style={{ marginTop: 8, gap: 8 }}>
              {['.../promo?utm_source=social','.../promo?utm_source=email','.../promo?utm_source=ads'].map((l, i)=> (
                <View key={i} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                  <Text style={{ color:'#6b7280', flex:1 }} numberOfLines={1}>{l}</Text>
                  <Text style={{ color:'#111827', fontWeight:'900' }}>{[1234,987,456][i]} clics</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Dashboards Interactivos */}
        <View style={styles.sectionPad}>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            <Pressable style={{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#ffffff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, paddingHorizontal:12, paddingVertical:8 }}>
              <MaterialIcons name={'calendar-today'} size={16} color={'#111827'} />
              <Text style={{ color:'#111827', fontWeight:'800' }}>{dashRange==='7d'?'Últimos 7 días':dashRange==='30d'?'Últimos 30 días':'Últimos 90 días'}</Text>
            </Pressable>
            <View style={{ flexDirection:'row', gap:8 }}>
              <Pressable onPress={()=>setDashRange('7d')} style={[styles.rangeChip, dashRange==='7d'&&styles.rangeChipActive]}><Text style={dashRange==='7d'?styles.rangeChipTextActive:styles.rangeChipText}>7d</Text></Pressable>
              <Pressable onPress={()=>setDashRange('30d')} style={[styles.rangeChip, dashRange==='30d'&&styles.rangeChipActive]}><Text style={dashRange==='30d'?styles.rangeChipTextActive:styles.rangeChipText}>30d</Text></Pressable>
              <Pressable onPress={()=>setDashRange('90d')} style={[styles.rangeChip, dashRange==='90d'&&styles.rangeChipActive]}><Text style={dashRange==='90d'?styles.rangeChipTextActive:styles.rangeChipText}>90d</Text></Pressable>
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.subSectionTitle}>Embudo de Conversión</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 12 }}>
              {[{k:'Visitantes',v:'10k'},{k:'Registros',v:'7.5k'},{k:'Perfil\nCompleto',v:'5k'},{k:'Activos',v:'2.5k'}].map((m,i)=> (
                <View key={i} style={{ alignItems:'center', flex:1 }}>
                  <Text style={{ color:'#64748b', textAlign:'center' }}>{m.k}</Text>
                  <Text style={{ color:'#111827', fontWeight:'900', fontSize:18 }}>{m.v}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.subSectionTitle}>Mapa de Calor de Actividad</Text>
            <View style={{ marginTop: 12, gap: 8 }}>
              {[0,1,2,3].map((row)=> (
                <View key={row} style={{ flexDirection:'row', gap:8 }}>
                  {Array.from({ length:7 }).map((_,col)=>{
                    const intensity = ((row*7+col+3)%7)/6;
                    const color = `rgba(34,197,94,${0.2+0.8*intensity})`;
                    return <View key={col} style={{ width:36, height:36, borderRadius:6, backgroundColor: color }} />;
                  })}
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.subSectionTitle}>Serie Temporal de Transacciones</Text>
            <View style={{ height: 160, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:8 }}>
              <Text style={{ color:'#94a3b8' }}>Gráfico de serie temporal (placeholder)</Text>
            </View>
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.subSectionTitle}>Distribución Geográfica de Usuarios</Text>
            <View style={{ height: 160, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:8 }}>
              <Text style={{ color:'#94a3b8' }}>Mapa de distribución geográfica (placeholder)</Text>
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
    boxShadow: '0px 6px 16px rgba(0,0,0,0.05)',
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
  promoCard: { backgroundColor: '#f3f4f6', borderRadius: 16, padding: 12 },
  bannerPreview: { height: 160, borderRadius: 12, overflow:'hidden', backgroundColor:'#1f2937', alignItems:'center', justifyContent:'center' },
  bannerTitle: { color:'#ffffff', fontSize: 20, fontWeight:'900' },
  bannerDesc: { color:'#e5e7eb' },
  outlineBtn: { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1, borderColor:'#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor:'#ffffff' },
  outlineBtnText: { color:'#374151', fontWeight:'800' },
  primaryBtn: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  primaryBtnText: { color:'#ffffff', fontWeight:'800' },
  iconBtnSm: { width: 40, height: 40, borderRadius: 8, backgroundColor:'#e5e7eb', alignItems:'center', justifyContent:'center' },
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
  subSectionTitle: { color:'#111827', fontSize:18, fontWeight:'800' },
  rangeChip: { paddingHorizontal:10, paddingVertical:6, borderRadius:999, backgroundColor:'#e5e7eb' },
  rangeChipActive: { backgroundColor: BLUE },
  rangeChipText: { color:'#111827', fontWeight:'700' },
  rangeChipTextActive: { color:'#ffffff', fontWeight:'800' },
  alertsTitle: { color: '#1f2937', fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingBottom: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 16, padding: 16, borderRadius: 16, gap: 12 },
  alertIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: '#111827', fontWeight: '600' },
  alertSub: { color: '#dc2626' },
});


