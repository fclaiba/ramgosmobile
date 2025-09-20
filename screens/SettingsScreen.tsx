import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, ScrollView, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { navigate } from '../navigation/navigation';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'Español' | 'English'>('Español');
  const [currency, setCurrency] = useState<'USD ($)' | 'EUR (€)'>('USD ($)');

  const devices = useMemo(() => [
    { id: 'd1', name: 'iPhone 14 Pro', meta: 'Madrid, España - Sesión actual' },
    { id: 'd2', name: 'MacBook Pro', meta: 'Barcelona, España - Hace 2 horas' },
    { id: 'd3', name: 'PC de Escritorio', meta: 'Valencia, España - Hace 3 días' },
  ], []);

  return (
    <SafeAreaView style={styles.safe}> 
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#111827'} /></Pressable>
        <Text style={styles.headerTitle}>Perfil y Configuración</Text>
        <Pressable style={styles.iconBtn}><MaterialIcons name={'more-vert'} size={22} color={'#111827'} /></Pressable>
      </View>

      <View style={styles.tabsRow}>
        {['Cuenta','Seguridad','Notificaciones','Privacidad'].map((t, i) => (
          <Pressable key={t} style={[styles.tabItem, i===0 && styles.tabActive]}>
            <Text style={[styles.tabText, i===0 && styles.tabActiveText]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Perfil */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=21' }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>Nombre de Usuario</Text>
              <Text style={styles.handle}>@nombredeusuario</Text>
              <Text style={styles.meta}>Miembro desde: 12 de Enero, 2023</Text>
            </View>
          </View>
          <Pressable style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Cambiar foto de perfil</Text></Pressable>
          <Pressable style={[styles.primaryBtn, { backgroundColor:'#111827' }]} onPress={()=>navigate('PetProfile')}>
            <Text style={styles.primaryBtnText}>Personalizar mascota</Text>
          </Pressable>
        </View>

        {/* Verificación de Identidad */}
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Verificación de Identidad</Text>
          <View style={styles.verifyItem}>
            <View style={styles.verifyLeft}>
              <MaterialIcons name={'check-circle'} size={20} color={'#22c55e'} />
              <View>
                <Text style={styles.verifyTitle}>Paso 1: Email verificado</Text>
                <Text style={styles.verifyMeta}>correo@ejemplo.com</Text>
              </View>
            </View>
            <Pressable><Text style={styles.link}>Cambiar</Text></Pressable>
          </View>
          <View style={styles.verifyItem}>
            <View style={styles.verifyLeft}>
              <MaterialIcons name={'check-circle'} size={20} color={'#22c55e'} />
              <View>
                <Text style={styles.verifyTitle}>Paso 2: Teléfono verificado</Text>
                <Text style={styles.verifyMeta}>+1 234 567 890</Text>
              </View>
            </View>
            <Pressable><Text style={styles.link}>Cambiar</Text></Pressable>
          </View>
          <View style={[styles.verifyItem, { backgroundColor:'#fff7ed', borderColor:'#fed7aa' }]}>
            <View style={styles.verifyLeft}>
              <MaterialIcons name={'pending'} size={20} color={'#f59e0b'} />
              <View>
                <Text style={[styles.verifyTitle, { color:'#9a3412' }]}>Paso 3: Documento de identidad</Text>
                <Text style={[styles.verifyMeta, { color:'#b45309' }]}>Verificación pendiente</Text>
              </View>
            </View>
            <Pressable><Text style={styles.link}>Completar</Text></Pressable>
          </View>
        </View>

        {/* Preferencias */}
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Preferencias Granulares</Text>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Modo oscuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={darkMode ? '#ffffff' : '#ffffff'} trackColor={{ true:'#1173d4', false:'#e5e7eb' }} />
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Idioma</Text>
            <Pressable style={styles.prefAction}><Text style={styles.prefActionText}>{language}</Text><MaterialIcons name={'arrow-drop-down'} size={18} color={'#6b7280'} /></Pressable>
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Moneda</Text>
            <Pressable style={styles.prefAction}><Text style={styles.prefActionText}>{currency}</Text><MaterialIcons name={'arrow-drop-down'} size={18} color={'#6b7280'} /></Pressable>
          </View>
        </View>

        {/* Seguridad avanzada */}
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Seguridad Avanzada</Text>
          {[
            { icon:'two-sv-plus', label:'Autenticación de Dos Factores (2FA)' },
            { icon:'api', label:'Gestión de Claves API' },
            { icon:'devices', label:'Dispositivos y Sesiones Activas' },
            { icon:'fingerprint', label:'Logs de Acceso' },
          ].map((item) => (
            <Pressable key={item.label} style={styles.navRow}>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                <MaterialIcons name={item.icon as any} size={20} color={'#6b7280'} />
                <Text style={styles.navText}>{item.label}</Text>
              </View>
              <MaterialIcons name={'chevron-right'} size={20} color={'#9ca3af'} />
            </Pressable>
          ))}
        </View>

        {/* Historial de dispositivos */}
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Historial de Dispositivos Conectados</Text>
          {devices.map((d) => (
            <View key={d.id} style={styles.deviceRow}>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 12 }}>
                <MaterialIcons name={d.name.toLowerCase().includes('iphone') ? 'phone-iphone' : d.name.toLowerCase().includes('mac') ? 'laptop-mac' : 'desktop-windows'} size={20} color={'#374151'} />
                <View>
                  <Text style={styles.deviceName}>{d.name}</Text>
                  <Text style={styles.deviceMeta}>{d.meta}</Text>
                </View>
              </View>
              <Pressable><Text style={{ color:'#dc2626', fontWeight:'700' }}>Cerrar Sesión</Text></Pressable>
            </View>
          ))}
          <View style={{ alignItems:'center', marginTop: 8 }}>
            <Pressable><Text style={styles.link}>Ver historial completo</Text></Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  iconBtn: { padding: 8, borderRadius: 999 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  tabsRow: { flexDirection:'row', borderBottomWidth: 1, borderColor:'#e5e7eb' },
  tabItem: { flex:1, alignItems:'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight:'700', color:'#6b7280' },
  tabActive: { borderBottomWidth: 2, borderColor: '#1173d4' },
  tabActiveText: { color:'#1173d4' },
  avatar: { width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: '#ffffff' },
  name: { color:'#111827', fontSize: 20, fontWeight:'800' },
  handle: { color:'#6b7280', fontSize: 13 },
  meta: { color:'#9ca3af', fontSize: 12, marginTop: 2 },
  primaryBtn: { height: 42, borderRadius: 10, backgroundColor:'#1173d4', alignItems:'center', justifyContent:'center' },
  primaryBtnText: { color:'#ffffff', fontWeight:'800' },
  sectionTitle: { color:'#111827', fontWeight:'800', fontSize: 16 },
  verifyItem: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 12, backgroundColor:'#f3f4f6', borderRadius: 12, borderWidth: 1, borderColor:'#e5e7eb' },
  verifyLeft: { flexDirection:'row', alignItems:'center', gap: 12 },
  verifyTitle: { color:'#111827', fontWeight:'800' },
  verifyMeta: { color:'#6b7280', fontSize: 12 },
  link: { color:'#1173d4', fontWeight:'800' },
  prefRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 12, backgroundColor:'#ffffff', borderRadius: 12, borderWidth: 1, borderColor:'#e5e7eb' },
  prefLabel: { color:'#374151', fontWeight:'700' },
  prefAction: { flexDirection:'row', alignItems:'center', gap: 2 },
  prefActionText: { color:'#6b7280' },
  navRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 14, backgroundColor:'#ffffff', borderRadius: 12, borderWidth: 1, borderColor:'#e5e7eb' },
  navText: { color:'#111827', fontWeight:'700' },
  deviceRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 14, backgroundColor:'#ffffff', borderRadius: 12, borderWidth: 1, borderColor:'#e5e7eb' },
  deviceName: { color:'#111827', fontWeight:'800' },
  deviceMeta: { color:'#6b7280', fontSize: 12 },
});


