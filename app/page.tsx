import Fig from "./Fig";
import Flow from "./Flow";

const MAIL = "mailto:hello@northernbytes.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://northern-bytes.vercel.app";

const steps = [
  { n: "01", t: "Discovery", w: "Week 1", s: 0, e: 1, c: "bg-green", d: "Workflows, success metrics, architecture, and a working v0." },
  { n: "02", t: "Production", w: "Weeks 2–6", s: 1, e: 6, c: "bg-teal", d: "The highest-leverage agent, shipped with evals, guardrails, and monitoring." },
  { n: "03", t: "Ongoing", w: "Week 7 →", s: 6, e: 10, c: "bg-violet", d: "We operate, extend, and add new agents as your needs grow, or hand everything off to your team cleanly." },
];
const WEEKS = 10;
const caps = [
  { t: "Agents & automation", d: "Agents that take repetitive work off your team — triage, follow-up, reporting, operations.", k: "AGT" },
  { t: "AI-native internal tools", d: "Software designed around models from the start, wired into the systems you already run.", k: "TLS" },
  { t: "Web platforms", d: "Fast, production-grade web products, from booking flows to customer portals.", k: "WEB" },
  { t: "Data & analytics", d: "Pipelines and dashboards that turn scattered data into decisions.", k: "DAT" },
];
const apps = [
  { a: "Missed calls & after-hours questions", t: "The phone rings during the dinner rush and nobody can pick up. Callers asking about hours, the menu, or parking just hang up.", w: "Texts back every missed call within a minute, answers common questions from your menu and hours, and hands anything else to staff in Slack.", s: "Phone · SMS · Slack", i: "MISSED CALL", o: ["TEXT REPLY", "STAFF"], c: "#7cf2a0" },
  { a: "Catering & large-party inquiries", t: "Catering requests arrive by email, web form, and DM. Quotes get built by hand, and some slip for days.", w: "Collects the date, headcount, and dietary needs, drafts a quote from your catering menu for the owner to approve, and follows up if the customer goes quiet.", s: "Email · Forms · Quotes", i: "INQUIRY", o: ["QUOTE DRAFT", "FOLLOW-UP"], c: "#3cdbc0" },
  { a: "Supplier invoices into the books", t: "Paper and emailed invoices from food and supply vendors get keyed into QuickBooks by hand every week.", w: "Reads each invoice, matches it to the vendor, checks prices against the last order, enters it in QuickBooks, and flags anything unusual for review.", s: "Email · OCR · QuickBooks", i: "INVOICE", o: ["QUICKBOOKS", "FLAGGED"], c: "#52c9d6" },
  { a: "Reviews & reputation", t: "Google and Yelp reviews pile up unanswered, and complaints get noticed late.", w: "Drafts a reply to every new review in your voice for one-tap approval, and alerts the manager right away about any complaint about food safety or a staff issue.", s: "Google · Yelp · Slack", i: "NEW REVIEW", o: ["REPLY DRAFT", "MANAGER ALERT"], c: "#87a0f7" },
  { a: "Shift swaps & the weekly schedule", t: "Shift swaps and call-outs happen in a group text, and the manager rebuilds the schedule by hand.", w: "Takes swap and time-off requests in Slack or text, finds someone eligible to cover, gets the manager's OK, and updates the schedule.", s: "Slack · SMS · Scheduling", i: "REQUEST", o: ["COVERAGE", "SCHEDULE"], c: "#9b8cff" },
];

const faqs = [
  { q: "What is a forward-deployed engineer?", a: "We work on-site or embedded with your team, building directly in your environment. No handoffs, no decks — we scope outcomes, ship working software, and stay accountable to what runs in production." },
  { q: "How is Northern Bytes different from an agency or consultancy?", a: "We don't do staff augmentation, roadmaps, or discovery-only engagements. We commit to outcomes, build in your stack, and deliver production systems in weeks, not months." },
  { q: "What kinds of work do you take on?", a: "AI agents and automation, AI-native internal tools, web platforms, and data pipelines. We focus on high-leverage work that removes bottlenecks or replaces repetitive manual processes." },
  { q: "How does an engagement start?", a: "Week 1 is Discovery: we map workflows, define success metrics, agree on architecture, and deliver a working v0. If it's a fit, we move to Production (weeks 2–6) to ship the full system." },
  { q: "How long until something is in production?", a: "Week 1 delivers a working v0. By the end of week 6, the highest-leverage agent or system is live with evals, guardrails, and monitoring. Ongoing work begins week 7." },
  { q: "Do you work with small businesses?", a: "Yes, if the work is a good fit. We prioritize engagements where an agent or system can deliver measurable value quickly, regardless of company size." },
  { q: "Where are you based?", a: "Minneapolis, MN. We work with teams across the United States." },
];

function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] uppercase tracking-[0.08em] ${className}`}>{children}</span>;
}
function Btn({ children = "Start a conversation", solid = true }: { children?: React.ReactNode; solid?: boolean }) {
  return (
    <a href={MAIL} className={`inline-flex items-center gap-6 border px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors ${solid ? "border-paper bg-paper text-ink hover:border-teal hover:bg-teal" : "border-line text-paper hover:border-paper"}`}>
      {children}<span aria-hidden>↗</span>
    </a>
  );
}
function Sec({ id, n, label, children }: { id?: string; n: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-14 border-t border-line">
      <div className="grid grid-cols-4 md:grid-cols-12">
        <div className="col-span-4 flex items-baseline gap-4 px-5 pt-6 md:col-span-3 md:px-6 md:pt-8">
          <Mono className="text-teal">§ {n}</Mono><Mono className="text-mute">{label}</Mono>
        </div>
        <div className="col-span-4 md:col-span-9">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Northern Bytes",
        url: SITE_URL,
        logo: `${SITE_URL}/opengraph-image`,
        foundingDate: "2026",
        founder: {
          "@type": "Person",
          name: "Connor Barrett",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Minneapolis",
          addressRegion: "MN",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "44.98",
          longitude: "-93.27",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@northernbytes.co",
          contactType: "Business Inquiries",
        },
        areaServed: {
          "@type": "Country",
          name: "United States",
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: "Northern Bytes",
        provider: { "@id": `${SITE_URL}/#organization` },
        serviceType: "Forward-deployed engineering",
        areaServed: { "@type": "Country", name: "United States" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Engineering Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agents & automation", description: "Agents that take repetitive work off your team — triage, follow-up, reporting, operations." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI-native internal tools", description: "Software designed around models from the start, wired into the systems you already run." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web platforms", description: "Fast, production-grade web products, from booking flows to customer portals." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Data & analytics", description: "Pipelines and dashboards that turn scattered data into decisions." } },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="cols min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[1440px] border-x border-line bg-ink/0">
        {/* column markers */}
        <div className="grid grid-cols-4 border-b border-line md:grid-cols-12">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={`px-2 py-1 ${i > 3 ? "hidden md:block" : ""}`}><Mono className="text-[9px] text-dim">C{String(i + 1).padStart(2, "0")}</Mono></div>
          ))}
        </div>

        <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur">
          <nav className="grid h-14 grid-cols-4 items-center md:grid-cols-12">
            <a href="#" className="col-span-2 flex items-baseline gap-3 px-5 md:col-span-3 md:px-6">
              <span className="text-[15px] font-semibold tracking-[-0.01em]">Northern Bytes</span>
              <Mono className="hidden text-dim lg:inline">NB/26</Mono>
            </a>
            <div className="col-span-5 hidden gap-8 md:flex">
              {[["Approach", "02"], ["Capabilities", "03"], ["FAQ", "05"], ["Contact", "06"]].map(([l, n]) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="group flex items-baseline gap-2 text-sm text-mute hover:text-paper">
                  <Mono className="text-dim group-hover:text-teal">{n}</Mono>{l}
                </a>
              ))}
            </div>
            <div className="col-span-2 flex justify-end md:col-span-4">
              <a href={MAIL} className="flex h-14 items-center gap-3 border-l border-line px-5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors hover:bg-paper hover:text-ink md:px-6">
                <span className="hidden sm:inline">Start a conversation</span><span className="sm:hidden">Contact</span><span aria-hidden>↗</span>
              </a>
            </div>
          </nav>
        </header>

        {/* hero */}
        <section className="grid grid-cols-4 md:grid-cols-12">
          <div className="col-span-4 px-5 pb-12 pt-16 md:col-span-9 md:px-6 md:pb-16 md:pt-24">
            <Mono className="text-mute"><span className="text-teal">§ 00</span>&nbsp;&nbsp;Independent forward-deployed engineering</Mono>
            <h1 className="mt-8 max-w-[15ch] text-[44px] font-medium leading-[0.95] tracking-[-0.035em] sm:text-[68px] lg:text-[96px]">
              Forward-deployed engineers for the agent era.
            </h1>
            <div className="mt-10 grid gap-8 md:grid-cols-9">
              <p className="text-lg leading-relaxed text-mute md:col-span-5 md:text-xl">
                We embed with your team and ship production AI systems inside your business. <span className="text-paper">Working software, in weeks.</span>
              </p>
              <div className="md:col-span-4 md:flex md:items-end md:justify-end"><Btn /></div>
            </div>
          </div>
          <aside className="col-span-4 border-t border-line px-5 py-6 md:col-span-3 md:border-l md:border-t-0 md:px-6 md:pt-24">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-1">
              {[
                ["Based", "Minneapolis, MN"],
                ["Coordinates", "44.98°N 93.27°W"],
                ["Founder", "Connor Barrett"],
                ["Practice", "Forward-deployed engineering"],
              ].map(([k, v]) => (
                <div key={k as string}><dt><Mono className="text-dim">{k}</Mono></dt><dd className="mt-1 font-mono text-[13px] text-paper">{v}</dd></div>
              ))}
            </dl>
          </aside>
        </section>

        {/* figure */}
        <figure className="border-t border-line" aria-label="Aurora visualization showing signal intensity across 9 bands over 24 hours">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-3 md:px-6">
            <Mono className="text-paper">Fig. 01 — Aurora, as signal</Mono>
            <Mono className="hidden text-dim sm:inline">9 bands · 24h window · synthetic</Mono>
          </div>
          <div className="overflow-x-auto px-2 pb-2 pt-4 md:overflow-hidden md:px-6"><div className="min-w-[760px] md:min-w-0"><Fig /></div></div>
          <Mono className="block px-5 pb-2 text-dim md:hidden">← scroll figure →</Mono>
          <figcaption className="grid grid-cols-4 gap-4 border-t border-line px-5 py-3 md:grid-cols-12 md:px-6">
            <span className="col-span-4 font-mono text-[11px] text-dim md:col-span-6">Illustrative. Generated, not measured — a nod to the northern sky over Minnesota.</span>
            <div className="col-span-4 flex flex-wrap gap-5 md:col-span-6 md:justify-end">
              {[["bg-green", "Low"], ["bg-teal", "Moderate"], ["bg-violet", "High"]].map(([c, l]) => (
                <span key={l} className="flex items-center gap-2"><span className={`h-2 w-4 ${c}`} aria-hidden="true" /><Mono className="text-mute">{l}</Mono></span>
              ))}
            </div>
          </figcaption>
        </figure>

        <Sec n="01" label="Positioning">
          <div className="grid gap-8 px-5 pb-20 pt-10 md:grid-cols-9 md:px-6 md:pb-32 md:pt-8">
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:col-span-4 md:text-6xl">Not a consultancy.</h2>
            <div className="md:col-span-5">
              <p className="text-xl leading-relaxed md:text-2xl">No decks, no roadmaps, no staff augmentation. <span className="text-mute">We scope outcomes, build in your environment, and stay accountable to what runs.</span></p>
              <ul className="mt-10 grid grid-cols-3 border-t border-line">
                {["Scope outcomes", "Build in place", "Own what runs"].map((x, i) => (
                  <li key={x} className={`pt-3 ${i ? "border-l border-line pl-3" : ""}`}><Mono className="block text-dim">0{i + 1}</Mono><span className="mt-1 block text-sm text-mute">{x}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </Sec>

        <Sec id="approach" n="02" label="Approach">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">How we engage.</h2>
              <Mono className="hidden text-dim md:inline">Fig. 02 — Engagement timeline</Mono>
            </div>
            <div className="mt-12 border-t border-paper/60">
              {/* axis */}
              <div className="grid grid-cols-[1fr] md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]">
                <div className="hidden py-2 md:block"><Mono className="text-dim">Phase</Mono></div>
                <div className="relative grid py-2" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
                  {Array.from({ length: WEEKS }, (_, w) => <Mono key={w} className="border-l border-line pl-1 text-[10px] text-dim">W{w + 1}{w === WEEKS - 1 ? "+" : ""}</Mono>)}
                </div>
              </div>
              {steps.map((s) => (
                <div key={s.n} className="grid grid-cols-1 border-t border-line md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]">
                  <div className="py-6 pr-8">
                    <div className="flex items-baseline gap-4"><Mono className="text-teal">{s.n}</Mono><h3 className="text-xl font-medium tracking-tight">{s.t}</h3><Mono className="ml-auto text-mute">{s.w}</Mono></div>
                    <p className="mt-2 text-[15px] leading-relaxed text-mute">{s.d}</p>
                  </div>
                  <div className="relative grid min-h-12 pb-6 md:py-0" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
                    {Array.from({ length: WEEKS }, (_, w) => <div key={w} className="border-l border-dashed border-line" />)}
                    <div className="absolute inset-y-0 flex items-center" style={{ left: `${(s.s / WEEKS) * 100}%`, width: `${((s.e - s.s) / WEEKS) * 100}%` }}>
                      <div className={`h-3 w-full ${s.c} ${s.n === "03" ? "opacity-40" : ""}`} style={s.n === "03" ? { maskImage: "repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 10px)" } : undefined} />
                      {s.n === "03" && <span className="absolute -right-1 font-mono text-xs text-violet">→</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-paper/60 pt-2"><Mono className="text-dim">T0 = kickoff</Mono><Mono className="text-dim">Ongoing phase is open-ended</Mono></div>
            </div>
          </div>
        </Sec>

        <Sec id="capabilities" n="03" label="Capabilities">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">What we build.</h2>
            <table className="mt-12 w-full border-collapse text-left">
              <thead><tr className="border-b border-paper/60">
                <th className="w-14 py-2 font-normal"><Mono className="text-dim">No.</Mono></th>
                <th className="py-2 font-normal"><Mono className="text-dim">Capability</Mono></th>
                <th className="hidden py-2 font-normal md:table-cell"><Mono className="text-dim">Description</Mono></th>
                <th className="w-16 py-2 text-right font-normal"><Mono className="text-dim">Ref</Mono></th>
              </tr></thead>
              <tbody>
                {caps.map((c, i) => (
                  <tr key={c.t} className="group border-b border-line align-baseline transition-colors hover:bg-ink2">
                    <td className="py-6"><Mono className="text-teal">{String(i + 1).padStart(2, "0")}</Mono></td>
                    <td className="py-6 pr-6"><span className="text-xl font-medium tracking-tight md:text-2xl">{c.t}</span><p className="mt-2 text-[15px] text-mute md:hidden">{c.d}</p></td>
                    <td className="hidden py-6 pr-6 text-[15px] leading-relaxed text-mute md:table-cell">{c.d}</td>
                    <td className="py-6 text-right"><Mono className="text-dim group-hover:text-paper">{c.k}</Mono></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sec>

        <Sec id="applications" n="04" label="Applications">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">Where agents earn their keep.</h2>
              <Mono className="text-dim">Fig. 03 — Example engagements · illustrative</Mono>
            </div>
            <p className="mt-4 text-[15px] text-mute">Examples from restaurants, shops, and service businesses.</p>
            <div className="mt-12 border-t border-paper/60">
              <div className="hidden grid-cols-[2.2rem_1.1fr_1.4fr_1.4fr_1.3fr] gap-6 py-2 lg:grid">
                {["No.", "Area", "Today", "With an agent", "Flow · systems"].map(h => <Mono key={h} className="text-dim">{h}</Mono>)}
              </div>
              {apps.map((x, k) => (
                <div key={x.a} className="grid grid-cols-1 gap-4 border-t border-line py-7 lg:grid-cols-[2.2rem_1.1fr_1.4fr_1.4fr_1.3fr] lg:gap-6">
                  <div className="flex items-baseline gap-4 lg:contents">
                    <Mono className="text-teal">{String(k + 1).padStart(2, "0")}</Mono>
                    <h3 className="text-xl font-medium tracking-tight">{x.a}</h3>
                  </div>
                  <div><Mono className="mb-1 block text-dim lg:hidden">Today</Mono><p className="text-[15px] leading-relaxed text-mute">{x.t}</p></div>
                  <div><Mono className="mb-1 block text-dim lg:hidden">With an agent</Mono><p className="text-[15px] leading-relaxed text-paper">{x.w}</p></div>
                  <div><Flow i={x.i} o={x.o} c={x.c} /><Mono className="mt-2 block text-mute">{x.s}</Mono></div>
                </div>
              ))}
              <div className="flex justify-between border-t border-paper/60 pt-2"><Mono className="text-dim">Examples, not case studies</Mono><Mono className="text-dim">Scoped per business</Mono></div>
            </div>
            <div className="mt-16 grid gap-6 border-t border-line pt-6 md:grid-cols-9">
              <div className="md:col-span-2"><Mono className="text-teal">Shipped</Mono></div>
              <div className="md:col-span-7">
                <p className="text-xl leading-snug tracking-tight md:text-2xl">Pinkys Up — a booking platform (<a href="https://www.pinkysup.social" className="underline decoration-line underline-offset-4 hover:decoration-teal">pinkysup.social</a>), designed and built end to end.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-9">
              <div className="md:col-span-2"><Mono className="text-mute">Background</Mono></div>
              <div className="md:col-span-7">
                <p className="mb-4 text-[13px] uppercase tracking-[0.08em] text-dim">Engineering experience from teams at</p>
                <div className="mb-5 grid grid-cols-2 items-center gap-x-6 gap-y-4 text-white md:flex md:gap-x-8">
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">American Family Insurance</span>
                  <span className="text-[17px] font-bold tracking-tight opacity-50 transition-opacity hover:opacity-90">3M</span>
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">DNV</span>
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">Livefront</span>
                </div>
                <p className="text-[14px] leading-relaxed text-mute">Built software across insurance, energy and utilities, manufacturing, and healthcare.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-block rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-dim">Claude Certified Architect</span>
                  <span className="inline-block rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-dim">Microsoft Azure Fundamentals (AZ-900)</span>
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-9">
              <div className="md:col-span-2"><Mono className="text-mute">AI tooling</Mono></div>
              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                  <div className="flex flex-col items-center gap-1.5 opacity-30 transition-opacity hover:opacity-60">
                    <img src="/icons/claude.svg" alt="" className="h-[20px] w-[20px] brightness-0 invert" />
                    <span className="text-[11px] text-mute">Claude</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-30 transition-opacity hover:opacity-60">
                    <span className="flex h-[20px] min-w-[70px] items-center justify-center rounded border border-line bg-ink2 px-2 text-[9px] font-bold text-mute">Grok Bot</span>
                    <span className="text-[11px] text-mute">Grok Bot</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-30 transition-opacity hover:opacity-60">
                    <img src="/icons/cursor.svg" alt="" className="h-[20px] w-[20px] brightness-0 invert" />
                    <span className="text-[11px] text-mute">Cursor</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 opacity-30 transition-opacity hover:opacity-60">
                    <svg className="h-[20px] w-[20px]" viewBox="0 0 24 24" fill="currentColor" aria-label="OpenAI">
                      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                    </svg>
                    <span className="text-[11px] text-mute">Codex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Sec>

        <Sec id="faq" n="05" label="FAQ">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">Frequently asked questions.</h2>
            <dl className="mt-12 border-t border-line">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-line py-8">
                  <dt className="text-xl font-medium tracking-tight md:text-2xl">{faq.q}</dt>
                  <dd className="mt-4 max-w-3xl text-[15px] leading-relaxed text-mute">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Sec>

        <Sec id="contact" n="06" label="Contact">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-28 md:pt-8">
            <h2 className="max-w-[12ch] text-5xl font-medium leading-[0.95] tracking-[-0.035em] md:text-[96px]">Bring us a workflow.</h2>
            <div className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-9">
              <p className="text-lg leading-relaxed text-mute md:col-span-4 md:text-xl">Tell us what&apos;s slowing your team down. We&apos;ll tell you if an agent can fix it.</p>
              <div className="flex flex-wrap items-center gap-4 md:col-span-5 md:justify-end">
                <Btn /><Btn solid={false}>hello@northernbytes.co</Btn>
              </div>
            </div>
          </div>
        </Sec>

        <footer className="grid grid-cols-4 gap-y-2 border-t border-line px-5 py-5 md:grid-cols-12 md:px-6">
          <span className="col-span-4 font-mono text-[12px] text-mute md:col-span-6">© 2026 Northern Bytes, Minneapolis.</span>
          <Mono className="col-span-2 text-dim md:col-span-3">44.98°N 93.27°W</Mono>
          <Mono className="col-span-2 text-right text-dim md:col-span-3">Rev. 2026.10</Mono>
        </footer>
      </div>
    </div>
  );
}
