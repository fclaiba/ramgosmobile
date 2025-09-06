import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { searchHashtags, searchUsers } from '../services/social';

export default function SocialSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const users = useMemo(() => searchUsers(query), [query]);
  const tags = useMemo(() => searchHashtags(query), [query]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>Buscar</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchRow}>
        <MaterialIcons name={'search'} size={18} color={'#64748b'} />
        <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder={'Usuarios o #hashtags'} placeholderTextColor={'#94a3b8'} />
      </View>

      <Text style={styles.section}>Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('SocialProfile', { userId: item.id })}>
            <MaterialIcons name={'person'} size={18} color={'#0f172a'} />
            <Text style={styles.text}>{item.name}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.section}>Hashtags</Text>
      <FlatList
        data={tags}
        keyExtractor={(i) => i}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('SocialHashtag', { tag: item })}>
            <MaterialIcons name={'tag'} size={18} color={'#0f172a'} />
            <Text style={styles.text}>#{item}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0', marginHorizontal: 16, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12 },
  input: { flex: 1, color: '#0f172a' },
  section: { color: '#0f172a', fontWeight: '800', paddingHorizontal: 16, marginTop: 6, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 12, marginHorizontal: 16 },
  text: { color: '#0f172a', flex: 1 },
});


