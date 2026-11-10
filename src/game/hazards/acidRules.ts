import type { Rect } from '../combat/ratRules';
export const acidPools = [{ x: 1430, from: 1500, to: 1612 }];
export const acidFrameAt = (time: number) => Math.floor(time / 120) % 8;
export function touchesAcid(player: Rect, from: number, to: number, floor: number): boolean {
  return player.x + player.width > from && player.x < to &&
    player.y + player.height >= floor - 9 && player.y < floor + 5;
}
