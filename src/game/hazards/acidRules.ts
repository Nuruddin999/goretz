import type { Rect } from '../combat/ratRules';
export const acidPools = [{ x: 4660, from: 4730, to: 4842 }];
export const acidFrameAt = (time: number) => Math.floor(time / 120) % 8;
export function touchesAcid(player: Rect, from: number, to: number, floor: number): boolean {
  return player.x + player.width > from && player.x < to &&
    player.y + player.height >= floor - 9 && player.y < floor + 5;
}
