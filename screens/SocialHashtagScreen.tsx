import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getPostsByHashtag } from '../services/social';

export default function SocialHashtagScreen({ route, navigation }: any) {
  const tag: string = route?.params?.tag;
  const posts = useMemo(() => getPostsByHashtag(tag), [tag]);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>#{tag}</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {!!item.text && <Text style={styles.text}>{item.text}</Text>}
            {!!item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  text: { color: '#0f172a', marginBottom: 6 },
  image: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb' },
});


