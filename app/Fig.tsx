// FIG. 01 — a restaurant's day. Deterministic, decorative; not measured data.
const W = 1200, H = 472, L = 132, R = 24, T = 88, B = 64;
const PW = W - L - R, N = 7, STEP = 32, AMP = 96;
const colors = ["#7cf2a0", "#5fe4b6", "#3cdbc0", "#52c9d6", "#6fb3ea", "#87a0f7", "#9b8cff"];
const CHANNELS = [
  "Phone calls",
  "Texts",
  "Online orders",
  "Reviews",
  "Catering",
  "Supplier email",
  "Staff messages",
];
const START_H = 6;
const END_H = 23;
const SPAN = END_H - START_H;
const hourToX = (h: number) => (h - START_H) / SPAN;
const LUNCH = hourToX(12.25);
const DINNER = hourToX(18.5);
const MORNING = hourToX(8.5);
const lunchAmp = [1.0, 0.72, 0.95, 0.32, 0.38, 0.22, 0.82];
const dinnerAmp = [0.92, 0.86, 0.78, 1.0, 0.28, 0.18, 0.96];
const morningAmp = [0.18, 0.22, 0.12, 0.06, 0.42, 0.78, 0.2];

function sig(i: number, x: number) {
  const g = (c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w));
  const lunchW = i === 0 ? 0.042 : 0.048 + 0.006 * (i % 3);
  const dinnerW = i === 3 ? 0.044 : 0.052 + 0.005 * ((i + 1) % 3);
  const base =
    lunchAmp[i] * g(LUNCH + 0.01 * Math.sin(i * 1.1), lunchW) +
    dinnerAmp[i] * g(DINNER + 0.012 * Math.cos(i * 0.8), dinnerW) +
    morningAmp[i] * g(MORNING, 0.055);
  const ripple = 0.028 * Math.sin(x * 40 + i * 2) * Math.sin(x * 6.5 + i);
  const env = 0.62 + 0.38 * Math.sin(((i + 1) / (N + 1)) * Math.PI);
  return Math.max(0, (0.16 + base * 0.95 + ripple) * env);
}

const M = 160;
function ridge(i: number) {
  const y0 = T + 108 + i * STEP;
  const pts = Array.from({ length: M + 1 }, (_, k) => {
    const x = k / M;
    return [L + x * PW, y0 - sig(i, x) * AMP] as const;
  });
  const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  return { line, fill: `${line} L${L + PW},${y0} L${L},${y0} Z`, y0, startY: pts[0][1], pts };
}

const ridges = Array.from({ length: N }, (_, i) => ridge(i));
const kp = Array.from({ length: 48 }, (_, k) => {
  const x = (k + 0.5) / 48;
  const lunch = Math.exp(-((x - LUNCH) ** 2) / 0.007);
  const dinner = Math.exp(-((x - DINNER) ** 2) / 0.006);
  return Math.min(9, Math.round(1 + 7.4 * (0.95 * lunch + 0.92 * dinner) + 0.7 * Math.abs(Math.sin(k * 1.15))));
});
const kpY = H - B + 8, kpH = 40;
const TICKS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

function fmtHour(h: number) {
  if (h === 0 || h === 24) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

/** Marker sits on a polyline vertex — the same points that draw the curve. */
function peakOnRidge(i: number, from: number, to: number) {
  const lo = L + from * PW;
  const hi = L + to * PW;
  let best = ridges[i].pts[0];
  for (const p of ridges[i].pts) {
    if (p[0] >= lo && p[0] <= hi && p[1] < best[1]) best = p;
  }
  return { x: best[0], y: best[1] };
}

function labelWidth(title: string, sub: string) {
  const chars = Math.max(title.length, sub.length);
  return Math.ceil(chars * 6.7 + 20);
}

function Annotation({
  peak,
  title,
  sub,
  color,
  align,
}: {
  peak: { x: number; y: number };
  title: string;
  sub: string;
  color: string;
  align: "start" | "end";
}) {
  const boxH = 36;
  const boxW = labelWidth(title, sub);
  const gap = 10;
  const boxX = align === "end" ? peak.x - gap - boxW : peak.x + gap;
  const boxY = 10;
  const leaderTop = boxY + boxH + 2;
  return (
    <g style={{ fontFamily: "var(--font-mono-x)" }} fontSize="11">
      <line x1={peak.x} y1={leaderTop} x2={peak.x} y2={peak.y - 5} stroke={color} strokeWidth="0.85" strokeOpacity="0.7" />
      <circle cx={peak.x} cy={peak.y} r="3.4" fill="#060a1a" stroke={color} strokeWidth="1.5" />
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="3" fill="#060a1a" fillOpacity="0.94" stroke={color} strokeWidth="0.6" strokeOpacity="0.35" />
      <text x={boxX + 10} y={boxY + 15} fill={color}>{title}</text>
      <text x={boxX + 10} y={boxY + 28} fill="#8b95ad">{sub}</text>
    </g>
  );
}

export default function Fig() {
  const lunch = peakOnRidge(0, LUNCH - 0.08, LUNCH + 0.08);
  const dinner = peakOnRidge(3, DINNER - 0.08, DINNER + 0.08);

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="draw block h-auto w-full" role="img" aria-label="Illustrative chart of a restaurant day across seven incoming channels from open to close">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#1a2340" strokeWidth="1"/></pattern>
      </defs>
      {TICKS.map((h) => {
        const x = L + hourToX(h) * PW;
        return (
          <g key={h}>
            <line x1={x} x2={x} y1={kpY + kpH} y2={kpY + kpH + 5} stroke="#4a5470" strokeWidth="1" />
            <text x={x} y={kpY + kpH + 22} fill="#8b95ad" fontSize="11" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="middle">{fmtHour(h)}</text>
          </g>
        );
      })}
      <text x={L + PW} y={kpY + kpH + 40} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end" letterSpacing="1">TIME OF DAY →</text>
      {ridges.map((r, i) => (
        <g key={CHANNELS[i]}>
          <path className="f" d={r.fill} fill="#060a1a" style={{ animationDelay: `${0.2 + i * 0.08}s` }} />
          <path className="r" d={r.line} fill="none" stroke={colors[i]} strokeWidth="1.3" strokeOpacity="0.92" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 0.12}s` }} />
          <text x={L - 10} y={r.startY} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end" dominantBaseline="central" alignmentBaseline="central">{CHANNELS[i]}</text>
        </g>
      ))}
      <Annotation peak={lunch} title="A — Lunch rush" sub="calls go unanswered" color="#eaf0f6" align="end" />
      <Annotation peak={dinner} title="B — Dinner rush" sub="reviews and messages pile up" color="#9b8cff" align="start" />
      <rect x={L} y={kpY} width={PW} height={kpH} fill="url(#hatch)" opacity="0.6" />
      <line x1={L} x2={L + PW} y1={kpY + kpH} y2={kpY + kpH} stroke="#8b95ad" strokeWidth="1" />
      {kp.map((v, k) => {
        const bw = PW / 48, h = (v / 9) * kpH;
        const c = v >= 7 ? "#9b8cff" : v >= 5 ? "#3cdbc0" : "#7cf2a0";
        return (
          <rect key={k} className="k" x={L + k * bw + 1.5} y={kpY + kpH - h} width={bw - 3} height={h} fill={c} opacity={v >= 5 ? 0.95 : 0.55} style={{ animationDelay: `${1 + k * 0.015}s` }} />
        );
      })}
      <text x={L - 10} y={kpY + 14} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">REQ</text>
      <text x={L - 10} y={kpY + kpH} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">0</text>
      <text x={L + 8} y={kpY - 6} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} letterSpacing="0.6">Incoming requests per hour</text>
    </svg>
  );
}
