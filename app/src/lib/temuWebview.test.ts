import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  captureCurrentUrl,
  closeSession,
  getWebviewDiagnostics,
  hideWebview,
  openSession,
  setActiveSession,
  setDarkMode,
  setHideTemuClutter,
  setTextZoom,
  syncSessions,
  syncShoppingLists,
} from "@/lib/temuWebview";

const invoke = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  invoke,
}));

function setTauriAvailable(): void {
  Object.defineProperty(globalThis, "window", {
    value: { __TAURI__: true, __TAURI_INTERNALS__: true },
    configurable: true,
    writable: true,
  });
}

function setWebOnly(): void {
  Object.defineProperty(globalThis, "window", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

describe("temu webview bridge", () => {
  beforeEach(() => {
    setWebOnly();
    invoke.mockReset();
  });

  it("falls back degraded/unavailable when not running inside Tauri", async () => {
    const result = await openSession("session-1", "https://www.temu.com/", "Shopping 1", false, 100);

    expect(result).toMatchObject({
      ok: false,
      unavailable: true,
      degraded: true,
    });
  });

  it("invokes open/close/hide/dark/text zoom commands with expected payload", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue(undefined);
    await openSession("session-1", "https://www.temu.com/", "Shopping 1", true, 125);
    expect(invoke).toHaveBeenCalledWith("temu_webview_open_session", {
      sessionId: "session-1",
      url: "https://www.temu.com/",
      name: "Shopping 1",
      displayName: "Shopping 1",
      darkMode: true,
      textZoom: 125,
      hideTemuClutter: true,
    });

    await hideWebview();
    expect(invoke).toHaveBeenCalledWith("temu_webview_hide", {});

    await closeSession("session-1");
    expect(invoke).toHaveBeenCalledWith("temu_webview_close_session", { sessionId: "session-1" });

    await setDarkMode(true);
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_dark_mode", { enabled: true });

    await setTextZoom(150);
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_text_zoom", { level: 150 });

    await setHideTemuClutter(false);
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_hide_temu_clutter", { enabled: false });

    await syncSessions({ sessions: [{ id: "s1", name: "Shopping 1" }], activeSessionId: "s1" });
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_sessions", {
      sessionsJson: JSON.stringify([{ id: "s1", name: "Shopping 1", displayName: "Shopping 1" }]),
      activeSessionId: "s1",
    });

    await setActiveSession("s1", [{ id: "s1", name: "Shopping 1" }]);
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_sessions", {
      sessionsJson: JSON.stringify([{ id: "s1", name: "Shopping 1", displayName: "Shopping 1" }]),
      activeSessionId: "s1",
    });
  });

  it("serializes session switcher labels with stable ids and display names", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue(undefined);

    await syncSessions({
      sessions: [
        { id: "s1", name: "  Cuisine  " },
        { id: "s2", name: "", displayName: "Voiture" },
        { id: "  ", name: "Ignored" },
      ],
      activeSessionId: "s2",
    });

    expect(invoke).toHaveBeenCalledWith("temu_webview_set_sessions", {
      sessionsJson: JSON.stringify([
        { id: "s1", name: "Cuisine", displayName: "Cuisine" },
        { id: "s2", name: "Voiture", displayName: "Voiture" },
      ]),
      activeSessionId: "s2",
    });
  });

  it("serializes shopping list labels for native quick-add actions", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue(undefined);

    await syncShoppingLists([
      { id: "list-1", name: "  Cuisine  " },
      { id: "list-2", name: "Voiture   accessoires" },
      { id: "", name: "Ignored" },
      { id: "list-3", name: "" },
    ]);

    expect(invoke).toHaveBeenCalledWith("temu_webview_set_shopping_lists", {
      listsJson: JSON.stringify([
        { id: "list-1", name: "Cuisine" },
        { id: "list-2", name: "Voiture accessoires" },
      ]),
    });
  });

  it("canonicalizes open-session label and text zoom settings before native handoff", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue(undefined);

    await openSession("session-1", "https://www.temu.com/", "  Cuisine  ", true, 147);
    expect(invoke).toHaveBeenCalledWith("temu_webview_open_session", {
      sessionId: "session-1",
      url: "https://www.temu.com/",
      name: "Cuisine",
      displayName: "Cuisine",
      darkMode: true,
      textZoom: 145,
      hideTemuClutter: true,
    });

    await setTextZoom(999);
    expect(invoke).toHaveBeenCalledWith("temu_webview_set_text_zoom", { level: 200 });
  });

  it("returns a capture failure for non-product URLs and never throws", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue("https://example.com/page");
    const result = await captureCurrentUrl();

    expect(result).toEqual({
      ok: false,
      source: "webview",
      reason: "invalid_url",
      rawUrl: "https://example.com/page",
      unavailable: false,
      degraded: true,
      error: "invalid product URL",
    });
  });

  it("maps a valid product URL into a successful WebviewCaptureResult", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue({
      url: "https://www.temu.com/fr/product/12345.html?utm_source=share",
      sessionId: "session-1",
      available: true,
      degraded: false,
    });
    const result = await captureCurrentUrl();

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      source: "webview",
      canonicalUrl: "https://www.temu.com/fr/product/12345.html",
      rawUrl: "https://www.temu.com/fr/product/12345.html?utm_source=share",
      unavailable: false,
      degraded: false,
    }));
    expect(result).toHaveProperty("capturedAt");
  });

  it("returns controlled error on Tauri invoke failure", async () => {
    setTauriAvailable();
    invoke.mockRejectedValue(new Error("native command failed"));
    const result = await setDarkMode(true);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      degraded: true,
      unavailable: false,
      error: "native command failed",
    }));
  });

  it("normalizes native WebView diagnostics without exposing page content", async () => {
    setTauriAvailable();
    invoke.mockResolvedValue({
      available: true,
      multiProfileSupported: true,
      multiProfileEnabled: true,
      profileDegraded: false,
      activeSessionId: "session-1",
      activeProfileName: "temu_abc123",
      activeHost: "www.temu.com",
      warmHostCount: 2,
      knownSessionCount: 3,
      domStorageEnabled: true,
      databaseEnabled: true,
      mixedContentMode: 1,
      javaScriptEnabled: true,
      acceptCookie: true,
      acceptThirdPartyCookies: false,
      hideTemuClutter: false,
      darkMode: true,
      textZoom: 125,
    });

    await expect(getWebviewDiagnostics()).resolves.toEqual({
      available: true,
      multiProfileSupported: true,
      multiProfileEnabled: true,
      profileDegraded: false,
      activeSessionId: "session-1",
      activeProfileName: "temu_abc123",
      activeHost: "www.temu.com",
      warmHostCount: 2,
      knownSessionCount: 3,
      domStorageEnabled: true,
      databaseEnabled: true,
      mixedContentMode: 1,
      javaScriptEnabled: true,
      acceptCookie: true,
      acceptThirdPartyCookies: false,
      hideTemuClutter: false,
      darkMode: true,
      textZoom: 125,
      error: undefined,
    });
    expect(invoke).toHaveBeenCalledWith("temu_webview_get_diagnostics", {});
  });
});
