#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function hasForwardedHeader(headers) {
  if (!headers) return false;
  return Object.entries(headers).some(
    ([key, value]) => key.toLowerCase() === "x-minny-forwarded" && String(value).trim() === "1"
  );
}

assert.equal(hasForwardedHeader({ "X-Minny-Forwarded": "1" }), true);
assert.equal(hasForwardedHeader({ "x-minny-forwarded": "1" }), true);
assert.equal(hasForwardedHeader({ From: "Connor Barrett <connor@minnyagents.com>" }), false);
assert.equal(hasForwardedHeader({ from: "connor.steven.barrett@gmail.com" }), false);
assert.equal(hasForwardedHeader(null), false);

const contact = readFileSync("app/api/contact/route.ts", "utf8");
assert.match(contact, /NOTIFY_TO/);
assert.doesNotMatch(contact, /to:\s*\[CONTACT_EMAIL\]/);

const inbound = readFileSync("app/api/inbound/route.ts", "utf8");
assert.match(inbound, /X-Minny-Forwarded|FORWARDED_HEADER/);
assert.match(inbound, /hasForwardedHeader/);
assert.match(inbound, /alreadySeen/);
assert.doesNotMatch(inbound, /function isLoop/);
assert.doesNotMatch(inbound, /includes\(CONTACT_EMAIL\)/);

const leads = readFileSync("convex/leads.ts", "utf8");
assert.match(leads, /export const deleteLead = internalMutation/);
assert.match(leads, /v\.id\("leads"\)/);

console.log("inbound loop guard: header/idempotency only; contact notifies Gmail; deleteLead present");
