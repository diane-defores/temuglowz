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
    <TemuOnboardingOverlay
      v-model="onboardingVisible"
      @open-session="openShoppingSession"
      @open-settings="settingsVisible = true"
    />
    <ExtensionOverlay
      v-model="extensionOverlayVisible"
      @added-to-list="onExtensionAddedToList"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";
import { useNotificationsStore } from "@/stores/notifications";
import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import {
  captureCurrentUrl,
  hideWebview,
  openSession,
  setDarkMode,
  setHideTemuClutter,
  setTextZoom,
  syncShoppingLists,
  syncSessions,
} from "@/lib/temuWebview";
import type { ShoppingSession } from "@/types/domain";

import "./assets/main.css";

import AppHeader from "./components/AppHeader.vue";
import AppRightSidebar from "./components/AppRightSidebar.vue";
import AppSidebar from "./components/AppSidebar.vue";
import ExtensionOverlay from "./components/ExtensionOverlay.vue";
import MobileLayout from "./components/MobileLayout.vue";
import MobileSettingsSheet from "./components/MobileSettingsSheet.vue";
import NetworkWebviewHost from "./components/NetworkWebviewHost.vue";
import TemuOnboardingOverlay from "./components/TemuOnboardingOverlay.vue";
import { TEXT_ZOOM_DEFAULT, normalizeTextZoomLevel } from "./utils/textZoom";

const INVALID_PRODUCT_PAGE_MESSAGE = "Cette action fonctionne seulement sur une fiche produit Temu. Ouvrez un produit, puis réessayez.";

const sidebarVisible = ref(true);
const rightSidebarVisible = ref(true);
const settingsVisible = ref(false);
const onboardingVisible = ref(false);
const activeWebviewSessionId = ref<string | null>(null);
const extensionOverlayVisible = ref(false);
const route = useRoute();
const router = useRouter();
const importDraftsStore = useImportDraftsStore();
const notificationsStore = useNotificationsStore();
const productObservationsStore = useProductObservationsStore();
const productSnapshotsStore = useProductSnapshotsStore();
const shoppingListsStore = useShoppingListsStore();
const sessionsStore = useShoppingSessionsStore();

const isMobile = ref(typeof window !== "undefined" ? window.innerWidth <= 768 : true);
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const hasShownDegradedNotice = ref(false);

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

function showInfo(message: string): void {
  notificationsStore.info(message);
}

function syncNativeSessions(): void {
  syncSessions({
    sessions: sessionSummaries.value,
    activeSessionId: sessionsStore.activeSessionId,
  }).then((result) => {
    sessionsStore.setDegradedMode(result.unavailable);
    if (!result.ok && result.unavailable && !hasShownDegradedNotice.value) {
      notificationsStore.warning("La WebView native est indisponible pour le moment. L'import manuel reste disponible.");
      hasShownDegradedNotice.value = true;
    }
  }).catch(() => {
    sessionsStore.setDegradedMode(true);
    if (!hasShownDegradedNotice.value) {
      notificationsStore.warning("La WebView est indisponible pour le moment. L'import manuel reste disponible.");
      hasShownDegradedNotice.value = true;
    }
  });
}

function syncNativeShoppingLists(): void {
  syncShoppingLists(shoppingListSummaries.value).then((result) => {
    sessionsStore.setDegradedMode(result.unavailable);
    if (!result.ok && result.unavailable && !hasShownDegradedNotice.value) {
      notificationsStore.warning("La synchronisation native est indisponible pour le moment.");
      hasShownDegradedNotice.value = true;
    }
  }).catch(() => {
    sessionsStore.setDegradedMode(true);
    if (!hasShownDegradedNotice.value) {
      notificationsStore.warning("La synchronisation de la WebView est indisponible pour le moment.");
      hasShownDegradedNotice.value = true;
    }
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
    sessionsStore.settings.hideTemuClutter,
  );
  sessionsStore.setDegradedMode(result.unavailable);
  if (!result.ok) {
    notificationsStore.warning(result.error ?? "Impossible d'ouvrir cette session dans la WebView pour le moment.");
  }
  syncNativeSessions();
}

async function consumePendingSessionOpen(): Promise<void> {
  const requestedSessionId = route.query.openSession;
  if (typeof requestedSessionId !== "string") {
    return;
  }

  if (!sessionsStore.getSession(requestedSessionId)) {
    await router.replace({ name: "shopping-shell" });
    return;
  }

  await openShoppingSession(requestedSessionId);
  await router.replace({ name: "shopping-shell" });
}

async function returnHome(): Promise<void> {
  activeWebviewSessionId.value = null;
  const result = await hideWebview();
  sessionsStore.setDegradedMode(result.unavailable);
  if (!result.ok && result.error) {
    notificationsStore.warning(result.error);
  }
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
    showInfo(INVALID_PRODUCT_PAGE_MESSAGE);
    return null;
  }

  return captured.rawUrl;
}

async function addCurrentProductToList(rawUrl: string, listId: string): Promise<void> {
  const targetList = shoppingListsStore.getList(listId);
  if (!targetList) {
    notificationsStore.error("Impossible d'ajouter le produit : liste introuvable.");
    return;
  }

  let draft;
  try {
    draft = importDraftsStore.useWebviewUrl(rawUrl);
  } catch {
    notificationsStore.warning(INVALID_PRODUCT_PAGE_MESSAGE);
    return;
  }

  const duplicateItemId = shoppingListsStore.findDuplicateByCanonicalOrProductId(listId, {
    canonicalUrl: draft.canonicalUrl,
  });

  if (duplicateItemId) {
    const existing = shoppingListsStore.items[duplicateItemId];
    if (existing) {
      shoppingListsStore.setItemQuantity(listId, duplicateItemId, existing.quantity + 1);
    }
    importDraftsStore.clearDraft();
    notificationsStore.success(`Quantite augmentee dans ${targetList.name}.`);
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
  notificationsStore.success(`Produit ajoute a ${targetList.name}.`);
}

async function removeCurrentProductFromList(rawUrl: string, listId: string): Promise<void> {
  const targetList = shoppingListsStore.getList(listId);
  if (!targetList) {
    notificationsStore.error("Impossible de retirer le produit : liste introuvable.");
    return;
  }

  let draft;
  try {
    draft = importDraftsStore.useWebviewUrl(rawUrl);
  } catch {
    notificationsStore.warning(INVALID_PRODUCT_PAGE_MESSAGE);
    return;
  }
  const duplicateItemId = shoppingListsStore.findDuplicateByCanonicalOrProductId(listId, {
    canonicalUrl: draft.canonicalUrl,
  });

  if (duplicateItemId) {
    shoppingListsStore.removeItem(listId, duplicateItemId);
    notificationsStore.success(`Produit retire de ${targetList.name}.`);
  } else {
    notificationsStore.info("Ce produit n'etait pas present dans cette liste.");
  }
  importDraftsStore.clearDraft();
}

function resolveTargetListIds(detail: Record<string, unknown>): string[] {
  if (Array.isArray(detail.listIds)) {
    return detail.listIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }

  return typeof detail.listId === "string" && detail.listId.trim() ? [detail.listId] : [];
}

async function observeCurrentProduct(rawUrl: string): Promise<void> {
  let draft;
  try {
    draft = importDraftsStore.useWebviewUrl(rawUrl);
  } catch {
    showInfo(INVALID_PRODUCT_PAGE_MESSAGE);
    return;
  }
  const snapshot = productSnapshotsStore.findDuplicateByUrlOrProductId(draft.canonicalUrl);

  if (!snapshot) {
    notificationsStore.info("Produit capture. Completez les details avant d'ajouter une observation.");
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
  notificationsStore.success("Observation ouverte pour ce produit.");
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
  const listIds = resolveTargetListIds(detail);
  const rawUrl = await resolveCaptureUrl(detail);

  if (!rawUrl) {
    return;
  }

  if (typeof detail.sessionId === "string") {
    sessionsStore.updateCurrentUrl(detail.sessionId, rawUrl);
  }

  try {
    if (action === "add") {
      if (!listIds.length) {
        notificationsStore.error("Impossible d'ajouter le produit : aucune liste cible n'a ete transmise.");
        return;
      }
      for (const listId of listIds) {
        await addCurrentProductToList(rawUrl, listId);
      }
      return;
    }

    if (action === "remove") {
      if (!listIds.length) {
        notificationsStore.error("Impossible de retirer le produit : aucune liste cible n'a ete transmise.");
        return;
      }
      for (const listId of listIds) {
        await removeCurrentProductFromList(rawUrl, listId);
      }
      return;
    }

    if (action === "observe") {
      await observeCurrentProduct(rawUrl);
      return;
    }
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "L'action WebView n'a pas pu aboutir.");
    return;
  }

  try {
    importDraftsStore.useWebviewUrl(rawUrl);
  } catch {
    showInfo(INVALID_PRODUCT_PAGE_MESSAGE);
  }
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
watch(
  () => sessionsStore.settings.hideTemuClutter,
  (enabled) => {
    void setHideTemuClutter(enabled !== false);
  },
  { immediate: true },
);

watch(sessionSummaries, syncNativeSessions, { deep: true });
watch(() => sessionsStore.activeSessionId, syncNativeSessions);
watch(shoppingListSummaries, syncNativeShoppingLists, { deep: true });
watch(
  () => route.query.openSession,
  () => {
    void consumePendingSessionOpen();
  },
);

onMounted(() => {
  onboardingVisible.value = !sessionsStore.settings.onboardingCompleted
    && !sessionsStore.settings.onboardingDismissed;
  window.addEventListener("resize", handleResize);
  window.addEventListener("temu-webview-hidden", onNativeHidden);
  window.addEventListener("temu-webview-dark-mode-changed", onNativeDarkMode);
  window.addEventListener("temu-webview-text-zoom-changed", onNativeTextZoom);
  window.addEventListener("temu-webview-capture-requested", onNativeCaptureRequested);

  if (isTauri) {
    syncNativeSessions();
    syncNativeShoppingLists();
  }

  void consumePendingSessionOpen();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("temu-webview-hidden", onNativeHidden);
  window.removeEventListener("temu-webview-dark-mode-changed", onNativeDarkMode);
  window.removeEventListener("temu-webview-text-zoom-changed", onNativeTextZoom);
  window.removeEventListener("temu-webview-capture-requested", onNativeCaptureRequested);
});

function onExtensionAddedToList(): void {
  extensionOverlayVisible.value = false;
}
</script>
