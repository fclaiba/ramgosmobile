import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, Image, Text, Pressable, Modal, Dimensions, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type MediaType = 'image' | 'video';

export type HighlightStory = {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  duration: number; // ms
  timestamp: string;
};

export type Highlight = {
  id: string;
  title: string;
  coverImage: string;
  stories: HighlightStory[];
  updatedAt: string;
};

// Mock data
export const MOCK_HIGHLIGHTS: Highlight[] = Array.from({ length: 6 }, (_, h) => ({
  id: `highlight_${h+1}`,
  title: ['Viajes','Locales','Clientes','Backstage','Equipo','Eventos'][h%6],
  coverImage: `https://images.unsplash.com/photo-15${(h%9)+10}9${(h%7)+10}0${(h%5)+10}?q=80&w=600&auto=format&fit=crop`,
  updatedAt: new Date(Date.now() - h*3600_000).toISOString(),
  stories: Array.from({ length: 4 + (h%3) }, (_, i) => ({
    id: `story_${h+1}_${i+1}`,
    mediaType: 'image',
    mediaUrl: `https://images.unsplash.com/photo-15${(i%9)+10}5${(i%7)+10}0${(i%5)+10}?q=80&w=1200&auto=format&fit=crop`,
    duration: 5000,
    timestamp: new Date(Date.now() - (i+h)*3600_000).toISOString(),
  })),
}));

// Hook for viewer state
export function useHighlightViewerState() {
  const [isOpen, setOpen] = useState(false);
  const [currentHighlight, setHighlight] = useState<Highlight | null>(null);
  const [index, setIndex] = useState(0);

  const open = (h: Highlight, startIndex = 0) => { setHighlight(h); setIndex(startIndex); setOpen(true); };
  const close = () => { setOpen(false); setTimeout(()=>{ setHighlight(null); setIndex(0); }, 200); };
  const advance = () => setIndex((i) => Math.min((currentHighlight?.stories.length || 1) - 1, i + 1));
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return { isOpen, currentHighlight, index, open, close, advance, back, setIndex };
}

export function StoryProgress({ count, activeIndex, progress }: { count: number; activeIndex: number; progress: number }) {
  return (
    <View style={{ position:'absolute', top: 8, left: 8, right: 8, flexDirection:'row', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.3)' }}>
          <View style={{ width: `${i < activeIndex ? 100 : i === activeIndex ? progress*100 : 0}%`, height: '100%', borderRadius: 999, backgroundColor: '#ffffff' }} />
        </View>
      ))}
    </View>
  );
}

export function HighlightCarousel({ highlights, onOpen, onEdit }: { highlights: Highlight[]; onOpen: (h: Highlight)=>void; onEdit?: (h: Highlight)=>void }) {
  const itemSize = 92;
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 2, gap: 12 }}
      data={highlights}
      keyExtractor={(h)=>h.id}
      renderItem={({ item }) => (
        <Pressable onPress={()=>onOpen(item)} onLongPress={()=>onEdit?.(item)}>
          <View style={{ alignItems:'center', width: itemSize }}>
            <Image source={{ uri: item.coverImage }} style={{ width: 68, height: 68, borderRadius: 999, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#e5e7eb' }} />
            <Text style={{ marginTop: 6, maxWidth: 72, textAlign:'center', color:'#374151', fontSize: 12, fontWeight:'700' }} numberOfLines={1}>{item.title}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

export function HighlightViewer({ state }: { state: ReturnType<typeof useHighlightViewerState> }) {
  const { isOpen, currentHighlight, index, close, setIndex } = state;
  const { width, height } = Dimensions.get('window');
  const progress = useRef(new Animated.Value(0)).current;

  const resetProgress = useCallback((durationMs: number) => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: durationMs, easing: Easing.linear, useNativeDriver: false }).start(({ finished }) => {
      if (finished) setIndex((i) => {
        const total = currentHighlight?.stories.length || 0;
        if (i + 1 < total) return i + 1;
        close();
        return i;
      });
    });
  }, [progress, setIndex, currentHighlight, close]);

  useEffect(() => {
    if (!isOpen || !currentHighlight) return;
    const story = currentHighlight.stories[index];
    resetProgress(story.duration);
    // Prefetch next
    const next = currentHighlight.stories[index+1]?.mediaUrl;
    if (next) Image.prefetch(next);
    return () => { progress.stopAnimation(); };
  }, [isOpen, index, currentHighlight, resetProgress, progress]);

  if (!isOpen || !currentHighlight) return null as any;
  const story = currentHighlight.stories[index];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.92)' }}>
        <StoryProgress count={currentHighlight.stories.length} activeIndex={index} progress={(progress as any)._value ?? 0} />
        <View style={{ position:'absolute', top: 8, right: 8 }}>
          <Pressable onPress={close} style={{ padding: 8, borderRadius: 999, backgroundColor:'rgba(255,255,255,0.2)' }}>
            <MaterialIcons name={'close'} size={22} color={'#ffffff'} />
          </Pressable>
        </View>
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <Image source={{ uri: story.mediaUrl }} style={{ width: width, height: height, resizeMode:'contain' }} />
        </View>
        {/* Tap zones */}
        <View style={{ position:'absolute', inset:0, flexDirection:'row' }}>
          <Pressable style={{ flex:1 }} onPress={()=>setIndex((i)=>Math.max(0, i-1))} />
          <Pressable style={{ flex:1 }} onPress={()=>setIndex((i)=>{ const total=currentHighlight.stories.length; if (i+1<total) return i+1; close(); return i; })} />
        </View>
      </View>
    </Modal>
  );
}
