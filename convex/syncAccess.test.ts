import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";

import { requireCloudSyncAccess } from "./syncAccess";

describe("requireCloudSyncAccess", () => {
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
          getUserIdentity: async () => ({
            subject: "user-1",
            tokenIdentifier: "issuer|user-1",
          }),
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
});
