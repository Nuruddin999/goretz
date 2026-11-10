import type { Rect } from '../combat/ratRules';
export const acidPools = [{ x: 4660, from: 4730, to: 4842 }];
export const acidCycle = 3200;
export const acidFrameAt = (time: number) => Math.floor(time / 120) % 8;
export type AcidBubble = { x: number; y: number; radius: number; alpha: number };
export function acidBubblesAt(time: number, x: number, floor: number): AcidBubble[] {
  const age = Math.max(0,time) % acidCycle;
  if(age >= 1400) return [];
  const evaporation=Math.max(0,(age-1100)/300);
  return [{x:x+96, y:floor-12-age*.16, radius:18+evaporation*5, alpha:1-evaporation}];
}
export function touchesBubble(player: Rect, bubble: AcidBubble): boolean {
  const x = Math.max(player.x, Math.min(player.x + player.width, bubble.x));
  const y = Math.max(player.y, Math.min(player.y + player.height, bubble.y));
  return bubble.alpha > .12 && (x - bubble.x) ** 2 + (y - bubble.y) ** 2 < bubble.radius ** 2;
}
