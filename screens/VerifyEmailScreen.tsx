import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Main: undefined;
  VerifyEmail: { email: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const BLUE = '#1173d4';

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const email = route.params?.email ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>{'\u2190'}</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Verifica tu correo</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.helperText}>
            Te enviamos un código de 6 dígitos a {email || 'tu correo'}. Ingresa el código para continuar.
          </Text>

          <View style={styles.codeRow}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <TextInput key={idx} style={styles.codeInput} placeholder="-" placeholderTextColor="#9ca3af" keyboardType="number-pad" maxLength={1} />
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={() => navigation.replace('Main')}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>¿No recibiste el código? </Text>
            <Pressable onPress={() => {}}>
              <Text style={styles.bottomLink}>Reenviar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  backIcon: { fontSize: 22, color: '#111827' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: '800', color: '#111827', paddingRight: 40 },
  helperText: { marginTop: 8, fontSize: 14, color: '#4b5563' },
  codeRow: { marginTop: 16, flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  primaryButton: { marginTop: 16, height: 56, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  bottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bottomText: { fontSize: 14, color: '#374151' },
  bottomLink: { fontSize: 14, color: BLUE, fontWeight: '700' },
});


