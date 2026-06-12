import { describe, expect, it } from "vitest";
import {
  createPinia,
  setActivePinia,
} from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { nextTick } from "vue";

import type { WebviewCaptureResult } from "@/types/domain";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";

class LocalStorageBag {
  private readonly data = new Map<string, string>();

  clear() {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }
}

function withPersistedStore() {
  const storage = new LocalStorageBag();
  const windowLike = { localStorage: storage };

  Object.defineProperty(globalThis, "window", {
    value: windowLike,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });

  const pinia = createPinia();
  (pinia as unknown as { _a: unknown })._a = {};
  pinia.use(piniaPluginPersistedstate);
  setActivePinia(pinia);
  const store = useShoppingSessionsStore();
  return { pinia, store };
}

function captureSuccess(url: string): WebviewCaptureResult {
  return {
    ok: true,
    source: "webview",
    rawUrl: "https://www.temu.com/fr/product/12345.html",
    canonicalUrl: url,
    capturedAt: Date.now(),
  };
}

describe("shopping sessions store", () => {
  it("creates, renames, switches, and closes sessions with display ordering", () => {
    const { store } = withPersistedStore();
    const first = store.createSession("Shopping 1", "https://www.temu.com/");
    const second = store.createSession("", "https://www.temu.com/");
    const third = store.createSession("Cuisine", "https://www.temu.com/");

    expect(store.activeSessionId).toBe(third);
    expect(store.sessionsByOrder[0]?.id).toBe(third);
    expect(store.sessionsByOrder[1]?.id).toBe(second);
    expect(store.sessionsByOrder[2]?.id).toBe(first);

    store.renameSession(second, "Produits");
    expect(store.getSession(second)?.name).toBe("Produits");

    store.setActiveSession(first);
    expect(store.activeSessionId).toBe(first);
    expect(store.sessionsByOrder[0]?.id).toBe(first);

    store.closeSession(second);
    expect(store.getSession(second)).toBeUndefined();
    expect(store.sessionsByOrder.map((session) => session.id)).toEqual([
      first,
      third,
    ]);
  });

  it("keeps current url and capture bookkeeping", () => {
    const { store } = withPersistedStore();
    const id = store.createSession("Panier");

    store.updateCurrentUrl(id, "https://www.temu.com/fr/category/desk");
    expect(store.getSession(id)?.currentUrl).toBe(
      "https://www.temu.com/fr/category/desk",
    );

    store.recordCapture(id, captureSuccess("https://www.temu.com/fr/product/12345.html"));
    expect(store.getLastCaptureUrl(id)).toBe("https://www.temu.com/fr/product/12345.html");

    store.clearCaptureBookkeeping(id);
    expect(store.getLastCaptureUrl(id)).toBeNull();
    expect(store.getSession(id)?.lastCaptureAt).toBeNull();
  });

  it("rejects insecure Temu session start URLs", () => {
    const { store } = withPersistedStore();
    const id = store.createSession("Shopping HTTP", "http://www.temu.com/fr/product/12345.html");

    expect(store.getSession(id)?.startUrl).toBe("https://www.temu.com/");
    expect(store.getSession(id)?.currentUrl).toBe("https://www.temu.com/");
  });

  it("rejects insecure current session URLs", () => {
    const { store } = withPersistedStore();
    const id = store.createSession("Shopping 1");

    expect(() => {
      store.updateCurrentUrl(id, "http://www.temu.com/fr/category/desk");
    }).toThrow("invalid current URL");
  });

  it("persists settings in store state", async () => {
    const { store } = withPersistedStore();
    store.createSession("Shopping 1");
    store.setDarkMode(true);
    store.setTextZoom(150);
    store.setHideTemuClutter(false);
    store.skipOnboardingStep("sync");
    store.setOnboardingDismissed(true);
    store.setOnboardingCompleted(true);
    await nextTick();

    const storage = globalThis.localStorage;
    storage.setItem("temu:shopping-sessions", JSON.stringify(store.$state));

    const pinia2 = createPinia();
    (pinia2 as unknown as { _a: unknown })._a = {};
    pinia2.use(piniaPluginPersistedstate);
    setActivePinia(pinia2);
    const reloaded = useShoppingSessionsStore();

    expect(storage.getItem("temu:shopping-sessions")).not.toBeNull();
    expect(reloaded.settings.darkMode).toBe(true);
    expect(reloaded.settings.textZoom).toBe(150);
    expect(reloaded.settings.hideTemuClutter).toBe(false);
    expect(reloaded.settings.onboardingSkippedStepIds).toEqual(["sync"]);
    expect(reloaded.settings.onboardingDismissed).toBe(true);
    expect(reloaded.settings.onboardingCompleted).toBe(true);
    expect(reloaded.hasSessions).toBe(true);
  });

  it("tracks skipped onboarding steps without duplicates and can reset the flow", () => {
    const { store } = withPersistedStore();

    store.skipOnboardingStep("session");
    store.skipOnboardingStep("session");
    store.setOnboardingDismissed(true);

    expect(store.settings.onboardingSkippedStepIds).toEqual(["session"]);
    expect(store.settings.onboardingDismissed).toBe(true);

    store.resetOnboardingProgress();

    expect(store.settings.onboardingSkippedStepIds).toEqual([]);
    expect(store.settings.onboardingDismissed).toBe(false);
    expect(store.settings.onboardingCompleted).toBe(false);
  });

  it("exposes stable session summaries for the native session switcher", () => {
    const { store } = withPersistedStore();
    const cuisine = store.createSession("  Cuisine  ");
    const voiture = store.createSession("Voiture");

    store.setActiveSession(cuisine);

    expect(store.sessionSummaries).toEqual([
      {
        id: cuisine,
        name: "Cuisine",
        displayName: "Cuisine",
      },
      {
        id: voiture,
        name: "Voiture",
        displayName: "Voiture",
      },
    ]);
  });

  it("keeps dark mode and text zoom canonical for copied shell controls", () => {
    const { store } = withPersistedStore();

    store.setDarkMode(1 as unknown as boolean);
    store.setTextZoom(147);
    expect(store.bridgeSettings).toEqual({
      darkMode: true,
      textZoom: 145,
      hideTemuClutter: true,
    });

    store.setHideTemuClutter(false);
    expect(store.bridgeSettings.hideTemuClutter).toBe(false);

    store.setTextZoom(999);
    expect(store.settings.textZoom).toBe(200);

    store.setTextZoom(Number.NaN);
    expect(store.settings.textZoom).toBe(100);
  });
});
