import { ConvexError, v } from "convex/values";

import { makeFunctionReference } from "convex/server";
import { action, internalMutation, internalQuery } from "./_generated/server";
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

const listSyncRecordsInternalRef = makeFunctionReference<
  "query",
  {
    ownerId: string;
    environment: (typeof SYNC_ENVIRONMENTS)[number];
    since?: number;
  },
  {
    productId: typeof TEMU_SHOPPING_LISTS_PRODUCT_ID;
    environment: (typeof SYNC_ENVIRONMENTS)[number];
    ownerId: string;
    records: Array<{
      domain: (typeof SYNC_DOMAINS)[number];
      operationType: "upsert" | "delete";
      recordKey: string;
      checksum: string;
      idempotencyKey: string;
      sourceDeviceId: string;
      localUpdatedAt: number;
      serverUpdatedAt: number;
      payload?: unknown;
      tombstone?: {
        deletedAt: number;
        reason?: string;
      };
    }>;
  }
>("sync:listSyncRecordsInternal");

const pushSyncOperationInternalRef = makeFunctionReference<
  "mutation",
  {
    ownerId: string;
    environment: (typeof SYNC_ENVIRONMENTS)[number];
    domain: (typeof SYNC_DOMAINS)[number];
    operationType: "upsert" | "delete";
    recordKey: string;
    checksum: string;
    idempotencyKey: string;
    sourceDeviceId: string;
    localUpdatedAt: number;
    payload?: unknown;
    tombstone?: {
      deletedAt: number;
      reason?: string;
    };
  },
  {
    status: "inserted" | "updated" | "duplicate";
    serverUpdatedAt: number;
  }
>("sync:pushSyncOperationInternal");

export const getCloudSyncStatus = action({
  args: {
    environment: syncEnvironment,
  },
  returns: v.object({
    productId: v.literal(TEMU_SHOPPING_LISTS_PRODUCT_ID),
    access: v.literal("active"),
    environment: syncEnvironment,
    ownerId: v.string(),
  }),
  handler: async (ctx, args) => {
    const access = await requireCloudSyncAccess(ctx);

    return {
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      access: "active" as const,
      environment: args.environment,
      ownerId: access.ownerId,
    };
  },
});

const syncRecordReturn = v.object({
  domain: syncDomain,
  operationType: syncOperationType,
  recordKey: v.string(),
  checksum: v.string(),
  idempotencyKey: v.string(),
  sourceDeviceId: v.string(),
  localUpdatedAt: v.number(),
  serverUpdatedAt: v.number(),
  payload: v.optional(v.any()),
  tombstone: v.optional(
    v.object({
      deletedAt: v.number(),
      reason: v.optional(v.string()),
    }),
  ),
});

export const listSyncRecords = action({
  args: {
    environment: syncEnvironment,
    since: v.optional(v.number()),
  },
  returns: v.object({
    productId: v.literal(TEMU_SHOPPING_LISTS_PRODUCT_ID),
    environment: syncEnvironment,
    ownerId: v.string(),
    records: v.array(syncRecordReturn),
  }),
  handler: async (ctx, args) => {
    const access = await requireCloudSyncAccess(ctx);
    return await ctx.runQuery(listSyncRecordsInternalRef, {
      ...args,
      ownerId: access.ownerId,
    });
  },
});

export const listSyncRecordsInternal = internalQuery({
  args: {
    ownerId: v.string(),
    environment: syncEnvironment,
    since: v.optional(v.number()),
  },
  returns: v.object({
    productId: v.literal(TEMU_SHOPPING_LISTS_PRODUCT_ID),
    environment: syncEnvironment,
    ownerId: v.string(),
    records: v.array(syncRecordReturn),
  }),
  handler: async (ctx, args) => {
    const since = args.since ?? 0;
    const rows = await ctx.db
      .query("syncRecords")
      .withIndex("by_owner_product_updated", (q) =>
        q
          .eq("ownerId", args.ownerId)
          .eq("productId", TEMU_SHOPPING_LISTS_PRODUCT_ID)
          .eq("environment", args.environment)
          .gte("serverUpdatedAt", since),
      )
      .collect();

    return {
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      environment: args.environment,
      ownerId: args.ownerId,
      records: rows.map((row) => ({
        domain: row.domain,
        operationType: row.operationType,
        recordKey: row.recordKey,
        checksum: row.checksum,
        idempotencyKey: row.idempotencyKey,
        sourceDeviceId: row.sourceDeviceId,
        localUpdatedAt: row.localUpdatedAt,
        serverUpdatedAt: row.serverUpdatedAt,
        payload: row.payload,
        tombstone: row.tombstone,
      })),
    };
  },
});

export const pushSyncOperation = action({
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
  returns: v.object({
    status: v.union(v.literal("inserted"), v.literal("updated"), v.literal("duplicate")),
    serverUpdatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const access = await requireCloudSyncAccess(ctx);
    validateSyncOperation(args);
    return await ctx.runMutation(pushSyncOperationInternalRef, {
      ...args,
      ownerId: access.ownerId,
    });
  },
});

export const pushSyncOperationInternal = internalMutation({
  args: {
    ownerId: v.string(),
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
  returns: v.object({
    status: v.union(v.literal("inserted"), v.literal("updated"), v.literal("duplicate")),
    serverUpdatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    validateSyncOperation(args);
    const existingIdempotent = await ctx.db
      .query("syncRecords")
      .withIndex("by_idempotency", (q) =>
        q
          .eq("ownerId", args.ownerId)
          .eq("productId", TEMU_SHOPPING_LISTS_PRODUCT_ID)
          .eq("environment", args.environment)
          .eq("idempotencyKey", args.idempotencyKey),
      )
      .first();

    if (existingIdempotent) {
      return {
        status: "duplicate" as const,
        serverUpdatedAt: existingIdempotent.serverUpdatedAt,
      };
    }

    const now = Date.now();
    const existingRecord = await ctx.db
      .query("syncRecords")
      .withIndex("by_owner_product_domain_key", (q) =>
        q
          .eq("ownerId", args.ownerId)
          .eq("productId", TEMU_SHOPPING_LISTS_PRODUCT_ID)
          .eq("environment", args.environment)
          .eq("domain", args.domain)
          .eq("recordKey", args.recordKey),
      )
      .first();

    const record = {
      ownerId: args.ownerId,
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      environment: args.environment,
      domain: args.domain,
      recordKey: args.recordKey,
      operationType: args.operationType,
      checksum: args.checksum,
      payload: args.payload,
      tombstone: args.tombstone,
      sourceDeviceId: args.sourceDeviceId,
      idempotencyKey: args.idempotencyKey,
      localUpdatedAt: args.localUpdatedAt,
      serverUpdatedAt: now,
      createdAt: existingRecord?.createdAt ?? now,
    };

    if (existingRecord) {
      await ctx.db.patch(existingRecord._id, record);
      return {
        status: "updated" as const,
        serverUpdatedAt: now,
      };
    }

    await ctx.db.insert("syncRecords", record);
    return {
      status: "inserted" as const,
      serverUpdatedAt: now,
    };
  },
});

function validateSyncOperation(args: {
  operationType: "upsert" | "delete";
  recordKey: string;
  checksum: string;
  idempotencyKey: string;
  sourceDeviceId: string;
  payload?: unknown;
  tombstone?: { deletedAt: number; reason?: string };
}): void {
  if (!args.recordKey || !args.checksum || !args.idempotencyKey || !args.sourceDeviceId) {
    throw new ConvexError({
      code: "invalid_sync_operation",
      message: "Sync operation identity fields are required.",
    });
  }

  if (args.operationType === "upsert" && args.payload === undefined) {
    throw new ConvexError({
      code: "missing_payload",
      message: "Upsert sync operations require a payload.",
    });
  }

  if (args.operationType === "delete" && !args.tombstone) {
    throw new ConvexError({
      code: "missing_tombstone",
      message: "Delete sync operations require a tombstone.",
    });
  }
}
