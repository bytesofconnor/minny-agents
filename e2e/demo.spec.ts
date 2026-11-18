import { expect, test } from "@playwright/test";
import { fixture, FIXTURE_SLUG, FIXTURE_TOKEN, TOKEN_ONLY_TOKEN } from "../app/demo/fixture";
import { clearRateLimits, MESSAGE_MAX, RATE_MAX, RATE_WINDOW_MS, rateLimited } from "../app/demo/limits";
import { CALL_LINE, groundingPrompt, reply } from "../app/demo/reply";

const banner =
  "Unofficial demo built by Minny Agents from The Imaginary Supper Club's public info. Not affiliated with The Imaginary Supper Club.";

test("reply answers from the fixture and declines off-topic questions", () => {
  const menu = reply(fixture, "What's on the menu?");
  expect(menu.kind).toBe("answer");
  expect(menu.text).toContain("Lantern toast");
  expect(menu.text).toContain("$14");
  expect(menu.text).toContain("Lake fish");
  expect(menu.text).toContain("$28");
  expect(menu.text).toContain("Garden bowl");
  expect(menu.text).toContain("$16");

  const hours = reply(fixture, "What are your hours?");
  expect(hours.kind).toBe("answer");
  expect(hours.text).toContain(fixture.hours);

  const booked = reply(fixture, "How do I book a table?");
  expect(booked.text).toContain("Book a table by phone.");

  const ordering = reply(fixture, "Do you deliver?");
  expect(ordering.text).toContain("No delivery.");

  const dogs = reply(fixture, "Do you allow dogs?");
  expect(dogs.kind).toBe("unknown");
  expect(dogs.text).toContain("Please call the restaurant");

  const off = reply(fixture, "Who won the Super Bowl?");
  expect(off.kind).toBe("decline");
  expect(off.text.toLowerCase()).not.toContain("lantern");
  expect(off.text).not.toContain("$14");

  const prompt = groundingPrompt(fixture);
  expect(prompt).toContain("Lantern toast");
  expect(prompt).toContain("$14");
  expect(prompt).toContain(fixture.hours);
  expect(prompt).toContain(CALL_LINE);
  expect(prompt).toContain("Do not invent prices");
});

test("rate limit is per IP and token", () => {
  clearRateLimits();
  const token = "a".repeat(32);
  const other = "b".repeat(32);
  const start = 1_700_000_000_000;
  for (let i = 0; i < RATE_MAX; i++) expect(rateLimited("203.0.113.5", token, start)).toBe(false);
  expect(rateLimited("203.0.113.5", token, start)).toBe(true);
  expect(rateLimited("203.0.113.9", token, start)).toBe(false);
  expect(rateLimited("203.0.113.5", other, start)).toBe(false);
  expect(rateLimited("203.0.113.5", token, start + RATE_WINDOW_MS)).toBe(false);
});

test("unknown demo token returns 404", async ({ page }) => {
  const unknown = await page.goto("/demo/00000000000000000000000000000000");
  expect(unknown?.status()).toBe(404);
  const short = await page.goto("/demo/short");
  expect(short?.status()).toBe(404);
});

test("fixture demo is private and answers from the config", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const response = await page.goto(`/demo/${FIXTURE_TOKEN}`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/demo/${FIXTURE_SLUG}$`));
  await expect(page.getByText(banner)).toBeVisible();
  await expect(page.getByRole("link", { name: /Talk to Connor/i })).toHaveAttribute("href", "/#contact");

  const robots = await page.locator('meta[name="robots"]').evaluateAll((els) =>
    els.map((el) => el.getAttribute("content") ?? ""),
  );
  expect(robots.some((content) => content.includes("noindex") && content.includes("nofollow"))).toBe(true);

  await page.getByRole("button", { name: "What's on the menu?" }).click();
  const menu = page.getByTestId("assistant-message").last();
  await expect(menu).toContainText("Lantern toast");
  await expect(menu).toContainText("$14");
  await expect(menu).toContainText("Lake fish");
  await expect(menu).toContainText("$28");

  await page.getByRole("button", { name: "What are your hours?" }).click();
  const hoursMessage = page.getByTestId("assistant-message").last();
  await expect(hoursMessage).toContainText("Tuesday through Thursday, 5pm to 9pm");
  await expect(hoursMessage).toContainText("Today is");
  await expect(hoursMessage).toContainText("today's hours:");

  await page.getByLabel("Message").fill("Who won the Super Bowl?");
  await page.getByRole("button", { name: "Send" }).click();
  const declined = page.getByTestId("assistant-message").last();
  await expect(declined).toContainText("I can only answer");
  await expect(declined).not.toContainText("Lantern toast");

  await page.getByLabel("Message").fill("Do you allow dogs?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("assistant-message").last()).toContainText("Please call the restaurant");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/opt/cursor/artifacts/demo-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/demo/${FIXTURE_TOKEN}`);
  await expect(page.getByText(banner)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const header = await page.locator("header").boundingBox();
  const bannerBox = await page.getByText(banner).boundingBox();
  expect(header).toBeTruthy();
  expect(bannerBox).toBeTruthy();
  expect(bannerBox!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
  await page.getByRole("button", { name: "What's on the menu?" }).click();
  await expect(page.getByTestId("assistant-message").last()).toContainText("$14");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/opt/cursor/artifacts/demo-phone.png", fullPage: true });
});

test("long messages are rejected and the chat route rate limits", async ({ request }) => {
  const long = await request.post(`/api/demo/${FIXTURE_TOKEN}`, {
    data: { message: "a".repeat(MESSAGE_MAX + 1) },
  });
  expect(long.status()).toBe(400);

  let limited = false;
  for (let i = 0; i < RATE_MAX + 10; i++) {
    const res = await request.post(`/api/demo/${FIXTURE_TOKEN}`, {
      data: { message: "What's on the menu?" },
    });
    if (res.status() === 429) {
      limited = true;
      break;
    }
    expect(res.status()).toBe(200);
  }
  expect(limited).toBe(true);
});

test("slug lookup, token redirect, token fallback, and malformed slugs", async ({ request }) => {
  const slug = await request.get(`/demo/${FIXTURE_SLUG}`, { maxRedirects: 0 });
  expect(slug.status()).toBe(200);
  const slugHtml = await slug.text();
  expect(slugHtml).toContain("noindex");
  expect(slugHtml).toContain("nofollow");
  expect(slugHtml).toContain(banner);

  const redirected = await request.get(`/demo/${FIXTURE_TOKEN}`, { maxRedirects: 0 });
  expect(redirected.status()).toBe(308);
  const location = redirected.headers().location ?? "";
  expect(new URL(location, "http://localhost:3000").pathname).toBe(`/demo/${FIXTURE_SLUG}`);

  const fallback = await request.get(`/demo/${TOKEN_ONLY_TOKEN}`, { maxRedirects: 0 });
  expect(fallback.status()).toBe(200);
  expect(fallback.headers().location ?? "").toBe("");
  const fallbackHtml = await fallback.text();
  expect(fallbackHtml).toContain("Example Lunch Counter");
  expect(fallbackHtml).toContain("Unofficial demo");
  expect(fallbackHtml).toContain("noindex");

  const malformed = [
    "imaginary-supper-7cd",
    "Imaginary-supper-7cd4",
    "imaginary_supper-7cd4",
    "imaginary-supper-7cdg",
    "imaginary--supper-7cd4",
    "imaginary-supper-0123456789abcdef0",
    "missing-counter-a1b2",
  ];
  for (const path of malformed) {
    const res = await request.get(`/demo/${encodeURIComponent(path)}`, { maxRedirects: 0 });
    expect(res.status(), path).toBe(404);
  }
});

test("demo urls stay out of robots and the sitemap", async ({ page }) => {
  const robots = await (await page.goto("/robots.txt"))!.text();
  expect(robots).toContain("Disallow: /demo/");
  const sitemap = await (await page.goto("/sitemap.xml"))!.text();
  expect(sitemap).not.toContain("/demo");
});
