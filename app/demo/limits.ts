export const MESSAGE_MAX = 800;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const RATE_MAX = 30;

const hits = new Map<string, number[]>();

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimited(ip: string, token: string, now = Date.now()) {
  const key = `${ip}\n${token}`;
  const recent = (hits.get(key) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function clearRateLimits() {
  hits.clear();
}

export function readMessage(body: unknown): { ok: true; message: string } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a message." };
  }
  const message = (body as Record<string, unknown>).message;
  if (typeof message !== "string" || message.length > MESSAGE_MAX) {
    return { ok: false, error: `Keep the message under ${MESSAGE_MAX} characters.` };
  }
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, error: "Send a message." };
  return { ok: true, message: trimmed };
}
