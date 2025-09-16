import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ImageBackground, Pressable, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { EventItem, getEventById, getRatingDistribution, addEventOrder } from '../services/events';
import { useUser } from '../context/UserContext';

const PRIMARY = '#1173d4';

type RootParam = { EventDetail: { id: string } };

export default function EventDetailScreen() {
  const route = useRoute<RouteProp<RootParam, 'EventDetail'>>();
  const nav = useNavigation<any>();
  const { userId } = useUser();
  const event: EventItem | undefined = useMemo(() => getEventById(route.params?.id), [route.params?.id]);
  const [favorite, setFavorite] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const width = Dimensions.get('window').width;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}><View style={{ padding: 16 }}><Text style={styles.title}>Evento no encontrado</Text></View></SafeAreaView>
    );
  }

  const msLeft = Math.max(0, new Date(event.date).getTime() - now);
  const dd = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hh = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
  const mm = Math.floor((msLeft / (1000 * 60)) % 60);
  const ss = Math.floor((msLeft / 1000) % 60);
  const ratingDist = useMemo(() => getRatingDistribution(event.ratingAvg), [event.ratingAvg]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable accessibilityLabel="Volver" onPress={() => nav.goBack()} style={styles.iconBtn}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#111418'} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable accessibilityLabel="Favorito" onPress={() => setFavorite(v => !v)} style={[styles.iconBtn, { backgroundColor: '#ffffff' }]}>
          <MaterialIcons name={favorite ? ('favorite' as any) : ('favorite-border' as any)} size={22} color={favorite ? '#ef4444' : '#ef4444'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(event.images.length?event.images:["https://picsum.photos/800/600"]).map((uri, idx) => (
            <ImageBackground key={idx} source={{ uri }} style={[styles.hero, { width }]} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.stockPill}><Text style={styles.stockText}>{new Date(event.date).toLocaleDateString()}</Text></View>
          </View>
          <Text style={styles.desc}>{event.description}</Text>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.priceLabel}>Precio</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <Text style={styles.price}>{event.price>0?`$${event.price}`:'Gratis'}</Text>
            </View>
          </View>

          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>EL EVENTO COMIENZA EN</Text>
            <View style={styles.countdownRow}>
              {[[dd,'Días'],[hh,'Horas'],[mm,'Min'],[ss,'Seg']].map(([v,lab],i) => (
                <View key={i} style={styles.countdownItem}>
                  <Text style={styles.countdownNumber}>{String(v as number)}</Text>
                  <Text style={styles.countdownText}>{String(lab)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Calificación y Reseñas</Text>
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.ratingBig}>{event.ratingAvg.toFixed(1)}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1,2,3,4,5].map(i => (
                    <MaterialIcons key={i} name={i <= Math.floor(event.ratingAvg) ? ('star' as any) : (i - event.ratingAvg < 1 ? ('star-half' as any) : ('star-border' as any))} size={18} color={'#f59e0b'} />
                  ))}
                </View>
                <Text style={styles.reviewsCount}>{event.ratingCount} reseñas</Text>
              </View>
              <View style={{ flex: 1, minWidth: 200, gap: 6 }}>
                {ratingDist.map((r) => (
                  <View key={r.stars} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.distLabel}>{r.stars}</Text>
                    <View style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: '#e2e8f0' }}>
                      <View style={{ width: `${r.percent}%`, backgroundColor: '#f59e0b', height: 8, borderRadius: 999 }} />
                    </View>
                    <Text style={styles.distPct}>{r.percent}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Text style={{ color: '#64748b', marginTop: 4 }}>{event.location}</Text>
            <View style={{ marginTop: 12, height: 180, borderRadius: 12, overflow: 'hidden' }}>
              {React.createElement(require('../components/DetailMiniMap').default, { coordinate: event.coordinate })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerWrap}>
        <Pressable style={styles.buyBtn} onPress={() => { setBuyOpen(true); }}>
          <MaterialIcons name={'confirmation-number'} size={18} color={'#ffffff'} />
          <Text style={styles.buyText}>Comprar Ahora</Text>
        </Pressable>
      </View>

      <Modal visible={buyOpen} transparent animationType="slide" onRequestClose={() => setBuyOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.sectionTitle}>Confirmar compra</Text>
              <Pressable onPress={() => setBuyOpen(false)}><MaterialIcons name={'close'} size={20} color={'#111418'} /></Pressable>
            </View>
            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.price}>{event.price>0?`$${event.price}`:'Gratis'}</Text>
              <Text style={styles.meta}>x</Text>
              <View style={styles.qtyWrap}>
                <Pressable onPress={() => setQty(q => Math.max(1, q - 1))}><MaterialIcons name={'remove'} size={18} color={'#111418'} /></Pressable>
                <Text style={styles.qtyText}>{qty}</Text>
                <Pressable onPress={() => setQty(q => q + 1)}><MaterialIcons name={'add'} size={18} color={'#111418'} /></Pressable>
              </View>
              <Text style={[styles.price, { marginLeft: 'auto' }]}>{event.price>0?`$${(event.price * qty).toFixed(2)}`:'$0.00'}</Text>
            </View>
            <View style={{ height: 12 }} />
            <Pressable onPress={() => { setBuyOpen(false); nav.navigate('EventCheckout' as any, { id: event.id, qty }); }} style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Proceder al pago</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hero: { height: undefined, width: '100%', aspectRatio: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  desc: { fontSize: 14, color: '#475569' },
  buyBtn: { backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buyText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  stockPill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fee2e2', borderRadius: 999 },
  stockText: { color: '#ef4444', fontWeight: '800' },
  priceLabel: { color: '#64748b', fontSize: 13 },
  price: { color: '#0f172a', fontSize: 28, fontWeight: '900' },
  countdownCard: { marginTop: 12, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12 },
  countdownLabel: { textAlign: 'center', color: '#64748b', fontWeight: '800', letterSpacing: 1 },
  countdownRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 16, alignItems: 'center' },
  countdownItem: { alignItems: 'center' },
  countdownNumber: { fontSize: 28, color: PRIMARY, fontWeight: '900' },
  countdownText: { color: '#475569', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111418' },
  ratingBig: { fontSize: 40, fontWeight: '900', color: '#0f172a', lineHeight: 44 },
  reviewsCount: { color: '#64748b', fontSize: 12 },
  distLabel: { color: '#475569', width: 14, textAlign: 'center', fontWeight: '700' },
  distPct: { color: '#64748b', width: 40, textAlign: 'right' },
  footerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  meta: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  primaryCta: { marginTop: 8, backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryCtaText: { color: '#ffffff', fontWeight: '800' },
});


