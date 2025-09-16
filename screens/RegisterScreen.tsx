import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const BLUE = '#1173d4';

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'consumidor' | 'negocio'>('consumidor');
  const [accepted, setAccepted] = useState(false);

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const isMatching = useMemo(() => password === confirm && confirm.length > 0, [password, confirm]);
  const canSubmit = isEmailValid && isPasswordValid && isMatching && accepted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.roleLabel}>Soy un:</Text>
          <View style={styles.roleRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: role === 'consumidor' }}
              onPress={() => setRole('consumidor')}
              style={[styles.roleCard, role === 'consumidor' && styles.roleCardSelected]}
            >
              <Text style={[styles.roleText, role === 'consumidor' && styles.roleTextSelected]}>Consumidor</Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: role === 'negocio' }}
              onPress={() => setRole('negocio')}
              style={[styles.roleCard, role === 'negocio' && styles.roleCardSelected]}
            >
              <Text style={[styles.roleText, role === 'negocio' && styles.roleTextSelected]}>Negocio</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => setAccepted(v => !v)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]} />
          <Text style={styles.checkboxLabel}>
            Acepto los <Text style={styles.checkboxLink}>Términos y Condiciones</Text>
          </Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={() => navigation.navigate('VerifyEmail', { email })}
          disabled={!canSubmit}
        >
          <Text style={styles.primaryButtonText}>Registrarme</Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>¿Ya tienes cuenta? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLink}>Inicia sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 22,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    paddingRight: 40,
  },
  fieldGroup: {
    marginTop: 8,
  },
  label: {
    marginLeft: 8,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardSelected: {
    borderColor: BLUE,
    boxShadow: '0px 8px 20px rgba(14, 165, 233, 0.2)',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  roleTextSelected: {
    color: BLUE,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  checkboxLink: {
    color: BLUE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    marginTop: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#374151',
  },
  bottomLink: {
    fontSize: 14,
    color: BLUE,
    fontWeight: '700',
  },
});


