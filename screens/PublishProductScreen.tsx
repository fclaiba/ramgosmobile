import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, Image, Platform, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, NewProductInput } from '../services/products';

const PRIMARY = '#4f46e5';

export default function PublishProductScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [currency] = useState('USD');
  const [category, setCategory] = useState<'Ropa'|'Electrónica'|'Hogar'|'Juguetes'|'Libros'|'Deportes' | ''>('');
  const [condition, setCondition] = useState<'new'|'used'|'refurbished'|''>('');
  const [shipping, setShipping] = useState<'free'|'paid'|''>('');
  const [location, setLocation] = useState('Centro');
  const [coordinate] = useState({ latitude: -34.6037, longitude: -58.3816 });

  const canPublish = useMemo(() => {
    const tlen = title.trim().length;
    const dlen = description.trim().length;
    const priceNum = Number(price);
    return images.length > 0 && tlen >= 5 && tlen <= 100 && dlen >= 50 && priceNum > 0 && !!category && !!condition && !!shipping;
  }, [images, title, description, price, category, condition, shipping]);

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso requerido', 'Habilita el acceso a fotos para continuar.'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images, selectionLimit: 5 });
      if (!res.canceled) {
        const uris = (res.assets || []).slice(0, 5).map((a) => a.uri);
        setImages((prev) => [...prev, ...uris].slice(0, 5));
      }
    } catch (e) {
      // no-op
    }
  };

  const publish = () => {
    if (!canPublish) return;
    const input: NewProductInput = {
      title: title.trim(),
      description: description.trim(),
      images: images.length ? images : ['https://picsum.photos/1200/800'],
      price: Number(price),
      condition: condition as any,
      location,
      ratingAvg: 0 as any, // not used in input
      ratingCount: 0 as any, // not used in input
      category: category as any,
      shipping: shipping as any,
      coordinate,
    } as unknown as NewProductInput;
    const p = createProduct(input);
    Alert.alert('Publicado', 'Tu producto fue publicado correctamente.');
    // @ts-ignore
    (global as any).NAVIGATE?.('ProductDetail', { id: p.id });
  };

  const saveDraft = () => {
    Alert.alert('Borrador guardado', 'Guardaremos borradores cuando conectemos el backend.');
  };

  const previewPublic = () => {
    Alert.alert('Previsualización', 'Mostraremos previsualización pública en una iteración próxima.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Publicar un producto</Text>
        </View>

        <Text style={styles.sectionTitle}>Imágenes</Text>
        <Text style={styles.sectionSub}>Añade hasta 5 fotos de tu producto. La primera foto será la portada.</Text>
        <View style={styles.dropArea}>
          {images.length === 0 ? (
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name={'add-photo-alternate'} size={48} color={'#94a3b8'} />
              <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 8, textAlign: 'center' }}>Arrastra y suelta o haz clic para añadir fotos</Text>
              <Text style={{ color: '#64748b', marginTop: 4 }}>JPG o PNG de hasta 5MB.</Text>
              <Pressable style={styles.btnSecondary} onPress={pickImages}><Text style={styles.btnSecondaryText}>Seleccionar fotos</Text></Pressable>
            </View>
          ) : (
            <FlatList
              horizontal
              data={images}
              keyExtractor={(u, i) => `${i}`}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item, index }) => (
                <View style={styles.thumbWrap}>
                  <Image source={{ uri: item }} style={styles.thumb} />
                  <Pressable style={styles.thumbDel} onPress={() => setImages((arr) => arr.filter((_, i) => i !== index))}>
                    <MaterialIcons name={'close'} size={16} color={'#fff'} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Detalles del producto</Text>
        <View style={{ gap: 10 }}>
          <TextInput placeholder={'Título (5-100)'} placeholderTextColor={'#94a3b8'} style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder={'Descripción (≥ 50)'} multiline placeholderTextColor={'#94a3b8'} style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} />
        </View>

        <Text style={styles.sectionTitle}>Precio</Text>
        <View style={styles.priceRow}>
          <Text style={{ color: '#64748b' }}>$</Text>
          <TextInput keyboardType={'numeric'} value={price} onChangeText={setPrice} style={[styles.input, { flex: 1, marginVertical: 0 }]} />
          <Text style={{ color: '#64748b' }}>{currency}</Text>
        </View>
        <Text style={{ color: '#94a3b8', marginTop: 4 }}>Máximo 2 decimales.</Text>

        <Text style={styles.sectionTitle}>Categoría</Text>
        <View style={styles.pillsRow}>
          {(['Ropa','Electrónica','Hogar','Juguetes','Libros','Deportes'] as const).map((c) => (
            <Pressable key={c} style={[styles.pill, category === c && styles.pillActive]} onPress={() => setCategory(c)}><Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text></Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Condición</Text>
        <View style={styles.pillsRow}>
          {(['new','used','refurbished'] as const).map((c) => (
            <Pressable key={c} style={[styles.pill, condition === c && styles.pillActive]} onPress={() => setCondition(c)}>
              <Text style={[styles.pillText, condition === c && styles.pillTextActive]}>{c === 'new' ? 'Nuevo' : c === 'used' ? 'Usado' : 'Reacondicionado'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Envío</Text>
        <View style={styles.pillsRow}>
          {(['free','paid'] as const).map((s) => (
            <Pressable key={s} style={[styles.pill, shipping === s && styles.pillActive]} onPress={() => setShipping(s)}>
              <Text style={[styles.pillText, shipping === s && styles.pillTextActive]}>{s === 'free' ? 'Envío gratis' : 'Envío pago'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Opciones de publicación</Text>
        <View style={{ gap: 10 }}>
          <Pressable disabled={!canPublish} style={[styles.btnPrimary, !canPublish && { opacity: 0.5 }]} onPress={publish}><Text style={styles.btnPrimaryText}>Publicar ahora</Text></Pressable>
          <Pressable style={styles.btnGhost} onPress={saveDraft}><Text style={styles.btnGhostText}>Guardar como borrador</Text></Pressable>
          <Pressable style={styles.btnGhost} onPress={previewPublic}><Text style={styles.btnGhostText}>Previsualizar públicamente</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sectionTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: '#0f172a', paddingHorizontal: 16 },
  sectionSub: { color: '#64748b', paddingHorizontal: 16, marginTop: 4 },
  dropArea: { margin: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: '#0ea5e9' },
  btnSecondaryText: { color: '#ffffff', fontWeight: '800' },
  input: { backgroundColor: '#f1f5f9', color: '#0f172a', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginHorizontal: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#e0f2fe', borderColor: '#93c5fd' },
  pillText: { color: '#0f172a', fontWeight: '700' },
  pillTextActive: { color: PRIMARY },
  btnPrimary: { marginHorizontal: 16, height: 48, borderRadius: 999, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#ffffff', fontWeight: '800' },
  btnGhost: { marginHorizontal: 16, height: 48, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  btnGhostText: { color: '#0f172a', fontWeight: '800' },
  thumbWrap: { width: 96, height: 96, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbDel: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
});
