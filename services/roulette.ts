export type WheelNumber = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36;
export type ColorKey = 'red' | 'black' | 'green';
export type ParityKey = 'par' | 'impar';
export type DozenKey = '1' | '2' | '3';
export type RangeKey = '1-18' | '19-36';

export const EUROPEAN_WHEEL: WheelNumber[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_SET = new Set<WheelNumber>([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export function numberColor(n: WheelNumber): ColorKey {
  if (n === 0) return 'green';
  return RED_SET.has(n) ? 'red' : 'black';
}

export function computeAnglePerSector(): number { return 360 / EUROPEAN_WHEEL.length; }

export function quantizeAngleToIndex(deg: number): number {
  const angle = ((deg % 360) + 360) % 360;
  const per = computeAnglePerSector();
  return Math.floor(angle / per) % EUROPEAN_WHEEL.length;
}

export type BetKind = 'num' | 'color' | 'parity' | 'dozen' | 'range';

export function computePayout(bets: Map<string, number>, result: WheelNumber): number {
  const get = (k: string) => bets.get(k) || 0;
  const k = (kind: BetKind, v: string | number) => `${kind}:${v}`;
  let payout = 0;
  payout += get(k('num', result)) * 36;
  if (result !== 0) {
    const col = numberColor(result);
    if (col !== 'green') payout += get(k('color', col)) * 2;
    const parity = result % 2 === 0 ? 'par' : 'impar';
    payout += get(k('parity', parity)) * 2;
    if (result >= 1 && result <= 18) payout += get(k('range', '1-18')) * 2;
    if (result >= 19 && result <= 36) payout += get(k('range', '19-36')) * 2;
    if (result >= 1 && result <= 12) payout += get(k('dozen', '1')) * 3;
    if (result >= 13 && result <= 24) payout += get(k('dozen', '2')) * 3;
    if (result >= 25 && result <= 36) payout += get(k('dozen', '3')) * 3;
  }
  return payout;
}


