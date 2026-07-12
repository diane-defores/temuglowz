import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => {
  return {
    action: vi.fn(),
    tokenCallback: null as
      | null
      | ((args: { forceRefreshToken: boolean }) => Promise<string | null>),
    onAuthStateChange: null as null | ((authenticated: boolean) => void),
  };
});

vi.mock("convex/browser", () => {
  class MockConvexHttpClient {
    action = mockState.action;
  }

  return {
    ConvexClient: class MockConvexClient {},
    ConvexHttpClient: MockConvexHttpClient,
  };
});

const invoke = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke }));

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const CONVEX_URL = "https://demo.convex.cloud";
const NAMESPACE = CONVEX_URL.replace(/[^a-zA-Z0-9]/g, "");
const JWT_STORAGE_KEY = `__convexAuthJWT_${NAMESPACE}`;
const REFRESH_STORAGE_KEY = `__convexAuthRefreshToken_${NAMESPACE}`;
const LEGACY_JWT_KEY = "sf_jwt";
const LEGACY_REFRESH_KEY = "sf_refresh";
const LEGACY_GLOBAL_JWT_KEY = "__convexAuthJWT";
const LEGACY_GLOBAL_REFRESH_KEY = "__convexAuthRefreshToken";

async function loadAuthModule(): Promise<typeof import("@/lib/convexAuth")> {
  vi.resetModules();
  return import("@/lib/convexAuth");
}

function createMockClient() {
  return {
    setAuth: (
      tokenCallback: (args: { forceRefreshToken: boolean }) => Promise<string | null>,
      onAuthStateChange: (authenticated: boolean) => void,
    ) => {
      mockState.tokenCallback = tokenCallback;
      mockState.onAuthStateChange = onAuthStateChange;
    },
  };
}

function setWebRuntime(): MemoryStorage {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
    writable: true,
  });
  return storage;
}

function setTauriRuntime(): MemoryStorage {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: { __TAURI__: true, __TAURI_INTERNALS__: true, localStorage: storage },
    configurable: true,
    writable: true,
  });
  return storage;
}

function setTauriTokenStoreState(
  initial: Record<string, string>,
): Record<string, string> {
  const values = { ...initial };
  invoke.mockImplementation(async (command: string, args: { key?: string; value?: string }) => {
    const key = args?.key ?? "";
    if (command === "auth_token_store_get") {
      return values[key] ?? null;
    }

    if (command === "auth_token_store_set" && key) {
      values[key] = args.value ?? "";
      return;
    }

    if (command === "auth_token_store_remove" && key) {
      delete values[key];
      return;
    }

    return null;
  });

  return values;
}

beforeEach(async () => {
  const helper = await import("@/lib/authTokenStore");
  helper.__resetAuthTokenStoreForTests();
  mockState.action.mockReset();
  mockState.tokenCallback = null;
  mockState.onAuthStateChange = null;
  invoke.mockReset();
  setWebRuntime();
});

describe("convexAuth client boundaries", () => {
  it("stores tokens in local fallback storage on web", async () => {
    const storage = setWebRuntime();
    mockState.action.mockResolvedValue({
      tokens: {
        token: "jwt-web",
        refreshToken: "refresh-web",
      },
    });

    const { setupConvexAuth, signIn, isAuthenticated, isAuthLoading } = await loadAuthModule();
    await setupConvexAuth(createMockClient() as never, CONVEX_URL);
    await signIn("password", { email: "user@test.com", password: "secret" });

    expect(storage.getItem(JWT_STORAGE_KEY)).toBe("jwt-web");
    expect(storage.getItem(REFRESH_STORAGE_KEY)).toBe("refresh-web");
    expect(isAuthenticated.value).toBe(true);
    expect(isAuthLoading.value).toBe(false);
  });

  it("stores tokens in native keyring path during Tauri runtime", async () => {
    setTauriRuntime();
    const values = setTauriTokenStoreState({});

    mockState.action.mockResolvedValue({
      tokens: {
        token: "jwt-native",
        refreshToken: "refresh-native",
      },
    });

    const { setupConvexAuth, signIn, isAuthenticated } = await loadAuthModule();
    await setupConvexAuth(createMockClient() as never, CONVEX_URL);
    await signIn("password", { email: "user@test.com", password: "secret" });

    expect(values[JWT_STORAGE_KEY]).toBe("jwt-native");
    expect(values[REFRESH_STORAGE_KEY]).toBe("refresh-native");
    expect(isAuthenticated.value).toBe(true);
    expect(invoke).toHaveBeenCalledWith("auth_token_store_set", {
      key: JWT_STORAGE_KEY,
      value: "jwt-native",
    });
    expect(invoke).toHaveBeenCalledWith("auth_token_store_set", {
      key: REFRESH_STORAGE_KEY,
      value: "refresh-native",
    });
  });

  it("clears native tokens on sign out even if server sign-out fails", async () => {
    setTauriRuntime();
    const values = setTauriTokenStoreState({
      [JWT_STORAGE_KEY]: "jwt-native-4",
      [REFRESH_STORAGE_KEY]: "refresh-native-4",
    });
    mockState.action.mockRejectedValue(new Error("sign out failed"));

    const { setupConvexAuth, signOut, isAuthenticated } = await loadAuthModule();
    await setupConvexAuth(createMockClient() as never, CONVEX_URL);
    await signOut();

    expect(values[JWT_STORAGE_KEY]).toBeUndefined();
    expect(values[REFRESH_STORAGE_KEY]).toBeUndefined();
    expect(isAuthenticated.value).toBe(false);
  });

  it("restores a session only when both namespaced JWT and refresh token exist", async () => {
    const storage = setWebRuntime();
    storage.setItem(JWT_STORAGE_KEY, "jwt-1");
    storage.setItem(REFRESH_STORAGE_KEY, "refresh-1");
    const { setupConvexAuth, isAuthenticated, isAuthLoading } = await loadAuthModule();

    await setupConvexAuth(createMockClient() as never, CONVEX_URL);

    expect(isAuthenticated.value).toBe(true);
    expect(isAuthLoading.value).toBe(false);
    expect(mockState.action).not.toHaveBeenCalled();
  });

  it("does not restore a token-only session and clears stale JWT storage", async () => {
    const storage = setWebRuntime();
    storage.setItem(JWT_STORAGE_KEY, "jwt-without-refresh");
    const { setupConvexAuth, isAuthenticated, isAuthLoading } = await loadAuthModule();

    await setupConvexAuth(createMockClient() as never, CONVEX_URL);

    expect(isAuthenticated.value).toBe(false);
    expect(isAuthLoading.value).toBe(false);
    expect(storage.getItem(JWT_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(REFRESH_STORAGE_KEY)).toBeNull();
  });

  it("purges legacy global/localStorage auth keys during setup", async () => {
    const storage = setWebRuntime();
    storage.setItem(LEGACY_JWT_KEY, "legacy-jwt");
    storage.setItem(LEGACY_REFRESH_KEY, "legacy-refresh");
    storage.setItem(LEGACY_GLOBAL_JWT_KEY, "legacy-global-jwt");
    storage.setItem(LEGACY_GLOBAL_REFRESH_KEY, "legacy-global-refresh");

    const { setupConvexAuth } = await loadAuthModule();
    await setupConvexAuth(createMockClient() as never, CONVEX_URL);

    expect(storage.getItem(LEGACY_JWT_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_REFRESH_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_GLOBAL_JWT_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_GLOBAL_REFRESH_KEY)).toBeNull();
  });

  it("clears tokens when refresh is requested without a refresh token", async () => {
    const storage = setWebRuntime();
    storage.setItem(JWT_STORAGE_KEY, "jwt-3");
    const { setupConvexAuth, isAuthenticated } = await loadAuthModule();
    await setupConvexAuth(createMockClient() as never, CONVEX_URL);

    storage.removeItem(REFRESH_STORAGE_KEY);
    const refreshed = await mockState.tokenCallback?.({ forceRefreshToken: true });

    expect(refreshed).toBeNull();
    expect(isAuthenticated.value).toBe(false);
    expect(storage.getItem(JWT_STORAGE_KEY)).toBeNull();
  });
});
