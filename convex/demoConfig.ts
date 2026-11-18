import { v } from "convex/values";

export const demoMenuItem = v.object({
  name: v.string(),
  price: v.optional(v.string()),
  description: v.optional(v.string()),
});

export const demoFaq = v.object({
  question: v.string(),
  answer: v.string(),
});

export const demoConfigFields = {
  token: v.string(),
  slug: v.optional(v.string()),
  restaurantName: v.string(),
  neighborhood: v.string(),
  hours: v.string(),
  menu: v.array(demoMenuItem),
  reservations: v.optional(v.string()),
  ordering: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  faqs: v.array(demoFaq),
  sources: v.array(v.string()),
  createdAt: v.number(),
};
