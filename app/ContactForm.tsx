"use client";

import { useState, type FormEvent } from "react";
import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { CONTACT_SUBMIT_EVENT, contactSubmitProps } from "./contact-submit";
import { parseContact } from "./lib/contact";
import { CONTACT_EMAIL } from "./site";

const field =
  "mt-2 w-full border border-line bg-ink2 px-4 py-3 text-[15px] text-paper outline-none transition-colors placeholder:text-dim focus:border-teal";

export default function ContactForm() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const parsed = parseContact({
      name: data.name,
      email: data.email,
      business: data.business,
      message: data.message,
      website: data.website,
    });
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          business: data.business,
          message: data.message,
          website: data.website,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(json.error || "Could not send. Email Connor instead.");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Could not send. Email Connor instead.");
      return;
    }
    if (parsed.ok && !parsed.honeypot) {
      const props = contactSubmitProps(pathname);
      if (props) track(CONTACT_SUBMIT_EVENT, props);
    }
  }

  return (
    <div className="relative z-10 mt-12 border-t border-line pt-10">
      <div className="grid gap-10 md:grid-cols-9">
        <div className="md:col-span-4">
          <p className="text-lg leading-relaxed text-mute md:text-xl">We&apos;ll let you know if we can help.</p>
          <p className="mt-6 text-[15px] leading-relaxed text-mute">
            Or email Connor at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-paper underline decoration-line underline-offset-4 hover:text-teal">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
        <form onSubmit={onSubmit} className="md:col-span-5" noValidate>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">Name</span>
            <input className={field} type="text" name="name" autoComplete="name" required maxLength={80} />
          </label>
          <label className="mt-6 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">Email</span>
            <input className={field} type="email" name="email" autoComplete="email" required maxLength={120} />
          </label>
          <label className="mt-6 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">Business</span>
            <input className={field} type="text" name="business" autoComplete="organization" required maxLength={120} />
          </label>
          <label className="mt-6 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">What&apos;s going on?</span>
            <textarea className={`${field} min-h-40 resize-y`} name="message" required maxLength={2000} />
          </label>
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-8 inline-flex items-center gap-6 border border-paper bg-paper px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-teal hover:bg-teal disabled:cursor-wait disabled:opacity-60"
          >
            {status === "sending" ? "Sending" : "Send"}
            <span aria-hidden>↗</span>
          </button>
          {status === "sent" ? (
            <p className="mt-5 text-[15px] text-paper" role="status">Thanks. We&apos;ll read it and write back if we can help.</p>
          ) : null}
          {status === "error" ? (
            <p className="mt-5 text-[15px] text-paper" role="alert">
              {error}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline decoration-line underline-offset-4 hover:text-teal">
                {CONTACT_EMAIL}
              </a>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
