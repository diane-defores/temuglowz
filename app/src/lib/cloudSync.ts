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
  showPostAuthBlockedFeedback,
  showPostAuthErrorFeedback,
  showPostAuthReadyFeedback,
} from "@/lib/postAuthSyncFeedback";
import type {
  CloudSyncQueuedOperation,
  SyncDomain,
  SyncDomainPayloadMap,
  SyncAccountMarker,
  SyncSourceDeviceId,
} from "@/types/sync";
import {
  ackCloudSyncJob,
  enqueueCloudSyncJob,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import {
  getCloudSyncStatus,
  listCloudSyncRecords,
  pushCloudSyncOperation,
} from "@/lib/cloudSyncBackend";
import { applyCloudSyncRecords } from "@/lib/cloudSyncHydration";
import { computeSyncChecksum } from "@/lib/syncMerge";
import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "@/lib/accessModel";

const syncEnabled = ref(false);
const DEVICE_ID_KEY = "temu:cloud-sync-device-id";
const ACCOUNT_EMAIL_KEY = "temu:cloud-sync-account-email";
const MAX_HYDRATION_PAGES = 50;
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

export type PostAuthSyncHandoffBlockedReason =
  | Extract<CloudSyncReplayDecision, { granted: false }>["reason"]
  | "entitlement_bridge_unavailable";

export type PostAuthSyncHandoffResult =
  | {
      status: "ready";
      jobs: CloudSyncQueuedOperation[];
    }
  | {
      status: "blocked";
      reason: PostAuthSyncHandoffBlockedReason;
      jobs: [];
    }
  | {
      status: "error";
      reason: "handoff_failed";
      jobs: [];
    };

export interface PostAuthSyncHandoffOptions extends CloudSyncAccessContext {
  email?: string;
  flow?: "signIn" | "signUp";
  environment?: SyncAccountMarker["environment"];
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
} & CloudSyncAccessContext): Promise<PostAuthSyncHandoffResult> {
  beginPostAuthSyncFeedback();

  if (options?.email) {
    localStorage.setItem(ACCOUNT_EMAIL_KEY, options.email);
  }

  try {
    await advancePostAuthSyncStage("dataReceived");
    await advancePostAuthSyncStage("pending");

    const handoff = await startEntitlementAwareSyncHandoff(options);
    if (handoff.status === "blocked") {
      showPostAuthBlockedFeedback(describePostAuthBlockedReason(handoff.reason));
      return handoff;
    }

    await advancePostAuthSyncStage("dataApplied");
    showPostAuthReadyFeedback();
    return handoff;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    showPostAuthErrorFeedback(message);
    return {
      status: "error",
      reason: "handoff_failed",
      jobs: [],
    };
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

async function startEntitlementAwareSyncHandoff(
  options: PostAuthSyncHandoffOptions | undefined,
): Promise<PostAuthSyncHandoffResult> {
  if (!options?.globalUserId && !options?.entitlement && !options?.accountMarker) {
    return startBackendVerifiedSyncHandoff(options);
  }

  const decision = setSyncEnabledForSession(true, {
    globalUserId: options.globalUserId,
    entitlement: options.entitlement,
    accountMarker: options.accountMarker,
    sourceDeviceId: options.sourceDeviceId,
  });

  if (!decision.granted) {
    return {
      status: "blocked",
      reason: decision.reason,
      jobs: [],
    };
  }

  return {
    status: "ready",
    jobs: decision.jobs,
  };
}

async function startBackendVerifiedSyncHandoff(
  options: PostAuthSyncHandoffOptions | undefined,
): Promise<PostAuthSyncHandoffResult> {
  const environment = options?.environment ?? "local";
  try {
    const status = await getCloudSyncStatus(environment);
    const accountMarker: SyncAccountMarker = {
      accountId: status.ownerId,
      productId: status.productId,
      environment: status.environment,
    };
    const entitlement: EntitlementSnapshot = {
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      planId: "sync",
      status: "active",
      source: "manual",
      checkedAt: Date.now(),
    };

    let cursor: string | null = null;
    let isDone = false;
    let pageCount = 0;

    while (!isDone) {
      if (pageCount >= MAX_HYDRATION_PAGES) {
        throw new Error("cloud_sync_hydration_page_limit_exceeded");
      }

      const hydration = await listCloudSyncRecords({ environment, cursor });
      if (
        hydration.ownerId !== status.ownerId
        || hydration.productId !== status.productId
        || hydration.environment !== status.environment
      ) {
        setSyncEnabled(false);
        return {
          status: "blocked",
          reason: "account_mismatch",
          jobs: [],
        };
      }
      if (hydration.pageStatus === "SplitRequired") {
        throw new Error("cloud_sync_hydration_split_required");
      }
      if (!hydration.isDone && hydration.continueCursor === cursor) {
        throw new Error("cloud_sync_hydration_cursor_stalled");
      }

      applyCloudSyncRecords(hydration.records);
      cursor = hydration.continueCursor;
      isDone = hydration.isDone;
      pageCount += 1;
    }
    const decision = setSyncEnabledForSession(true, {
      globalUserId: status.ownerId,
      entitlement,
      accountMarker,
      sourceDeviceId: getCloudSyncDeviceId(),
    });

    if (!decision.granted) {
      return {
        status: "blocked",
        reason: decision.reason,
        jobs: [],
      };
    }

    for (const job of decision.jobs) {
      const result = await pushCloudSyncOperation({
        environment,
        operation: job,
      });
      if (
        result.status === "inserted"
        || result.status === "updated"
        || result.status === "duplicate"
      ) {
        ackCloudSyncJob(job.idempotencyKey);
      }
    }

    return {
      status: "ready",
      jobs: decision.jobs,
    };
  } catch {
    setSyncEnabled(false);
    return {
      status: "blocked",
      reason: "entitlement_bridge_unavailable",
      jobs: [],
    };
  }
}

function describePostAuthBlockedReason(
  reason: PostAuthSyncHandoffBlockedReason,
): string {
  switch (reason) {
    case "entitlement_bridge_unavailable":
      return "Le compte est connecté, mais la vérification premium côté backend n'est pas encore disponible. Les données restent locales.";
    case "missing_identity":
      return "Le compte n'a pas renvoyé d'identité serveur vérifiable. Les données restent locales.";
    case "missing_entitlement":
      return "Aucun entitlement premium actif n'a été confirmé pour ce compte. Les données restent locales.";
    case "wrong_product":
      return "L'entitlement reçu ne correspond pas à Temu Shopping Lists. Les données restent locales.";
    case "inactive_entitlement":
      return "L'entitlement premium n'est pas actif. Les données restent locales.";
    case "missing_account_marker":
      return "Le compte cloud n'a pas encore de marqueur serveur exploitable. Les données restent locales.";
    case "account_mismatch":
      return "Les données locales en attente appartiennent à un autre compte. La synchronisation est bloquée.";
    default: {
      const exhaustive: never = reason;
      return exhaustive;
    }
  }
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
