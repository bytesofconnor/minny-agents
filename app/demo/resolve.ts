import { notFound, permanentRedirect } from "next/navigation";
import { loadDemoProfile } from "./load";
import type { DemoProfile } from "./profile";

export async function resolveDemoPage(rawKey: string): Promise<DemoProfile> {
  const key = rawKey.trim();
  const profile = await loadDemoProfile(key);
  if (!profile) notFound();
  if (profile.slug && key === profile.token && key !== profile.slug) {
    permanentRedirect(`/demo/${profile.slug}`);
  }
  return profile;
}
