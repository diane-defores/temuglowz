import { beforeEach, describe, expect, it } from "vitest";

import type { ShoppingList } from "@/types/domain";
import { SYNC_PRODUCT_ID } from "@/types/sync";
import type { SyncAccountMarker } from "@/types/sync";
import { computeSyncChecksum } from "@/lib/syncMerge";

import {
  ackCloudSyncJob,
  clearCloudSyncQueue,
  enqueueCloudSyncJob,
  hasPendingCloudSync,
  listCloudSyncQueue,
  updateCloudSyncJobRetryMetadata,
} from "@/lib/cloudSyncQueue";

const QUEUE_KEY = "temu:cloud-sync-queue-v1";

const ACCOUNT_A: SyncAccountMarker = {
  accountId: "acct-a",
  productId: SYNC_PRODUCT_ID,
  environment: "local",
};

const ACCOUNT_B: SyncAccountMarker = {
  accountId: "acct-b",
  productId: SYNC_PRODUCT_ID,
  environment: "local",
};

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

function makeListPayload(id: string): ShoppingList {
  return {
    id,
    name: "Liste",
    itemIds: [],
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("cloud sync queue", () => {
  beforeEach(() => {
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
    clearCloudSyncQueue();
  });

  it("TC-SYNC-AUTO-012: idempotency and account-aware replay filtering", () => {
    enqueueCloudSyncJob({
      idempotencyKey: "job-dup",
      domain: "shopping_list",
      operationType: "upsert",
      recordKey: "list-1",
      payload: makeListPayload("list-1"),
      payloadChecksum: computeSyncChecksum(makeListPayload("list-1")),
      accountMarker: ACCOUNT_A,
      sourceDeviceId: "device-a",
    });

    enqueueCloudSyncJob({
      idempotencyKey: "job-dup",
      domain: "shopping_list",
      operationType: "upsert",
      recordKey: "list-1",
      payload: makeListPayload("list-1"),
      payloadChecksum: computeSyncChecksum(makeListPayload("list-1")),
      accountMarker: ACCOUNT_A,
      sourceDeviceId: "device-a",
    });

    enqueueCloudSyncJob({
      idempotencyKey: "job-other",
      domain: "shopping_list",
      operationType: "delete",
      recordKey: "list-2",
      payloadChecksum: "delete",
      accountMarker: ACCOUNT_B,
      sourceDeviceId: "device-b",
    });

    const allJobs = listCloudSyncQueue();
    expect(allJobs).toHaveLength(2);
    expect(hasPendingCloudSync()).toBe(true);

    const replayable = allJobs.filter(
      (job) => job.accountMarker.accountId === ACCOUNT_A.accountId,
    );
    expect(replayable).toHaveLength(1);
    expect(replayable[0]!.idempotencyKey).toBe("job-dup");

    updateCloudSyncJobRetryMetadata("job-dup", {
      lastError: "network unavailable",
      nextRetryAt: Date.now() + 5000,
    });
    const retried = listCloudSyncQueue().find((job) => job.idempotencyKey === "job-dup");
    expect(retried?.attempts).toBe(1);
    expect(retried?.lastError).toBe("network unavailable");

    ackCloudSyncJob("job-dup");
    expect(listCloudSyncQueue()).toHaveLength(1);
    expect(hasPendingCloudSync()).toBe(true);
  });

  it("reads corrupt queue payloads as an empty queue", () => {
    localStorage.setItem(QUEUE_KEY, "not-json");
    expect(listCloudSyncQueue()).toHaveLength(0);
    expect(hasPendingCloudSync()).toBe(false);

    localStorage.setItem(QUEUE_KEY, JSON.stringify({ not: "an-array" }));
    expect(listCloudSyncQueue()).toHaveLength(0);
  });
});
