import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, Pressable, Modal, Animated, PanResponder, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { addComment, follow, getUserById, listUserPosts, Post, toggleLike, toggleRetweet, unfollow } from '../services/social';
import { getPostById, listCommentsTree, toggleLikeComment } from '../services/social';
import { getProducts } from '../services/products';
import { getCoupons } from '../services/coupons';
import { getEvents } from '../services/events';
import { getAverageRating, listReviewsByUser } from '../services/reviews';

export default function SocialProfileScreen({ route, navigation }: any) {
  const userId: string = route?.params?.userId;
  const user = getUserById(userId);
  const [version, setVersion] = useState(0);
  const posts = useMemo(() => listUserPosts(userId), [userId, version]);
  const featured = useMemo(()=> getProducts().slice(0,4), []);
  const rating = useMemo(()=> getAverageRating(userId), [userId]);
  const reviews = useMemo(()=> listReviewsByUser(userId), [userId, version]);
  const coupons = useMemo(()=> getCoupons().slice(0,4), []);
  const events = useMemo(()=> getEvents().slice(0,2), []);
  const images = useMemo(()=> posts.filter(p=>!!p.imageUrl).map(p=>p.imageUrl as string), [posts]);
  const [view, setView] = useState<'ig'|'tw'|'biz'>('ig');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [threadOpen, setThreadOpen] = useState<{ postId: string; replyingToId?: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef<TextInput | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6,
      onPanResponderMove: Animated.event([null, { dy: translateY }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 80) {
          Animated.timing(translateY, { toValue: 300, duration: 160, useNativeDriver: true }).start(() => {
            translateY.setValue(0);
            setViewerOpen(false);
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  function openViewer(index: number) {
    setViewerIndex(index);
    setViewerOpen(true);
  }
  if (!user) return null;

  const refresh = () => setVersion((v) => v + 1);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  function renderCommentNode(node: any, depth: number) {
    const INDENT_UNIT = 16;
    const MAX_INDENT = 3;
    const indentDepth = Math.min(depth, MAX_INDENT);
    const indentPx = indentDepth * INDENT_UNIT;

    const replies: any[] = node.replies || [];
    const MAX_COLLAPSED = 2;
    const showAll = expandedReplies.has(node.id);
    const visibleReplies = showAll ? replies : replies.slice(0, MAX_COLLAPSED);

    return (
      <View key={node.id} style={{ paddingLeft: indentPx, position:'relative' }}>
        {indentDepth > 0 && (
          <View style={{ position:'absolute', left: indentPx - Math.floor(INDENT_UNIT/2), top: 0, bottom: 0, width: 1, backgroundColor:'#e5e7eb' }} />
        )}
        <View style={{ flexDirection:'row', alignItems:'flex-start', gap:10 }}>
          <Image source={{ uri: node.author.avatarUrl || 'https://i.pravatar.cc/100?img=31' }} style={{ width:32, height:32, borderRadius:999, backgroundColor:'#e5e7eb' }} />
          <View style={{ flex:1 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
              <Text style={{ fontWeight:'800', color:'#111827' }}>{node.author.name}</Text>
              <Text style={{ color:'#6b7280' }}>{new Date(node.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={{ color:'#111827', marginTop:2 }}>{node.text}</Text>
            <View style={{ flexDirection:'row', gap:16, marginTop:6 }}>
              <Pressable style={{ flexDirection:'row', alignItems:'center', gap:6 }} onPress={()=>{ toggleLikeComment(node.id); refresh(); }}>
                <MaterialIcons name={node.likedByMe ? 'favorite' : 'favorite-border'} size={16} color={node.likedByMe ? '#ef4444' : '#6b7280'} />
                <Text style={{ color:node.likedByMe ? '#ef4444' : '#6b7280' }}>{node.likes || 0}</Text>
              </Pressable>
              <Pressable style={{ flexDirection:'row', alignItems:'center', gap:6 }} onPress={()=>{ setThreadOpen({ postId: threadOpen!.postId, replyingToId: node.id }); setTimeout(()=>replyInputRef.current?.focus(), 0); }}>
                <MaterialIcons name={'reply'} size={16} color={'#6b7280'} />
                <Text style={{ color:'#6b7280' }}>Responder</Text>
              </Pressable>
            </View>

            {replies.length > 0 && (
              <View style={{ marginTop:8, gap:10 }}>
                {visibleReplies.map((r: any) => renderCommentNode(r, depth + 1))}
                {!showAll && replies.length > MAX_COLLAPSED && (
                  <Pressable onPress={()=>{ setExpandedReplies((prev)=>{ const n = new Set(prev); n.add(node.id); return n; }); }}>
                    <Text style={{ color:'#1173d4', fontWeight:'700' }}>Mostrar {replies.length - MAX_COLLAPSED} respuestas más</Text>
                  </Pressable>
                )}
                {showAll && replies.length > MAX_COLLAPSED && (
                  <Pressable onPress={()=>{ setExpandedReplies((prev)=>{ const n = new Set(prev); n.delete(node.id); return n; }); }}>
                    <Text style={{ color:'#6b7280', fontWeight:'700' }}>Mostrar menos</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={(view==='tw'
          ? ([{ kind:'stats' },{ kind:'actions' },{ kind:'tabs' }, ...posts.map(p=>({ kind:'post', post:p }))]
          ) : view==='biz'
          ? ([{ kind:'stats' },{ kind:'actions' },{ kind:'tabs' },{ kind:'featured' },{ kind:'coupons' },{ kind:'events' },{ kind:'reviews' }]
          ) : ([{ kind:'stats' },{ kind:'actions' },{ kind:'tabs' },{ kind:'iggrid' }])) as any[]}
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
          ) : item.kind==='tabs' ? (
            <View style={styles.tabsRow}>
              <Pressable style={[styles.tabBtn, view==='ig' && styles.tabBtnActive]} onPress={()=>setView('ig')}>
                <MaterialIcons name={'grid-on'} size={18} color={view==='ig'?'#111827':'#6b7280'} />
                <Text style={[styles.tabText, view==='ig' && styles.tabTextActive]}>Fotos</Text>
              </Pressable>
              <Pressable style={[styles.tabBtn, view==='tw' && styles.tabBtnActive]} onPress={()=>setView('tw')}>
                <MaterialIcons name={'article'} size={18} color={view==='tw'?'#111827':'#6b7280'} />
                <Text style={[styles.tabText, view==='tw' && styles.tabTextActive]}>Posts</Text>
              </Pressable>
              <Pressable style={[styles.tabBtn, view==='biz' && styles.tabBtnActive]} onPress={()=>setView('biz')}>
                <MaterialIcons name={'storefront'} size={18} color={view==='biz'?'#111827':'#6b7280'} />
                <Text style={[styles.tabText, view==='biz' && styles.tabTextActive]}>Comercial</Text>
              </Pressable>
            </View>
          ) : item.kind==='actions' ? (
            <View style={{ flexDirection:'row', gap: 12 }}>
              <Pressable style={[styles.ctaPrimary, { flex:1 }]} onPress={() => { follow(user.id); setVersion(v=>v+1); }}><Text style={styles.ctaPrimaryText}>Seguir</Text></Pressable>
              <Pressable style={[styles.ctaSecondary, { flex:1 }]} onPress={() => { unfollow(user.id); setVersion(v=>v+1); }}><Text style={styles.ctaSecondaryText}>Contactar</Text></Pressable>
            </View>
          ) : item.kind==='iggrid' ? (
            <View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 4 }}>
                {images.map((src, i)=> (
                  <Pressable key={i} onPress={()=>openViewer(i)}>
                    <Image source={{ uri: src }} style={styles.igImage} />
                  </Pressable>
                ))}
              </View>
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
          ) : item.kind==='coupons' ? (
            <View>
              <View style={[styles.rowBetween, { marginBottom: 8 }]}><Text style={styles.sectionTitle}>Cupones</Text><Pressable><Text style={styles.link}>Ver todo</Text></Pressable></View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 12 }}>
                {coupons.map((c)=> (
                  <View key={c.id} style={styles.card}>
                    <Image source={{ uri: c.images[0] }} style={styles.cardImage} />
                    <View style={{ padding:8 }}>
                      <Text style={styles.cardTitle}>{c.title}</Text>
                      <Text style={styles.cardMeta}>{c.price>0?`$${c.price.toFixed(2)}`:'Gratis'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : item.kind==='events' ? (
            <View>
              <View style={[styles.rowBetween, { marginBottom: 8 }]}><Text style={styles.sectionTitle}>Eventos</Text><Pressable><Text style={styles.link}>Ver todo</Text></Pressable></View>
              <View style={{ gap: 12 }}>
                {events.map((e)=> (
                  <View key={e.id} style={styles.reviewCard}>
                    <Image source={{ uri: e.images[0] }} style={{ width:56, height:56, borderRadius:8, marginRight:8 }} />
                    <View style={{ flex:1 }}>
                      <Text style={styles.cardTitle}>{e.title}</Text>
                      <Text style={styles.cardMeta}>{new Date(e.date).toLocaleDateString()} • {e.location}</Text>
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
            <View style={styles.tweetContainer}>
              <View style={styles.tweetHeaderRow}>
                <Image source={{ uri: item.post.author.avatarUrl || 'https://i.pravatar.cc/100?img=25' }} style={styles.tweetAvatar} />
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', flexWrap:'wrap' }}>
                    <Text style={styles.tweetName}>{item.post.author.name}</Text>
                    <Text style={styles.tweetHandle}> @{item.post.author.handle || 'usuario'}</Text>
                    <Text style={styles.tweetDot}> · </Text>
                    <Text style={styles.tweetTime}>{new Date(item.post.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                <MaterialIcons name={'more-vert'} size={18} color={'#6b7280'} />
              </View>

              {!!item.post.text && (
                <Text style={styles.tweetText}>
                  {item.post.text.length > 280 ? item.post.text.slice(0,280) + '…' : item.post.text}
                </Text>
              )}
              {!!item.post.imageUrl && <Image source={{ uri: item.post.imageUrl }} style={styles.tweetImage} />}

              <View style={styles.tweetActionsRow}>
                <Pressable
                  style={styles.tweetAction}
                  onPress={() => { setThreadOpen({ postId: item.post.id }); }}
                >
                  <MaterialIcons name={'chat-bubble-outline'} size={16} color={'#6b7280'} />
                  <Text style={styles.tweetActionText}>{item.post.comments?.length || 0}</Text>
                </Pressable>
                <Pressable
                  style={styles.tweetAction}
                  onPress={() => { toggleRetweet(item.post.id); setVersion(v=>v+1); }}
                >
                  <MaterialIcons name={'cached'} size={16} color={item.post.retweetedByMe ? '#16a34a' : '#6b7280'} />
                  <Text style={[styles.tweetActionText, { color: item.post.retweetedByMe ? '#16a34a' : '#6b7280' }]}>{item.post.retweets || 0}</Text>
                </Pressable>
                <Pressable
                  style={styles.tweetAction}
                  onPress={() => { toggleLike(item.post.id); setVersion(v=>v+1); }}
                >
                  <MaterialIcons name={item.post.likedByMe ? 'favorite' : 'favorite-border'} size={16} color={item.post.likedByMe ? '#ef4444' : '#6b7280'} />
                  <Text style={[styles.tweetActionText, { color: item.post.likedByMe ? '#ef4444' : '#6b7280' }]}>{item.post.likes || 0}</Text>
                </Pressable>
                <Pressable style={styles.tweetAction} onPress={() => {}}>
                  <MaterialIcons name={'share'} size={16} color={'#6b7280'} />
                </Pressable>
              </View>
            </View>
          )
        )}
        ListFooterComponent={() => (
          <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={()=>setViewerOpen(false)}>
            <View style={styles.viewerBackdrop}>
              <Animated.View style={[styles.viewerCard, { transform:[{ translateY }] }]} {...pan.panHandlers}>
                <Image source={{ uri: images[viewerIndex] }} style={styles.viewerImage} />
                <View style={styles.viewerHandle} />
              </Animated.View>
              <View style={styles.viewerThumbs}>
                {images.map((src, i)=> (
                  <Pressable key={i} onPress={()=>setViewerIndex(i)}>
                    <Image source={{ uri: src }} style={[styles.viewerThumb, i===viewerIndex && styles.viewerThumbActive]} />
                  </Pressable>
                ))}
              </View>
          </View>
          </Modal>
        )}
      />

      {/* Thread modal */}
      <Modal visible={!!threadOpen} animationType="slide" onRequestClose={()=>setThreadOpen(null)}>
        <SafeAreaView style={{ flex:1, backgroundColor:'#ffffff' }}>
          <View style={{ flexDirection:'row', alignItems:'center', padding:12, borderBottomWidth:1, borderColor:'#e5e7eb' }}>
            <Pressable onPress={()=>setThreadOpen(null)} style={{ padding:6 }}><MaterialIcons name={'close'} size={22} color={'#111827'} /></Pressable>
            <Text style={{ marginLeft:8, fontWeight:'800', color:'#111827' }}>Respuestas</Text>
          </View>
          {threadOpen && (() => { const p = getPostById(threadOpen.postId); if (!p) return null as any; return (
            <View style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:8, borderBottomWidth:1, borderColor:'#e5e7eb' }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:6 }}>
                <Image source={{ uri: p.author.avatarUrl || 'https://i.pravatar.cc/100?img=25' }} style={{ width: 36, height: 36, borderRadius: 999 }} />
                <View style={{ flexDirection:'row', alignItems:'center', flexWrap:'wrap', flex:1 }}>
                  <Text style={{ fontWeight:'800', color:'#111827' }}>{p.author.name}</Text>
                  <Text style={{ color:'#6b7280' }}> @{p.author.handle || 'usuario'} · {new Date(p.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              {!!p.text && <Text style={{ color:'#0f172a', fontSize:15, lineHeight:22, marginBottom:8 }}>{p.text}</Text>}
              {!!p.imageUrl && <Image source={{ uri: p.imageUrl }} style={{ borderRadius:12, width:'100%', aspectRatio:16/9, backgroundColor:'#e5e7eb' }} />}
            </View>
          ); })()}
          <FlatList
            data={listCommentsTree(threadOpen?.postId || '').slice()}
            keyExtractor={(i)=>i.id}
            contentContainerStyle={{ padding:16, paddingBottom:100, gap:12 }}
            renderItem={({ item }) => renderCommentNode(item, 0)}
          />
          <View style={{ position:'absolute', left:0, right:0, bottom:0, borderTopWidth:1, borderColor:'#e5e7eb', backgroundColor:'#ffffff', padding:12, flexDirection:'row', alignItems:'center', gap:10 }}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=25' }} style={{ width:28, height:28, borderRadius:999, backgroundColor:'#e5e7eb' }} />
            <TextInput ref={replyInputRef} value={replyText} onChangeText={setReplyText} maxLength={280} placeholder={threadOpen?.replyingToId ? 'Respondiendo a un comentario…' : 'Escribe una respuesta...'} placeholderTextColor={'#6b7280'} style={{ flex:1, borderWidth:1, borderColor:'#d1d5db', borderRadius:999, paddingHorizontal:14, paddingVertical:8, color:'#111827' }} />
            <Pressable
              onPress={() => { if (threadOpen && replyText.trim()) { addComment(threadOpen.postId, replyText.trim(), threadOpen.replyingToId); setReplyText(''); setThreadOpen({ postId: threadOpen.postId }); setVersion(v=>v+1); } }}
              style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:999, backgroundColor:'#1173d4' }}
            >
              <Text style={{ color:'#ffffff', fontWeight:'800' }}>Responder</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  tabsRow: { flexDirection:'row', justifyContent:'space-around', borderBottomWidth:1, borderColor:'#e5e7eb', paddingVertical:8 },
  tabBtn: { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  tabBtnActive: { backgroundColor:'#f3f4f6' },
  tabText: { color:'#6b7280', fontWeight:'700' },
  tabTextActive: { color:'#111827' },
  igImage: { width: '32%', aspectRatio: 1, borderRadius: 8, backgroundColor:'#e5e7eb' },
  viewerBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.85)', alignItems:'center', justifyContent:'center', padding:16 },
  viewerCard: { width:'100%', borderRadius:16, overflow:'hidden', backgroundColor:'#000' },
  viewerImage: { width:'100%', aspectRatio: 1 },
  viewerHandle: { alignSelf:'center', marginVertical:8, width:48, height:4, borderRadius:999, backgroundColor:'#9ca3af' },
  viewerThumbs: { position:'absolute', bottom:20, flexDirection:'row', gap:6 },
  viewerThumb: { width:40, height:40, borderRadius:8, opacity:0.6 },
  viewerThumbActive: { opacity:1, borderWidth:2, borderColor:'#fff' },
  post: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12 },
  postText: { color: '#0f172a', marginBottom: 6 },
  postImage: { width: '100%', aspectRatio: 16/9, borderRadius: 8, backgroundColor: '#e5e7eb', marginBottom: 6 },
  time: { color: '#64748b', fontSize: 12 },
  // Twitter-like post styles
  tweetContainer: { backgroundColor:'#ffffff', paddingHorizontal:16, paddingTop:12, paddingBottom:8, borderBottomWidth:1, borderColor:'#e5e7eb' },
  tweetHeaderRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:6 },
  tweetAvatar: { width: 40, height: 40, borderRadius: 999, backgroundColor:'#e5e7eb' },
  tweetName: { color:'#111827', fontWeight:'800' },
  tweetHandle: { color:'#6b7280' },
  tweetDot: { color:'#6b7280' },
  tweetTime: { color:'#6b7280' },
  tweetText: { color:'#0f172a', fontSize:15, lineHeight:22, marginLeft:52, marginBottom:8 },
  tweetImage: { marginLeft:52, borderRadius:12, width:'86%', aspectRatio:16/9, backgroundColor:'#e5e7eb' },
  tweetActionsRow: { marginLeft:52, flexDirection:'row', justifyContent:'space-between', paddingRight:24, marginTop:8 },
  tweetAction: { flexDirection:'row', alignItems:'center', gap:6 },
  tweetActionText: { color:'#6b7280', fontSize:12 },
});


