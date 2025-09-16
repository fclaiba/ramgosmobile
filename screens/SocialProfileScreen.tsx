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
      <FlatList
        data={[{ kind:'stats' },{ kind:'actions' },{ kind:'featured' },{ kind:'reviews' }, ...posts.map(p=>({ kind:'post', post:p }))] as any[]}
        keyExtractor={(i, idx) => i.kind==='post'?i.post.id:String(idx)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingTop: 0 }}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.cover}>
              <Pressable style={styles.topLeft} onPress={() => navigation.goBack()} hitSlop={8}>
                <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
              </Pressable>
              <View style={styles.topRight}>
                <Pressable style={styles.iconBtn} hitSlop={8}><MaterialIcons name={'palette'} size={20} color={'#111827'} /></Pressable>
                <Pressable style={styles.iconBtn} hitSlop={8}><MaterialIcons name={'more-vert'} size={20} color={'#111827'} /></Pressable>
              </View>
            </View>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: user.avatarUrl || 'https://i.pravatar.cc/200?img=25' }} style={styles.bigAvatar} />
            </View>
            <View style={{ alignItems:'center', marginTop: 8, marginBottom: 8 }}>
              <Text style={styles.name}>{user.name || 'Nombre de Usuario'}</Text>
              <Text style={styles.handle}>@{user.handle || 'usuario'}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          item.kind==='stats' ? (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{rating.avg || 4.9}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap: 4 }}>
                  <MaterialIcons name={'star'} size={14} color={'#f59e0b'} />
                  <Text style={styles.statLabel}>Calificación</Text>
                </View>
              </View>
              <View style={styles.statBox}><Text style={styles.statValue}>{posts.length}</Text><Text style={styles.statLabel}>Transacciones</Text></View>
              <View style={styles.statBox}><Text style={styles.statValue}>1.2M</Text><Text style={styles.statLabel}>Seguidores</Text></View>
            </View>
          ) : item.kind==='actions' ? (
            <View style={{ flexDirection:'row', gap: 12 }}>
              <Pressable style={[styles.ctaPrimary, { flex:1 }]} onPress={() => { follow(user.id); setVersion(v=>v+1); }}><Text style={styles.ctaPrimaryText}>Seguir</Text></Pressable>
              <Pressable style={[styles.ctaSecondary, { flex:1 }]} onPress={() => { unfollow(user.id); setVersion(v=>v+1); }}><Text style={styles.ctaSecondaryText}>Contactar</Text></Pressable>
            </View>
          ) : item.kind==='featured' ? (
            <View>
              <View style={[styles.rowBetween, { marginBottom: 8 }]}><Text style={styles.sectionTitle}>Productos Destacados</Text><Pressable><Text style={styles.link}>Ver todo</Text></Pressable></View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 12 }}>
                {featured.map((p, idx)=> (
                  <View key={p.id} style={styles.card}>
                    <Image source={{ uri: p.images[0] }} style={styles.cardImage} />
                    <View style={{ padding:8 }}>
                      <Text style={styles.cardTitle}>{idx===1?'Bono Exclusivo':idx===3?'Servicio Especial':p.title}</Text>
                      <Text style={styles.cardMeta}>{idx===1?'Canjeable':p.price>0?`$${p.price.toFixed(2)}`:'Consultar'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : item.kind==='reviews' ? (
            <View>
              <View style={[styles.rowBetween, { marginBottom: 8 }]}><Text style={styles.sectionTitle}>Reseñas y Testimonios</Text><MaterialIcons name={'drag-handle'} size={18} color={'#64748b'} /></View>
              <View style={{ gap: 12 }}>
                {reviews.map(r => (
                  <View key={r.id} style={styles.reviewCard}>
                    <Image source={{ uri: r.author.avatarUrl || 'https://i.pravatar.cc/100?img=11' }} style={styles.reviewAvatar} />
                    <View style={{ flex:1 }}>
                      <View style={styles.rowBetween}><Text style={styles.reviewName}>{r.author.name}</Text><Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</Text></View>
                      <Text style={styles.reviewText}>"{r.text}"</Text>
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
  cover: { height: 160, backgroundColor: '#d1d5db' },
  topLeft: { position: 'absolute', top: 12, left: 12, padding: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.8)' },
  topRight: { position: 'absolute', top: 12, right: 12, flexDirection:'row', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.8)' },
  avatarWrap: { marginTop: -60, alignItems: 'center' },
  bigAvatar: { width: 120, height: 120, borderRadius: 999, borderWidth: 4, borderColor: '#ffffff', backgroundColor:'#e5e7eb' },
  name: { fontSize: 24, fontWeight: '800', color: '#111827' },
  handle: { fontSize: 13, color: '#6b7280' },
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
  ctaPrimary: { height: 44, borderRadius: 12, backgroundColor: '#1173d4', alignItems:'center', justifyContent:'center' },
  ctaPrimaryText: { color:'#ffffff', fontWeight:'800' },
  ctaSecondary: { height: 44, borderRadius: 12, backgroundColor: '#e5e7eb', alignItems:'center', justifyContent:'center' },
  ctaSecondaryText: { color:'#111827', fontWeight:'800' },
  post: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  postText: { color: '#0f172a', marginBottom: 6 },
  postImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb', marginBottom: 6 },
  time: { color: '#64748b', fontSize: 12 },
});


