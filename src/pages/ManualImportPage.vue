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
  <section class="panel">
    <h2>Import manuel</h2>
    <p class="muted">Coller un lien produit Temu et l'application créera un snapshot local.</p>
    <textarea
      v-model="manualUrl"
      class="full-width"
      rows="3"
      placeholder="https://www.temu.com/..."
    ></textarea>

    <div class="actions">
      <button type="button" :disabled="!manualUrl.trim()" @click="parseManualUrl">
        Valider l’URL
      </button>
      <button type="button" @click="quickFillSample">Exemple</button>
    </div>

  <p class="muted" v-if="message">{{ message }}</p>
  <p class="danger" v-if="error">{{ error }}</p>
  </section>
</template>
