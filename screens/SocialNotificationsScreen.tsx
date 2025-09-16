import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { listNotifications, markNotificationRead, NotificationItem } from '../services/social';

export default function SocialNotificationsScreen({ navigation }: any) {
  const [version, setVersion] = useState(0);
  const items = useMemo(() => listNotifications(), [version]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const icon = item.kind === 'like' ? 'favorite' : item.kind === 'comment' ? 'chat-bubble' : item.kind === 'follow' ? 'person-add' : 'send';
    const text = item.kind === 'like' ? `${item.actor.name} le gustó tu publicación` : item.kind === 'comment' ? `${item.actor.name} comentó tu publicación` : item.kind === 'follow' ? `${item.actor.name} comenzó a seguirte` : `${item.actor.name} te envió un mensaje`;
    return (
      <Pressable style={[styles.row, !item.read && styles.unread]} onPress={() => { markNotificationRead(item.id); setVersion((v) => v + 1); }}>
        <MaterialIcons name={icon as any} size={18} color={'#0f172a'} />
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList data={items} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, gap: 8 }} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 12 },
  unread: { backgroundColor: '#eff6ff' },
  text: { color: '#0f172a', flex: 1 },
});


