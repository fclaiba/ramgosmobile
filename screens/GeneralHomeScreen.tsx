import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SideDrawer from '../components/SideDrawer';
import { useTheme } from '../context/ThemeContext';

const DOT_SIZE = 8;
const PRIMARY_TEXT = '#111418';
const MUTED = '#617589';
const TEXT_DARK = '#111827';

export default function GeneralHomeScreen() {
  const navigation = useNavigation<any>();
  const width = Dimensions.get('window').width;
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'inicio' | 'consumos'>('inicio');
  const { mode: themeMode, isDark, toggle, colors } = useTheme();

  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % HEROES.length;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 5000);
    return () => clearInterval(id);
  }, [index, width]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Topbar (copiado del Home) */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setOpen(true)}>
          <MaterialIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Hola, Sofia</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderColor: colors.border }]}
            onPress={() => setMode('consumos')}
            accessibilityLabel={'Mis consumos'}
          >
            <MaterialIcons name={'receipt' as any} size={22} color={colors.text} />
          </TouchableOpacity>
          {/* Removed topbar theme toggle as it lives in the SideDrawer footer now */}
          <View style={styles.notificationsWrapper}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderColor: colors.border }]} onPress={() => navigation.navigate('SocialNotifications' as never)}>
              <MaterialIcons name="notifications" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.badge} />
          </View>
        </View>
      </View>
      {/* Segmento Inicio / Mis consumos */}
      <View style={styles.segmentRow}>
        <TouchableOpacity accessibilityLabel={'Ver Inicio'} onPress={() => setMode('inicio')} activeOpacity={0.9} style={[styles.segment, mode==='inicio' && styles.segmentActive]}>
          <Text style={[styles.segmentText, mode==='inicio' && styles.segmentTextActive]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={'Ver Mis consumos'} onPress={() => setMode('consumos')} activeOpacity={0.9} style={[styles.segment, mode==='consumos' && styles.segmentActive]}>
          <Text style={[styles.segmentText, mode==='consumos' && styles.segmentTextActive]}>Mis consumos</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {mode === 'inicio' ? (
          <>
            {/* Carousel */}
            <View style={{ height: 400 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={scrollRef}
                onMomentumScrollEnd={(e) => {
                  const i = Math.round(e.nativeEvent.contentOffset.x / width);
                  setIndex(i);
                }}
              >
                {HEROES.map((h, i) => (
              <TouchableOpacity key={`h-${i}`} activeOpacity={0.9} onPress={() => navigation.navigate(h.target)}>
                    <ImageBackground source={{ uri: h.image }} style={{ width, height: 400 }}>
                      <View style={styles.heroOverlay} />
                      <View style={styles.heroTextWrap}>
                    <Text style={styles.heroTitle}>{h.title}</Text>
                        {h.cta ? (
                          <View style={styles.ctaBtn}><Text style={styles.ctaText}>{h.cta}</Text></View>
                        ) : null}
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.dotsWrap}>
                {HEROES.map((_, i) => (
                  <View key={`d-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
            </View>

            {/* Grid 2 cols */}
            <View style={{ padding: 12 }}>
              <View style={styles.gridWrap}>
                {CARDS.map((c) => (
                  <TouchableOpacity key={c.id} activeOpacity={0.92} style={styles.card} onPress={() => navigation.navigate(c.target)}>
                    <ImageBackground source={{ uri: c.image }} style={StyleSheet.absoluteFillObject as any} />
                    <View style={styles.cardScrim} />
                    <View style={{ position: 'absolute', left: 12, bottom: 12 }}>
                      <Text style={styles.cardTitle}>{c.title}</Text>
                      <View style={[styles.badge, { backgroundColor: c.badgeColor }]}><Text style={styles.badgeText}>{c.badge}</Text></View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Secciones de Mis consumos */}
            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 4, color: colors.text }]}>Tus Bonos Activos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {COUPONS.map((coupon) => (
                <View key={coupon.id} style={styles.couponCard}>
                  <ImageBackground source={{ uri: coupon.image }} style={styles.couponImage} imageStyle={{ borderRadius: 12 }} />
                  <View>
                    <Text style={styles.couponTitle}>{coupon.title}</Text>
                    <Text style={styles.couponSubtitle}>Expira en: <Text style={styles.couponStrong}>{coupon.expiresIn}</Text></Text>
                  </View>
                </View>
              ))}
            </ScrollView>

              <View style={styles.rowBetween}> 
              <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 16, color: colors.text }]}>Historial Reciente</Text>
              <View style={{ paddingRight: 16 }}><Text style={styles.link}>Ver todo</Text></View>
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
                  <Text style={[styles.historyAmount, { color: item.amount.startsWith('-') ? '#dc2626' : '#059669' }]}>{item.amount}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 16, color: colors.text }]}>Tu Progreso</Text>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, flexDirection: 'row' }}>
              <View style={styles.statCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="group" size={18} color={'#0ea5e9'} />
                  <Text style={styles.statLabel}>Seguidores</Text>
                </View>
                <Text style={styles.statValue}>150</Text>
              </View>
              <View style={styles.statCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name={'show-chart' as any} size={18} color={'#0ea5e9'} />
                  <Text style={styles.statLabel}>Progreso a Influencer</Text>
                </View>
                <View style={{ width: '100%', marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0c4a6e' }}>75%</Text>
                  </View>
                  <View style={{ width: '100%', height: 10, backgroundColor: '#e5e7eb', borderRadius: 12 }}>
                    <View style={{ width: '75%', height: 10, backgroundColor: '#0ea5e9', borderRadius: 12 }} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 8, color: colors.text }]}>Recomendaciones para ti</Text>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <View style={styles.recoCard}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: '#0ea5e9', fontWeight: '700', fontSize: 13 }}>Tienda D</Text>
                  <Text style={{ color: TEXT_DARK, fontWeight: '800', fontSize: 18 }}>20% de descuento</Text>
                  <Text style={{ color: MUTED, fontSize: 14 }}>En tu próxima compra. ¡No te lo pierdas!</Text>
                </View>
                <ImageBackground source={{ uri: RECO_IMAGE }} style={{ width: 96, height: 96 }} imageStyle={{ borderRadius: 12 }} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
}

const HEROES = [
  { image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ARxlo96WXFfZ4t2EyTWrQRb30l-tdZVFNeLc_2xNviFSWC0s49yJW0_cASFkkkzI9FEMDq4fHsi0Oig2atZ8zmjlX62zCGpdbVl0NM87c6d6VHJ5G9flOMbjbjShvqZc6UKx4ND2h8bj2Au8zMwKkEj9jy4BXprI3B1kP2E6H7efssHTNh3OIXwRyyWNtRiU6gZexrZqNdXk_mfFqeDAX13p6jDE3v_RucHpBV5hkK5eHr6e5ITN_TxZCmzNX1rNamCeGN9gNGOT', title: 'Descuentos Exclusivos en Moda de Verano', cta: 'Comprar Ahora', target: 'Marketplace' },
  { image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX-5cikN-Li31a5w-9lo4UDv36U274T06NUrr9PhgxY8H2neoRsj7bfoEMp3o_7dXtxXFAKOFBggtOdVtVVkEaW74hpFA3wE1LWsBVhdueB57CS2IaSjTOTvxtEXzCn3oFQD5tBE5nBsLy7TCW_UgAwiIIffhkIwUqoxBHsJWUpHlOwcnJ7fhbMRErK9QygR8sbDSlt-vkYbUcm_tX39C2zQwuTP2hOaYipXHXMgiV75CQgCI11lju_j3FgkqwNxdfH78djfasYqOV', title: 'Conciertos y Eventos Cerca de Ti', cta: undefined, target: 'Eventos' },
  { image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLD2f1m9qaTafQ8ASxip9N6RqRGZhe9L_uCkfEnasusIm33Hf3S7U0bHEGCCr0WwQ4BO-mqS4MinmHEKnm1ovYPUI_UOEB9v4EYYCNi9LRwcwLk-3wncFgoVEJbWAdHnhV7gQpFIOKSm3iaHfoX_2Vlag2URHnz9L9NKD2W18Gv5ADkQ7eocnn19H-ShrX4sNEXeJ7Zpjk5_sSp6SsuhIe9sKroprKxZSVbL4Vgdo61eK3EklDOaJFzDg8vQtBBdKvIkXUYesfJkFg', title: 'Saborea la Ciudad con 50% OFF', cta: 'Ver Cupones', target: 'Explorar' },
];

const CARDS = [
  { id: 'c1', title: 'Moda', badge: 'Marketplace', badgeColor: '#3b82f6', target: 'Marketplace', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdZ6xrNAKaD7CHPWHEznmvm5xjoGc1p6UNROUThocHYq_rW9THDaNy6C9_fyF-lujgZWSkaxsZR-KTfq35x68q-NYA9-4mRekS4sgWwW-KA_V9NZ6aIevJyiFKfDlVOMEnK22rCbIh0rE0cZBsAj0V_AdVMMyslZHirbqzfvmLaeEQ_pS7X8Q5S6oaAwNTfOl5qSita2qjt8NZXLEKMn7XbIVa6Dt6NmVzmwtuzudKhJM4hnycvsGj459tHYqwLZN10aR35HBwx9gy' },
  { id: 'c2', title: 'Beauty & Care', badge: 'Marketplace', badgeColor: '#3b82f6', target: 'Marketplace', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3LPcRvGXDSMKnw19HP5WwJkr8_je2BmiW601vLpLjYDXoepLOwMYHPrRfag4v59VtWFKslHmagLdwAS0n12duVzXNyzhpOJ1TmuJTCzVujtVfuX_IUtn_y_3lvjFRY5YWQVXAi5IUmofyBjG6Sg--xrgPNKnpS_QqmTFn_VRQGGNViuDpdtquRTODtUEjGzS6CKLfnXGvbIdLd_RhV9YnBRJPzg6Po2LHInMXVIQm2prSylIft-B8SnnyPRe2ZNt6vjzeJD6PWXP' },
  { id: 'c3', title: 'Discotecas y Bares', badge: 'Eventos', badgeColor: '#fb923c', target: 'Eventos', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6MqFG3AO64dfYkRdFDS66zHiZS17W7LjKeUW2jWkJu43QkDlHmD-cB9CPnbd0J-XjHdLKdftz6KvmU-mk9n66RsWklpS6j0dMpwAGCLy9tpO9GpcSo6usxxE8kh1n1DlvUMUgsRrxh9CCEOQmeipC8LcPTHS8Njvt3z5lLqelxM2SMkAa9pVl6pTU-PThWQkAD3KpsZqaDwmim7WZY-pmg9nYdYZAJyI6PczjZ3J0nEXyvr4LvoNqYaY5IvNQZrlSbQlRW35-TnUg' },
  { id: 'c4', title: 'Restaurantes', badge: 'Marketplace', badgeColor: '#3b82f6', target: 'Marketplace', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUVyzEOErRd0CXl3KaJ0P9lHuEFeMEO1utCIyjK-s0k8_FsBClM7-C6-Yu_yIkC-VV29_M1A9En_kC47PtvMsUBqWHHA1QTsfZnYrH7s_098CKIh85yB497i0LZ94HkcxAXjIEbWhGKAwqHdv3iy1d92ItiG6LXoXKnC8E-NyW-I2JyIBxNJRm1WG4ZM63A1Z0q5yM-U83IfKM9qFK1RS6EspNPJHqT6dhN1q04rTUhhO07pIDq4Ozh7vWYF4lLF-dkgKJn_-vnVTy' },
  { id: 'c5', title: 'Restaurantes', badge: 'Cupones', badgeColor: '#22c55e', target: 'Explorar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg5oKJqqhzH_Jvh1MJd53oeAkj-rsD2R-tm99G11BoSPtpEeJ_3vFOuBXDC1-GVMzP7lcj03y528-jkPPagFx_SCNXj2e-SCNAzteVExvXo0044qc_JherULkrpVMTFlF0xbs3K4n11vB-JaHfUY00wn-YJshhUKUiwCwl9BjkHgOpj2j2l4f1ZvX0hhQNfHxo0DzUMqlOaAnALDFj2YCIBZGhx8fPl2GsMBkmkb71o35NWLchixJAJdh1umJNXoGF_b9bpHILX5FZ' },
  { id: 'c6', title: 'Influencers', badge: 'Red Social', badgeColor: '#a855f7', target: 'Social', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ3gOQSoq4a_3urKZ2z66ru8JpaJkzY3BcyV7WSHhTinVjB9cJpNwDIEYYoi0d1Ax__xVeJz_tivg2GEbTFEakiSFBMNwhxxGaUIg8FHg6kBQWZPgqfMjDb5vycO9YWKHzZ6077oiDHY0BKNsVR6DoAFrcW8B5gCk6fT5L5_BtRq6A20z69ZreqfAcy4zkmWLeyYJBquUvnNRpQgM3MV7JJAQq_RVKlZFW148dNIb9aS9MB6wTBVqUOyS1qhoExWBLZeEJkMcMmmNh' },
];

const styles = StyleSheet.create({
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
  segmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  segment: { height: 36, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' },
  segmentActive: { backgroundColor: '#111827' },
  segmentText: { color: '#111827', fontWeight: '800' },
  segmentTextActive: { color: '#ffffff' },
  heroOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroTextWrap: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  heroTitle: { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  ctaBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#ffffff', paddingHorizontal: 18, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#000000', fontWeight: '800' },
  dotsWrap: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#ffffff' },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: 3/4, flexBasis: '48%' },
  cardScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  cardTitle: { color: '#ffffff', fontWeight: '800', fontSize: 20 },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  miConsumoBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', height: 44, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  miConsumoText: { color: '#111827', fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: '#0284c7', fontWeight: '600', fontSize: 14 },
  couponCard: { width: 280, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff', padding: 12, gap: 8 },
  couponImage: { width: '100%', height: 160, borderRadius: 12 },
  couponTitle: { color: TEXT_DARK, fontSize: 18, fontWeight: '700' },
  couponSubtitle: { color: '#6b7280', fontSize: 14 },
  couponStrong: { color: '#374151', fontWeight: '700' },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 12 },
  historyIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  historyTitle: { color: TEXT_DARK, fontWeight: '600' },
  historyTime: { color: '#6b7280', fontSize: 12 },
  historyAmount: { fontSize: 16, fontWeight: '700' },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff', padding: 12, gap: 8, alignItems: 'flex-start' },
  recoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff', padding: 12 },
});



