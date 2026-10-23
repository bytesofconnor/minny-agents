import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "../../site";

const CONTACT_FROM = `Minny Agents <${CONTACT_EMAIL}>`;
const INBOUND_FORWARD_TO = "connor.steven.barrett@gmail.com";

export const runtime = "nodejs";

function senderAddress(from: unknown) {
  if (typeof from === "string") return from;
  if (from && typeof from === "object" && "address" in from) {
    const address = (from as { address?: unknown }).address;
    if (typeof address === "string") return address;
  }
  return "";
}

function isLoop(from: string) {
  const lower = from.toLowerCase();
  return lower.includes(CONTACT_EMAIL) || lower.includes(INBOUND_FORWARD_TO);
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    return NextResponse.json({ error: "Inbound is not configured yet." }, { status: 503 });
  }

  const payload = await req.text();
  const resend = new Resend(apiKey);

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch (err) {
    console.error("inbound verify", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true });
  }

  const emailId = event.data.email_id;
  const fromHeader = senderAddress(event.data.from);
  if (isLoop(fromHeader)) {
    return NextResponse.json({ ok: true });
  }

  const { data: email, error: fetchError } = await resend.emails.receiving.get(emailId);
  if (fetchError || !email) {
    console.error("inbound fetch", fetchError?.message);
    return NextResponse.json({ error: "Could not load the email." }, { status: 502 });
  }

  const from = senderAddress(email.from) || fromHeader;
  if (isLoop(from)) {
    return NextResponse.json({ ok: true });
  }

  const subject = email.subject || event.data.subject || "(no subject)";
  const text = email.text || undefined;
  const html = email.html || undefined;
  if (!text && !html) {
    console.error("inbound empty body", emailId);
    return NextResponse.json({ error: "Empty email." }, { status: 502 });
  }

  const { error: sendError } = await resend.emails.send(
    {
      from: CONTACT_FROM,
      to: [INBOUND_FORWARD_TO],
      replyTo: from || CONTACT_EMAIL,
      subject,
      text: text ?? " ",
      html,
    },
    { idempotencyKey: `inbound-forward/${emailId}` }
  );
  if (sendError) {
    console.error("inbound forward", sendError.message);
    return NextResponse.json({ error: "Could not forward." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
