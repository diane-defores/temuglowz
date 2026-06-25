<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useProductObservationsStore } from "@/stores/productObservations";
import { useNotificationsStore } from "@/stores/notifications";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { AvailabilityState } from "@/types/domain";

const route = useRoute();
const router = useRouter();

const listId = route.params.listId as string;
const observationsStore = useProductObservationsStore();
const notificationsStore = useNotificationsStore();
const shoppingStore = useShoppingListsStore();
const sessionsStore = useShoppingSessionsStore();
const productStore = useProductSnapshotsStore();

const list = computed(() => shoppingStore.getList(listId));
const items = computed(() => shoppingStore.getListItems(listId));
const renameDraft = ref("");

const totalItems = computed(() => items.value.length);

watch(
  list,
  (value) => {
    renameDraft.value = value?.name ?? "";
  },
  { immediate: true },
);

function availabilityLabel(value: AvailabilityState): string {
  const labels: Record<AvailabilityState, string> = {
    unknown: "À vérifier",
    available: "Disponible",
    low_stock: "Bientôt épuisé",
    sold_out: "Épuisé",
    removed: "Retiré",
    link_broken: "Lien cassé",
  };
  return labels[value];
}

function latestObservationLabel(snapshotId: string): string {
  const observation = observationsStore.latestBySnapshot(snapshotId);
  if (!observation) {
    return "Aucune observation";
  }
  return `Dernier état observé : ${availabilityLabel(observation.availability)}`;
}

function openProduct(snapshotId: string) {
  const snapshot = productStore.getSnapshot(snapshotId);
  if (!snapshot) {
    notificationsStore.warning("Ce produit n'est plus disponible dans l'archive.");
    return;
  }

  const sessionId = sessionsStore.createSession(snapshot.title, snapshot.canonicalUrl);
  router.replace({
    name: "shopping-shell",
    query: { openSession: sessionId },
  });
}

function remove(itemId: string) {
  shoppingStore.removeItem(listId, itemId);
  notificationsStore.success("Produit retire de la liste.");
}

function goBack() {
  router.replace({ name: "shopping-shell" });
}

function renameCurrentList() {
  if (!list.value) {
    return;
  }

  try {
    shoppingStore.renameList(listId, renameDraft.value);
    notificationsStore.success("Liste renommee.");
  } catch (error) {
    notificationsStore.warning(error instanceof Error ? error.message : "Impossible de renommer cette liste.");
  }
}

function deleteCurrentList() {
  if (!list.value) {
    return;
  }

  const confirmed = window.confirm(`Supprimer la liste "${list.value.name}" et ses produits sauvegardes ?`);
  if (!confirmed) {
    return;
  }

  try {
    shoppingStore.deleteList(listId);
    notificationsStore.success("Liste supprimee.");
    router.replace({ name: "shopping-shell" });
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de supprimer cette liste.");
  }
}

function addQuantity(itemId: string) {
  const item = shoppingStore.items[itemId];
  if (!item) {
    notificationsStore.warning("Cet article n'est plus disponible dans cette liste.");
    return;
  }

  shoppingStore.setItemQuantity(listId, itemId, item.quantity + 1);
  notificationsStore.success("Quantite augmentee.");
}

function removeQuantity(itemId: string) {
  const item = shoppingStore.items[itemId];
  if (!item) {
    notificationsStore.warning("Cet article n'est plus disponible dans cette liste.");
    return;
  }

  if (item.quantity <= 1) {
    notificationsStore.info("La quantite minimale est 1.");
    return;
  }

  shoppingStore.setItemQuantity(listId, itemId, item.quantity - 1);
  notificationsStore.success("Quantite reduite.");
}
</script>

<template>
  <main class="canonical-page">
    <div class="canonical-page-inner canonical-page-inner--wide">
      <template v-if="list">
        <header class="canonical-page-header">
          <div class="canonical-title-block">
            <span class="canonical-kicker">Liste shopping</span>
            <h1 class="canonical-title">{{ list.name }}</h1>
            <p class="canonical-subtitle">
              {{ totalItems }} produit(s) archivé(s)
            </p>
          </div>
          <button
            class="canonical-button canonical-button--ghost"
            type="button"
            @click="goBack"
          >
            <i class="pi pi-arrow-left" />
            <span>Retour</span>
          </button>
        </header>

        <section
          class="canonical-card"
          aria-label="Gestion de la liste"
        >
          <form
            class="canonical-form"
            @submit.prevent="renameCurrentList"
          >
            <label class="canonical-field">
              Nom de la liste
              <input
                v-model="renameDraft"
                class="canonical-input"
                maxlength="64"
              >
            </label>
            <div class="canonical-actions">
              <button
                class="canonical-button canonical-button--primary"
                type="submit"
                :disabled="renameDraft.trim() === list.name"
              >
                <i class="pi pi-check" />
                <span>Renommer</span>
              </button>
              <button
                class="canonical-button canonical-button--danger"
                type="button"
                @click="deleteCurrentList"
              >
                <i class="pi pi-trash" />
                <span>Supprimer la liste</span>
              </button>
            </div>
          </form>
        </section>

        <section
          v-if="items.length"
          class="canonical-list"
          aria-label="Produits de la liste"
        >
          <article
            v-for="item in items"
            :key="item.id"
            class="canonical-card canonical-item-card"
            :class="{ 'canonical-card--danger': !productStore.getSnapshot(item.snapshotId) }"
          >
            <template v-if="productStore.getSnapshot(item.snapshotId)">
              <div class="canonical-split-row">
                <div class="canonical-title-block">
                  <h2 class="canonical-card-title">
                    {{ productStore.getSnapshot(item.snapshotId)?.title }}
                  </h2>
                  <p class="canonical-url">
                    {{ productStore.getSnapshot(item.snapshotId)?.canonicalUrl }}
                  </p>
                </div>
                <span
                  class="canonical-status-pill"
                  :class="{ 'canonical-status-pill--warning': observationsStore.isReminderDue(item.snapshotId) }"
                >
                  {{ latestObservationLabel(item.snapshotId) }}
                </span>
              </div>
            </template>
            <p
              v-else
              class="canonical-error"
            >
              Produit introuvable
            </p>

            <p class="canonical-muted">
              {{ item.note || "Sans note" }}
            </p>
            <div class="canonical-split-row">
              <span class="canonical-quantity">Quantité : {{ item.quantity }}</span>
              <div class="canonical-actions">
                <button
                  class="canonical-button canonical-button--icon"
                  type="button"
                  :disabled="item.quantity <= 1"
                  aria-label="Réduire la quantité"
                  @click="removeQuantity(item.id)"
                >
                  <i class="pi pi-minus" />
                </button>
                <button
                  class="canonical-button canonical-button--icon canonical-button--primary"
                  type="button"
                  aria-label="Augmenter la quantité"
                  @click="addQuantity(item.id)"
                >
                  <i class="pi pi-plus" />
                </button>
                <button
                  class="canonical-button canonical-button--ghost"
                  type="button"
                  @click="openProduct(item.snapshotId)"
                >
                  <i class="pi pi-eye" />
                  <span>Voir</span>
                </button>
                <button
                  class="canonical-button canonical-button--danger"
                  type="button"
                  @click="remove(item.id)"
                >
                  <i class="pi pi-trash" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </article>
        </section>

        <section
          v-else
          class="canonical-empty"
        >
          <i class="pi pi-shopping-bag" />
          <p class="canonical-muted">Aucun produit pour le moment.</p>
        </section>
      </template>

      <section
        v-else
        class="canonical-card canonical-card--danger"
      >
        <div class="canonical-title-block">
          <span class="canonical-kicker">Liste shopping</span>
          <h1 class="canonical-title">Liste introuvable</h1>
          <p class="canonical-muted">
            Cette liste n'est plus disponible sur cet appareil.
          </p>
        </div>
        <button
          class="canonical-button canonical-button--ghost"
          type="button"
          @click="goBack"
        >
          <i class="pi pi-arrow-left" />
          <span>Retour</span>
        </button>
      </section>
    </div>
  </main>
</template>
