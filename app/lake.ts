export type Harmonic = { k: number; a: number; p: number };

export type Lake = {
  cx: number;
  cy: number;
  maxRx: number;
  aspect: number;
  rot: number;
  harmonics: Harmonic[];
  scales: number[];
};

/** Hero: lower-right behind the card. Uneven spacing, gentle 2nd/3rd harmonic. */
export const heroLake: Lake = {
  cx: 1080,
  cy: 700,
  maxRx: 680,
  aspect: 0.73,
  rot: (-14 * Math.PI) / 180,
  harmonics: [
    { k: 2, a: 0.048, p: -0.4 },
    { k: 3, a: 0.022, p: 0.85 },
  ],
  scales: [0.2, 0.31, 0.4, 0.52, 0.61, 0.73, 0.84, 1],
};

/** Contact: a different basin — rounder, opposite tilt, extra 4th harmonic. */
export const contactLake: Lake = {
  cx: 1240,
  cy: 680,
  maxRx: 540,
  aspect: 0.9,
  rot: (21 * Math.PI) / 180,
  harmonics: [
    { k: 2, a: 0.036, p: 1.15 },
    { k: 3, a: 0.028, p: -0.55 },
    { k: 4, a: 0.014, p: 0.3 },
  ],
  scales: [0.24, 0.37, 0.46, 0.59, 0.71, 0.83, 1],
};

function wr(t: number, harmonics: Harmonic[]) {
  let r = 1;
  let dr = 0;
  for (const { k, a, p } of harmonics) {
    r += a * Math.cos(k * t + p);
    dr += -a * k * Math.sin(k * t + p);
  }
  return { r, dr };
}

function pos(t: number, lake: Lake, scale: number) {
  const rx = lake.maxRx * scale;
  const ry = rx * lake.aspect;
  const { r } = wr(t, lake.harmonics);
  const lx = rx * r * Math.cos(t);
  const ly = ry * r * Math.sin(t);
  const c = Math.cos(lake.rot);
  const s = Math.sin(lake.rot);
  return { x: lake.cx + lx * c - ly * s, y: lake.cy + lx * s + ly * c };
}

function tan(t: number, lake: Lake, scale: number) {
  const rx = lake.maxRx * scale;
  const ry = rx * lake.aspect;
  const { r, dr } = wr(t, lake.harmonics);
  const dlx = rx * (dr * Math.cos(t) - r * Math.sin(t));
  const dly = ry * (dr * Math.sin(t) + r * Math.cos(t));
  const c = Math.cos(lake.rot);
  const s = Math.sin(lake.rot);
  return { dx: dlx * c - dly * s, dy: dlx * s + dly * c };
}

/** C1 cubic approximation of one similar ring. Same shape, scaled — rings cannot cross. */
export function ringPath(lake: Lake, scale: number, segments = 24): string {
  const dt = (Math.PI * 2) / segments;
  const p0 = pos(0, lake, scale);
  let d = `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`;
  for (let i = 0; i < segments; i++) {
    const t0 = i * dt;
    const t1 = t0 + dt;
    const a = pos(t0, lake, scale);
    const b = pos(t1, lake, scale);
    const ta = tan(t0, lake, scale);
    const tb = tan(t1, lake, scale);
    d += `C${(a.x + ta.dx * dt / 3).toFixed(2)} ${(a.y + ta.dy * dt / 3).toFixed(2)},${(b.x - tb.dx * dt / 3).toFixed(2)} ${(b.y - tb.dy * dt / 3).toFixed(2)},${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return `${d}Z`;
}
