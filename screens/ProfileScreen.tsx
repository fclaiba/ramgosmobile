import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';

export default function ProfileScreen() {
  const [name, setName] = useState('Sofia');
  const [email, setEmail] = useState('sofia@example.com');
  const [bio, setBio] = useState('Apasionada por las ofertas y la tecnología.');
  const [editing, setEditing] = useState(false);

  const canSave = name.trim().length >= 2 && /.+@.+\..+/.test(email);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputReadonly]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Tu nombre"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputReadonly]}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="tu@email.com"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textarea, !editing && styles.inputReadonly]}
            value={bio}
            onChangeText={setBio}
            editable={editing}
            multiline
            numberOfLines={4}
            placeholder="Contanos sobre vos"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {!editing ? (
          <Pressable style={styles.primaryButton} onPress={() => setEditing(true)}>
            <Text style={styles.primaryButtonText}>Editar</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              style={[styles.secondaryButton, !canSave && styles.disabled]}
              disabled={!canSave}
              onPress={() => {
                setEditing(false);
                Alert.alert('Perfil actualizado');
              }}
            >
              <Text style={styles.secondaryText}>Guardar</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => setEditing(false)}>
              <Text style={styles.ghostText}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  fieldGroup: { gap: 6 },
  label: { marginLeft: 6, fontSize: 12, fontWeight: '700', color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  inputReadonly: { backgroundColor: '#f9fafb' },
  primaryButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1173d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  secondaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  ghostButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: '#374151', fontSize: 16, fontWeight: '700' },
});


