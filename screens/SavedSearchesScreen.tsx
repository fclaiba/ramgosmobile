import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type SavedSearch = {
  query: string;
  condition: string;
  price: string;
  rating: string;
  location: string;
  favOnly: boolean;
  sort: string;
  ts: number;
};

export default function SavedSearchesScreen() {
  const [items, setItems] = useState<SavedSearch[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('market_saved_searches').then((json) => {
      if (json) setItems(JSON.parse(json));
    }).catch(() => {});
  }, []);

  const clearAll = async () => {
    try { await AsyncStorage.removeItem('market_saved_searches'); setItems([]); } catch {}
  };

  const applySearch = async (s: SavedSearch) => {
    try {
      await AsyncStorage.setItem('market_apply_search', JSON.stringify(s));
      // @ts-ignore
      (global as any).NAVIGATE?.('Main', { screen: 'Marketplace' });
    } catch {}
  };

  const renderItem = ({ item }: { item: SavedSearch }) => (
    <Pressable style={styles.card} onPress={() => applySearch(item)}>
      <Text style={styles.title}>{item.query || 'Sin título'}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        cond={item.condition} precio={item.price} rating={item.rating} ubic={item.location} favs={item.favOnly ? 'sí' : 'no'} orden={item.sort}
      </Text>
      <Text style={styles.meta}>{new Date(item.ts).toLocaleString()}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Búsquedas guardadas</Text>
        {items.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={clearAll}>
            <MaterialIcons name={'delete'} size={20} color={'#ef4444'} />
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons name={'bookmark-border'} size={32} color={'#94a3b8'} />
          <Text style={{ marginTop: 8, color: '#64748b' }}>No hay búsquedas guardadas</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.ts)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  clearBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#64748b' },
  meta: { marginTop: 6, fontSize: 12, color: '#94a3b8' },
});


