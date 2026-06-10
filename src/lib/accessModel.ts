export const TEMU_SHOPPING_LISTS_PRODUCT_ID = "temu_shopping_lists" as const;

export const PLAN_IDS = ["free_local", "sync", "pro", "lifetime_deal"] as const;

export const ENTITLEMENT_SOURCES = [
  "manual",
  "direct_ltd",
  "partner",
  "stripe",
  "paddle",
  "lemon_squeezy",
  "google_play",
  "app_store",
  "migration",
] as const;

export const ENTITLEMENT_STATUSES = [
  "active",
  "trialing",
  "inactive",
  "expired",
  "revoked",
  "refunded",
  "pending_review",
] as const;

export type TemuShoppingListsProductId = typeof TEMU_SHOPPING_LISTS_PRODUCT_ID;
export type PlanId = (typeof PLAN_IDS)[number];
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];

export interface EntitlementSnapshot {
  productId: TemuShoppingListsProductId;
  planId: PlanId;
  status: EntitlementStatus;
  source: EntitlementSource;
  checkedAt: number;
}

export const PROTECTED_FEATURES = ["cloud_sync", "premium", "webview_beta"] as const;

export type ProtectedFeature = (typeof PROTECTED_FEATURES)[number];

export type AccessDenialReason =
  | "missing_identity"
  | "missing_entitlement"
  | "wrong_product"
  | "inactive_entitlement";

export interface ProtectedAccessRequest {
  globalUserId?: string | null;
  entitlement?: EntitlementSnapshot | null;
  feature: ProtectedFeature;
}

export type ProtectedAccessDecision =
  | { granted: true; productId: TemuShoppingListsProductId }
  | { granted: false; reason: AccessDenialReason };

export function isTemuShoppingListsProductId(
  productId: string,
): productId is TemuShoppingListsProductId {
  return productId === TEMU_SHOPPING_LISTS_PRODUCT_ID;
}

export function isPlanId(planId: string): planId is PlanId {
  return PLAN_IDS.includes(planId as PlanId);
}

export function isEntitlementSource(
  source: string,
): source is EntitlementSource {
  return ENTITLEMENT_SOURCES.includes(source as EntitlementSource);
}

export function isEntitlementStatus(
  status: string,
): status is EntitlementStatus {
  return ENTITLEMENT_STATUSES.includes(status as EntitlementStatus);
}

export function grantsAccess(status: EntitlementStatus): boolean {
  return status === "active" || status === "trialing";
}

export function canUseProtectedFeature(
  entitlement: EntitlementSnapshot | null | undefined,
): boolean {
  if (!entitlement) {
    return false;
  }

  return (
    entitlement.productId === TEMU_SHOPPING_LISTS_PRODUCT_ID &&
    grantsAccess(entitlement.status)
  );
}

export function evaluateProtectedAccess(
  request: ProtectedAccessRequest,
): ProtectedAccessDecision {
  if (!request.globalUserId) {
    return { granted: false, reason: "missing_identity" };
  }

  if (!request.entitlement) {
    return { granted: false, reason: "missing_entitlement" };
  }

  if (request.entitlement.productId !== TEMU_SHOPPING_LISTS_PRODUCT_ID) {
    return { granted: false, reason: "wrong_product" };
  }

  if (!grantsAccess(request.entitlement.status)) {
    return { granted: false, reason: "inactive_entitlement" };
  }

  return { granted: true, productId: TEMU_SHOPPING_LISTS_PRODUCT_ID };
}

export function normalizeEntitlementSnapshot(
  input: unknown,
): EntitlementSnapshot | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const productId = typeof raw.productId === "string" ? raw.productId : "";
  const planId = typeof raw.planId === "string" ? raw.planId : "";
  const status = typeof raw.status === "string" ? raw.status : "";
  const source = typeof raw.source === "string" ? raw.source : "";
  const checkedAt = typeof raw.checkedAt === "number" ? raw.checkedAt : Date.now();

  if (
    !isTemuShoppingListsProductId(productId) ||
    !isPlanId(planId) ||
    !isEntitlementStatus(status) ||
    !isEntitlementSource(source)
  ) {
    return null;
  }

  return {
    productId,
    planId,
    status,
    source,
    checkedAt,
  };
}
