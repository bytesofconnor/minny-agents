// Micro flow diagram: input node → agent node → output node(s).
export default function Flow({ i, o, c }: { i: string; o: string[]; c: string }) {
  const W = 260, H = 64, y = 32;
  const mono = { fontFamily: "var(--font-mono-x)" };
  const oy = o.length === 1 ? [y] : [y - 14, y + 14];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[300px]" aria-hidden>
      <rect x="0.5" y={y - 10} width="66" height="20" fill="none" stroke="#4a5470" />
      <text x="33" y={y + 3.5} fill="#8b95ad" fontSize="9" textAnchor="middle" style={mono}>{i}</text>
      <line x1="67" x2="98" y1={y} y2={y} stroke="#4a5470" />
      <circle cx="98" cy={y} r="1.5" fill="#4a5470" />
      <rect x="100.5" y={y - 13} width="58" height="26" fill={c} fillOpacity="0.12" stroke={c} />
      <text x="129.5" y={y + 3.5} fill={c} fontSize="9" textAnchor="middle" letterSpacing="1" style={mono}>AGENT</text>
      {oy.map((yy, k) => (
        <g key={k}>
          <path d={`M159 ${y} H174 V${yy} H190`} fill="none" stroke="#4a5470" />
          <path d={`M186 ${yy - 3} L190 ${yy} L186 ${yy + 3}`} fill="none" stroke="#4a5470" />
          <rect x="192.5" y={yy - 9} width="66" height="18" fill="none" stroke="#4a5470" strokeDasharray="2 2" />
          <text x="225.5" y={yy + 3.5} fill="#eaf0f6" fontSize="9" textAnchor="middle" style={mono}>{o[k]}</text>
        </g>
      ))}
    </svg>
  );
}
