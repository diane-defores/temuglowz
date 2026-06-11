<template>
  <div class="right-shell">
    <div class="right-content">
      <slot />
    </div>

    <aside
      v-if="modelValue"
      class="right-sidebar"
      :class="{ 'icons-only': iconsOnly }"
    >
      <div class="sidebar-toolbar right-toolbar">
        <button
          class="header-icon-btn"
          type="button"
          aria-label="Mode compact"
          @click="iconsOnly = !iconsOnly"
        >
          <i class="pi pi-arrows-h" />
        </button>
      </div>

      <div
        v-if="!iconsOnly"
        class="right-summary"
      >
        <p class="section-title">État shopping</p>
        <div class="summary-stat">
          <span>Sessions</span>
          <strong>{{ sessionCount }}</strong>
        </div>
        <div class="summary-stat">
          <span>Taille du texte</span>
          <strong>{{ sessionsStore.settings.textZoom }}%</strong>
        </div>
        <div class="summary-stat">
          <span>Thème</span>
          <strong>{{ sessionsStore.settings.darkMode ? "Sombre" : "Clair" }}</strong>
        </div>
      </div>

      <div class="menu-section right-menu">
        <RouterLink
          class="sidebar-link"
          :class="{ 'justify-content-center': iconsOnly }"
          :to="{ name: 'import-review' }"
          title="Valider l'import"
        >
          <i class="pi pi-bookmark" />
          <span v-if="!iconsOnly">Valider l'import</span>
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ 'justify-content-center': iconsOnly }"
          :to="{ name: 'lists' }"
          title="Produits sauvegardés"
        >
          <i class="pi pi-shopping-bag" />
          <span v-if="!iconsOnly">Produits sauvegardés</span>
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ 'justify-content-center': iconsOnly }"
          :to="{ name: 'sync' }"
          title="Synchronisation"
        >
          <i class="pi pi-cloud" />
          <span v-if="!iconsOnly">Synchronisation</span>
        </RouterLink>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { useShoppingSessionsStore } from "@/stores/shoppingSessions";

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const sessionsStore = useShoppingSessionsStore();
const iconsOnly = ref(false);
const sessionCount = computed(() => sessionsStore.sessionsByOrder.length);
</script>
