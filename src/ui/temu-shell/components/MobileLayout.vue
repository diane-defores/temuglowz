<template>
  <div
    class="mobile-home"
    :class="{ 'mobile-home--desktop': desktop }"
  >
    <div class="mobile-topbar">
      <div class="mobile-brand">
        <span class="mobile-app-icon">
          <i class="pi pi-shopping-bag" />
        </span>
        <div class="mobile-topbar-title">
          <span class="mobile-app-name">Listes shopping Temu</span>
          <span class="mobile-app-subtitle">Sessions shopping et produits sauvegardés</span>
        </div>
      </div>
      <button
        class="settings-topbar-btn"
        type="button"
        aria-label="Paramètres"
        @click="$emit('open-settings')"
      >
        <i class="pi pi-cog" />
        <span>Paramètres</span>
      </button>
    </div>

    <div class="mobile-home-scroll">
      <section
        class="home-section"
        aria-labelledby="shopping-lists-heading"
      >
        <div class="section-heading-row">
          <div>
            <p
              id="shopping-lists-heading"
              class="section-title"
            >
              Listes shopping
            </p>
            <p class="section-subtitle">
              Vos produits sauvegardés, par besoin ou par projet.
            </p>
          </div>
          <button
            class="section-icon-action"
            type="button"
            aria-label="Créer une liste shopping"
            @click="openCreateListDialog"
          >
            <i class="pi pi-plus" />
          </button>
        </div>

        <div class="shopping-list-grid">
          <article
            v-for="list in shoppingLists"
            :key="list.id"
            class="shopping-list-card"
          >
            <RouterLink
              class="shopping-list-main"
              :to="{ name: 'list-detail', params: { listId: list.id } }"
            >
              <span class="shopping-list-icon">
                <i class="pi pi-list" />
              </span>
              <span class="shopping-list-copy">
                <span class="shopping-list-name">{{ list.name }}</span>
                <span class="shopping-list-meta">{{ itemCountForList(list.id) }} produit(s)</span>
                <span class="shopping-list-last">{{ lastSaved(list.id) }}</span>
              </span>
              <i class="pi pi-chevron-right shopping-list-arrow" />
            </RouterLink>
            <EntityActionsMenu
              :label="`Actions pour ${list.name}`"
              @rename="openRenameListDialog(list)"
              @delete="deleteList(list)"
            />
          </article>
        </div>
      </section>

      <section
        class="home-section sessions-section"
        aria-labelledby="sessions-heading"
      >
        <div class="section-heading-row">
          <div>
            <p
              id="sessions-heading"
              class="section-title"
            >
              Sessions shopping
            </p>
            <p class="section-subtitle">
              Chaque session ouvre Temu dans sa propre WebView native.
            </p>
          </div>
          <button
            class="section-icon-action"
            type="button"
            aria-label="Créer une session shopping"
            @click="openCreateSessionDialog"
          >
            <i class="pi pi-plus" />
          </button>
        </div>

        <div
          v-if="sessions.length"
          class="session-grid"
        >
          <article
            v-for="session in sessions"
            :key="session.id"
            class="session-launch-tile session-tile"
            :class="{ active: session.id === sessionsStore.activeSessionId }"
            :style="{ background: tileBg(session) }"
          >
            <button
              class="session-launch-main"
              type="button"
              @click="$emit('open-session', session)"
            >
              <span
                class="session-icon-wrap"
                :style="{ background: sessionAccent(session) }"
              >
                <i class="pi pi-shopping-cart" />
              </span>
              <span class="session-name">{{ session.name }}</span>
              <span class="session-meta">{{ formatSessionMeta(session) }}</span>
            </button>
            <EntityActionsMenu
              :label="`Actions pour ${session.name}`"
              @rename="openRenameSessionDialog(session)"
              @delete="deleteSession(session)"
            />
          </article>
        </div>

        <div
          v-else
          class="empty-session-state"
        >
          <i class="pi pi-shopping-bag" />
          <p>Aucune session shopping pour l'instant.</p>
          <button
            class="section-icon-action section-icon-action--primary"
            type="button"
            aria-label="Créer une session shopping"
            @click="openCreateSessionDialog"
          >
            <i class="pi pi-plus" />
          </button>
        </div>
      </section>

      <div class="home-utility-actions">
        <RouterLink
          class="utility-action-btn"
          :to="{ name: 'manual-import' }"
        >
          <i class="pi pi-link" />
          <span>Import manuel</span>
        </RouterLink>
        <RouterLink
          class="utility-action-btn"
          :to="{ name: 'sync' }"
        >
          <i class="pi pi-cloud-upload" />
          <span>Synchronisation</span>
        </RouterLink>
      </div>

      <p class="independence-note">
        Listes shopping Temu est indépendante de Temu. Les données de session et l'état de connexion restent dans cette application.
      </p>
    </div>

    <EntityNameDialog
      v-model="nameDialogVisible"
      :title="nameDialogTitle"
      :eyebrow="nameDialogEyebrow"
      :field-label="nameDialogFieldLabel"
      :placeholder="nameDialogPlaceholder"
      :initial-value="nameDialogInitialValue"
      :confirm-label="nameDialogConfirmLabel"
      :error="nameDialogError"
      @submit="submitNameDialog"
      @cancel="clearNameDialogError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useNotificationsStore } from "@/stores/notifications";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingList, ShoppingSession } from "@/types/domain";
import EntityActionsMenu from "@/ui/temu-shell/components/EntityActionsMenu.vue";
import EntityNameDialog from "@/ui/temu-shell/components/EntityNameDialog.vue";

defineProps<{
  desktop?: boolean;
}>();

const emit = defineEmits<{
  "open-session": [session: ShoppingSession];
  "open-settings": [];
}>();

const sessionsStore = useShoppingSessionsStore();
const shoppingListsStore = useShoppingListsStore();
const productStore = useProductSnapshotsStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const nameDialogVisible = ref(false);
const nameDialogMode = ref<"create-list" | "rename-list" | "create-session" | "rename-session">("create-list");
const nameDialogTargetId = ref<string | null>(null);
const nameDialogInitialValue = ref("");
const nameDialogError = ref("");

const sessions = computed(() => sessionsStore.sessionsByOrder);
const shoppingLists = computed<ShoppingList[]>(() => shoppingListsStore.listEntries);

const accents = ["#f97316", "#06b6d4", "#22c55e", "#a855f7", "#ef4444", "#0ea5e9"];

shoppingListsStore.initializeDefaults();

const nameDialogTitle = computed(() => {
  if (nameDialogMode.value === "create-session") return "Nommer la session";
  if (nameDialogMode.value === "rename-session") return "Renommer la session";
  if (nameDialogMode.value === "rename-list") return "Renommer la liste";
  return "Nommer la liste";
});

const nameDialogEyebrow = computed(() =>
  nameDialogMode.value.includes("session") ? "Session shopping" : "Liste shopping",
);

const nameDialogFieldLabel = computed(() =>
  nameDialogMode.value.includes("session") ? "Nom de la session" : "Nom de la liste",
);

const nameDialogPlaceholder = computed(() =>
  nameDialogMode.value.includes("session") ? "Ex. Cuisine, Cadeaux, Maison" : "Ex. Cuisine, Vacances, Bébé",
);

const nameDialogConfirmLabel = computed(() =>
  nameDialogMode.value.startsWith("rename") ? "Renommer" : "Créer",
);

function readableListError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("required")) {
    return "Nom de liste requis.";
  }
  if (message.includes("already exists")) {
    return "Une liste porte déjà ce nom.";
  }
  return "Impossible de créer la liste.";
}

function readableSessionError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("already used") || message.includes("empty")) {
    return "Nom de session requis ou déjà utilisé.";
  }
  return "Impossible d'enregistrer cette session.";
}

function openNameDialog(
  mode: typeof nameDialogMode.value,
  initialValue = "",
  targetId: string | null = null,
): void {
  nameDialogMode.value = mode;
  nameDialogTargetId.value = targetId;
  nameDialogInitialValue.value = initialValue;
  nameDialogError.value = "";
  nameDialogVisible.value = true;
}

function openCreateListDialog(): void {
  openNameDialog("create-list");
}

function openRenameListDialog(list: ShoppingList): void {
  openNameDialog("rename-list", list.name, list.id);
}

function openCreateSessionDialog(): void {
  openNameDialog("create-session");
}

function openRenameSessionDialog(session: ShoppingSession): void {
  openNameDialog("rename-session", session.name, session.id);
}

function clearNameDialogError(): void {
  nameDialogError.value = "";
}

function submitNameDialog(name: string): void {
  try {
    if (nameDialogMode.value === "create-list") {
      const listId = shoppingListsStore.createList(name);
      notificationsStore.success("Liste créée.");
      nameDialogVisible.value = false;
      void router.push({ name: "list-detail", params: { listId } });
      return;
    }

    if (nameDialogMode.value === "rename-list" && nameDialogTargetId.value) {
      shoppingListsStore.renameList(nameDialogTargetId.value, name);
      notificationsStore.success("Liste renommée.");
      nameDialogVisible.value = false;
      return;
    }

    if (nameDialogMode.value === "create-session") {
      const sessionId = sessionsStore.createSession(name);
      const session = sessionsStore.getSession(sessionId);
      notificationsStore.success("Session créée.");
      nameDialogVisible.value = false;
      if (session) {
        emit("open-session", session);
      }
      return;
    }

    if (nameDialogMode.value === "rename-session" && nameDialogTargetId.value) {
      sessionsStore.renameSession(nameDialogTargetId.value, name);
      notificationsStore.success("Session renommée.");
      nameDialogVisible.value = false;
    }
  } catch (error) {
    nameDialogError.value = nameDialogMode.value.includes("session")
      ? readableSessionError(error)
      : readableListError(error);
  }
}

function deleteList(list: ShoppingList): void {
  if (!window.confirm(`Supprimer la liste "${list.name}" et ses produits sauvegardés ?`)) {
    return;
  }

  try {
    shoppingListsStore.deleteList(list.id);
    notificationsStore.success("Liste supprimée.");
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de supprimer la liste.");
  }
}

function deleteSession(session: ShoppingSession): void {
  if (!window.confirm(`Supprimer la session "${session.name}" ?`)) {
    return;
  }

  try {
    sessionsStore.closeSession(session.id);
    notificationsStore.success("Session supprimée.");
  } catch (error) {
    notificationsStore.error(error instanceof Error ? error.message : "Impossible de supprimer la session.");
  }
}

function itemCountForList(listId: string): number {
  return shoppingListsStore.getListItems(listId).length;
}

function lastSaved(listId: string): string {
  const item = shoppingListsStore.getListItems(listId).at(-1);
  if (!item) {
    return "Aucun produit sauvegardé";
  }

  return productStore.getSnapshot(item.snapshotId)?.title ?? "Produit supprimé";
}

function sessionAccent(session: ShoppingSession): string {
  const index = Math.abs(session.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return session.color ?? accents[index % accents.length]!;
}

function tileBg(session: ShoppingSession): string {
  return `color-mix(in srgb, ${sessionAccent(session)} 8%, var(--surface-card))`;
}

function formatSessionMeta(session: ShoppingSession): string {
  if (session.lastCaptureAt) {
    return "Produit capturé";
  }
  if (session.currentUrl && session.currentUrl !== session.startUrl) {
    return "Navigation récente";
  }
  return "Prêt pour le shopping";
}
</script>
