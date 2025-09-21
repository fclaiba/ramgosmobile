import * as React from 'react';
import { View, Text } from 'react-native';

type Props = {
  size: number;
};

// European roulette order matching CatRouletteScreen.WHEEL_NUMBERS
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_SET = new Set<number>([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function numberColor(n: number): string {
  // Match CatRouletteScreen: 0 -> '#00E676', reds '#D9534F', blacks '#222'
  if (n === 0) return '#00E676';
  return RED_SET.has(n) ? '#D9534F' : '#222';
}

/**
 * Simple presentational roulette wheel: draws slices as positioned labels.
 * The rotation is handled by parent via Animated.View.
 */
export default function RouletteWheel({ size }: Props) {
  const radius = size / 2;
  const anglePer = 360 / WHEEL_NUMBERS.length;

  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#0f1a0f', alignItems: 'center', justifyContent: 'center' }}>
      {/* outer ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: radius, borderWidth: 8, borderColor: '#e6f2ea' }} />
      {/* center hub */}
      <View style={{ width: size * 0.16, height: size * 0.16, borderRadius: (size * 0.16) / 2, backgroundColor: '#111', borderWidth: 4, borderColor: '#e6f2ea', zIndex: 5 }} />

      {WHEEL_NUMBERS.map((n, i) => {
        const angleDeg = i * anglePer + anglePer / 2; // center of slice
        const theta = (angleDeg * Math.PI) / 180;
        const textR = radius * 0.78;
        const x = radius + textR * Math.cos(theta);
        const y = radius + textR * Math.sin(theta);
        const bg = numberColor(n);
        return (
          <View
            key={`slice-${i}`}
            style={{ position: 'absolute', left: x - 16, top: y - 12 }}
          >
            <View
              style={{
                minWidth: 24,
                paddingHorizontal: 6,
                height: 24,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bg,
                borderWidth: 2,
                borderColor: '#fff',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{n}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

