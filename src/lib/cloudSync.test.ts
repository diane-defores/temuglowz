import { beforeEach, describe, expect, it } from "vitest";

import type { EntitlementSnapshot } from "@/lib/accessModel";
import {
  listReplayableCloudSyncJobs,
  setSyncEnabledForSession,
} from "@/lib/cloudSync";
import {
  clearCloudSyncQueue,
  enqueueCloudSyncJob,
} from "@/lib/cloudSyncQueue";
import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "@/lib/accessModel";
import { computeSyncChecksum } from "@/lib/syncMerge";
import type { ShoppingList } from "@/types/domain";
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

const ACCOUNT: SyncAccountMarker = {
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

const EXPIRED_ENTITLEMENT: EntitlementSnapshot = {
  ...ACTIVE_ENTITLEMENT,
  status: "expired",
};

function makeListPayload(): ShoppingList {
  return {
    id: "list-1",
    name: "Cuisine",
    itemIds: [],
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("cloud sync access-aware replay", () => {
  beforeEach(() => {
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
    clearCloudSyncQueue();
  });

  it("blocks replay without identity or entitlement", () => {
    expect(
      listReplayableCloudSyncJobs({
        entitlement: ACTIVE_ENTITLEMENT,
        accountMarker: ACCOUNT,
      }),
    ).toEqual({
      granted: false,
      reason: "missing_identity",
      jobs: [],
    });

    expect(
      listReplayableCloudSyncJobs({
        globalUserId: ACCOUNT.accountId,
        accountMarker: ACCOUNT,
      }),
    ).toEqual({
      granted: false,
      reason: "missing_entitlement",
      jobs: [],
    });
  });

  it("filters queued jobs to the active account marker before replay", () => {
    const payload = makeListPayload();
    enqueueCloudSyncJob({
      idempotencyKey: "job-active-account",
      domain: "shopping_list",
      operationType: "upsert",
      recordKey: payload.id,
      payload,
      payloadChecksum: computeSyncChecksum(payload),
      accountMarker: ACCOUNT,
      sourceDeviceId: "device-1",
    });
    enqueueCloudSyncJob({
      idempotencyKey: "job-other-account",
      domain: "shopping_list",
      operationType: "delete",
      recordKey: "list-2",
      payloadChecksum: "delete",
      accountMarker: {
        ...ACCOUNT,
        accountId: "global-user-2",
      },
      sourceDeviceId: "device-2",
    });

    const decision = setSyncEnabledForSession(true, {
      globalUserId: ACCOUNT.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT,
    });

    expect(decision.granted).toBe(true);
    expect(decision.jobs).toHaveLength(1);
    expect(decision.jobs[0]!.idempotencyKey).toBe("job-active-account");
  });

  it("blocks replay when local account metadata points to another account", () => {
    const decision = listReplayableCloudSyncJobs({
      globalUserId: ACCOUNT.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: {
        ...ACCOUNT,
        accountId: "other-account",
      },
    });

    expect(decision).toEqual({
      granted: false,
      reason: "account_mismatch",
      jobs: [],
    });
  });

  it("blocks replay when entitlement no longer grants access", () => {
    const decision = listReplayableCloudSyncJobs({
      globalUserId: ACCOUNT.accountId,
      entitlement: EXPIRED_ENTITLEMENT,
      accountMarker: ACCOUNT,
    });

    expect(decision).toEqual({
      granted: false,
      reason: "inactive_entitlement",
      jobs: [],
    });
  });
});
