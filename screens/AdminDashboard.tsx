import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type AdminTab = 'home' | 'users' | 'reports' | 'system';
type UserFilter = 'all' | 'active' | 'inactive';

type AdminUser = {
  id: string;
  name: string;
  avatar: string;
  joined: string;
  status: 'active' | 'inactive';
};

const PRIMARY = '#1173d4';
const USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Ethan Harper',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdP_a63XUIGxoHopZLVrs3RIIhIAkDdfrvyf1uRPuJ1IA2A8Q0sqzZSB1DAEK6CBh3h3ObcQcAArtHWt94f4wj-Z6X2H9x7BltxIKx9MRiB1svQ3I8ozc2Pe-MAK15J-1aXhiVyO8QI9cEdALvpI1YL6epIP1EUR56JlidhwaE4pljJbzCaHC47HiU8P3rFXDnD2487SdMX5uGPYFYLPwf2am8yxKgngMvsEx8FGXvKDWMuAECXCF0EijkUM-x9_X9Nt7lRp9zNjw',
    joined: 'Joined 2 days ago',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Olivia Bennett',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArOgHg0U1e9ESaJx3UYoHu5XU6h_Ad3BgoZIHuCTPwR7-AzjVCTNgiHjmX7Q7ubbwCyXtWeQoJWJs7fQoN6EeLLeEA5jHcxTAM7juvSVu1wIwQObQ3vpwGrGeWv7Ei5MnjvcJzCMOoFWq-RucRgngr17F-NP4V4p6VkbpjJW-8mx9QHeOlLOU9syIoEqqztDdqVvEoXfN_gUv4-lxUtBENCErGQ_HXFqsd1z1LpQrmAS4kMED_oHPyHxk9p4V6j7uNGvWn2KVQvIfJ',
    joined: 'Joined 5 days ago',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Noah Carter',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn2h7YthfbOM2RnqMkKmRE1dYth-LgOejX2G-M8s7c16CT7a0JqLEZJZaxG_bILxtGIihofmJKKlgyl_jSF12QiMACrdE-YTDwC102X2H7D7t2e5c_yOeE94A80KOgylZqrDrpfGi_AdQ5aoHCrYOCvsz86pMz9tGVZQUeyerNabwSlCLFRHKv8-bYR4-oUnvtl30rcGgzOWOTjqFqhjOXm52h9Tb-bIg1-5hoB9vXpzlXKRA67qFu-GhJWW33PpH-DZG0QW8UZJ1v',
    joined: 'Joined 1 week ago',
    status: 'inactive',
  },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('home');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [showCritical, setShowCritical] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const { width } = useWindowDimensions();

  const filteredUsers = useMemo(() => {
    if (filter === 'all') return USERS;
    return USERS.filter((u) => u.status === filter);
  }, [filter]);

  const Header = (
    <View style={styles.headerRow}>
      <View style={{ width: 48 }} />
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
      {RecentUsersSection}
      {ModerationSection}
      {QuickReportsSection}
    </ScrollView>
  );

  const UsersTab = (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>All Users</Text>
      <View style={{ height: 8 }} />
      {(USERS as AdminUser[]).map((u) => (
        <View key={u.id} style={styles.userCard}>
          <Image source={{ uri: u.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{u.name}</Text>
            <Text style={styles.userMeta}>{u.joined}</Text>
          </View>
          <View style={[styles.statusPill, u.status === 'active' ? styles.pillActive : styles.pillInactive]}>
            <Text style={u.status === 'active' ? styles.pillActiveText : styles.pillInactiveText}>
              {u.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const ReportsTab = (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Reports</Text>
      <View style={{ height: 12 }} />
      <View style={{ gap: 12 }}>
        <View style={styles.reportItem}>
          <View style={[styles.alertIconWrap, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
            <MaterialIcons name={'flag'} size={20} color={'#f43f5e'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>User Reports</Text>
            <Text style={[styles.userMeta, { color: '#f43f5e' }]}>High Priority</Text>
          </View>
          <MaterialIcons name={'chevron-right'} size={20} color={'#94a3b8'} />
        </View>

        <View style={styles.reportItem}>
          <View style={[styles.alertIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialIcons name={'description'} size={20} color={'#f59e0b'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Content Review</Text>
            <Text style={[styles.userMeta, { color: '#f59e0b' }]}>Medium Priority</Text>
          </View>
          <MaterialIcons name={'chevron-right'} size={20} color={'#94a3b8'} />
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

  bottomBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bottomBar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#ffffff', paddingVertical: 8 },
  bottomItem: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomText: { fontSize: 12, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
});


