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
  <main class="canonical-page">
    <div class="canonical-page-inner">
      <header class="canonical-page-header">
        <div class="canonical-title-block">
          <span class="canonical-kicker">Compte cloud</span>
          <h1 class="canonical-title">Synchronisation</h1>
          <p class="canonical-subtitle">
            État actuel : <strong>{{ statusLabel }}</strong>
          </p>
        </div>
        <span
          class="canonical-status-pill"
          :class="isSyncEnabled ? 'canonical-status-pill--success' : 'canonical-status-pill--danger'"
        >
          {{ pendingCount }} opération(s)
        </span>
      </header>

      <div class="canonical-alert">
        <strong>Cloud premium non activé.</strong>
        <span>
          L'authentification du compte est prête. Les écritures cloud réelles restent
          bloquées tant que l'entitlement premium
          <code class="canonical-code">temu_shopping_lists</code> n'est pas vérifié côté backend.
        </span>
      </div>

      <section class="canonical-card canonical-card--accent">
        <div class="canonical-split-row">
          <div class="canonical-title-block">
            <span class="canonical-section-label">Identité</span>
            <h2 class="canonical-card-title">Compte de synchronisation</h2>
            <p class="canonical-muted">
              État identité : <strong>{{ identityLabel }}</strong>
            </p>
          </div>
          <span
            class="canonical-status-pill"
            :class="isAuthenticated ? 'canonical-status-pill--success' : 'canonical-status-pill--danger'"
          >
            {{ isAuthenticated ? "Connecté" : "Local" }}
          </span>
        </div>

        <form
          v-if="!isAuthenticated"
          class="canonical-form"
          @submit.prevent="submitAccount('signIn')"
        >
          <label class="canonical-field">
            <span>Email</span>
            <input
              v-model="accountEmail"
              class="canonical-input"
              autocomplete="email"
              inputmode="email"
              placeholder="email@example.com"
              type="email"
            />
          </label>
          <label class="canonical-field">
            <span>Mot de passe</span>
            <input
              v-model="accountPassword"
              class="canonical-input"
              autocomplete="current-password"
              type="password"
            />
          </label>
          <p
            v-if="accountError"
            class="canonical-error"
          >
            {{ accountError }}
          </p>
          <div class="canonical-actions">
            <button
              class="canonical-button canonical-button--primary"
              type="submit"
              :disabled="accountBusy || !canSubmitAccount"
            >
              <i class="pi pi-sign-in" />
              <span>Connexion</span>
            </button>
            <button
              class="canonical-button canonical-button--ghost"
              type="button"
              :disabled="accountBusy || !canSubmitAccount"
              @click="submitAccount('signUp')"
            >
              <i class="pi pi-user-plus" />
              <span>Créer le compte</span>
            </button>
          </div>
        </form>

        <div
          v-else
          class="canonical-actions"
        >
          <button
            class="canonical-button canonical-button--ghost"
            type="button"
            :disabled="accountBusy"
            @click="signOut"
          >
            <i class="pi pi-sign-out" />
            <span>Déconnexion</span>
          </button>
        </div>
      </section>

      <section class="canonical-card">
        <div class="canonical-split-row">
          <div class="canonical-title-block">
            <span class="canonical-section-label">File locale</span>
            <h2 class="canonical-card-title">Opérations en attente</h2>
          </div>
          <button
            class="canonical-button canonical-button--danger"
            type="button"
            :disabled="!hasPending"
            @click="clearPendingQueue"
          >
            <i class="pi pi-trash" />
            <span>Vider</span>
          </button>
        </div>

        <div
          v-if="hasPending"
          class="canonical-list"
        >
          <article
            v-for="job in queuedJobs"
            :key="job.idempotencyKey"
            class="canonical-card canonical-card--flat canonical-queue-row"
          >
            <div class="canonical-split-row">
              <strong>{{ job.domain }}</strong>
              <span class="canonical-status-pill">{{ job.operationType }}</span>
            </div>
            <p class="canonical-muted">{{ job.recordKey }}</p>
            <p class="canonical-muted">
              Tentatives : {{ job.attempts }} · Appareil : {{ job.sourceDeviceId }}
            </p>
          </article>
        </div>

        <div
          v-else
          class="canonical-empty"
        >
          <i class="pi pi-cloud" />
          <p class="canonical-muted">Aucune opération locale en attente.</p>
        </div>
      </section>
    </div>
  </main>
</template>
