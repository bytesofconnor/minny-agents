import { MetadataRoute } from "next";
import { SITE_URL } from "./site";

export const dynamic = "force-static";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/restaurants`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/home-services`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/clinics`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
