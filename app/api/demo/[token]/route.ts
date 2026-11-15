import { NextResponse } from "next/server";
import { loadDemoProfile } from "../../../demo/load";
import { clientIp, rateLimited, readMessage } from "../../../demo/limits";
import { streamDemoReply } from "../../../demo/stream";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  const { token } = await params;
  let profile;
  try {
    profile = await loadDemoProfile(token);
  } catch (err) {
    console.error("demo convex", err instanceof Error ? err.message : "failed");
    return NextResponse.json({ error: "The demo is unavailable." }, { status: 503 });
  }
  if (!profile) return NextResponse.json({ error: "Demo not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  const parsed = readMessage(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (rateLimited(clientIp(req), profile.token)) {
    return NextResponse.json({ error: "Too many messages. Try again in a few minutes." }, { status: 429 });
  }

  return streamDemoReply(profile, parsed.message);
}
