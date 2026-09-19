/**
 * Shared coordinates for the hero picture, in a 560×420 box with y pointing
 * down. The static SVG poster and the three.js scene both draw from these, so
 * the canvas can sit exactly on top of the poster.
 */
export const HERO_VIEW = { width: 560, height: 420 } as const;

export type Point = readonly [number, number];
export type Curve = readonly [Point, Point, Point, Point];

export const CORE = { x: 262, y: 210, r: 26 } as const;

const INPUT_COUNT = 14;

/** Many small inputs, fanned down the left edge, all resolving into the core. */
export const INPUT_CURVES: Curve[] = Array.from({ length: INPUT_COUNT }, (_, index) => {
  const y = 28 + (index * 364) / (INPUT_COUNT - 1);
  const startX = 6 + ((index * 37) % 5) * 9;
  return [[startX, y], [120, y], [168, CORE.y], [CORE.x - CORE.r, CORE.y]] as const;
});

export const OUTPUT_Y = [92, 210, 328] as const;

/** Three typed answers leave the core. */
export const OUTPUT_CURVES: Curve[] = OUTPUT_Y.map((y) => [[CORE.x + CORE.r, CORE.y], [342, CORE.y], [338, y], [396, y]] as const);

export const CHOICE = { x: 410, y: OUTPUT_Y[0] - 11, size: 22, gap: 8, options: 4 } as const;
export const SCORE = { cx: 466, cy: OUTPUT_Y[1] + 18, r: 46 } as const;
export const NOUL = { x: 410, y: OUTPUT_Y[2] - 7, width: 124, height: 14 } as const;

/** The answers the poster shows, and the first ones the live scene shows. */
export const RESTING = { choice: 2, score: 0.68, noul: 0.82 } as const;

export function pointOn([p0, p1, p2, p3]: Curve, t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

export function curvePath([p0, p1, p2, p3]: Curve): string {
  return `M${p0[0]} ${p0[1]}C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;
}

export function choiceX(index: number): number {
  return CHOICE.x + index * (CHOICE.size + CHOICE.gap);
}

/** The dial sweeps the upper half circle: 0 points left, 1 points right. */
export function scoreAngle(value: number): number {
  return Math.PI * (1 - value);
}

export function scoreTip(value: number, length: number = SCORE.r - 8): [number, number] {
  const angle = scoreAngle(value);
  return [SCORE.cx + Math.cos(angle) * length, SCORE.cy - Math.sin(angle) * length];
}
