<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";

import type { DuplicateResolution } from "@/types/domain";

const router = useRouter();

const importStore = useImportDraftsStore();
const shoppingStore = useShoppingListsStore();
const snapshots = useProductSnapshotsStore();

const note = ref("");
const selectedListId = ref("");
const title = ref("");
const quantity = ref(1);
const duplicateResolution = ref<DuplicateResolution>("add_new");

if (!importStore.draft) {
  router.replace({ name: "manual-import" }).catch(() => {
    // noop
  });
}

const draft = computed(() => importStore.draft);

const lists = computed(() => shoppingStore.listEntries);

const duplicateItemId = computed(() => {
  if (!draft.value || !selectedListId.value) {
    return null;
  }

  return shoppingStore.findDuplicateByCanonicalOrProductId(selectedListId.value, {
    canonicalUrl: draft.value.canonicalUrl,
  });
});

if (lists.value.length > 0 && !selectedListId.value) {
  selectedListId.value = lists.value[0].id;
}

if (draft.value) {
  title.value = draft.value.parsedTitle;
}

function save(): void {
  if (!draft.value) {
    return;
  }

  const snapshot = snapshots.buildSnapshotFromDraft({
    canonicalUrl: draft.value.canonicalUrl,
    originalUrl: draft.value.candidateUrl,
    title: title.value,
    notes: note.value,
    metadataStatus: draft.value.status,
    quantity: quantity.value,
  });

  if (draft.value.status === "needs_review" && !snapshot.title.trim()) {
    snapshot.title = "Produit Temu";
  }

  const existingDuplicate = duplicateResolution.value === "add_new" ? null : duplicateItemId.value;

  if (existingDuplicate && duplicateResolution.value === "cancel") {
    importStore.clearDraft();
    router.push({ name: "lists" });
    return;
  }

  if (existingDuplicate && duplicateResolution.value === "update_existing") {
    snapshots.upsertSnapshot(snapshot);
    router.push({ name: "lists" });
    return;
  }

  snapshots.upsertSnapshot(snapshot);
  shoppingStore.addItem(selectedListId.value, snapshot.id, quantity.value, note.value);
  importStore.clearDraft();
  router.push({ name: "lists" });
}

function useNewList(): void {
  const listId = shoppingStore.createList("Nouvelle liste");
  selectedListId.value = listId;
}
</script>

<template>
  <section class="panel">
    <h2>Revue de l’import</h2>

    <div v-if="draft">
      <p><strong>URL détectée:</strong> {{ draft.canonicalUrl }}</p>
      <label>
        Titre du produit
        <input v-model="title" class="full-width" />
      </label>
      <label>
        Quantité
        <input type="number" v-model.number="quantity" min="1" max="999" />
      </label>
      <label>
        Note personnelle
        <textarea v-model="note" rows="3" class="full-width"></textarea>
      </label>

      <label>
        Liste cible
        <select v-model="selectedListId" class="full-width">
          <option v-for="list in lists" :key="list.id" :value="list.id">
            {{ list.name }}
          </option>
        </select>
      </label>

      <button type="button" @click="useNewList">Créer une nouvelle liste</button>

      <div v-if="duplicateItemId" class="panel" style="margin-top: 0.75rem;">
        <p class="muted">Ce produit semble déjà présent dans cette liste.</p>
        <label>
          <input type="radio" value="add_new" v-model="duplicateResolution" /> Ajouter une quantité
        </label>
        <label>
          <input
            type="radio"
            value="update_existing"
            v-model="duplicateResolution"
          /> Mettre à jour le snapshot existant
        </label>
        <label>
          <input type="radio" value="cancel" v-model="duplicateResolution" /> Annuler
        </label>
      </div>

      <div class="actions" style="margin-top: 1rem;">
        <button type="button" @click="save">Enregistrer</button>
        <button type="button" @click="importStore.clearDraft()" class="danger">
          Annuler
        </button>
      </div>
    </div>
  </section>
</template>

