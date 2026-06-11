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
              :to="{ name: 'lists' }"
            >
              <i class="pi pi-list" />
              <span>Listes shopping</span>
            </RouterLink>
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

import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingSession } from "@/types/domain";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "open-session": [session: ShoppingSession];
}>();

const sessionsStore = useShoppingSessionsStore();
const iconsOnly = ref(false);
const sessions = computed(() => sessionsStore.sessionsByOrder);
const accents = ["#f97316", "#06b6d4", "#22c55e", "#a855f7", "#ef4444", "#0ea5e9"];

function createSession(): void {
  const id = sessionsStore.createSession();
  const session = sessionsStore.getSession(id);
  if (session) {
    emit("open-session", session);
  }
}

function sessionAccent(id: string): string {
  const index = Math.abs(id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return accents[index % accents.length]!;
}
</script>
