import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { follow, getUserById, listUserPosts, Post, unfollow } from '../services/social';

export default function SocialProfileScreen({ route, navigation }: any) {
  const userId: string = route?.params?.userId;
  const user = getUserById(userId);
  const [version, setVersion] = useState(0);
  const posts = useMemo(() => listUserPosts(userId), [userId, version]);
  if (!user) return null;

  const refresh = () => setVersion((v) => v + 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.profileTop}>
        <Image source={{ uri: user.avatarUrl || 'https://i.pravatar.cc/100?img=25' }} style={styles.avatar} />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.followBtn} onPress={() => { follow(user.id); refresh(); }}>
          <Text style={styles.followBtnText}>Seguir</Text>
        </Pressable>
        <Pressable style={[styles.followBtn, { backgroundColor: '#e5e7eb', marginLeft: 8 }]} onPress={() => { unfollow(user.id); refresh(); }}>
          <Text style={[styles.followBtnText, { color: '#0f172a' }]}>Dejar de seguir</Text>
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.post}>
            {!!item.text && <Text style={styles.postText}>{item.text}</Text>}
            {!!item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
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
  profileTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  avatar: { width: 56, height: 56, borderRadius: 999, marginRight: 12 },
  followBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#0ea5e9' },
  followBtnText: { color: '#ffffff', fontWeight: '800' },
  post: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  postText: { color: '#0f172a', marginBottom: 6 },
  postImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb', marginBottom: 6 },
  time: { color: '#64748b', fontSize: 12 },
});


