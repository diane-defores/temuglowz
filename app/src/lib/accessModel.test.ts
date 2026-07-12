import { describe, expect, it } from "vitest";

import {
  TEMU_SHOPPING_LISTS_PRODUCT_ID,
  canUseProtectedFeature,
  evaluateProtectedAccess,
  grantsAccess,
  isEntitlementSource,
  isPlanId,
  isTemuShoppingListsProductId,
  normalizeEntitlementSnapshot,
} from "@/lib/accessModel";

describe("access model", () => {
  it("accepts only the Temu Shopping Lists product id", () => {
    expect(isTemuShoppingListsProductId(TEMU_SHOPPING_LISTS_PRODUCT_ID)).toBe(
      true,
    );
    expect(isTemuShoppingListsProductId("temu")).toBe(false);
    expect(isTemuShoppingListsProductId("winflowz_app")).toBe(false);
  });

  it("allowlists plans and sources", () => {
    expect(isPlanId("free_local")).toBe(true);
    expect(isPlanId("sync")).toBe(true);
    expect(isPlanId("enterprise")).toBe(false);

    expect(isEntitlementSource("manual")).toBe(true);
    expect(isEntitlementSource("lemon_squeezy")).toBe(true);
    expect(isEntitlementSource("random_provider")).toBe(false);
  });

  it("maps statuses to access decisions", () => {
    expect(grantsAccess("active")).toBe(true);
    expect(grantsAccess("trialing")).toBe(true);
    expect(grantsAccess("inactive")).toBe(false);
    expect(grantsAccess("expired")).toBe(false);
    expect(grantsAccess("revoked")).toBe(false);
    expect(grantsAccess("refunded")).toBe(false);
    expect(grantsAccess("pending_review")).toBe(false);
  });

  it("denies protected features without a valid active entitlement", () => {
    expect(canUseProtectedFeature(null)).toBe(false);
    expect(
      canUseProtectedFeature({
        productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
        planId: "sync",
        status: "active",
        source: "manual",
        checkedAt: 1,
      }),
    ).toBe(true);
    expect(
      canUseProtectedFeature({
        productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
        planId: "sync",
        status: "revoked",
        source: "manual",
        checkedAt: 1,
      }),
    ).toBe(false);
  });

  it("normalizes only allowlisted suite-ledger snapshots", () => {
    expect(
      normalizeEntitlementSnapshot({
        productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
        planId: "pro",
        status: "active",
        source: "manual",
        checkedAt: 42,
      }),
    ).toEqual({
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      planId: "pro",
      status: "active",
      source: "manual",
      checkedAt: 42,
    });

    expect(
      normalizeEntitlementSnapshot({
        productId: "temu",
        planId: "pro",
        status: "active",
        source: "manual",
      }),
    ).toBeNull();
    expect(
      normalizeEntitlementSnapshot({
        productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
        planId: "pro",
        status: "active",
        source: "unknown",
      }),
    ).toBeNull();
  });

  it("evaluates protected access with fail-closed reasons", () => {
    const entitlement = {
      productId: TEMU_SHOPPING_LISTS_PRODUCT_ID,
      planId: "pro",
      status: "active",
      source: "manual",
      checkedAt: 1,
    } as const;

    expect(
      evaluateProtectedAccess({
        globalUserId: null,
        entitlement,
        feature: "cloud_sync",
      }),
    ).toEqual({ granted: false, reason: "missing_identity" });
    expect(
      evaluateProtectedAccess({
        globalUserId: "global-user-1",
        entitlement: null,
        feature: "cloud_sync",
      }),
    ).toEqual({ granted: false, reason: "missing_entitlement" });
    expect(
      evaluateProtectedAccess({
        globalUserId: "global-user-1",
        entitlement: { ...entitlement, status: "expired" },
        feature: "cloud_sync",
      }),
    ).toEqual({ granted: false, reason: "inactive_entitlement" });
    expect(
      evaluateProtectedAccess({
        globalUserId: "global-user-1",
        entitlement,
        feature: "cloud_sync",
      }),
    ).toEqual({ granted: true, productId: TEMU_SHOPPING_LISTS_PRODUCT_ID });
  });
});
