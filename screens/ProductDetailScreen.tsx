import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ImageBackground, FlatList, ScrollView, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { getProductById, Product } from '../services/products';
import { createEscrow } from '../services/escrow';

type RootParam = { ProductDetail: { id: string } };

const PRIMARY = '#1173d4';

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootParam, 'ProductDetail'>>();
  const nav = useNavigation<any>();
  const product: Product | undefined = useMemo(() => getProductById(route.params?.id), [route.params?.id]);
  const [favorite, setFavorite] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'info' | 'specs' | 'qa'>('info');

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#0f172a' }}>Producto no encontrado</Text>
      </SafeAreaView>
    );
  }

  const images = product.images.length > 0 ? product.images : ['https://picsum.photos/800/600'];

  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
        <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
      </Pressable>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable style={styles.iconBtn} onPress={() => setFavorite((v) => !v)}>
          <MaterialIcons name={favorite ? ('favorite' as any) : ('favorite-border' as any)} size={22} color={favorite ? '#ef4444' : '#111827'} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Compartir', 'Función de compartir próximamente') }>
          <MaterialIcons name={'share'} size={22} color={'#111827'} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <MaterialIcons name={'more-vert'} size={22} color={'#111827'} />
        </Pressable>
      </View>
    </View>
  );

  const Stars = ({ value }: { value: number }) => {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const arr = Array.from({ length: 5 }, (_, i) => (i < full ? 'full' : i === full && half ? 'half' : 'empty'));
    return (
      <View style={{ flexDirection: 'row' }}>
        {arr.map((t, i) => (
          <MaterialIcons key={i} name={t === 'full' ? ('star' as any) : t === 'half' ? ('star-half' as any) : ('star-border' as any)} size={16} color={'#f59e0b'} style={{ marginRight: 2 }} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}> 
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          keyExtractor={(u, i) => `${i}`}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <ImageBackground source={{ uri: item }} style={styles.hero} imageStyle={{ borderRadius: 12 }} />
          )}
          style={{ marginTop: 4 }}
        />

        <View style={styles.block}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.title}>{product.title}</Text>
            {product.condition && (
              <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                <Text style={{ color: '#1d4ed8', fontWeight: '700', fontSize: 12 }}>{product.condition === 'new' ? 'Nuevo' : product.condition === 'used' ? 'Usado' : 'Reacond.'}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.price}>${product.price}</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text numberOfLines={expanded ? 0 : 3} style={styles.desc}>{product.description}</Text>
            <Pressable onPress={() => setExpanded((v) => !v)}>
              <Text style={{ color: PRIMARY, fontWeight: '700', marginTop: 4 }}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.block}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: '#0f172a' }}>Vendedor</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Stars value={product.ratingAvg} />
                <Text style={{ color: '#64748b', fontSize: 12 }}>({product.ratingCount} reseñas)</Text>
              </View>
            </View>
            <Pressable style={styles.contactBtn} onPress={() => Alert.alert('Contactar', 'Abrir chat con el vendedor')}>
              <MaterialIcons name={'chat-bubble-outline'} size={18} color={'#111827'} />
              <Text style={{ color: '#111827', fontWeight: '800' }}>Contactar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>{product.location} (Ubicación aproximada)</Text>
          <View style={{ marginTop: 12, height: 180, borderRadius: 12, overflow: 'hidden' }}>
            {/* Mapa nativo/web con archivos separados para evitar imports nativos en web */}
            {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
            {React.createElement(require('../components/DetailMiniMap').default, { coordinate: product.coordinate })}
          </View>
        </View>

        <View style={{ backgroundColor: '#ffffff', marginTop: 8 }}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
              <Pressable onPress={() => setTab('info')} style={[styles.tabBtn, tab === 'info' && styles.tabBtnActive]}><Text style={[styles.tabText, tab === 'info' && styles.tabTextActive]}>Información</Text></Pressable>
              <Pressable onPress={() => setTab('specs')} style={[styles.tabBtn, tab === 'specs' && styles.tabBtnActive]}><Text style={[styles.tabText, tab === 'specs' && styles.tabTextActive]}>Especificaciones</Text></Pressable>
              <Pressable onPress={() => setTab('qa')} style={[styles.tabBtn, tab === 'qa' && styles.tabBtnActive]}><Text style={[styles.tabText, tab === 'qa' && styles.tabTextActive]}>Preguntas</Text></Pressable>
            </View>
          </View>
          <View style={{ padding: 16 }}>
            {tab === 'info' && (
              <View style={{ gap: 12 }}>
                <Row k={'Marca'} v={product.category} />
                <Row k={'Condición'} v={product.condition} />
                <Row k={'Envío'} v={product.shipping === 'free' ? 'Envío gratis' : 'Envío pago'} />
              </View>
            )}
            {tab === 'specs' && (
              <Text style={{ color: '#64748b' }}>Especificaciones del producto próximamente.</Text>
            )}
            {tab === 'qa' && (
              <Text style={{ color: '#64748b' }}>Sección de preguntas y respuestas próximamente.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerBar}> 
        <Pressable style={styles.buyBtn} onPress={() => {
          const tx = createEscrow({ productId: product.id, title: product.title });
          nav.navigate('EscrowFlow' as any, { id: tx.id } as any);
        }}>
          <Text style={styles.buyText}>Comprar Ahora</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#64748b', fontSize: 14 }}>{k}</Text>
      <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: '700' }}>{String(v)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)' },
  hero: { width: 320, height: 220 },
  block: { backgroundColor: '#ffffff', padding: 16, marginTop: 8 },
  title: { color: '#0f172a', fontWeight: '900', fontSize: 22, flex: 1 },
  price: { color: '#0f172a', fontSize: 28, fontWeight: '900' },
  desc: { color: '#334155', fontSize: 14 },
  contactBtn: { height: 44, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#0f172a', fontWeight: '800', fontSize: 18 },
  tabBtn: { paddingVertical: 14, marginRight: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: PRIMARY },
  tabText: { color: '#6b7280', fontWeight: '700' },
  tabTextActive: { color: PRIMARY },
  footerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  buyBtn: { height: 48, borderRadius: 999, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  buyText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
});


