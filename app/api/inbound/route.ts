import { NextResponse } from "next/server";
import { Resend } from "resend";
import { alreadySeen, forwardIdempotencyKey, hasForwardedHeader, rememberKey } from "../../lib/inbound";
import { CONTACT_FROM, FORWARDED_HEADER, NOTIFY_TO } from "../../lib/mail";
import { CONTACT_EMAIL } from "../../site";

export const runtime = "nodejs";

function senderAddress(from: unknown) {
  if (typeof from === "string") return from;
  if (from && typeof from === "object" && "address" in from) {
    const address = (from as { address?: unknown }).address;
    if (typeof address === "string") return address;
  }
  return "";
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
  const idempotencyKey = forwardIdempotencyKey(emailId);
  if (alreadySeen(idempotencyKey)) {
    return NextResponse.json({ ok: true });
  }

  const { data: email, error: fetchError } = await resend.emails.receiving.get(emailId);
  if (fetchError || !email) {
    console.error("inbound fetch", fetchError?.message);
    return NextResponse.json({ error: "Could not load the email." }, { status: 502 });
  }

  if (hasForwardedHeader(email.headers)) {
    rememberKey(idempotencyKey);
    return NextResponse.json({ ok: true });
  }

  const from = senderAddress(email.from) || senderAddress(event.data.from);
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
      to: [NOTIFY_TO],
      replyTo: from || CONTACT_EMAIL,
      subject,
      text: text ?? " ",
      html,
      headers: { [FORWARDED_HEADER]: "1" },
    },
    { idempotencyKey }
  );
  if (sendError) {
    console.error("inbound forward", sendError.message);
    return NextResponse.json({ error: "Could not forward." }, { status: 502 });
  }

  rememberKey(idempotencyKey);
  return NextResponse.json({ ok: true });
}
