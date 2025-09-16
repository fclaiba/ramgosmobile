import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Share, useWindowDimensions, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SideDrawer from '../components/SideDrawer';

export default function InfluencerDashboard() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const { width } = useWindowDimensions();
  const avatarSize = Math.max(72, Math.min(96, Math.round(width * 0.24)));

  const bars = useMemo(() => (range === '7d' ? BAR_LEVELS_7D : BAR_LEVELS_30D), [range]);
  const growth = useMemo(() => (range === '7d' ? { pct: '+4%', add: '+320' } : { pct: '+15%', add: '+1.2k' }), [range]);

  const shareLink = async () => {
    try {
      await Share.share({
        title: 'Mi enlace de referido',
        message: 'Únete con mi enlace de referido y gana beneficios: https://miapp.example/r/sophia',
        url: 'https://miapp.example/r/sophia',
      });
    } catch {}
  };

  const inviteFriends = async () => {
    try {
      await Share.share({
        title: 'Invitación',
        message: 'Te invito a probar la app y aprovechar promociones: https://miapp.example',
        url: 'https://miapp.example',
      });
    } catch {}
  };

  const openPromotions = () => {
    Alert.alert('Promociones', 'Aquí mostraremos las campañas activas (pendiente de implementación).');
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setOpen(true)} style={styles.navBtn}>
            <MaterialIcons name={"menu" as any} size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Inicio</Text>
          <Pressable style={styles.settingsBtn}>
            <MaterialIcons name={"settings" as any} size={22} color="#4b5563" />
          </Pressable>
        </View>

        {/* Dashboards Interactivos */}
        <Text style={styles.sectionTitle}>Dashboards Interactivos</Text>
        <View style={{ flexDirection:'row', gap:8 }}>
          <Pressable onPress={()=>setRange('7d')} style={[styles.switchBtn, range==='7d'&&styles.switchActive]}><Text style={range==='7d'?styles.switchActiveText:styles.switchText}>7d</Text></Pressable>
          <Pressable onPress={()=>setRange('30d')} style={[styles.switchBtn, range==='30d'&&styles.switchActive]}><Text style={range==='30d'?styles.switchActiveText:styles.switchText}>30d</Text></Pressable>
        </View>
        <View style={[styles.statCardLg, { marginTop: 8 }]}>
          <Text style={styles.subtleLabel}>Embudo de Conversión</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 8 }}>
            {[{k:'Visitantes',v:'10k'},{k:'Registros',v:'7.5k'},{k:'Perfil Completo',v:'5k'},{k:'Activos',v:'2.5k'}].map((m,i)=> (
              <View key={i} style={{ alignItems:'center', flex:1 }}>
                <Text style={{ color:'#64748b' }}>{m.k}</Text>
                <Text style={{ color:'#111827', fontWeight:'900' }}>{m.v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.statCardLg, { marginTop: 8 }]}>
          <Text style={styles.subtleLabel}>Mapa de Calor de Actividad</Text>
          <View style={{ marginTop: 8, gap: 6 }}>
            {[0,1,2].map((row)=> (
              <View key={row} style={{ flexDirection:'row', gap:6 }}>
                {Array.from({ length:7 }).map((_,col)=>{
                  const intensity = ((row*7+col+2)%7)/6; const color = `rgba(59,130,246,${0.2+0.8*intensity})`;
                  return <View key={col} style={{ width:22, height:22, borderRadius:4, backgroundColor: color }} />;
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.statCardLg, { marginTop: 8 }]}>
          <Text style={styles.subtleLabel}>Serie Temporal de Transacciones</Text>
          <View style={{ height: 120, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:6 }}>
            <Text style={{ color:'#94a3b8' }}>Gráfico (placeholder)</Text>
          </View>
        </View>

        <View style={[styles.statCardLg, { marginTop: 8, marginBottom: 8 }]}>
          <Text style={styles.subtleLabel}>Distribución Geográfica de Usuarios</Text>
          <View style={{ height: 120, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, alignItems:'center', justifyContent:'center', marginTop:6 }}>
            <Text style={{ color:'#94a3b8' }}>Mapa (placeholder)</Text>
          </View>
        </View>

        {/* Perfil */}
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
          <View>
            <Text style={styles.profileName}>Sophia Clark</Text>
            <Text style={styles.profileHandle}>@sophia.clark</Text>
          </View>
        </View>

        {/* Comisiones */}
        <Text style={styles.sectionTitle}>Comisiones</Text>
        <View style={styles.gridTwo}>
          <View style={[styles.statCardLg, { width: '48%' }]}>
            <Text style={styles.subtleLabel}>Balance actual</Text>
            <Text style={styles.amount}>$1,250.00</Text>
          </View>
          <View style={[styles.statCardLg, { width: '48%' }]}>
            <Text style={styles.subtleLabel}>Pendiente</Text>
            <Text style={styles.amount}>$350.00</Text>
          </View>
        </View>

        {/* Herramientas */}
        <Text style={styles.sectionTitle}>Herramientas promocionales</Text>
        <View style={styles.toolsGrid}>
          <Pressable accessibilityLabel="Compartir enlace" style={styles.toolItem} onPress={shareLink}>
            <View style={styles.toolIconWrap}>
              <MaterialIcons name={'link' as any} size={22} color="#111418" />
            </View>
            <Text style={styles.toolText}>{'Compartir\nenlace'}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Invitar amigos" style={styles.toolItem} onPress={inviteFriends}>
            <View style={styles.toolIconWrap}>
              <MaterialIcons name={'group-add' as any} size={22} color="#111418" />
            </View>
            <Text style={styles.toolText}>Invitar amigos</Text>
          </Pressable>
          <Pressable accessibilityLabel="Promociones" style={styles.toolItem} onPress={openPromotions}>
            <View style={styles.toolIconWrap}>
              <MaterialIcons name={'campaign' as any} size={22} color="#111418" />
            </View>
            <Text style={styles.toolText}>Promociones</Text>
          </Pressable>
        </View>

        {/* Mini herramienta de banners + enlaces UTM */}
        <View style={{ backgroundColor:'#f0f2f4', borderRadius: 12, padding: 12, marginTop: 8 }}>
          <Text style={{ fontWeight:'800', color:'#111418', fontSize:16 }}>Editor rápido de banners</Text>
          <View style={{ height: 120, borderRadius: 10, backgroundColor:'#111827', alignItems:'center', justifyContent:'center', marginTop: 8 }}>
            <Text style={{ color:'#ffffff', fontWeight:'900' }}>Tu promoción</Text>
          </View>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 8 }}>
            <Pressable style={{ borderWidth:1, borderColor:'#d1d5db', borderRadius:8, paddingHorizontal:12, paddingVertical:8, backgroundColor:'#ffffff' }}>
              <Text style={{ color:'#111418', fontWeight:'800' }}>Descargar</Text>
            </Pressable>
            <Pressable style={{ backgroundColor:'#1173d4', borderRadius:8, paddingHorizontal:12, paddingVertical:8 }}>
              <Text style={{ color:'#ffffff', fontWeight:'800' }}>Probar</Text>
            </Pressable>
          </View>
          <Text style={{ marginTop:12, color:'#111418', fontWeight:'800' }}>Enlace UTM</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:6 }}>
            <View style={{ flex:1, backgroundColor:'#ffffff', borderRadius:8, paddingHorizontal:12, paddingVertical:8 }}>
              <Text numberOfLines={1} style={{ color:'#111418' }}>https://miapp.example/promo?utm_source=influencer</Text>
            </View>
            <Pressable style={{ backgroundColor:'#e5e7eb', borderRadius:8, padding:8 }} onPress={shareLink}><MaterialIcons name={'share'} size={18} color={'#111418'} /></Pressable>
          </View>
        </View>

        {/* Crecimiento seguidores (mock) */}
        <Text style={styles.sectionTitle}>Crecimiento de seguidores</Text>
        <Text style={styles.helperText}>Últimos 30 días</Text>
        <View style={styles.growthCard}>
          <View style={styles.growthHeader}>
            <View>
              <Text style={styles.growthPct}>{growth.pct}</Text>
              <Text style={styles.growthSub}>{growth.add} este mes</Text>
            </View>
            <View style={styles.switchWrap}>
              <Pressable onPress={() => setRange('7d')} style={[styles.switchBtn, range==='7d' && styles.switchActive]}>
                <Text style={range==='7d' ? styles.switchActiveText : styles.switchText}>7d</Text>
              </Pressable>
              <Pressable onPress={() => setRange('30d')} style={[styles.switchBtn, range==='30d' && styles.switchActive]}>
                <Text style={range==='30d' ? styles.switchActiveText : styles.switchText}>30d</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.barsRow}>
            {bars.map((h, i) => (
              <View key={i} style={styles.barTrack}>
                <View style={[styles.barFill, { height: h }]} />
              </View>
            ))}
          </View>
        </View>

        {/* Principales referidos */}
        <Text style={styles.sectionTitle}>Principales referidos del mes</Text>
        <View style={{ gap: 8 }}>
          {TOP_REFERRALS.map((r) => (
            <View key={r.name} style={styles.refRow}>
              <View style={styles.refAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.refName}>{r.name}</Text>
                <Text style={styles.refMeta}>{r.count} referidos</Text>
              </View>
              <Text style={styles.refAmount}>+ ${r.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingBottom: 16, paddingHorizontal: 16, gap: 8 },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111827' },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fee2e2' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#111418' },
  profileHandle: { color: '#617589' },
  sectionTitle: { marginTop: 16, fontSize: 20, fontWeight: '800', color: '#111418' },
  gridTwo: { flexDirection: 'row', gap: 12 },
  statCardLg: { flex: 1, backgroundColor: '#f0f2f4', borderRadius: 12, padding: 16, gap: 6 },
  subtleLabel: { color: '#617589', fontWeight: '600' },
  amount: { fontSize: 22, fontWeight: '800', color: '#111418' },
  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  toolItem: { alignItems: 'center', gap: 6, flex: 1 },
  toolIconWrap: { backgroundColor: '#f0f2f4', padding: 10, borderRadius: 999 },
  toolText: { fontSize: 12, textAlign: 'center', color: '#111418' },
  helperText: { color: '#617589', marginTop: 2 },
  growthCard: { backgroundColor: '#f0f2f4', borderRadius: 12, padding: 12, gap: 8 },
  growthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  growthPct: { fontSize: 28, fontWeight: '800', color: '#111418' },
  growthSub: { color: '#078838', fontWeight: '700' },
  switchWrap: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 999, padding: 2, gap: 4 },
  switchBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  switchActive: { backgroundColor: '#1173d4' },
  switchText: { color: '#617589', fontSize: 12, fontWeight: '700' },
  switchActiveText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 },
  barTrack: { width: 10, height: 120, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#1173d4', borderRadius: 6 },
  refRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12 },
  refAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fde68a' },
  refName: { fontWeight: '700', color: '#111418' },
  refMeta: { color: '#617589', fontSize: 12 },
  refAmount: { fontWeight: '800', color: '#078838' },
});

const BAR_LEVELS_7D = [80, 60, 90, 40, 70, 100, 65];
const BAR_LEVELS_30D = [80, 60, 90, 40, 70, 100, 65, 85, 30, 95, 75, 60];
const TOP_REFERRALS = [
  { name: 'Ethan Bennett', count: 5, amount: 125 },
  { name: 'Olivia Carter', count: 3, amount: 75 },
  { name: 'Noah Davis', count: 2, amount: 50 },
];


