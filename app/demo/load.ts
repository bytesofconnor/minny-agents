import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { fixture } from "./fixture";
import { isDemoSlug, isDemoToken, parseProfile, type DemoProfile } from "./profile";

export type DemoLookup = {
  getBySlug: (slug: string) => Promise<unknown>;
  getByToken: (token: string) => Promise<unknown>;
};

export async function loadDemoProfile(rawKey: string, source?: DemoLookup): Promise<DemoProfile | null> {
  const key = rawKey.trim();
  const lowered = key.toLowerCase();
  if (key === fixture.token || lowered === fixture.slug) return fixture;

  const slugShaped = isDemoSlug(lowered);
  const tokenShaped = isDemoToken(key);
  if (!slugShaped && !tokenShaped) return null;

  let lookup = source;
  if (!lookup) {
    const url = process.env.CONVEX_URL;
    if (!url) return null;
    const convex = new ConvexHttpClient(url);
    lookup = {
      getBySlug: (slug) => convex.query(api.demoConfigs.getBySlug, { slug }),
      getByToken: (token) => convex.query(api.demoConfigs.getByToken, { token }),
    };
  }

  if (slugShaped) {
    const row = await lookup.getBySlug(lowered);
    if (row != null) return parseProfile(row);
  }
  if (!tokenShaped) return null;
  return parseProfile(await lookup.getByToken(key));
}
