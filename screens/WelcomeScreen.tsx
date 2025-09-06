import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const ORANGE = '#f97316';

export default function WelcomeScreen({ navigation }: Props) {
  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          accessibilityLabel="Logotipo de la aplicación"
          source={require('../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Tu compañero de confianza.</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityLabel="Registrarme en la aplicación"
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryButtonText}>Registrarme</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Iniciar sesión en mi cuenta"
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Explorar la aplicación como invitado"
          onPress={() => {}}
          style={styles.guestButton}
        >
          <Text style={styles.guestText}>Explorar como invitado</Text>
        </Pressable>

        <Text style={styles.legalText}>
          Al continuar, aceptas nuestros{' '}
          <Text
            style={styles.legalLink}
            onPress={() => handleOpenUrl('https://example.com/terminos')}
          >
            Términos de Servicio
          </Text>{' '}
          y{' '}
          <Text
            style={styles.legalLink}
            onPress={() => handleOpenUrl('https://example.com/privacidad')}
          >
            Política de Privacidad
          </Text>
          .
        </Text>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: '700',
  },
  guestButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  legalText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  legalLink: {
    color: '#374151',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});


