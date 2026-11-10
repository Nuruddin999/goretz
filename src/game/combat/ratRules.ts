export type Rect = { x: number; y: number; width: number; height: number };
export type RatRoute = { x: number; from: number; to: number; speed: number };
// The first encounter is alone on level ground. Pairs arrive later, and both
// banks of the ravine remain clear so combat never obscures the jump lesson.
export const ratRoutes: RatRoute[] = [
  { x: 1160, from: 1010, to: 1280, speed: 60 },
  { x: 1980, from: 1810, to: 2100, speed: 68 },
  { x: 2660, from: 2580, to: 2730, speed: 72 },
  { x: 2870, from: 2800, to: 2920, speed: 72 },
  { x: 4330, from: 4280, to: 4380, speed: 78 },
  { x: 4510, from: 4460, to: 4550, speed: 78 },
];
export function contact(player: Rect, rat: Rect, previousBottom: number, velocityY: number): 'none' | 'stomp' | 'hurt' {
  if (player.x + player.width <= rat.x || player.x >= rat.x + rat.width ||
      player.y + player.height < rat.y || player.y >= rat.y + rat.height) return 'none';
  return velocityY > 0 && previousBottom <= rat.y + 7 ? 'stomp' : 'hurt';
}
export class Health {
  remaining = 3;
  immuneUntil = -Infinity;
  hit(time: number): boolean {
    if (this.remaining === 0 || time < this.immuneUntil) return false;
    this.remaining--;
    this.immuneUntil = time + 1200;
    return true;
  }
}
export function patrolDirection(x: number, direction: number, route: RatRoute, unsafe: (x: number) => boolean): number {
  const ahead = x + direction * 36;
  if (ahead < route.from || ahead > route.to || unsafe(ahead)) return -direction;
  return direction;
}
