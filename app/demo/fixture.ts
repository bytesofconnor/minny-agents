import type { DemoProfile } from "./profile";

export const FIXTURE_TOKEN = "c4e8a1b79d3056f2a8e41c0b67d9f3a5e2b8471c6d90fa38";

export const fixture: DemoProfile = {
  token: FIXTURE_TOKEN,
  slug: "imaginary-supper-7cd4",
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
