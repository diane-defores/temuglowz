interface AuthTokenStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface NativeCommands {
  invoke(command: string, args?: Record<string, string>): Promise<unknown>;
}

function hasTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const host = window as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
  return Boolean(host.__TAURI__ || host.__TAURI_INTERNALS__);
}

function canUseLocalStorage(): boolean {
  return (
    typeof window !== "undefined"
    && typeof window.localStorage !== "undefined"
  );
}

class WebAuthTokenStore implements AuthTokenStore {
  async getItem(key: string): Promise<string | null> {
    if (!canUseLocalStorage()) {
      return null;
    }

    return window.localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!canUseLocalStorage()) {
      return;
    }

    window.localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (!canUseLocalStorage()) {
      return;
    }

    window.localStorage.removeItem(key);
  }
}

class MemoryAuthTokenStore implements AuthTokenStore {
  private readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }
}

class TauriAuthTokenStore implements AuthTokenStore {
  constructor(private readonly commands: NativeCommands) {}

  async getItem(key: string): Promise<string | null> {
    try {
      return (await this.commands.invoke("auth_token_store_get", { key })) as string | null;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.commands.invoke("auth_token_store_set", { key, value });
    } catch {
      return;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.commands.invoke("auth_token_store_remove", { key });
    } catch {
      return;
    }
  }
}

let storePromise: Promise<AuthTokenStore> | null = null;

export async function getAuthTokenStore(): Promise<AuthTokenStore> {
  if (!storePromise) {
    storePromise = buildStore();
  }

  return storePromise;
}

function buildStore(): Promise<AuthTokenStore> {
  if (!hasTauriRuntime()) {
    return Promise.resolve(new WebAuthTokenStore());
  }

  return import("@tauri-apps/api/core")
    .then((module) => new TauriAuthTokenStore(module))
    .catch(() => new MemoryAuthTokenStore());
}

export function __resetAuthTokenStoreForTests(): void {
  storePromise = null;
}
