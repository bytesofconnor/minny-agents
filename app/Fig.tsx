// FIG. 01 — synthetic auroral signal. Deterministic, decorative; not measured data.
const W = 1200, H = 440, L = 56, R = 24, T = 28, B = 64;
const PW = W - L - R, N = 9, STEP = 24, AMP = 96;
const colors = ["#7cf2a0","#6eebab","#5fe4b6","#4fdfbe","#3cdbc0","#52c9d6","#6fb3ea","#87a0f7","#9b8cff"];
function sig(i: number, x: number) {
  const c1 = 0.42 + 0.03 * Math.sin(i * 1.3), c2 = 0.7 + 0.04 * Math.cos(i * 0.9);
  const g = (c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w));
  const base = 0.85 * g(c1, 0.07 + 0.01 * (i % 3)) + 0.45 * g(c2, 0.05) + 0.18 * g(0.18 + 0.02 * i, 0.04);
  const ripple = 0.06 * Math.sin(x * 60 + i * 2) * Math.sin(x * 7 + i) ;
  const env = 0.35 + 0.65 * Math.sin(((i + 1) / (N + 1)) * Math.PI);
  return Math.max(0, (base + ripple + 0.04) * env);
}
const M = 160;
function ridge(i: number) {
  const y0 = T + 128 + i * STEP;
  const pts = Array.from({ length: M + 1 }, (_, k) => { const x = k / M; return [L + x * PW, y0 - sig(i, x) * AMP] as const; });
  const line = "M" + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  return { line, fill: `${line} L${L + PW},${y0} L${L},${y0} Z`, y0 };
}
const ridges = Array.from({ length: N }, (_, i) => ridge(i));
const kp = Array.from({ length: 48 }, (_, k) => { const x = (k + 0.5) / 48; return Math.min(9, Math.round(1 + 7 * (0.9 * Math.exp(-((x - 0.43) ** 2) / 0.008) + 0.5 * Math.exp(-((x - 0.71) ** 2) / 0.004)) + 1.2 * Math.abs(Math.sin(k * 1.7)))); });
const kpY = H - B + 8, kpH = 40;

export default function Fig() {
  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="draw block h-auto w-full" role="img" aria-label="Decorative ridgeline chart of a synthetic auroral signal">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#1a2340" strokeWidth="1"/></pattern>
      </defs>
      {/* gridlines */}
      {Array.from({ length: 13 }, (_, k) => { const x = L + (k / 12) * PW; return (
        <g key={k}>
          <line x1={x} x2={x} y1={T} y2={kpY + kpH} stroke="#1a2340" strokeWidth="1" strokeDasharray={k % 3 ? "2 4" : undefined}/>
          <text x={x} y={kpY + kpH + 22} fill="#8b95ad" fontSize="11" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="middle">{String(k * 2).padStart(2, "0")}:00</text>
        </g>); })}
      <text x={L + PW} y={kpY + kpH + 40} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end" letterSpacing="1">TIME (UTC) →</text>
      {/* ridges, back to front */}
      {ridges.map((r, i) => (
        <g key={i}>
          <path className="f" d={r.fill} fill="#060a1a" style={{ animationDelay: `${0.2 + i * 0.08}s` }} />
          <path className="r" d={r.line} fill="none" stroke={colors[i]} strokeWidth={i === 4 ? 1.6 : 1} strokeOpacity={i === 4 ? 1 : 0.85} style={{ animationDelay: `${i * 0.12}s` }} />
          <text x={L - 10} y={r.y0 + 3} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">{`B${String(i + 1).padStart(2, "0")}`}</text>
        </g>
      ))}
      {/* annotation */}
      {(() => { let bx=0,bv=-1; for(let k=0;k<=200;k++){const v=sig(4,k/200); if(v>bv){bv=v;bx=k/200;}} const x = L + bx * PW, y = ridges[4].y0 - bv * AMP; return (
        <g style={{fontFamily:"var(--font-mono-x)"}} fontSize="11">
          <circle cx={x} cy={y} r="3.5" fill="none" stroke="#eaf0f6" />
          <line x1={x} y1={y - 6} x2={x} y2={T + 14} stroke="#eaf0f6" strokeWidth="0.75" />
          <line x1={x} y1={T + 14} x2={x + 18} y2={T + 14} stroke="#eaf0f6" strokeWidth="0.75" />
          <text x={x + 24} y={T + 18} fill="#eaf0f6">A — signal peak</text>
          <text x={x + 24} y={T + 33} fill="#8b95ad">band B05, reference trace</text>
        </g>); })()}
      {(() => { let bx=0.6,bv=-1; for(let k=120;k<=170;k++){const v=sig(6,k/200); if(v>bv){bv=v;bx=k/200;}} const x = L + bx * PW, y = ridges[6].y0 - bv * AMP; return (
        <g style={{fontFamily:"var(--font-mono-x)"}} fontSize="11">
          <circle cx={x} cy={y} r="3.5" fill="none" stroke="#9b8cff" />
          <line x1={x} y1={y - 6} x2={x} y2={T + 70} stroke="#9b8cff" strokeWidth="0.75" />
          <text x={x + 8} y={T + 74} fill="#9b8cff">B — secondary arc</text>
        </g>); })()}
      {/* Kp-style bars */}
      <rect x={L} y={kpY} width={PW} height={kpH} fill="url(#hatch)" opacity="0.6" />
      <line x1={L} x2={L + PW} y1={kpY + kpH} y2={kpY + kpH} stroke="#8b95ad" strokeWidth="1" />
      {kp.map((v, k) => { const bw = PW / 48, h = (v / 9) * kpH; const c = v >= 7 ? "#9b8cff" : v >= 5 ? "#3cdbc0" : "#7cf2a0"; return (
        <rect key={k} className="k" x={L + k * bw + 1.5} y={kpY + kpH - h} width={bw - 3} height={h} fill={c} opacity={v >= 5 ? 0.95 : 0.55} style={{ animationDelay: `${1 + k * 0.015}s` }} />); })}
      <text x={L - 10} y={kpY + 22} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">IDX</text>
      <text x={L - 10} y={kpY + kpH} fill="#4a5470" fontSize="10" style={{fontFamily:"var(--font-mono-x)"}} textAnchor="end">0</text>
    </svg>
  );
}
