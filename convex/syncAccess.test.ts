import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";

import { requireCloudSyncAccess } from "./syncAccess";

describe("requireCloudSyncAccess", () => {
  const identity = {
    subject: "user-1",
    tokenIdentifier: "issuer|user-1",
  };

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
});
