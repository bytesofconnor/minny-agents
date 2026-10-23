import Link from "next/link";
import Mark from "./Mark";

export function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}>{children}</span>;
}

export function Btn({ children = "Get in touch", solid = true, href = "/#contact" }: { children?: React.ReactNode; solid?: boolean; href?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-6 border px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors ${solid ? "border-paper bg-paper text-ink hover:border-teal hover:bg-teal" : "border-line text-paper hover:border-paper"}`}>
      {children}<span aria-hidden>↗</span>
    </Link>
  );
}

const nav = [
  ["What we build", "01", "/#what-we-build"],
  ["FAQ", "02", "/#faq"],
  ["Contact", "03", "/#contact"],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur">
      <nav className="grid h-14 grid-cols-4 items-center md:grid-cols-12">
        <Link href="/" className="col-span-2 flex items-center gap-3 px-5 md:col-span-3 md:px-6">
          <span className="inline-flex items-center gap-2.5">
            <Mark className="h-5 w-5 shrink-0 text-teal" />
            <span className="text-[15px] tracking-[-0.015em]">
              <span className="font-bold">Minny</span>
              <span className="font-normal text-mute"> Agents</span>
            </span>
          </span>
          <Mono className="hidden text-dim lg:inline">MA/26</Mono>
        </Link>
        <div className="col-span-5 hidden gap-8 md:flex">
          {nav.map(([l, n, href]) => (
            <Link key={l} href={href} className="group flex items-baseline gap-2 text-sm text-mute hover:text-paper">
              <Mono className="text-dim group-hover:text-teal">{n}</Mono>{l}
            </Link>
          ))}
        </div>
        <div className="col-span-2 flex justify-end md:col-span-4">
          <Link href="/#contact" className="flex h-14 items-center gap-3 border-l border-line px-5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors hover:bg-paper hover:text-ink md:px-6">
            <span className="hidden sm:inline">Get in touch</span><span className="sm:hidden">Contact</span><span aria-hidden>↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="grid grid-cols-4 gap-y-2 border-t border-line px-5 py-5 md:grid-cols-12 md:px-6">
      <span className="col-span-4 md:col-span-6">
        <span className="block font-mono text-[12px] text-mute">© 2026 Minny Agents, Minneapolis.</span>
        <span className="mt-1 flex flex-wrap gap-3">
          <Link href="/restaurants" className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim hover:text-paper">Restaurants</Link>
          <Link href="/home-services" className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim hover:text-paper">Home services</Link>
          <Link href="/clinics" className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim hover:text-paper">Clinics</Link>
        </span>
      </span>
      <Mono className="col-span-2 text-dim md:col-span-3">44.98°N 93.27°W</Mono>
      <Mono className="col-span-2 text-right text-dim md:col-span-3">Rev. 2026.10</Mono>
    </footer>
  );
}
