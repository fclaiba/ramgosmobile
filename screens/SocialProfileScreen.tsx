import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { follow, getUserById, listUserPosts, Post, unfollow } from '../services/social';
import { getProducts } from '../services/products';
import { getAverageRating, listReviewsByUser } from '../services/reviews';

export default function SocialProfileScreen({ route, navigation }: any) {
  const userId: string = route?.params?.userId;
  const user = getUserById(userId);
  const [version, setVersion] = useState(0);
  const posts = useMemo(() => listUserPosts(userId), [userId, version]);
  const featured = useMemo(()=> getProducts().slice(0,4), []);
  const rating = useMemo(()=> getAverageRating(userId), [userId]);
  const reviews = useMemo(()=> listReviewsByUser(userId), [userId, version]);
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
        data={[{ kind:'stats' },{ kind:'actions' },{ kind:'featured' },{ kind:'reviews' }, ...posts.map(p=>({ kind:'post', post:p }))] as any[]}
        keyExtractor={(i, idx) => i.kind==='post'?i.post.id:String(idx)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          item.kind==='stats' ? (
            <View style={styles.statsRow}>
              <View style={styles.statBox}><Text style={styles.statValue}>{rating.avg || 4.9}</Text><Text style={styles.statLabel}>Calificación</Text></View>
              <View style={styles.statBox}><Text style={styles.statValue}>{posts.length}</Text><Text style={styles.statLabel}>Transacciones</Text></View>
              <View style={styles.statBox}><Text style={styles.statValue}>1.2M</Text><Text style={styles.statLabel}>Seguidores</Text></View>
            </View>
          ) : item.kind==='actions' ? (
            <View style={{ flexDirection:'row', gap: 12 }}>
              <Pressable style={[styles.followBtn, { flex:1, backgroundColor:'#1173d4' }]} onPress={() => { follow(user.id); setVersion(v=>v+1); }}><Text style={{ color:'#ffffff', fontWeight:'800', textAlign:'center' }}>Seguir</Text></Pressable>
              <Pressable style={[styles.followBtn, { flex:1, backgroundColor:'#e5e7eb' }]} onPress={() => { unfollow(user.id); setVersion(v=>v+1); }}><Text style={{ color:'#0f172a', fontWeight:'800', textAlign:'center' }}>Contactar</Text></Pressable>
            </View>
          ) : item.kind==='featured' ? (
            <View>
              <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Productos Destacados</Text><Pressable><Text style={styles.link}>Ver todo</Text></Pressable></View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 12 }}>
                {featured.map((p)=> (
                  <View key={p.id} style={styles.card}>
                    <Image source={{ uri: p.images[0] }} style={styles.cardImage} />
                    <View style={{ padding:8 }}>
                      <Text style={styles.cardTitle}>{p.title}</Text>
                      <Text style={styles.cardMeta}>{p.price>0?`$${p.price.toFixed(2)}`:'Consultar'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : item.kind==='reviews' ? (
            <View>
              <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Reseñas y Testimonios</Text><MaterialIcons name={'drag-handle'} size={18} color={'#64748b'} /></View>
              <View style={{ gap: 12 }}>
                {reviews.map(r => (
                  <View key={r.id} style={styles.reviewCard}>
                    <Image source={{ uri: r.author.avatarUrl || 'https://i.pravatar.cc/100?img=11' }} style={styles.reviewAvatar} />
                    <View style={{ flex:1 }}>
                      <View style={styles.rowBetween}><Text style={styles.reviewName}>{r.author.name}</Text><Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</Text></View>
                      <Text style={styles.reviewText}>{r.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.post}>
              {!!item.post.text && <Text style={styles.postText}>{item.post.text}</Text>}
              {!!item.post.imageUrl && <Image source={{ uri: item.post.imageUrl }} style={styles.postImage} />}
              <Text style={styles.time}>{new Date(item.post.createdAt).toLocaleString()}</Text>
            </View>
          )
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12 },
  statBox: { alignItems: 'center', paddingHorizontal: 8 },
  statValue: { color: '#111827', fontWeight: '900', fontSize: 18 },
  statLabel: { color: '#64748b', fontSize: 12 },
  card: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
  rowBetween: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  sectionTitle: { color:'#111827', fontSize:18, fontWeight:'800' },
  link: { color:'#1173d4', fontWeight:'800' },
  cardImage: { width: '100%', height: 112, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cardTitle: { color:'#111827', fontWeight:'700', fontSize: 14 },
  cardMeta: { color:'#64748b', fontSize: 12 },
  reviewCard: { flexDirection:'row', alignItems:'flex-start', gap: 12, backgroundColor:'#ffffff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 999 },
  reviewName: { color:'#111827', fontWeight:'800' },
  reviewStars: { color:'#f59e0b', fontWeight:'800' },
  reviewText: { color:'#374151', marginTop: 4 },
  post: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  postText: { color: '#0f172a', marginBottom: 6 },
  postImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb', marginBottom: 6 },
  time: { color: '#64748b', fontSize: 12 },
});


