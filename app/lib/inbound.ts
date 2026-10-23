import { FORWARDED_HEADER } from "./mail";

const seenKeys = new Set<string>();

export function hasForwardedHeader(headers: Record<string, string> | null | undefined) {
  if (!headers) return false;
  const name = FORWARDED_HEADER.toLowerCase();
  return Object.entries(headers).some(
    ([key, value]) => key.toLowerCase() === name && String(value).trim() === "1"
  );
}

export function alreadySeen(key: string) {
  return seenKeys.has(key);
}

export function rememberKey(key: string) {
  seenKeys.add(key);
}

export function forwardIdempotencyKey(emailId: string) {
  return `inbound-forward/${emailId}`;
}
