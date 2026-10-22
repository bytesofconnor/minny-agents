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
    <aside className="col-span-4 border-t border-line px-5 py-8 md:col-span-5 md:border-l md:border-t-0 md:px-6 md:pb-12 md:pt-16 lg:col-span-4 lg:px-7">
      <div className="example-card border border-teal/25 bg-ink2 px-6 py-7 md:px-7 md:py-8">
        <Mono className="example-kicker block whitespace-nowrap text-teal">
          Example
        </Mono>
        <p className="mt-5 text-[16px] font-medium leading-relaxed tracking-tight">
          An agent handling a missed restaurant call.
        </p>

        <ol className="example-steps mt-7 space-y-2">
          {steps.map((step) => (
            <li key={step.k} className="example-step border-l-2 border-line py-3.5 pl-4">
              <div className="flex items-baseline gap-2.5">
                <Mono className="text-teal">{step.k}</Mono>
                <p className="text-[14px] font-medium leading-snug">{step.title}</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
        Connor Barrett · Minneapolis, MN
      </p>
    </aside>
  );
}
