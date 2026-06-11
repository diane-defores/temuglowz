<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";
import { useNotificationsStore } from "@/stores/notifications";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";

import type { DuplicateResolution } from "@/types/domain";

const router = useRouter();

const importStore = useImportDraftsStore();
const notificationsStore = useNotificationsStore();
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
    notificationsStore.warning("Aucun produit a enregistrer.");
    return;
  }

  if (!selectedListId.value) {
    notificationsStore.warning("Choisissez une liste avant d'enregistrer ce produit.");
    return;
  }

  const snapshot = snapshots.buildSnapshotFromDraft({
    canonicalUrl: draft.value.canonicalUrl,
    originalUrl: draft.value.candidateUrl,
    title: title.value,
    notes: note.value,
    metadataStatus: draft.value.status,
    quantity: quantity.value,
    source: draft.value.source === "webview" ? "webview" : "manual",
  });

  if (draft.value.status === "manual_required" && !snapshot.title.trim()) {
    snapshot.title = "Produit Temu";
  }

  const existingDuplicate = duplicateResolution.value === "add_new" ? null : duplicateItemId.value;

  if (existingDuplicate && duplicateResolution.value === "cancel") {
    importStore.clearDraft();
    notificationsStore.info("Import annule.");
    router.push({ name: "shopping-shell" });
    return;
  }

  if (existingDuplicate && duplicateResolution.value === "update_existing") {
    try {
      snapshots.upsertSnapshot(snapshot);
      importStore.clearDraft();
      notificationsStore.success("Snapshot mis a jour.");
      router.push({ name: "shopping-shell" });
    } catch (error) {
      notificationsStore.error(error instanceof Error ? error.message : "Impossible de mettre a jour ce produit.");
    }
    return;
  }

  try {
    snapshots.upsertSnapshot(snapshot);
    shoppingStore.addItem(selectedListId.value, snapshot.id, quantity.value, note.value);
    importStore.clearDraft();
    notificationsStore.success("Produit enregistre dans la liste.");
    router.push({ name: "shopping-shell" });
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible d'enregistrer ce produit.");
  }
}

function useNewList(): void {
  try {
    const listId = shoppingStore.createList("Nouvelle liste");
    selectedListId.value = listId;
    notificationsStore.success("Nouvelle liste creee.");
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de creer la liste.");
  }
}
</script>

<template>
  <section class="panel">
    <h2>Revue de l’import</h2>

    <div v-if="draft">
      <p><strong>URL détectée:</strong> {{ draft.canonicalUrl }}</p>
      <label>
        Titre du produit
        <input
          v-model="title"
          class="full-width"
        >
      </label>
      <label>
        Quantité
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          max="999"
        >
      </label>
      <label>
        Note personnelle
        <textarea
          v-model="note"
          rows="3"
          class="full-width"
        />
      </label>

      <label>
        Liste cible
        <select
          v-model="selectedListId"
          class="full-width"
        >
          <option
            v-for="list in lists"
            :key="list.id"
            :value="list.id"
          >
            {{ list.name }}
          </option>
        </select>
      </label>

      <button
        type="button"
        @click="useNewList"
      >
        Créer une nouvelle liste
      </button>

      <div
        v-if="duplicateItemId"
        class="panel"
        style="margin-top: 0.75rem;"
      >
        <p class="muted">
          Ce produit semble déjà présent dans cette liste.
        </p>
        <label>
          <input
            v-model="duplicateResolution"
            type="radio"
            value="add_new"
          > Ajouter une quantité
        </label>
        <label>
          <input
            v-model="duplicateResolution"
            type="radio"
            value="update_existing"
          > Mettre à jour le snapshot existant
        </label>
        <label>
          <input
            v-model="duplicateResolution"
            type="radio"
            value="cancel"
          > Annuler
        </label>
      </div>

      <div
        class="actions"
        style="margin-top: 1rem;"
      >
        <button
          type="button"
          @click="save"
        >
          Enregistrer
        </button>
        <button
          type="button"
          class="danger"
          @click="importStore.clearDraft()"
        >
          Annuler
        </button>
      </div>
    </div>
  </section>
</template>
