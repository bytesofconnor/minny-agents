import { Btn, Mono } from "./Chrome";
import { industryJsonLd, type Industry } from "./seo";

export default function IndustryPage({ industry }: { industry: Industry }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd(industry)) }} />
      <section className="grid grid-cols-4 md:grid-cols-12">
        <div className="relative z-10 col-span-4 px-5 pb-12 pt-16 md:col-span-8 md:px-6 md:pb-16 md:pt-24">
          <Mono className="text-mute">Minneapolis, MN</Mono>
          <h1 className="mt-8 max-w-[18ch] text-[44px] font-medium leading-[0.95] tracking-[-0.035em] sm:text-[68px] lg:text-[88px]">
            {industry.heading}
          </h1>
          <p className="mt-8 max-w-[50ch] text-xl leading-relaxed text-mute md:text-2xl">
            {industry.lede}
          </p>
          <div className="mt-10"><Btn /></div>
        </div>
      </section>
      <section className="border-t border-line">
        <div className="px-5 pb-20 pt-10 md:px-6 md:pb-32 md:pt-8">
          <div className="space-y-10">
            {industry.blocks.map((block, i) => (
              <div key={block.h} className="grid grid-cols-1 gap-6 md:grid-cols-[2.5rem_1fr]">
                <Mono className="text-teal">{String(i + 1).padStart(2, "0")}</Mono>
                <div>
                  <h2 className="text-xl font-medium tracking-tight">{block.h}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-paper">{block.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
