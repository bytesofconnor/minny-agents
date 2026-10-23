import { test, expect } from '@playwright/test';
import { alreadySeen, forwardIdempotencyKey, hasForwardedHeader, rememberKey } from '../app/lib/inbound';

test('loop guard keys off the forwarded header, not the sender', () => {
  expect(hasForwardedHeader({ 'X-Minny-Forwarded': '1' })).toBe(true);
  expect(hasForwardedHeader({ 'x-minny-forwarded': '1' })).toBe(true);
  expect(hasForwardedHeader({ From: 'Connor Barrett <connor@minnyagents.com>' })).toBe(false);
  expect(hasForwardedHeader({ from: 'connor.steven.barrett@gmail.com' })).toBe(false);
  expect(hasForwardedHeader(null)).toBe(false);

  const key = forwardIdempotencyKey('email-1');
  expect(key).toBe('inbound-forward/email-1');
  expect(alreadySeen(key)).toBe(false);
  rememberKey(key);
  expect(alreadySeen(key)).toBe(true);
});
