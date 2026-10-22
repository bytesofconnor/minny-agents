import { writeFileSync } from "node:fs";

// Tiny inline copy of the hero ring math so the static file stays in sync
// without a TS loader. Values must match app/lake.ts heroLake.
const lake = {
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

function wr(t, harmonics) {
  let r = 1;
  let dr = 0;
  for (const { k, a, p } of harmonics) {
    r += a * Math.cos(k * t + p);
    dr += -a * k * Math.sin(k * t + p);
  }
  return { r, dr };
}
function pos(t, scale) {
  const rx = lake.maxRx * scale;
  const ry = rx * lake.aspect;
  const { r } = wr(t, lake.harmonics);
  const lx = rx * r * Math.cos(t);
  const ly = ry * r * Math.sin(t);
  const c = Math.cos(lake.rot);
  const s = Math.sin(lake.rot);
  return { x: lake.cx + lx * c - ly * s, y: lake.cy + lx * s + ly * c };
}
function tan(t, scale) {
  const rx = lake.maxRx * scale;
  const ry = rx * lake.aspect;
  const { r, dr } = wr(t, lake.harmonics);
  const dlx = rx * (dr * Math.cos(t) - r * Math.sin(t));
  const dly = ry * (dr * Math.sin(t) + r * Math.cos(t));
  const c = Math.cos(lake.rot);
  const s = Math.sin(lake.rot);
  return { dx: dlx * c - dly * s, dy: dlx * s + dly * c };
}
function ringPath(scale, segments = 24) {
  const dt = (Math.PI * 2) / segments;
  const p0 = pos(0, scale);
  let d = `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`;
  for (let i = 0; i < segments; i++) {
    const t0 = i * dt;
    const t1 = t0 + dt;
    const a = pos(t0, scale);
    const b = pos(t1, scale);
    const ta = tan(t0, scale);
    const tb = tan(t1, scale);
    d += `C${(a.x + (ta.dx * dt) / 3).toFixed(2)} ${(a.y + (ta.dy * dt) / 3).toFixed(2)},${(b.x - (tb.dx * dt) / 3).toFixed(2)} ${(b.y - (tb.dy * dt) / 3).toFixed(2)},${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const paths = lake.scales
  .map((s) => `    <path d="${ringPath(s)}" opacity="1"/>`)
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <!-- Hero lake. Visibility is --contour-opacity in globals.css. -->
  <g fill="none" stroke="#3CDBC0" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">
${paths}
  </g>
</svg>
`;

writeFileSync(new URL("../public/lake-contours.svg", import.meta.url), svg);
console.log("wrote public/lake-contours.svg", lake.scales.length, "rings");
