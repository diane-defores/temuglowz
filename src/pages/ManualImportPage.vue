<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useImportDraftsStore } from "@/stores/importDrafts";

const router = useRouter();
const importStore = useImportDraftsStore();

const manualUrl = ref("");
const message = ref("");
const error = ref("");

function parseManualUrl() {
  message.value = "";
  error.value = "";
  try {
    importStore.useManualUrl(manualUrl.value);
    message.value = "Pré-import prêt. Vérifiez le produit puis sauvegardez.";
    router.push({ name: "import-review" });
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function quickFillSample() {
  manualUrl.value = "https://www.temu.com/fr/product/sample-12345.html?utm_source=share";
}
</script>

<template>
  <main class="canonical-page">
    <div class="canonical-page-inner">
      <header class="canonical-page-header">
        <div class="canonical-title-block">
          <span class="canonical-kicker">Import produit</span>
          <h1 class="canonical-title">Import manuel</h1>
          <p class="canonical-subtitle">
            Collez un lien produit Temu et l'application créera un snapshot local.
          </p>
        </div>
      </header>

      <section class="canonical-card canonical-card--accent">
        <label class="canonical-field">
          <span>Lien produit Temu</span>
          <textarea
            v-model="manualUrl"
            class="canonical-textarea"
            rows="3"
            placeholder="https://www.temu.com/..."
          />
        </label>

        <div class="canonical-actions">
          <button
            class="canonical-button canonical-button--primary"
            type="button"
            :disabled="!manualUrl.trim()"
            @click="parseManualUrl"
          >
            <i class="pi pi-check" />
            <span>Valider l'URL</span>
          </button>
          <button
            class="canonical-button canonical-button--ghost"
            type="button"
            @click="quickFillSample"
          >
            <i class="pi pi-link" />
            <span>Exemple</span>
          </button>
        </div>

        <p
          v-if="message"
          class="canonical-success"
        >
          {{ message }}
        </p>
        <p
          v-if="error"
          class="canonical-error"
        >
          {{ error }}
        </p>
      </section>
    </div>
  </main>
</template>
