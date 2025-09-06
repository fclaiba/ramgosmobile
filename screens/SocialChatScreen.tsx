import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getUserById, listMessagesWith, sendMessage } from '../services/social';

export default function SocialChatScreen({ route, navigation }: any) {
  const userId: string = route?.params?.userId;
  const user = getUserById(userId);
  const [version, setVersion] = useState(0);
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);
  const messages = useMemo(() => listMessagesWith(userId), [userId, version]);
  if (!user) return null;

  const send = () => {
    if (!text.trim()) return;
    sendMessage(userId, text);
    setText('');
    setVersion((v) => v + 1);
    requestAnimationFrame(() => flatRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} />
        </Pressable>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={{ width: 22 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => {
            const mine = item.from.id === 'u_me';
            return (
              <View style={[styles.bubbleRow, mine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, mine ? { color: '#ffffff' } : { color: '#0f172a' }]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={'Escribe un mensaje'}
            placeholderTextColor={'#94a3b8'}
            value={text}
            onChangeText={setText}
          />
          <Pressable style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} onPress={send} disabled={!text.trim()}>
            <MaterialIcons name={'send'} size={18} color={'#ffffff'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '76%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginVertical: 2 },
  bubbleMine: { backgroundColor: '#0ea5e9', borderTopRightRadius: 4 },
  bubbleOther: { backgroundColor: '#e5e7eb', borderTopLeftRadius: 4 },
  bubbleText: { color: '#0f172a' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, color: '#0f172a' },
  sendBtn: { backgroundColor: '#0ea5e9', height: 44, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});


