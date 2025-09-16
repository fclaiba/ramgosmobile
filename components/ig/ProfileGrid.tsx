import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { useWindowUnits } from './units';

export function ProfileGrid({ images, onPress }: { images: string[]; onPress: (index: number) => void }) {
  const { width } = useWindowUnits();
  const gap = 2;
  const padding = 16;
  const tile = Math.floor((width - padding * 2 - gap * 2) / 3);
  return (
    <View style={{ paddingHorizontal: padding }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {images.map((src, i) => (
          <Pressable key={i} onPress={() => onPress(i)}>
            <Image source={{ uri: src }} style={{ width: tile, height: tile, borderRadius: 6, backgroundColor: '#e5e7eb' }} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}


