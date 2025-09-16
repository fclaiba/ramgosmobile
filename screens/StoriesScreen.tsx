import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Dimensions, Pressable, FlatList } from 'react-native';
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
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'close'} size={22} color={'#ffffff'} />
        </Pressable>
        <Text style={styles.headerTitle}>{current.author.name}</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.storyWrap}>
        {current.imageUrl ? (
          <Image source={{ uri: current.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.textStory}><Text style={styles.text}>{current.text}</Text></View>
        )}
        <View style={styles.controls}>
          <Pressable style={styles.flex} onPress={prev} />
          <Pressable style={styles.flex} onPress={next} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8, paddingHorizontal: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  storyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: width, height: width * 16/9 },
  textStory: { width: width, height: width * 16/9, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#ffffff', fontSize: 20, fontWeight: '800', paddingHorizontal: 16, textAlign: 'center' },
  controls: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' },
  flex: { flex: 1 },
});


