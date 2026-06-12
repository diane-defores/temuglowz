import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cloudSyncBackend", () => ({
  getCloudSyncStatus: vi.fn(async () => {
    throw new Error("bridge unavailable");
  }),
  listCloudSyncRecords: vi.fn(async () => ({
    productId: "temu_shopping_lists",
    environment: "local",
    ownerId: "global-user-1",
    records: [],
  })),
  pushCloudSyncOperation: vi.fn(async () => ({
    status: "inserted",
    serverUpdatedAt: 1,
  })),
}));

import type { EntitlementSnapshot } from "@/lib/accessModel";
import {
  isSyncEnabled,
  listReplayableCloudSyncJobs,
  finalizePasswordSignIn,
  setSyncEnabled,
  setSyncEnabledForSession,
} from "@/lib/cloudSync";
import * as cloudSyncBackend from "@/lib/cloudSyncBackend";
import * as cloudSyncQueue from "@/lib/cloudSyncQueue";
import {
  clearCloudSyncQueue,
  enqueueCloudSyncJob,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "@/lib/accessModel";
import { computeSyncChecksum } from "@/lib/syncMerge";
import {
  postAuthSyncFeedback,
  resetPostAuthSyncFeedback,
} from "@/lib/postAuthSyncFeedback";
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
    vi.useRealTimers();
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
    clearCloudSyncQueue();
    setSyncEnabled(false);
    resetPostAuthSyncFeedback();
  });

  afterEach(() => {
    resetPostAuthSyncFeedback();
    vi.restoreAllMocks();
    vi.useRealTimers();
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

  it("does not enable cloud sync from identity alone", () => {
    const decision = setSyncEnabledForSession(true, {
      globalUserId: ACCOUNT.accountId,
      accountMarker: ACCOUNT,
    });

    expect(decision).toEqual({
      granted: false,
      reason: "missing_entitlement",
      jobs: [],
    });
    expect(isSyncEnabled.value).toBe(false);
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

  it("blocks post-auth handoff when the entitlement bridge is unavailable", async () => {
    vi.useFakeTimers();
    const payload = makeListPayload();
    enqueueCloudSyncJob({
      idempotencyKey: "job-local-pending",
      domain: "shopping_list",
      operationType: "upsert",
      recordKey: payload.id,
      payload,
      payloadChecksum: computeSyncChecksum(payload),
      accountMarker: ACCOUNT,
      sourceDeviceId: "device-1",
    });

    const handoff = finalizePasswordSignIn({
      email: "diane@example.com",
      flow: "signIn",
    });
    await vi.advanceTimersByTimeAsync(1600);
    const result = await handoff;

    expect(result).toEqual({
      status: "blocked",
      reason: "entitlement_bridge_unavailable",
      jobs: [],
    });
    expect(isSyncEnabled.value).toBe(false);
    expect(postAuthSyncFeedback.stage).toBe("blocked");
    expect(postAuthSyncFeedback.detail).toContain("vérification premium");
    expect(listCloudSyncQueue()).toHaveLength(1);
  });

  it("blocks post-auth handoff when identity exists without entitlement", async () => {
    vi.useFakeTimers();
    const handoff = finalizePasswordSignIn({
      email: "diane@example.com",
      flow: "signIn",
      globalUserId: ACCOUNT.accountId,
      accountMarker: ACCOUNT,
    });
    await vi.advanceTimersByTimeAsync(1600);
    const result = await handoff;

    expect(result).toEqual({
      status: "blocked",
      reason: "missing_entitlement",
      jobs: [],
    });
    expect(isSyncEnabled.value).toBe(false);
    expect(postAuthSyncFeedback.stage).toBe("blocked");
    expect(postAuthSyncFeedback.detail).toContain("Aucun entitlement premium actif");
  });

  it("enables post-auth sync handoff only with matching identity and active entitlement", async () => {
    vi.useFakeTimers();
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

    const handoff = finalizePasswordSignIn({
      email: "diane@example.com",
      flow: "signIn",
      globalUserId: ACCOUNT.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT,
      sourceDeviceId: "device-1",
    });
    await vi.advanceTimersByTimeAsync(2300);
    const result = await handoff;

    expect(result.status).toBe("ready");
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]!.idempotencyKey).toBe("job-active-account");
    expect(isSyncEnabled.value).toBe(true);
    expect(postAuthSyncFeedback.stage).toBe("ready");
  });

  it("does not ack stale push responses during sync handoff", async () => {
    vi.useFakeTimers();
    const payload = makeListPayload();
    const queueSpy = vi.spyOn(cloudSyncQueue, "ackCloudSyncJob");
    const pushSpy = vi.mocked(cloudSyncBackend.pushCloudSyncOperation);
    pushSpy.mockResolvedValue({ status: "stale", serverUpdatedAt: 1 });

    enqueueCloudSyncJob({
      idempotencyKey: "job-stale",
      domain: "shopping_list",
      operationType: "upsert",
      recordKey: payload.id,
      payload,
      payloadChecksum: computeSyncChecksum(payload),
      accountMarker: ACCOUNT,
      sourceDeviceId: "device-1",
    });

    const handoff = finalizePasswordSignIn({
      email: "diane@example.com",
      flow: "signIn",
      globalUserId: ACCOUNT.accountId,
      entitlement: ACTIVE_ENTITLEMENT,
      accountMarker: ACCOUNT,
      sourceDeviceId: "device-1",
    });
    await vi.advanceTimersByTimeAsync(2300);
    const result = await handoff;

    expect(result).toEqual({
      status: "ready",
      jobs: expect.arrayContaining([
        expect.objectContaining({
          idempotencyKey: "job-stale",
        }),
      ]),
    });
    expect(queueSpy).not.toHaveBeenCalled();
    expect(listCloudSyncQueue()).toHaveLength(1);
    expect(listCloudSyncQueue()[0]?.idempotencyKey).toBe("job-stale");
    expect(postAuthSyncFeedback.stage).toBe("ready");
  });
});
