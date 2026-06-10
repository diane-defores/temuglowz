import type {
  CloudSyncQueuedDeleteOperation,
  CloudSyncQueuedOperation,
  CloudSyncQueuedUpsertOperation,
  SyncAccountMarker,
  SyncDomain,
  SyncEnvironment,
} from "@/types/sync";
import {
  SYNC_DOMAINS,
  SYNC_PRODUCT_ID,
} from "@/types/sync";

const QUEUE_KEY = "temu:cloud-sync-queue-v1";
const MAX_PAYLOAD_BYTES = 128 * 1024;

interface RawCloudSyncQueuedOperation {
  idempotencyKey?: unknown;
  domain?: unknown;
  operationType?: unknown;
  recordKey?: unknown;
  payloadChecksum?: unknown;
  accountMarker?: unknown;
  sourceDeviceId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  attempts?: unknown;
  lastError?: unknown;
  nextRetryAt?: unknown;
  payload?: unknown;
}

const VALID_OPERATION_TYPES = new Set<"upsert" | "delete">(["upsert", "delete"]);
const VALID_DOMAINS = new Set<SyncDomain>(SYNC_DOMAINS);
const VALID_ENVIRONMENTS = new Set(["local", "preview", "staging", "production"]);

function readQueueRaw(): unknown[] {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      clearCloudSyncQueue();
      return [];
    }

    return parsed;
  } catch {
    clearCloudSyncQueue();
    return [];
  }
}

function parseAccountMarker(value: unknown): SyncAccountMarker | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const marker = value as Record<string, unknown>;
  if (typeof marker.accountId !== "string" || marker.accountId.length === 0) {
    return null;
  }
  if (typeof marker.productId !== "string" || marker.productId.length === 0) {
    return null;
  }
  if (marker.productId !== SYNC_PRODUCT_ID) {
    return null;
  }
  if (typeof marker.environment !== "string" || !VALID_ENVIRONMENTS.has(marker.environment)) {
    return null;
  }

  return {
    accountId: marker.accountId,
    productId: marker.productId,
    environment: marker.environment as SyncEnvironment,
  };
}

function isValidOperationType(value: unknown): value is "upsert" | "delete" {
  return typeof value === "string" && VALID_OPERATION_TYPES.has(value as "upsert" | "delete");
}

function isValidDomain(value: unknown): value is SyncDomain {
  return typeof value === "string" && VALID_DOMAINS.has(value as SyncDomain);
}

function readCloudSyncQueue(): CloudSyncQueuedOperation[] {
  const rawQueue = readQueueRaw();
  const queue: CloudSyncQueuedOperation[] = [];
  let hasInvalidEntry = false;

  for (const item of rawQueue) {
    if (!isValidQueuedOperation(item)) {
      hasInvalidEntry = true;
      break;
    }
    queue.push(item);
  }

  if (hasInvalidEntry) {
    clearCloudSyncQueue();
    return [];
  }

  queue.sort((left, right) => {
    if (left.updatedAt === right.updatedAt) {
      return left.createdAt - right.createdAt;
    }
    return left.updatedAt - right.updatedAt;
  });

  return queue;
}

function isValidQueuedOperation(
  value: unknown,
): value is CloudSyncQueuedOperation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const op = value as RawCloudSyncQueuedOperation;
  if (!isValidOperationType(op.operationType) || !isValidDomain(op.domain)) {
    return false;
  }
  if (typeof op.idempotencyKey !== "string" || op.idempotencyKey.length === 0) {
    return false;
  }
  if (typeof op.recordKey !== "string" || op.recordKey.length === 0) {
    return false;
  }
  if (typeof op.payloadChecksum !== "string" || op.payloadChecksum.length === 0) {
    return false;
  }
  if (typeof op.sourceDeviceId !== "string" || op.sourceDeviceId.length === 0) {
    return false;
  }
  if (typeof op.createdAt !== "number" || op.createdAt < 0) {
    return false;
  }
  if (typeof op.updatedAt !== "number" || op.updatedAt < 0) {
    return false;
  }
  if (typeof op.attempts !== "number" || !Number.isFinite(op.attempts) || op.attempts < 0) {
    return false;
  }

  const marker = parseAccountMarker(op.accountMarker);
  if (!marker) {
    return false;
  }

  if (op.operationType === "upsert") {
    if (!("payload" in op)) {
      return false;
    }
    return true;
  }

  if ("payload" in op && op.payload !== undefined) {
    return false;
  }

  return true;
}

function writeQueue(queue: CloudSyncQueuedOperation[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueCloudSyncJob(payload: Omit<CloudSyncQueuedOperation, "createdAt" | "updatedAt" | "attempts"> & {
  payload?: unknown;
}): void {
  const queue = readCloudSyncQueue();

  if (payload.operationType === "upsert" && payload.payload === undefined) {
    throw new Error("upsert operation requires a payload");
  }
  if (payload.operationType === "delete") {
    const delOp: CloudSyncQueuedDeleteOperation = payload as CloudSyncQueuedDeleteOperation;
    queue.unshift({
      ...delOp,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attempts: 0,
    });
  } else {
    const upsertOp = payload as CloudSyncQueuedUpsertOperation;
    const payloadSize = JSON.stringify(upsertOp.payload).length;
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      throw new Error("cloud sync payload too large");
    }
    queue.unshift({
      ...upsertOp,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attempts: 0,
    });
  }

  const seen = new Set<string>();
  const deduped = queue.filter((job) => {
    if (seen.has(job.idempotencyKey)) {
      return false;
    }
    seen.add(job.idempotencyKey);
    return true;
  });

  deduped.sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return right.updatedAt - left.updatedAt;
    }
    return right.createdAt - left.createdAt;
  });

  writeQueue(deduped);
}

export function clearCloudSyncQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function hasPendingCloudSync(): boolean {
  return readCloudSyncQueue().length > 0;
}

export function listCloudSyncQueue(): CloudSyncQueuedOperation[] {
  return readCloudSyncQueue();
}

export function removeCloudSyncJob(idempotencyKey: string): void {
  const queue = readCloudSyncQueue();
  const reduced = queue.filter((job) => job.idempotencyKey !== idempotencyKey);
  if (reduced.length === queue.length) {
    return;
  }
  writeQueue(reduced);
}

export function ackCloudSyncJob(idempotencyKey: string): void {
  removeCloudSyncJob(idempotencyKey);
}

export function flushCloudSyncQueue(): void {
  clearCloudSyncQueue();
}

export function updateCloudSyncJobRetryMetadata(
  idempotencyKey: string,
  params: {
    lastError?: string;
    nextRetryAt?: number;
  },
): void {
  const queue = readCloudSyncQueue();
  const updated = queue.map((job) => {
    if (job.idempotencyKey !== idempotencyKey) {
      return job;
    }

    return {
      ...job,
      attempts: job.attempts + 1,
      updatedAt: Date.now(),
      lastError: params.lastError,
      nextRetryAt: params.nextRetryAt,
    };
  });

  writeQueue(updated);
}
