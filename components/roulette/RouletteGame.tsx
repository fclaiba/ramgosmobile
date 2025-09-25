import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import WheelView from './WheelView';
import { EUROPEAN_WHEEL, computePayout } from '../../services/roulette';
import { spendCoins, addCoins } from '../../services/tamagotchi';

const { width } = Dimensions.get('window');

type Props = {
  rotateDeg: Animated.AnimatedInterpolation<string>;
  winning: number | null;
  history: number[];
  bets: Map<string, number>;
  setBets: (fn: (prev: Map<string, number>) => Map<string, number>) => void;
  placeBetAmount: number;
  onSpinPress: () => void;
  spinning: boolean;
};

function betKey(kind: string, value: string | number) { return `${kind}:${value}`; }

export default function RouletteGame(props: Props) {
  const { rotateDeg, winning, history, bets, setBets, placeBetAmount, onSpinPress, spinning } = props;

  function place(kind: string, value: string | number) {
    if (spinning) return;
    const amt = Math.max(0, Math.floor(placeBetAmount));
    if (amt <= 0) return;
    if (!spendCoins(amt)) return;
    setBets((prev) => {
      const m = new Map(prev);
      const key = betKey(kind, value);
      m.set(key, (m.get(key) || 0) + amt);
      return m;
    });
  }

  function renderNumberCell(num: number) {
    const redSet = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    const bg = num === 0 ? '#00E676' : redSet.has(num) ? '#D9534F' : '#222';
    const amount = bets.get(betKey('num', num)) || 0;
    const isWinning = winning === num;
    return (
      <TouchableOpacity key={`num-${num}`} style={[styles.numCell, { backgroundColor: bg, borderColor: isWinning ? '#00C853' : '#e6f2ea' }]} activeOpacity={0.8} onPress={() => place('num', num)}>
        <Text style={[styles.numText, { color: '#fff' }]}>{num}</Text>
        {amount ? (
          <View style={{ position: 'absolute', right: 4, bottom: 4, backgroundColor: '#22c55e', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: '#052e16', fontWeight: '900', fontSize: 10 }}>{amount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ padding: 16, alignItems: 'center', paddingBottom: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <WheelView rotateDeg={rotateDeg} />
      </View>

      <View style={styles.historyRow}>
        <Text style={{ fontWeight: '700', marginRight: 10 }}>Historial</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {history.map((h, idx) => (
            <View key={`h-${idx}`} style={[styles.historyDot, { backgroundColor: h === 0 ? '#00E676' : (new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]).has(h) ? '#D9534F' : '#222') }]}> 
              <Text style={{ color: '#fff' }}>{h}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.table}>
        <View style={styles.rowTop}>{renderNumberCell(0)}</View>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = 3 * i + 1;
          const row = [a, a + 1, a + 2];
          return (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((n) => renderNumberCell(n))}
              {i % 4 === 0 && <View style={styles.sideBig}><Text style={{ color: '#fff' }}>2a1</Text></View>}
            </View>
          );
        })}

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.outerBtn} onPress={() => place('dozen', '1')}><Text style={styles.outerText}>1ª Docena</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outerBtn} onPress={() => place('dozen', '2')}><Text style={styles.outerText}>2ª Docena</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outerBtn} onPress={() => place('dozen', '3')}><Text style={styles.outerText}>3ª Docena</Text></TouchableOpacity>
        </View>

        <View style={styles.bottomRowSmall}>
          <TouchableOpacity style={styles.outerSmall} onPress={() => place('range', '1-18')}><Text style={styles.outerText}>1-18</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outerSmall} onPress={() => place('parity', 'par')}><Text style={styles.outerText}>PAR</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.outerSmall, { backgroundColor: '#D9534F' }]} onPress={() => place('color', 'red')}><Text style={styles.outerText}>ROJO</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.outerSmall, { backgroundColor: '#111' }]} onPress={() => place('color', 'black')}><Text style={[styles.outerText, { color: '#fff' }]}>NEGRO</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outerSmall} onPress={() => place('parity', 'impar')}><Text style={styles.outerText}>IMPAR</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outerSmall} onPress={() => place('range', '19-36')}><Text style={styles.outerText}>19-36</Text></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.spinBtn} onPress={onSpinPress} disabled={spinning}>
        <Text style={styles.spinText}>{spinning ? 'Girando...' : 'GIRAR RULETA'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  historyRow: { width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  historyDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  table: { width: '100%', backgroundColor: '#e6f2ea', padding: 8, borderRadius: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  numCell: { width: (width - 64) / 3 - 4, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, borderWidth: 3 },
  numText: { color: '#fff', fontWeight: '700' },
  sideBig: { flex: 1, height: 44, marginLeft: 8, backgroundColor: '#2e8b57', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  outerBtn: { flex: 1, marginHorizontal: 4, height: 40, backgroundColor: '#2e8b57', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  outerText: { color: '#fff', fontWeight: '700' },
  bottomRowSmall: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'space-between' },
  outerSmall: { width: '30%', height: 36, backgroundColor: '#2e8b57', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  spinBtn: { marginTop: 12, width: '100%', height: 56, backgroundColor: '#00E676', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  spinText: { fontWeight: '800' },
});


