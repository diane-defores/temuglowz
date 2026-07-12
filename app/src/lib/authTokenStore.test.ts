import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetAuthTokenStoreForTests,
  getAuthTokenStore,
} from "@/lib/authTokenStore";

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

function withWebRuntime(storage = new MemoryStorage()): void {
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
}

function withTauriRuntime(storage: MemoryStorage = new MemoryStorage()): {
  storage: MemoryStorage;
  nativeStore: Record<string, string>;
} {
  const nativeStore: Record<string, string> = {};
  Object.defineProperty(globalThis, "window", {
    value: {
      __TAURI__: true,
      __TAURI_INTERNALS__: true,
      localStorage: storage,
    },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  invoke.mockImplementation(async (command: string, args: { key?: string; value?: string }) => {
    const key = args?.key ?? "";
    if (command === "auth_token_store_get") {
      return nativeStore[key] ?? null;
    }
    if (command === "auth_token_store_set" && key) {
      nativeStore[key] = args.value ?? "";
      return null;
    }
    if (command === "auth_token_store_remove" && key) {
      delete nativeStore[key];
      return null;
    }
    return null;
  });

  return { storage, nativeStore };
}

beforeEach(() => {
  __resetAuthTokenStoreForTests();
  invoke.mockReset();
});

describe("auth token storage adapter", () => {
  it("uses localStorage fallback when not running in Tauri", async () => {
    const storage = new MemoryStorage();
    withWebRuntime(storage);
    const store = await getAuthTokenStore();

    await store.setItem("jwt", "abc");
    expect(storage.getItem("jwt")).toBe("abc");
    expect(await store.getItem("jwt")).toBe("abc");

    await store.removeItem("jwt");
    expect(storage.getItem("jwt")).toBeNull();
  });

  it("uses Tauri invoke commands for token storage in Tauri", async () => {
    const { nativeStore } = withTauriRuntime();
    const store = await getAuthTokenStore();

    await store.setItem("refresh", "r1");
    await store.setItem("jwt", "j1");
    expect(nativeStore.refresh).toBe("r1");
    expect(nativeStore.jwt).toBe("j1");

    expect(await store.getItem("refresh")).toBe("r1");
    await store.removeItem("refresh");
    expect(nativeStore.refresh).toBeUndefined();

    expect(invoke).toHaveBeenCalledWith("auth_token_store_set", {
      key: "refresh",
      value: "r1",
    });
    expect(invoke).toHaveBeenCalledWith("auth_token_store_set", {
      key: "jwt",
      value: "j1",
    });
    expect(invoke).toHaveBeenCalledWith("auth_token_store_get", { key: "refresh" });
    expect(invoke).toHaveBeenCalledWith("auth_token_store_remove", { key: "refresh" });
  });
});
