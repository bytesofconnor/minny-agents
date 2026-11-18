import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { isDemoSlug } from "../../convex/demoSlug";
import { profileForKey } from "./fixture";
import { isDemoToken, parseProfile, type DemoProfile } from "./profile";

export async function loadDemoProfile(rawKey: string): Promise<DemoProfile | null> {
  const key = rawKey.trim();
  const local = profileForKey(key);
  if (local) return local;
  if (!isDemoSlug(key) && !isDemoToken(key)) return null;

  const url = process.env.CONVEX_URL;
  if (!url) return null;

  const convex = new ConvexHttpClient(url);
  if (isDemoSlug(key)) {
    const bySlug = parseProfile(await convex.query(api.demoConfigs.getBySlug, { slug: key }));
    if (bySlug) return bySlug;
  }
  if (!isDemoToken(key)) return null;
  return parseProfile(await convex.query(api.demoConfigs.getByToken, { token: key }));
}
