<script setup lang="ts">
import { computed, ref } from "vue";

import {
  finalizePasswordSignIn,
  getStoredCloudAccountEmail,
  isSyncEnabled,
} from "@/lib/cloudSync";
import {
  clearCloudSyncQueue,
  listCloudSyncQueue,
} from "@/lib/cloudSyncQueue";
import {
  authBootstrapError,
  isAuthenticated,
  isAuthLoading,
  isConvexConfigured,
  signIn,
  signOut as convexSignOut,
} from "@/lib/convexAuth";
import {
  beginPostAuthSyncFeedback,
  resetPostAuthSyncFeedback,
} from "@/lib/postAuthSyncFeedback";

const queuedJobs = computed(() => listCloudSyncQueue());
const pendingCount = computed(() => queuedJobs.value.length);
const hasPending = computed(() => pendingCount.value > 0);
const accountEmail = ref(getStoredCloudAccountEmail());
const accountPassword = ref("");
const accountBusy = ref(false);
const accountError = ref("");
const statusLabel = computed(() => {
  if (isSyncEnabled.value) {
    return hasPending.value ? "En attente" : "Session locale active";
  }

  return hasPending.value ? "Bloquée" : "Locale uniquement";
});
const identityLabel = computed(() => {
  if (isAuthLoading.value) {
    return "Connexion en cours";
  }
  if (!isConvexConfigured.value) {
    return "Auth non configurée";
  }
  if (authBootstrapError.value) {
    return "Auth indisponible";
  }
  return isAuthenticated.value ? "Compte connecté" : "Compte local";
});
const canSubmitAccount = computed(() => {
  return (
    isConvexConfigured.value
    && !isAuthLoading.value
    && accountEmail.value.trim().length > 3
    && accountPassword.value.length >= 8
  );
});

function clearPendingQueue() {
  clearCloudSyncQueue();
}

function authErrorMessage(error: unknown, flow: "signIn" | "signUp"): string {
  const message = error instanceof Error ? error.message : "";
  if (flow === "signUp" && /already exists/i.test(message)) {
    return "Ce compte existe déjà. Utilise Connexion.";
  }
  if (flow === "signIn" && /invalid/i.test(message)) {
    return "Identifiants invalides.";
  }
  return message || "Connexion impossible pour le moment.";
}

async function submitAccount(flow: "signIn" | "signUp"): Promise<void> {
  accountBusy.value = true;
  accountError.value = "";
  try {
    const normalizedEmail = accountEmail.value.trim().toLowerCase();
    accountEmail.value = normalizedEmail;
    beginPostAuthSyncFeedback();
    await signIn("password", {
      email: normalizedEmail,
      password: accountPassword.value,
      flow,
    });
    accountPassword.value = "";
    await finalizePasswordSignIn({
      email: normalizedEmail,
      flow,
    });
  } catch (error) {
    resetPostAuthSyncFeedback();
    accountError.value = authErrorMessage(error, flow);
  } finally {
    accountBusy.value = false;
  }
}

async function signOut(): Promise<void> {
  accountBusy.value = true;
  accountError.value = "";
  try {
    await convexSignOut();
  } catch (error) {
    accountError.value = error instanceof Error ? error.message : "Déconnexion impossible.";
  } finally {
    accountBusy.value = false;
  }
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
        L'auth est maintenant reprise du modèle SocialGlowz. Les écritures cloud
        réelles restent bloquées tant que l'entitlement premium
        <code>temu_shopping_lists</code> n'est pas vérifié côté backend.
      </span>
    </div>

    <section class="sync-onboarding-card">
      <div class="row sync-job-row">
        <div>
          <h3>Compte de synchronisation</h3>
          <p class="muted">
            État identité : <strong>{{ identityLabel }}</strong>
          </p>
        </div>
        <span
          class="status-pill"
          :class="{ blocked: !isAuthenticated }"
        >
          {{ isAuthenticated ? "Connecté" : "Local" }}
        </span>
      </div>

      <form
        v-if="!isAuthenticated"
        class="sync-auth-form"
        @submit.prevent="submitAccount('signIn')"
      >
        <label>
          <span>Email</span>
          <input
            v-model="accountEmail"
            autocomplete="email"
            inputmode="email"
            placeholder="email@example.com"
            type="email"
          />
        </label>
        <label>
          <span>Mot de passe</span>
          <input
            v-model="accountPassword"
            autocomplete="current-password"
            type="password"
          />
        </label>
        <p
          v-if="accountError"
          class="danger"
        >
          {{ accountError }}
        </p>
        <div class="actions">
          <button
            type="submit"
            :disabled="accountBusy || !canSubmitAccount"
          >
            Connexion
          </button>
          <button
            type="button"
            :disabled="accountBusy || !canSubmitAccount"
            @click="submitAccount('signUp')"
          >
            Créer le compte
          </button>
        </div>
      </form>

      <div
        v-else
        class="actions"
      >
        <button
          type="button"
          :disabled="accountBusy"
          @click="signOut"
        >
          Déconnexion
        </button>
      </div>
    </section>

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
