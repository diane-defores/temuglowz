<template>
  <div class="webview-host">
    <div
      v-if="!isTauri || sessionsStore.degradedMode"
      class="webview-dev-placeholder"
    >
      <div class="webview-placeholder-content">
        <span class="webview-placeholder-icon">
          <i class="pi pi-desktop" />
        </span>
        <p class="webview-placeholder-title">
          {{ session?.name ?? "Session shopping" }}
        </p>
        <p class="webview-placeholder-url">
          {{ session?.currentUrl ?? "https://www.temu.com/" }}
        </p>
        <p class="webview-placeholder-hint">
          Sur Android, la WebView native Temu s'affiche au-dessus de cette zone. Le mode navigateur garde la shell visible.
        </p>
        <div class="webview-placeholder-actions">
          <button
            class="webview-placeholder-btn"
            type="button"
            @click="captureProduct"
          >
            <i class="pi pi-bookmark" />
            <span>Capturer le produit</span>
          </button>
          <button
            class="webview-placeholder-btn webview-placeholder-btn--secondary"
            type="button"
            @click="$emit('open-settings')"
          >
            <i class="pi pi-cog" />
            <span>Paramètres</span>
          </button>
          <button
            class="webview-placeholder-btn webview-placeholder-btn--secondary"
            type="button"
            @click="$emit('close')"
          >
            <i class="pi pi-home" />
            <span>Accueil</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";
import { useNotificationsStore } from "@/stores/notifications";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import {
  captureCurrentUrl,
  openSession,
  syncSessions,
} from "@/lib/temuWebview";

const props = defineProps<{
  sessionId: string;
}>();

const emit = defineEmits<{
  close: [];
  "open-settings": [];
}>();

const router = useRouter();
const sessionsStore = useShoppingSessionsStore();
const importDraftsStore = useImportDraftsStore();
const notificationsStore = useNotificationsStore();
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const session = computed(() => sessionsStore.getSession(props.sessionId));
const sessionSummaries = computed(() =>
  sessionsStore.sessionsByOrder.map((value) => ({
    id: value.id,
    name: value.name,
  })),
);

async function syncActiveSession(): Promise<void> {
  const active = session.value;
  if (!active) {
    return;
  }

  const result = await openSession(
    active.id,
    active.currentUrl || active.startUrl,
    active.name,
    sessionsStore.settings.darkMode,
    sessionsStore.settings.textZoom,
  );
  sessionsStore.setDegradedMode(result.unavailable);

  const syncResult = await syncSessions({
    sessions: sessionSummaries.value,
    activeSessionId: active.id,
  });
  sessionsStore.setDegradedMode(syncResult.unavailable);
}

async function captureProduct(): Promise<void> {
  const active = session.value;
  if (!active) {
    return;
  }

  const result = await captureCurrentUrl();
  if (!result.ok) {
    notificationsStore.warning(result.error ?? "Aucune URL de produit Temu disponible dans cette session.");
    return;
  }

  sessionsStore.updateCurrentUrl(active.id, result.canonicalUrl);
  sessionsStore.recordCapture(active.id, result);
  importDraftsStore.useWebviewUrl(result.canonicalUrl);
  notificationsStore.success("Produit capture. Verifiez-le avant enregistrement.");
  emit("close");
  await router.push({ name: "import-review" });
}

watch(
  [
    () => props.sessionId,
    () => session.value?.currentUrl,
    () => sessionsStore.settings.darkMode,
    () => sessionsStore.settings.textZoom,
  ],
  () => {
    void syncActiveSession();
  },
  { immediate: true },
);
</script>
