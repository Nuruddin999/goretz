import type { Rect } from '../combat/ratRules';
export const acidPools = [{ x: 4660, from: 4730, to: 4842 }];
export const acidTiming = { warning: 1000, emission: 1800, clearing: 1800, safe: 3200 };
export const acidCycle = 7800;
export const acidFrameAt = (time: number) => Math.floor(time / 120) % 8;
export type AcidPhase = 'warning' | 'emission' | 'clearing' | 'safe';
export function acidPhaseAt(time: number): AcidPhase {
  const t = Math.max(0, time) % acidCycle;
  return t < 1000 ? 'warning' : t < 2800 ? 'emission' : t < 4600 ? 'clearing' : 'safe';
}
export type AcidBubble = { x: number; y: number; radius: number; alpha: number };
export function acidBubblesAt(time: number, x: number, floor: number): AcidBubble[] {
  const t = Math.max(0, time) % acidCycle;
  const bubbles: AcidBubble[] = [];
  for (let i = 0; i < 7; i++) {
    const age = t - acidTiming.warning - i * 260;
    if (age < 0 || age >= 1600) continue;
    const evaporation = Math.max(0, (age - 1200) / 400);
    bubbles.push({
      x: x + 75 + (i % 3) * 34 + Math.sin(age / 210 + i) * 5,
      y: floor - 12 - age * .17,
      radius: 18 + evaporation * 7,
      alpha: 1 - evaporation,
    });
  }
  return bubbles;
}
export function touchesBubble(player: Rect, bubble: AcidBubble): boolean {
  const x = Math.max(player.x, Math.min(player.x + player.width, bubble.x));
  const y = Math.max(player.y, Math.min(player.y + player.height, bubble.y));
  return bubble.alpha > .12 && (x - bubble.x) ** 2 + (y - bubble.y) ** 2 < bubble.radius ** 2;
}
