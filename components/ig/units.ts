import { Dimensions, PixelRatio } from 'react-native';

export function useWindowUnits() {
  const { width, height } = Dimensions.get('window');
  const vh = (n: number) => (height * n) / 100;
  const vw = (n: number) => (width * n) / 100;
  // Base rem ~16 px scaled by pixel ratio
  const base = 16 * PixelRatio.getFontScale();
  const rem = (n: number) => n * base;
  return { vh, vw, rem, width, height };
}


