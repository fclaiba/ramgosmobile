import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { archive, listNotifications, markAllRead, markRead, NotificationItem } from '../services/notifications';

type Tab = 'all' | 'payment' | 'follower' | 'system' | 'message';

export default function NotificationsScreen() {
  const [tab, setTab] = useState<Tab>('all');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t)=>t+1);
  const items = useMemo(() => listNotifications({ kind: tab==='all' ? 'all' : tab }), [tab, tick]);

  const sections = useMemo(() => {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const groups: Record<string, NotificationItem[]> = { 'Hoy': [], 'Ayer': [] };
    items.forEach(n => (n.createdAt >= todayStart.getTime() ? groups['Hoy'] : groups['Ayer']).push(n));
    return groups;
  }, [items]);

  const onOpenAction = (n: NotificationItem) => { markRead(n.id); refresh(); };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn}><MaterialIcons name={'arrow-back'} size={22} color={'#111827'} /></Pressable>
        <Text style={styles.headerTitle}>Centro de Notificaciones</Text>
        <Pressable style={styles.iconBtn} onPress={()=>{ markAllRead(); refresh(); }}><MaterialIcons name={'more-vert'} size={22} color={'#111827'} /></Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor:'#e5e7eb' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[
            { key:'all', label:'Todas' },
            { key:'payment', label:'Transaccionales' },
            { key:'follower', label:'Sociales' },
            { key:'system', label:'Sistema' },
            { key:'message', label:'Mensajes' },
          ].map((t:any)=> (
            <Pressable key={t.key} onPress={()=>setTab(t.key)} style={[styles.pill, tab===t.key && styles.pillActive]}>
              <Text style={[styles.pillText, tab===t.key && styles.pillTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={[{ heading:'Hoy', data: sections['Hoy'] }, { heading:'Ayer', data: sections['Ayer'] }]}
        keyExtractor={(s) => s.heading}
        renderItem={({ item: section }) => (
          <View style={{ paddingVertical: 12 }}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <View style={{ gap: 10 }}>
              {section.data.map((n) => (
                <NotificationRow key={n.id} n={n} onOpen={onOpenAction} onArchive={(id)=>{ archive(id); refresh(); }} />
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 8 }}
      />
    </SafeAreaView>
  );
}

function NotificationRow({ n, onOpen, onArchive }: { n: NotificationItem; onOpen: (n: NotificationItem)=>void; onArchive: (id: string)=>void }) {
  const leftColor = n.kind==='payment' ? '#3b82f6' : n.kind==='follower' ? '#a855f7' : n.kind==='system' ? '#ef4444' : '#22c55e';
  const icon = n.kind==='payment' ? 'payment' : n.kind==='follower' ? 'person-add' : n.kind==='system' ? 'warning' : 'chat';
  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: leftColor }]}> 
      <View style={{ flexDirection:'row', alignItems:'flex-start', gap: 10 }}>
        <MaterialIcons name={icon as any} size={20} color={leftColor} style={{ marginTop: 2 }} />
        <View style={{ flex:1 }}>
          <Text style={styles.cardTitle}><Text style={{ fontWeight:'800' }}>{n.title}: </Text>{n.body}</Text>
          <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
          <View style={{ flexDirection:'row', gap: 8, marginTop: 8 }}>
            {n.kind==='payment' && (
              <>
                <Pressable onPress={()=>onOpen(n)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Ver Factura</Text></Pressable>
                <Pressable onPress={()=>onArchive(n.id)} style={styles.btn}><Text style={styles.btnText}>Archivar</Text></Pressable>
              </>
            )}
            {n.kind==='follower' && (
              <>
                <Pressable onPress={()=>onOpen(n)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Seguir también</Text></Pressable>
                <Pressable onPress={()=>onOpen(n)} style={styles.btn}><Text style={styles.btnText}>Ver Perfil</Text></Pressable>
              </>
            )}
            {n.kind==='system' && (
              <>
                <Pressable onPress={()=>onOpen(n)} style={styles.btn}><Text style={styles.btnText}>Recordármelo</Text></Pressable>
                <Pressable onPress={()=>onArchive(n.id)} style={styles.btn}><Text style={styles.btnText}>Descartar</Text></Pressable>
              </>
            )}
            {n.kind==='message' && (
              <>
                <Pressable onPress={()=>onOpen(n)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Responder</Text></Pressable>
                <Pressable onPress={()=>markRead(n.id)} style={styles.btn}><Text style={styles.btnText}>Marcar como leído</Text></Pressable>
              </>
            )}
          </View>
        </View>
        <Pressable style={{ padding: 6 }} onPress={()=>onArchive(n.id)}><MaterialIcons name={'more-horiz'} size={18} color={'#6b7280'} /></Pressable>
      </View>
    </View>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts; const m = 60*1000; const h = 60*m; const d = 24*h;
  if (diff < h) return `Hace ${Math.max(1, Math.floor(diff/m))} minutos`;
  if (diff < d*2) return `Hace ${Math.floor(diff/h)} hora${Math.floor(diff/h)>1?'s':''}`;
  return 'Ayer';
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:'#ffffff' },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 16, paddingTop: 24, borderBottomWidth: 1, borderColor:'#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight:'800', color:'#111827' },
  iconBtn: { padding: 8, borderRadius: 999 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f3f4f6' },
  pillActive: { backgroundColor: '#1173d4' },
  pillText: { color:'#374151', fontWeight:'700' },
  pillTextActive: { color:'#ffffff' },
  sectionHeading: { color:'#6b7280', fontWeight:'800', fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  card: { backgroundColor:'#ffffff', padding: 16, borderWidth: 1, borderColor:'#e5e7eb' },
  cardTitle: { color:'#111827' },
  cardTime: { color:'#6b7280', fontSize: 12, marginTop: 4 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor:'#f3f4f6' },
  btnText: { color:'#374151', fontWeight:'700', fontSize: 12 },
  btnPrimary: { backgroundColor:'#e0effc' },
  btnPrimaryText: { color:'#1173d4', fontWeight:'800', fontSize: 12 },
});


