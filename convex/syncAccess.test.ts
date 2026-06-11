import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";

import { requireCloudSyncAccess } from "./syncAccess";

describe("requireCloudSyncAccess", () => {
  const originalFetch = globalThis.fetch;
  const originalBridgeUrl = process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_URL;
  const originalLegacyBridgeUrl = process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_URL;
  const originalBridgeSecret = process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_SECRET;
  const originalLegacyBridgeSecret = process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_SECRET;

  const identity = {
    subject: "user-1",
    tokenIdentifier: "issuer|user-1",
    email: "user@example.com",
  };

  beforeEach(() => {
    delete process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_URL;
    delete process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_URL;
    delete process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_SECRET;
    delete process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_SECRET;
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_URL = originalBridgeUrl;
    process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_URL = originalLegacyBridgeUrl;
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_SECRET = originalBridgeSecret;
    process.env.SUITE_TEMU_SHOPPING_LISTS_BRIDGE_SECRET = originalLegacyBridgeSecret;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("denies missing identity", async () => {
    await expect(
      requireCloudSyncAccess({
        auth: {
          getUserIdentity: async () => null,
        },
      }),
    ).rejects.toMatchObject({
      data: {
        code: "missing_identity",
      },
    });
  });

  it("fails closed when identity exists but suite entitlement bridge is unavailable", async () => {
    await expect(
      requireCloudSyncAccess({
        auth: {
          getUserIdentity: async () => identity,
        },
      }),
    ).rejects.toMatchObject({
      data: {
        code: "entitlement_bridge_unavailable",
      },
    });
  });

  it("throws ConvexError instances for backend callers", async () => {
    await expect(
      requireCloudSyncAccess({
        auth: {
          getUserIdentity: async () => null,
        },
      }),
    ).rejects.toBeInstanceOf(ConvexError);
  });

  it("denies identity when bridge returns no active entitlement", async () => {
    await expect(
      requireCloudSyncAccess(
        {
          auth: {
            getUserIdentity: async () => identity,
          },
        },
        {
          bridge: {
            checkCloudSyncEntitlement: async () => ({
              status: "denied",
              reason: "missing_entitlement",
            }),
          },
        },
      ),
    ).rejects.toMatchObject({
      data: {
        code: "missing_entitlement",
      },
    });
  });

  it("maps authenticated identity to server-owned access only after active bridge confirmation", async () => {
    await expect(
      requireCloudSyncAccess(
        {
          auth: {
            getUserIdentity: async () => identity,
          },
        },
        {
          bridge: {
            checkCloudSyncEntitlement: async (request) => ({
              status: "granted",
              suiteUserId: `suite:${request.subject}`,
            }),
          },
        },
      ),
    ).resolves.toEqual({
      ownerId: "suite:user-1",
      productId: "temu_shopping_lists",
    });
  });

  it("uses configured Temu suite bridge and maps active snapshots", async () => {
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_URL = "https://suite.example.com";
    process.env.TEMU_SHOPPING_LISTS_SUITE_BRIDGE_SECRET = "bridge-secret";
    const fetchMock = vi.fn(async () => (
      new Response(JSON.stringify({
        status: "ok",
        snapshot: {
          hasAccess: true,
          globalUserId: "global-user-1",
          reasonCode: "active_entitlement",
        },
      }), { status: 200 })
    ));
    globalThis.fetch = fetchMock;

    await expect(
      requireCloudSyncAccess({
        auth: {
          getUserIdentity: async () => identity,
        },
      }),
    ).resolves.toEqual({
      ownerId: "global-user-1",
      productId: "temu_shopping_lists",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://suite.example.com/api/bridge/temu-shopping-lists",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-temu-shopping-lists-suite-secret": "bridge-secret",
        },
        body: JSON.stringify({
          operation: "snapshot",
          providerAccountId: "issuer|user-1",
          email: "user@example.com",
          sourceRef: "user-1",
        }),
      }),
    );
  });
});
