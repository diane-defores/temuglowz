<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useProductSnapshotsStore } from "@/stores/productSnapshots";

const router = useRouter();
const route = useRoute();

const snapshotId = route.params.snapshotId as string;
const store = useProductSnapshotsStore();

const snapshot = computed(() => store.getSnapshot(snapshotId));

function goBack() {
  router.back();
}
</script>

<template>
  <section class="panel" v-if="snapshot">
    <h2>{{ snapshot.title }}</h2>
    <p class="muted">URL source : {{ snapshot.originalUrl }}</p>
    <p class="muted">ID produit : {{ snapshot.productId || "inconnu" }}</p>
    <p>Disponibilité archivage : {{ snapshot.availability }}</p>
    <p>État des métadonnées : {{ snapshot.metadataStatus }}</p>
    <p>Quantité demandée : {{ snapshot.quantity }}</p>

    <div v-if="snapshot.imageUrl" class="row">
      <img
        :src="snapshot.imageUrl"
        alt="Image produit"
        style="max-width: 220px; max-height: 220px; object-fit: cover; border-radius: 8px"
      />
    </div>

    <div v-if="snapshot.galleryImageUrls.length">
      <h3>Images supplémentaires</h3>
      <div class="row">
        <img
          v-for="image in snapshot.galleryImageUrls"
          :key="image"
          :src="image"
          style="max-width: 90px; max-height: 90px; object-fit: cover; border-radius: 6px"
        />
      </div>
    </div>

    <div v-if="snapshot.notes">
      <h3>Notes</h3>
      <p class="muted">{{ snapshot.notes }}</p>
    </div>

    <div v-if="Object.keys(snapshot.selectedOptions).length">
      <h3>Options</h3>
      <ul>
        <li v-for="(value, key) in snapshot.selectedOptions" :key="key">
          {{ key }}: {{ value }}
        </li>
      </ul>
    </div>

    <div class="actions">
      <button type="button" @click="goBack">Retour</button>
    </div>
  </section>

  <section v-else class="panel">
    <p>Produit introuvable.</p>
    <button type="button" @click="goBack">Retour</button>
  </section>
</template>

