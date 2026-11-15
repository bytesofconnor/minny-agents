export type MenuItem = {
  name: string;
  price?: string;
  description?: string;
};

export type DemoFaq = {
  question: string;
  answer: string;
};

export type DemoProfile = {
  token: string;
  restaurantName: string;
  neighborhood: string;
  hours: string;
  menu: MenuItem[];
  reservations?: string;
  ordering?: string;
  phone?: string;
  website?: string;
  faqs: DemoFaq[];
  sources: string[];
  createdAt: number;
};

const TOKEN = /^[A-Za-z0-9_-]{24,128}$/;

export function isDemoToken(value: string) {
  return TOKEN.test(value);
}

export function bannerText(restaurantName: string) {
  return `Unofficial demo built by Minny Agents from ${restaurantName}'s public info. Not affiliated with ${restaurantName}.`;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function menuItem(value: unknown): MenuItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const name = text(row.name);
  if (!name) return null;
  const price = text(row.price);
  const description = text(row.description);
  return {
    name,
    ...(price ? { price } : {}),
    ...(description ? { description } : {}),
  };
}

function faq(value: unknown): DemoFaq | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const question = text(row.question);
  const answer = text(row.answer);
  if (!question || !answer) return null;
  return { question, answer };
}

export function parseProfile(raw: unknown): DemoProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const token = text(row.token);
  const restaurantName = text(row.restaurantName);
  const neighborhood = text(row.neighborhood);
  const hours = text(row.hours);
  if (!isDemoToken(token) || !restaurantName || !neighborhood || !hours) return null;
  if (!Array.isArray(row.menu) || !Array.isArray(row.faqs) || !Array.isArray(row.sources)) return null;

  const reservations = text(row.reservations);
  const ordering = text(row.ordering);
  const phone = text(row.phone);
  const website = text(row.website);
  const createdAt = typeof row.createdAt === "number" ? row.createdAt : 0;

  return {
    token,
    restaurantName,
    neighborhood,
    hours,
    menu: row.menu.map(menuItem).filter((item): item is MenuItem => item !== null),
    ...(reservations ? { reservations } : {}),
    ...(ordering ? { ordering } : {}),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    faqs: row.faqs.map(faq).filter((item): item is DemoFaq => item !== null),
    sources: row.sources.map(text).filter(Boolean),
    createdAt,
  };
}
