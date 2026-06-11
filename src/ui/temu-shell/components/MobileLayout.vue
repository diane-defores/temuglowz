<template>
  <div
    class="mobile-home"
    :class="{ 'mobile-home--desktop': desktop }"
  >
    <div class="mobile-topbar">
      <div class="mobile-brand">
        <span class="mobile-app-icon">
          <i class="pi pi-shopping-bag" />
        </span>
        <div class="mobile-topbar-title">
          <span class="mobile-app-name">Listes shopping Temu</span>
          <span class="mobile-app-subtitle">Sessions shopping et produits sauvegardés</span>
        </div>
      </div>
      <button
        class="settings-topbar-btn"
        type="button"
        aria-label="Paramètres"
        @click="$emit('open-settings')"
      >
        <i class="pi pi-cog" />
        <span>Paramètres</span>
      </button>
    </div>

    <div class="quick-actions">
      <RouterLink
        class="quick-action-btn"
        :to="{ name: 'lists' }"
      >
        <span class="quick-action-icon">
          <i class="pi pi-list" />
        </span>
        <span class="quick-action-label">Listes shopping</span>
        <i class="pi pi-chevron-right quick-action-arrow" />
      </RouterLink>
      <RouterLink
        class="quick-action-btn"
        :to="{ name: 'manual-import' }"
      >
        <span class="quick-action-icon">
          <i class="pi pi-link" />
        </span>
        <span class="quick-action-label">Import manuel</span>
        <i class="pi pi-chevron-right quick-action-arrow" />
      </RouterLink>
      <RouterLink
        class="quick-action-btn"
        :to="{ name: 'sync' }"
      >
        <span class="quick-action-icon">
          <i class="pi pi-cloud-upload" />
        </span>
        <span class="quick-action-label">Synchronisation</span>
        <i class="pi pi-chevron-right quick-action-arrow" />
      </RouterLink>
    </div>

    <div class="mobile-home-scroll">
      <section class="session-create-panel">
        <div>
          <p class="section-title">Créer une session shopping</p>
          <p class="section-subtitle">Utilisez des noms comme Cuisine, Voiture ou Shopping 1.</p>
        </div>
        <form
          class="session-create-form"
          @submit.prevent="createAndOpenSession"
        >
          <input
            v-model="newSessionName"
            class="session-name-input"
            maxlength="48"
            placeholder="Cuisine"
            aria-label="Nom de la session"
          />
          <button
            class="session-create-btn"
            type="submit"
          >
            <i class="pi pi-plus" />
            <span>Nouvelle session</span>
          </button>
        </form>
      </section>

      <section
        class="sessions-section"
        aria-labelledby="sessions-heading"
      >
        <div class="section-heading-row">
          <div>
            <p
              id="sessions-heading"
              class="section-title"
            >
              Sessions shopping
            </p>
            <p class="section-subtitle">
              Chaque session ouvre Temu dans sa propre WebView native.
            </p>
          </div>
          <span
            v-if="sessionsStore.degradedMode"
            class="degraded-pill"
          >
            Mode navigateur
          </span>
        </div>

        <div
          v-if="sessions.length"
          class="session-grid"
        >
          <button
            v-for="session in sessions"
            :key="session.id"
            class="session-launch-tile session-tile"
            :class="{ active: session.id === sessionsStore.activeSessionId }"
            type="button"
            :style="{ background: tileBg(session) }"
            @click="$emit('open-session', session)"
          >
            <span
              class="session-icon-wrap"
              :style="{ background: sessionAccent(session) }"
            >
              <i class="pi pi-shopping-cart" />
            </span>
            <span class="session-name">{{ session.name }}</span>
            <span class="session-meta">{{ formatSessionMeta(session) }}</span>
          </button>
        </div>

        <div
          v-else
          class="empty-session-state"
        >
          <i class="pi pi-shopping-bag" />
          <p>Aucune session shopping pour l'instant.</p>
          <button
            class="session-create-btn"
            type="button"
            @click="createAndOpenSession"
          >
            <i class="pi pi-plus" />
            <span>Commencer</span>
          </button>
        </div>
      </section>

      <p class="independence-note">
        Listes shopping Temu est indépendante de Temu. Les données de session et l'état de connexion restent dans cette application.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingSession } from "@/types/domain";

defineProps<{
  desktop?: boolean;
}>();

const emit = defineEmits<{
  "open-session": [session: ShoppingSession];
  "open-settings": [];
}>();

const sessionsStore = useShoppingSessionsStore();
const newSessionName = ref("");

const sessions = computed(() => sessionsStore.sessionsByOrder);

const accents = ["#f97316", "#06b6d4", "#22c55e", "#a855f7", "#ef4444", "#0ea5e9"];

function createAndOpenSession(): void {
  const sessionId = sessionsStore.createSession(newSessionName.value);
  newSessionName.value = "";
  const session = sessionsStore.getSession(sessionId);
  if (session) {
    emit("open-session", session);
  }
}

function sessionAccent(session: ShoppingSession): string {
  const index = Math.abs(session.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return session.color ?? accents[index % accents.length]!;
}

function tileBg(session: ShoppingSession): string {
  return `color-mix(in srgb, ${sessionAccent(session)} 8%, var(--surface-card))`;
}

function formatSessionMeta(session: ShoppingSession): string {
  if (session.lastCaptureAt) {
    return "Produit capturé";
  }
  if (session.currentUrl && session.currentUrl !== session.startUrl) {
    return "Navigation récente";
  }
  return "Prêt pour le shopping";
}
</script>
