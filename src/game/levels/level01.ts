export type GroundPoint = { x: number; y: number };
// Extend the first clearing without changing the later village spacing.
export const pathX = (x: number) => x >= 1370 ? x + 400 : x;
export const level01 = {
  width: 5600, height: 1620,
  spawn: { x: 150, y: 506 }, finish: { x: 5400, y: 1260 },
  // A continuous village hillside. Only the ravine interrupts the footpath.
  ground: [
    { x: 0, y: 550 }, { x: 540, y: 550 },
    { x: 940, y: 665 }, { x: 1370, y: 665 },
    { x: 1760, y: 780 }, { x: 2180, y: 780 },
    { x: 2540, y: 880 }, { x: 2950, y: 880 },
    { x: 3360, y: 1010 }, { x: 3820, y: 1010 },
    { x: 4250, y: 1140 }, { x: 4590, y: 1140 },
    { x: 4840, y: 1260 }, { x: 5200, y: 1260 },
  ].map(p => ({ ...p, x: pathX(p.x) })) satisfies GroundPoint[],
  gaps: [{ from: 4030, to: 4160 }],
  // Quiet gaps alternate with small house/stone clusters.
  trees: [40, 780, 2360, 3990, 4760].map(pathX),
  shrubs: [170, 540, 2220, 3290, 4870].map(pathX),
  rocks: [540, 3290, 4910].map(pathX),
  houses: [
    { x: 365, key: 'house-balcony', scale: 0.9 },
    { x: 2060, key: 'house-small', scale: 1.05 },
    { x: 3480, key: 'house-small', scale: 0.7 },
    { x: 5070, key: 'house-small', scale: 0.8 },
  ].map(h => ({ ...h, x: pathX(h.x) })),
};

export function groundY(x: number): number {
  const points = level01.ground;
  const clamped = Math.max(0, Math.min(level01.width, x));
  for (let i = 1; i < points.length; i++) {
    if (clamped <= points[i].x) {
      const a = points[i - 1], b = points[i];
      return a.y + (b.y - a.y) * ((clamped - a.x) / (b.x - a.x));
    }
  }
  return points[points.length - 1].y;
}

export function isGap(x: number): boolean {
  return level01.gaps.some(g => x > g.from && x < g.to);
}
