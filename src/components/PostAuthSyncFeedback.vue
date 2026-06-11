<script setup lang="ts">
import { computed } from "vue";

import { postAuthSyncFeedback } from "@/lib/postAuthSyncFeedback";

const stageText = computed(() => {
  switch (postAuthSyncFeedback.stage) {
    case "waitingServer":
      return {
        title: "Connexion au compte",
        body: "Validation de la session et préparation de la synchronisation.",
      };
    case "dataReceived":
      return {
        title: "Identité reconnue",
        body: "Le compte est connecté. L'accès cloud premium reste une vérification séparée.",
      };
    case "dataApplied":
      return {
        title: "Préparation locale terminée",
        body: "Aucune donnée cloud premium n'est appliquée tant que l'entitlement n'est pas actif.",
      };
    case "ready":
      return {
        title: "Compte connecté",
        body: "Vous pouvez continuer en local. La synchronisation cloud reste protégée par entitlement.",
      };
    default:
      return {
        title: "",
        body: "",
      };
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="post-auth-sync">
      <div
        v-if="postAuthSyncFeedback.visible"
        class="post-auth-sync-overlay"
      >
        <div
          class="post-auth-sync-card"
          :class="{ success: postAuthSyncFeedback.mode === 'success' }"
        >
          <div class="post-auth-sync-icon">
            <i
              class="pi"
              :class="postAuthSyncFeedback.mode === 'success' ? 'pi-check' : 'pi-spin pi-spinner'"
            />
          </div>
          <h2>{{ stageText.title }}</h2>
          <p>{{ stageText.body }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
