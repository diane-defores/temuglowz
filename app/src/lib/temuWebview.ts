import { normalizeTemuProductUrl } from "@/utils/url";
import type { WebviewCaptureResult } from "@/types/domain";

type TemuSessionId = string;
export type SessionSummary = {
  id: string;
  name?: string;
  displayName?: string;
};
export type ShoppingListSummary = {
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

export interface WebviewDiagnostics {
  available: boolean;
  multiProfileSupported: boolean;
  multiProfileEnabled: boolean;
  profileDegraded: boolean;
  activeSessionId: string | null;
  activeProfileName: string | null;
  activeHost: string | null;
  warmHostCount: number;
  knownSessionCount: number;
  domStorageEnabled: boolean | null;
  databaseEnabled: boolean | null;
  mixedContentMode: number | null;
  javaScriptEnabled: boolean | null;
  acceptCookie: boolean;
  acceptThirdPartyCookies: boolean | null;
  hideTemuClutter: boolean;
  darkMode: boolean;
  textZoom: number;
  error?: string;
}
const DEFAULT_ZOOM = 100;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 5;
const DEFAULT_SESSION_NAME = "Shopping";

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

function normalizeTextZoomLevel(level: number = DEFAULT_ZOOM): number {
  const rounded = Math.round(level / ZOOM_STEP) * ZOOM_STEP;
  if (!Number.isFinite(rounded)) {
    return DEFAULT_ZOOM;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, rounded));
}

function normalizeDisplayName(summary: Pick<SessionSummary, "name" | "displayName">): string {
  const raw = summary.displayName || summary.name || DEFAULT_SESSION_NAME;
  return raw.trim().replace(/\s+/g, " ") || DEFAULT_SESSION_NAME;
}

function normalizeSessionSummaries(sessions: SessionSummary[]): Array<{
  id: string;
  name: string;
  displayName: string;
}> {
  return sessions
    .map((session) => {
      const id = session.id.trim();
      if (!id) {
        return null;
      }

      const displayName = normalizeDisplayName(session);
      return {
        id,
        name: displayName,
        displayName,
      };
    })
    .filter((session): session is {
      id: string;
      name: string;
      displayName: string;
    } => session !== null);
}

function normalizeShoppingListSummaries(lists: ShoppingListSummary[]): ShoppingListSummary[] {
  return lists
    .map((list) => {
      const id = list.id.trim();
      const name = list.name.trim().replace(/\s+/g, " ").slice(0, 64);
      if (!id || !name) {
        return null;
      }

      return { id, name };
    })
    .filter((list): list is ShoppingListSummary => list !== null);
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
  hideTemuClutter = true,
): Promise<BridgeCommandResult> {
  const displayName = normalizeDisplayName({ name });
  const payload = await safeInvoke("temu_webview_open_session", {
    sessionId,
    url,
    name: displayName,
    displayName,
    darkMode: Boolean(darkMode),
    textZoom: normalizeTextZoomLevel(textZoom),
    hideTemuClutter: Boolean(hideTemuClutter),
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
  const sessions = normalizeSessionSummaries(params.sessions);
  const payload = await safeInvoke("temu_webview_set_sessions", {
    sessionsJson: JSON.stringify(sessions),
    activeSessionId: params.activeSessionId ?? "",
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function syncShoppingLists(lists: ShoppingListSummary[]): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_set_shopping_lists", {
    listsJson: JSON.stringify(normalizeShoppingListSummaries(lists)),
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
    level: normalizeTextZoomLevel(level),
  });

  return {
    ok: payload.ok,
    degraded: payload.degraded,
    unavailable: payload.unavailable,
    error: payload.error,
  };
}

export async function setHideTemuClutter(enabled: boolean): Promise<BridgeCommandResult> {
  const payload = await safeInvoke("temu_webview_set_hide_temu_clutter", {
    enabled: Boolean(enabled),
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

export async function getWebviewDiagnostics(): Promise<WebviewDiagnostics> {
  if (!hasTauriRuntime()) {
    return {
      available: false,
      multiProfileSupported: false,
      multiProfileEnabled: false,
      profileDegraded: true,
      activeSessionId: null,
      activeProfileName: null,
      activeHost: null,
      warmHostCount: 0,
      knownSessionCount: 0,
      domStorageEnabled: null,
      databaseEnabled: null,
      mixedContentMode: null,
      javaScriptEnabled: null,
      acceptCookie: false,
      acceptThirdPartyCookies: null,
      hideTemuClutter: false,
      darkMode: false,
      textZoom: DEFAULT_ZOOM,
      error: "webview bridge unavailable",
    };
  }

  try {
    const payload = await invokeCommand<Partial<WebviewDiagnostics>>(
      "temu_webview_get_diagnostics",
      {},
    );

    return {
      available: Boolean(payload.available),
      multiProfileSupported: Boolean(payload.multiProfileSupported),
      multiProfileEnabled: Boolean(payload.multiProfileEnabled),
      profileDegraded: Boolean(payload.profileDegraded),
      activeSessionId: typeof payload.activeSessionId === "string" ? payload.activeSessionId : null,
      activeProfileName: typeof payload.activeProfileName === "string" ? payload.activeProfileName : null,
      activeHost: typeof payload.activeHost === "string" ? payload.activeHost : null,
      warmHostCount: Number(payload.warmHostCount ?? 0),
      knownSessionCount: Number(payload.knownSessionCount ?? 0),
      domStorageEnabled: typeof payload.domStorageEnabled === "boolean" ? payload.domStorageEnabled : null,
      databaseEnabled: typeof payload.databaseEnabled === "boolean" ? payload.databaseEnabled : null,
      mixedContentMode: typeof payload.mixedContentMode === "number" ? payload.mixedContentMode : null,
      javaScriptEnabled: typeof payload.javaScriptEnabled === "boolean" ? payload.javaScriptEnabled : null,
      acceptCookie: Boolean(payload.acceptCookie),
      acceptThirdPartyCookies: typeof payload.acceptThirdPartyCookies === "boolean" ? payload.acceptThirdPartyCookies : null,
      hideTemuClutter: Boolean(payload.hideTemuClutter),
      darkMode: Boolean(payload.darkMode),
      textZoom: Number(payload.textZoom ?? DEFAULT_ZOOM),
      error: typeof payload.error === "string" ? payload.error : undefined,
    };
  } catch (error) {
    return {
      available: false,
      multiProfileSupported: false,
      multiProfileEnabled: false,
      profileDegraded: true,
      activeSessionId: null,
      activeProfileName: null,
      activeHost: null,
      warmHostCount: 0,
      knownSessionCount: 0,
      domStorageEnabled: null,
      databaseEnabled: null,
      mixedContentMode: null,
      javaScriptEnabled: null,
      acceptCookie: false,
      acceptThirdPartyCookies: null,
      hideTemuClutter: false,
      darkMode: false,
      textZoom: DEFAULT_ZOOM,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
