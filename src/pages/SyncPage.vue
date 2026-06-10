<script setup lang="ts">
import { computed } from "vue";

import { isSyncEnabled } from "@/lib/cloudSync";
import {
  clearCloudSyncQueue,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";

const queuedJobs = computed(() => listCloudSyncQueue());
const pendingCount = computed(() => queuedJobs.value.length);
const hasPending = computed(() => pendingCount.value > 0);
const statusLabel = computed(() => {
  if (isSyncEnabled.value) {
    return hasPending.value ? "En attente" : "Session locale active";
  }

  return hasPending.value ? "Bloquée" : "Locale uniquement";
});

function clearPendingQueue() {
  clearCloudSyncQueue();
}
</script>

<template>
  <section class="panel">
    <div class="row sync-header">
      <div>
        <h2>Synchronisation</h2>
        <p class="muted">
          État actuel : <strong>{{ statusLabel }}</strong>
        </p>
      </div>
      <span class="status-pill" :class="{ blocked: !isSyncEnabled }">
        {{ pendingCount }} opération(s)
      </span>
    </div>

    <div class="notice">
      <strong>Cloud premium non activé.</strong>
      <span>
        Les données restent lisibles localement. Les écritures cloud réelles sont
        bloquées jusqu'au branchement du compte suite, de l'entitlement premium
        et du déploiement Convex.
      </span>
    </div>

    <div v-if="hasPending" class="card-list">
      <article
        v-for="job in queuedJobs"
        :key="job.idempotencyKey"
        class="item-card"
      >
        <div class="row sync-job-row">
          <strong>{{ job.domain }}</strong>
          <span>{{ job.operationType }}</span>
          <span class="muted">{{ job.recordKey }}</span>
        </div>
        <p class="muted">
          Tentatives: {{ job.attempts }} · Appareil: {{ job.sourceDeviceId }}
        </p>
      </article>
    </div>

    <p v-else class="muted">
      Aucune opération locale en attente.
    </p>

    <div class="actions">
      <button type="button" :disabled="!hasPending" @click="clearPendingQueue">
        Vider la file locale
      </button>
    </div>
  </section>
</template>
