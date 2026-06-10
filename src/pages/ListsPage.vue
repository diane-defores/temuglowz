<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { serializeShoppingBackup } from "@/lib/backup";

const shoppingListsStore = useShoppingListsStore();
const productStore = useProductSnapshotsStore();

shoppingListsStore.initializeDefaults();

const newListName = ref("");
const creationError = ref("");

const lists = computed(() => shoppingListsStore.listEntries);

function createList() {
  creationError.value = "";
  try {
    shoppingListsStore.createList(newListName.value);
    newListName.value = "";
  } catch (error) {
    creationError.value = (error as Error).message;
  }
}

function itemCountForList(listId: string): number {
  return shoppingListsStore.getListItems(listId).length;
}

function lastSaved(listId: string): string {
  const item = shoppingListsStore.getListItems(listId).at(-1);
  if (!item) {
    return "Aucun produit";
  }

  const snapshot = productStore.getSnapshot(item.snapshotId);
  if (!snapshot) {
    return "Produit supprimé";
  }

  return snapshot.title;
}

function deleteList(listId: string) {
  shoppingListsStore.deleteList(listId);
}

function exportBackup() {
  const payload = serializeShoppingBackup({
    lists: shoppingListsStore.listEntries,
    items: Object.values(shoppingListsStore.items),
    snapshots: Object.values(productStore.snapshots),
  });

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const fileUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = fileUrl;
  downloadLink.download = "temu-shopping-lists-backup.json";
  downloadLink.click();
  URL.revokeObjectURL(fileUrl);
}
</script>

<template>
  <section class="panel">
    <h2>Listes</h2>
    <p class="muted">
      Sauvegardez des produits Temu par liste (ex: Cuisine, Voiture), en lecture hors-ligne.
    </p>

    <div class="row">
      <input
        v-model="newListName"
        maxlength="64"
        placeholder="Nom de la nouvelle liste"
        @keyup.enter="createList"
      />
      <button :disabled="!newListName.trim()" @click="createList">Ajouter</button>
    </div>
    <p v-if="creationError" class="danger">{{ creationError }}</p>

    <div class="card-list">
      <article v-for="list in lists" :key="list.id" class="list-card">
        <div class="row" style="justify-content: space-between">
          <strong>{{ list.name }}</strong>
          <span class="muted">{{ itemCountForList(list.id) }} article(s)</span>
        </div>
        <p class="muted">Dernier: {{ lastSaved(list.id) }}</p>
        <div class="actions">
          <RouterLink class="link-btn" :to="{ name: 'list-detail', params: { listId: list.id } }">
            Ouvrir
          </RouterLink>
          <button @click="deleteList(list.id)">Supprimer</button>
        </div>
      </article>
    </div>

    <h3>Importer un produit</h3>
    <p>
      Importer depuis un lien partagé en passant par Android ou via le formulaire.
    </p>
    <RouterLink to="/import/manual">Importer par URL</RouterLink>
    <button type="button" @click="exportBackup">Exporter la sauvegarde JSON</button>
  </section>
</template>
