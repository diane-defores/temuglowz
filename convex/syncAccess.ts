import { ConvexError } from "convex/values";

import { TEMU_SHOPPING_LISTS_PRODUCT_ID } from "./syncConstants";

interface AuthContext {
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      tokenIdentifier: string;
    } | null>;
  };
}

export interface CloudSyncAccess {
  ownerId: string;
  productId: typeof TEMU_SHOPPING_LISTS_PRODUCT_ID;
}

export async function requireCloudSyncAccess(
  ctx: AuthContext,
): Promise<CloudSyncAccess> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "missing_identity",
      message: "Sign in is required before cloud sync can be checked.",
    });
  }

  // Fail closed until the suite-owned entitlement bridge is implemented.
  // Authentication identifies the user, but it is not product access.
  throw new ConvexError({
    code: "entitlement_bridge_unavailable",
    message: "Cloud sync access cannot be verified yet.",
  });
}
