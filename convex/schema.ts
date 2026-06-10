import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    anonymousId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    locale: v.optional(v.string()),
  }),

  // Sync scaffold only. These userId fields are not an authorization model.
  shoppingLists: defineTable({
    userId: v.string(),
    listId: v.string(),
    name: v.string(),
    itemIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  shoppingListItems: defineTable({
    userId: v.string(),
    itemId: v.string(),
    listId: v.string(),
    snapshotId: v.string(),
    quantity: v.number(),
    note: v.string(),
    addedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_list", ["userId", "listId"]),

  productSnapshots: defineTable({
    userId: v.string(),
    snapshotId: v.string(),
    productId: v.optional(v.string()),
    title: v.string(),
    notes: v.string(),
    originalUrl: v.string(),
    canonicalUrl: v.string(),
    imageUrl: v.optional(v.string()),
    galleryImageUrls: v.array(v.string()),
    selectedOptions: v.record(v.string(), v.string()),
    quantity: v.number(),
    metadataStatus: v.union(
      v.literal("ok"),
      v.literal("manual_required"),
      v.literal("incomplete"),
    ),
    availability: v.union(
      v.literal("unknown"),
      v.literal("available"),
      v.literal("sold_out"),
      v.literal("removed"),
      v.literal("link_broken"),
    ),
    capturedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
