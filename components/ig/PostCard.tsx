import React from 'react';
import { View, Text, Image } from 'react-native';
import { useWindowUnits } from './units';

export type PostLike = {
  id: string;
  imageUrl: string;
  text?: string;
  likes?: number;
  author?: { name?: string; handle?: string };
};

export function PostCard({ post }: { post: PostLike }) {
  const { vh, rem } = useWindowUnits();
  return (
    <View style={{ minHeight: vh(100), paddingBottom: rem(2) }}>
      <View style={{ alignItems: 'center' }}>
        <Image source={{ uri: post.imageUrl }} style={{ width: '100%', aspectRatio: 1, backgroundColor: '#111' }} />
      </View>
      <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center', paddingHorizontal: rem(1) }}>
        <Text style={{ color: '#fff', fontSize: rem(1.1), fontWeight: '800' }}>
          {post.author?.name || 'Usuario'} <Text style={{ color: '#ddd' }}>@{post.author?.handle || 'usuario'}</Text>
        </Text>
        {!!post.text && <Text style={{ color: '#ddd', marginTop: rem(0.5), fontSize: rem(1) }}>{post.text}</Text>}
      </View>
    </View>
  );
}


