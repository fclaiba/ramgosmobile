import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, ImageBackground, useWindowDimensions, Modal, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { EventItem, getEvents } from '../services/events';
import { useNavigation } from '@react-navigation/native';
import MapRadius from '../components/MapRadius';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY = '#1173d4';
type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'dateSoon' | 'rating';

export default function EventsScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'Todas' | EventItem['category']>('Todas');
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const events = useMemo(() => getEvents(), []);
  const q = query.trim().toLowerCase();
  const [priceMin, setPriceMin] = useState<string>('0');
  const [priceMax, setPriceMax] = useState<string>('50000');
  const [ratingMin, setRatingMin] = useState<'all'|'4+'|'4.5+'>('all');
  const [sort, setSort] = useState<SortKey>('relevance');
  const filtered = useMemo(() => {
    let list = events.filter(e => (
      (!q || `${e.title} ${e.description}`.toLowerCase().includes(q)) && (category==='Todas' || e.category===category)
    ));
    const min = priceMin ? Number(priceMin) : -Infinity;
    const max = priceMax ? Number(priceMax) : Infinity;
    list = list.filter(e => e.price >= min && e.price <= max);
    if (ratingMin !== 'all') {
      if (ratingMin === '4+' ) list = list.filter(e => e.ratingAvg >= 4);
      if (ratingMin === '4.5+' ) list = list.filter(e => e.ratingAvg >= 4.5);
    }
    switch (sort) {
      case 'priceAsc': list = [...list].sort((a,b)=>a.price-b.price); break;
      case 'priceDesc': list = [...list].sort((a,b)=>b.price-a.price); break;
      case 'dateSoon': list = [...list].sort((a,b)=>a.date-b.date); break;
      case 'rating': list = [...list].sort((a,b)=>b.ratingAvg-a.ratingAvg); break;
      default: break;
    }
    return list;
  }, [events, q, category, priceMin, priceMax, ratingMin, sort]);
  const [favOnly, setFavOnly] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  useEffect(() => {
    AsyncStorage.getItem('events_favorites').then((json: string | null) => {
      if (json) setFavorites(JSON.parse(json));
    }).catch(() => {});
  }, []);
  const toggleFav = async (id: string) => {
    const next = { ...favorites, [id]: !favorites[id] };
    setFavorites(next);
    try { await AsyncStorage.setItem('events_favorites', JSON.stringify(next)); } catch {}
  };
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [mapApi, setMapApi] = useState<{ centerOnMyLocation: () => void } | null>(null);
  const display = useMemo(()=> {
    const base = favOnly ? filtered.filter(e=>favorites[e.id]) : filtered;
    if (insideIds && insideIds.length>0) return base.filter(e=>insideIds.includes(e.id));
    return base;
  }, [filtered, favOnly, favorites, insideIds]);

  const resetFilters = () => {
    setQuery('');
    setCategory('Todas');
    setFavOnly(false);
    setView('grid');
    setRadiusKm(10);
    setInsideIds([]);
  };

  const renderCard = ({ item }: { item: EventItem }) => (
    <Pressable style={styles.card} onPress={() => nav.navigate('EventDetail' as any, { id: item.id })} accessibilityRole="button">
      <ImageBackground source={{ uri: item.images[0] }} style={styles.image} imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{item.location}</Text>
          <Text style={[styles.price, { marginLeft: 'auto' }]}>{item.price>0?`$${item.price}`:'Gratis'}</Text>
          <Pressable onPress={() => toggleFav(item.id)} style={{ marginLeft: 8, height: 28, width: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#f8fafc' }} accessibilityLabel={'Favorito'}>
            <MaterialIcons name={favorites[item.id] ? ('favorite' as any) : ('favorite-border' as any)} size={18} color={favorites[item.id] ? '#ef4444' : '#64748b'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const horizontalPadding = width < 380 ? 12 : width < 768 ? 16 : 24;
  const containerMaxWidth = Math.min(1200, width - horizontalPadding * 2);
  const numColumns = width >= 1200 ? 4 : width >= 900 ? 3 : 2;

  const [mod, setMod] = useState<null|'config'>(null);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <Pressable style={[styles.iconBtn, favOnly && { backgroundColor: '#e0f2fe' }]} accessibilityLabel={favOnly ? 'Ver todos' : 'Ver mis favoritos'} onPress={()=>setFavOnly((v)=>!v)}>
          <MaterialIcons name={favOnly ? ('favorite' as any) : ('favorite-border' as any)} size={20} color={favOnly ? PRIMARY : '#475569'} />
        </Pressable>
        <Pressable style={[styles.iconBtn, { marginLeft: 8 }]} accessibilityLabel={'Filtros'} onPress={()=>setMod('config')}>
          <MaterialIcons name={'tune'} size={20} color={'#475569'} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: horizontalPadding, paddingBottom: 8 }}>
        <View style={styles.searchWrap}>
          <MaterialIcons name={'search'} size={18} color={'#94a3b8'} style={{ marginLeft: 12 }} />
          <TextInput placeholder={'Buscar eventos'} placeholderTextColor={'#64748b'} value={query} onChangeText={setQuery} style={styles.searchInput} />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 8 }}><MaterialIcons name={'close'} size={18} color={'#94a3b8'} /></Pressable>
          )}
        </View>
        <View style={{ flexDirection:'row', gap: 8, marginTop: 8 }}>
          {(['Todas','Música','Tecnología','Deportes','Arte','Gastronomía'] as const).map(c => (
            <Pressable key={c} style={[styles.pill, category===c && styles.pillActive]} onPress={()=>setCategory(c as any)}>
              <Text style={[styles.pillText, category===c && styles.pillTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        {(category!=='Todas' || favOnly || query.length>0) && (
          <View style={{ flexDirection:'row', alignItems:'center', gap: 8, marginTop: 8, flexWrap:'wrap' }}>
            {category!=='Todas' && (
              <View style={{ backgroundColor:'#e2e8f0', borderRadius:999, paddingHorizontal:12, paddingVertical:6 }}>
                <Text style={{ color:'#0f172a', fontSize:12, fontWeight:'700' }}>Categoría: {category}</Text>
              </View>
            )}
            {favOnly && (
              <View style={{ backgroundColor:'#e2e8f0', borderRadius:999, paddingHorizontal:12, paddingVertical:6 }}>
                <Text style={{ color:'#0f172a', fontSize:12, fontWeight:'700' }}>Solo favoritos</Text>
              </View>
            )}
            {query.length>0 && (
              <View style={{ backgroundColor:'#e2e8f0', borderRadius:999, paddingHorizontal:12, paddingVertical:6 }}>
                <Text style={{ color:'#0f172a', fontSize:12, fontWeight:'700' }}>"{query}"</Text>
              </View>
            )}
            <Pressable onPress={resetFilters} style={{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#f1f5f9', borderRadius:999, paddingHorizontal:10, paddingVertical:6 }} accessibilityLabel={'Limpiar filtros'}>
              <MaterialIcons name={'close'} size={16} color={'#0f172a'} />
              <Text style={{ color:'#0f172a', fontSize:12, fontWeight:'700' }}>Limpiar</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Controles de vista: grid/list/map */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: horizontalPadding, paddingBottom: 8, gap: 8 }}>
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

      {view === 'map' && (
        <View style={{ paddingHorizontal: horizontalPadding, paddingBottom: 8 }}>
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

      {view === 'map' ? (
        <MapRadius
          items={display.map((e) => ({ id: e.id, title: e.title, coordinate: (e.coordinate as any) || { latitude: 0, longitude: 0 } }))}
          radiusKm={radiusKm}
          onRadiusChange={(km: number) => setRadiusKm(km)}
          onInsideChange={(ids: string[]) => setInsideIds(ids)}
          hideControls={true}
          onBindApi={(api: { centerOnMyLocation: () => void }) => setMapApi(api)}
        />
      ) : (
        <FlatList
          key={`events-${view}-${numColumns}`}
          data={display}
          keyExtractor={(i)=>i.id}
          numColumns={view==='grid'?numColumns:1}
          columnWrapperStyle={view==='grid'?{ gap: 12, paddingHorizontal: 0 }:undefined}
          contentContainerStyle={{ paddingBottom: 96, gap: 12, width: containerMaxWidth, alignSelf: 'center', paddingHorizontal: horizontalPadding }}
          renderItem={renderCard}
        />
      )}

      <Modal transparent visible={mod==='config'} animationType={'fade'} onRequestClose={()=>setMod(null)}>
        <Pressable style={styles.modalBackdrop} onPress={()=>setMod(null)}>
          <View />
        </Pressable>
        <View style={styles.modalSheet}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Filtros</Text>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 8 }}>
              {(['Música','Tecnología','Deportes','Arte','Gastronomía'] as const).map(c => (
                <Pressable key={c} style={[styles.pill, category===c && styles.pillActive]} onPress={()=>setCategory(category===c?'Todas':(c as any))}>
                  <Text style={[styles.pillText, category===c && styles.pillTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Precio</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
              <View style={{ flex: 1, borderWidth:1, borderColor:'#e2e8f0', borderRadius:8, paddingHorizontal:10, height:40, backgroundColor:'#ffffff', flexDirection:'row', alignItems:'center' }}>
                <TextInput value={priceMin} onChangeText={setPriceMin} keyboardType={'numeric'} placeholder={'Mín'} placeholderTextColor={'#94a3b8'} style={{ flex:1, color:'#0f172a' }} />
              </View>
              <View style={{ flex: 1, borderWidth:1, borderColor:'#e2e8f0', borderRadius:8, paddingHorizontal:10, height:40, backgroundColor:'#ffffff', flexDirection:'row', alignItems:'center' }}>
                <TextInput value={priceMax} onChangeText={setPriceMax} keyboardType={'numeric'} placeholder={'Máx'} placeholderTextColor={'#94a3b8'} style={{ flex:1, color:'#0f172a' }} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Rating mínimo</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {(['all','4+','4.5+'] as const).map(r => (
                <Pressable key={r} style={[styles.pill, ratingMin===r && styles.pillActive]} onPress={()=>setRatingMin(r)}>
                  <Text style={[styles.pillText, ratingMin===r && styles.pillTextActive]}>{r==='all'?'Cualquiera':r}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {(['relevance','priceAsc','priceDesc','dateSoon','rating'] as SortKey[]).map(s => (
                <Pressable key={s} style={[styles.pill, sort===s && styles.pillActive]} onPress={()=>setSort(s)}>
                  <Text style={[styles.pillText, sort===s && styles.pillTextActive]}>
                    {s==='relevance'?'Relevancia': s==='priceAsc'?'Precio: bajo a alto': s==='priceDesc'?'Precio: alto a bajo': s==='dateSoon'?'Más próximos':'Rating'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
            <Pressable style={[styles.footerBtnSecondary, { flex: 1 }]} onPress={()=>{ setCategory('Todas'); setPriceMin('0'); setPriceMax('50000'); setRatingMin('all'); setSort('relevance'); setFavOnly(false); }}>
              <Text style={styles.footerBtnSecondaryText}>Restablecer</Text>
            </Pressable>
            <Pressable style={[styles.footerBtnPrimary, { flex: 1 }]} onPress={()=>setMod(null)}>
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
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  locBtn: { height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 10 },
  card: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1 },
  cardBody: { padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  desc: { fontSize: 13, color: '#64748b' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { color: '#475569', fontWeight: '700', fontSize: 12 },
  metaDot: { marginHorizontal: 6, color: '#94a3b8', fontWeight: '900' },
  price: { color: PRIMARY, fontWeight: '900' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 999 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, color: '#0f172a' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' },
  pillText: { color: '#0f172a', fontWeight: '700' },
  pillTextActive: { color: PRIMARY },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
  footerBtnSecondary: { height: 44, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  footerBtnSecondaryText: { color: '#0f172a', fontWeight: '800' },
  footerBtnPrimary: { height: 44, borderRadius: 999, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  footerBtnPrimaryText: { color: '#ffffff', fontWeight: '800' },
});


