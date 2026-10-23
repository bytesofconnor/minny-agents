export const CONTACT_LIMITS = {
  name: 80,
  email: 120,
  business: 120,
  message: 2000,
} as const;

export type ContactFields = {
  name: string;
  email: string;
  business: string;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cap(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseContact(body: unknown):
  | { ok: true; data: ContactFields; honeypot: boolean }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a name, email, business, and message." };
  }
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.website === "string" && raw.website.trim().length > 0;
  const data: ContactFields = {
    name: cap(raw.name, CONTACT_LIMITS.name),
    email: cap(raw.email, CONTACT_LIMITS.email).toLowerCase(),
    business: cap(raw.business, CONTACT_LIMITS.business),
    message: cap(raw.message, CONTACT_LIMITS.message),
  };
  if (!data.name || !data.email || !data.business || !data.message) {
    return { ok: false, error: "Name, email, business, and message are required." };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, error: "That email does not look right." };
  }
  return { ok: true, data, honeypot };
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
