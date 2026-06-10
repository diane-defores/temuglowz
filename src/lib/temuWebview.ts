import { normalizeTemuProductUrl } from "@/utils/url";
import type { WebviewCaptureResult } from "@/types/domain";

type TemuSessionId = string;
type SessionSummary = {
  id: string;
  name: string;
};

interface BridgeCommandResult {
  ok: boolean;
  unavailable: boolean;
  degraded: boolean;
  error?: string;
}

type BridgeCaptureResult = WebviewCaptureResult & {
  unavailable: boolean;
  degraded: boolean;
  error?: string;
};

interface NativeCapturePayload {
  url?: string | null;
  sessionId?: string | null;
  available?: boolean;
  degraded?: boolean;
  error?: string | null;
}
const DEFAULT_ZOOM = 100;

function hasTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const host = window as { __TAURI__?: unknown };
  return Boolean(
    host.__TAURI__
      || (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__,
  );
}

async function invokeCommand<T = unknown>(command: string, args?: Record<string, unknown>): Promise<T> {
  const module = await import("@tauri-apps/api/core");
  return module.invoke<T>(command, args);
}

function withUnavailableError(reason: string): BridgeCommandResult {
  return {
    ok: false,
    unavailable: true,
    degraded: true,
    error: reason,
  };
}

function withError(reason: string): BridgeCommandResult {
  return {
    ok: false,
    unavailable: false,
    degraded: true,
    error: reason,
  };
}

async function safeInvoke<T>(
  command: string,
  args: Record<string, unknown>,
): Promise<BridgeCommandResult & { value?: T }> {
  if (!hasTauriRuntime()) {
    return { ...withUnavailableError("webview bridge unavailable"), value: undefined };
  }

  try {
    await invokeCommand<T>(command, args);
    return {
      ok: true,
      unavailable: false,
      degraded: false,
      value: undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...withError(message),
      value: undefined,
    };
  }
}

function resolveSafeFallback(reason: string, rawUrl?: string): BridgeCaptureResult {
  return {
    ok: false,
    source: "webview",
    reason: reason === "invalid" ? "invalid_url" : "unavailable",
    rawUrl,
    degraded: true,
    unavailable: reason === "unavailable",
    error: reason === "invalid" ? "invalid product URL" : reason,
  };
}

function toCapturePayload(rawUrl: string): BridgeCaptureResult {
  const normalized = normalizeTemuProductUrl(rawUrl);
  if (!normalized) {
    return resolveSafeFallback("invalid");
  }

  return {
    ok: true,
    source: "webview",
    rawUrl: normalized.originalUrl,
    canonicalUrl: normalized.canonicalUrl,
    capturedAt: Date.now(),
    unavailable: false,
    degraded: false,
  };
}

export async function openSession(
  sessionId: TemuSessionId,
  url: string,
  name: string,
  darkMode: boolean,
  textZoom: number,
): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_open_session", {
    sessionId,
    url,
    name,
    darkMode,
    textZoom,
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function hideWebview(): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_hide", {});

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function closeSession(sessionId: TemuSessionId): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_close_session", { sessionId });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function setActiveSession(
  sessionId: TemuSessionId,
  sessions: SessionSummary[] = [],
): Promise<BridgeCommandResult> {
  return syncSessions({
    sessions,
    activeSessionId: sessionId,
  });
}

export async function syncSessions(params: {
  sessions: SessionSummary[];
  activeSessionId: TemuSessionId | null;
}): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_set_sessions", {
    sessionsJson: JSON.stringify(params.sessions),
    activeSessionId: params.activeSessionId ?? "",
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function setDarkMode(enabled: boolean): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_set_dark_mode", {
    enabled,
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function setTextZoom(level: number = DEFAULT_ZOOM): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_set_text_zoom", {
    level: Math.round(level),
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function captureCurrentUrl(): Promise<BridgeCaptureResult> {
  if (!hasTauriRuntime()) {
    return resolveSafeFallback("unavailable");
  }

  try {
    const payload = await invokeCommand<NativeCapturePayload | string>(
      "temu_webview_capture_current_url",
      {},
    );
    const rawUrl = typeof payload === "string" ? payload : payload.url;
    const unavailable = typeof payload === "string" ? false : payload.available === false;
    const degraded = typeof payload === "string" ? false : Boolean(payload.degraded);

    if (typeof rawUrl !== "string" || !rawUrl.trim()) {
      return {
        ok: false,
        source: "webview",
        reason: unavailable ? "unavailable" : "error",
        rawUrl: typeof rawUrl === "string" ? rawUrl : undefined,
        error: typeof payload === "string"
          ? "capture command returned no url"
          : payload.error ?? "capture command returned no url",
        unavailable,
        degraded: true,
      };
    }

    const normalized = toCapturePayload(rawUrl);
    if (!normalized.ok) {
      return { ...normalized, rawUrl, unavailable, degraded: true };
    }

    return { ...normalized, unavailable, degraded };
  } catch (error) {
    return {
      ok: false,
      source: "webview",
      reason: "error",
      error: error instanceof Error ? error.message : String(error),
      unavailable: false,
      degraded: true,
    };
  }
}
