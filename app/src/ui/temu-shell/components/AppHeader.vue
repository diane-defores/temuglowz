<template>
  <header class="header">
    <div class="header-start">
      <button
        class="header-icon-btn"
        type="button"
        aria-label="Afficher les sessions"
        @click="toggleLeftSidebar"
      >
        <i class="pi pi-bars" />
      </button>
      <div>
        <h1 class="app-title">Listes shopping Temu</h1>
        <p class="app-kicker">Listes et sessions shopping</p>
      </div>
    </div>

    <div class="header-center">
      <div class="search-container">
        <i class="pi pi-search" />
        <input
          class="search-input"
          type="search"
          placeholder="Rechercher une liste ou une session"
          aria-label="Rechercher une liste ou une session"
        />
      </div>
    </div>

    <div class="header-end">
      <RouterLink
        class="header-link"
        :to="{ name: 'shopping-shell' }"
      >
        Listes
      </RouterLink>
      <RouterLink
        class="header-link"
        :to="{ name: 'manual-import' }"
      >
        Import
      </RouterLink>
      <button
        class="header-icon-btn"
        type="button"
        aria-label="Paramètres"
        @click="$emit('open-settings')"
      >
        <i class="pi pi-cog" />
      </button>
      <button
        class="header-icon-btn"
        type="button"
        aria-label="Afficher l'activité"
        @click="toggleRightSidebar"
      >
        <i class="pi pi-sliders-h" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  sidebarVisible: boolean;
  rightSidebarVisible: boolean;
}>();

const emit = defineEmits<{
  "update:sidebarVisible": [value: boolean];
  "update:rightSidebarVisible": [value: boolean];
  "open-settings": [];
}>();

function toggleLeftSidebar(): void {
  emit("update:sidebarVisible", !props.sidebarVisible);
}

function toggleRightSidebar(): void {
  emit("update:rightSidebarVisible", !props.rightSidebarVisible);
}
</script>
