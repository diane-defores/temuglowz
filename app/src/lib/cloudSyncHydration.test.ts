import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { applyCloudSyncRecords } from "@/lib/cloudSyncHydration";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import type { CloudSyncRemoteRecord } from "@/lib/cloudSyncBackend";

const now = 1_700_000_000_000;

function listRecord(
  id: string,
  updatedAt = now,
  name = "Cloud list",
): CloudSyncRemoteRecord {
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
      name,
      itemIds: [],
      createdAt: updatedAt,
      updatedAt,
    },
  };
}

function listDeleteRecord(id: string, deletedAt = now): CloudSyncRemoteRecord {
  return {
    domain: "shopping_list",
    operationType: "delete",
    recordKey: id,
    checksum: "delete",
    idempotencyKey: `idem-delete-${id}`,
    sourceDeviceId: "device-cloud",
    localUpdatedAt: deletedAt,
    serverUpdatedAt: deletedAt,
    tombstone: {
      deletedAt,
      reason: "user_deleted",
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

  it("applies duplicate retried page records idempotently", () => {
    const lists = useShoppingListsStore();

    const summary = applyCloudSyncRecords([
      listRecord("same-list", now, "Cloud list"),
      listRecord("same-list", now, "Cloud list"),
    ]);

    expect(summary).toEqual({ applied: 2, skipped: 0 });
    expect(lists.lists["same-list"]?.name).toBe("Cloud list");
    expect(Object.keys(lists.lists)).toEqual(["same-list"]);
  });

  it("skips stale upsert when cloud update is older than local record", () => {
    const lists = useShoppingListsStore();
    lists.lists["same-list"] = {
      id: "same-list",
      name: "Brand new",
      itemIds: [],
      createdAt: now,
      updatedAt: now + 100,
    };

    const summary = applyCloudSyncRecords([listRecord("same-list", now - 10)]);

    expect(summary).toEqual({ applied: 0, skipped: 1 });
    expect(lists.lists["same-list"]?.name).toBe("Brand new");
  });

  it("does not apply stale remote tombstone for newer local data", () => {
    const lists = useShoppingListsStore();
    lists.lists["same-list"] = {
      id: "same-list",
      name: "Local newer",
      itemIds: [],
      createdAt: now,
      updatedAt: now + 100,
    };

    const summary = applyCloudSyncRecords([listDeleteRecord("same-list", now)]);

    expect(summary).toEqual({ applied: 0, skipped: 1 });
    expect(lists.lists["same-list"]?.name).toBe("Local newer");
  });

  it("applies remote tombstone when it is newer than local data", () => {
    const lists = useShoppingListsStore();
    lists.lists["same-list"] = {
      id: "same-list",
      name: "Local newer",
      itemIds: [],
      createdAt: now,
      updatedAt: now + 10,
    };

    const summary = applyCloudSyncRecords([listDeleteRecord("same-list", now + 20)]);

    expect(summary).toEqual({ applied: 1, skipped: 0 });
    expect(lists.lists["same-list"]).toBeUndefined();
  });
});
