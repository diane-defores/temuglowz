<script setup lang="ts">
import { computed } from "vue";

import {
  postAuthSyncFeedback,
  resetPostAuthSyncFeedback,
} from "@/lib/postAuthSyncFeedback";

const stageText = computed(() => {
  switch (postAuthSyncFeedback.stage) {
    case "waitingServer":
      return {
        title: "Vérification du compte",
        body: "Validation de la session avant toute synchronisation cloud.",
      };
    case "dataReceived":
      return {
        title: "Identité reconnue",
        body: "Le compte est connecté. L'accès cloud premium reste une vérification séparée.",
      };
    case "pending":
      return {
        title: "Accès premium à vérifier",
        body: "Recherche d'un entitlement serveur avant de relancer la file de synchronisation.",
      };
    case "dataApplied":
      return {
        title: "Données préparées",
        body: "L'accès premium est confirmé. La file locale peut maintenant être traitée pour ce compte.",
      };
    case "ready":
      return {
        title: "Synchronisation prête",
        body: "Le compte et l'accès premium sont confirmés pour cette session.",
      };
    case "blocked":
      return {
        title: "Synchronisation cloud bloquée",
        body: postAuthSyncFeedback.detail,
      };
    case "error":
      return {
        title: "Synchronisation indisponible",
        body: postAuthSyncFeedback.detail,
      };
    default:
      return {
        title: "",
        body: "",
      };
  }
});

const canDismiss = computed(() => {
  return postAuthSyncFeedback.mode === "blocked" || postAuthSyncFeedback.mode === "error";
});

const iconClass = computed(() => {
  switch (postAuthSyncFeedback.mode) {
    case "success":
      return "pi-check";
    case "blocked":
      return "pi-lock";
    case "error":
      return "pi-exclamation-triangle";
    default:
      return "pi-spin pi-spinner";
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
          :class="postAuthSyncFeedback.mode"
        >
          <div class="post-auth-sync-icon">
            <i
              class="pi"
              :class="iconClass"
            />
          </div>
          <h2>{{ stageText.title }}</h2>
          <p>{{ stageText.body }}</p>
          <button
            v-if="canDismiss"
            class="post-auth-sync-dismiss"
            type="button"
            @click="resetPostAuthSyncFeedback"
          >
            Fermer
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
