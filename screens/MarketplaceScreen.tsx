import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, ImageBackground, Modal, Share, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, getProducts } from '../services/products';
import MapRadius from '../components/MapRadius';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#1173d4';

type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'rating' | 'recent';
type ConditionKey = 'all' | 'new' | 'used' | 'refurbished';
type PriceKey = 'all' | '0-100' | '100-300' | '300+';
type RatingKey = 'all' | '4+' | '4.5+';
type LocationKey = 'all' | 'Centro' | 'Norte' | 'Sur' | 'Oeste';
type CategoryKey = 'all' | 'Ropa' | 'Electrónica' | 'Hogar' | 'Juguetes' | 'Libros' | 'Deportes';
type ShippingKey = 'all' | 'free' | 'paid';

export default function MarketplaceScreen() {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [condition, setCondition] = useState<ConditionKey>('all');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [price, setPrice] = useState<PriceKey>('all');
  const [rating, setRating] = useState<RatingKey>('all');
  const [location, setLocation] = useState<LocationKey>('all');
  const [favOnly, setFavOnly] = useState(false);
  const [mod, setMod] = useState<null | 'config'>(null);

  // Filtros visibles (sin toggles)

  // Optional min/max price inputs
  const [priceMin, setPriceMin] = useState<string>('0');
  const [priceMax, setPriceMax] = useState<string>('50000');
  const [priceSlider, setPriceSlider] = useState<number>(0);
  const [category, setCategory] = useState<CategoryKey>('all');
  const [shipping, setShipping] = useState<ShippingKey>('all');
  const [locationQuery, setLocationQuery] = useState('');
  const [sellerRating, setSellerRating] = useState<'all' | '4+' | '3+' | '2+'>('all');
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  // Mapa: radio y filtro por ids dentro del círculo
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [mapApi, setMapApi] = useState<{ centerOnMyLocation: () => void } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    AsyncStorage.getItem('market_favorites').then((json: string | null) => {
      if (json) setFavorites(JSON.parse(json));
    }).catch(() => {});
    // Si hay una búsqueda guardada para aplicar, cargarla una vez
    AsyncStorage.getItem('market_apply_search').then((json: string | null) => {
      if (!json) return;
      try {
        const s = JSON.parse(json);
        setQuery(s.query || '');
        setCondition(s.condition || 'all');
        setPrice(s.price || 'all');
        setRating(s.rating || 'all');
        setLocation(s.location || 'all');
        setFavOnly(!!s.favOnly);
        setSort(s.sort || 'relevance');
        if (s.category) setCategory(s.category);
        if (s.shipping) setShipping(s.shipping);
        if (s.locationQuery) setLocationQuery(s.locationQuery);
        if (s.sellerRating) setSellerRating(s.sellerRating);
      } catch {}
      AsyncStorage.removeItem('market_apply_search').catch(() => {});
    }).catch(() => {});
  }, []);

  const products = useMemo(() => getProducts(), []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (debounced && !(`${p.title} ${p.description}`.toLowerCase().includes(debounced))) return false;
      if (condition !== 'all' && p.condition !== condition) return false;
      if (price !== 'all') {
        if (price === '0-100' && !(p.price <= 100)) return false;
        if (price === '100-300' && !(p.price > 100 && p.price <= 300)) return false;
        if (price === '300+' && !(p.price > 300)) return false;
      }
      // Min/Max override
      if (priceMin || priceMax) {
        const min = priceMin ? Number(priceMin) : -Infinity;
        const max = priceMax ? Number(priceMax) : Infinity;
        if (!(p.price >= min && p.price <= max)) return false;
      }
      if (rating !== 'all') {
        if (rating === '4+' && !(p.ratingAvg >= 4)) return false;
        if (rating === '4.5+' && !(p.ratingAvg >= 4.5)) return false;
      }
      if (location !== 'all' && p.location !== location) return false;
      if (locationQuery && !p.location.toLowerCase().includes(locationQuery.toLowerCase())) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (shipping !== 'all' && p.shipping !== shipping) return false;
      if (sellerRating !== 'all') {
        const thr = sellerRating === '4+' ? 4 : sellerRating === '3+' ? 3 : 2;
        if (!(p.ratingAvg >= thr)) return false;
      }
      if (favOnly && !favorites[p.id]) return false;
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
      case 'recent':
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        break;
    }
    return list;
  }, [products, debounced, condition, sort]);

  // Lista a mostrar: si hay filtro por radio aplicado (ids) limitar resultados
  const displayList = useMemo(() => {
    if (insideIds && insideIds.length > 0) {
      return filtered.filter((p) => insideIds.includes(p.id));
    }
    return filtered;
  }, [filtered, insideIds]);

  const toggleFav = async (id: string) => {
    const next = { ...favorites, [id]: !favorites[id] };
    setFavorites(next);
    try { await AsyncStorage.setItem('market_favorites', JSON.stringify(next)); } catch {}
  };

  const resetFilters = () => {
    setQuery('');
    setCondition('all');
    setPrice('all'); setPriceMin('0'); setPriceMax('50000'); setPriceSlider(0);
    setRating('all');
    setLocation('all'); setLocationQuery('');
    setSellerRating('all');
    setFavOnly(false);
    setSort('relevance');
    setCategory('all');
    setShipping('all');
  };

  const saveSearch = async () => {
    const payload = { query, condition, price, rating, location, favOnly, sort, category, shipping, locationQuery, sellerRating, ts: Date.now() };
    try {
      const prev = JSON.parse((await AsyncStorage.getItem('market_saved_searches')) || '[]');
      const next = [payload, ...prev].slice(0, 10);
      await AsyncStorage.setItem('market_saved_searches', JSON.stringify(next));
    } catch {}
  };

  const shareSearch = async () => {
    const text = `Búsqueda Marketplace\nq="${query}" cond=${condition} precio=${price} rating=${rating} ubic=${location} favs=${favOnly ? 'sí' : 'no'} orden=${sort}`;
    try { await Share.share({ message: text }); } catch {}
  };

  const renderCard = ({ item }: { item: Product }) => (
    <Pressable style={styles.card} onPress={() => nav.navigate('ProductDetail', { id: item.id })}>
      <View style={styles.imageWrap}>
        <ImageBackground source={{ uri: item.images[0] }} style={styles.image} imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <View style={styles.badgeRow}>
            {item.badge === 'popular' && (
              <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )}
            {item.badge === 'new' && (
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
          <MaterialIcons name={'star'} size={14} color={'#f59e0b'} />
          <Text style={styles.metaText}>{item.ratingAvg.toFixed(1)}</Text>
          <Pressable onPress={() => toggleFav(item.id)} style={styles.favBtn} accessibilityLabel="Favorito">
            <MaterialIcons name={favorites[item.id] ? ('favorite' as any) : ('favorite-border' as any)} size={18} color={favorites[item.id] ? '#ef4444' : '#64748b'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const activeChips = useMemo(() => {
    const chips: string[] = [];
    if (price !== 'all' || priceMin || priceMax) {
      if (priceMin || priceMax) chips.push(`Precio: ${priceMin || '0'}-${priceMax || '∞'}`);
      else chips.push(`Precio: ${price}`);
    }
    if (condition !== 'all') chips.push(`Condición: ${condition}`);
    if (location !== 'all') chips.push(`Ubicación: ${location}`);
    if (sellerRating !== 'all') chips.push(`Vendedor: ${sellerRating}`);
    if (favOnly) chips.push('Solo favoritos');
    if (sort !== 'relevance') chips.push(sort === 'priceAsc' ? 'Orden: Precio ↑' : sort === 'priceDesc' ? 'Orden: Precio ↓' : 'Orden: Rating');
    return chips;
  }, [price, priceMin, priceMax, condition, location, sellerRating, favOnly, sort]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Pressable style={styles.iconBtn} accessibilityLabel="Configuración de búsqueda" onPress={() => setMod('config')}>
          <MaterialIcons name={'tune'} size={22} color={'#475569'} />
        </Pressable>
        <Pressable style={[styles.iconBtn, { marginLeft: 8 }]} accessibilityLabel="Publicar producto" onPress={() => nav.navigate('PublishProduct')}>
          <MaterialIcons name={'add' as any} size={22} color={'#475569'} />
        </Pressable>
      </View>

      {activeChips.length > 0 && (
        <View style={styles.activeRow}>
          {activeChips.map((t, i) => (
            <View key={`${t}-${i}`} style={styles.activeChip}>
              <Text style={styles.activeChipText}>{t}</Text>
            </View>
          ))}
          <Pressable onPress={resetFilters} style={styles.clearChips} accessibilityLabel="Limpiar filtros">
            <MaterialIcons name={'close'} size={16} color={'#0f172a'} />
            <Text style={styles.clearChipsText}>Limpiar</Text>
          </Pressable>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={styles.searchWrap}>
          <MaterialIcons name={'search'} size={18} color={'#94a3b8'} style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Buscar productos"
            placeholderTextColor={'#64748b'}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 8 }}>
              <MaterialIcons name={'close'} size={18} color={'#94a3b8'} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Barra de distancia del mapa (debajo del search) solo visible en modo mapa, fuera del mapa */}
      {view === 'map' && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Slider minimumValue={1} maximumValue={50} step={1} value={radiusKm} onValueChange={setRadiusKm as any} minimumTrackTintColor={PRIMARY} maximumTrackTintColor={'#e5e7eb'} thumbTintColor={PRIMARY} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, height: 40, backgroundColor: '#ffffff' }}>
              <TextInput value={String(radiusKm)} onChangeText={(t) => {
                const n = Math.max(1, Math.min(50, parseInt(t || '0', 10)));
                if (!Number.isNaN(n)) setRadiusKm(n);
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

      {/* Menú de filtros se abre con el botón de configuración del header */}

      {/* Controles de vista */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
        <Pressable style={styles.iconBtn} onPress={() => setView('grid')} accessibilityLabel="Vista grid">
          <MaterialIcons name={'grid-view' as any} size={20} color={'#475569'} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setView('list')} accessibilityLabel="Vista lista">
          <MaterialIcons name={'view-list' as any} size={20} color={'#475569'} />
        </Pressable>
        <Pressable style={[styles.iconBtn, view === 'map' && { backgroundColor: '#e0f2fe' }]} onPress={() => setView(view === 'map' ? 'grid' : 'map')} accessibilityLabel="Mapa">
          <MaterialIcons name={'map'} size={20} color={view === 'map' ? PRIMARY : '#475569'} />
        </Pressable>
      </View>

      {view === 'map' ? (
        <MapRadius
          items={filtered.map((p) => ({ id: p.id, title: p.title, coordinate: p.coordinate as any }))}
          radiusKm={radiusKm}
          onRadiusChange={(km: number) => setRadiusKm(km)}
          onInsideChange={(ids: string[]) => setInsideIds(ids)}
          hideControls={true}
          onBindApi={(api: { centerOnMyLocation: () => void }) => setMapApi(api)}
        />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 96, gap: 12 }}
          renderItem={renderCard}
        />
      )}

      {/* Footer actions */}
      <View style={styles.footerBar}>
        <Pressable style={styles.footerBtnSecondary} onPress={saveSearch} accessibilityLabel="Guardar búsqueda">
          <MaterialIcons name={'notifications'} size={20} color={'#0f172a'} />
          <Text style={styles.footerBtnSecondaryText}>Guardar búsqueda</Text>
        </Pressable>
        <Pressable style={styles.footerBtnSecondary} onPress={() => (global as any).NAVIGATE?.('SavedSearches')} accessibilityLabel="Ver guardadas">
          <MaterialIcons name={'bookmark'} size={20} color={'#0f172a'} />
          <Text style={styles.footerBtnSecondaryText}>Guardadas</Text>
        </Pressable>
        <Pressable style={styles.footerBtnPrimary} onPress={shareSearch} accessibilityLabel="Compartir búsqueda">
          <MaterialIcons name={'share'} size={20} color={'#ffffff'} />
          <Text style={styles.footerBtnPrimaryText}>Compartir</Text>
        </Pressable>
      </View>

      {/* Modal de configuración avanzada */}
      <Modal transparent visible={mod === 'config'} animationType={'fade'} onRequestClose={() => setMod(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMod(null)}>
          <View />
        </Pressable>
        <View style={styles.modalSheet}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Filtros</Text>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 }}>
              {(['Ropa','Electrónica','Hogar','Juguetes','Libros','Deportes'] as Exclude<CategoryKey,'all'>[]).map((c) => (
                <Pressable key={c} style={[styles.pill, category === c && styles.pillActive]} onPress={() => setCategory(category === c ? 'all' : c)}>
                  <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Precio</Text>
            <View style={{ paddingHorizontal: 6 }}>
              <Slider
                minimumValue={0}
                maximumValue={50000}
                step={50}
                value={Number(priceMin)}
                onValueChange={(v) => { setPriceSlider(v); setPriceMin(String(Math.floor(v))); }}
                minimumTrackTintColor={PRIMARY}
                maximumTrackTintColor={'#e5e7eb'}
                thumbTintColor={PRIMARY}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#475569' }}>${priceMin}</Text>
                <Text style={{ color: '#475569' }}>${priceMax}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Ubicación</Text>
            <View style={styles.inlineSearchWrap}>
              <TextInput value={locationQuery} onChangeText={setLocationQuery} placeholder={'Ingresa tu ubicación'} placeholderTextColor={'#64748b'} style={styles.inlineSearchInput} />
              <MaterialIcons name={'search'} size={18} color={'#94a3b8'} />
            </View>

            <Text style={styles.sectionLabel}>Condición</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['new','used'] as ConditionKey[]).map((c) => (
                <Pressable key={c} style={[styles.pill, condition === c && styles.pillActive]} onPress={() => setCondition(c)}>
                  <Text style={[styles.pillText, condition === c && styles.pillTextActive]}>{c === 'new' ? 'Nuevo' : 'Usado'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Calificación del vendedor</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['4+','3+','2+','all'] as ('4+'|'3+'|'2+'|'all')[]).map((r) => (
                <Pressable key={r} style={[styles.pill, sellerRating === r && styles.pillActive]} onPress={() => setSellerRating(r)}>
                  <Text style={[styles.pillText, sellerRating === r && styles.pillTextActive]}>{r === 'all' ? 'Cualquiera' : `${r} ⭐ o más`}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Envío</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['free','paid'] as ShippingKey[]).map((s) => (
                <Pressable key={s} style={[styles.pill, shipping === s && styles.pillActive]} onPress={() => setShipping(s)}>
                  <Text style={[styles.pillText, shipping === s && styles.pillTextActive]}>{s === 'free' ? 'Envío gratis' : 'Envío pago'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Ordenar por</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['relevance','priceAsc','priceDesc','recent'] as SortKey[]).map((s) => (
                <Pressable key={s} style={[styles.pill, sort === s && styles.pillActive]} onPress={() => setSort(s)}>
                  <Text style={[styles.pillText, sort === s && styles.pillTextActive]}>
                    {s === 'relevance' ? 'Relevancia' : s === 'priceAsc' ? 'Precio: bajo a alto' : s === 'priceDesc' ? 'Precio: alto a bajo' : 'Más reciente'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable style={[styles.footerBtnSecondary, { flex: 1 }]} onPress={resetFilters}>
              <Text style={styles.footerBtnSecondaryText}>Restablecer</Text>
            </Pressable>
            <Pressable style={[styles.footerBtnPrimary, { flex: 1 }]} onPress={() => setMod(null)}>
              <Text style={styles.footerBtnPrimaryText}>Aplicar</Text>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#0f172a' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 999 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, color: '#0f172a' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { color: '#334155', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  resetBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#e2e8f0' },
  resetText: { color: '#0f172a', fontWeight: '700', fontSize: 12 },
  card: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
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
  footerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerBtnSecondary: { flex: 1, height: 44, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  footerBtnSecondaryText: { color: '#0f172a', fontWeight: '800' },
  footerBtnPrimary: { flex: 1, height: 44, borderRadius: 999, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  footerBtnPrimaryText: { color: '#ffffff', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  optionText: { fontSize: 16, color: '#0f172a', textTransform: 'capitalize' },
  sectionLabel: { marginTop: 8, marginBottom: 6, fontSize: 16, fontWeight: '800', color: '#0f172a' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' },
  pillText: { color: '#0f172a', fontWeight: '700' },
  pillTextActive: { color: PRIMARY },
  inlineSearchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f8fafc' },
  inlineSearchInput: { flex: 1, color: '#0f172a' },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 4, flexWrap: 'wrap' },
  activeChip: { backgroundColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  activeChipText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
  clearChips: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  clearChipsText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  locBtn: { height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 10 },
});


