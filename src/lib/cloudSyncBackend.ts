import type {
  DefaultFunctionArgs,
  FunctionReference,
} from "convex/server";

import { getConvexClient } from "@/lib/convex";
import type {
  CloudSyncQueuedOperation,
  SyncDomain,
  SyncEnvironment,
  SyncOperationType,
} from "@/types/sync";

export interface CloudSyncStatusResponse {
  productId: "temu_shopping_lists";
  access: "active";
  environment: SyncEnvironment;
  ownerId: string;
}

export interface CloudSyncRemoteRecord {
  domain: SyncDomain;
  operationType: SyncOperationType;
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
}

export interface CloudSyncHydrationResponse {
  productId: "temu_shopping_lists";
  environment: SyncEnvironment;
  ownerId: string;
  records: CloudSyncRemoteRecord[];
  continueCursor: string;
  isDone: boolean;
  pageStatus?: "SplitRecommended" | "SplitRequired" | null;
}

export interface CloudSyncPushResponse {
  status: "inserted" | "updated" | "duplicate" | "stale";
  serverUpdatedAt: number;
}

type ActionRef<TArgs extends DefaultFunctionArgs, TResult> = FunctionReference<
  "action",
  "public",
  TArgs,
  TResult,
  string | undefined
>;

const getCloudSyncStatusRef = "sync:getCloudSyncStatus" as unknown as ActionRef<
  { environment: SyncEnvironment },
  CloudSyncStatusResponse
>;

const listSyncRecordsRef = "sync:listSyncRecords" as unknown as ActionRef<
  {
    environment: SyncEnvironment;
    since?: number;
    limit?: number;
    cursor?: string | null;
  },
  CloudSyncHydrationResponse
>;

const pushSyncOperationRef = "sync:pushSyncOperation" as unknown as ActionRef<
  {
    environment: SyncEnvironment;
    domain: SyncDomain;
    operationType: SyncOperationType;
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
  CloudSyncPushResponse
>;

export async function getCloudSyncStatus(
  environment: SyncEnvironment,
): Promise<CloudSyncStatusResponse> {
  return getConvexClient().action(getCloudSyncStatusRef, { environment });
}

export async function listCloudSyncRecords(params: {
  environment: SyncEnvironment;
  since?: number;
  limit?: number;
  cursor?: string | null;
}): Promise<CloudSyncHydrationResponse> {
  return getConvexClient().action(listSyncRecordsRef, params);
}

export async function pushCloudSyncOperation(params: {
  environment: SyncEnvironment;
  operation: CloudSyncQueuedOperation;
}): Promise<CloudSyncPushResponse> {
  const { operation } = params;
  return getConvexClient().action(pushSyncOperationRef, {
    environment: params.environment,
    domain: operation.domain,
    operationType: operation.operationType,
    recordKey: operation.recordKey,
    checksum: operation.payloadChecksum,
    idempotencyKey: operation.idempotencyKey,
    sourceDeviceId: operation.sourceDeviceId,
    localUpdatedAt: operation.updatedAt,
    payload: operation.operationType === "upsert" ? operation.payload : undefined,
    tombstone: operation.operationType === "delete"
      ? {
          deletedAt: operation.updatedAt,
          reason: "user_deleted",
        }
      : undefined,
  });
}
