import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ImageBackground,
  Modal,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import MapRadius from '../components/MapRadius';
import Slider from '@react-native-community/slider';

import { getCoupons, Coupon as CouponType } from '../services/coupons';

const PRIMARY = '#1173d4';

const COUPONS = getCoupons();

type SectorKey = CouponType['sector'] | 'all';
type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'rating' | 'endingSoon' | 'nearest';

export default function ExploreCouponsScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sector, setSector] = useState<SectorKey>('all');
  const [priceMin, setPriceMin] = useState<string>('0');
  const [priceMax, setPriceMax] = useState<string>('50000');
  const [distanceKm, setDistanceKm] = useState<number>(20);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [mapApi, setMapApi] = useState<{ centerOnMyLocation: () => void } | null>(null);
  const [ratingMin, setRatingMin] = useState<'all' | '4+' | '4.5+'>('all');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [mod, setMod] = useState<null | 'config'>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    let list = COUPONS.filter((c) => {
      if (debounced && !(`${c.title} ${c.description}`.toLowerCase().includes(debounced))) return false;
      if (sector !== 'all' && c.sector !== sector) return false;
      const min = priceMin ? Number(priceMin) : -Infinity;
      const max = priceMax ? Number(priceMax) : Infinity;
      if (!(c.price >= min && c.price <= max)) return false;
      if (!(c.distanceKm <= distanceKm)) return false;
      if (ratingMin !== 'all') {
        if (ratingMin === '4+' && !(c.ratingAvg >= 4)) return false;
        if (ratingMin === '4.5+' && !(c.ratingAvg >= 4.5)) return false;
      }
      return true;
    });
    switch (sort) {
      case 'priceAsc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
      case 'endingSoon':
        list = [...list].sort((a, b) => new Date(a.offerEndsAt).getTime() - new Date(b.offerEndsAt).getTime());
        break;
      case 'nearest':
        list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      default:
        break;
    }
    return list;
  }, [debounced, sector, priceMin, priceMax, distanceKm, ratingMin, sort]);

  const displayList = useMemo(() => {
    if (insideIds && insideIds.length > 0) return filtered.filter((c) => insideIds.includes(c.id));
    return filtered;
  }, [filtered, insideIds]);

  const toggleFav = (id: string) => setFavorites((s) => ({ ...s, [id]: !s[id] }));

  const renderCard = ({ item }: { item: CouponType }) => (
    <Pressable style={[styles.card, view !== 'grid' && styles.cardList]} onPress={() => nav.navigate('CouponDetail', { id: item.id })}>
      <View style={styles.imageWrap}>
        <ImageBackground source={{ uri: item.images[0] }} style={styles.image} imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <View style={styles.badgeRow}>
            {item.badge === 'popular' && (
              <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )}
            {item.badge === 'nuevo' && (
              <View style={[styles.badge, { backgroundColor: PRIMARY }]}>
                <Text style={styles.badgeText}>Nuevo</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>${item.price}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.distanceKm.toFixed(1)} km</Text>
          <Pressable onPress={() => toggleFav(item.id)} style={styles.favBtn} accessibilityLabel="Favorito">
            <MaterialIcons name={favorites[item.id] ? ('favorite' as any) : ('favorite-border' as any)} size={18} color={favorites[item.id] ? '#ef4444' : '#64748b'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Explorar Bonos</Text>
        <Pressable style={styles.iconBtn} accessibilityLabel="Filtros" onPress={() => setMod('config')}>
          <MaterialIcons name={'tune'} size={22} color={'#475569'} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: Math.min(24, width < 380 ? 12 : 16), paddingBottom: 8 }}>
        <View style={styles.searchWrap}>
          <MaterialIcons name={'search'} size={18} color={'#94a3b8'} style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Buscar bonos"
            placeholderTextColor={'#64748b'}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <View style={[styles.sectionHeader, { paddingHorizontal: Math.min(24, width < 380 ? 12 : 16) }]}>
        <Text style={styles.sectionTitle}>Bonos Disponibles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable style={styles.iconBtn} onPress={() => setView('list')} accessibilityLabel="Vista lista">
            <MaterialIcons name={'view-list'} size={20} color={'#475569'} />
          </Pressable>
          <Pressable style={[styles.iconBtn, view === 'map' && { backgroundColor: '#e0f2fe' }]} onPress={() => setView(view === 'map' ? 'grid' : 'map')} accessibilityLabel="Mapa">
            <MaterialIcons name={'map'} size={20} color={view === 'map' ? PRIMARY : '#475569'} />
          </Pressable>
        </View>
      </View>

      {/* Barra de distancia (debajo del search, arriba del mapa) */}
      {view === 'map' && (
        <View style={{ paddingHorizontal: Math.min(24, width < 380 ? 12 : 16), paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Slider minimumValue={1} maximumValue={50} step={1} value={distanceKm} onValueChange={setDistanceKm as any} minimumTrackTintColor={PRIMARY} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={PRIMARY} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, height: 40, backgroundColor: '#ffffff' }}>
              <TextInput value={String(distanceKm)} onChangeText={(t) => {
                const n = Math.max(1, Math.min(50, parseInt(t || '0', 10)));
                if (!Number.isNaN(n)) setDistanceKm(n);
              }} keyboardType={'numeric'} style={{ width: 56, color: '#0f172a' }} placeholder={'km'} placeholderTextColor={'#94a3b8'} />
              <Text style={{ color: '#64748b', marginLeft: 4 }}>km</Text>
            </View>
            <Pressable style={styles.locBtn} onPress={() => mapApi?.centerOnMyLocation()} accessibilityLabel="Mi ubicación">
              <MaterialIcons name={'my-location'} size={18} color={'#0f172a'} />
              <Text style={{ color: '#0f172a', fontWeight: '800' }}>Mi ubicación</Text>
            </Pressable>
          </View>
        </View>
      )}

      {view === 'map' ? (
        <MapRadius
          items={filtered.map((c) => ({ id: c.id, title: c.title, coordinate: { latitude:  -34.6037 + Math.random() * 0.05, longitude: -58.3816 + Math.random() * 0.05 } }))}
          radiusKm={distanceKm}
          onRadiusChange={(km) => setDistanceKm(km)}
          onInsideChange={(ids) => setInsideIds(ids)}
          onBindApi={(api) => setMapApi(api)}
          hideControls={true}
        />
      ) : (
        <FlatList
          data={displayList}
          key={view}
          keyExtractor={(i) => i.id}
          numColumns={view === 'grid' ? 2 : 1}
          columnWrapperStyle={view === 'grid' ? { gap: 12, paddingHorizontal: Math.min(24, width < 380 ? 12 : 16) } : undefined}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: view === 'grid' ? 0 : Math.min(24, width < 380 ? 12 : 16), gap: 12 }}
          renderItem={renderCard}
        />
      )}

      <Modal transparent visible={mod === 'config'} animationType="fade" onRequestClose={() => setMod(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMod(null)}>
          <View />
        </Pressable>
        <View style={styles.modalSheet}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Filtros</Text>
          <View style={{ maxHeight: 420 }}>
            <View>
              <Text style={styles.sectionTitle}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 6 }}>
                {(['aventura', 'gastronomia', 'bienestar', 'cultura'] as SectorKey[]).map((s) => (
                  <Pressable key={s} style={[styles.chip, sector === s && { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' }]} onPress={() => setSector(sector === s ? 'all' : s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Precio</Text>
              <View style={{ paddingHorizontal: 6 }}>
                <Slider minimumValue={0} maximumValue={50000} step={50} value={Number(priceMin)} onValueChange={(v) => setPriceMin(String(Math.floor(v)))} minimumTrackTintColor={PRIMARY} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={PRIMARY} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#475569' }}>${priceMin}</Text>
                  <Text style={{ color: '#475569' }}>${priceMax}</Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Proximidad</Text>
              <View style={{ paddingHorizontal: 6 }}>
                <Slider minimumValue={1} maximumValue={20} step={1} value={distanceKm} onValueChange={setDistanceKm as any} minimumTrackTintColor={PRIMARY} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={PRIMARY} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#475569' }}>1 km</Text>
                  <Text style={{ color: '#475569' }}>{distanceKm} km</Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Rating mínimo</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['all', '4+', '4.5+'] as ('all'|'4+'|'4.5+')[]).map((r) => (
                  <Pressable key={r} style={[styles.chip, ratingMin === r && { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' }]} onPress={() => setRatingMin(r)}>
                    <Text style={styles.chipText}>{r === 'all' ? 'Cualquiera' : r}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Ordenar por</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['relevance','priceAsc','priceDesc','rating','endingSoon','nearest'] as SortKey[]).map((s) => (
                  <Pressable key={s} style={[styles.chip, sort === s && { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' }]} onPress={() => setSort(s)}>
                    <Text style={styles.chipText}>
                      {s === 'relevance' ? 'Relevancia' : s === 'priceAsc' ? 'Precio: bajo a alto' : s === 'priceDesc' ? 'Precio: alto a bajo' : s === 'rating' ? 'Rating' : s === 'endingSoon' ? 'Próximo a vencer' : 'Más cerca'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#0f172a' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 999 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, color: '#0f172a' },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { color: '#334155', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },

  card: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  cardList: { width: '100%' },
  imageWrap: { width: '100%', aspectRatio: 1 },
  image: { flex: 1, resizeMode: 'cover' },
  badgeRow: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#ffffff', fontWeight: '800', fontSize: 10 },
  cardBody: { padding: 12, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  cardDesc: { fontSize: 13, color: '#64748b' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: '#475569', fontWeight: '700', fontSize: 12 },
  metaDot: { marginHorizontal: 6, color: '#94a3b8', fontWeight: '900' },
  favBtn: { marginLeft: 'auto', height: 28, width: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#f8fafc' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  optionText: { fontSize: 16, color: '#0f172a', textTransform: 'capitalize' },
  locBtn: { height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 10 },
});


