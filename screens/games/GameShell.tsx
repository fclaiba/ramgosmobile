import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = { title: string; children: React.ReactNode };

export default function GameShell({ title, children }: Props) {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#111827'} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, padding: 16 }}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8f6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.6)' },
  title: { fontWeight: '800' },
});


