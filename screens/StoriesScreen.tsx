import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Dimensions, Pressable, FlatList, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listStories, listStoriesByUser, markStoryViewed, Story } from '../services/social';

const { width } = Dimensions.get('window');

export default function StoriesScreen({ route, navigation }: any) {
  const userId: string | undefined = route?.params?.userId;
  const stories = useMemo(() => (userId ? listStoriesByUser(userId) : listStories()), [userId]);
  const [index, setIndex] = useState(0);
  const current = stories[index];
  if (!current) return null;

  const next = () => { if (index < stories.length - 1) { setIndex(index + 1); markStoryViewed(stories[index + 1].id); } else { navigation.goBack(); } };
  const prev = () => { if (index > 0) { setIndex(index - 1); } };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        {current.imageUrl ? (
          <Image source={{ uri: current.imageUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={styles.text}>{current.text}</Text></View>
        )}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>
      <View style={styles.overlay}>
        <View style={{ marginTop: 12 }}>
          <View style={styles.progressRow}>
            {stories.map((_, i) => (
              <View key={`p-${i}`} style={styles.progressTrack}>
                <View style={[styles.progressFill, i < index ? { width: '100%' } : i === index ? { width: '25%' } : { width: 0 }]} />
              </View>
            ))}
          </View>
          <View style={styles.topUserRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: current.author.avatarUrl || 'https://i.pravatar.cc/150' }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              <Text style={{ color: '#ffffff', fontWeight: '800' }}>{current.author.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>2h</Text>
            </View>
            <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <MaterialIcons name={'close'} size={24} color={'#ffffff'} />
            </Pressable>
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.reactBtn}><Text style={{ fontSize: 20 }}>😊</Text></View>
              <View style={styles.reactBtn}><Text style={{ fontSize: 20 }}>❤️</Text></View>
              <View style={styles.reactBtn}><Text style={{ fontSize: 20 }}>🔥</Text></View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput placeholder={'Send message'} placeholderTextColor={'rgba(255,255,255,0.6)'} style={styles.input} />
              <View style={styles.sendBtn}><MaterialIcons name={'arrow-upward' as any} size={18} color={'#ffffff'} /></View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.tapZones}>
        <Pressable style={{ flex: 1 }} onPress={prev} />
        <Pressable style={{ flex: 1 }} onPress={next} />
        <Pressable style={{ flex: 1 }} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101922' },
  overlay: { position: 'absolute', inset: 0 as any, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, justifyContent: 'space-between' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#ffffff', borderRadius: 999 },
  topUserRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  gradientTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 180, backgroundColor: 'rgba(0,0,0,0.35)' },
  gradientBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.35)' },
  text: { color: '#ffffff', fontSize: 20, fontWeight: '800', paddingHorizontal: 16, textAlign: 'center' },
  reactBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  input: { height: 48, borderRadius: 999, paddingLeft: 16, paddingRight: 48, backgroundColor: 'rgba(0,0,0,0.25)', color: '#ffffff' },
  sendBtn: { position: 'absolute', right: 6, top: 6, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1173d4', alignItems: 'center', justifyContent: 'center' },
  tapZones: { position: 'absolute', inset: 0 as any, flexDirection: 'row' },
});


