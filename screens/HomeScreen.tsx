import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  RefreshControl,
  ImageBackground,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SideDrawer from '../components/SideDrawer';

const PRIMARY = '#0ea5e9';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6b7280';
const BORDER = '#e5e7eb';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => setOpen(true)}>
            <MaterialIcons name="menu" size={22} color={TEXT_DARK} />
          </Pressable>
          <Text style={styles.title}>Hola, Sofia</Text>
          <View style={styles.notificationsWrapper}>
            <Pressable style={[styles.iconButton, styles.iconButtonMuted]}>
              <MaterialIcons name="notifications" size={22} color={TEXT_DARK} />
            </Pressable>
            <View style={styles.badge} />
          </View>
        </View>

        {/* Pull to refresh hint */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.divider} />
          <Text style={styles.pullToRefresh}>Pull to refresh</Text>
        </View>

        {/* Active coupons */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 12 }]}>Tus Bonos Activos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {COUPONS.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <ImageBackground source={{ uri: coupon.image }} style={styles.couponImage} imageStyle={{ borderRadius: 12 }} />
              <View>
                <Text style={styles.couponTitle}>{coupon.title}</Text>
                <Text style={styles.couponSubtitle}>
                  Expira en: <Text style={styles.couponStrong}>{coupon.expiresIn}</Text>
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Recent history */}
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 16 }]}>Historial Reciente</Text>
          <Pressable style={{ paddingRight: 16 }}>
            <Text style={styles.link}>Ver todo</Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 8, gap: 8 }}>
          {HISTORY.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyIconCircle}>
                <MaterialIcons name={item.icon as any} size={20} color={TEXT_DARK} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.historyTime} numberOfLines={1}>{item.time}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: item.amount.startsWith('-') ? '#dc2626' : '#059669' }]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 16 }]}>Tu Progreso</Text>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, flexDirection: 'row' }}>
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="group" size={18} color={PRIMARY} />
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <Text style={styles.statValue}>150</Text>
          </View>
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name={'show-chart' as any} size={18} color={PRIMARY} />
              <Text style={styles.statLabel}>Progreso a Influencer</Text>
            </View>
            <View style={{ width: '100%', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0c4a6e' }}>75%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>
        </View>

        {/* Recommendation */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 8 }]}>Recomendaciones para ti</Text>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={styles.recoCard}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.recoShop}>Tienda D</Text>
              <Text style={styles.recoTitle}>20% de descuento</Text>
              <Text style={styles.recoDesc}>En tu próxima compra. ¡No te lo pierdas!</Text>
              <Pressable style={styles.recoButton}>
                <Text style={styles.recoButtonText}>Ver Oferta</Text>
              </Pressable>
            </View>
            <ImageBackground
              source={{ uri: RECO_IMAGE }}
              style={styles.recoImage}
              imageStyle={{ borderRadius: 12 }}
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
}

const COUPONS = [
  {
    id: 'c1',
    title: 'Bono de Bienvenida',
    expiresIn: '3d 12h 45m',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6-LMUx69EfcnWeGG1KxATdQdLhXSlxjl4zMC15WHbDVbHzbZf4NzaIfe6wm23Cmovv2vVuEt7tjyC7djeWewBsZREVAQ3FECa20MNHdECcgHc1ZHwNQFYF591l5HoZHoWt0oqesRgtP962TTOcweB4x9hjnygBEX-VbCXp1SsFFO8rfEpm4jYAkey4I2nM_65C-vJc6U-hWjE7RbxaW05H8WTvz_o8hvyMFiZ4RjlP5bbRMFe-JNJf47dzSdjFl_3knBHrG0phV36',
  },
  {
    id: 'c2',
    title: 'Bono de Cumpleaños',
    expiresIn: '20d 5h 10m',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAytotTOaKNdWsv04ZrBe_VygkSXx8WKI9PMh3KJQ-lNjZft7XlPDMkgF1epGRnDcLKS0ckYxnRBd5gAHe7FMe-CeyDttLBHhW5pigGEs8LSrb6hq0cEs1XRxkNWxebTxVT7MrypwMhLtP2LPBlnYQhjZN_Ud2BrhyjRAHfaLKQeDeTFj0NHKy78UfChrNO_6QHQvSBjYajDi3HSiq63Ll_Op4AXvk3msANOd4n_R_LJCxgjZyqSChQ4xFzyz-M4y6ELcPxlsNuBp-Y',
  },
];

const HISTORY = [
  { id: 'h1', icon: 'storefront', title: 'Compra en Tienda A', time: 'Hace 2 horas', amount: '-$25.00' },
  { id: 'h2', icon: 'redeem', title: 'Recompensa de Tienda B', time: 'Ayer', amount: '+$10.00' },
  { id: 'h3', icon: 'storefront', title: 'Compra en Tienda C', time: 'Hace 3 días', amount: '-$15.00' },
];

const RECO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCZFdapP9nAV8rBqQMqBWXbxRj_HW3sNvczJX4TmhXO13THnj89De_1hbvrMf_ngeUmiQoayAfm2F0_h4WOPdtq7eGcm7T5LUqsIqLXIKZNucYQ6iLKVGvpW57xcu2ixyLf7SUQcpPqUDEmtDGGg8d4YXFaYjW2MPX1-5BZ1Ty6Imqe5bBjTTb0cJlLxCFQeDbkrwoCIHbS1aPu6F9VLxkas6TIYJZGJkvG9b9lCK8faEHIYshuKu8gCWAt1Il01-msxIwis8hVo5Lq';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingBottom: 16 },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconButtonMuted: { backgroundColor: '#f3f4f6' },
  notificationsWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: { fontSize: 24, fontWeight: '800', color: TEXT_DARK },
  divider: { height: 2, backgroundColor: '#f3f4f6', marginVertical: 8 },
  pullToRefresh: { textAlign: 'center', fontSize: 12, color: '#9ca3af' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: '#0284c7', fontWeight: '600', fontSize: 14 },
  couponCard: {
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 8,
  },
  couponImage: { width: '100%', height: 160, borderRadius: 12 },
  couponTitle: { color: TEXT_DARK, fontSize: 18, fontWeight: '700' },
  couponSubtitle: { color: '#6b7280', fontSize: 14 },
  couponStrong: { color: '#374151', fontWeight: '700' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 12,
  },
  historyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: { color: TEXT_DARK, fontWeight: '600' },
  historyTime: { color: '#6b7280', fontSize: 12 },
  historyAmount: { fontSize: 16, fontWeight: '700' },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  statLabel: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  statValue: { color: TEXT_DARK, fontSize: 28, fontWeight: '800' },
  progressTrack: { width: '100%', height: 10, backgroundColor: '#e5e7eb', borderRadius: 12 },
  progressFill: { width: '75%', height: 10, backgroundColor: PRIMARY, borderRadius: 12 },
  recoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  recoShop: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  recoTitle: { color: TEXT_DARK, fontWeight: '800', fontSize: 18 },
  recoDesc: { color: TEXT_MUTED, fontSize: 14 },
  recoButton: {
    marginTop: 4,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  recoButtonText: { color: '#ffffff', fontWeight: '700' },
  recoImage: { width: 96, height: 96 },
});


