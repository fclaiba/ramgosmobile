import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, TextInput, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';

const DOG_BREEDS = ['Labrador', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'German Shepherd', 'Pug', 'Border Collie'];

export default function PetProfileScreen({ navigation }: any) {
  const { identity, setIdentity, dogGallery } = usePet();
  const [name, setName] = useState(identity.name);
  const [breed, setBreed] = useState(identity.breed);
  const [avatar, setAvatar] = useState(identity.avatarUrl);

  const breeds = useMemo(() => DOG_BREEDS, []);

  function save() {
    setIdentity({ name, breed, avatarUrl: avatar });
    navigation.goBack?.();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={()=>navigation.goBack?.()}><MaterialIcons name={'arrow-back'} size={22} color={'#111827'} /></Pressable>
        <Text style={styles.headerTitle}>Identidad de la Mascota</Text>
        <Pressable style={styles.iconBtn} onPress={save}><MaterialIcons name={'check'} size={22} color={'#111827'} /></Pressable>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ alignItems:'center', gap: 8 }}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={{ color:'#6b7280' }}>Elegí una foto de perro</Text>
          <FlatList
            data={dogGallery}
            keyExtractor={(u)=>u}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={()=>setAvatar(item)}>
                <Image source={{ uri: item }} style={[styles.thumb, avatar===item && styles.thumbActive]} />
              </Pressable>
            )}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} placeholder={'Firulais'} style={styles.input} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Raza</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 8 }}>
            {breeds.map((b) => (
              <Pressable key={b} style={[styles.chip, breed===b && styles.chipActive]} onPress={()=>setBreed(b)}>
                <Text style={[styles.chipText, breed===b && styles.chipTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Guardar</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  thumbActive: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  label: {
    fontWeight: '800',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    color: '#111827',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
  },
});

