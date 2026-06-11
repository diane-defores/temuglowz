<template>
  <div class="webview-host">
    <div
      v-if="!isTauri || sessionsStore.degradedMode"
      class="dev-placeholder"
    >
      <div class="placeholder-content">
        <span class="placeholder-icon">
          <i class="pi pi-desktop" />
        </span>
        <p class="placeholder-title">
          {{ session?.name ?? "Session shopping" }}
        </p>
        <p class="placeholder-url">
          {{ session?.currentUrl ?? "https://www.temu.com/" }}
        </p>
        <p class="hint">
          Sur Android, la WebView native Temu s'affiche au-dessus de cette zone. Le mode navigateur garde la shell visible.
        </p>
        <div class="placeholder-actions">
          <button
            class="placeholder-btn"
            type="button"
            @click="captureProduct"
          >
            <i class="pi pi-bookmark" />
            <span>Capturer le produit</span>
          </button>
          <button
            class="placeholder-btn secondary"
            type="button"
            @click="$emit('open-settings')"
          >
            <i class="pi pi-cog" />
            <span>Paramètres</span>
          </button>
          <button
            class="placeholder-btn secondary"
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
  sessionsStore.setDegradedMode(result.degraded);

  await syncSessions({
    sessions: sessionSummaries.value,
    activeSessionId: active.id,
  }).catch(() => {
    sessionsStore.setDegradedMode(true);
  });
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

<style scoped>
.webview-host {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
}

.dev-placeholder {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  color: var(--text-color);
  background:
    radial-gradient(circle at 15% 20%, rgba(249, 115, 22, 0.14), transparent 28%),
    var(--surface-ground);
}

.placeholder-content {
  width: min(34rem, 100%);
  text-align: center;
  padding: 1.5rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 18px;
  box-shadow: var(--card-shadow);
}

.placeholder-icon {
  display: inline-flex;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #06b6d4);
}

.placeholder-icon i {
  font-size: 2rem;
}

.placeholder-title {
  margin: 1rem 0 0.25rem;
  font-size: 1.3rem;
  font-weight: 800;
}

.placeholder-url {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-color-secondary);
  overflow-wrap: anywhere;
}

.hint {
  margin: 1rem 0;
  color: var(--text-color-secondary);
  line-height: 1.45;
}

.placeholder-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
}

.placeholder-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.5rem;
  padding: 0 0.9rem;
  border: 1px solid var(--primary-color);
  border-radius: 999px;
  color: #fff;
  background: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
}

.placeholder-btn.secondary {
  color: var(--text-color);
  background: var(--surface-card);
  border-color: var(--surface-border);
}

</style>
