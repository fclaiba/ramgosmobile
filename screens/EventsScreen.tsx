import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, ImageBackground, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { EventItem, getEvents } from '../services/events';
import { useNavigation } from '@react-navigation/native';
import MapRadius from '../components/MapRadius';

const PRIMARY = '#1173d4';

export default function EventsScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'Todas' | EventItem['category']>('Todas');
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const events = useMemo(() => getEvents(), []);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => events.filter(e => (
    (!q || `${e.title} ${e.description}`.toLowerCase().includes(q)) && (category==='Todas' || e.category===category)
  )), [events, q, category]);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [insideIds, setInsideIds] = useState<string[]>([]);
  const [mapApi, setMapApi] = useState<{ centerOnMyLocation: () => void } | null>(null);

  const renderCard = ({ item }: { item: EventItem }) => (
    <View style={styles.card}>
      <ImageBackground source={{ uri: item.images[0] }} style={styles.image} imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{item.location}</Text>
          <Text style={[styles.price, { marginLeft: 'auto' }]}>{item.price>0?`$${item.price}`:'Gratis'}</Text>
        </View>
      </View>
    </View>
  );

  const horizontalPadding = width < 380 ? 12 : width < 768 ? 16 : 24;
  const containerMaxWidth = Math.min(1200, width - horizontalPadding * 2);
  const numColumns = width >= 1200 ? 4 : width >= 900 ? 3 : 2;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.headerRow, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: horizontalPadding, paddingBottom: 8 }}>
        <View style={styles.searchWrap}>
          <MaterialIcons name={'search'} size={18} color={'#94a3b8'} style={{ marginLeft: 12 }} />
          <TextInput placeholder={'Buscar eventos'} placeholderTextColor={'#64748b'} value={query} onChangeText={setQuery} style={styles.searchInput} />
          <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 8 }}><MaterialIcons name={'close'} size={18} color={'#94a3b8'} /></Pressable>
        </View>
        <View style={{ flexDirection:'row', gap: 8, marginTop: 8 }}>
          {(['Todas','Música','Tecnología','Deportes','Arte','Gastronomía'] as const).map(c => (
            <Pressable key={c} style={[styles.pill, category===c && styles.pillActive]} onPress={()=>setCategory(c as any)}>
              <Text style={[styles.pillText, category===c && styles.pillTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
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
          items={filtered.map((e) => ({ id: e.id, title: e.title, coordinate: (e.coordinate as any) || { latitude: 0, longitude: 0 } }))}
          radiusKm={radiusKm}
          onRadiusChange={(km: number) => setRadiusKm(km)}
          onInsideChange={(ids: string[]) => setInsideIds(ids)}
          hideControls={true}
          onBindApi={(api: { centerOnMyLocation: () => void }) => setMapApi(api)}
        />
      ) : (
        <FlatList
          key={`events-${view}-${numColumns}`}
          data={filtered}
          keyExtractor={(i)=>i.id}
          numColumns={view==='grid'?numColumns:1}
          columnWrapperStyle={view==='grid'?{ gap: 12, paddingHorizontal: 0 }:undefined}
          contentContainerStyle={{ paddingBottom: 96, gap: 12, width: containerMaxWidth, alignSelf: 'center', paddingHorizontal: horizontalPadding }}
          renderItem={renderCard}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
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
});


