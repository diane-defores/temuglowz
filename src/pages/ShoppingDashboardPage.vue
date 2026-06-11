<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import {
  captureCurrentUrl,
  closeSession as closeNativeSession,
  openSession,
  setDarkMode as setNativeDarkMode,
  setTextZoom as setNativeTextZoom,
  syncSessions,
} from "@/lib/temuWebview";
import { useImportDraftsStore } from "@/stores/importDrafts";
import { useNotificationsStore } from "@/stores/notifications";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import { normalizeTemuProductUrl } from "@/utils/url";
import type { WebviewCaptureResult } from "@/types/domain";

const TEMU_HOME_URL = "https://www.temu.com/";

const router = useRouter();
const sessionsStore = useShoppingSessionsStore();
const importDrafts = useImportDraftsStore();
const notificationsStore = useNotificationsStore();

const newSessionName = ref("");
const newSessionUrl = ref(TEMU_HOME_URL);
const renameDrafts = ref<Record<string, string>>({});
const message = ref("");
const error = ref("");

const sessions = computed(() => sessionsStore.sessionsByOrder);
const activeSession = computed(() => sessionsStore.activeSession);
const sessionSummaries = computed(() =>
  sessions.value.map((session) => ({
    id: session.id,
    name: session.name,
  })),
);

function applyBridgeState(result: { degraded: boolean; unavailable: boolean; error?: string }) {
  sessionsStore.setDegradedMode(result.degraded || result.unavailable);
  if (result.error) {
    error.value = result.error;
  }
}

async function syncNativeSessions(activeSessionId = sessionsStore.activeSessionId) {
  const result = await syncSessions({
    sessions: sessionSummaries.value,
    activeSessionId,
  });
  applyBridgeState(result);
}

async function createSession() {
  message.value = "";
  error.value = "";
  try {
    const sessionId = sessionsStore.createSession(newSessionName.value, newSessionUrl.value);
    renameDrafts.value[sessionId] = sessionsStore.getSession(sessionId)?.name ?? "";
    newSessionName.value = "";
    newSessionUrl.value = TEMU_HOME_URL;
    notificationsStore.success("Session shopping creee.");
    await launchSession(sessionId);
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de creer la session.");
  }
}

async function launchSession(sessionId: string) {
  message.value = "";
  error.value = "";
  sessionsStore.setActiveSession(sessionId);
  const session = sessionsStore.getSession(sessionId);
  if (!session) {
    return;
  }

  await syncNativeSessions(sessionId);
  const result = await openSession(
    session.id,
    session.currentUrl,
    session.name,
    sessionsStore.settings.darkMode,
    sessionsStore.settings.textZoom,
  );
  applyBridgeState(result);
  if (result.ok) {
    notificationsStore.success(`${session.name} est ouverte.`);
  } else {
    notificationsStore.warning("Mode WebView indisponible ici; l'import manuel reste disponible.");
  }
}

async function closeSession(sessionId: string) {
  const result = await closeNativeSession(sessionId);
  applyBridgeState(result);
  try {
    sessionsStore.closeSession(sessionId);
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de fermer la session.");
    return;
  }
  delete renameDrafts.value[sessionId];
  notificationsStore.success("Session fermee.");
  await syncNativeSessions();
}

async function renameSession(sessionId: string) {
  const nextName = renameDrafts.value[sessionId] ?? "";
  try {
    sessionsStore.renameSession(sessionId, nextName);
    notificationsStore.success("Nom de session mis a jour.");
    await syncNativeSessions(sessionsStore.activeSessionId);
  } catch (error) {
    notificationsStore.warning(error instanceof Error ? error.message : "Impossible de renommer cette session.");
  }
}

async function toggleDarkMode() {
  const enabled = !sessionsStore.settings.darkMode;
  sessionsStore.setDarkMode(enabled);
  const result = await setNativeDarkMode(enabled);
  applyBridgeState(result);
}

async function changeTextZoom(event: Event) {
  const input = event.target as HTMLInputElement;
  const level = Number(input.value);
  sessionsStore.setTextZoom(level);
  const result = await setNativeTextZoom(sessionsStore.settings.textZoom);
  applyBridgeState(result);
}

function captureFromRawUrl(rawUrl: string): WebviewCaptureResult {
  const parsed = normalizeTemuProductUrl(rawUrl);
  if (!parsed) {
    return {
      ok: false,
      source: "webview",
      reason: "invalid_url",
      rawUrl,
      error: "Cette page Temu ne ressemble pas à une fiche produit.",
    };
  }

  return {
    ok: true,
    source: "webview",
    rawUrl: parsed.originalUrl,
    canonicalUrl: parsed.canonicalUrl,
    capturedAt: Date.now(),
  };
}

async function saveCapture(result: WebviewCaptureResult) {
  if (!result.ok) {
    notificationsStore.warning(result.error ?? "Impossible d'enregistrer cette page.");
    return;
  }

  const sessionId = sessionsStore.activeSessionId;
  if (sessionId) {
    sessionsStore.recordCapture(sessionId, result);
  }
  importDrafts.useWebviewUrl(result.rawUrl);
  notificationsStore.success("Produit capture. Verifiez-le avant enregistrement.");
  await router.push({ name: "import-review" });
}

async function captureActiveSession() {
  message.value = "";
  error.value = "";
  const result = await captureCurrentUrl();
  applyBridgeState(result);
  await saveCapture(result);
}

function handleCaptureEvent(event: Event) {
  const custom = event as CustomEvent<{ url?: string; sessionId?: string }>;
  const url = custom.detail?.url;
  if (!url) {
    notificationsStore.warning("Aucune URL WebView a enregistrer.");
    return;
  }

  saveCapture(captureFromRawUrl(url)).catch((caught) => {
    notificationsStore.error(caught instanceof Error ? caught.message : String(caught));
  });
}

function handleUrlChangedEvent(event: Event) {
  const custom = event as CustomEvent<{ url?: string; sessionId?: string; degraded?: boolean }>;
  if (custom.detail?.degraded) {
    sessionsStore.setDegradedMode(true);
  }
  if (!custom.detail?.url || !custom.detail.sessionId) {
    return;
  }

  try {
    sessionsStore.updateCurrentUrl(custom.detail.sessionId, custom.detail.url);
  } catch {
    // The native allowlist already blocks unsafe navigations; ignore stale event data.
  }
}

function handleDarkModeChangedEvent(event: Event) {
  const custom = event as CustomEvent<{ enabled?: boolean }>;
  if (typeof custom.detail?.enabled === "boolean") {
    sessionsStore.setDarkMode(custom.detail.enabled);
  }
}

function handleTextZoomChangedEvent(event: Event) {
  const custom = event as CustomEvent<{ level?: number }>;
  if (typeof custom.detail?.level === "number") {
    sessionsStore.setTextZoom(custom.detail.level);
  }
}

onMounted(() => {
  sessions.value.forEach((session) => {
    renameDrafts.value[session.id] = session.name;
  });
  window.addEventListener("temu-webview-capture-requested", handleCaptureEvent);
  window.addEventListener("temu-webview-url-changed", handleUrlChangedEvent);
  window.addEventListener("temu-webview-dark-mode-changed", handleDarkModeChangedEvent);
  window.addEventListener("temu-webview-text-zoom-changed", handleTextZoomChangedEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener("temu-webview-capture-requested", handleCaptureEvent);
  window.removeEventListener("temu-webview-url-changed", handleUrlChangedEvent);
  window.removeEventListener("temu-webview-dark-mode-changed", handleDarkModeChangedEvent);
  window.removeEventListener("temu-webview-text-zoom-changed", handleTextZoomChangedEvent);
});
</script>

<template>
  <section class="panel">
    <div class="row split-row">
      <div>
        <h2>Shopping Temu</h2>
        <p class="muted">
          Indépendant de Temu. Les sessions WebView restent locales.
        </p>
      </div>
      <span
        v-if="sessionsStore.degradedMode"
        class="status-pill blocked"
      >WebView dégradée</span>
      <span
        v-else
        class="status-pill"
      >Prêt</span>
    </div>

    <div class="session-create">
      <label>
        Nom
        <input
          v-model="newSessionName"
          placeholder="Cuisine"
        >
      </label>
      <label>
        URL
        <input
          v-model="newSessionUrl"
          class="session-url-input"
        >
      </label>
      <button
        type="button"
        @click="createSession"
      >
        Nouvelle session
      </button>
    </div>
  </section>

  <section class="panel">
    <div class="row split-row">
      <h2>Sessions</h2>
      <div class="actions">
        <button
          type="button"
          @click="toggleDarkMode"
        >
          {{ sessionsStore.settings.darkMode ? "Mode clair" : "Mode sombre" }}
        </button>
        <label class="zoom-control">
          Texte {{ sessionsStore.settings.textZoom }}%
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            :value="sessionsStore.settings.textZoom"
            @input="changeTextZoom"
          >
        </label>
      </div>
    </div>

    <div
      v-if="sessions.length === 0"
      class="notice"
    >
      <strong>Aucune session.</strong>
    </div>

    <div class="card-list">
      <article
        v-for="session in sessions"
        :key="session.id"
        class="list-card"
      >
        <div class="row split-row">
          <div>
            <strong>{{ session.name }}</strong>
            <p class="muted">
              {{ session.currentUrl }}
            </p>
          </div>
          <span
            v-if="activeSession?.id === session.id"
            class="status-pill"
          >Active</span>
        </div>

        <div class="session-edit-row">
          <input v-model="renameDrafts[session.id]">
          <button
            type="button"
            @click="renameSession(session.id)"
          >
            Renommer
          </button>
        </div>

        <div class="actions">
          <button
            type="button"
            @click="launchSession(session.id)"
          >
            Ouvrir
          </button>
          <button
            type="button"
            :disabled="activeSession?.id !== session.id"
            @click="captureActiveSession"
          >
            Enregistrer la page
          </button>
          <button
            type="button"
            class="danger-button"
            @click="closeSession(session.id)"
          >
            Fermer
          </button>
        </div>
      </article>
    </div>

    <p
      v-if="error"
      class="danger"
    >
      {{ error }}
    </p>
  </section>
</template>
