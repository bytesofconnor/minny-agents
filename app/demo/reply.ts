import { resolveToday } from "./hours";
import type { DemoProfile } from "./profile";

export const CALL_LINE = "Please call the restaurant.";

export type DemoReply =
  | { kind: "answer"; text: string }
  | { kind: "unknown"; text: string }
  | { kind: "decline"; text: string };

const MENU = /\b(menu|dish|dishes|food|eat|price|prices|cost|how much|appetizer|entree|entrée|dessert|drink|drinks|specials)\b/i;
const HOURS = /\b(hours|open|opening|close|closing|closed)\b/i;
const LOCATION = /\b(where|location|address|neighborhood|directions|located)\b/i;
const RESERVATIONS = /\b(reservations?|reserve|book(?:ing)?|a table)\b/i;
const ORDERING = /\b(takeout|take-out|delivery|deliver|pickup|pick-up|order|ordering|to-go|togo)\b/i;
const PHONE = /\b(phone|call you|your number)\b/i;
const WEBSITE = /\b(website|web site|url)\b/i;
const SPECIFIC_MENU = /\b(how much|price of|cost of|do you have|do you serve|is there)\b/i;
const ABOUT = /\b(you|your|restaurant|menu|food|eat|serve|serving|have|offer|reservation|hours|open|table|order|parking|patio|wifi|gluten|vegan|vegetarian|kids|dog|dogs|private|event|events)\b/i;

type Topic = {
  test: (message: string, profile: DemoProfile) => boolean;
  read: (message: string, profile: DemoProfile, now: Date) => string | null;
};

function formatItem(item: DemoProfile["menu"][number]) {
  const price = item.price ? `, ${item.price}` : "";
  const description = item.description ? `. ${item.description}` : "";
  return `${item.name}${price}${description}`;
}

function menuText(message: string, profile: DemoProfile) {
  if (profile.menu.length === 0) return null;
  const lower = message.toLowerCase();
  const named = profile.menu.filter((item) => lower.includes(item.name.toLowerCase()));
  if (named.length > 0) return named.map(formatItem).join("\n");
  if (SPECIFIC_MENU.test(message)) return null;
  return profile.menu.map(formatItem).join("\n");
}

const topics: Topic[] = [
  {
    test: (message, profile) => MENU.test(message) || profile.menu.some((item) => message.toLowerCase().includes(item.name.toLowerCase())),
    read: (message, profile) => {
      const text = menuText(message, profile);
      return text ? `On the menu:\n${text}` : null;
    },
  },
  {
    test: (message) => HOURS.test(message),
    read: (_message, profile, now) => {
      if (!profile.hours) return null;
      return `Hours: ${profile.hours}\n${resolveToday(profile.hours, now).line}`;
    },
  },
  {
    test: (message) => LOCATION.test(message),
    read: (_message, profile) => `${profile.restaurantName} is in ${profile.neighborhood}.`,
  },
  {
    test: (message) => RESERVATIONS.test(message),
    read: (_message, profile) => (profile.reservations ? `Reservations: ${profile.reservations}` : null),
  },
  {
    test: (message) => ORDERING.test(message),
    read: (_message, profile) => (profile.ordering ? `Ordering: ${profile.ordering}` : null),
  },
  {
    test: (message) => PHONE.test(message),
    read: (_message, profile) => (profile.phone ? `Phone: ${profile.phone}` : null),
  },
  {
    test: (message) => WEBSITE.test(message),
    read: (_message, profile) => (profile.website ? `Website: ${profile.website}` : null),
  },
];

function matchingFaq(message: string, profile: DemoProfile) {
  const lower = message.toLowerCase();
  for (const faq of profile.faqs) {
    const words = faq.question.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    const hits = words.filter((word) => lower.includes(word));
    if (hits.length >= 2 || (words.length === 1 && hits.length === 1)) return faq;
  }
  return null;
}

function unknown(profile: DemoProfile): DemoReply {
  const where = profile.phone ? ` at ${profile.phone}` : "";
  const line = CALL_LINE.endsWith(".") ? CALL_LINE.slice(0, -1) : CALL_LINE;
  return {
    kind: "unknown",
    text: `I don't have that in the notes for this demo. ${line}${where}.`,
  };
}

export function reply(profile: DemoProfile, message: string, now: Date = new Date()): DemoReply {
  const faq = matchingFaq(message, profile);
  const matched = topics.filter((topic) => topic.test(message, profile));
  if (!faq && matched.length === 0) {
    if (ABOUT.test(message)) return unknown(profile);
    return {
      kind: "decline",
      text: `I can only answer questions about ${profile.restaurantName}'s menu, hours, location, reservations, and ordering.`,
    };
  }

  const parts: string[] = [];
  if (faq) parts.push(faq.answer);
  let missing = false;
  for (const topic of matched) {
    const text = topic.read(message, profile, now);
    if (text) parts.push(text);
    else missing = true;
  }
  if (parts.length === 0) return unknown(profile);
  if (missing) parts.push(CALL_LINE);
  return { kind: "answer", text: parts.join("\n\n") };
}

function line(label: string, value: string | undefined) {
  return `${label}: ${value?.trim() ? value.trim() : "Not in the notes."}`;
}

export function groundingPrompt(profile: DemoProfile, now: Date = new Date()) {
  const menu = profile.menu.length
    ? profile.menu.map((item) => `- ${formatItem(item)}`).join("\n")
    : "Not in the notes.";
  const faqs = profile.faqs.length
    ? profile.faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n")
    : "Not in the notes.";

  return [
    `You answer questions for a private demo of ${profile.restaurantName}. Minny Agents built the demo from public notes. You are not affiliated with ${profile.restaurantName}.`,
    "Use only the notes below. Do not invent prices, hours, menu items, policies, or any other fact.",
    `If the notes do not contain the answer, say so and include this sentence: "${CALL_LINE}"`,
    `If the question is not about this restaurant's menu, hours, location, reservations, ordering, phone, website, or the FAQs, decline. Say you can only answer questions about ${profile.restaurantName}'s menu, hours, location, reservations, and ordering.`,
    "",
    `Restaurant: ${profile.restaurantName}`,
    line("Neighborhood", profile.neighborhood),
    line("Hours", profile.hours),
    resolveToday(profile.hours, now).line,
    "The Today line is computed from the Hours schedule and is not an invented fact. When it states today's hours, answer with those hours and whether the restaurant is open now. When it does not, read the Hours schedule and answer for today if that weekday is covered. Do not say today's hours are missing when the weekday is covered.",
    "Menu:",
    menu,
    line("Reservations", profile.reservations),
    line("Ordering", profile.ordering),
    line("Phone", profile.phone),
    line("Website", profile.website),
    "FAQs:",
    faqs,
  ].join("\n");
}
