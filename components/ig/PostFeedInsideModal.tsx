import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { PostCard, PostLike } from './PostCard';
import { MaterialIcons } from '@expo/vector-icons';

export function PostFeedInsideModal({ posts, startIndex, onClose }: { posts: PostLike[]; startIndex: number; onClose: () => void }) {
  const listRef = useRef<FlatList<PostLike> | null>(null);
  const [index, setIndex] = useState(startIndex);
  useEffect(() => { listRef.current?.scrollToIndex?.({ index: startIndex, animated: false }); }, [startIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems?.[0];
    if (first && Number.isInteger(first.index)) setIndex(first.index);
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(p) => p.id}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        renderItem={({ item }) => <PostCard post={item} />}
      />
      <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 50 }}>
        <Pressable onPress={onClose} style={{ padding: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <MaterialIcons name={'close'} size={22} color={'#ffffff'} />
        </Pressable>
      </View>
    </View>
  );
}


