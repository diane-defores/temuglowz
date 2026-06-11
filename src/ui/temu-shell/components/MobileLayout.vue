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

    <div class="mobile-home-scroll">
      <section
        class="home-section"
        aria-labelledby="shopping-lists-heading"
      >
        <div class="section-heading-row">
          <div>
            <p
              id="shopping-lists-heading"
              class="section-title"
            >
              Listes shopping
            </p>
            <p class="section-subtitle">
              Vos produits sauvegardés, par besoin ou par projet.
            </p>
          </div>
          <button
            class="section-icon-action"
            type="button"
            aria-label="Créer une liste shopping"
            @click="toggleListCreator"
          >
            <i class="pi pi-plus" />
          </button>
        </div>

        <form
          v-if="showListCreator"
          class="inline-create-form"
          @submit.prevent="createList"
        >
          <input
            v-model="newListName"
            class="compact-name-input"
            maxlength="64"
            placeholder="Nom de la liste"
            aria-label="Nom de la liste"
          />
          <button
            class="compact-submit-btn"
            type="submit"
            :disabled="!newListName.trim()"
          >
            Créer
          </button>
        </form>
        <p
          v-if="listCreationError"
          class="inline-error"
        >
          {{ listCreationError }}
        </p>

        <div class="shopping-list-grid">
          <RouterLink
            v-for="list in shoppingLists"
            :key="list.id"
            class="shopping-list-card"
            :to="{ name: 'list-detail', params: { listId: list.id } }"
          >
            <span class="shopping-list-icon">
              <i class="pi pi-list" />
            </span>
            <span class="shopping-list-copy">
              <span class="shopping-list-name">{{ list.name }}</span>
              <span class="shopping-list-meta">{{ itemCountForList(list.id) }} produit(s)</span>
              <span class="shopping-list-last">{{ lastSaved(list.id) }}</span>
            </span>
            <i class="pi pi-chevron-right shopping-list-arrow" />
          </RouterLink>
        </div>
      </section>

      <section
        class="home-section sessions-section"
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
          <div class="section-heading-actions">
            <span
              v-if="sessionsStore.degradedMode"
              class="degraded-pill"
            >
              WebView indisponible
            </span>
            <button
              class="section-icon-action"
              type="button"
              aria-label="Créer une session shopping"
              @click="createAndOpenSession"
            >
              <i class="pi pi-plus" />
            </button>
          </div>
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
            class="section-icon-action section-icon-action--primary"
            type="button"
            aria-label="Créer une session shopping"
            @click="createAndOpenSession"
          >
            <i class="pi pi-plus" />
          </button>
        </div>
      </section>

      <div class="home-utility-actions">
        <RouterLink
          class="utility-action-btn"
          :to="{ name: 'manual-import' }"
        >
          <i class="pi pi-link" />
          <span>Import manuel</span>
        </RouterLink>
        <RouterLink
          class="utility-action-btn"
          :to="{ name: 'sync' }"
        >
          <i class="pi pi-cloud-upload" />
          <span>Synchronisation</span>
        </RouterLink>
      </div>

      <p class="independence-note">
        Listes shopping Temu est indépendante de Temu. Les données de session et l'état de connexion restent dans cette application.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useNotificationsStore } from "@/stores/notifications";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingList, ShoppingSession } from "@/types/domain";

defineProps<{
  desktop?: boolean;
}>();

const emit = defineEmits<{
  "open-session": [session: ShoppingSession];
  "open-settings": [];
}>();

const sessionsStore = useShoppingSessionsStore();
const shoppingListsStore = useShoppingListsStore();
const productStore = useProductSnapshotsStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const newSessionName = ref("");
const newListName = ref("");
const listCreationError = ref("");
const showListCreator = ref(false);

const sessions = computed(() => sessionsStore.sessionsByOrder);
const shoppingLists = computed<ShoppingList[]>(() => shoppingListsStore.listEntries);

const accents = ["#f97316", "#06b6d4", "#22c55e", "#a855f7", "#ef4444", "#0ea5e9"];

shoppingListsStore.initializeDefaults();

function createAndOpenSession(): void {
  const sessionId = sessionsStore.createSession(newSessionName.value);
  newSessionName.value = "";
  const session = sessionsStore.getSession(sessionId);
  if (session) {
    emit("open-session", session);
  }
}

function toggleListCreator(): void {
  showListCreator.value = !showListCreator.value;
  if (!showListCreator.value) {
    listCreationError.value = "";
  }
}

function readableListError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("required")) {
    return "Nom de liste requis.";
  }
  if (message.includes("already exists")) {
    return "Une liste porte déjà ce nom.";
  }
  return "Impossible de créer la liste.";
}

function createList(): void {
  listCreationError.value = "";
  try {
    const listId = shoppingListsStore.createList(newListName.value);
    newListName.value = "";
    showListCreator.value = false;
    notificationsStore.success("Liste créée.");
    void router.push({ name: "list-detail", params: { listId } });
  } catch (error) {
    listCreationError.value = readableListError(error);
  }
}

function itemCountForList(listId: string): number {
  return shoppingListsStore.getListItems(listId).length;
}

function lastSaved(listId: string): string {
  const item = shoppingListsStore.getListItems(listId).at(-1);
  if (!item) {
    return "Aucun produit sauvegardé";
  }

  return productStore.getSnapshot(item.snapshotId)?.title ?? "Produit supprimé";
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
