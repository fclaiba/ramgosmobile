import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Image, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { listStories } from '../services/social';

type Story = { id: string; name: string; avatar: string };
type Post = { id: string; user: string; handle: string; time: string; avatar: string; text: string; image?: string; stats: { replies: number; reposts: number; likes: number; saves: number } };

export default function SocialTimelineScreen() {
  const navigation = useNavigation<any>();
  const { userId } = useUser();
  const { colors, isDark } = useTheme();
  const width = Dimensions.get('window').width;

  const stories = useMemo<Story[]>(() => listStories().map((s) => ({ id: s.id, name: s.author.name, avatar: s.author.avatarUrl || 'https://picsum.photos/seed/story/200', userId: s.author.id } as any)), []);
  const posts = useMemo<Post[]>(() => POSTS, []);

  const renderStory = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Stories' as any, { userId: item.userId })} activeOpacity={0.9} style={{ width: 64, alignItems: 'center', marginRight: 12 }}>
      <View style={{ width: 64, height: 64 }}>
        <Image source={{ uri: item.avatar }} style={{ width: 64, height: 64, borderRadius: 32 }} />
        <View style={{ position: 'absolute', inset: 0 as any, borderRadius: 32, borderWidth: 2, borderColor: '#1173d4' }} />
      </View>
      <Text style={{ color: colors.text, fontSize: 12 }} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.post, { borderColor: colors.border }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Image source={{ uri: item.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[styles.user, { color: colors.text }]}>{item.user}</Text>
              <Text style={[styles.meta, { color: colors.muted }]}>{`${item.handle} · ${item.time}`}</Text>
            </View>
            <MaterialIcons name={'more-horiz' as any} size={20} color={colors.muted} />
          </View>
          <Text style={[styles.postText, { color: colors.text }]}>{item.text}</Text>
          {item.image ? (
            <Image source={{ uri: item.image }} style={{ width: '100%', height: Math.round(width * 0.48), borderRadius: 12, marginTop: 8 }} />
          ) : null}
          <View style={[styles.actionsRow, { color: colors.muted }]}>
            <Action icon={'chat-bubble-outline' as any} value={item.stats.replies} />
            <Action icon={'repeat' as any} value={item.stats.reposts} />
            <Action icon={'favorite-border' as any} value={item.stats.likes} />
            <Action icon={'bookmark-border' as any} value={item.stats.saves} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.topbar, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.topbarTitle, { color: colors.text }]}>Inicio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SocialProfile' as any, { userId })} accessibilityLabel={'Ir a Mi Perfil'} style={styles.topbarBtn}>
          <MaterialIcons name={'person' as any} size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={(
          <FlatList
            data={stories}
            keyExtractor={(s) => s.id}
            renderItem={renderStory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
          />
        )}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

function Action({ icon, value }: { icon: any; value: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <MaterialIcons name={icon} size={18} color={'#64748b'} />
      <Text style={{ color: '#64748b', fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

  // stories list now comes from service

const POSTS: Post[] = [
  { id: 'p1', user: 'Emma Wilson', handle: '@emma.w', time: '2h', avatar: 'https://picsum.photos/seed/u1/200', text: "Just finished a great workout session! Feeling energized and ready to tackle the day. #fitness #healthylifestyle", stats: { replies: 23, reposts: 15, likes: 48, saves: 9 } },
  { id: 'p2', user: 'Alex Morgan', handle: '@alex.m', time: '5h', avatar: 'https://picsum.photos/seed/u2/200', text: "Excited to announce that I'll be speaking at the upcoming tech conference! Looking forward to sharing insights and connecting with fellow innovators. #tech #innovation", image: 'https://picsum.photos/seed/postimg/800/600', stats: { replies: 12, reposts: 8, likes: 35, saves: 5 } },
  { id: 'p3', user: 'Olivia Reed', handle: '@olivia.r', time: '8h', avatar: 'https://picsum.photos/seed/u3/200', text: 'Enjoying a beautiful sunset by the beach. The colors are breathtaking! #sunset #beachlife', image: 'https://picsum.photos/seed/sunset/800/600', stats: { replies: 30, reposts: 20, likes: 65, saves: 12 } },
];

const styles = StyleSheet.create({
  topbar: { height: 56, borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center' },
  topbarTitle: { fontSize: 18, fontWeight: '800' },
  topbarBtn: { position: 'absolute', right: 12, top: 8, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  post: { borderBottomWidth: 1, padding: 12 },
  user: { fontWeight: '800', fontSize: 16 },
  meta: { fontSize: 12 },
  postText: { marginTop: 6, fontSize: 14 },
  actionsRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
});


