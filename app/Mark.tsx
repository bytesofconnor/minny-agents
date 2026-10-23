import { MARK_VIEWBOX, STAR_D, WAVE_D } from "./mark";

export default function Mark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
      <path d={STAR_D} />
      <path d={WAVE_D} />
    </svg>
  );
}
