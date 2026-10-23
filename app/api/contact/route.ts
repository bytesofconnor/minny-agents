import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { api } from "../../../convex/_generated/api";
import { escapeHtml, parseContact } from "../../lib/contact";
import { CONTACT_FROM, NOTIFY_TO } from "../../lib/mail";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function contactEmail(data: { name: string; email: string; business: string; message: string }) {
  const subject = `Website inquiry from ${data.name} · ${data.business}`;
  const text = [
    `${data.name} wrote from ${data.business}.`,
    `Email: ${data.email}`,
    "",
    data.message,
  ].join("\n");
  const html = `<p>${escapeHtml(data.name)} wrote from ${escapeHtml(data.business)}.</p>
<p>Email: ${escapeHtml(data.email)}</p>
<p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>`;
  return { subject, text, html };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  const parsed = parseContact(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (parsed.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Try again in a few minutes." }, { status: 429 });
  }

  const convexUrl = process.env.CONVEX_URL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!convexUrl || !resendKey) {
    return NextResponse.json({ error: "Contact is not configured yet." }, { status: 503 });
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.leads.submitContact, parsed.data);
  } catch (err) {
    console.error("contact convex", err);
    return NextResponse.json({ error: "Could not save the note." }, { status: 500 });
  }

  const mail = contactEmail(parsed.data);
  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send(
    {
      from: CONTACT_FROM,
      to: [NOTIFY_TO],
      replyTo: parsed.data.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    },
    { idempotencyKey: `contact/${parsed.data.email}/${parsed.data.message.slice(0, 80)}` }
  );
  if (error) {
    console.error("contact resend", error.message);
    return NextResponse.json({ error: "Could not send the note." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
