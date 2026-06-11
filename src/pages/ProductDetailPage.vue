<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useProductObservationsStore } from "@/stores/productObservations";
import { useNotificationsStore } from "@/stores/notifications";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import type { AvailabilityState } from "@/types/domain";

const router = useRouter();
const route = useRoute();

const snapshotId = route.params.snapshotId as string;
const notificationsStore = useNotificationsStore();
const store = useProductSnapshotsStore();
const observationsStore = useProductObservationsStore();

const snapshot = computed(() => store.getSnapshot(snapshotId));
const latestObservation = computed(() => observationsStore.latestBySnapshot(snapshotId));
const observationHistory = computed(() => observationsStore.historyBySnapshot(snapshotId));
const reminder = computed(() => observationsStore.reminderBySnapshot(snapshotId));
const reminderDue = computed(() => observationsStore.isReminderDue(snapshotId));

const availabilityOptions: Array<{ value: AvailabilityState; label: string }> = [
  { value: "unknown", label: "À vérifier" },
  { value: "available", label: "Disponible" },
  { value: "low_stock", label: "Bientôt épuisé" },
  { value: "sold_out", label: "Épuisé" },
  { value: "removed", label: "Retiré" },
  { value: "link_broken", label: "Lien cassé" },
];

const availability = ref<AvailabilityState>("unknown");
const priceAmount = ref("");
const priceCurrency = ref("EUR");
const note = ref("");
const reminderEnabled = ref(false);
const reminderIntervalDays = ref(7);

function formatDate(timestamp?: number | null): string {
  if (!timestamp) {
    return "jamais";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function availabilityLabel(value: AvailabilityState): string {
  return availabilityOptions.find((option) => option.value === value)?.label ?? value;
}

function saveObservation() {
  const current = snapshot.value;
  if (!current) {
    notificationsStore.warning("Produit introuvable.");
    return;
  }

  const parsedAmount = priceAmount.value.trim()
    ? Number(priceAmount.value.replace(",", "."))
    : null;
  if (priceAmount.value.trim() && (parsedAmount === null || !Number.isFinite(parsedAmount))) {
    notificationsStore.warning("Le prix saisi est invalide. Entrez un nombre comme 14,99.");
    return;
  }

  const price = parsedAmount !== null && Number.isFinite(parsedAmount)
    ? {
      amount: parsedAmount,
      currency: priceCurrency.value.trim().toUpperCase() || "EUR",
      capturedAt: Date.now(),
    }
    : undefined;

  try {
    observationsStore.appendObservation({
      snapshotId: current.id,
      productId: current.productId,
      canonicalUrl: current.canonicalUrl,
      source: "manual",
      status: "ok",
      confidence: "user_observed",
      availability: availability.value,
      price,
      observedAt: Date.now(),
      note: note.value,
    });
    note.value = "";
    notificationsStore.success("Observation enregistree.");
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible d'enregistrer l'observation.");
  }
}

function saveReminder() {
  observationsStore.setReminder(
    snapshotId,
    reminderEnabled.value,
    reminderIntervalDays.value,
  );
  notificationsStore.success("Rappel enregistre.");
}

watch(
  latestObservation,
  (observation) => {
    if (!observation) {
      return;
    }
    availability.value = observation.availability;
    priceAmount.value = observation.price ? String(observation.price.amount) : "";
    priceCurrency.value = observation.price?.currency ?? "EUR";
  },
  { immediate: true },
);

watch(
  reminder,
  (value) => {
    reminderEnabled.value = Boolean(value?.enabled);
    reminderIntervalDays.value = value?.intervalDays ?? 7;
  },
  { immediate: true },
);

function goBack() {
  router.back();
}
</script>

<template>
  <section
    v-if="snapshot"
    class="panel"
  >
    <h2>{{ snapshot.title }}</h2>
    <p class="muted">
      URL source : {{ snapshot.originalUrl }}
    </p>
    <p class="muted">
      ID produit : {{ snapshot.productId || "inconnu" }}
    </p>
    <p>Disponibilité archivage : {{ snapshot.availability }}</p>
    <p>État des métadonnées : {{ snapshot.metadataStatus }}</p>
    <p>Quantité demandée : {{ snapshot.quantity }}</p>

    <section class="observation-panel">
      <div class="row split-row">
        <div>
          <h3>Dernière observation</h3>
          <p class="muted">
            {{ latestObservation ? formatDate(latestObservation.observedAt) : "Aucune observation enregistrée." }}
          </p>
        </div>
        <span
          v-if="reminderDue"
          class="status-pill blocked"
        >
          Rappel de vérification
        </span>
      </div>

      <div
        v-if="latestObservation"
        class="observation-summary"
      >
        <p>
          Dernier état observé :
          <strong>{{ availabilityLabel(latestObservation.availability) }}</strong>
        </p>
        <p>
          Dernier prix observé :
          <strong v-if="latestObservation.price">
            {{ latestObservation.price.amount }} {{ latestObservation.price.currency }}
          </strong>
          <span
            v-else
            class="muted"
          >non renseigné</span>
        </p>
        <p class="muted">
          Source : {{ latestObservation.source }} · statut : {{ latestObservation.status }}
        </p>
      </div>

      <form
        class="observation-form"
        @submit.prevent="saveObservation"
      >
        <label>
          État observé
          <select v-model="availability">
            <option
              v-for="option in availabilityOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          Prix observé
          <input
            v-model="priceAmount"
            inputmode="decimal"
            placeholder="ex. 14,99"
          >
        </label>

        <label>
          Devise
          <input
            v-model="priceCurrency"
            maxlength="8"
          >
        </label>

        <label class="full-width">
          Note
          <textarea
            v-model="note"
            rows="3"
            placeholder="Option, coupon, variante ou contexte observé"
          />
        </label>

        <button type="submit">
          Mettre à jour l'observation
        </button>
      </form>

      <div class="observation-reminder">
        <label class="row">
          <input
            v-model="reminderEnabled"
            type="checkbox"
          >
          me rappeler de vérifier ce produit
        </label>
        <label>
          Intervalle
          <input
            v-model.number="reminderIntervalDays"
            min="1"
            max="365"
            type="number"
          >
        </label>
        <button
          type="button"
          @click="saveReminder"
        >
          Enregistrer le rappel
        </button>
        <p class="muted">
          Prochaine vérification : {{ formatDate(reminder?.nextCheckAt) }}
        </p>
      </div>

      <details v-if="observationHistory.length">
        <summary>Historique des observations ({{ observationHistory.length }})</summary>
        <ul class="observation-history">
          <li
            v-for="observation in observationHistory"
            :key="observation.id"
          >
            <strong>{{ availabilityLabel(observation.availability) }}</strong>
            <span v-if="observation.price">
              · {{ observation.price.amount }} {{ observation.price.currency }}
            </span>
            <span class="muted"> · {{ formatDate(observation.observedAt) }}</span>
          </li>
        </ul>
      </details>
    </section>

    <div
      v-if="snapshot.imageUrl"
      class="row"
    >
      <img
        :src="snapshot.imageUrl"
        alt="Image produit"
        style="max-width: 220px; max-height: 220px; object-fit: cover; border-radius: 8px"
      >
    </div>

    <div v-if="snapshot.galleryImageUrls.length">
      <h3>Images supplémentaires</h3>
      <div class="row">
        <img
          v-for="image in snapshot.galleryImageUrls"
          :key="image"
          :src="image"
          style="max-width: 90px; max-height: 90px; object-fit: cover; border-radius: 6px"
        >
      </div>
    </div>

    <div v-if="snapshot.notes">
      <h3>Notes</h3>
      <p class="muted">
        {{ snapshot.notes }}
      </p>
    </div>

    <div v-if="Object.keys(snapshot.selectedOptions).length">
      <h3>Options</h3>
      <ul>
        <li
          v-for="(value, key) in snapshot.selectedOptions"
          :key="key"
        >
          {{ key }}: {{ value }}
        </li>
      </ul>
    </div>

    <div class="actions">
      <button
        type="button"
        @click="goBack"
      >
        Retour
      </button>
    </div>
  </section>

  <section
    v-else
    class="panel"
  >
    <p>Produit introuvable.</p>
    <button
      type="button"
      @click="goBack"
    >
      Retour
    </button>
  </section>
</template>
