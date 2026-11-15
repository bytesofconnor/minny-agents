import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { fixture } from "./fixture";
import { isDemoToken, parseProfile, type DemoProfile } from "./profile";

export async function loadDemoProfile(rawToken: string): Promise<DemoProfile | null> {
  const token = rawToken.trim();
  if (!isDemoToken(token)) return null;
  if (token === fixture.token) return fixture;

  const url = process.env.CONVEX_URL;
  if (!url) return null;

  const convex = new ConvexHttpClient(url);
  const row = await convex.query(api.demoConfigs.getByToken, { token });
  return parseProfile(row);
}
