import React, { memo } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { EUROPEAN_WHEEL, numberColor } from '../../services/roulette';

const { width } = Dimensions.get('window');

type Props = {
  rotateDeg: Animated.AnimatedInterpolation<string>;
  size?: number;
};

function WheelView({ rotateDeg, size }: Props) {
  const SZ = Math.max(220, Math.min(size ?? (width - 40), 420));
  return (
    <View style={{ width: SZ, height: SZ, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: -Math.max(12, SZ * 0.035), zIndex: 20, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: Math.max(10, SZ * 0.04), borderRightWidth: Math.max(10, SZ * 0.04), borderBottomWidth: Math.max(18, SZ * 0.07), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#00C853' }} />
      </View>
      {/** Anillos de borde para profundidad visual */}
      <View style={{ position: 'absolute', width: SZ, height: SZ, borderRadius: SZ/2, borderWidth: Math.max(2, Math.floor(SZ * 0.01)), borderColor: '#c8cbd0' }} />
      <View style={{ position: 'absolute', width: SZ * 0.86, height: SZ * 0.86, borderRadius: (SZ * 0.86)/2, borderWidth: Math.max(2, Math.floor(SZ * 0.008)), borderColor: '#e6e8ec' }} />
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: SZ/2, alignItems: 'center', justifyContent: 'center' }, { transform: [{ rotate: rotateDeg }] }]}>
        {EUROPEAN_WHEEL.map((num, i) => {
          const angle = (360 / EUROPEAN_WHEEL.length) * i;
          const color = (() => {
            const c = numberColor(num);
            if (c === 'green') return '#00E676';
            if (c === 'red') return '#D9534F';
            return '#222';
          })();
          // Grosor y posición: barra delgada cerca del borde para evitar solapamiento
          const barWidth = Math.max(10, Math.floor(SZ * 0.045));
          const barHeight = Math.max(18, Math.floor(SZ * 0.08));
          const radiusTranslate = -Math.floor(SZ / 2 - barHeight - Math.floor(SZ * 0.02));
          const labelW = Math.max(18, Math.floor(SZ * 0.09));
          const labelH = Math.max(12, Math.floor(labelW * 0.6));
          const labelRadiusTranslate = -Math.floor(SZ / 2 - barHeight - Math.floor(SZ * 0.12));
          return (
            <Animated.View
              key={`s-${i}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: barWidth,
                height: barHeight,
                borderRadius: Math.floor(barHeight / 3),
                backgroundColor: color,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: '#ffffff',
                transform: [ { translateX: -Math.floor(barWidth / 2) }, { translateY: -Math.floor(barHeight / 2) }, { rotate: `${angle}deg` }, { translateY: radiusTranslate } ],
              }}
            >
            </Animated.View>
          );
        })}
        {/** Marcas divisorias finas entre sectores */}
        {EUROPEAN_WHEEL.map((_, i) => {
          const sector = 360 / EUROPEAN_WHEEL.length;
          const angle = sector * i;
          const tickW = Math.max(1, Math.floor(SZ * 0.004));
          const tickH = Math.max(6, Math.floor(SZ * 0.06));
          const radiusTranslate = -Math.floor(SZ / 2 - tickH - Math.floor(SZ * 0.01));
          return (
            <Animated.View
              key={`t-${i}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: tickW,
                height: tickH,
                backgroundColor: '#ffffff',
                borderRadius: tickW,
                opacity: 0.7,
                transform: [ { translateX: -Math.floor(tickW / 2) }, { translateY: -Math.floor(tickH / 2) }, { rotate: `${angle}deg` }, { translateY: radiusTranslate } ],
              }}
            />
          );
        })}
        {EUROPEAN_WHEEL.map((num, i) => {
          const angle = (360 / EUROPEAN_WHEEL.length) * i;
          const labelW = Math.max(18, Math.floor(SZ * 0.09));
          const labelH = Math.max(12, Math.floor(labelW * 0.6));
          const labelRadiusTranslate = -Math.floor(SZ / 2 - Math.floor(SZ * 0.16));
          return (
            <Animated.View
              key={`l-${i}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: labelW,
                height: labelH,
                transform: [ { translateX: -Math.floor(labelW / 2) }, { translateY: -Math.floor(labelH / 2) }, { rotate: `${angle}deg` }, { translateY: labelRadiusTranslate } ],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ minWidth: labelW, height: labelH, paddingHorizontal: 4, borderRadius: Math.floor(labelH / 2), backgroundColor: 'rgba(15,23,42,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: Math.max(8, Math.floor(labelH * 0.55)) }}>{num}</Text>
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>
      {/* Centro fijo (no rota) */}
      <View style={{ width: SZ * 0.18, height: SZ * 0.18, borderRadius: SZ * 0.09, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#824a02', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 }}>
        <View style={{ width: SZ * 0.08, height: SZ * 0.08, borderRadius: SZ * 0.04, backgroundColor: '#0f172a' }} />
      </View>
    </View>
  );
}

export default memo(WheelView);

const styles = StyleSheet.create({});


