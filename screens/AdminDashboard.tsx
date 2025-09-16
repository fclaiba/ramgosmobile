import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, useWindowDimensions, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { navigate } from '../navigation/navigation';
import { listPending, listHistory, actOnItem } from '../services/moderation';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// duplicate import removed

type AdminTab = 'home' | 'users' | 'reports' | 'system';
type UserFilter = 'all' | 'active' | 'inactive';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor';
  avatar: string;
  joinedAt: number; // epoch
  status: 'active' | 'inactive' | 'banned';
};

const PRIMARY = '#1173d4';
const now = Date.now();
const USERS: AdminUser[] = [
  {
    id: 'u_admin',
    name: 'Admin Principal',
    email: 'admin@test.com',
    role: 'admin',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdP_a63XUIGxoHopZLVrs3RIIhIAkDdfrvyf1uRPuJ1IA2A8Q0sqzZSB1DAEK6CBh3h3ObcQcAArtHWt94f4wj-Z6X2H9x7BltxIKx9MRiB1svQ3I8ozc2Pe-MAK15J-1aXhiVyO8QI9cEdALvpI1YL6epIP1EUR56JlidhwaE4pljJbzCaHC47HiU8P3rFXDnD2487SdMX5uGPYFYLPwf2am8yxKgngMvsEx8FGXvKDWMuAECXCF0EijkUM-x9_X9Nt7lRp9zNjw',
    joinedAt: now - 2 * 24 * 3600 * 1000,
    status: 'active',
  },
  {
    id: 'u1',
    name: 'User Uno',
    email: 'user1@test.com',
    role: 'user',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArOgHg0U1e9ESaJx3UYoHu5XU6h_Ad3BgoZIHuCTPwR7-AzjVCTNgiHjmX7Q7ubbwCyXtWeQoJWJs7fQoN6EeLLeEA5jHcxTAM7juvSVu1wIwQObQ3vpwGrGeWv7Ei5MnjvcJzCMOoFWq-RucRgngr17F-NP4V4p6VkbpjJW-8mx9QHeOlLOU9syIoEqqztDdqVvEoXfN_gUv4-lxUtBENCErGQ_HXFqsd1z1LpQrmAS4kMED_oHPyHxk9p4V6j7uNGvWn2KVQvIfJ',
    joinedAt: now - 5 * 24 * 3600 * 1000,
    status: 'inactive',
  },
  {
    id: 'u2',
    name: 'User Dos',
    email: 'user2@test.com',
    role: 'user',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn2h7YthfbOM2RnqMkKmRE1dYth-LgOejX2G-M8s7c16CT7a0JqLEZJZaxG_bILxtGIihofmJKKlgyl_jSF12QiMACrdE-YTDwC102X2H7D7t2e5c_yOeE94A80KOgylZqrDrpfGi_AdQ5aoHCrYOCvsz86pMz9tGVZQUeyerNabwSlCLFRHKv8-bYR4-oUnvtl30rcGgzOWOTjqFqhjOXm52h9Tb-bIg1-5hoB9vXpzlXKRA67qFu-GhJWW33PpH-DZG0QW8UZJ1v',
    joinedAt: now - 7 * 24 * 3600 * 1000,
    status: 'banned',
  },
  {
    id: 'u3',
    name: 'Editor Tres',
    email: 'editor@test.com',
    role: 'editor',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn2h7YthfbOM2RnqMkKmRE1dYth-LgOejX2G-M8s7c16CT7a0JqLEZJZaxG_bILxtGIihofmJKKlgyl_jSF12QiMACrdE-YTDwC102X2H7D7t2e5c_yOeE94A80KOgylZqrDrpfGi_AdQ5aoHCrYOCvsz86pMz9tGVZQUeyerNabwSlCLFRHKv8-bYR4-oUnvtl30rcGgzOWOTjqFqhjOXm52h9Tb-bIg1-5hoB9vXpzlXKRA67qFu-GhJWW33PpH-DZG0QW8UZJ1v',
    joinedAt: now - 10 * 24 * 3600 * 1000,
    status: 'active',
  },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('home');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [roleFilter, setRoleFilter] = useState<'all'|'admin'|'user'|'editor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'|'banned'>('all');
  const [showCritical, setShowCritical] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  // Reports tab state
  const [minConf, setMinConf] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<'all'|'profile_photo'|'bio'|'comment'|'video'>('all');
  const [searchHandle, setSearchHandle] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { width } = useWindowDimensions();

  const filteredUsers = useMemo(() => {
    return USERS.filter((u) => (
      (filter==='all' || u.status===filter) &&
      (roleFilter==='all' || u.role===roleFilter) &&
      (statusFilter==='all' || u.status===statusFilter)
    ));
  }, [filter, roleFilter, statusFilter]);

  // Moderation derived data
  const pendingFiltered = useMemo(() => {
    const base = listPending({ minConfidence: minConf });
    return base.filter(i => (
      (typeFilter==='all' || i.type===typeFilter) &&
      (!searchHandle.trim() || i.userHandle.toLowerCase().includes(searchHandle.trim().toLowerCase()))
    ));
  }, [minConf, typeFilter, searchHandle, refreshKey]);

  const Header = (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityLabel="Volver al Home"
        onPress={() => navigate('Main')}
        style={styles.navBtn}
      >
        <MaterialIcons name={'arrow-back'} size={24} color={'#111418'} />
      </Pressable>
      <Text style={styles.headerTitle}>Admin Dashboard</Text>
      <Pressable
        accessibilityLabel="Ajustes del sistema"
        onPress={() => setTab('system')}
        style={styles.navBtn}
      >
        <MaterialIcons name={'settings'} size={24} color={'#111418'} />
      </Pressable>
    </View>
  );

  const RecentUsersSection = (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Recent Users</Text>
        <Pressable onPress={() => setTab('users')} accessibilityLabel="Ver todos">
          <Text style={styles.linkText}>View All</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      >
        {(['all', 'active', 'inactive'] as UserFilter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, f === filter ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={f === filter ? styles.chipActiveText : styles.chipText}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ gap: 8 }}>
        {filteredUsers.map((u) => (
          <View key={u.id} style={styles.userCard}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userMeta}>{u.joined}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const ModerationSection = (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={styles.sectionTitle}>Moderation Alerts</Text>
      <View style={{ marginTop: 12, gap: 12 }}>
        <Pressable
          onPress={() => setTab('reports')}
          style={styles.alertCard}
          accessibilityLabel="User Reports - High Priority"
        >
          <View style={[styles.alertIconWrap, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
            <MaterialIcons name={'flag'} size={20} color={'#f43f5e'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>User Reports</Text>
            <Text style={[styles.alertPriority, { color: '#f43f5e' }]}>High Priority</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: '#f43f5e' }]} />
        </Pressable>

        <Pressable
          onPress={() => setTab('reports')}
          style={styles.alertCard}
          accessibilityLabel="Content Review - Medium Priority"
        >
          <View style={[styles.alertIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialIcons name={'description'} size={20} color={'#f59e0b'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Content Review</Text>
            <Text style={[styles.alertPriority, { color: '#f59e0b' }]}>Medium Priority</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
        </Pressable>
      </View>
    </View>
  );

  const QuickReportsSection = (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={styles.sectionTitle}>Quick Reports</Text>
      <View style={{ marginTop: 12, gap: 12 }}>
        <Pressable style={styles.quickRow} onPress={() => setShowCritical(true)} accessibilityLabel="Critical Issues">
          <View style={styles.quickIcon}>
            <MaterialIcons name={'error-outline'} size={18} color={'#475569'} />
          </View>
          <Text style={styles.quickText}>Critical Issues</Text>
          <MaterialIcons name={'chevron-right'} size={20} color={'#94a3b8'} />
        </Pressable>

        <Pressable style={styles.quickRow} onPress={() => setShowSystem(true)} accessibilityLabel="System Status">
          <View style={styles.quickIcon}>
            <MaterialIcons name={'insights'} size={18} color={'#475569'} />
          </View>
          <Text style={styles.quickText}>System Status</Text>
          <MaterialIcons name={'chevron-right'} size={20} color={'#94a3b8'} />
        </Pressable>
      </View>
    </View>
  );

  const HomeTab = (
    <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      {/* Salud del sistema */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text style={styles.sectionTitle}>Salud del Sistema</Text>
        <View style={{ flexDirection:'row', gap: 12, marginTop: 8 }}>
          <View style={{ flex:1, backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 12, padding: 12, alignItems:'center' }}>
            <Text style={{ fontSize: 24, fontWeight:'900', color:'#10b981' }}>99.9%</Text>
            <Text style={[styles.userMeta, { color:'#10b981' }]}>Uptime</Text>
          </View>
          <View style={{ flex:1, backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 12, padding: 12, alignItems:'center' }}>
            <Text style={{ fontSize: 24, fontWeight:'900', color:'#2563eb' }}>125ms</Text>
            <Text style={[styles.userMeta, { color:'#2563eb' }]}>Latencia API</Text>
          </View>
        </View>
      </View>

      {/* Alertas prioritarias */}
      <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
        <Text style={styles.sectionTitle}>Alertas Prioritarias</Text>
        <View style={{ flexDirection:'row', alignItems:'flex-start', gap:12, backgroundColor:'rgba(239,68,68,0.12)', borderRadius:12, padding:12, borderLeftWidth:4, borderLeftColor:'#ef4444' }}>
          <MaterialIcons name={'error'} size={18} color={'#ef4444'} />
          <View style={{ flex:1 }}>
            <Text style={[styles.userName, { color:'#991b1b' }]}>Fallo en el sistema de pagos</Text>
            <Text style={[styles.userMeta, { color:'#991b1b' }]}>Múltiples transacciones fallidas detectadas en los últimos 5 minutos.</Text>
          </View>
        </View>
        <View style={{ flexDirection:'row', alignItems:'flex-start', gap:12, backgroundColor:'rgba(245,158,11,0.12)', borderRadius:12, padding:12, borderLeftWidth:4, borderLeftColor:'#f59e0b' }}>
          <MaterialIcons name={'warning'} size={18} color={'#f59e0b'} />
          <View style={{ flex:1 }}>
            <Text style={[styles.userName, { color:'#92400e' }]}>Pico de carga en servidor</Text>
            <Text style={[styles.userMeta, { color:'#92400e' }]}>El uso de CPU ha superado el 80% durante más de 10 minutos.</Text>
          </View>
        </View>
      </View>

      {/* Tabla de usuarios (resumen) */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Tabla de Usuarios</Text>
          <Pressable style={{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#ffffff', borderWidth:1, borderColor:'#d1d5db', borderRadius:8, paddingHorizontal:10, paddingVertical:6 }}>
            <MaterialIcons name={'download'} size={18} color={'#111418'} />
            <Text style={{ color:'#111418', fontWeight:'800' }}>Exportar</Text>
          </Pressable>
        </View>
        <View style={{ marginTop:8, backgroundColor:'#f3f4f6', borderRadius:12, padding:8 }}>
          {(USERS as AdminUser[]).slice(0,3).map((u)=> (
            <View key={u.id} style={[styles.rowBetween, { backgroundColor:'#ffffff', borderRadius:8, padding:8, marginBottom:6 }]}>
              <View style={{ flex:1 }}>
                <Text style={styles.userName}>{u.email}</Text>
                <Text style={styles.userMeta}>{u.role}</Text>
              </View>
              <View style={[styles.statusPill, u.status==='active'?styles.pillActive:u.status==='banned'?{ backgroundColor:'rgba(244,63,94,0.15)' }:styles.pillInactive]}>
                <Text style={u.status==='active'?styles.pillActiveText:u.status==='banned'?{ color:'#f43f5e', fontWeight:'700', fontSize:12 } as any:styles.pillInactiveText}>{u.status}</Text>
              </View>
              <View style={{ flexDirection:'row', gap:8, marginLeft:8 }}>
                <Pressable><MaterialIcons name={'visibility'} size={18} color={'#374151'} /></Pressable>
                <Pressable><MaterialIcons name={u.status==='banned'?('lock-open' as any):('gavel' as any)} size={18} color={u.status==='banned'?'#16a34a':'#374151'} /></Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Logs */}
      <View style={{ paddingHorizontal:16, marginTop:12 }}>
        <Text style={styles.sectionTitle}>Logs de Actividad en Tiempo Real</Text>
        <View style={{ backgroundColor:'#111827', borderRadius:12, padding:12 }}>
          {[
            '> [2023-10-27 10:30:01] user:admin@test.com action:login status:success',
            '> [2023-10-27 10:30:15] user:admin@test.com action:view_dashboard',
            '> [2023-10-27 10:31:05] user:user1@test.com action:update_profile',
            '> [2023-10-27 10:31:45] system:api action:payment_failed error_code:5003',
            '> [2023-10-27 10:32:00] user:admin@test.com action:ban_user target:user2@test.com',
            '> [2023-10-27 10:32:10] user:user3@test.com action:register status:success',
          ].map((l,i)=> (<Text key={i} style={{ color:'#22c55e', fontFamily:'monospace', fontSize:12 }}>{l}</Text>))}
        </View>
      </View>

      {RecentUsersSection}
      {ModerationSection}
      {QuickReportsSection}
    </ScrollView>
  );

  const UsersTab = (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>All Users</Text>
      <View style={{ height: 8 }} />
      <View style={{ flexDirection:'row', gap: 8, marginBottom: 8 }}>
        {(['all','active','inactive'] as UserFilter[]).map(f => (
          <Pressable key={f} onPress={()=>setFilter(f)} style={[styles.chip, filter===f?styles.chipActive:styles.chipInactive]}>
            <Text style={filter===f?styles.chipActiveText:styles.chipText}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection:'row', gap: 8, marginBottom: 8 }}>
        {(['all','admin','user','editor'] as const).map(r => (
          <Pressable key={r} onPress={()=>setRoleFilter(r)} style={[styles.chip, roleFilter===r?styles.chipActive:styles.chipInactive]}>
            <Text style={roleFilter===r?styles.chipActiveText:styles.chipText}>{r}</Text>
          </Pressable>
        ))}
      </View>
      {(USERS as AdminUser[]).map((u) => (
        <View key={u.id} style={styles.userCard}>
          <Image source={{ uri: u.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{u.name} · {u.email}</Text>
            <Text style={styles.userMeta}>{u.role} · {new Date(u.joinedAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusPill, u.status === 'active' ? styles.pillActive : u.status==='banned' ? { backgroundColor:'rgba(244,63,94,0.15)' } : styles.pillInactive]}>
            <Text style={u.status === 'active' ? styles.pillActiveText : u.status==='banned' ? { color:'#f43f5e', fontWeight:'700', fontSize:12, textTransform:'capitalize' } as any: styles.pillInactiveText}>{u.status}</Text>
          </View>
          <View style={{ flexDirection:'row', gap: 8, marginLeft: 8 }}>
            <Pressable accessibilityLabel="Ver" style={styles.iconBtn}><MaterialIcons name={'visibility'} size={18} color={'#374151'} /></Pressable>
            {u.status!=='banned' ? (
              <Pressable accessibilityLabel="Banear" style={styles.iconBtn}><MaterialIcons name={'gavel'} size={18} color={'#374151'} /></Pressable>
            ) : (
              <Pressable accessibilityLabel="Desbloquear" style={styles.iconBtn}><MaterialIcons name={'lock-open'} size={18} color={'#16a34a'} /></Pressable>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const ReportsTab = (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Moderación de Contenido</Text>
      <View style={{ height: 8 }} />
      <View style={styles.rowBetween}>
        <Text style={styles.userName}>Pendiente de Revisión ({pendingFiltered.length})</Text>
        <Pressable style={styles.filterBtn} onPress={async()=>{
          const rows = [['id','handle','type','reason','confidence'] as string[]].concat(pendingFiltered.map((i:any)=>[i.id,i.userHandle,i.type,i.reason,Math.round(i.confidence*100)+'%']));
          const esc = (s: any) => `"${String(s).replace(/"/g, '""')}"`;
          const csv = rows.map(r => r.map(esc).join(',')).join('\n');
          const uri = `${require('expo-file-system').cacheDirectory}pendientes.csv`;
          await require('expo-file-system').writeAsStringAsync(uri, csv, { encoding: require('expo-file-system').EncodingType.UTF8 });
          await require('expo-sharing').shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar pendientes' });
        }}><MaterialIcons name={'download'} size={18} color={'#111418'} /><Text style={{ fontWeight:'800', color:'#111418' }}>Exportar</Text></Pressable>
      </View>
      <View style={{ marginTop: 8, gap: 8 }}>
        <View style={{ flexDirection:'row', gap: 8, flexWrap:'wrap' }}>
          {(['all','profile_photo','bio','comment','video'] as const).map(t => (
            <Pressable key={t} onPress={()=>setTypeFilter(t)} style={[styles.chip, typeFilter===t?styles.chipActive:styles.chipInactive]}>
              <Text style={typeFilter===t?styles.chipActiveText:styles.chipText}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
          <Text style={styles.userMeta}>Confianza mínima: {Math.round(minConf*100)}%</Text>
          <Slider style={{ flex: 1 }} minimumValue={0} maximumValue={1} step={0.01} value={minConf} minimumTrackTintColor={'#1173d4'} maximumTrackTintColor={'#e5e7eb'} onValueChange={setMinConf as any} />
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
          <MaterialIcons name={'search'} size={18} color={'#64748b'} />
          <TextInput placeholder={'Buscar @handle'} placeholderTextColor={'#94a3b8'} value={searchHandle} onChangeText={setSearchHandle} style={{ flex:1, borderWidth:1, borderColor:'#d1d5db', borderRadius:8, paddingHorizontal:10, paddingVertical:8, color:'#111418' }} />
        </View>
      </View>
      <View style={{ gap: 12, marginTop: 8 }}>
        {pendingFiltered.map((i) => (
          <View key={i.id} style={{ backgroundColor:'#ffffff', borderRadius: 12, borderWidth:1, borderColor:'#e5e7eb' }}>
            <View style={{ padding: 12 }}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.userName}>{(i.type==='profile_photo'?'Foto de perfil':'Biografía') } de {i.userHandle}</Text>
                  <Text style={styles.userMeta}>Reportado por: {i.reason}</Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                  <Text style={{ color: i.confidence>0.5?'#f59e0b':'#ef4444', fontWeight:'800' }}>Confianza: {Math.round(i.confidence*100)}%</Text>
                  <MaterialIcons name={i.confidence>0.5?('verified-user' as any):('report' as any)} size={18} color={i.confidence>0.5?'#f59e0b':'#ef4444'} />
                </View>
              </View>
            </View>
            <View style={{ flexDirection:'row', backgroundColor:'#e5e7eb' }}>
              <View style={{ flex:1, backgroundColor:'#ffffff', padding:8 }}>
                <Text style={{ fontSize:12, fontWeight:'800', color:'#475569', textAlign:'center' }}>Contenido Actual</Text>
                {i.type==='profile_photo' ? (
                  <Image source={{ uri: i.currentContent }} style={{ width:'100%', height:128, borderRadius:8 }} />
                ) : (
                  <Text style={{ color:'#111418' }}>{i.currentContent}</Text>
                )}
              </View>
              <View style={{ flex:1, backgroundColor:'#ffffff', padding:8 }}>
                <Text style={{ fontSize:12, fontWeight:'800', color:'#475569', textAlign:'center' }}>Contenido Sugerido</Text>
                {i.suggestedContent ? (
                  i.type==='profile_photo' ? (
                    <Image source={{ uri: i.suggestedContent }} style={{ width:'100%', height:128, borderRadius:8 }} />
                  ) : (<Text style={{ color:'#111418' }}>{i.suggestedContent}</Text>)
                ) : (
                  <Text style={{ color:'#64748b', textAlign:'center' }}>—</Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-around', padding:8, borderTopWidth:1, borderTopColor:'#e5e7eb', backgroundColor:'#f8fafc' }}>
              <Pressable onPress={()=>{actOnItem({ id: i.id, action:'approve', moderator:'admin' }); setRefreshKey(k=>k+1);}} style={styles.actionBtnGreen}><MaterialIcons name={'check-circle'} size={18} color={'#16a34a'} /><Text style={styles.actionTextGreen}>Aprobar</Text></Pressable>
              <Pressable onPress={()=>{actOnItem({ id: i.id, action:'reject', moderator:'admin' }); setRefreshKey(k=>k+1);}} style={styles.actionBtnRed}><MaterialIcons name={'cancel'} size={18} color={'#ef4444'} /><Text style={styles.actionTextRed}>Rechazar</Text></Pressable>
              <Pressable onPress={()=>{actOnItem({ id: i.id, action:'ban', moderator:'admin' }); setRefreshKey(k=>k+1);}} style={styles.actionBtn}><MaterialIcons name={'gavel'} size={18} color={'#111418'} /><Text style={styles.actionText}>Banear</Text></Pressable>
              <Pressable onPress={()=>{actOnItem({ id: i.id, action:'escalate', moderator:'admin' }); setRefreshKey(k=>k+1);}} style={styles.actionBtnBlue}><MaterialIcons name={'supervisor-account'} size={18} color={'#2563eb'} /><Text style={styles.actionTextBlue}>Escalar</Text></Pressable>
            </View>
          </View>
        ))}
          </View>

      {/* Historial de moderación */}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Historial de Moderación</Text>
        <View style={styles.rowBetween}>
          <View />
          <Pressable style={styles.filterBtn} onPress={async()=>{
            const rows = [['contenido','accion','moderador','fecha'] as string[]].concat(listHistory().map(h=>[h.contentLabel,h.action,h.moderator,new Date(h.decidedAt).toISOString()]));
            const esc = (s: any) => `"${String(s).replace(/"/g, '""')}"`;
            const csv = rows.map(r => r.map(esc).join(',')).join('\n');
            const uri = `${require('expo-file-system').cacheDirectory}historial_moderacion.csv`;
            await require('expo-file-system').writeAsStringAsync(uri, csv, { encoding: require('expo-file-system').EncodingType.UTF8 });
            await require('expo-sharing').shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar historial' });
          }}><MaterialIcons name={'download'} size={18} color={'#111418'} /><Text style={{ fontWeight:'800', color:'#111418' }}>Exportar</Text></Pressable>
        </View>
        <View style={{ backgroundColor:'#ffffff', borderRadius:12, borderWidth:1, borderColor:'#e5e7eb', marginTop:8 }}>
          {listHistory().map((h)=> (
            <View key={h.id} style={[styles.rowBetween, { padding:12, borderBottomWidth:1, borderBottomColor:'#e5e7eb' }]}>
              <View style={{ flex:1 }}>
                <Text style={styles.userName}>{h.contentLabel}</Text>
                <Text style={styles.userMeta}>{new Date(h.decidedAt).toLocaleString()}</Text>
              </View>
              <View style={[styles.statusPill, h.action==='approve'?styles.pillActive:h.action==='reject'?{ backgroundColor:'rgba(239,68,68,0.15)' }:h.action==='ban'?{ backgroundColor:'#e5e7eb' }:{ backgroundColor:'rgba(59,130,246,0.15)' }]}>
                <Text style={[styles.userMeta, { fontWeight:'800', color: h.action==='approve'?'#10b981':h.action==='reject'?'#ef4444':h.action==='ban'?'#111418':'#2563eb' }]}>{h.action==='approve'?'Aprobado':h.action==='reject'?'Rechazado':h.action==='ban'?'Usuario Baneado':'Escalado'}</Text>
          </View>
              <Text style={[styles.userMeta, { marginLeft: 8 }]}>{h.moderator}</Text>
          </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const SystemTab = (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>System Settings</Text>
      <View style={{ height: 12 }} />
      <View style={{ gap: 12 }}>
        <View style={styles.systemRow}>
          <Text style={styles.userName}>Maintenance Mode</Text>
          <Text style={styles.userMeta}>Off</Text>
        </View>
        <View style={styles.systemRow}>
          <Text style={styles.userName}>Error Tracking</Text>
          <Text style={styles.userMeta}>Enabled</Text>
        </View>
        <View style={styles.systemRow}>
          <Text style={styles.userName}>Cache</Text>
          <Text style={styles.userMeta}>Healthy</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {Header}
      {tab === 'home' && HomeTab}
      {tab === 'users' && UsersTab}
      {tab === 'reports' && ReportsTab}
      {tab === 'system' && SystemTab}

      <View style={styles.bottomBarWrap}>
        <View style={styles.bottomBar}>
          <Pressable style={styles.bottomItem} onPress={() => setTab('home')} accessibilityLabel="Home">
            <MaterialIcons name={'home'} size={24} color={tab === 'home' ? PRIMARY : '#64748b'} />
            <Text style={[styles.bottomText, { color: tab === 'home' ? PRIMARY : '#64748b' }]}>Home</Text>
          </Pressable>
          <Pressable style={styles.bottomItem} onPress={() => setTab('users')} accessibilityLabel="Usuarios">
            <MaterialIcons name={'group'} size={24} color={tab === 'users' ? PRIMARY : '#64748b'} />
            <Text style={[styles.bottomText, { color: tab === 'users' ? PRIMARY : '#64748b' }]}>Usuarios</Text>
          </Pressable>
          <Pressable style={styles.bottomItem} onPress={() => setTab('reports')} accessibilityLabel="Reportes">
            <MaterialIcons name={'leaderboard'} size={24} color={tab === 'reports' ? PRIMARY : '#64748b'} />
            <Text style={[styles.bottomText, { color: tab === 'reports' ? PRIMARY : '#64748b' }]}>Reportes</Text>
          </Pressable>
          <Pressable style={styles.bottomItem} onPress={() => setTab('system')} accessibilityLabel="Sistema">
            <MaterialIcons name={'settings'} size={24} color={tab === 'system' ? PRIMARY : '#64748b'} />
            <Text style={[styles.bottomText, { color: tab === 'system' ? PRIMARY : '#64748b' }]}>Sistema</Text>
          </Pressable>
        </View>
        <View style={{ height: 20, backgroundColor: '#ffffff' }} />
      </View>

      <Modal visible={showCritical} animationType="slide" transparent onRequestClose={() => setShowCritical(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Critical Issues</Text>
              <Pressable onPress={() => setShowCritical(false)}>
                <MaterialIcons name={'close'} size={22} color={'#111418'} />
              </Pressable>
            </View>
            <View style={{ height: 12 }} />
            <View style={{ gap: 10 }}>
              <Text style={styles.userName}>• Payment webhook latency spikes</Text>
              <Text style={styles.userName}>• Elevated 500s in auth service</Text>
              <Text style={styles.userName}>• Queue backlog above threshold</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSystem} animationType="slide" transparent onRequestClose={() => setShowSystem(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>System Status</Text>
              <Pressable onPress={() => setShowSystem(false)}>
                <MaterialIcons name={'close'} size={22} color={'#111418'} />
              </Pressable>
            </View>
            <View style={{ height: 12 }} />
            <View style={{ gap: 10 }}>
              <Text style={styles.userName}>API: Operational</Text>
              <Text style={styles.userName}>DB: Healthy</Text>
              <Text style={styles.userName}>CDN: Operational</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111418' },
  navBtn: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 14,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111418' },
  linkText: { fontSize: 14, fontWeight: '600', color: PRIMARY },

  chip: { height: 32, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  chipInactive: { backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: PRIMARY },
  chipText: { color: '#334155', fontSize: 14, fontWeight: '600' },
  chipActiveText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  userCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#e2e8f0' },
  userName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  userMeta: { fontSize: 13, color: '#64748b' },

  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 },
  alertIconWrap: { height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  alertPriority: { fontSize: 13, fontWeight: '700' },
  dot: { height: 10, width: 10, borderRadius: 999 },

  quickRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 },
  quickIcon: { height: 40, width: 40, borderRadius: 999, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a' },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillActive: { backgroundColor: 'rgba(16,185,129,0.15)' },
  pillInactive: { backgroundColor: 'rgba(148,163,184,0.25)' },
  pillActiveText: { color: '#10b981', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  pillInactiveText: { color: '#475569', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },

  reportItem: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12 },
  systemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  filterBtn: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#ffffff', borderWidth:1, borderColor:'#d1d5db', borderRadius:8, paddingHorizontal:10, paddingVertical:6 },
  actionBtn: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'#e5e7eb' },
  actionText: { color:'#111418', fontWeight:'800' },
  actionBtnGreen: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'rgba(16,185,129,0.12)' },
  actionTextGreen: { color:'#16a34a', fontWeight:'800' },
  actionBtnRed: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'rgba(239,68,68,0.12)' },
  actionTextRed: { color:'#ef4444', fontWeight:'800' },
  actionBtnBlue: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'rgba(59,130,246,0.12)' },
  actionTextBlue: { color:'#2563eb', fontWeight:'800' },
  logsBox: { backgroundColor:'#111827', borderRadius:12, padding:12 },
  logLine: { color:'#22c55e', fontFamily:'monospace', fontSize:12 },

  bottomBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bottomBar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#ffffff', paddingVertical: 8 },
  bottomItem: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomText: { fontSize: 12, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
});


