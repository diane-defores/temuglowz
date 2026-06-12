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

const availabilityState = v.union(
  v.literal("unknown"),
  v.literal("available"),
  v.literal("low_stock"),
  v.literal("sold_out"),
  v.literal("removed"),
  v.literal("link_broken"),
);

const snapshotMetadataStatus = v.union(
  v.literal("ok"),
  v.literal("manual_required"),
  v.literal("incomplete"),
);

const importSource = v.union(
  v.literal("share"),
  v.literal("manual"),
  v.literal("edit"),
  v.literal("webview"),
);

const observationSource = v.union(
  v.literal("manual"),
  v.literal("webview"),
  v.literal("partner_api"),
);

const observationConfidence = v.union(
  v.literal("user_observed"),
  v.literal("needs_review"),
  v.literal("unknown"),
);

const priceSnapshot = v.object({
  amount: v.number(),
  currency: v.string(),
  capturedAt: v.number(),
});

const shoppingListPayload = v.object({
  id: v.string(),
  name: v.string(),
  itemIds: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const shoppingListItemPayload = v.object({
  id: v.string(),
  snapshotId: v.string(),
  addedAt: v.number(),
  quantity: v.number(),
  note: v.string(),
});

const productSnapshotPayload = v.object({
  id: v.string(),
  productId: v.optional(v.string()),
  originalUrl: v.string(),
  canonicalUrl: v.string(),
  source: importSource,
  title: v.string(),
  notes: v.string(),
  imageUrl: v.optional(v.string()),
  galleryImageUrls: v.array(v.string()),
  selectedOptions: v.record(v.string(), v.string()),
  quantity: v.number(),
  price: v.optional(priceSnapshot),
  availability: availabilityState,
  metadataStatus: snapshotMetadataStatus,
  capturedAt: v.number(),
  updatedAt: v.number(),
});

const productObservationPayload = v.object({
  id: v.string(),
  snapshotId: v.string(),
  productId: v.optional(v.string()),
  canonicalUrl: v.string(),
  source: observationSource,
  status: snapshotMetadataStatus,
  confidence: observationConfidence,
  observedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  availability: availabilityState,
  price: v.optional(priceSnapshot),
  note: v.string(),
});

const syncPayload = v.union(
  shoppingListPayload,
  shoppingListItemPayload,
  productSnapshotPayload,
  productObservationPayload,
);

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
      records: rows
        .map((row) => ({
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
        }))
        .filter((record) => isValidStoredSyncRecord(record)),
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
    payload: v.optional(syncPayload),
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
    payload: v.optional(syncPayload),
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
  domain: (typeof SYNC_DOMAINS)[number];
  operationType: "upsert" | "delete";
  recordKey: string;
  checksum: string;
  idempotencyKey: string;
  sourceDeviceId: string;
  localUpdatedAt: number;
  payload?: unknown;
  tombstone?: { deletedAt: number; reason?: string };
}): void {
  if (
    !isSafeText(args.recordKey, 160)
    || !isSafeText(args.checksum, 200)
    || !isSafeText(args.idempotencyKey, 200)
    || !isSafeText(args.sourceDeviceId, 160)
  ) {
    throw new ConvexError({
      code: "invalid_sync_operation",
      message: "Sync operation identity fields are invalid.",
    });
  }

  if (!isFiniteNumber(args.localUpdatedAt) || args.localUpdatedAt <= 0) {
    throw new ConvexError({
      code: "invalid_sync_operation",
      message: "Sync operations require a valid localUpdatedAt timestamp.",
    });
  }

  if (args.operationType === "upsert" && args.payload === undefined) {
    throw new ConvexError({
      code: "missing_payload",
      message: "Upsert sync operations require a payload.",
    });
  }

  if (args.operationType === "upsert") {
    validateSyncPayload(args.domain, args.recordKey, args.payload);
  }

  if (args.operationType === "upsert" && args.tombstone !== undefined) {
    throw new ConvexError({
      code: "unexpected_tombstone",
      message: "Upsert sync operations cannot include tombstones.",
    });
  }

  if (args.operationType === "delete" && !args.tombstone) {
    throw new ConvexError({
      code: "missing_tombstone",
      message: "Delete sync operations require a tombstone.",
    });
  }

  if (args.operationType === "delete" && args.tombstone && args.tombstone.deletedAt <= 0) {
    throw new ConvexError({
      code: "invalid_tombstone",
      message: "Delete sync operations require a valid tombstone timestamp.",
    });
  }

  if (args.operationType === "delete" && args.payload !== undefined) {
    throw new ConvexError({
      code: "unexpected_payload",
      message: "Delete sync operations cannot include payloads.",
    });
  }
}

function isValidStoredSyncRecord(record: {
  domain: (typeof SYNC_DOMAINS)[number];
  operationType: "upsert" | "delete";
  recordKey: string;
  checksum: string;
  idempotencyKey: string;
  sourceDeviceId: string;
  localUpdatedAt: number;
  payload?: unknown;
  tombstone?: { deletedAt: number; reason?: string };
}): boolean {
  try {
    validateSyncOperation(record);
    return true;
  } catch {
    return false;
  }
}

const MAX_TEXT = 120;
const MAX_NOTE = 2_000;
const MAX_IMAGES = 6;
const MAX_PRICE_AMOUNT = 100_000_000;
const MAX_OPTION_KEY_LENGTH = 40;
const MAX_OPTION_VALUE_LENGTH = 80;
const MAX_OBSERVATION_NOTE = 500;

const VALID_IMPORT_SOURCES = new Set(["share", "manual", "edit", "webview"]);
const VALID_AVAILABILITY_STATES = new Set([
  "unknown",
  "available",
  "low_stock",
  "sold_out",
  "removed",
  "link_broken",
]);
const VALID_OBSERVATION_SOURCES = new Set(["manual", "webview", "partner_api"]);
const VALID_OBSERVATION_STATUSES = new Set(["ok", "manual_required", "incomplete"]);
const VALID_OBSERVATION_CONFIDENCE = new Set(["user_observed", "needs_review", "unknown"]);
const VALID_METADATA_STATUSES = new Set(["ok", "manual_required", "incomplete"]);

function validateSyncPayload(
  domain: (typeof SYNC_DOMAINS)[number],
  recordKey: string,
  payload: unknown,
): void {
  const errors = collectPayloadErrors(domain, recordKey, payload);
  if (errors.length) {
    throw new ConvexError({
      code: "invalid_sync_payload",
      message: `Invalid ${domain} sync payload: ${errors.join(",")}.`,
    });
  }
}

function collectPayloadErrors(
  domain: (typeof SYNC_DOMAINS)[number],
  recordKey: string,
  payload: unknown,
): string[] {
  if (!isPlainObject(payload)) {
    return ["payload"];
  }

  const errors: string[] = [];
  if (payload.id !== recordKey) {
    errors.push("recordKey");
  }

  switch (domain) {
    case "shopping_list":
      validateShoppingListPayload(payload, errors);
      break;
    case "shopping_list_item":
      validateShoppingListItemPayload(payload, errors);
      break;
    case "product_snapshot":
      validateProductSnapshotPayload(payload, errors);
      break;
    case "product_observation":
      validateProductObservationPayload(payload, errors);
      break;
  }

  return errors;
}

function validateShoppingListPayload(payload: Record<string, unknown>, errors: string[]): void {
  requireSafeText(payload.id, 80, "id", errors);
  requireSafeText(payload.name, 64, "name", errors);
  if (!Array.isArray(payload.itemIds) || !payload.itemIds.every((itemId) => isSafeText(itemId, 80))) {
    errors.push("itemIds");
  }
  requirePositiveNumber(payload.createdAt, "createdAt", errors);
  requirePositiveNumber(payload.updatedAt, "updatedAt", errors);
  if (isFiniteNumber(payload.createdAt) && isFiniteNumber(payload.updatedAt) && payload.updatedAt < payload.createdAt) {
    errors.push("updatedAt");
  }
}

function validateShoppingListItemPayload(payload: Record<string, unknown>, errors: string[]): void {
  requireSafeText(payload.id, 80, "id", errors);
  requireSafeText(payload.snapshotId, 80, "snapshotId", errors);
  requirePositiveNumber(payload.addedAt, "addedAt", errors);
  if (!isFiniteNumber(payload.quantity) || payload.quantity < 1 || payload.quantity > 999) {
    errors.push("quantity");
  }
  if (!isOptionalText(payload.note, MAX_NOTE)) {
    errors.push("note");
  }
}

function validateProductSnapshotPayload(payload: Record<string, unknown>, errors: string[]): void {
  requireSafeText(payload.id, 80, "id", errors);
  if (payload.productId !== undefined && !isSafeText(payload.productId, 120)) {
    errors.push("productId");
  }
  requireHttpsUrl(payload.originalUrl, "originalUrl", errors);
  requireHttpsUrl(payload.canonicalUrl, "canonicalUrl", errors);
  if (typeof payload.source !== "string" || !VALID_IMPORT_SOURCES.has(payload.source)) {
    errors.push("source");
  }
  requireSafeText(payload.title, MAX_TEXT, "title", errors);
  if (!isOptionalText(payload.notes, MAX_NOTE)) {
    errors.push("notes");
  }
  if (payload.imageUrl !== undefined) {
    requireHttpsUrl(payload.imageUrl, "imageUrl", errors);
  }
  if (!Array.isArray(payload.galleryImageUrls) || payload.galleryImageUrls.length > MAX_IMAGES || !payload.galleryImageUrls.every(isHttpsUrl)) {
    errors.push("galleryImageUrls");
  }
  if (!isOptionMap(payload.selectedOptions)) {
    errors.push("selectedOptions");
  }
  if (!isFiniteNumber(payload.quantity) || payload.quantity < 1 || payload.quantity > 999) {
    errors.push("quantity");
  }
  if (payload.price !== undefined && !isPrice(payload.price)) {
    errors.push("price");
  }
  if (typeof payload.availability !== "string" || !VALID_AVAILABILITY_STATES.has(payload.availability)) {
    errors.push("availability");
  }
  if (typeof payload.metadataStatus !== "string" || !VALID_METADATA_STATUSES.has(payload.metadataStatus)) {
    errors.push("metadataStatus");
  }
  requirePositiveNumber(payload.capturedAt, "capturedAt", errors);
  requirePositiveNumber(payload.updatedAt, "updatedAt", errors);
  if (isFiniteNumber(payload.capturedAt) && isFiniteNumber(payload.updatedAt) && payload.updatedAt < payload.capturedAt) {
    errors.push("updatedAt");
  }
}

function validateProductObservationPayload(payload: Record<string, unknown>, errors: string[]): void {
  requireSafeText(payload.id, 80, "id", errors);
  requireSafeText(payload.snapshotId, 80, "snapshotId", errors);
  if (payload.productId !== undefined && !isSafeText(payload.productId, 120)) {
    errors.push("productId");
  }
  requireHttpsUrl(payload.canonicalUrl, "canonicalUrl", errors);
  if (typeof payload.source !== "string" || !VALID_OBSERVATION_SOURCES.has(payload.source)) {
    errors.push("source");
  }
  if (typeof payload.status !== "string" || !VALID_OBSERVATION_STATUSES.has(payload.status)) {
    errors.push("status");
  }
  if (typeof payload.confidence !== "string" || !VALID_OBSERVATION_CONFIDENCE.has(payload.confidence)) {
    errors.push("confidence");
  }
  requirePositiveNumber(payload.observedAt, "observedAt", errors);
  requirePositiveNumber(payload.createdAt, "createdAt", errors);
  requirePositiveNumber(payload.updatedAt, "updatedAt", errors);
  if (isFiniteNumber(payload.createdAt) && isFiniteNumber(payload.updatedAt) && payload.updatedAt < payload.createdAt) {
    errors.push("updatedAt");
  }
  if (typeof payload.availability !== "string" || !VALID_AVAILABILITY_STATES.has(payload.availability)) {
    errors.push("availability");
  }
  if (payload.price !== undefined && !isPrice(payload.price)) {
    errors.push("price");
  }
  if (!isOptionalText(payload.note, MAX_OBSERVATION_NOTE)) {
    errors.push("note");
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSafeText(value: unknown, max: number): value is string {
  return typeof value === "string"
    && value.trim().length > 0
    && value.trim().length <= max
    && !Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code >= 0 && code <= 31;
    });
}

function isOptionalText(value: unknown, max: number): boolean {
  return value === "" || value === undefined || isSafeText(value, max);
}

function isHttpsUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\//.test(value);
}

function requireHttpsUrl(value: unknown, field: string, errors: string[]): void {
  if (!isHttpsUrl(value)) {
    errors.push(field);
  }
}

function requireSafeText(value: unknown, max: number, field: string, errors: string[]): void {
  if (!isSafeText(value, max)) {
    errors.push(field);
  }
}

function requirePositiveNumber(value: unknown, field: string, errors: string[]): void {
  if (!isFiniteNumber(value) || value <= 0) {
    errors.push(field);
  }
}

function isOptionMap(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).every(([key, raw]) =>
    isSafeText(key, MAX_OPTION_KEY_LENGTH) && isSafeText(raw, MAX_OPTION_VALUE_LENGTH),
  );
}

function isPrice(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }

  return isFiniteNumber(value.amount)
    && value.amount >= 0
    && value.amount <= MAX_PRICE_AMOUNT
    && isSafeText(value.currency, 8)
    && isFiniteNumber(value.capturedAt)
    && value.capturedAt > 0;
}
