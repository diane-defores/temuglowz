import type {
  SyncConflictRecord,
  SyncDomain,
  SyncDomainPayload,
  SyncJsonValue,
  SyncRecord,
  SyncRecordKey,
  SyncTombstoneRecord,
  SyncUpsertRecord,
} from "@/types/sync";

function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function serializeSyncPayload(payload: SyncJsonValue): string {
  const normalized = normalizeForChecksum(payload);
  return JSON.stringify(normalized);
}

function normalizeForChecksum(payload: SyncJsonValue): SyncJsonValue {
  if (payload === undefined) {
    return null;
  }
  if (payload === null) {
    return null;
  }
  if (typeof payload === "string" || typeof payload === "number" || typeof payload === "boolean") {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map((value) => normalizeForChecksum(value as SyncJsonValue));
  }
  if (isObject(payload)) {
    const entries = Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    const normalized: Record<string, SyncJsonValue> = {};
    for (const [key, value] of entries) {
      normalized[key] = normalizeForChecksum(value as SyncJsonValue);
    }
    return normalized;
  }
  return String(payload);
}

export function computeSyncChecksum(payload: SyncJsonValue): string {
  const text = serializeSyncPayload(payload);
  let hash = 0x811c9dc5;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

export interface SyncMergeInput {
  local: Array<SyncRecord<SyncDomainPayload>>;
  remote: Array<SyncRecord<SyncDomainPayload>>;
}

export interface SyncMergePlan {
  noopKeys: SyncRecordKey[];
  toUpdateLocal: Array<SyncRecord<SyncDomainPayload>>;
  toUpdateRemote: Array<SyncRecord<SyncDomainPayload>>;
  conflicts: Array<SyncConflictRecord<SyncDomainPayload>>;
}

function recordKey(record: SyncRecord<SyncDomainPayload>): string {
  return `${record.domain}::${record.recordKey}`;
}

function recordVersion(record: SyncRecord<SyncDomainPayload>): number {
  if (record.operationType === "delete") {
    return record.deletedAt;
  }
  return record.localUpdatedAt;
}

function isTombstone(
  record: SyncRecord<SyncDomainPayload>,
): record is SyncTombstoneRecord {
  return record.operationType === "delete";
}

function toSortedRecords(
  records: Array<SyncRecord<SyncDomainPayload>>,
): Map<string, SyncRecord<SyncDomainPayload>> {
  const byKey = new Map<string, SyncRecord<SyncDomainPayload>>();
  for (const record of records) {
    const key = recordKey(record);
    const existing = byKey.get(key);
    if (!existing || recordVersion(record) > recordVersion(existing)) {
      byKey.set(key, record);
    }
  }
  return byKey;
}

export function mergeCloudSyncRecords(input: SyncMergeInput): SyncMergePlan {
  const localByKey = toSortedRecords(input.local);
  const remoteByKey = toSortedRecords(input.remote);
  const keys = new Set([...localByKey.keys(), ...remoteByKey.keys()]);
  const sortedKeys = [...keys].sort();

  const result: SyncMergePlan = {
    noopKeys: [],
    toUpdateLocal: [],
    toUpdateRemote: [],
    conflicts: [],
  };

  for (const key of sortedKeys) {
    const left = localByKey.get(key);
    const right = remoteByKey.get(key);
    if (!left) {
      if (right) {
        result.toUpdateLocal.push(right);
      }
      continue;
    }
    if (!right) {
      result.toUpdateRemote.push(left);
      continue;
    }

    if (left.operationType !== "delete" && right.operationType !== "delete") {
      if (left.checksum === right.checksum) {
        result.noopKeys.push(key);
        continue;
      }

      if (left.domain !== right.domain || left.recordKey !== right.recordKey) {
        throw new Error("inconsistent sync key");
      }

      result.conflicts.push(createConflictRecord(left, right));

      continue;
    }

    const tombstone = isTombstone(left) ? left : right;
    if (!isTombstone(left)) {
      result.toUpdateLocal.push(tombstone);
    }
    if (!isTombstone(right)) {
      result.toUpdateRemote.push(tombstone);
    }
  }

  return {
    ...result,
    toUpdateLocal: dedupeByRecordKey(result.toUpdateLocal),
    toUpdateRemote: dedupeByRecordKey(result.toUpdateRemote),
  };
}

function createConflictRecord(
  localRecord: SyncUpsertRecord<SyncDomainPayload>,
  remoteRecord: SyncUpsertRecord<SyncDomainPayload>,
): SyncConflictRecord<SyncDomainPayload> {
  return {
    conflictId: `${localRecord.domain}:${localRecord.recordKey}:${localRecord.localUpdatedAt}`,
    domain: localRecord.domain,
    recordKey: localRecord.recordKey,
    reason: "checksum_mismatch",
    localRecord,
    remoteRecord,
    createdAt: Date.now(),
  };
}

function dedupeByRecordKey(
  records: Array<SyncRecord<SyncDomainPayload>>,
): Array<SyncRecord<SyncDomainPayload>> {
  const byKey = new Map<string, SyncRecord<SyncDomainPayload>>();
  for (const record of records) {
    const key = `${record.domain}::${record.recordKey}::${record.operationType}`;
    const existing = byKey.get(key);
    if (!existing || recordVersion(record) > recordVersion(existing)) {
      byKey.set(key, record);
    }
  }
  return [...byKey.values()].sort((left, right) => {
    const keyCompare = recordKey(left).localeCompare(recordKey(right));
    if (keyCompare !== 0) {
      return keyCompare;
    }
    if (left.operationType === right.operationType) {
      return 0;
    }
    return left.operationType === "delete" ? -1 : 1;
  });
}

export const SUPPORTED_SYNC_DOMAINS: SyncDomain[] = [
  "shopping_list",
  "shopping_list_item",
  "product_snapshot",
];
