import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import type { EntitlementSnapshot } from "@/lib/accessModel";
import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "@/lib/accessModel";
import {
  setSyncEnabled,
  setSyncEnabledForSession,
} from "@/lib/cloudSync";
import {
  clearCloudSyncQueue,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
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
    snapshots: useProductSnapshotsStore(),
  };
}

function buildSnapshot(id = "snap-1"): ProductSnapshot {
  return {
    id,
    productId: "100",
    originalUrl: "https://www.temu.com/fr/product/100.html",
    canonicalUrl: "https://www.temu.com/fr/product/100.html",
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

describe("product observation store", () => {
  beforeEach(() => {
    vi.useRealTimers();
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
    setSyncEnabled(false);
    clearCloudSyncQueue();
  });

  it("appends observations and updates only safe snapshot fields", () => {
    const { observations, snapshots } = withStores();
    snapshots.upsertSnapshot(buildSnapshot());
    clearCloudSyncQueue();

    observations.appendObservation({
      snapshotId: "snap-1",
      productId: "100",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      availability: "low_stock",
      price: {
        amount: 14.99,
        currency: "EUR",
        capturedAt: 10,
      },
      observedAt: 10,
    });

    expect(observations.historyBySnapshot("snap-1")).toHaveLength(1);
    expect(snapshots.getSnapshot("snap-1")).toEqual(expect.objectContaining({
      title: "Article",
      availability: "low_stock",
      price: expect.objectContaining({
        amount: 14.99,
        currency: "EUR",
      }),
    }));
  });

  it("dedupes identical observations in the same timestamp bucket", () => {
    const { observations, snapshots } = withStores();
    snapshots.upsertSnapshot(buildSnapshot());

    const first = observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      availability: "available",
      observedAt: 60_010,
    });
    const second = observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      availability: "available",
      observedAt: 60_020,
    });

    expect(second.id).toBe(first.id);
    expect(observations.historyBySnapshot("snap-1")).toHaveLength(1);
  });

  it("keeps only the 50 newest observations per snapshot", () => {
    const { observations, snapshots } = withStores();
    snapshots.upsertSnapshot(buildSnapshot());

    for (let index = 1; index <= 55; index += 1) {
      observations.appendObservation({
        snapshotId: "snap-1",
        canonicalUrl: "https://www.temu.com/fr/product/100.html",
        source: "manual",
        availability: index % 2 === 0 ? "available" : "unknown",
        observedAt: index * 120_000,
      });
    }

    const history = observations.historyBySnapshot("snap-1");
    expect(history).toHaveLength(50);
    expect(history.at(-1)?.observedAt).toBe(6 * 120_000);
  });

  it("keeps manual-required WebView observations from overwriting snapshot availability", () => {
    const { observations, snapshots } = withStores();
    snapshots.upsertSnapshot({
      ...buildSnapshot(),
      availability: "available",
    });

    observations.createManualRequiredObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      observedAt: 10,
    });

    expect(observations.latestBySnapshot("snap-1")).toEqual(expect.objectContaining({
      status: "manual_required",
      availability: "unknown",
    }));
    expect(snapshots.getSnapshot("snap-1")?.availability).toBe("available");
  });

  it("queues observation upserts only when sync session is active", () => {
    const { observations, snapshots } = withStores();
    snapshots.upsertSnapshot(buildSnapshot());
    observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      availability: "available",
      observedAt: 10,
    });
    expect(listCloudSyncQueue()).toHaveLength(0);

    setSyncEnabledForSession(true, {
      globalUserId: ACCOUNT_MARKER.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT_MARKER,
      sourceDeviceId: "device-1",
    });

    observations.appendObservation({
      snapshotId: "snap-1",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      availability: "sold_out",
      observedAt: 120_000,
    });

    expect(listCloudSyncQueue()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        domain: "product_observation",
        operationType: "upsert",
      }),
    ]));
  });

  it("calculates local in-app reminder due state without notification permission", () => {
    const { observations } = withStores();
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    observations.setReminder("snap-1", true, 2);
    expect(observations.isReminderDue("snap-1", 1_000)).toBe(false);
    expect(observations.isReminderDue("snap-1", 1_000 + (2 * 24 * 60 * 60 * 1000))).toBe(true);

    observations.markReminderChecked("snap-1", 10_000);
    expect(observations.isReminderDue("snap-1", 10_000)).toBe(false);
  });
});
