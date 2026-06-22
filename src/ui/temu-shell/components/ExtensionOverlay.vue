<template>
  <div v-if="visible" class="extension-overlay" :class="{ 'is-dark': isDarkMode }">
    <div class="extension-overlay-backdrop" @click="closeOverlay" />
    <div class="extension-overlay-panel" role="dialog" aria-label="Listes de shopping">
      <div class="extension-overlay-header">
        <h2 class="extension-overlay-title">Mes listes</h2>
        <button class="extension-overlay-close" @click="closeOverlay" aria-label="Fermer">
          <i class="pi pi-times" />
        </button>
      </div>
      <div class="extension-overlay-content">
        <div v-if="!lists.length" class="extension-overlay-empty">
          <p class="extension-overlay-empty-text">Aucune liste disponible. Créez-en une depuis l'appli.</p>
        </div>
        <div v-else class="extension-overlay-list">
          <button
            v-for="list in lists"
            :key="list.id"
            class="extension-overlay-list-item"
            @click="addToList(list.id)"
          >
            <span class="extension-overlay-list-name">{{ list.name }}</span>
            <i class="extension-overlay-list-icon pi pi-plus" />
          </button>
        </div>
      </div>
      <div class="extension-overlay-footer">
        <p class="extension-overlay-hint">L'extension Temu Shopping Lists est requise pour le plein fonctionnement.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { requestAddToCurrentList } from "@/lib/extensionBridge";
import { useNotificationsStore } from "@/stores/notifications";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "added-to-list"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const listsStore = useShoppingListsStore();
const notificationsStore = useNotificationsStore();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const lists = computed(() => listsStore.listEntries);
const isDarkMode = computed(() => {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
});

function closeOverlay(): void {
  visible.value = false;
}

async function addToList(listId: string): Promise<void> {
  const result = await requestAddToCurrentList(listId);
  if (result.ok) {
    notificationsStore.success("Produit ajouté à la liste");
    emit("added-to-list");
    closeOverlay();
  } else {
    notificationsStore.error(result.error ?? "Impossible d'ajouter le produit");
  }
}
</script>

<style scoped>
.extension-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-index-928cc332);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.extension-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--text-color) 42%, transparent);
}

.extension-overlay-panel {
  position: relative;
  display: grid;
  width: min(100%, 22rem);
  max-height: min(32rem, 90vh);
  gap: var(--ds-gap-b7bf7a01);
  border: 1px solid var(--surface-border);
  border-radius: var(--ds-border-radius-41655fd4);
  padding: var(--ds-padding-ef7142f7);
  color: var(--text-color);
  background: var(--surface-card);
  box-shadow: var(--card-shadow);
}

.extension-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-gap-d3d468e6);
}

.extension-overlay-title {
  margin: 0;
  color: var(--text-color);
  font-size: var(--ds-font-size-ba04dcd5);
  font-weight: 850;
}

.extension-overlay-close {
  display: inline-flex;
  width: var(--ds-width-a55f28fc);
  height: var(--ds-height-f3bb23fa);
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-border);
  border-radius: var(--ds-border-radius-84b5b1c8);
  color: var(--text-color-secondary);
  background: var(--surface-ground);
  cursor: pointer;
}

.extension-overlay-close:hover {
  color: var(--text-color);
  background: var(--surface-hover);
}

.extension-overlay-content {
  display: grid;
  gap: var(--ds-gap-06489498);
  min-height: 0;
  overflow-y: auto;
}

.extension-overlay-empty {
  padding: var(--ds-padding-ef7142f7);
  text-align: center;
}

.extension-overlay-empty-text {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: var(--ds-font-size-63dea9c4);
  line-height: var(--ds-line-height-da9c5200);
}

.extension-overlay-list {
  display: grid;
  gap: var(--ds-gap-1a9e201f);
}

.extension-overlay-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-gap-d3d468e6);
  min-height: var(--ds-min-height-9aa4cccd);
  border: 1px solid var(--surface-border);
  border-radius: var(--ds-border-radius-84b5b1c8);
  padding: 0 0.85rem;
  color: var(--text-color);
  background: var(--surface-card);
  cursor: pointer;
  font: inherit;
}

.extension-overlay-list-item:hover {
  background: var(--surface-hover);
}

.extension-overlay-list-name {
  color: var(--text-color);
  font-size: var(--ds-font-size-849ec2ce);
  font-weight: 750;
}

.extension-overlay-list-icon {
  color: var(--primary-color);
  font-size: var(--ds-font-size-849ec2ce);
}

.extension-overlay-footer {
  padding-top: var(--ds-padding-top-1b81d278);
  border-top: 1px solid var(--surface-border);
}

.extension-overlay-hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: var(--ds-font-size-a2b44b15);
  line-height: var(--ds-line-height-da9c5200);
  text-align: center;
}

.extension-overlay[aria-hidden="true"] {
  display: none;
}
</style>