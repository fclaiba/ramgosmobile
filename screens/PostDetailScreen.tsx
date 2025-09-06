import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, TextInput, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { addComment, getUserById, listFeed, Post } from '../services/social';
import { useNavigation } from '@react-navigation/native';

export default function PostDetailScreen({ route }: any) {
  const postId: string = route?.params?.postId;
  const navigation = useNavigation<any>();
  const [version, setVersion] = useState(0);
  const post = useMemo(() => listFeed().find((p) => p.id === postId), [postId, version]);
  const [text, setText] = useState('');
  if (!post) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>Publicación</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.card}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('SocialProfile', { userId: post.author.id })}>
            <Text style={styles.author}>{post.author.name}</Text>
          </Pressable>
          <Text style={styles.time}>{new Date(post.createdAt).toLocaleString()}</Text>
        </View>
        {!!post.text && <Text style={styles.text}>{post.text}</Text>}
        {!!post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
      </View>
      <Text style={styles.section}>Comentarios</Text>
      <FlatList
        data={post.comments}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Text style={styles.commentAuthor}>{item.author.name}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={'Añadir un comentario'}
          placeholderTextColor={'#94a3b8'}
          value={text}
          onChangeText={setText}
        />
        <Pressable style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} onPress={() => { if (!text.trim()) return; addComment(post.id, text); setText(''); setVersion((v) => v + 1); }}>
          <MaterialIcons name={'send'} size={18} color={'#ffffff'} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, margin: 16 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  author: { color: '#0f172a', fontWeight: '800' },
  time: { color: '#64748b', fontSize: 12 },
  text: { color: '#0f172a', marginVertical: 6 },
  image: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb' },
  section: { color: '#0f172a', fontWeight: '800', paddingHorizontal: 16 },
  commentRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16 },
  commentAuthor: { color: '#0f172a', fontWeight: '800' },
  commentText: { color: '#334155', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, color: '#0f172a' },
  sendBtn: { backgroundColor: '#0ea5e9', height: 44, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});


