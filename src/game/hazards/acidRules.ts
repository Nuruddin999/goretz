import type { Rect } from '../combat/ratRules';
export const acidPools = [{ x: 4660, from: 4730, to: 4842 }];
export const acidCycle = 2400;
export const acidFrameAt = (time: number) => Math.floor(time / 120) % 8;
export type AcidBubble = { x: number; y: number; radius: number; alpha: number };
export function acidBubblesAt(time: number, x: number, floor: number): AcidBubble[] {
  const phase = Math.max(0,time) % acidCycle;
  const bubbles: AcidBubble[]=[];
  for(let i=0;i<2;i++){
    const age=phase-i*450;
    if(age<0 || age>=1100)continue;
    const evaporation=Math.max(0,(age-850)/250);
    bubbles.push({x:x+96+i*48,y:floor-12-age*.22,radius:18+evaporation*5,alpha:1-evaporation});
  }
  return bubbles;
}
export function touchesBubble(player: Rect, bubble: AcidBubble): boolean {
  const x = Math.max(player.x, Math.min(player.x + player.width, bubble.x));
  const y = Math.max(player.y, Math.min(player.y + player.height, bubble.y));
  return bubble.alpha > .12 && (x - bubble.x) ** 2 + (y - bubble.y) ** 2 < bubble.radius ** 2;
}
