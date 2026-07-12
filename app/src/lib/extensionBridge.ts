type ExtensionResponse = {
  ok: boolean;
  available: boolean;
  error?: string;
};

type ExtensionState = {
  detected: boolean;
  supported: boolean;
  error?: string;
}

const EXTENSION_PING_TIMEOUT_MS = 1000;

type ChromeApi = {
  runtime: {
    sendMessage: (message: Record<string, unknown>) => Promise<unknown>;
  };
} | undefined;

function getChromeApi(): ChromeApi {
  if (typeof window === "undefined") return undefined;
  return (window as { chrome?: ChromeApi }).chrome;
}

function createTimeoutPromise<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}

async function pingExtension(): Promise<ExtensionState> {
  const api = getChromeApi();
  if (!api) {
    return { detected: false, supported: false };
  }

  try {
    const response = await Promise.race([
      api.runtime.sendMessage({ type: "PING" }),
      createTimeoutPromise<ExtensionResponse>(EXTENSION_PING_TIMEOUT_MS),
    ]) as ExtensionResponse | undefined;

    if (response?.ok && response?.available) {
      return { detected: true, supported: true };
    }
    return { detected: false, supported: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("receiving end does not exist")) {
      return { detected: false, supported: true };
    }
    return { detected: false, supported: true, error: message };
  }
}

export interface ExtensionBridgeResult {
  ok: boolean;
  extensionDetected: boolean;
  extensionSupported: boolean;
  error?: string;
}

export async function detectExtension(): Promise<ExtensionBridgeResult> {
  const state = await pingExtension();

  if (!state.supported) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: false,
      error: "extension_api_not_supported",
    };
  }

  if (!state.detected && !state.error) {
    return {
      ok: true,
      extensionDetected: false,
      extensionSupported: true,
      error: "not_installed",
    };
  }

  if (state.error) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: true,
      error: state.error,
    };
  }

  return {
    ok: true,
    extensionDetected: true,
    extensionSupported: true,
  };
}

export async function requestOverlayOpen(listIds: string[]): Promise<ExtensionBridgeResult> {
  const api = getChromeApi();
  if (!api) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: false,
      error: "extension_api_not_supported",
    };
  }

  try {
    const response = await api.runtime.sendMessage({
      type: "OVERLAY_OPEN",
      listIds,
    }) as ExtensionResponse | undefined;

    return {
      ok: response?.ok ?? false,
      extensionDetected: response?.available ?? false,
      extensionSupported: Boolean(response),
      error: response?.error,
    };
  } catch (error) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function requestAddToCurrentList(listId: string): Promise<ExtensionBridgeResult> {
  const api = getChromeApi();
  if (!api) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: false,
      error: "extension_api_not_supported",
    };
  }

  try {
    const response = await api.runtime.sendMessage({
      type: "ADD_TO_LIST",
      listId,
    }) as ExtensionResponse | undefined;

    return {
      ok: response?.ok ?? false,
      extensionDetected: response?.available ?? false,
      extensionSupported: Boolean(response),
      error: response?.error,
    };
  } catch (error) {
    return {
      ok: false,
      extensionDetected: false,
      extensionSupported: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function requestCurrentUrl(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const api = getChromeApi();
  if (!api) {
    return { ok: false, error: "extension_api_not_supported" };
  }

  try {
    const response = await api.runtime.sendMessage({
      type: "CAPTURE_URL",
    }) as ExtensionResponse & { url?: string } | undefined;

    return {
      ok: response?.ok ?? false,
      url: response?.url,
      error: response?.error,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isTemuUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("temu.com") || parsed.hostname.endsWith(".temu.com");
  } catch {
    return false;
  }
}

export function validateTemuPage(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: "url required" };
  }

  if (!isTemuUrl(url)) {
    return { valid: false, error: "not a temu page" };
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    if (path.includes("/product") || /^\/[^/]+\/product\//.test(path)) {
      return { valid: true };
    }
    return { valid: false, error: "not a product page" };
  } catch {
    return { valid: false, error: "invalid url" };
  }
}