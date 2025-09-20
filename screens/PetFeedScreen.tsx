import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Image, LayoutAnimation, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FOODS, PetInventory, PetStats, FoodKey, loadPetInventory, loadPetState, savePetInventory, savePetState, feedWithFood, loadCoins, saveCoins, FOOD_PACK_COST, purchaseFoodPack, loadPetNutrition, savePetNutrition } from '../services/pet';
import { useNavigation } from '@react-navigation/native';

export default function PetFeedScreen() {
  const nav = useNavigation<any>();
  const [pet, setPet] = useState<PetStats | null>(null);
  const [inv, setInv] = useState<PetInventory | null>(null);
  const [eatingIcon, setEatingIcon] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [nutrition, setNutrition] = useState<{ hydration: number; protein: number; carbs: number; vitamins: number } | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current; // -1 .. 1
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const [s, i, c, n] = await Promise.all([loadPetState(), loadPetInventory(), loadCoins(), loadPetNutrition()]);
      setPet(s);
      setInv(i);
      setCoins(c);
      setNutrition(n);
    })();
  }, []);

  useEffect(() => { if (pet) savePetState(pet); }, [pet]);
  useEffect(() => { if (inv) savePetInventory(inv); }, [inv]);

  const onFeed = (key: FoodKey) => {
    if (!pet || !inv) return;
    const { state, inventory } = feedWithFood(pet, inv, key);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPet(state);
    setInv(inventory);
    const emoji = FOODS.find((f) => f.key === key)?.emoji || '🍽️';
    setEatingIcon(emoji);
    iconOpacity.stopAnimation();
    iconOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(iconOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(iconOpacity, { toValue: 0, duration: 850, useNativeDriver: true }),
    ]).start(() => setEatingIcon(null));

    // Pet animation: eat keyframes
    rot.stopAnimation();
    scale.stopAnimation();
    rot.setValue(0);
    scale.setValue(1);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(rot, { toValue: -1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();

    // Update nutrition profile
    try {
      const f = FOODS.find((x) => x.key === key);
      if (f && nutrition) {
        const nextN = {
          hydration: clamp100(nutrition.hydration + (f.nutrition.hydration || 0)),
          protein: clamp100(nutrition.protein + (f.nutrition.protein || 0)),
          carbs: clamp100(nutrition.carbs + (f.nutrition.carbs || 0)),
          vitamins: clamp100(nutrition.vitamins + (f.nutrition.vitamins || 0)),
        } as any;
        setNutrition(nextN);
        savePetNutrition(nextN);
      }
    } catch {}
  };

  if (!pet || !inv || !nutrition) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
        </Pressable>
        <Text style={styles.title}>Alimentar a {pet.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialIcons name={'monetization-on'} size={20} color={'#22c55e'} />
          <Text style={{ fontWeight: '900' }}>{coins}</Text>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
        <Animated.View style={[styles.avatarWrap, { transform: [{ scale }, { rotate: rot.interpolate({ inputRange: [-1, 1], outputRange: ['-5deg', '5deg'] }) }] }]}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCxxq5x5uaULVst4mcVkpVakAB4Qd26kxrxWqmIFtkU5T6snbvtIjyFnOE1G_kuGIvAJutsrh2RkICHhTNKtCLMmkNWNcePOX7woqPir7thCGc9gdYaAoNsOxHTbzAA3rluurIXwcrLhyauheZXzaBug5Wi3SqO9vE8IRlXEQ0IzbfqSYvA4poRPrklfxt6RFh8DWpvtTpMztfnzMjH_kpqgTkCbghrOk0kI9B8Z-f3VTXiM5ikBPnqvDmP_IpmYTZJVg7EDYFanXb' }}
            style={styles.avatar}
          />
        </Animated.View>
        {!!eatingIcon && (
          <Animated.Text style={[styles.eatingIcon, { opacity: iconOpacity }]}>{eatingIcon}</Animated.Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontWeight: '900', fontSize: 18 }}>Inventario de Comida</Text>
          <Pressable style={styles.buyBtn} onPress={() => {
            if (!inv) return;
            const res = purchaseFoodPack(inv, coins);
            if (res.ok) {
              setInv(res.inventory);
              setCoins(res.coins);
              saveCoins(res.coins);
            }
          }}>
            <MaterialIcons name={'shopping-cart'} size={18} color={'#111827'} />
            <Text style={{ fontWeight: '800', color: '#111827' }}>Comprar más ({FOOD_PACK_COST})</Text>
          </Pressable>
        </View>
        {/* Nutrition bars */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: '#64748b', marginBottom: 6, fontWeight: '700' }}>Perfil nutricional</Text>
          <Bar label={'Hidratación'} value={nutrition.hydration} color={'#22c55e'} />
          <Bar label={'Proteínas'} value={nutrition.protein} color={'#0ea5e9'} />
          <Bar label={'Carbohidratos'} value={nutrition.carbs} color={'#a855f7'} />
          <Bar label={'Vitaminas'} value={nutrition.vitamins} color={'#f59e0b'} />
        </View>
        <View style={styles.foodGrid}>
          {FOODS.map((f) => (
            <Pressable key={f.key} style={styles.foodItem} onPress={() => onFeed(f.key)}>
              <Text style={{ fontSize: 32 }}>{f.emoji}</Text>
              <Text style={{ fontWeight: '700' }}>{f.label}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>x{inv[f.key]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 12 }}>Selecciona un alimento para dárselo a {pet.name}.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8f6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)' },
  title: { fontWeight: '800', fontSize: 18 },
  avatarWrap: { width: 160, height: 160, borderRadius: 999, overflow: 'hidden', backgroundColor: '#eee' },
  avatar: { width: '100%', height: '100%' },
  eatingIcon: { position: 'absolute', right: 24, bottom: 0, fontSize: 28, opacity: 0.9 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', marginHorizontal: 16 },
  buyBtn: { backgroundColor: 'rgba(43,238,43,0.25)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  foodItem: { width: '30%', minWidth: 96, alignItems: 'center', gap: 4, padding: 8, borderRadius: 12, backgroundColor: 'rgba(43,238,43,0.08)' },
});

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#111827', fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: '#111827', fontWeight: '700' }}>{v}%</Text>
      </View>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden', marginTop: 4 }}>
        <View style={{ width: `${v}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}

function clamp100(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }


