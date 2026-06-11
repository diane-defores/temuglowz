import { ConvexError } from "convex/values";

import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "./syncConstants";

interface AuthContext {
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      tokenIdentifier: string;
      issuer?: string;
      email?: string;
    } | null>;
  };
}

export interface CloudSyncAccess {
  ownerId: string;
  productId: typeof TEMU_SHOPPING_LISTS_PRODUCT_ID;
}

type SuiteEntitlementDenialReason =
  | "missing_entitlement"
  | "inactive_entitlement"
  | "wrong_product"
  | "entitlement_bridge_unavailable";

interface SuiteEntitlementRequest {
  subject: string;
  tokenIdentifier: string;
  issuer?: string;
  email?: string;
  productId: typeof TEMU_SHOPPING_LISTS_PRODUCT_ID;
  feature: "cloud_sync";
}

export type SuiteEntitlementBridgeResult =
  | {
      status: "granted";
      suiteUserId: string;
    }
  | {
      status: "denied";
      reason: SuiteEntitlementDenialReason;
    };

export interface SuiteEntitlementBridge {
  checkCloudSyncEntitlement(
    request: SuiteEntitlementRequest,
  ): Promise<SuiteEntitlementBridgeResult>;
}

interface CloudSyncAccessOptions {
  bridge?: SuiteEntitlementBridge;
}

declare const process: {
  env: Record<string, string | undefined>;
};

type SuiteBridgeSnapshot = {
  hasAccess?: unknown;
  globalUserId?: unknown;
  reasonCode?: unknown;
};

type SuiteBridgeResponse = {
  status?: unknown;
  snapshot?: unknown;
  error?: unknown;
};

const unavailableBridge: SuiteEntitlementBridge = {
  checkCloudSyncEntitlement: checkSuiteBridgeEntitlement,
};

export async function requireCloudSyncAccess(
  ctx: AuthContext,
  options: CloudSyncAccessOptions = {},
): Promise<CloudSyncAccess> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "missing_identity",
      message: "Sign in is required before cloud sync can be checked.",
    });
  }

  const bridge = options.bridge ?? unavailableBridge;
  const entitlement = await bridge.checkCloudSyncEntitlement({
    subject: identity.subject,
    tokenIdentifier: identity.tokenIdentifier,
    issuer: identity.issuer,
    email: identity.email,
    productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
    feature: "cloud_sync",
  });

  if (entitlement.status === "denied") {
    throw new ConvexError({
      code: entitlement.reason,
      message: describeAccessDenial(entitlement.reason),
    });
  }

  return {
    ownerId: entitlement.suiteUserId,
    productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
  };
}

function describeAccessDenial(reason: SuiteEntitlementDenialReason): string {
  switch (reason) {
    case "missing_entitlement":
      return "Premium cloud sync is not active for this account.";
    case "inactive_entitlement":
      return "Premium cloud sync entitlement is inactive for this account.";
    case "wrong_product":
      return "The entitlement does not grant access to Temu Shopping Lists.";
    case "entitlement_bridge_unavailable":
      return "Cloud sync access cannot be verified yet.";
  }
}

async function checkSuiteBridgeEntitlement(
  request: SuiteEntitlementRequest,
): Promise<SuiteEntitlementBridgeResult> {
  const bridgeUrl = getSuiteBridgeUrl();
  const bridgeSecret = getSuiteBridgeSecret();
  if (!bridgeUrl || !bridgeSecret) {
    return {
      status: "denied",
      reason: "entitlement_bridge_unavailable",
    };
  }

  let response: Response;
  try {
    response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-temu-shopping-lists-suite-secret": bridgeSecret,
      },
      body: JSON.stringify({
        operation: "snapshot",
        providerAccountId: request.tokenIdentifier,
        email: request.email,
        sourceRef: request.subject,
      }),
    });
  } catch {
    return {
      status: "denied",
      reason: "entitlement_bridge_unavailable",
    };
  }

  let payload: SuiteBridgeResponse | null = null;
  try {
    payload = (await response.json()) as SuiteBridgeResponse;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.status !== "ok") {
    return {
      status: "denied",
      reason: "entitlement_bridge_unavailable",
    };
  }

  const snapshot = parseSuiteBridgeSnapshot(payload.snapshot);
  if (!snapshot) {
    return {
      status: "denied",
      reason: "entitlement_bridge_unavailable",
    };
  }

  if (!snapshot.hasAccess) {
    return {
      status: "denied",
      reason: snapshot.reasonCode === "active_entitlement"
        ? "inactive_entitlement"
        : "missing_entitlement",
    };
  }

  return {
    status: "granted",
    suiteUserId: snapshot.globalUserId,
  };
}

function getSuiteBridgeUrl(): string | null {
  const raw =
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_URL
    ?? process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_URL;
  const normalized = raw?.trim().replace(/\/+$/, "");
  if (!normalized) {
    return null;
  }
  if (normalized.endsWith("/api/bridge/temu-shopping-lists")) {
    return normalized;
  }
  return `${normalized}/api/bridge/temu-shopping-lists`;
}

function getSuiteBridgeSecret(): string | null {
  const raw =
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_SECRET
    ?? process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_SECRET;
  const normalized = raw?.trim();
  return normalized ? normalized : null;
}

function parseSuiteBridgeSnapshot(value: unknown): {
  hasAccess: boolean;
  globalUserId: string;
  reasonCode: string;
} | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const snapshot = value as SuiteBridgeSnapshot;
  if (typeof snapshot.hasAccess !== "boolean") {
    return null;
  }
  if (typeof snapshot.globalUserId !== "string" || !snapshot.globalUserId.trim()) {
    return null;
  }
  if (typeof snapshot.reasonCode !== "string" || !snapshot.reasonCode.trim()) {
    return null;
  }

  return {
    hasAccess: snapshot.hasAccess,
    globalUserId: snapshot.globalUserId.trim(),
    reasonCode: snapshot.reasonCode.trim(),
  };
}
