function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}>{children}</span>;
}

const steps = [
  {
    k: "01",
    title: "Call missed",
    detail: "After-hours ring. Nobody at the host stand.",
  },
  {
    k: "02",
    title: "Reply texted",
    detail: "Agent texts back: we can seat you tonight.",
  },
  {
    k: "03",
    title: "Table booked",
    detail: "Guest replies yes. Reservation is on the book.",
  },
];

export default function ExampleCard() {
  return (
    <aside className="col-span-4 border-t border-line px-5 py-6 md:col-span-3 md:border-l md:border-t-0 md:px-6 md:pb-10 md:pt-16">
      <div className="example-card border border-teal/25 bg-ink2 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Mono className="text-teal">Example</Mono>
          <Mono className="text-dim">Not a real business</Mono>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-snug tracking-tight">
          An agent handling a missed restaurant call.
        </p>

        <ol className="example-steps mt-5 space-y-0">
          {steps.map((step) => (
            <li key={step.k} className="example-step border-l-2 border-line py-2.5 pl-3">
              <div className="flex items-baseline gap-2">
                <Mono className="text-teal">{step.k}</Mono>
                <p className="text-[13px] font-medium leading-snug">{step.title}</p>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-mute">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
        Connor Barrett · Minneapolis, MN
      </p>
    </aside>
  );
}
