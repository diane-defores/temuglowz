<template>
  <div
    class="temu-shell app-container"
    :class="{ 'is-dark': sessionsStore.settings.darkMode }"
  >
    <NetworkWebviewHost
      v-if="activeWebviewSessionId"
      :session-id="activeWebviewSessionId"
      @close="returnHome"
      @open-settings="settingsVisible = true"
    />

    <MobileLayout
      v-else-if="isMobile"
      @open-session="openShoppingSession"
      @open-settings="settingsVisible = true"
    />

    <template v-else>
      <AppHeader
        v-model:sidebar-visible="sidebarVisible"
        v-model:right-sidebar-visible="rightSidebarVisible"
        @open-settings="settingsVisible = true"
      />
      <AppSidebar
        v-model="sidebarVisible"
        @open-session="openShoppingSession"
      >
        <AppRightSidebar v-model="rightSidebarVisible">
          <MobileLayout
            desktop
            @open-session="openShoppingSession"
            @open-settings="settingsVisible = true"
          />
        </AppRightSidebar>
      </AppSidebar>
    </template>

    <MobileSettingsSheet v-model="settingsVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";
import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import {
  captureCurrentUrl,
  hideWebview,
  openSession,
  setDarkMode,
  setTextZoom,
  syncShoppingLists,
  syncSessions,
} from "@/lib/temuWebview";
import type { ShoppingSession } from "@/types/domain";

import "./style.css";
import "./assets/main.css";

import AppHeader from "./components/AppHeader.vue";
import AppRightSidebar from "./components/AppRightSidebar.vue";
import AppSidebar from "./components/AppSidebar.vue";
import MobileLayout from "./components/MobileLayout.vue";
import MobileSettingsSheet from "./components/MobileSettingsSheet.vue";
import NetworkWebviewHost from "./components/NetworkWebviewHost.vue";
import { TEXT_ZOOM_DEFAULT, normalizeTextZoomLevel } from "./utils/textZoom";

const sidebarVisible = ref(true);
const rightSidebarVisible = ref(true);
const settingsVisible = ref(false);
const activeWebviewSessionId = ref<string | null>(null);
const router = useRouter();
const importDraftsStore = useImportDraftsStore();
const productObservationsStore = useProductObservationsStore();
const productSnapshotsStore = useProductSnapshotsStore();
const shoppingListsStore = useShoppingListsStore();
const sessionsStore = useShoppingSessionsStore();

const isMobile = ref(typeof window !== "undefined" ? window.innerWidth <= 768 : true);
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const sessionSummaries = computed(() =>
  sessionsStore.sessionsByOrder.map((session) => ({
    id: session.id,
    name: session.name,
  })),
);
const shoppingListSummaries = computed(() =>
  shoppingListsStore.listEntries.map((list) => ({
    id: list.id,
    name: list.name,
  })),
);

function applyTheme(enabled: boolean): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", enabled);
}

function handleResize(): void {
  isMobile.value = window.innerWidth <= 768;
}

function syncNativeSessions(): void {
  syncSessions({
    sessions: sessionSummaries.value,
    activeSessionId: sessionsStore.activeSessionId,
  }).then((result) => {
    sessionsStore.setDegradedMode(result.degraded);
  }).catch(() => {
    sessionsStore.setDegradedMode(true);
  });
}

function syncNativeShoppingLists(): void {
  syncShoppingLists(shoppingListSummaries.value).then((result) => {
    sessionsStore.setDegradedMode(result.degraded);
  }).catch(() => {
    sessionsStore.setDegradedMode(true);
  });
}

async function openShoppingSession(sessionOrId: ShoppingSession | string): Promise<void> {
  const sessionId = typeof sessionOrId === "string" ? sessionOrId : sessionOrId.id;
  const session = sessionsStore.getSession(sessionId);
  if (!session) {
    return;
  }

  sessionsStore.setActiveSession(session.id);
  activeWebviewSessionId.value = session.id;

  const result = await openSession(
    session.id,
    session.currentUrl || session.startUrl,
    session.name,
    sessionsStore.settings.darkMode,
    sessionsStore.settings.textZoom,
  );
  sessionsStore.setDegradedMode(result.degraded);
  syncNativeSessions();
}

async function returnHome(): Promise<void> {
  activeWebviewSessionId.value = null;
  const result = await hideWebview();
  sessionsStore.setDegradedMode(result.degraded);
  syncNativeSessions();
}

const onNativeHidden = () => {
  activeWebviewSessionId.value = null;
  syncNativeSessions();
};

const onNativeDarkMode = ((event: CustomEvent) => {
  const enabled = Boolean(event.detail?.enabled ?? !sessionsStore.settings.darkMode);
  sessionsStore.setDarkMode(enabled);
}) as unknown as (event: Event) => void;

const onNativeTextZoom = ((event: CustomEvent) => {
  const level = normalizeTextZoomLevel(Number(event.detail?.level ?? TEXT_ZOOM_DEFAULT));
  sessionsStore.setTextZoom(level);
}) as unknown as (event: Event) => void;

async function resolveCaptureUrl(detail: Record<string, unknown>): Promise<string | null> {
  const eventUrl = typeof detail.url === "string" ? detail.url : "";
  if (eventUrl.trim()) {
    return eventUrl;
  }

  const captured = await captureCurrentUrl();
  if (!captured.ok) {
    return null;
  }

  return captured.rawUrl;
}

async function addCurrentProductToList(rawUrl: string, listId: string): Promise<void> {
  const draft = importDraftsStore.useWebviewUrl(rawUrl);
  const duplicateItemId = shoppingListsStore.findDuplicateByCanonicalOrProductId(listId, {
    canonicalUrl: draft.canonicalUrl,
  });

  if (duplicateItemId) {
    const existing = shoppingListsStore.items[duplicateItemId];
    if (existing) {
      shoppingListsStore.setItemQuantity(listId, duplicateItemId, existing.quantity + 1);
    }
    importDraftsStore.clearDraft();
    return;
  }

  const snapshot = productSnapshotsStore.buildSnapshotFromDraft({
    canonicalUrl: draft.canonicalUrl,
    originalUrl: draft.candidateUrl,
    title: draft.parsedTitle || "Produit Temu",
    metadataStatus: draft.status,
    source: "webview",
  });
  productSnapshotsStore.upsertSnapshot(snapshot);
  shoppingListsStore.addItem(listId, snapshot.id, 1);
  importDraftsStore.clearDraft();
}

async function removeCurrentProductFromList(rawUrl: string, listId: string): Promise<void> {
  const draft = importDraftsStore.useWebviewUrl(rawUrl);
  const duplicateItemId = shoppingListsStore.findDuplicateByCanonicalOrProductId(listId, {
    canonicalUrl: draft.canonicalUrl,
  });

  if (duplicateItemId) {
    shoppingListsStore.removeItem(listId, duplicateItemId);
  }
  importDraftsStore.clearDraft();
}

async function observeCurrentProduct(rawUrl: string): Promise<void> {
  const draft = importDraftsStore.useWebviewUrl(rawUrl);
  const snapshot = productSnapshotsStore.findDuplicateByUrlOrProductId(draft.canonicalUrl);

  if (!snapshot) {
    await returnHome();
    await router.push({ name: "import-review" });
    return;
  }

  productObservationsStore.createManualRequiredObservation({
    snapshotId: snapshot.id,
    productId: snapshot.productId,
    canonicalUrl: snapshot.canonicalUrl,
    source: "webview",
  });
  importDraftsStore.clearDraft();
  await returnHome();
  await router.push({
    name: "product-detail",
    params: { snapshotId: snapshot.id },
  });
}

const onNativeCaptureRequested = (async (event: CustomEvent) => {
  const detail = (event.detail ?? {}) as Record<string, unknown>;
  const action = detail.action === "remove"
    ? "remove"
    : detail.action === "add"
      ? "add"
      : detail.action === "observe"
        ? "observe"
        : "review";
  const listId = typeof detail.listId === "string" ? detail.listId : "";
  const rawUrl = await resolveCaptureUrl(detail);

  if (!rawUrl) {
    return;
  }

  if (typeof detail.sessionId === "string") {
    sessionsStore.updateCurrentUrl(detail.sessionId, rawUrl);
  }

  if (action === "add" && listId) {
    await addCurrentProductToList(rawUrl, listId);
    return;
  }

  if (action === "remove" && listId) {
    await removeCurrentProductFromList(rawUrl, listId);
    return;
  }

  if (action === "observe") {
    await observeCurrentProduct(rawUrl);
    return;
  }

  importDraftsStore.useWebviewUrl(rawUrl);
}) as unknown as (event: Event) => void;

watch(
  () => sessionsStore.settings.darkMode,
  (enabled) => {
    applyTheme(enabled);
    void setDarkMode(enabled);
  },
  { immediate: true },
);

watch(
  () => sessionsStore.settings.textZoom,
  (level) => {
    void setTextZoom(normalizeTextZoomLevel(level));
  },
  { immediate: true },
);

watch(sessionSummaries, syncNativeSessions, { deep: true });
watch(() => sessionsStore.activeSessionId, syncNativeSessions);
watch(shoppingListSummaries, syncNativeShoppingLists, { deep: true });

onMounted(() => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("temu-webview-hidden", onNativeHidden);
  window.addEventListener("temu-webview-dark-mode-changed", onNativeDarkMode);
  window.addEventListener("temu-webview-text-zoom-changed", onNativeTextZoom);
  window.addEventListener("temu-webview-capture-requested", onNativeCaptureRequested);

  if (isTauri) {
    syncNativeSessions();
    syncNativeShoppingLists();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("temu-webview-hidden", onNativeHidden);
  window.removeEventListener("temu-webview-dark-mode-changed", onNativeDarkMode);
  window.removeEventListener("temu-webview-text-zoom-changed", onNativeTextZoom);
  window.removeEventListener("temu-webview-capture-requested", onNativeCaptureRequested);
});
</script>
