<template>
  <div class="app-root">
    <RouterView />
    <AppNotifications />
    <PostAuthSyncFeedback />

    <Transition name="sheet">
      <div
        v-if="exitConfirmVisible"
        class="app-exit-confirm-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-exit-confirm-title"
      >
        <section class="app-exit-confirm-panel">
          <div class="canonical-title-block">
            <span class="canonical-kicker">Navigation</span>
            <h2
              id="app-exit-confirm-title"
              class="canonical-title"
            >
              Quitter l'application ?
            </h2>
            <p class="canonical-muted">
              Appuyez sur Annuler pour rester dans vos listes shopping.
            </p>
          </div>
          <div class="canonical-actions">
            <button
              class="canonical-button canonical-button--ghost"
              type="button"
              @click="hideExitConfirm"
            >
              <i class="pi pi-times" />
              <span>Annuler</span>
            </button>
            <button
              class="canonical-button canonical-button--danger"
              type="button"
              @click="confirmExit"
            >
              <i class="pi pi-sign-out" />
              <span>Quitter</span>
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import AppNotifications from "@/components/AppNotifications.vue";
import PostAuthSyncFeedback from "@/components/PostAuthSyncFeedback.vue";

const exitConfirmVisible = ref(false);
const shouldCloseAfterConfirm = ref(false);

function pushExitGuardState(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.history.pushState(
    { ...(window.history.state ?? {}), temuExitGuard: true },
    "",
    window.location.href,
  );
}

function showExitConfirm(): void {
  exitConfirmVisible.value = true;
}

function hideExitConfirm(): void {
  exitConfirmVisible.value = false;
}

async function confirmExit(): Promise<void> {
  shouldCloseAfterConfirm.value = true;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().close();
  } catch {
    window.close();
  }
}

function handleHistoryBackAttempt(event: PopStateEvent): void {
  if (shouldCloseAfterConfirm.value) {
    return;
  }

  if (event.state?.temuExitGuard) {
    hideExitConfirm();
    return;
  }

  showExitConfirm();
  pushExitGuardState();
}

onMounted(() => {
  pushExitGuardState();
  window.addEventListener("popstate", handleHistoryBackAttempt);
});

onUnmounted(() => {
  window.removeEventListener("popstate", handleHistoryBackAttempt);
});
</script>
