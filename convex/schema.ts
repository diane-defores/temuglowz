import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    anonymousId: v.optional(v.string()),
    globalUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    locale: v.optional(v.string()),
  }).index("by_global_user", ["globalUserId"]),

  syncRecords: defineTable({
    ownerId: v.string(),
    productId: v.literal("temu_shopping_lists"),
    environment: v.union(
      v.literal("local"),
      v.literal("preview"),
      v.literal("staging"),
      v.literal("production"),
    ),
    domain: v.union(
      v.literal("shopping_list"),
      v.literal("shopping_list_item"),
      v.literal("product_snapshot"),
    ),
    recordKey: v.string(),
    operationType: v.union(v.literal("upsert"), v.literal("delete")),
    checksum: v.string(),
    payload: v.optional(v.any()),
    tombstone: v.optional(
      v.object({
        deletedAt: v.number(),
        reason: v.optional(v.string()),
      }),
    ),
    sourceDeviceId: v.string(),
    idempotencyKey: v.string(),
    localUpdatedAt: v.number(),
    serverUpdatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_owner_product_domain_key", [
      "ownerId",
      "productId",
      "environment",
      "domain",
      "recordKey",
    ])
    .index("by_owner_product_updated", [
      "ownerId",
      "productId",
      "environment",
      "serverUpdatedAt",
    ])
    .index("by_idempotency", [
      "ownerId",
      "productId",
      "environment",
      "idempotencyKey",
    ]),

  syncConflicts: defineTable({
    ownerId: v.string(),
    productId: v.literal("temu_shopping_lists"),
    environment: v.union(
      v.literal("local"),
      v.literal("preview"),
      v.literal("staging"),
      v.literal("production"),
    ),
    domain: v.union(
      v.literal("shopping_list"),
      v.literal("shopping_list_item"),
      v.literal("product_snapshot"),
    ),
    recordKey: v.string(),
    reason: v.union(
      v.literal("checksum_mismatch"),
      v.literal("clock_skew"),
      v.literal("unsafe_metadata"),
    ),
    localChecksum: v.string(),
    remoteChecksum: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_owner_product", ["ownerId", "productId", "environment"]),

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
