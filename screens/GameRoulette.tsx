import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, TextInput, PanResponder } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderBalance from '../components/roulette/HeaderBalance';
import WheelView from '../components/roulette/WheelView';
import { EUROPEAN_WHEEL, computePayout } from '../services/roulette';
import { spendCoins, addCoins } from '../services/tamagotchi';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const topRow    = Array.from({ length: 12 }, (_, i) => 3*(i+1));
const middleRow = Array.from({ length: 12 }, (_, i) => 3*(i+1) - 1);
const bottomRow = Array.from({ length: 12 }, (_, i) => 3*(i+1) - 2);

function betKey(kind: string, value: string | number) { return `${kind}:${value}`; }
function isRed(n: number) { return REDS.has(n); }

export default function GameRoulette({ navigation }: any) {
  // Forzar layout lado a lado y escalar a la altura disponible para que entre en una pantalla
  const headerH = 56; // zona superior (título + saldo)
  const historyH = 40; // historial compacto
  const adjustH = 40; // fila de ajuste de apuesta
  const spinH = 56; // botón girar
  const verticalMargins = 32; // paddings/márgenes varios
  const availableMainH = Math.max(220, SCREEN_H - (headerH + historyH + adjustH + spinH + verticalMargins));

  // Preasignación de tamaños base
  let wheelSize = Math.min(420, Math.floor(Math.min(availableMainH, SCREEN_W * 0.48)));
  let tableW = Math.max(280, Math.floor(SCREEN_W - (wheelSize + 16 /*gap*/ + 32 /*padding*/)));
  if (tableW < 280) {
    wheelSize = Math.max(220, wheelSize - (280 - tableW));
    tableW = 280;
  }
  const gap = 4;
  const baseCellH = 40;
  const baseDozenH = 40;
  const baseOutsideH = 40;
  // 12 columnas de números; en layout wide el 0 ya no ocupa una columna lateral
  let cellW = Math.max(12, Math.floor((tableW - 48 /*2to1*/ - 11*gap) / 12));
  let cellH = Math.max(24, Math.floor(cellW * 0.8));
  let dozenH = baseDozenH;
  let outsideH = baseOutsideH;
  // Altura de la mesa (3 filas números + docenas + externas)
  const calcTableH = (h: number, dz: number, out: number) => (3 * h) + (2 * gap) + dz + out + 8 /*margen*/;
  let tableH = calcTableH(cellH, dozenH, outsideH);
  if (tableH > availableMainH) {
    const scale = Math.max(0.6, availableMainH / tableH);
    cellH = Math.max(22, Math.floor(cellH * scale));
    dozenH = Math.max(24, Math.floor(dozenH * scale));
    outsideH = Math.max(24, Math.floor(outsideH * scale));
    tableH = calcTableH(cellH, dozenH, outsideH);
  }
  // Ajustar wheel si mesa sigue alta (sólo ancho)
  const maxMainH = Math.min(availableMainH, Math.max(wheelSize, tableH));
  if (wheelSize > maxMainH) {
    wheelSize = maxMainH;
  }
  const isWide = SCREEN_W >= 900;

  // Dimensiones compactas para móvil (layout vertical)
  const mTableW = Math.max(SCREEN_W - 24, 300);
  const mGap = 4;
  const mCellW = Math.max(20, Math.floor((mTableW - 16 /*padding*/ - 2 * mGap) / 3));
  const mCellH = Math.max(24, Math.floor(mCellW * 0.85));
  const mDozenH = 30;
  const mOutsideH = 30;
  const mWheel = Math.min(SCREEN_W - 48, 260);
  const border = 2;

  const [bets, setBets] = useState<Map<string, number>>(new Map());
  const [winning, setWinning] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const chips = [1,5,10,25,100,500];
  const [activeChip, setActiveChip] = useState<number>(10);
  const [history, setHistory] = useState<number[]>([]);

  // Física de giro
  const SECTORS = EUROPEAN_WHEEL.length;
  const DEG_PER = 360 / SECTORS;
  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;
  const angleAnim = useRef(new Animated.Value(0)).current;
  const rotateDeg = angleAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const stateRef = useRef({ I: 0.5 * 3.0 * (0.35 ** 2), theta: 0, omega: 0, b: 0.02, c: 0.001, tau0: 0.005 });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const paidRef = useRef(false);
  const wasSpinningRef = useRef(false);
  const draggingRef = useRef(false);
  const lastAngleRef = useRef<number | null>(null);
  const lastAngleTimeRef = useRef<number | null>(null);
  const wheelRenderSizeRef = useRef<number>(0);

  function angleFromEvent(e: any): number {
    const size = wheelRenderSizeRef.current || wheelSize;
    const x = (e.nativeEvent.locationX || 0) - size / 2;
    const y = (e.nativeEvent.locationY || 0) - size / 2;
    return Math.atan2(y, x);
  }

  function normalizeDelta(d: number): number {
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        draggingRef.current = true;
        wasSpinningRef.current = false;
        stateRef.current.omega = 0;
        lastAngleRef.current = angleFromEvent(e);
        lastAngleTimeRef.current = Date.now();
      },
      onPanResponderMove: (e) => {
        if (!draggingRef.current) return;
        const now = Date.now();
        const a = angleFromEvent(e);
        const prev = lastAngleRef.current ?? a;
        const da = normalizeDelta(a - prev);
        stateRef.current.theta += da;
        const deg = ((stateRef.current.theta * DEG) % 360 + 360) % 360;
        angleAnim.setValue(deg);
        lastAngleRef.current = a;
        lastAngleTimeRef.current = now;
      },
      onPanResponderRelease: (e) => {
        const now = Date.now();
        const a = angleFromEvent(e);
        const prev = lastAngleRef.current ?? a;
        const da = normalizeDelta(a - prev);
        const dt = Math.max(0.016, ((now - (lastAngleTimeRef.current || now)) / 1000));
        const instOmega = da / dt; // rad/s
        // Escala de impulso para sensación física
        stateRef.current.omega = Math.max(-10, Math.min(10, instOmega * 0.9));
        draggingRef.current = false;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => { draggingRef.current = false; },
    })
  ).current;

  function smoothSign(w: number) { return w / (Math.abs(w) + 1e-6); }
  function physicsStep(dt: number) {
    const s = stateRef.current;
    const tauVisc = -s.b * s.omega;
    const tauCoul = -s.tau0 * smoothSign(s.omega);
    const tauAir  = -s.c * s.omega * Math.abs(s.omega);
    const tau = tauVisc + tauCoul + tauAir;
    const alpha = tau / s.I;
    s.omega = s.omega + alpha * dt;
    s.theta = s.theta + s.omega * dt;
    if (Math.abs(s.omega) < 0.02) s.omega = 0;
  }

  function placeBet(kind: string, value: string | number) {
    if (spinning) return;
    const amt = Math.max(0, Math.floor(betAmount));
    if (amt <= 0) return;
    if (!spendCoins(amt)) return;
    setBets((prev) => {
      const m = new Map(prev);
      const key = betKey(kind, value);
      m.set(key, (m.get(key) || 0) + amt);
      return m;
    });
  }

  function spinWheel() {
    const totalBet = Array.from(bets.values()).reduce((a,b)=>a+b,0);
    if (spinning || totalBet <= 0) return;
    setSpinning(true);
    setWinning(null);
    paidRef.current = false;
    wasSpinningRef.current = true;
    const torqueBoost = 0.6 + 0.002 * betAmount;
    stateRef.current.omega = Math.max(6, stateRef.current.omega + (torqueBoost * 0.12) / stateRef.current.I);
  }

  useEffect(() => {
    const loop = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = Math.min((t - (lastRef.current || t)) / 1000, 1 / 30);
      lastRef.current = t;
      physicsStep(dt);
      const deg = ((stateRef.current.theta * DEG) % 360 + 360) % 360;
      angleAnim.setValue(deg);
      if (stateRef.current.omega === 0 && wasSpinningRef.current && !paidRef.current) {
        const sectorIndex = Math.floor(deg / DEG_PER) % SECTORS;
        const centerDeg = sectorIndex * DEG_PER + DEG_PER / 2;
        stateRef.current.theta = centerDeg * RAD;
        angleAnim.setValue(centerDeg);
        const numberResult = EUROPEAN_WHEEL[sectorIndex];
        setWinning(numberResult);
        setHistory((h) => [numberResult, ...h].slice(0, 10));
        const payout = computePayout(bets, numberResult as any);
        if (payout > 0) addCoins(payout);
        paidRef.current = true;
        setBets(new Map());
        setSpinning(false);
        wasSpinningRef.current = false;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [bets]);

  const renderNumberCell = (n: number) => {
    const amount = bets.get(betKey('num', n)) || 0;
    const win = winning === n;
    return (
      <TouchableOpacity
        key={`n-${n}`}
        activeOpacity={0.8}
        onPress={() => placeBet('num', n)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={[styles.cell, { width: cellW, height: cellH, borderWidth: border, borderColor: win ? '#00C853' : '#ffffff' }]}
      >
        <View style={{ width: Math.floor(cellW * 0.82), height: Math.floor(cellH * 0.62), borderRadius: Math.floor(cellH * 0.31), backgroundColor: isRed(n) ? '#D9534F' : '#0b0b0b', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.numText}>{n}</Text>
        </View>
        {amount ? (<View style={styles.badge}><Text style={styles.badgeText}>{amount}</Text></View>) : null}
      </TouchableOpacity>
    );
  };

  const renderNumberCellMobile = (n: number) => {
    const amount = bets.get(betKey('num', n)) || 0;
    const win = winning === n;
    return (
      <TouchableOpacity
        key={`nm-${n}`}
        activeOpacity={0.8}
        onPress={() => placeBet('num', n)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={[styles.cell, { width: mCellW, height: mCellH, borderWidth: border, borderColor: win ? '#00C853' : '#ffffff', marginRight: 4 }]}
      >
        <View style={{ width: Math.floor(mCellW * 0.8), height: Math.floor(mCellH * 0.6), borderRadius: Math.floor(mCellH * 0.3), backgroundColor: isRed(n) ? '#D9534F' : '#0b0b0b', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.numText, { fontSize: 12 }]}>{n}</Text>
        </View>
        {amount ? (<View style={styles.badge}><Text style={styles.badgeText}>{amount}</Text></View>) : null}
      </TouchableOpacity>
    );
  };

  const totalBet = useMemo(() => Array.from(bets.values()).reduce((a,b)=>a+b,0), [bets]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8f6' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><MaterialIcons name={'arrow-back'} size={22} color={'#0f172a'} /></TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>Ruleta</Text>
        <HeaderBalance />
      </View>
      <View style={{ padding: 16, paddingBottom: 16, flex: 1 }}>
        {isWide ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, height: availableMainH }}>
          <View style={{ width: wheelSize, height: wheelSize, marginRight: 16 }}
            onLayout={(e) => { wheelRenderSizeRef.current = Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height); }}
            {...panResponder.panHandlers}
          >
            <WheelView rotateDeg={rotateDeg} size={wheelSize} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.table, { width: '100%', padding: 8, height: tableH }]}> 
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    {/** Fila de 0 arriba a todo el ancho del bloque de números */}
                    <TouchableOpacity style={[styles.zeroBar, { height: cellH, borderWidth: border, marginBottom: gap }]} activeOpacity={0.8} onPress={() => placeBet('num', 0)}>
                      <Text style={[styles.smallText, { color: '#052e16' }]}>0</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', marginBottom: gap, flexWrap: 'nowrap' }}>{topRow.map((n)=>renderNumberCell(n))}</View>
                    <View style={{ flexDirection: 'row', marginBottom: gap, flexWrap: 'nowrap' }}>{middleRow.map((n)=>renderNumberCell(n))}</View>
                    <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>{bottomRow.map((n)=>renderNumberCell(n))}</View>
                  </View>
                  <View style={{ width: 48, marginLeft: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <View key={`2to1-${i}`} style={[styles.twoToOne, { height: cellH, borderWidth: border }, i !== 2 ? { marginBottom: gap } : null]}><Text style={styles.smallText}>2 to 1</Text></View>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {(['1','2','3'] as const).map((d, i) => (
                    <TouchableOpacity key={`dozen-${d}`} activeOpacity={0.8} onPress={() => placeBet('dozen', d)} style={[styles.dozen, { flex: 1, borderWidth: border, height: dozenH }, i !== 2 ? { marginRight: 8 } : null]}>
                      <Text style={styles.smallText}>{i === 0 ? '1st 12' : i === 1 ? '2nd 12' : '3rd 12'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity onPress={() => placeBet('range', '1-18')} style={[styles.bottomBtn, { borderWidth: border, height: outsideH }]} activeOpacity={0.8}><Text style={styles.smallText}>1 to 18</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => placeBet('parity', 'par')} style={[styles.bottomBtn, { borderWidth: border, marginLeft: 8, height: outsideH }]} activeOpacity={0.8}><Text style={styles.smallText}>EVEN</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => placeBet('color', 'red')} style={[styles.bottomBtn, { borderWidth: border, marginLeft: 8, height: outsideH }]} activeOpacity={0.8}><View style={styles.diamondRed} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => placeBet('color', 'black')} style={[styles.bottomBtn, { borderWidth: border, marginLeft: 8, height: outsideH }]} activeOpacity={0.8}><View style={styles.diamondBlack} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => placeBet('parity', 'impar')} style={[styles.bottomBtn, { borderWidth: border, marginLeft: 8, height: outsideH }]} activeOpacity={0.8}><Text style={styles.smallText}>ODD</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => placeBet('range', '19-36')} style={[styles.bottomBtn, { borderWidth: border, marginLeft: 8, height: outsideH }]} activeOpacity={0.8}><Text style={styles.smallText}>19 to 36</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: mWheel, height: mWheel }}
                onLayout={(e) => { wheelRenderSizeRef.current = Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height); }}
                {...panResponder.panHandlers}
              >
                <WheelView rotateDeg={rotateDeg} size={mWheel} />
              </View>
            </View>
            <View style={[styles.table, { width: mTableW, padding: 8 }]}> 
              <TouchableOpacity style={[styles.zeroCol, { width: '100%', height: mCellH, borderWidth: border, marginBottom: 6, alignItems: 'center', justifyContent: 'center' }]} activeOpacity={0.8} onPress={() => placeBet('num', 0)}>
                <View style={[styles.ovalZero, { width: Math.floor(mCellW * 1.6), height: Math.floor(mCellH * 0.8), borderRadius: Math.floor(mCellH * 0.4) }]}>
                  <Text style={styles.numText}>0</Text>
                </View>
              </TouchableOpacity>
              {Array.from({ length: 12 }).map((_, i) => (
                <View key={`col-v-${i}`} style={{ flexDirection: 'row', marginBottom: 6, justifyContent: 'space-between' }}>
                  {[bottomRow[i], middleRow[i], topRow[i]].map((n) => renderNumberCellMobile(n))}
                </View>
              ))}
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {(['1','2','3'] as const).map((d, i) => (
                  <TouchableOpacity key={`dozen-m-${d}`} activeOpacity={0.8} onPress={() => placeBet('dozen', d)} style={[styles.dozen, { flex: 1, borderWidth: border, height: mDozenH }, i !== 2 ? { marginRight: 6 } : null]}>
                    <Text style={styles.smallText}>{i === 0 ? '1st 12' : i === 1 ? '2nd 12' : '3rd 12'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }}>
                <TouchableOpacity onPress={() => placeBet('range', '1-18')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><Text style={styles.smallText}>1 to 18</Text></TouchableOpacity>
                <View style={{ width: '4%' }} />
                <TouchableOpacity onPress={() => placeBet('parity', 'par')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><Text style={styles.smallText}>EVEN</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => placeBet('color', 'red')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><View style={styles.diamondRed} /></TouchableOpacity>
                <View style={{ width: '4%' }} />
                <TouchableOpacity onPress={() => placeBet('color', 'black')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><View style={styles.diamondBlack} /></TouchableOpacity>
                <TouchableOpacity onPress={() => placeBet('parity', 'impar')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><Text style={styles.smallText}>ODD</Text></TouchableOpacity>
                <View style={{ width: '4%' }} />
                <TouchableOpacity onPress={() => placeBet('range', '19-36')} style={[styles.bottomBtn, { borderWidth: border, flexBasis: '48%', height: mOutsideH, marginBottom: 6 }]} activeOpacity={0.8}><Text style={styles.smallText}>19 to 36</Text></TouchableOpacity>
              </View>
            </View>
          </>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ fontWeight: '700', marginRight: 10 }}>Historial</Text>
          <View style={{ flexDirection: 'row' }}>
            {history.map((h, idx) => (
              <View key={`h-${idx}`} style={[styles.historyDot, { backgroundColor: h === 0 ? '#00E676' : (REDS.has(h) ? '#D9534F' : '#222') }]}>
                <Text style={{ color: '#fff', fontSize: 12 }}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
        {/** Selector de fichas + entrada manual */}
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {chips.map((c) => (
              <TouchableOpacity key={`chip-${c}`} onPress={() => { setActiveChip(c); setBetAmount(c); }} style={[styles.chipBtn, activeChip === c && styles.chipActive]}>
                <Text style={[styles.chipText, activeChip === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <TouchableOpacity onPress={() => setBetAmount((b) => Math.max(0, b - activeChip))} style={styles.adjustBtn}><Text>-{activeChip}</Text></TouchableOpacity>
            <TextInput
              value={String(betAmount)}
              onChangeText={(t) => {
                const v = Math.max(0, Math.floor(Number(t.replace(/\D/g, '') || '0')));
                setBetAmount(v);
              }}
              keyboardType={'numeric'}
              style={styles.amountInput}
            />
            <TouchableOpacity onPress={() => setBetAmount((b) => b + activeChip)} style={styles.adjustBtn}><Text>+{activeChip}</Text></TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={spinWheel} disabled={spinning || totalBet===0} style={{ marginTop: 8, height: spinH, borderRadius: 12, backgroundColor: totalBet===0 || spinning ? '#cccccc' : '#00E676', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '800' }}>{spinning ? 'Girando...' : `GIRAR RULETA · Apostado ${totalBet}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const FELT = '#0f3d2f';
const styles = StyleSheet.create({
  historyDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  table: { backgroundColor: FELT, borderColor: '#ffffff', borderWidth: 3, borderRadius: 6 },
  cell: { backgroundColor: 'transparent', borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  numText: { color: '#ffffff', fontWeight: '800' },
  badge: { position: 'absolute', right: 4, bottom: 4, backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#052e16', fontWeight: '900', fontSize: 10 },
  zeroCol: { backgroundColor: 'transparent', borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  ovalZero: { backgroundColor: '#3a9c2c', alignItems: 'center', justifyContent: 'center' },
  zeroBar: { backgroundColor: '#2bee2b', borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  twoToOne: { backgroundColor: 'transparent', borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  smallText: { color: '#ffffff', fontWeight: '800' },
  dozen: { backgroundColor: 'transparent', borderColor: '#ffffff', height: 44, alignItems: 'center', justifyContent: 'center' },
  bottomBtn: { flex: 1, height: 44, backgroundColor: 'transparent', borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  diamondRed: { width: 18, height: 18, backgroundColor: '#D9534F', transform: [{ rotate: '45deg' }], borderWidth: 1.5, borderColor: '#fff' },
  diamondBlack: { width: 18, height: 18, backgroundColor: '#0b0b0b', transform: [{ rotate: '45deg' }], borderWidth: 1.5, borderColor: '#fff' },
  adjustBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e6f2ea', marginHorizontal: 12 },
  chipBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#e6f2ea', margin: 4, backgroundColor: '#ffffff' },
  chipActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  chipText: { color: '#0f172a', fontWeight: '800' },
  chipTextActive: { color: '#166534' },
  amountInput: { minWidth: 80, textAlign: 'center', paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 8, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', fontWeight: '800' },
});
