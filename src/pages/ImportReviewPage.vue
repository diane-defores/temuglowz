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
    router.replace({ name: "shopping-shell" });
    return;
  }

  if (existingDuplicate && duplicateResolution.value === "update_existing") {
    try {
      snapshots.upsertSnapshot(snapshot);
      importStore.clearDraft();
      notificationsStore.success("Snapshot mis a jour.");
      router.replace({ name: "shopping-shell" });
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
    router.replace({ name: "shopping-shell" });
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
  <main class="canonical-page">
    <div class="canonical-page-inner">
      <header class="canonical-page-header">
        <div class="canonical-title-block">
          <span class="canonical-kicker">Import</span>
          <h1 class="canonical-title">Revue de l’import</h1>
          <p class="canonical-subtitle">
            Vérifiez les champs avant d’enregistrer le produit dans une liste.
          </p>
        </div>
      </header>

      <section
        v-if="draft"
        class="canonical-card"
      >
        <p class="canonical-muted">
          <strong>URL détectée :</strong> {{ draft.canonicalUrl }}
        </p>
        <div class="canonical-form">
          <label class="canonical-field">
            Titre du produit
            <input
              v-model="title"
              class="canonical-input"
            >
          </label>
          <label class="canonical-field">
            Quantité
            <input
              v-model.number="quantity"
              class="canonical-input"
              type="number"
              min="1"
              max="999"
            >
          </label>
          <label class="canonical-field">
            Note personnelle
            <textarea
              v-model="note"
              rows="3"
              class="canonical-textarea"
            />
          </label>
          <label class="canonical-field">
            Liste cible
            <select
              v-model="selectedListId"
              class="canonical-select"
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
        </div>

        <div class="canonical-actions">
          <button
            type="button"
            class="canonical-button"
            @click="useNewList"
          >
            <i class="pi pi-plus" />
            <span>Créer une nouvelle liste</span>
          </button>
        </div>

        <section
          v-if="duplicateItemId"
          class="canonical-card canonical-card--flat"
        >
          <p class="canonical-muted">
            Ce produit semble déjà présent dans cette liste.
          </p>
          <label class="canonical-field">
            <input
              v-model="duplicateResolution"
              type="radio"
              value="add_new"
            > Ajouter une quantité
          </label>
          <label class="canonical-field">
            <input
              v-model="duplicateResolution"
              type="radio"
              value="update_existing"
            > Mettre à jour le snapshot existant
          </label>
          <label class="canonical-field">
            <input
              v-model="duplicateResolution"
              type="radio"
              value="cancel"
            > Annuler
          </label>
        </section>

        <div class="canonical-actions">
          <button
            type="button"
            class="canonical-button canonical-button--primary"
            @click="save"
          >
            <i class="pi pi-check" />
            <span>Enregistrer</span>
          </button>
          <button
            type="button"
            class="canonical-button canonical-button--danger"
            @click="importStore.clearDraft()"
          >
            <i class="pi pi-times" />
            <span>Annuler</span>
          </button>
        </div>
      </section>

      <section
        v-else
        class="canonical-card canonical-card--danger"
      >
        <div class="canonical-title-block">
          <span class="canonical-kicker">Import</span>
          <h2 class="canonical-title">Aucun brouillon à revoir</h2>
          <p class="canonical-muted">
            Recommencez depuis l’import manuel ou le flux de partage.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
