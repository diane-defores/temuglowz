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
const selectedOptionEntries = computed(() => Object.entries(snapshot.value?.selectedOptions ?? {}));

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
  router.replace({ name: "shopping-shell" });
}
</script>

<template>
  <main class="canonical-page">
    <div class="canonical-page-inner canonical-page-inner--wide">
      <template v-if="snapshot">
        <header class="canonical-page-header">
          <div class="canonical-title-block">
            <span class="canonical-kicker">Produit archivé</span>
            <h1 class="canonical-title">{{ snapshot.title }}</h1>
            <p class="canonical-subtitle">
              {{ snapshot.productId || "ID produit inconnu" }}
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

        <section class="canonical-card canonical-card--accent product-summary-card">
          <div
            v-if="snapshot.imageUrl"
            class="product-hero-media"
          >
            <img
              :src="snapshot.imageUrl"
              alt="Image produit"
              class="product-hero-image"
            >
          </div>
          <div class="canonical-list">
            <div class="product-meta-grid">
              <span class="canonical-status-pill">{{ availabilityLabel(snapshot.availability) }}</span>
              <span class="canonical-status-pill">Métadonnées : {{ snapshot.metadataStatus }}</span>
              <span class="canonical-status-pill">Quantité : {{ snapshot.quantity }}</span>
            </div>
            <p class="canonical-url">
              {{ snapshot.originalUrl }}
            </p>
            <p
              v-if="snapshot.notes"
              class="canonical-muted"
            >
              {{ snapshot.notes }}
            </p>
          </div>
        </section>

        <section
          v-if="snapshot.galleryImageUrls.length"
          class="canonical-card"
        >
          <div class="canonical-split-row">
            <h2 class="canonical-card-title">Images supplémentaires</h2>
            <span class="canonical-status-pill">{{ snapshot.galleryImageUrls.length }}</span>
          </div>
          <div class="product-gallery-grid">
            <img
              v-for="image in snapshot.galleryImageUrls"
              :key="image"
              :src="image"
              alt="Image produit supplémentaire"
              class="product-gallery-image"
            >
          </div>
        </section>

        <section
          v-if="selectedOptionEntries.length"
          class="canonical-card"
        >
          <h2 class="canonical-card-title">Options</h2>
          <div class="product-option-grid">
            <span
              v-for="[key, value] in selectedOptionEntries"
              :key="key"
              class="canonical-status-pill"
            >
              {{ key }} : {{ value }}
            </span>
          </div>
        </section>

        <section
          class="canonical-card"
          aria-label="Observations produit"
        >
          <div class="canonical-split-row">
            <div class="canonical-title-block">
              <h2 class="canonical-card-title">Dernière observation</h2>
              <p class="canonical-muted">
                {{ latestObservation ? formatDate(latestObservation.observedAt) : "Aucune observation enregistrée." }}
              </p>
            </div>
            <span
              v-if="reminderDue"
              class="canonical-status-pill canonical-status-pill--danger"
            >
              Rappel de vérification
            </span>
          </div>

          <div
            v-if="latestObservation"
            class="product-observation-summary"
          >
            <span class="canonical-status-pill canonical-status-pill--warning">
              {{ availabilityLabel(latestObservation.availability) }}
            </span>
            <span
              v-if="latestObservation.price"
              class="canonical-status-pill canonical-status-pill--success"
            >
              {{ latestObservation.price.amount }} {{ latestObservation.price.currency }}
            </span>
            <span class="canonical-status-pill">
              {{ latestObservation.source }} · {{ latestObservation.status }}
            </span>
          </div>

          <form
            class="canonical-form"
            @submit.prevent="saveObservation"
          >
            <div class="product-form-grid">
              <label class="canonical-field">
                <span>État observé</span>
                <select
                  v-model="availability"
                  class="canonical-select"
                >
                  <option
                    v-for="option in availabilityOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="canonical-field">
                <span>Prix observé</span>
                <input
                  v-model="priceAmount"
                  class="canonical-input"
                  inputmode="decimal"
                  placeholder="ex. 14,99"
                >
              </label>

              <label class="canonical-field">
                <span>Devise</span>
                <input
                  v-model="priceCurrency"
                  class="canonical-input"
                  maxlength="8"
                >
              </label>
            </div>

            <label class="canonical-field">
              <span>Note</span>
              <textarea
                v-model="note"
                class="canonical-textarea"
                rows="3"
                placeholder="Option, coupon, variante ou contexte observé"
              />
            </label>

            <div class="canonical-actions">
              <button
                class="canonical-button canonical-button--primary"
                type="submit"
              >
                <i class="pi pi-check" />
                <span>Mettre à jour l'observation</span>
              </button>
            </div>
          </form>
        </section>

        <section class="canonical-card canonical-card--flat">
          <div class="canonical-split-row">
            <label class="product-reminder-toggle">
              <input
                v-model="reminderEnabled"
                type="checkbox"
              >
              <span>Me rappeler de vérifier ce produit</span>
            </label>
            <span class="canonical-muted">
              Prochaine vérification : {{ formatDate(reminder?.nextCheckAt) }}
            </span>
          </div>
          <div class="canonical-actions">
            <label class="canonical-field product-reminder-interval">
              <span>Intervalle</span>
              <input
                v-model.number="reminderIntervalDays"
                class="canonical-input"
                min="1"
                max="365"
                type="number"
              >
            </label>
            <button
              class="canonical-button canonical-button--ghost"
              type="button"
              @click="saveReminder"
            >
              <i class="pi pi-bell" />
              <span>Enregistrer le rappel</span>
            </button>
          </div>
        </section>

        <details
          v-if="observationHistory.length"
          class="canonical-card product-history"
        >
          <summary class="product-history-summary">
            Historique des observations ({{ observationHistory.length }})
          </summary>
          <ul class="product-history-list">
            <li
              v-for="observation in observationHistory"
              :key="observation.id"
              class="product-history-item"
            >
              <strong>{{ availabilityLabel(observation.availability) }}</strong>
              <span v-if="observation.price">
                · {{ observation.price.amount }} {{ observation.price.currency }}
              </span>
              <span class="canonical-muted">· {{ formatDate(observation.observedAt) }}</span>
            </li>
          </ul>
        </details>
      </template>

      <section
        v-else
        class="canonical-card canonical-card--danger"
      >
        <div class="canonical-title-block">
          <span class="canonical-kicker">Produit archivé</span>
          <h1 class="canonical-title">Produit introuvable</h1>
          <p class="canonical-muted">
            Ce produit n'est plus disponible dans l'archive locale.
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
