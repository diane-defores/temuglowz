<template>
  <Teleport to="body">
    <Transition name="temu-onboarding">
      <div
        v-if="modelValue"
        class="temu-onboarding-overlay"
        @click.self="pauseOnboarding"
      >
        <section
          class="temu-onboarding-card"
          aria-labelledby="temu-onboarding-title"
        >
          <header class="temu-onboarding-header">
            <div>
              <p class="settings-section-label temu-onboarding-kicker">Configuration Temu</p>
              <h2 id="temu-onboarding-title">Choisis les usages que tu veux activer</h2>
            </div>
            <button
              class="sheet-close-btn"
              type="button"
              aria-label="Fermer et reprendre plus tard"
              @click="pauseOnboarding"
            >
              <i class="pi pi-times" />
            </button>
          </header>

          <nav
            class="temu-onboarding-dots"
            aria-label="Progression onboarding"
          >
            <button
              v-for="(step, stepIndex) in steps"
              :key="step.id"
              class="temu-onboarding-dot"
              :class="dotClass(step)"
              type="button"
              :aria-current="stepIndex === currentIndex ? 'step' : undefined"
              :aria-label="`${step.title} - ${statusLabel(step)}`"
              @click="currentIndex = stepIndex"
            >
              <i
                class="pi"
                :class="step.icon"
              />
            </button>
          </nav>

          <article class="temu-onboarding-page">
            <span
              class="temu-onboarding-page-icon"
              :class="dotClass(activeStep)"
            >
              <i
                class="pi"
                :class="activeStep.icon"
              />
            </span>
            <div class="temu-onboarding-page-copy">
              <p class="settings-section-label">{{ activeStep.group }}</p>
              <h3>{{ activeStep.title }}</h3>
              <p>{{ activeStep.description }}</p>
            </div>
          </article>

          <div class="settings-account-card temu-onboarding-action-card">
            <p class="settings-account-hint">{{ activeStep.why }}</p>
            <div class="settings-account-actions-row">
              <span
                class="settings-account-status"
                :class="{ connected: activeStep.completed }"
              >
                {{ statusLabel(activeStep) }}
              </span>
              <button
                class="settings-sync-toggle"
                type="button"
                @click="runPrimaryAction(activeStep)"
              >
                <i
                  class="pi"
                  :class="activeStep.actionIcon"
                />
                <span>{{ activeStep.actionLabel }}</span>
              </button>
            </div>
          </div>

          <footer class="temu-onboarding-footer">
            <button
              class="settings-sync-toggle"
              type="button"
              @click="skipActiveStep"
            >
              <i class="pi pi-forward" />
              <span>Plus tard</span>
            </button>
            <button
              class="settings-sync-toggle temu-onboarding-primary"
              type="button"
              @click="goNext"
            >
              <span>{{ isLastStep ? "Terminer" : "Suivant" }}</span>
              <i
                class="pi"
                :class="isLastStep ? 'pi-check' : 'pi-chevron-right'"
              />
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { isAuthenticated } from "@/lib/convexAuth";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingSession } from "@/types/domain";

type OnboardingStep = {
  id: string;
  title: string;
  group: string;
  description: string;
  why: string;
  icon: string;
  actionIcon: string;
  actionLabel: string;
  completed: boolean;
  skipped: boolean;
};

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "open-session": [session: ShoppingSession];
  "open-settings": [];
}>();

const router = useRouter();
const sessionsStore = useShoppingSessionsStore();
const shoppingListsStore = useShoppingListsStore();
const productSnapshotsStore = useProductSnapshotsStore();
const currentIndex = ref(0);

const skippedStepIds = computed(() => sessionsStore.settings.onboardingSkippedStepIds ?? []);

const steps = computed<OnboardingStep[]>(() => [
  {
    id: "session",
    title: "Session Temu",
    group: "Shopping",
    description: "Crée ou ouvre une session WebView pour naviguer dans Temu depuis l'app.",
    why: "Les sessions gardent ton contexte shopping séparé des listes et rendent la capture produit disponible dans la WebView native.",
    icon: "pi-shopping-bag",
    actionIcon: "pi-external-link",
    actionLabel: sessionsStore.sessionsByOrder.length ? "Ouvrir une session" : "Créer une session",
    completed: sessionsStore.sessionsByOrder.length > 0,
    skipped: skippedStepIds.value.includes("session"),
  },
  {
    id: "import",
    title: "Capture produit",
    group: "Import",
    description: "Ajoute un produit Temu depuis la WebView ou avec un lien copié.",
    why: "C'est l'action centrale : chaque capture crée une fiche locale que tu peux ranger, suivre et retrouver.",
    icon: "pi-link",
    actionIcon: "pi-link",
    actionLabel: "Importer un lien",
    completed: Object.keys(productSnapshotsStore.snapshots).length > 0,
    skipped: skippedStepIds.value.includes("import"),
  },
  {
    id: "lists",
    title: "Listes shopping",
    group: "Organisation",
    description: "Prépare au moins une liste pour ranger les produits par besoin ou par projet.",
    why: "Les listes évitent de mélanger cadeaux, maison, cuisine ou achats à vérifier plus tard.",
    icon: "pi-list",
    actionIcon: "pi-plus",
    actionLabel: "Ouvrir les listes",
    completed: shoppingListsStore.listEntries.length > 0,
    skipped: skippedStepIds.value.includes("lists"),
  },
  {
    id: "preferences",
    title: "Préférences WebView",
    group: "Confort",
    description: "Ajuste le mode sombre, la taille du texte et le masquage des pop-ups Temu.",
    why: "Ces réglages rendent les sessions plus lisibles et réduisent le bruit pendant le shopping.",
    icon: "pi-sliders-h",
    actionIcon: "pi-cog",
    actionLabel: "Ouvrir les réglages",
    completed: sessionsStore.settings.hideTemuClutter !== false,
    skipped: skippedStepIds.value.includes("preferences"),
  },
  {
    id: "sync",
    title: "Compte et synchronisation",
    group: "Cloud",
    description: "Connecte le compte premium si tu veux retrouver tes listes entre appareils.",
    why: "L'application reste locale sans compte ; la connexion sert seulement aux fonctions cloud protégées.",
    icon: "pi-cloud-upload",
    actionIcon: "pi-cloud-upload",
    actionLabel: "Ouvrir la synchronisation",
    completed: isAuthenticated.value,
    skipped: skippedStepIds.value.includes("sync"),
  },
  {
    id: "support",
    title: "Diagnostic support",
    group: "Support",
    description: "Vérifie où copier le diagnostic de cette installation en cas de souci.",
    why: "Le diagnostic donne l'identité de build et les réglages utiles sans exposer de secrets.",
    icon: "pi-info-circle",
    actionIcon: "pi-copy",
    actionLabel: "Ouvrir support",
    completed: skippedStepIds.value.includes("support"),
    skipped: skippedStepIds.value.includes("support"),
  },
]);

const activeStep = computed(() => steps.value[currentIndex.value] ?? steps.value[0]!);
const isLastStep = computed(() => currentIndex.value >= steps.value.length - 1);
const allResolved = computed(() => steps.value.every((step) => step.completed || step.skipped));

function dotClass(step: OnboardingStep): string {
  if (step.skipped) {
    return "is-skipped";
  }
  if (step.completed) {
    return "is-completed";
  }
  if (step.id === activeStep.value.id) {
    return "is-current";
  }
  return "";
}

function statusLabel(step: OnboardingStep): string {
  if (step.completed) {
    return "Activé";
  }
  if (step.skipped) {
    return "Ignoré";
  }
  return "À configurer";
}

function closeOverlay(): void {
  emit("update:modelValue", false);
}

function pauseOnboarding(): void {
  sessionsStore.setOnboardingDismissed(true);
  closeOverlay();
}

function completeOnboarding(): void {
  sessionsStore.setOnboardingCompleted(true);
  closeOverlay();
}

function goNext(): void {
  if (isLastStep.value || allResolved.value) {
    completeOnboarding();
    return;
  }
  currentIndex.value += 1;
}

function skipActiveStep(): void {
  sessionsStore.skipOnboardingStep(activeStep.value.id);
  goNext();
}

function runPrimaryAction(step: OnboardingStep): void {
  if (step.id === "session") {
    const session = sessionsStore.sessionsByOrder[0];
    const sessionId = session?.id ?? sessionsStore.createSession("Shopping 1");
    const targetSession = sessionsStore.getSession(sessionId);
    if (targetSession) {
      emit("open-session", targetSession);
    }
    return;
  }

  if (step.id === "import") {
    closeOverlay();
    void router.push({ name: "manual-import" });
    return;
  }

  if (step.id === "lists") {
    closeOverlay();
    void router.push({ name: "shopping-shell" });
    return;
  }

  if (step.id === "sync") {
    closeOverlay();
    void router.push({ name: "sync" });
    return;
  }

  closeOverlay();
  emit("open-settings");
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      return;
    }
    const firstPending = steps.value.findIndex((step) => !step.completed && !step.skipped);
    currentIndex.value = firstPending >= 0 ? firstPending : 0;
  },
);
</script>
