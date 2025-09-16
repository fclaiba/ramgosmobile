import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { navigate } from '../navigation/navigation';

type Props = {
  open: boolean;
  onClose: () => void;
};

const WIDTH = Math.min(320, Dimensions.get('window').width * 0.8);

export default function SideDrawer({ open, onClose }: Props) {
  const { role, setRole } = useUser();
  const translateX = useRef(new Animated.Value(-WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [open, translateX, backdropOpacity]);

  return (
    <>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <Text style={styles.userName}>Sofia</Text>
          <Text style={styles.userEmail}>sofia@example.com</Text>
        </View>
        {(() => {
          const items: Array<{ icon: string; label: string; action: () => void }> = [
            { icon: 'home', label: 'Home', action: () => navigate('Main') },
          ];
          // Insert Dashboard below Home for non-consumer roles
          if (role !== 'consumer') {
            if (role === 'business') {
              items.push({ icon: 'dashboard', label: 'Dashboard', action: () => navigate('Negocio') });
            } else if (role === 'influencer') {
              items.push({ icon: 'dashboard', label: 'Dashboard', action: () => navigate('Influencer') });
            } else if (role === 'admin') {
              items.push({ icon: 'admin-panel-settings', label: 'Dashboard', action: () => navigate('Admin') });
            }
          }
          items.push(
            { icon: 'sell', label: 'Bonos', action: () => navigate('MyCoupons') },
            { icon: 'event', label: 'Eventos', action: () => navigate('MyEvents') },
            { icon: 'storefront', label: 'Marketplace', action: () => navigate('MyMarket') },
            { icon: 'receipt', label: 'Transacciones', action: () => navigate('TransactionsHistory') },
            { icon: 'person', label: 'Perfil', action: () => navigate('Profile') },
            { icon: 'settings', label: 'Configuración', action: () => {} },
            { icon: 'logout', label: 'Cerrar sesión', action: () => {} },
          );
          return items;
        })().map((item) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              item.action();
              onClose();
            }}
          >
            <MaterialIcons name={item.icon as any} size={20} color="#374151" />
            <Text style={styles.menuText}>{item.label}</Text>
          </Pressable>
        ))}

        <View style={styles.devBlock}>
          <Text style={styles.devTitle}>Cambiar rol (dev): {role}</Text>
          <View style={styles.roleRow}>
            {[
              { label: 'Consumidor', value: 'consumer' },
              { label: 'Negocio', value: 'business' },
              { label: 'Influencer', value: 'influencer' },
              { label: 'Admin', value: 'admin' },
            ].map((r) => (
              <Pressable
                key={r.value}
                accessibilityLabel={`Cambiar a rol ${r.label}`}
                style={[styles.rolePill, role === (r.value as any) && styles.rolePillActive]}
                onPress={() => {
                  // Solo cambia el rol; no navegamos automáticamente
                  setRole(r.value as any);
                  onClose();
                }}
              >
                <Text style={[styles.rolePillText, role === (r.value as any) && styles.rolePillTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.devTitle, { marginTop: 8 }]}>Usuario (dev)</Text>
          <View style={styles.roleRow}>
            {[
              { label: 'Yo', value: 'u_me' },
              { label: 'Sofía', value: 'u1' },
              { label: 'Max', value: 'u2' },
              { label: 'Luna', value: 'u3' },
            ].map((u) => (
              <Pressable key={u.value} style={styles.rolePill} onPress={() => { /* consumer of useUser can set against provider if needed */ }}>
                <Text style={styles.rolePillText}>{u.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: WIDTH,
    backgroundColor: '#ffffff',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: { marginBottom: 16 },
  userName: { color: '#111827', fontWeight: '700' },
  userEmail: { color: '#6b7280', fontSize: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuText: { color: '#374151', fontWeight: '600' },
  devBlock: { marginTop: 16, gap: 8 },
  devTitle: { color: '#6b7280', fontSize: 12 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rolePill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db' },
  rolePillActive: { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' },
  rolePillText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  rolePillTextActive: { color: '#0ea5e9' },
});


