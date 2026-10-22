import { Btn, Mono } from "./Chrome";
import Contours from "./Contours";
import ExampleCard from "./ExampleCard";
import Fig from "./Fig";
import Flow from "./Flow";
import { faqs, homeJsonLd } from "./seo";

const quickWins = [
  { a: "Missed calls & after-hours questions", p: "The phone rings during the dinner rush and nobody can answer.", w: "We build an AI that texts back every missed call, answers menu and hours questions, and hands anything else to your team in Slack.", s: "Phone · SMS · Slack", i: "MISSED CALL", o: ["TEXT REPLY", "STAFF"], c: "#7cf2a0" },
  { a: "Catering & large-party inquiries", p: "Catering requests come in everywhere and quotes take forever.", w: "We build an AI that collects what you need, drafts quotes from your menu for you to approve, and follows up when customers go quiet.", s: "Email · Forms · Quotes", i: "INQUIRY", o: ["QUOTE DRAFT", "FOLLOW-UP"], c: "#3cdbc0" },
  { a: "Supplier invoices into the books", p: "Invoices from vendors get keyed into QuickBooks by hand every week.", w: "We build an AI that reads each invoice, matches the vendor, checks prices, enters it in QuickBooks, and flags anything unusual.", s: "Email · OCR · QuickBooks", i: "INVOICE", o: ["QUICKBOOKS", "FLAGGED"], c: "#52c9d6" },
  { a: "Reviews & reputation", p: "Google and Yelp reviews pile up and you see complaints too late.", w: "We build an AI that drafts a reply to every review for you to approve with one tap, and alerts you immediately about food safety or staff complaints.", s: "Google · Yelp · Slack", i: "NEW REVIEW", o: ["REPLY DRAFT", "MANAGER ALERT"], c: "#87a0f7" },
  { a: "Shift swaps & the weekly schedule", p: "Shift swaps happen in group texts and you rebuild the schedule by hand.", w: "We build an AI that takes requests in Slack or text, finds someone to cover, gets your OK, and updates the schedule.", s: "Slack · SMS · Scheduling", i: "REQUEST", o: ["COVERAGE", "SCHEDULE"], c: "#9b8cff" },
];

const biggerProjects = [
  { a: "Weekly owner briefing", p: "Sales, labor, invoices, and reviews live in five different apps.", w: "We build a weekly plain-English summary pulling from your POS, scheduling, invoices, and reviews, flagging what changed and what needs attention.", s: "POS · Scheduling · Reports", i: "SOURCES", o: ["SUMMARY", "FLAGS"], c: "#7cf2a0" },
  { a: "Menu profit check", p: "Supplier prices go up and you don't know which dishes stopped making money.", w: "We connect invoice prices to your recipes and sales and flag dishes whose margins slipped.", s: "Invoices · Recipes · POS", i: "PRICES", o: ["MARGINS", "ALERTS"], c: "#3cdbc0" },
  { a: "Prep and ordering forecasts", p: "Over-prep means waste; under-prep means 86ing your best sellers.", w: "We use your sales history, weather, local events, and reservations to suggest prep and order amounts your kitchen manager approves.", s: "Sales · Weather · Events", i: "DATA", o: ["FORECAST", "APPROVAL"], c: "#52c9d6" },
];

function Sec({ id, n, label, children, className = "" }: { id?: string; n: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-14 border-t border-line ${className}`}>
      <div className="grid grid-cols-4 md:grid-cols-12">
        <div className="col-span-4 border-r border-line px-5 py-3 md:col-span-2 md:px-6">
          <Mono className="text-mute"><span className="text-teal">§ {n}</span>&nbsp;&nbsp;{label}</Mono>
        </div>
        <div className="col-span-4 md:col-span-10">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd()) }} />
        {/* hero */}
        <section className="hero grid grid-cols-4 md:grid-cols-12">
          <Contours lake="hero" />
          <div className="relative z-10 col-span-4 px-5 pb-12 pt-16 md:col-span-7 md:px-6 md:pb-16 md:pt-24 lg:col-span-8">
            <Mono className="text-mute">Minneapolis, MN</Mono>
            <h1 className="mt-8 max-w-[18ch] text-[44px] font-medium leading-[0.95] tracking-[-0.035em] sm:text-[68px] lg:text-[88px]">
              Missed calls, piled-up reviews, invoices in your inbox.
            </h1>
            <p className="mt-8 max-w-[50ch] text-xl leading-relaxed text-mute md:text-2xl">
              We build AI agents that answer, follow up, and keep the books moving for Twin Cities businesses.
            </p>
            <div className="mt-10"><Btn /></div>
          </div>
          <ExampleCard />
        </section>

        <Sec id="what-we-build" n="01" label="What we build">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">What we can take off your plate.</h2>
            
            {/* Quick wins */}
            <div className="mt-12 border-t border-paper/60 pt-8">
              <h3 className="text-2xl font-medium tracking-tight">Quick wins</h3>
              <p className="mt-2 text-[15px] text-mute">Pick one thing eating your time. Typically a week or two.</p>
              <div className="mt-8 space-y-10">
                {quickWins.map((x, k) => (
                  <div key={x.a} className="grid grid-cols-1 gap-6 md:grid-cols-[2.5rem_1fr]">
                    <Mono className="text-teal">{String(k + 1).padStart(2, "0")}</Mono>
                    <div>
                      <h4 className="text-xl font-medium tracking-tight">{x.a}</h4>
                      <p className="mt-2 text-[15px] leading-relaxed text-mute">{x.p}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-paper">{x.w}</p>
                      <Flow i={x.i} o={x.o} c={x.c} />
                      <Mono className="mt-2 block text-mute">{x.s}</Mono>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bigger projects */}
            <div className="mt-16 rounded-sm border border-teal/20 bg-gradient-to-br from-teal/5 to-violet/5 p-6 md:p-8">
              <h3 className="text-2xl font-medium tracking-tight">Bigger projects</h3>
              <p className="mt-2 text-[15px] text-mute">Connect your systems so you can see where the money goes. Multi-week.</p>
              <div className="mt-8 space-y-10">
                {biggerProjects.map((x, k) => (
                  <div key={x.a} className="grid grid-cols-1 gap-6 md:grid-cols-[2.5rem_1fr]">
                    <Mono className="text-teal">{String(k + 1).padStart(2, "0")}</Mono>
                    <div>
                      <h4 className="text-xl font-medium tracking-tight">{x.a}</h4>
                      <p className="mt-2 text-[15px] leading-relaxed text-mute">{x.p}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-paper">{x.w}</p>
                      <Flow i={x.i} o={x.o} c={x.c} />
                      <Mono className="mt-2 block text-mute">{x.s}</Mono>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 border-t border-paper/60 pt-6">
              <p className="text-[13px] text-dim">We build one custom system at a time. You approve anything that talks to customers or touches money.</p>
            </div>
          </div>
        </Sec>

        {/* figure */}
        <figure className="border-t border-line" aria-label="Illustrative restaurant day across seven incoming channels from open to close">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-3 md:px-6">
            <Mono className="text-paper">Fig. 01 — A restaurant&apos;s day</Mono>
            <Mono className="hidden text-dim sm:inline">7 channels · open to close · example</Mono>
          </div>
          <div className="overflow-x-auto px-2 pb-2 pt-4 md:overflow-hidden md:px-6"><div className="min-w-[760px] md:min-w-0"><Fig /></div></div>
          <Mono className="block px-5 pb-2 text-dim md:hidden">← scroll figure →</Mono>
          <figcaption className="grid grid-cols-4 gap-4 border-t border-line px-5 py-3 md:grid-cols-12 md:px-6">
            <span className="col-span-4 font-mono text-[11px] text-dim md:col-span-6">Illustrative example. Not real data.</span>
            <div className="col-span-4 flex flex-wrap gap-5 md:col-span-6 md:justify-end">
              {[["bg-green", "Quiet"], ["bg-teal", "Busy"], ["bg-violet", "Rush"]].map(([c, l]) => (
                <span key={l} className="flex items-center gap-2"><span className={`h-2 w-4 ${c}`} aria-hidden="true" /><Mono className="text-mute">{l}</Mono></span>
              ))}
            </div>
          </figcaption>
        </figure>

        <Sec n="00" label="How we work">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <div className="grid gap-12 md:grid-cols-3">
              <div>
                <Mono className="text-teal">01</Mono>
                <h3 className="mt-3 text-xl font-medium tracking-tight">Week 1</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">We spend time with you, understand the problem, and build a working first version.</p>
              </div>
              <div>
                <Mono className="text-teal">02</Mono>
                <h3 className="mt-3 text-xl font-medium tracking-tight">Weeks 2–6</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">We finish the system and put it in production with tests and monitoring.</p>
              </div>
              <div>
                <Mono className="text-teal">03</Mono>
                <h3 className="mt-3 text-xl font-medium tracking-tight">Week 7+</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">Optional ongoing support or a clean handoff to your team.</p>
              </div>
            </div>
            <div className="mt-16 grid gap-6 border-t border-line pt-6 md:grid-cols-9">
              <div className="md:col-span-2"><Mono className="text-mute">Background</Mono></div>
              <div className="md:col-span-7">
                <p className="mb-4 text-[13px] uppercase tracking-[0.08em] text-dim">Engineering experience from teams at</p>
                <div className="mb-5 grid grid-cols-2 items-center gap-x-6 gap-y-4 text-white md:flex md:gap-x-8">
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">American Family Insurance</span>
                  <span className="text-[17px] font-bold tracking-tight opacity-50 transition-opacity hover:opacity-90">3M</span>
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">DNV</span>
                  <span className="text-[17px] font-semibold tracking-tight opacity-50 transition-opacity hover:opacity-90">Livefront</span>
                </div>
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

        <Sec id="faq" n="02" label="FAQ">
          <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">Frequently asked questions.</h2>
            <div className="mt-12 border-t border-line">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-line py-8">
                  <h3 className="text-xl font-medium tracking-tight md:text-2xl">{faq.q}</h3>
                  <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-mute">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Sec>

        <Sec id="contact" n="03" label="Contact" className="contact">
          <div className="relative overflow-hidden px-5 pb-20 pt-10 md:px-6 md:pb-28 md:pt-8">
            <Contours lake="contact" />
            <h2 className="relative z-10 max-w-[12ch] text-5xl font-medium leading-[0.95] tracking-[-0.035em] md:text-[96px]">Tell us what problem you need to solve.</h2>
            <div className="relative z-10 mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-9">
              <p className="text-lg leading-relaxed text-mute md:col-span-4 md:text-xl">We&apos;ll let you know if we can help.</p>
              <div className="flex flex-wrap items-center gap-4 md:col-span-5 md:justify-end">
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-mute">Contact details coming soon.</p>
              </div>
            </div>
          </div>
        </Sec>
    </>
  );
}
