import type { Metadata } from "next";
import IndustryPage from "../IndustryPage";
import { industries } from "../seo";
import { SITE_URL } from "../site";

const industry = industries[1];

export const metadata: Metadata = {
  title: industry.title,
  description: industry.description,
  alternates: { canonical: `${SITE_URL}/${industry.slug}` },
  openGraph: {
    url: `${SITE_URL}/${industry.slug}`,
    title: `${industry.title} | Minny Agents`,
    description: industry.description,
  },
  twitter: {
    title: `${industry.title} | Minny Agents`,
    description: industry.description,
  },
};

export default function Page() {
  return <IndustryPage industry={industry} />;
}
