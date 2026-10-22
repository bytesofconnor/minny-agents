import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const STAGES = [
  "found",
  "researched",
  "contacted",
  "replied",
  "call booked",
  "pilot",
  "won",
  "lost",
] as const;

export const stageValidator = v.union(
  v.literal("found"),
  v.literal("researched"),
  v.literal("contacted"),
  v.literal("replied"),
  v.literal("call booked"),
  v.literal("pilot"),
  v.literal("won"),
  v.literal("lost"),
);

export const directionValidator = v.union(v.literal("inbound"), v.literal("outbound"));

export default defineSchema({
  leads: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_next_action_date", ["nextActionDate"])
    .index("by_website", ["website"]),

  touches: defineTable({
    leadId: v.id("leads"),
    channel: v.string(),
    direction: directionValidator,
    summary: v.string(),
    date: v.number(),
  }).index("by_lead", ["leadId"]),

  tasks: defineTable({
    leadId: v.optional(v.id("leads")),
    title: v.string(),
    due: v.number(),
    done: v.boolean(),
  })
    .index("by_due", ["due"])
    .index("by_lead", ["leadId"])
    .index("by_done_and_due", ["done", "due"]),
});
