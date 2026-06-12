<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="sheet-overlay"
        @click.self="closeSheet"
      >
        <div
          ref="sheetRef"
          class="settings-panel settings-sheet"
          :class="{ 'is-dark': sessionsStore.settings.darkMode }"
          :style="sheetStyle"
        >
          <div
            class="sheet-drag-zone"
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragCancel"
          >
            <div class="sheet-handle" />
            <div class="sheet-header">
              <span class="sheet-title">Paramètres</span>
              <button
                class="sheet-close-btn"
                type="button"
                @click="closeSheet"
              >
                <i class="pi pi-times" />
              </button>
            </div>
          </div>

          <div class="settings-content">
            <p class="settings-section-label">Sessions shopping</p>
            <div class="settings-account-card">
              <p class="settings-account-hint">
                Listes shopping Temu est indépendante de Temu. Les sessions WebView, cookies et liens capturés restent en local.
              </p>
              <div class="settings-account-actions-row">
                <span class="settings-account-status connected">
                  {{ sessionCountLabel }}
                </span>
                <RouterLink
                  class="settings-sync-toggle"
                  :to="{ name: 'shopping-shell' }"
                  @click="closeSheet"
                >
                  <span>Ouvrir les listes</span>
                  <i class="pi pi-chevron-right" />
                </RouterLink>
              </div>
            </div>

            <p class="settings-section-label">Compte cloud</p>
            <div class="settings-account-card">
              <p class="settings-account-hint">
                Le compte sert uniquement à identifier la synchronisation premium. Les listes locales restent disponibles sans connexion.
              </p>

              <div
                v-if="!isSignedIn"
                class="settings-auth-form"
              >
                <label class="settings-auth-field">
                  <span>Email</span>
                  <input
                    v-model="accountEmail"
                    autocomplete="email"
                    inputmode="email"
                    placeholder="email@example.com"
                    type="email"
                  />
                </label>
                <label class="settings-auth-field">
                  <span>Mot de passe</span>
                  <input
                    v-model="accountPassword"
                    autocomplete="current-password"
                    type="password"
                  />
                </label>
                <p
                  v-if="accountError"
                  class="settings-auth-error"
                >
                  {{ accountError }}
                </p>
                <div class="settings-account-actions-row">
                  <span class="settings-account-status">{{ authStatusLabel }}</span>
                  <div class="settings-auth-actions">
                    <button
                      class="settings-sync-toggle"
                      type="button"
                      :disabled="accountBusy || !canSubmitAccount"
                      @click="handleAccountAuth('signIn')"
                    >
                      <i class="pi pi-sign-in" />
                      <span>Connexion</span>
                    </button>
                    <button
                      class="settings-sync-toggle"
                      type="button"
                      :disabled="accountBusy || !canSubmitAccount"
                      @click="handleAccountAuth('signUp')"
                    >
                      <i class="pi pi-user-plus" />
                      <span>Créer</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="settings-account-actions-row"
              >
                <span class="settings-account-status connected">Connecté</span>
                <button
                  class="settings-sync-toggle"
                  type="button"
                  :disabled="accountBusy"
                  @click="handleAccountSignOut"
                >
                  <i class="pi pi-sign-out" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>

            <p class="settings-section-label">Préférences</p>

            <div class="settings-toggle-row">
              <span class="settings-toggle-label">
                <i class="pi pi-moon" />
                Mode sombre
              </span>
              <button
                class="settings-toggle-pill"
                :class="{ enabled: sessionsStore.settings.darkMode }"
                type="button"
                @click="toggleDarkMode"
              >
                <span class="toggle-thumb" />
              </button>
            </div>

            <div class="settings-toggle-row">
              <span class="settings-toggle-label">
                <i class="pi pi-eye-slash" />
                Masquer les pop-ups Temu
              </span>
              <button
                class="settings-toggle-pill"
                :class="{ enabled: sessionsStore.settings.hideTemuClutter !== false }"
                type="button"
                @click="toggleHideTemuClutter"
              >
                <span class="toggle-thumb" />
              </button>
            </div>

            <div class="settings-toggle-row">
              <span class="settings-toggle-label">
                <i class="pi pi-search-plus" />
                Taille du texte
              </span>
              <span class="text-zoom-value">{{ textZoomLevel }}%</span>
            </div>
            <input
              v-model.number="textZoomLevel"
              type="range"
              class="text-zoom-slider"
              :min="TEXT_ZOOM_MIN"
              :max="TEXT_ZOOM_MAX"
              :step="TEXT_ZOOM_STEP"
              @change="onTextZoomChange"
            />

            <div class="settings-route-grid">
              <RouterLink
                class="settings-route-link"
                :to="{ name: 'manual-import' }"
                @click="closeSheet"
              >
                <i class="pi pi-link" />
                <span>Import manuel</span>
              </RouterLink>
              <RouterLink
                class="settings-route-link"
                :to="{ name: 'sync' }"
                @click="closeSheet"
              >
                <i class="pi pi-cloud-upload" />
                <span>Synchronisation</span>
              </RouterLink>
            </div>

            <p class="settings-section-label">Support</p>
            <div class="settings-account-card">
              <p class="settings-account-hint">Diagnostic de cette installation.</p>
              <div class="settings-account-actions-row">
                <span class="settings-account-status">{{ buildIdentityLabel }}</span>
                <button
                  class="settings-sync-toggle"
                  type="button"
                  @click="copyDiagnostics"
                >
                  <i
                    class="pi"
                    :class="diagnosticsCopied ? 'pi-check' : 'pi-copy'"
                  />
                  <span>{{ diagnosticsCopied ? "Copié" : "Copier" }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import { buildDiagnosticsReport, buildIdentityHeader } from "@/lib/buildDiagnostics";
import {
  authBootstrapError,
  isAuthenticated,
  isAuthLoading,
  isConvexConfigured,
  signIn,
  signOut as convexSignOut,
} from "@/lib/convexAuth";
import { finalizePasswordSignIn, getStoredCloudAccountEmail } from "@/lib/cloudSync";
import {
  beginPostAuthSyncFeedback,
  resetPostAuthSyncFeedback,
} from "@/lib/postAuthSyncFeedback";
import {
  getWebviewDiagnostics,
  setDarkMode,
  setHideTemuClutter,
  setTextZoom,
} from "@/lib/temuWebview";
import {
  TEXT_ZOOM_MAX,
  TEXT_ZOOM_MIN,
  TEXT_ZOOM_STEP,
  normalizeTextZoomLevel,
} from "../utils/textZoom";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const sessionsStore = useShoppingSessionsStore();
const textZoomLevel = ref(normalizeTextZoomLevel(sessionsStore.settings.textZoom));
const diagnosticsCopied = ref(false);
const accountEmail = ref(getStoredCloudAccountEmail());
const accountPassword = ref("");
const accountBusy = ref(false);
const accountError = ref("");
const isSignedIn = isAuthenticated;

const sessionCountLabel = computed(() => {
  const count = sessionsStore.sessionsByOrder.length;
  return count === 1 ? "1 session" : `${count} sessions`;
});
const buildIdentityLabel = computed(() => buildIdentityHeader()[0].replace("commit/build: ", ""));
const authStatusLabel = computed(() => {
  if (isAuthLoading.value) {
    return "Connexion...";
  }
  if (!isConvexConfigured.value) {
    return "Non configuré";
  }
  if (authBootstrapError.value) {
    return "Indisponible";
  }
  return "Local";
});
const canSubmitAccount = computed(() => {
  return (
    isConvexConfigured.value
    && !isAuthLoading.value
    && accountEmail.value.trim().length > 3
    && accountPassword.value.length >= 8
  );
});

function getAccountErrorMessage(error: unknown, flow: "signIn" | "signUp"): string {
  const message = error instanceof Error ? error.message : "";
  if (flow === "signUp" && /already exists/i.test(message)) {
    return "Ce compte existe déjà.";
  }
  if (flow === "signIn" && /invalid/i.test(message)) {
    return "Identifiants invalides.";
  }
  return message || "Connexion impossible pour le moment.";
}

async function handleAccountAuth(flow: "signIn" | "signUp"): Promise<void> {
  accountError.value = "";
  accountBusy.value = true;
  try {
    const normalizedEmail = accountEmail.value.trim().toLowerCase();
    accountEmail.value = normalizedEmail;
    beginPostAuthSyncFeedback();
    await signIn("password", {
      email: normalizedEmail,
      password: accountPassword.value,
      flow,
    });
    accountPassword.value = "";
    await finalizePasswordSignIn({
      email: normalizedEmail,
      flow,
    });
  } catch (error) {
    resetPostAuthSyncFeedback();
    accountError.value = getAccountErrorMessage(error, flow);
  } finally {
    accountBusy.value = false;
  }
}

async function handleAccountSignOut(): Promise<void> {
  accountBusy.value = true;
  accountError.value = "";
  try {
    await convexSignOut();
  } catch (error) {
    accountError.value = error instanceof Error ? error.message : "Déconnexion impossible.";
  } finally {
    accountBusy.value = false;
  }
}

function closeSheet(): void {
  emit("update:modelValue", false);
}

function toggleDarkMode(): void {
  const next = !sessionsStore.settings.darkMode;
  sessionsStore.setDarkMode(next);
  void setDarkMode(next);
}

function onTextZoomChange(): void {
  const level = normalizeTextZoomLevel(textZoomLevel.value);
  textZoomLevel.value = level;
  sessionsStore.setTextZoom(level);
  void setTextZoom(level);
}

function toggleHideTemuClutter(): void {
  const next = sessionsStore.settings.hideTemuClutter === false;
  sessionsStore.setHideTemuClutter(next);
  void setHideTemuClutter(next);
}

async function copyDiagnostics(): Promise<void> {
  const webviewDiagnostics = await getWebviewDiagnostics();
  const report = buildDiagnosticsReport({
    sessions_count: String(sessionsStore.sessionsByOrder.length),
    dark_mode: String(sessionsStore.settings.darkMode),
    text_zoom: String(textZoomLevel.value),
    hide_temu_clutter: String(sessionsStore.settings.hideTemuClutter !== false),
    auth_configured: String(isConvexConfigured.value),
    auth_authenticated: String(isAuthenticated.value),
    auth_loading: String(isAuthLoading.value),
    auth_error: authBootstrapError.value ?? "none",
    webview_available: String(webviewDiagnostics.available),
    webview_multi_profile_supported: String(webviewDiagnostics.multiProfileSupported),
    webview_multi_profile_enabled: String(webviewDiagnostics.multiProfileEnabled),
    webview_profile_degraded: String(webviewDiagnostics.profileDegraded),
    webview_active_session: webviewDiagnostics.activeSessionId ?? "none",
    webview_active_profile: webviewDiagnostics.activeProfileName ?? "none",
    webview_active_host: webviewDiagnostics.activeHost ?? "none",
    webview_warm_hosts: String(webviewDiagnostics.warmHostCount),
    webview_known_sessions: String(webviewDiagnostics.knownSessionCount),
    webview_dom_storage: String(webviewDiagnostics.domStorageEnabled ?? "unknown"),
    webview_database: String(webviewDiagnostics.databaseEnabled ?? "unknown"),
    webview_mixed_content_mode: String(webviewDiagnostics.mixedContentMode ?? "unknown"),
    webview_javascript: String(webviewDiagnostics.javaScriptEnabled ?? "unknown"),
    webview_accept_cookie: String(webviewDiagnostics.acceptCookie),
    webview_accept_third_party_cookies: String(webviewDiagnostics.acceptThirdPartyCookies ?? "unknown"),
    webview_hide_temu_clutter: String(webviewDiagnostics.hideTemuClutter),
    webview_error: webviewDiagnostics.error ?? "none",
  });

  try {
    await navigator.clipboard.writeText(report);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = report;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  diagnosticsCopied.value = true;
  window.setTimeout(() => {
    diagnosticsCopied.value = false;
  }, 2000);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      textZoomLevel.value = normalizeTextZoomLevel(sessionsStore.settings.textZoom);
      dragOffset.value = 0;
      isDragging.value = false;
      activePointerId.value = null;
    }
  },
);

const sheetRef = ref<HTMLElement | null>(null);
const dragOffset = ref(0);
const isDragging = ref(false);
const activePointerId = ref<number | null>(null);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const sheetStyle = computed(() => ({
  "--sheet-drag-offset": `${dragOffset.value}px`,
  transition: isDragging.value ? "none" : "transform 250ms ease",
}));

function getDismissThreshold(): number {
  const sheetHeight = sheetRef.value?.offsetHeight ?? window.innerHeight * 0.5;
  return Math.min(140, Math.max(72, sheetHeight * 0.2));
}

function shouldIgnoreDragStart(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest("button, a, input, textarea, select, label, [role='button']"));
}

function onDragStart(event: PointerEvent): void {
  if (!props.modelValue || !event.isPrimary) {
    return;
  }
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  if (shouldIgnoreDragStart(event.target)) {
    return;
  }

  isDragging.value = true;
  activePointerId.value = event.pointerId;
  dragStartY.value = event.clientY;
  dragStartTime.value = event.timeStamp || performance.now();
  dragOffset.value = 0;
  (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
}

function onDragMove(event: PointerEvent): void {
  if (!isDragging.value || event.pointerId !== activePointerId.value) {
    return;
  }

  const nextOffset = Math.max(0, event.clientY - dragStartY.value);
  dragOffset.value = nextOffset;
  if (nextOffset > 0) {
    event.preventDefault();
  }
}

function finishDrag(event?: PointerEvent): void {
  if (!isDragging.value) {
    return;
  }
  if (event && event.pointerId !== activePointerId.value) {
    return;
  }

  const elapsed = Math.max(1, (event?.timeStamp || performance.now()) - dragStartTime.value);
  const velocity = dragOffset.value / elapsed;
  const shouldClose = dragOffset.value >= getDismissThreshold() || velocity >= 0.6;

  isDragging.value = false;
  activePointerId.value = null;

  if (shouldClose) {
    closeSheet();
    window.setTimeout(() => {
      dragOffset.value = 0;
    }, 250);
    return;
  }

  dragOffset.value = 0;
}

function onDragEnd(event: PointerEvent): void {
  finishDrag(event);
}

function onDragCancel(event: PointerEvent): void {
  finishDrag(event);
}
</script>
