import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { demoFaq, demoMenuItem } from "./demoConfig";
import { isDemoSlug } from "./demoSlug";

const TOKEN = /^[A-Za-z0-9_-]{24,128}$/;

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

function optionalClip(value: string | undefined, max: number) {
  if (!value) return undefined;
  const next = clip(value, max);
  return next || undefined;
}

export const upsert = internalMutation({
  args: {
    token: v.string(),
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
  },
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!TOKEN.test(token)) {
      throw new Error("Token must be 24 to 128 letters, numbers, underscores, or hyphens");
    }
    const restaurantName = clip(args.restaurantName, 120);
    const neighborhood = clip(args.neighborhood, 120);
    const hours = clip(args.hours, 500);
    if (!restaurantName || !neighborhood || !hours) {
      throw new Error("Name, neighborhood, and hours are required");
    }

    const fields = {
      token,
      restaurantName,
      neighborhood,
      hours,
      menu: args.menu.slice(0, 40).map((item) => ({
        name: clip(item.name, 80),
        price: optionalClip(item.price, 40),
        description: optionalClip(item.description, 200),
      })).filter((item) => item.name),
      reservations: optionalClip(args.reservations, 500),
      ordering: optionalClip(args.ordering, 500),
      phone: optionalClip(args.phone, 40),
      website: optionalClip(args.website, 200),
      faqs: args.faqs.slice(0, 40).map((faq) => ({
        question: clip(faq.question, 200),
        answer: clip(faq.answer, 500),
      })).filter((faq) => faq.question && faq.answer),
      sources: args.sources.slice(0, 20).map((source) => clip(source, 300)).filter(Boolean),
    };

    const existing = await ctx.db
      .query("demoConfigs")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }

    return await ctx.db.insert("demoConfigs", {
      ...fields,
      createdAt: Date.now(),
    });
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const trimmed = token.trim();
    if (!TOKEN.test(trimmed)) return null;
    return await ctx.db
      .query("demoConfigs")
      .withIndex("by_token", (q) => q.eq("token", trimmed))
      .unique();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const trimmed = slug.trim();
    if (!isDemoSlug(trimmed)) return null;
    return await ctx.db
      .query("demoConfigs")
      .withIndex("by_slug", (q) => q.eq("slug", trimmed))
      .unique();
  },
});

export const setSlug = internalMutation({
  args: {
    token: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const token = args.token.trim();
    const slug = args.slug.trim();
    if (!TOKEN.test(token)) {
      throw new Error("Token must be 24 to 128 letters, numbers, underscores, or hyphens");
    }
    if (!isDemoSlug(slug)) {
      throw new Error("Slug must be lowercase words, hyphens, and a 4 to 16 character hex code");
    }
    const existing = await ctx.db
      .query("demoConfigs")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!existing) throw new Error("Demo not found");
    const taken = await ctx.db
      .query("demoConfigs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (taken && taken._id !== existing._id) {
      throw new Error("Another demo already uses this slug");
    }
    await ctx.db.patch(existing._id, { slug });
    return existing._id;
  },
});
