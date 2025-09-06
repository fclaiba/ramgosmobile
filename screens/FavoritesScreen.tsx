import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, TextInput, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { addComment, createPost, follow, listFeed, listFollowing, listSuggestedFollows, listStories, Post, toggleLike, unfollow } from '../services/social';
import { useNavigation } from '@react-navigation/native';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [text, setText] = useState('');
  const [feedVersion, setFeedVersion] = useState(0);
  const feed = useMemo(() => listFeed(), [feedVersion]);
  const suggestions = useMemo(() => listSuggestedFollows(), [feedVersion]);
  const following = useMemo(() => listFollowing(), [feedVersion]);
  const stories = useMemo(() => listStories(), [feedVersion]);

  const refresh = () => setFeedVersion((v) => v + 1);

  const handlePublish = () => {
    if (!text.trim()) return;
    createPost({ text });
    setText('');
    refresh();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Pressable onPress={() => navigation.navigate('SocialProfile', { userId: item.author.id })}>
          <Image source={{ uri: item.author.avatarUrl || 'https://i.pravatar.cc/100?img=12' }} style={styles.avatar} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => navigation.navigate('SocialProfile', { userId: item.author.id })}>
            <Text style={styles.author}>{item.author.name}</Text>
          </Pressable>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}
      {!!item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => { toggleLike(item.id); refresh(); }}>
          <MaterialIcons name={item.likedByMe ? 'favorite' : 'favorite-border'} size={18} color={item.likedByMe ? '#dc2626' : '#334155'} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => { addComment(item.id, '👏'); refresh(); }}>
          <MaterialIcons name={'chat-bubble-outline'} size={18} color={'#334155'} />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('SocialChat', { userId: item.author.id })}>
          <MaterialIcons name={'ios-share'} size={18} color={'#334155'} />
          <Text style={styles.actionText}>Mensaje</Text>
        </Pressable>
      </View>
      {item.comments.length > 0 && (
        <View style={styles.comments}>
          {item.comments.slice(-3).map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Text style={styles.commentAuthor}>{c.author.name}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.navigate('SocialSearch')} hitSlop={8}>
          <MaterialIcons name={'search'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>Social Network</Text>
        <Pressable onPress={() => navigation.navigate('SocialNotifications')} hitSlop={8}>
          <MaterialIcons name={'notifications'} size={22} color={'#0f172a'} />
        </Pressable>
      </View>

      {/* Stories strip */}
      <FlatList
        horizontal
        data={stories}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <Pressable style={styles.story} onPress={() => navigation.navigate('Stories', { userId: item.author.id })}>
            <Image source={{ uri: item.author.avatarUrl || 'https://i.pravatar.cc/100?img=30' }} style={styles.storyAvatar} />
            <Text style={styles.storyName} numberOfLines={1}>{item.author.name}</Text>
          </Pressable>
        )}
      />

      {/* Composer */}
      <View style={styles.composer}>
        <TextInput
          placeholder="¿Qué quieres compartir?"
          placeholderTextColor={'#94a3b8'}
          style={styles.composerInput}
          value={text}
          onChangeText={setText}
          multiline
        />
        <View style={styles.composerActions}>
          <Pressable style={styles.pillBtn} onPress={() => { if (text.trim()) { createPost({ text, imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop' }); setText(''); refresh(); } }}>
            <MaterialIcons name={'image'} size={16} color={'#0f172a'} />
            <Text style={styles.pillBtnText}>Foto</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={[styles.publishBtn, !text.trim() && { opacity: 0.5 }]} onPress={handlePublish} disabled={!text.trim()}>
            <Text style={styles.publishText}>Publicar</Text>
          </Pressable>
        </View>
      </View>

      {/* Suggestions / Following */}
      <View style={styles.followStrip}>
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.suggestCard}>
              <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/100?img=20' }} style={styles.suggestAvatar} />
              <Text style={styles.suggestName}>{item.name}</Text>
              <Pressable style={styles.followBtn} onPress={() => { follow(item.id); refresh(); }}>
                <Text style={styles.followBtnText}>Seguir</Text>
              </Pressable>
            </View>
          )}
        />
      </View>

      {/* Feed */}
      <FlatList
        data={feed}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View>
            {renderPost({ item })}
            {!!item.text && (
              <Pressable onPress={() => navigation.navigate('PostDetail', { postId: item.id })} style={{ paddingHorizontal: 12, paddingTop: 6 }}>
                <Text style={{ color: '#0ea5e9', fontWeight: '800' }}>Ver detalles</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#0f172a' },
  composer: { marginHorizontal: 16, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, gap: 8 },
  composerInput: { minHeight: 40, color: '#0f172a' },
  composerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  publishText: { color: '#ffffff', fontWeight: '800' },
  pillBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillBtnText: { color: '#0f172a', fontWeight: '700' },
  followStrip: { paddingVertical: 12 },
  suggestCard: { width: 120, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, alignItems: 'center', backgroundColor: '#ffffff' },
  suggestAvatar: { width: 48, height: 48, borderRadius: 999, marginBottom: 6 },
  suggestName: { color: '#0f172a', fontWeight: '800' },
  followBtn: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#0ea5e9' },
  followBtnText: { color: '#ffffff', fontWeight: '800' },
  story: { width: 72, alignItems: 'center' },
  storyAvatar: { width: 56, height: 56, borderRadius: 999, borderWidth: 2, borderColor: '#0ea5e9' },
  storyName: { color: '#0f172a', fontWeight: '700', fontSize: 12, marginTop: 4, maxWidth: 72 },
  post: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 36, height: 36, borderRadius: 999 },
  author: { color: '#0f172a', fontWeight: '800' },
  time: { color: '#64748b', fontSize: 12 },
  postText: { color: '#0f172a', marginVertical: 6 },
  postImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#334155', fontWeight: '700' },
  comments: { marginTop: 8, gap: 4 },
  commentRow: { flexDirection: 'row', gap: 6 },
  commentAuthor: { color: '#0f172a', fontWeight: '800' },
  commentText: { color: '#334155' },
});


