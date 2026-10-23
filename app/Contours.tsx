import { contactLake, heroLake, ringPath, type Lake } from "./lake";

const lakes = { hero: heroLake, contact: contactLake } as const;

export default function Contours({ lake }: { lake: keyof typeof lakes }) {
  const spec: Lake = lakes[lake];
  return (
    <div className="contours" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#3CDBC0" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
          {spec.scales.map((scale) => (
            <path key={scale} d={ringPath(spec, scale)} />
          ))}
        </g>
      </svg>
    </div>
  );
}
