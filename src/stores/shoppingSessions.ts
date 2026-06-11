import { defineStore } from "pinia";

import {
  createId,
} from "@/utils/id";
import { normalizeTemuProductUrl } from "@/utils/url";
import type {
  ShoppingSession,
  ShoppingSessionSettings,
  WebviewCaptureResult,
} from "@/types/domain";

type DegradedMode = boolean;

export interface ShoppingSessionSummary {
  id: string;
  name: string;
  displayName: string;
}

export interface ShoppingSessionBridgeSettings {
  darkMode: boolean;
  textZoom: number;
}

interface ShoppingSessionsState {
  sessions: Record<string, ShoppingSession>;
  activeSessionId: string | null;
  settings: ShoppingSessionSettings;
  degradedMode: DegradedMode;
}

const DEFAULT_START_URL = "https://www.temu.com/";
const DEFAULT_SESSION_NAME_PREFIX = "Shopping";
const MAX_SESSION_NAME = 48;
const MAX_ZOOM = 200;
const MIN_ZOOM = 50;
const TEXT_ZOOM_STEP = 5;
const DEFAULT_TEXT_ZOOM = 100;

function now(): number {
  return Date.now();
}

function trimName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_SESSION_NAME);
}

function nextDisplayOrder(sessions: Record<string, ShoppingSession>): number {
  const values = Object.values(sessions);
  if (!values.length) {
    return 1;
  }

  return Math.max(...values.map((session) => session.displayOrder)) + 1;
}

function sortByDisplayOrderDesc(a: ShoppingSession, b: ShoppingSession): number {
  return b.displayOrder - a.displayOrder;
}

function normalizeTextZoomLevel(level: number): number {
  const rounded = Math.round(level / TEXT_ZOOM_STEP) * TEXT_ZOOM_STEP;
  if (!Number.isFinite(rounded)) {
    return DEFAULT_TEXT_ZOOM;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, rounded));
}

function normalizeSessionName(existingNames: string[], rawName: string): string {
  const trimmed = trimName(rawName);
  if (!trimmed) {
    return "";
  }

  if (!existingNames.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
    return trimmed;
  }

  return "";
}

function nextAutoName(sessions: Record<string, ShoppingSession>): string {
  const existing = Object.values(sessions).map((session) => session.name);
  for (let idx = 1; idx <= Object.keys(sessions).length + 1; idx += 1) {
    const candidate = `${DEFAULT_SESSION_NAME_PREFIX} ${idx}`;
    if (!existing.some((name) => name === candidate)) {
      return candidate;
    }
  }

  return `${DEFAULT_SESSION_NAME_PREFIX} ${Object.keys(sessions).length + 1}`;
}

function toSessionSummary(session: ShoppingSession): ShoppingSessionSummary {
  const displayName = trimName(session.name) || DEFAULT_SESSION_NAME_PREFIX;
  return {
    id: session.id,
    name: displayName,
    displayName,
  };
}

function parseStartUrl(raw: string): string {
  const clean = raw.trim();
  if (!clean) {
    return DEFAULT_START_URL;
  }

  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_START_URL;
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host !== "temu.com"
      && !host.endsWith(".temu.com")
      && host !== "temu.to"
      && !host.endsWith(".temu.to")
    ) {
      return DEFAULT_START_URL;
    }

    return parsed.toString();
  } catch {
    return DEFAULT_START_URL;
  }
}

export const useShoppingSessionsStore = defineStore("shoppingSessions", {
  state: (): ShoppingSessionsState => ({
    sessions: {},
    activeSessionId: null,
    settings: {
      darkMode: false,
      textZoom: DEFAULT_TEXT_ZOOM,
    },
    degradedMode: false,
  }),

  getters: {
    sessionsByOrder: (state): ShoppingSession[] =>
      Object.values(state.sessions).sort(sortByDisplayOrderDesc),

    sessionSummaries(): ShoppingSessionSummary[] {
      return this.sessionsByOrder.map(toSessionSummary);
    },

    bridgeSettings(state): ShoppingSessionBridgeSettings {
      return {
        darkMode: Boolean(state.settings.darkMode),
        textZoom: normalizeTextZoomLevel(state.settings.textZoom),
      };
    },

    activeSession(state): ShoppingSession | undefined {
      if (!state.activeSessionId) {
        return undefined;
      }

      return state.sessions[state.activeSessionId];
    },

    hasSessions(state): boolean {
      return Object.keys(state.sessions).length > 0;
    },
  },

  actions: {
    getSession(sessionId: string): ShoppingSession | undefined {
      return this.sessions[sessionId];
    },

    createSession(rawName: string = "", startUrl = DEFAULT_START_URL): string {
      const customName = normalizeSessionName(
        Object.values(this.sessions).map((session) => session.name),
        rawName,
      );
      const name = customName || nextAutoName(this.sessions);
      const id = createId("wv-session");
      const nowTime = now();
      const normalizedStartUrl = parseStartUrl(startUrl);

      this.sessions[id] = {
        id,
        name,
        startUrl: normalizedStartUrl,
        currentUrl: normalizedStartUrl,
        lastCapturedUrl: null,
        lastCaptureAt: null,
        createdAt: nowTime,
        updatedAt: nowTime,
        lastActiveAt: nowTime,
        displayOrder: nextDisplayOrder(this.sessions),
      };

      this.activeSessionId = id;
      return id;
    },

    renameSession(sessionId: string, rawName: string): void {
      const session = this.sessions[sessionId];
      if (!session) {
        throw new Error("session not found");
      }

      const name = normalizeSessionName(
        Object.values(this.sessions)
          .filter((value) => value.id !== sessionId)
          .map((value) => value.name),
        rawName,
      );
      if (!name) {
        throw new Error("session name already used or empty");
      }

      session.name = name;
      session.updatedAt = now();
    },

    closeSession(sessionId: string): void {
      if (!this.sessions[sessionId]) {
        throw new Error("session not found");
      }

      delete this.sessions[sessionId];
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = this.sessionsByOrder[0]?.id ?? null;
      }
    },

    setActiveSession(sessionId: string): void {
      const session = this.sessions[sessionId];
      if (!session) {
        throw new Error("session not found");
      }

      const nowTime = now();
      session.lastActiveAt = nowTime;
      session.updatedAt = nowTime;
      session.displayOrder = nextDisplayOrder(this.sessions);
      this.activeSessionId = sessionId;
    },

    updateCurrentUrl(sessionId: string, rawUrl: string): void {
      const session = this.sessions[sessionId];
      if (!session) {
        throw new Error("session not found");
      }

      const clean = rawUrl.trim();
      if (!clean) {
        throw new Error("current URL is required");
      }

      try {
        const parsed = new URL(clean);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("invalid current URL");
        }
      } catch {
        throw new Error("invalid current URL");
      }

      session.currentUrl = clean;
      session.updatedAt = now();
      session.lastActiveAt = now();
    },

    recordCapture(sessionId: string, result: WebviewCaptureResult): void {
      const session = this.sessions[sessionId];
      if (!session) {
        throw new Error("session not found");
      }

      if (!result.ok) {
        throw new Error(`capture failed: ${result.reason}`);
      }

      session.lastCapturedUrl = result.canonicalUrl;
      session.lastCaptureAt = result.capturedAt;
      session.updatedAt = now();
    },

    normalizeCurrentUrlFromCapture(sessionId: string): boolean {
      const session = this.sessions[sessionId];
      if (!session) {
        return false;
      }

      const normalized = normalizeTemuProductUrl(session.currentUrl);
      if (!normalized) {
        return false;
      }

      if (normalized.canonicalUrl !== session.currentUrl) {
        session.currentUrl = normalized.canonicalUrl;
      }

      return true;
    },

    setDarkMode(enabled: boolean): void {
      this.settings.darkMode = Boolean(enabled);
      if (this.activeSessionId) {
        this.sessions[this.activeSessionId]!.updatedAt = now();
      }
    },

    setTextZoom(level: number): void {
      this.settings.textZoom = normalizeTextZoomLevel(level);
      if (this.activeSessionId) {
        this.sessions[this.activeSessionId]!.updatedAt = now();
      }
    },

    setDegradedMode(degraded: boolean): void {
      this.degradedMode = Boolean(degraded);
    },

    getLastCaptureUrl(sessionId: string): string | null {
      const session = this.sessions[sessionId];
      return session?.lastCapturedUrl ?? null;
    },

    clearCaptureBookkeeping(sessionId: string): void {
      const session = this.sessions[sessionId];
      if (!session) {
        return;
      }

      session.lastCapturedUrl = null;
      session.lastCaptureAt = null;
      session.updatedAt = now();
    },
  },

  persist: {
    key: "temu:shopping-sessions",
  },
});
