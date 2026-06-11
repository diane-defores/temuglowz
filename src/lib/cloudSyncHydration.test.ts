import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { applyCloudSyncRecords } from "@/lib/cloudSyncHydration";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import type { CloudSyncRemoteRecord } from "@/lib/cloudSyncBackend";

const now = 1_700_000_000_000;

function listRecord(id: string, updatedAt = now): CloudSyncRemoteRecord {
  return {
    domain: "shopping_list",
    operationType: "upsert",
    recordKey: id,
    checksum: "checksum-list",
    idempotencyKey: `idem-${id}`,
    sourceDeviceId: "device-cloud",
    localUpdatedAt: updatedAt,
    serverUpdatedAt: updatedAt,
    payload: {
      id,
      name: "Cloud list",
      itemIds: [],
      createdAt: updatedAt,
      updatedAt,
    },
  };
}

describe("cloud sync guarded hydration", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("applies valid remote records without clearing unrelated local data", () => {
    const lists = useShoppingListsStore();
    const snapshots = useProductSnapshotsStore();
    lists.lists["local-list"] = {
      id: "local-list",
      name: "Local list",
      itemIds: [],
      createdAt: now,
      updatedAt: now,
    };
    snapshots.snapshots["local-snapshot"] = {
      id: "local-snapshot",
      originalUrl: "https://www.temu.com/local.html",
      canonicalUrl: "https://www.temu.com/local.html",
      source: "manual",
      title: "Local snapshot",
      notes: "",
      galleryImageUrls: [],
      selectedOptions: {},
      quantity: 1,
      availability: "unknown",
      metadataStatus: "manual_required",
      capturedAt: now,
      updatedAt: now,
    };

    const summary = applyCloudSyncRecords([
      listRecord("cloud-list"),
      {
        ...listRecord("invalid-list"),
        payload: { id: "invalid-list" },
      },
    ]);

    expect(summary).toEqual({ applied: 1, skipped: 1 });
    expect(lists.lists["local-list"]?.name).toBe("Local list");
    expect(lists.lists["cloud-list"]?.name).toBe("Cloud list");
    expect(snapshots.snapshots["local-snapshot"]?.title).toBe("Local snapshot");
  });

  it("does not overwrite newer local records with older remote payloads", () => {
    const lists = useShoppingListsStore();
    lists.lists["same-list"] = {
      id: "same-list",
      name: "New local",
      itemIds: [],
      createdAt: now,
      updatedAt: now + 10,
    };

    const summary = applyCloudSyncRecords([listRecord("same-list", now)]);

    expect(summary).toEqual({ applied: 0, skipped: 1 });
    expect(lists.lists["same-list"]?.name).toBe("New local");
  });
});
