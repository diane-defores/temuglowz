import type {
  ProductObservation,
  ProductSnapshot,
  ShoppingList,
  ShoppingListItem,
} from "@/types/domain";

export const SYNC_PRODUCT_ID = "temu_shopping_lists";

export const SYNC_DOMAINS = [
  "shopping_list",
  "shopping_list_item",
  "product_snapshot",
  "product_observation",
] as const;

export type SyncDomain = (typeof SYNC_DOMAINS)[number];

export type SyncOperationType = "upsert" | "delete";

export type SyncStatus =
  | "local_only"
  | "pending"
  | "syncing"
  | "synced"
  | "conflict"
  | "retrying"
  | "error";

export type SyncEnvironment = "local" | "preview" | "staging" | "production";

export type SyncChecksum = string;
export type SyncRecordKey = string;
export type SyncRecordId = string;
export type SyncIdempotencyKey = string;
export type SyncSourceDeviceId = string;

export interface SyncAccountMarker {
  accountId: string;
  productId: typeof SYNC_PRODUCT_ID;
  environment: SyncEnvironment;
}

export type SyncJsonPrimitive = string | number | boolean | null;
export type SyncJsonValue = unknown;

export interface SyncDomainPayloadMap {
  shopping_list: ShoppingList;
  shopping_list_item: ShoppingListItem;
  product_snapshot: ProductSnapshot;
  product_observation: ProductObservation;
}

export type SyncDomainPayload = SyncDomainPayloadMap[SyncDomain];

export interface SyncDomainRecordMeta {
  recordId: SyncRecordId;
  domain: SyncDomain;
  recordKey: SyncRecordKey;
  checksum: SyncChecksum;
  sourceDeviceId: SyncSourceDeviceId;
  localUpdatedAt: number;
  cloudUpdatedAt?: number;
  status: SyncStatus;
  accountMarker: SyncAccountMarker;
}

export interface SyncUpsertRecord<TPayload extends SyncDomainPayload = SyncDomainPayload>
  extends SyncDomainRecordMeta {
  operationType: "upsert";
  payload: TPayload;
}

export interface SyncTombstoneRecord extends SyncDomainRecordMeta {
  operationType: "delete";
  deletedAt: number;
  deletedReason?: "user_deleted" | "device_rebase" | "sync_resolution";
}

export type SyncRecord<TPayload extends SyncDomainPayload = SyncDomainPayload> =
  | SyncUpsertRecord<TPayload>
  | SyncTombstoneRecord;

export interface SyncConflictRecord<TPayload extends SyncDomainPayload = SyncDomainPayload> {
  conflictId: SyncRecordId;
  domain: SyncDomain;
  recordKey: SyncRecordKey;
  reason: "checksum_mismatch" | "clock_skew" | "unsafe_metadata";
  localRecord: SyncUpsertRecord<TPayload>;
  remoteRecord: SyncUpsertRecord<TPayload>;
  createdAt: number;
  resolvedAt?: number;
}

export interface BaseCloudSyncQueuedOperation {
  idempotencyKey: SyncIdempotencyKey;
  domain: SyncDomain;
  operationType: SyncOperationType;
  recordKey: string;
  payloadChecksum: SyncChecksum;
  accountMarker: SyncAccountMarker;
  sourceDeviceId: SyncSourceDeviceId;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  lastError?: string;
  nextRetryAt?: number;
}

export interface CloudSyncQueuedUpsertOperation<TPayload extends SyncDomainPayload = SyncDomainPayload>
  extends BaseCloudSyncQueuedOperation {
  operationType: "upsert";
  payload: TPayload;
}

export interface CloudSyncQueuedDeleteOperation extends BaseCloudSyncQueuedOperation {
  operationType: "delete";
  payload?: undefined;
}

export type CloudSyncQueuedOperation<TPayload extends SyncDomainPayload = SyncDomainPayload> =
  | CloudSyncQueuedUpsertOperation<TPayload>
  | CloudSyncQueuedDeleteOperation;
