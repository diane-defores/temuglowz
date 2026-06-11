import { ConvexError } from "convex/values";

import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "./syncConstants";

interface AuthContext {
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      tokenIdentifier: string;
      issuer?: string;
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

const unavailableBridge: SuiteEntitlementBridge = {
  async checkCloudSyncEntitlement() {
    return {
      status: "denied" as const,
      reason: "entitlement_bridge_unavailable" as const,
    };
  },
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
