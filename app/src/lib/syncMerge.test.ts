import { describe, expect, it } from "vitest";

import type {
  ProductSnapshot,
  ShoppingList,
} from "@/types/domain";
import type {
  SyncAccountMarker,
  SyncDomainPayload,
  SyncConflictRecord,
  SyncUpsertRecord,
  SyncTombstoneRecord,
} from "@/types/sync";

import {
  computeSyncChecksum,
  mergeCloudSyncRecords,
} from "@/lib/syncMerge";

const ACCOUNT_MARKER: SyncAccountMarker = {
  accountId: "acct-1",
  productId: "temu_shopping_lists",
  environment: "local",
};

function makeList(name: string, updatedAt: number): ShoppingList {
  return {
    id: `list-${name}`,
    name,
    itemIds: [],
    createdAt: updatedAt,
    updatedAt,
  };
}

function makeSnapshot(id: string, title: string, updatedAt: number): ProductSnapshot {
  return {
    id,
    productId: "product-1",
    originalUrl: `https://www.temu.com/${id}`,
    canonicalUrl: `https://www.temu.com/${id}`,
    source: "manual",
    title,
    notes: "",
    galleryImageUrls: [],
    selectedOptions: {},
    quantity: 1,
    availability: "unknown",
    metadataStatus: "ok",
    capturedAt: updatedAt,
    updatedAt,
  };
}

function makeUpsert(
  domainRecord: {
    domain: "shopping_list" | "shopping_list_item" | "product_snapshot";
    recordKey: string;
    payload: SyncDomainPayload;
    updatedAt: number;
  },
): SyncUpsertRecord<SyncDomainPayload> {
  return {
    recordId: `record-${domainRecord.recordKey}`,
    domain: domainRecord.domain,
    recordKey: domainRecord.recordKey,
    checksum: computeSyncChecksum(domainRecord.payload),
    sourceDeviceId: "device-1",
    localUpdatedAt: domainRecord.updatedAt,
    status: "synced",
    accountMarker: ACCOUNT_MARKER,
    operationType: "upsert",
    payload: domainRecord.payload,
  };
}

function makeTombstone(
  domainRecord: {
    domain: "shopping_list" | "shopping_list_item" | "product_snapshot";
    recordKey: string;
    deletedAt: number;
  },
): SyncTombstoneRecord {
  return {
    recordId: `record-${domainRecord.recordKey}`,
    domain: domainRecord.domain,
    recordKey: domainRecord.recordKey,
    checksum: "delete",
    sourceDeviceId: "device-1",
    localUpdatedAt: domainRecord.deletedAt,
    status: "synced",
    accountMarker: ACCOUNT_MARKER,
    operationType: "delete",
    deletedAt: domainRecord.deletedAt,
    deletedReason: "user_deleted",
  };
}

describe("sync merge core behavior", () => {
  it("TC-SYNC-AUTO-008: same key and same checksum is idempotent", () => {
    const list = makeList("Maison", 1);
    const localRecord = makeUpsert({
      domain: "shopping_list",
      recordKey: "list-maison",
      payload: { ...list },
      updatedAt: list.updatedAt,
    });
    const remoteRecord = makeUpsert({
      domain: "shopping_list",
      recordKey: "list-maison",
      payload: { ...list },
      updatedAt: list.updatedAt,
    });

    const result = mergeCloudSyncRecords({
      local: [localRecord],
      remote: [remoteRecord],
    });

    expect(result.noopKeys).toContain("shopping_list::list-maison");
    expect(result.toUpdateLocal).toHaveLength(0);
    expect(result.toUpdateRemote).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
  });

  it("TC-SYNC-AUTO-009: disjoint local and remote keys merge both ways", () => {
    const localList = makeList("Maison", 1);
    const localSnapshot = makeSnapshot("snap-local", "Produit A", 2);
    const remoteSnapshot = makeSnapshot("snap-remote", "Produit B", 3);

    const result = mergeCloudSyncRecords({
      local: [
        makeUpsert({
          domain: "shopping_list",
          recordKey: localList.id,
          payload: localList,
          updatedAt: localList.updatedAt,
        }),
        makeUpsert({
          domain: "product_snapshot",
          recordKey: localSnapshot.id,
          payload: localSnapshot,
          updatedAt: localSnapshot.updatedAt,
        }),
      ],
      remote: [
        makeUpsert({
          domain: "product_snapshot",
          recordKey: remoteSnapshot.id,
          payload: remoteSnapshot,
          updatedAt: remoteSnapshot.updatedAt,
        }),
      ],
    });

    expect(result.conflicts).toHaveLength(0);
    expect(result.toUpdateLocal).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: "product_snapshot",
          recordKey: remoteSnapshot.id,
        }),
      ]),
    );
    expect(result.toUpdateRemote).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: "shopping_list",
          recordKey: localList.id,
        }),
        expect.objectContaining({
          domain: "product_snapshot",
          recordKey: localSnapshot.id,
        }),
      ]),
    );
  });

  it("TC-SYNC-AUTO-010: same key with different checksum creates a conflict", () => {
    const result = mergeCloudSyncRecords({
      local: [
        makeUpsert({
          domain: "product_snapshot",
          recordKey: "snap-shared",
          payload: makeSnapshot("snap-shared", "Prix bas", 1),
          updatedAt: 1,
        }),
      ],
      remote: [
        makeUpsert({
          domain: "product_snapshot",
          recordKey: "snap-shared",
          payload: makeSnapshot("snap-shared", "Prix élevé", 2),
          updatedAt: 2,
        }),
      ],
    });

    expect(result.noopKeys).toHaveLength(0);
    expect(result.toUpdateLocal).toHaveLength(0);
    expect(result.toUpdateRemote).toHaveLength(0);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]!.reason).toBe("checksum_mismatch");
    const conflict = result.conflicts[0] as SyncConflictRecord;
    expect(conflict.recordKey).toBe("snap-shared");
    expect(conflict.localRecord.recordKey).toBe("snap-shared");
    expect(conflict.remoteRecord.recordKey).toBe("snap-shared");
  });

  it("TC-SYNC-AUTO-011: remote tombstone prevents local resurrection", () => {
    const result = mergeCloudSyncRecords({
      local: [
        makeUpsert({
          domain: "shopping_list",
          recordKey: "list-shared",
          payload: makeList("Cuisine", 1),
          updatedAt: 1,
        }),
      ],
      remote: [
        makeTombstone({
          domain: "shopping_list",
          recordKey: "list-shared",
          deletedAt: 10,
        }),
      ],
    });

    expect(result.toUpdateLocal).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operationType: "delete",
          recordKey: "list-shared",
        }),
      ]),
    );
    expect(result.conflicts).toHaveLength(0);
  });

  it("TC-SYNC-AUTO-011: local tombstone prevents remote resurrection", () => {
    const result = mergeCloudSyncRecords({
      local: [
        makeTombstone({
          domain: "shopping_list",
          recordKey: "list-shared",
          deletedAt: 10,
        }),
      ],
      remote: [
        makeUpsert({
          domain: "shopping_list",
          recordKey: "list-shared",
          payload: makeList("Cuisine", 20),
          updatedAt: 20,
        }),
      ],
    });

    expect(result.toUpdateRemote).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operationType: "delete",
          recordKey: "list-shared",
        }),
      ]),
    );
    expect(result.conflicts).toHaveLength(0);
  });

  it("stable checksum ignores object key order", () => {
    const objectA = { b: 2, a: { c: 3, b: 1 } };
    const objectB = { a: { b: 1, c: 3 }, b: 2 };
    expect(computeSyncChecksum(objectA)).toBe(computeSyncChecksum(objectB));
  });
});
