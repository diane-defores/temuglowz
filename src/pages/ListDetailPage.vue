<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import type { AvailabilityState } from "@/types/domain";

const route = useRoute();
const router = useRouter();

const listId = route.params.listId as string;
const observationsStore = useProductObservationsStore();
const shoppingStore = useShoppingListsStore();
const productStore = useProductSnapshotsStore();

const list = computed(() => shoppingStore.getList(listId));
const items = computed(() => shoppingStore.getListItems(listId));

const totalItems = computed(() => items.value.length);

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
  router.push({
    name: "product-detail",
    params: { snapshotId },
  });
}

function remove(itemId: string) {
  shoppingStore.removeItem(listId, itemId);
}

function goBack() {
  router.push({ name: "lists" });
}

function addQuantity(itemId: string) {
  const item = shoppingStore.items[itemId];
  if (!item) {
    return;
  }

  shoppingStore.setItemQuantity(listId, itemId, item.quantity + 1);
}

function removeQuantity(itemId: string) {
  const item = shoppingStore.items[itemId];
  if (!item) {
    return;
  }

  if (item.quantity <= 1) {
    return;
  }

  shoppingStore.setItemQuantity(listId, itemId, item.quantity - 1);
}
</script>

<template>
  <section class="panel" v-if="list">
    <div class="row" style="justify-content: space-between">
      <h2>{{ list.name }}</h2>
      <button type="button" @click="goBack">Retour</button>
    </div>

    <p class="muted">{{ totalItems }} produit(s) archivé(s)</p>

    <div class="card-list">
      <article
        v-for="item in items"
        :key="item.id"
        class="item-card"
      >
        <template v-if="productStore.getSnapshot(item.snapshotId)">
          <h3>{{ productStore.getSnapshot(item.snapshotId)?.title }}</h3>
          <p class="muted">{{ productStore.getSnapshot(item.snapshotId)?.canonicalUrl }}</p>
          <p
            class="observation-badge"
            :class="{ due: observationsStore.isReminderDue(item.snapshotId) }"
          >
            {{ latestObservationLabel(item.snapshotId) }}
          </p>
        </template>
        <p v-else class="danger">Produit introuvable</p>

        <p class="muted">{{ item.note || "Sans note" }}</p>
        <div class="row" style="justify-content: space-between">
          <div>Quantité: {{ item.quantity }}</div>
          <div class="actions">
            <button type="button" @click="removeQuantity(item.id)">-</button>
            <button type="button" @click="addQuantity(item.id)">+</button>
            <button type="button" @click="openProduct(item.snapshotId)">Voir</button>
            <button type="button" @click="remove(item.id)">Supprimer</button>
          </div>
        </div>
      </article>
    </div>

    <p v-if="items.length === 0" class="muted">Aucun produit pour le moment.</p>
  </section>

  <section v-else class="panel">
    <p>Liste introuvable.</p>
    <button type="button" @click="goBack">Retour</button>
  </section>
</template>
