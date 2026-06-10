import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

import {
  SYNC_DOMAINS,
  SYNC_ENVIRONMENTS,
  TEMU_SHOPPING_LISTS_PRODUCT_ID,
} from "./syncConstants";
import { requireCloudSyncAccess } from "./syncAccess";

const syncEnvironment = v.union(
  ...SYNC_ENVIRONMENTS.map((environment) => v.literal(environment)),
);

const syncDomain = v.union(
  ...SYNC_DOMAINS.map((domain) => v.literal(domain)),
);

const syncOperationType = v.union(v.literal("upsert"), v.literal("delete"));

export const getCloudSyncStatus = queryGeneric({
  args: {
    environment: syncEnvironment,
  },
  returns: v.object({
    productId: v.literal(TEMU_SHOPPING_LISTS_PRODUCT_ID),
    access: v.literal("active"),
    environment: syncEnvironment,
  }),
  handler: async (ctx, args) => {
    await requireCloudSyncAccess(ctx);

    return {
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      access: "active" as const,
      environment: args.environment,
    };
  },
});

export const pushSyncOperation = mutationGeneric({
  args: {
    environment: syncEnvironment,
    domain: syncDomain,
    operationType: syncOperationType,
    recordKey: v.string(),
    checksum: v.string(),
    idempotencyKey: v.string(),
    sourceDeviceId: v.string(),
    localUpdatedAt: v.number(),
    payload: v.optional(v.any()),
    tombstone: v.optional(
      v.object({
        deletedAt: v.number(),
        reason: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx) => {
    await requireCloudSyncAccess(ctx);
    return null;
  },
});
