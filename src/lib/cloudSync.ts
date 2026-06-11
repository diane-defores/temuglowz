import { computed, ref } from "vue";

import type {
  AccessDenialReason,
  EntitlementSnapshot,
} from "@/lib/accessModel";
import {
  canUseProtectedFeature,
  evaluateProtectedAccess,
} from "@/lib/accessModel";
import {
  advancePostAuthSyncStage,
  beginPostAuthSyncFeedback,
  showPostAuthReadyFeedback,
  resetPostAuthSyncFeedback,
} from "@/lib/postAuthSyncFeedback";
import type {
  CloudSyncQueuedOperation,
  SyncDomain,
  SyncDomainPayloadMap,
  SyncAccountMarker,
  SyncSourceDeviceId,
} from "@/types/sync";
import {
  enqueueCloudSyncJob,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import { computeSyncChecksum } from "@/lib/syncMerge";

const syncEnabled = ref(false);
const DEVICE_ID_KEY = "temu:cloud-sync-device-id";
const ACCOUNT_EMAIL_KEY = "temu:cloud-sync-account-email";
let activeAccountMarker: SyncAccountMarker | null = null;
let activeSourceDeviceId: SyncSourceDeviceId | null = null;

export const isSyncEnabled = computed(() => syncEnabled.value);

export type CloudSyncReplayDecision =
  | {
      granted: true;
      jobs: CloudSyncQueuedOperation[];
    }
  | {
      granted: false;
      reason:
        | AccessDenialReason
        | "missing_account_marker"
        | "account_mismatch";
      jobs: [];
    };

export interface CloudSyncAccessContext {
  globalUserId?: string | null;
  entitlement?: EntitlementSnapshot | null;
  accountMarker?: SyncAccountMarker | null;
  sourceDeviceId?: SyncSourceDeviceId | null;
}

export function setSyncEnabled(
  enabled: boolean,
  entitlement?: EntitlementSnapshot | null,
): void {
  syncEnabled.value = enabled && canUseProtectedFeature(entitlement);
  if (!syncEnabled.value) {
    activeAccountMarker = null;
    activeSourceDeviceId = null;
  }
}

export function setSyncEnabledForSession(
  enabled: boolean,
  context: CloudSyncAccessContext,
): CloudSyncReplayDecision {
  const decision = listReplayableCloudSyncJobs(context);
  syncEnabled.value = enabled && decision.granted;
  activeAccountMarker = syncEnabled.value ? context.accountMarker ?? null : null;
  activeSourceDeviceId = syncEnabled.value
    ? context.sourceDeviceId ?? getCloudSyncDeviceId()
    : null;
  return decision;
}

export function listReplayableCloudSyncJobs(
  context: CloudSyncAccessContext,
): CloudSyncReplayDecision {
  const access = evaluateProtectedAccess({
    globalUserId: context.globalUserId,
    entitlement: context.entitlement,
    feature: "cloud_sync",
  });

  if (!access.granted) {
    return {
      granted: false,
      reason: access.reason,
      jobs: [],
    };
  }

  if (!context.accountMarker) {
    return {
      granted: false,
      reason: "missing_account_marker",
      jobs: [],
    };
  }

  if (context.accountMarker.accountId !== context.globalUserId) {
    return {
      granted: false,
      reason: "account_mismatch",
      jobs: [],
    };
  }

  return {
    granted: true,
    jobs: listCloudSyncQueue().filter((job) => {
      return (
        job.accountMarker.accountId === context.accountMarker?.accountId
        && job.accountMarker.productId === context.accountMarker.productId
        && job.accountMarker.environment === context.accountMarker.environment
      );
    }),
  };
}

export function queueExportForSync(): void {
  return;
}

export function getStoredCloudAccountEmail(): string {
  return localStorage.getItem(ACCOUNT_EMAIL_KEY) ?? "";
}

export async function finalizePasswordSignIn(options?: {
  email?: string;
  flow?: "signIn" | "signUp";
}): Promise<void> {
  beginPostAuthSyncFeedback();

  if (options?.email) {
    localStorage.setItem(ACCOUNT_EMAIL_KEY, options.email);
  }

  try {
    await advancePostAuthSyncStage("dataReceived");
    await advancePostAuthSyncStage("dataApplied");
    showPostAuthReadyFeedback();
  } catch (error) {
    resetPostAuthSyncFeedback();
    throw error;
  }
}

export function isCloudSyncQueueingActive(): boolean {
  return syncEnabled.value && Boolean(activeAccountMarker && activeSourceDeviceId);
}

export function queueCloudSyncUpsert<TDomain extends SyncDomain>(
  domain: TDomain,
  recordKey: string,
  payload: SyncDomainPayloadMap[TDomain],
): boolean {
  if (!activeAccountMarker || !activeSourceDeviceId || !syncEnabled.value) {
    return false;
  }

  const payloadChecksum = computeSyncChecksum(payload);
  enqueueCloudSyncJob({
    idempotencyKey: buildIdempotencyKey(domain, recordKey, "upsert", payloadChecksum),
    domain,
    operationType: "upsert",
    recordKey,
    payload,
    payloadChecksum,
    accountMarker: activeAccountMarker,
    sourceDeviceId: activeSourceDeviceId,
  });
  return true;
}

export function queueCloudSyncDelete(
  domain: SyncDomain,
  recordKey: string,
): boolean {
  if (!activeAccountMarker || !activeSourceDeviceId || !syncEnabled.value) {
    return false;
  }

  enqueueCloudSyncJob({
    idempotencyKey: buildIdempotencyKey(domain, recordKey, "delete", "delete"),
    domain,
    operationType: "delete",
    recordKey,
    payloadChecksum: "delete",
    accountMarker: activeAccountMarker,
    sourceDeviceId: activeSourceDeviceId,
  });
  return true;
}

export function getCloudSyncDeviceId(): SyncSourceDeviceId {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const generated = `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

function buildIdempotencyKey(
  domain: SyncDomain,
  recordKey: string,
  operationType: "upsert" | "delete",
  checksum: string,
): string {
  return [
    domain,
    recordKey,
    operationType,
    checksum,
    Date.now().toString(36),
  ].join(":");
}

// Placeholder only: production sync must re-check suite-ledger access server-side.
export async function flushCloudSync(): Promise<void> {
  return;
}
