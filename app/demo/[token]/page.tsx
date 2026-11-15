import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Btn, Mono } from "../../Chrome";
import { bannerText } from "../profile";
import { loadDemoProfile } from "../load";
import { DemoChat } from "./Chat";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const profile = await loadDemoProfile(token);
  return {
    title: profile ? `${profile.restaurantName} demo` : "Demo",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function DemoPage({ params }: Params) {
  const { token } = await params;
  const profile = await loadDemoProfile(token);
  if (!profile) notFound();

  return (
    <>
      <section className="border-b border-line">
        <div className="px-5 py-8 md:px-6 md:py-10">
          <Mono className="text-teal">Unofficial demo</Mono>
          <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed">{bannerText(profile.restaurantName)}</p>
          <div className="mt-6">
            <Btn href="/#contact">Talk to Connor</Btn>
          </div>
        </div>
      </section>
      <section className="px-5 py-10 md:px-6 md:py-14">
        <Mono className="text-mute">{profile.neighborhood}</Mono>
        <h1 className="mt-4 max-w-[16ch] text-[40px] font-medium leading-[0.95] tracking-[-0.035em] sm:text-[56px]">
          {profile.restaurantName}
        </h1>
        <p className="mt-4 max-w-[46ch] text-mute">Ask about the menu, hours, reservations, or how to order.</p>
        <DemoChat token={profile.token} />
      </section>
    </>
  );
}
