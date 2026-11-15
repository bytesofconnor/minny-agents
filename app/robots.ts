import { MetadataRoute } from "next";
import { SITE_URL } from "./site";

export const dynamic = "force-static";

const aiBots = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
];

function rule(userAgent: string) {
  return { userAgent, allow: "/", disallow: "/demo/" };
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [rule("*"), ...aiBots.map(rule)],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
