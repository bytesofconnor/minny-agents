// FIG. 01 — a restaurant's day. Deterministic, decorative; not measured data.
const W = 1200, H = 440, L = 132, R = 24, T = 28, B = 64;
const PW = W - L - R, N = 7, STEP = 30, AMP = 108;
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
  const lunchW = 0.048 + 0.006 * (i % 3);
  const dinnerW = 0.052 + 0.005 * ((i + 1) % 3);
  const base =
    lunchAmp[i] * g(LUNCH + 0.01 * Math.sin(i * 1.1), lunchW) +
    dinnerAmp[i] * g(DINNER + 0.012 * Math.cos(i * 0.8), dinnerW) +
    morningAmp[i] * g(MORNING, 0.055);
  const ripple = 0.07 * Math.sin(x * 52 + i * 2) * Math.sin(x * 6.5 + i);
  const env = 0.62 + 0.38 * Math.sin(((i + 1) / (N + 1)) * Math.PI);
  return Math.max(0, (0.16 + base * 0.95 + ripple) * env);
}

const M = 160;
function ridge(i: number) {
  const y0 = T + 118 + i * STEP;
  const pts = Array.from({ length: M + 1 }, (_, k) => {
    const x = k / M;
    return [L + x * PW, y0 - sig(i, x) * AMP] as const;
  });
  const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  return { line, fill: `${line} L${L + PW},${y0} L${L},${y0} Z`, y0 };
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

function peakX(i: number, from: number, to: number) {
  let bx = from, bv = -1;
  for (let k = 0; k <= 80; k++) {
    const x = from + ((to - from) * k) / 80;
    const v = sig(i, x);
    if (v > bv) {
      bv = v;
      bx = x;
    }
  }
  return { x: L + bx * PW, y: ridges[i].y0 - bv * AMP };
}

export default function Fig() {
  const lunch = peakX(0, LUNCH - 0.06, LUNCH + 0.06);
  const dinner = peakX(3, DINNER - 0.06, DINNER + 0.06);

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="draw block h-auto w-full" role="img" aria-label="Illustrative chart of a restaurant day across seven incoming channels from open to close">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#1a2340" strokeWidth="1"/></pattern>
      </defs>
      {TICKS.map((h) => {
        const x = L + hourToX(h) * PW;
        return (
          <g key={h}>
            <line x1={x} x2={x} y1={T} y2={kpY + kpH} stroke="#1a2340" strokeWidth="1" strokeDasharray={h % 6 ? "2 4" : undefined}/>
            <text x={x} y={kpY + kpH + 22} fill="#8b95ad" fontSize="11" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="middle">{fmtHour(h)}</text>
          </g>
        );
      })}
      <text x={L + PW} y={kpY + kpH + 40} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end" letterSpacing="1">TIME OF DAY →</text>
      {ridges.map((r, i) => (
        <g key={CHANNELS[i]}>
          <path className="f" d={r.fill} fill="#060a1a" style={{ animationDelay: `${0.2 + i * 0.08}s` }} />
          <path className="r" d={r.line} fill="none" stroke={colors[i]} strokeWidth={i === 0 || i === 3 ? 1.6 : 1} strokeOpacity={i === 0 || i === 3 ? 1 : 0.85} style={{ animationDelay: `${i * 0.12}s` }} />
          <text x={L - 10} y={r.y0 + 3} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">{CHANNELS[i]}</text>
        </g>
      ))}
      <g style={{fontFamily:"var(--font-mono-x)"}} fontSize="11">
        <circle cx={lunch.x} cy={lunch.y} r="3.5" fill="none" stroke="#eaf0f6" />
        <line x1={lunch.x} y1={lunch.y - 6} x2={lunch.x} y2={T + 14} stroke="#eaf0f6" strokeWidth="0.75" />
        <line x1={lunch.x} y1={T + 14} x2={lunch.x + 18} y2={T + 14} stroke="#eaf0f6" strokeWidth="0.75" />
        <text x={lunch.x + 24} y={T + 18} fill="#eaf0f6">A — Lunch rush</text>
        <text x={lunch.x + 24} y={T + 33} fill="#8b95ad">calls go unanswered</text>
      </g>
      <g style={{fontFamily:"var(--font-mono-x)"}} fontSize="11">
        <circle cx={dinner.x} cy={dinner.y} r="3.5" fill="none" stroke="#9b8cff" />
        <line x1={dinner.x} y1={dinner.y - 6} x2={dinner.x} y2={T + 70} stroke="#9b8cff" strokeWidth="0.75" />
        <text x={dinner.x + 8} y={T + 74} fill="#9b8cff">B — Dinner rush</text>
        <text x={dinner.x + 8} y={T + 89} fill="#8b95ad">reviews and messages pile up</text>
      </g>
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
