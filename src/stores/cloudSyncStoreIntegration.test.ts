import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import type { EntitlementSnapshot } from "@/lib/accessModel";
import {
  setSyncEnabled,
  setSyncEnabledForSession,
} from "@/lib/cloudSync";
import {
  clearCloudSyncQueue,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "@/lib/accessModel";
import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import type { ProductSnapshot } from "@/types/domain";
import type { SyncAccountMarker } from "@/types/sync";
import { SYNC_PRODUCT_ID } from "@/types/sync";

class LocalStorageBag {
  private readonly data = new Map<string, string>();

  clear() {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

const ACCOUNT_MARKER: SyncAccountMarker = {
  accountId: "global-user-1",
  productId: SYNC_PRODUCT_ID,
  environment: "local",
};

const ACTIVE_ENTITLEMENT: EntitlementSnapshot = {
  productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
  planId: "sync",
  status: "active",
  source: "manual",
  checkedAt: 1,
};

function withStores() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return {
    observations: useProductObservationsStore(),
    shoppingLists: useShoppingListsStore(),
    snapshots: useProductSnapshotsStore(),
  };
}

function buildSnapshot(id: string): ProductSnapshot {
  return {
    id,
    productId: "100",
    originalUrl: `https://www.temu.com/fr/product/${id}.html`,
    canonicalUrl: `https://www.temu.com/fr/product/${id}.html`,
    source: "manual",
    title: "Article",
    notes: "note",
    galleryImageUrls: [],
    selectedOptions: {},
    quantity: 1,
    availability: "unknown",
    metadataStatus: "ok",
    capturedAt: 1,
    updatedAt: 1,
  };
}

describe("store mutations and cloud sync queue integration", () => {
  beforeEach(() => {
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
    setSyncEnabled(false);
    clearCloudSyncQueue();
  });

  it("keeps local-only store mutations out of the cloud sync queue", () => {
    const { observations, shoppingLists, snapshots } = withStores();
    const listId = shoppingLists.createList("Cuisine");
    snapshots.upsertSnapshot(buildSnapshot("snap-1"));
    shoppingLists.addItem(listId, "snap-1");
    observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/snap-1.html",
      source: "manual",
      availability: "available",
      observedAt: 10,
    });

    expect(listCloudSyncQueue()).toHaveLength(0);
  });

  it("queues list, item, and snapshot upserts when sync session is active", () => {
    setSyncEnabledForSession(true, {
      globalUserId: ACCOUNT_MARKER.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT_MARKER,
      sourceDeviceId: "device-1",
    });

    const { observations, shoppingLists, snapshots } = withStores();
    const listId = shoppingLists.createList("Cuisine");
    snapshots.upsertSnapshot(buildSnapshot("snap-1"));
    shoppingLists.addItem(listId, "snap-1");
    observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/snap-1.html",
      source: "manual",
      availability: "available",
      observedAt: 10,
    });

    expect(listCloudSyncQueue()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: "shopping_list",
          operationType: "upsert",
          recordKey: listId,
        }),
        expect.objectContaining({
          domain: "product_snapshot",
          operationType: "upsert",
          recordKey: "snap-1",
        }),
        expect.objectContaining({
          domain: "shopping_list_item",
          operationType: "upsert",
        }),
        expect.objectContaining({
          domain: "product_observation",
          operationType: "upsert",
        }),
      ]),
    );
  });

  it("queues tombstone operations for item and snapshot deletes", () => {
    setSyncEnabledForSession(true, {
      globalUserId: ACCOUNT_MARKER.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT_MARKER,
      sourceDeviceId: "device-1",
    });

    const { shoppingLists, snapshots } = withStores();
    const listId = shoppingLists.createList("Cuisine");
    snapshots.upsertSnapshot(buildSnapshot("snap-1"));
    const itemId = shoppingLists.addItem(listId, "snap-1");
    clearCloudSyncQueue();

    shoppingLists.removeItem(listId, itemId);

    expect(listCloudSyncQueue()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          domain: "shopping_list_item",
          operationType: "delete",
          recordKey: itemId,
        }),
        expect.objectContaining({
          domain: "product_snapshot",
          operationType: "delete",
          recordKey: "snap-1",
        }),
      ]),
    );
  });
});
