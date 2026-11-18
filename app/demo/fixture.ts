import type { DemoProfile } from "./profile";

export const FIXTURE_TOKEN = "c4e8a1b79d3056f2a8e41c0b67d9f3a5e2b8471c6d90fa38";
export const FIXTURE_SLUG = "imaginary-supper-7cd4";
export const TOKEN_ONLY_TOKEN = "0123456789abcdef0123456789abcdef";

export const fixture: DemoProfile = {
  token: FIXTURE_TOKEN,
  slug: FIXTURE_SLUG,
  restaurantName: "The Imaginary Supper Club",
  neighborhood: "Example Junction",
  hours: "Tuesday through Thursday, 5pm to 9pm. Friday and Saturday, 5pm to 10pm. Closed Sunday and Monday.",
  menu: [
    { name: "Lantern toast", price: "$14", description: "Rye, brown butter, chives" },
    { name: "Lake fish", price: "$28", description: "Pan roasted, lemon" },
    { name: "Garden bowl", price: "$16", description: "Grains, herbs, soft egg" },
  ],
  reservations: "Book a table by phone. Parties of 6 or more need a day's notice.",
  ordering: "Pickup orders are taken by phone. No delivery.",
  phone: "612-555-0148",
  website: "https://example.com/imaginary-supper-club",
  faqs: [
    { question: "Do you take walk-ins?", answer: "Yes, when a table is open. A reservation is safer on Friday." },
    { question: "Is there parking?", answer: "Street parking on Example Avenue." },
  ],
  sources: ["https://example.com/imaginary-supper-club"],
  createdAt: 1763200000000,
};

export const tokenOnly: DemoProfile = {
  token: TOKEN_ONLY_TOKEN,
  restaurantName: "Example Lunch Counter",
  neighborhood: "Example Junction",
  hours: "Daily, 8am to 2pm.",
  menu: [{ name: "Counter toast", price: "$6" }],
  faqs: [],
  sources: ["https://example.com/example-lunch-counter"],
  createdAt: 1763200000000,
};

export function profileForKey(key: string): DemoProfile | null {
  if (key === FIXTURE_TOKEN || key === FIXTURE_SLUG) return fixture;
  if (key === TOKEN_ONLY_TOKEN) return tokenOnly;
  return null;
}
