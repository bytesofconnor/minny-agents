/**
 * Internal-only lead CRM. Not in the public Convex API.
 * The marketing site does not import or call these functions.
 */
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { directionValidator, stageValidator } from "./schema";

const leadFields = {
  businessName: v.string(),
  website: v.optional(v.string()),
  city: v.optional(v.string()),
  industry: v.optional(v.string()),
  contactName: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  source: v.string(),
  stage: stageValidator,
  notes: v.optional(v.string()),
  nextAction: v.optional(v.string()),
  nextActionDate: v.optional(v.number()),
};

export const upsertLead = internalMutation({
  args: {
    id: v.optional(v.id("leads")),
    ...leadFields,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { id, ...fields } = args;

    if (id) {
      const existing = await ctx.db.get(id);
      if (!existing) throw new Error("Lead not found");
      await ctx.db.patch(id, { ...fields, updatedAt: now });
      return id;
    }

    if (fields.website) {
      const match = await ctx.db
        .query("leads")
        .withIndex("by_website", (q) => q.eq("website", fields.website))
        .unique();
      if (match) {
        await ctx.db.patch(match._id, { ...fields, updatedAt: now });
        return match._id;
      }
    }

    return await ctx.db.insert("leads", {
      ...fields,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const changeStage = internalMutation({
  args: {
    leadId: v.id("leads"),
    stage: stageValidator,
  },
  handler: async (ctx, { leadId, stage }) => {
    const existing = await ctx.db.get(leadId);
    if (!existing) throw new Error("Lead not found");
    await ctx.db.patch(leadId, { stage, updatedAt: Date.now() });
    return leadId;
  },
});

export const logTouch = internalMutation({
  args: {
    leadId: v.id("leads"),
    channel: v.string(),
    direction: directionValidator,
    summary: v.string(),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.leadId);
    if (!existing) throw new Error("Lead not found");
    const date = args.date ?? Date.now();
    const touchId = await ctx.db.insert("touches", {
      leadId: args.leadId,
      channel: args.channel,
      direction: args.direction,
      summary: args.summary,
      date,
    });
    await ctx.db.patch(args.leadId, { updatedAt: Date.now() });
    return touchId;
  },
});

export const listByStage = internalQuery({
  args: { stage: stageValidator },
  handler: async (ctx, { stage }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_stage", (q) => q.eq("stage", stage))
      .collect();
  },
});

export const listDueFollowUps = internalQuery({
  args: { now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_next_action_date", (q) => q.lte("nextActionDate", now))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_done_and_due", (q) => q.eq("done", false).lte("due", now))
      .collect();

    return { leads, tasks };
  },
});
