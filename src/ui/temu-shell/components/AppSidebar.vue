<template>
  <div class="desktop-shell">
    <aside
      v-if="modelValue"
      class="sidebar"
      :class="{ 'icons-only': iconsOnly }"
    >
      <div class="sidebar-content">
        <div class="sidebar-main">
          <div
            class="sidebar-toolbar"
            :class="{ centered: iconsOnly }"
          >
            <button
              class="header-icon-btn"
              type="button"
              aria-label="Mode compact"
              @click="iconsOnly = !iconsOnly"
            >
              <i class="pi pi-arrows-h" />
            </button>
          </div>

          <div class="menu-section">
            <div
              v-if="!iconsOnly"
              class="section-header"
            >
              <h3>Listes shopping</h3>
              <button
                class="sidebar-add-btn"
                type="button"
                aria-label="Créer une liste shopping"
                @click="createList"
              >
                <i class="pi pi-plus" />
              </button>
            </div>

            <div class="menu-items">
              <RouterLink
                v-for="list in shoppingLists"
                :key="list.id"
                class="sidebar-link"
                :class="{ 'justify-content-center': iconsOnly }"
                :to="{ name: 'list-detail', params: { listId: list.id } }"
                :title="list.name"
              >
                <i class="pi pi-list" />
                <span v-if="!iconsOnly">{{ list.name }}</span>
                <span
                  v-if="!iconsOnly"
                  class="sidebar-count"
                >
                  {{ itemCountForList(list.id) }}
                </span>
              </RouterLink>

              <button
                v-if="!shoppingLists.length"
                class="sidebar-link"
                type="button"
                @click="createList"
              >
                <i class="pi pi-list" />
                <span>Créer une liste</span>
              </button>
            </div>
          </div>

          <div class="menu-section">
            <div
              v-if="!iconsOnly"
              class="section-header"
            >
              <h3>Sessions</h3>
              <button
                class="sidebar-add-btn"
                type="button"
                @click="createSession"
              >
                <i class="pi pi-plus" />
              </button>
            </div>

            <div class="menu-items">
              <button
                v-for="session in sessions"
                :key="session.id"
                class="sidebar-link"
                :class="{
                  'justify-content-center': iconsOnly,
                  'sidebar-link--active': session.id === sessionsStore.activeSessionId,
                }"
                type="button"
                :title="session.name"
                @click="$emit('open-session', session)"
              >
                <span
                  class="sidebar-session-dot"
                  :style="{ background: sessionAccent(session.id) }"
                />
                <span v-if="!iconsOnly">{{ session.name }}</span>
              </button>

              <button
                v-if="!sessions.length"
                class="sidebar-link"
                type="button"
                @click="createSession"
              >
                <span class="sidebar-session-dot" />
                <span>Commencer</span>
              </button>
            </div>
          </div>

          <div
            v-if="!iconsOnly"
            class="menu-section"
          >
            <div class="section-header">
              <h3>Outils</h3>
            </div>
            <RouterLink
              class="sidebar-link"
              :to="{ name: 'manual-import' }"
            >
              <i class="pi pi-link" />
              <span>Import manuel</span>
            </RouterLink>
            <RouterLink
              class="sidebar-link"
              :to="{ name: 'sync' }"
            >
              <i class="pi pi-cloud-upload" />
              <span>Synchronisation</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </aside>

    <main class="desktop-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useNotificationsStore } from "@/stores/notifications";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingSession } from "@/types/domain";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "open-session": [session: ShoppingSession];
}>();

const router = useRouter();
const sessionsStore = useShoppingSessionsStore();
const shoppingListsStore = useShoppingListsStore();
const notificationsStore = useNotificationsStore();
const iconsOnly = ref(false);
const sessions = computed(() => sessionsStore.sessionsByOrder);
const shoppingLists = computed(() => shoppingListsStore.listEntries);
const accents = ["#f97316", "#06b6d4", "#22c55e", "#a855f7", "#ef4444", "#0ea5e9"];

shoppingListsStore.initializeDefaults();

function createSession(): void {
  const id = sessionsStore.createSession();
  const session = sessionsStore.getSession(id);
  if (session) {
    emit("open-session", session);
  }
}

function nextListName(): string {
  const existingNames = new Set(shoppingLists.value.map((list) => list.name.toLowerCase()));
  for (let index = 1; index <= shoppingLists.value.length + 1; index += 1) {
    const candidate = `Nouvelle liste ${index}`;
    if (!existingNames.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `Nouvelle liste ${shoppingLists.value.length + 1}`;
}

function createList(): void {
  try {
    const listId = shoppingListsStore.createList(nextListName());
    notificationsStore.success("Liste créée.");
    void router.push({ name: "list-detail", params: { listId } });
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de créer la liste.");
  }
}

function itemCountForList(listId: string): number {
  return shoppingListsStore.getListItems(listId).length;
}

function sessionAccent(id: string): string {
  const index = Math.abs(id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return accents[index % accents.length]!;
}
</script>
