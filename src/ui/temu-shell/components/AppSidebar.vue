<template>
  <div class="desktop-shell">
    <aside
      v-if="modelValue"
      class="sidebar"
      :class="{ 'icons-only': iconsOnly }"
    >
      <div class="sidebar-content">
        <div class="sidebar-main">
          <div
            class="sidebar-toolbar"
            :class="{ centered: iconsOnly }"
          >
            <button
              class="header-icon-btn"
              type="button"
              aria-label="Mode compact"
              @click="iconsOnly = !iconsOnly"
            >
              <i class="pi pi-arrows-h" />
            </button>
          </div>

          <div class="menu-section">
            <div
              v-if="!iconsOnly"
              class="section-header"
            >
              <h3>Listes shopping</h3>
              <button
                class="sidebar-add-btn"
                type="button"
                aria-label="Créer une liste shopping"
                @click="openCreateListDialog"
              >
                <i class="pi pi-plus" />
              </button>
            </div>

            <div class="menu-items">
              <div
                v-for="list in shoppingLists"
                :key="list.id"
                class="sidebar-link-row"
              >
                <RouterLink
                  class="sidebar-link"
                  :class="{ 'justify-content-center': iconsOnly }"
                  :to="{ name: 'list-detail', params: { listId: list.id } }"
                  :title="list.name"
                >
                  <i class="pi pi-list" />
                  <span v-if="!iconsOnly">{{ list.name }}</span>
                  <span
                    v-if="!iconsOnly"
                    class="sidebar-count"
                  >
                    {{ itemCountForList(list.id) }}
                  </span>
                </RouterLink>
                <EntityActionsMenu
                  v-if="!iconsOnly"
                  :label="`Actions pour ${list.name}`"
                  @rename="openRenameListDialog(list)"
                  @delete="deleteList(list)"
                />
              </div>

              <button
                v-if="!shoppingLists.length"
                class="sidebar-link"
                type="button"
                @click="openCreateListDialog"
              >
                <i class="pi pi-list" />
                <span>Créer une liste</span>
              </button>
            </div>
          </div>

          <div class="menu-section">
            <div
              v-if="!iconsOnly"
              class="section-header"
            >
              <h3>Sessions</h3>
              <button
                class="sidebar-add-btn"
                type="button"
                aria-label="Créer une session shopping"
                @click="openCreateSessionDialog"
              >
                <i class="pi pi-plus" />
              </button>
            </div>

            <div class="menu-items">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="sidebar-link-row"
              >
                <button
                  class="sidebar-link"
                  :class="{
                    'justify-content-center': iconsOnly,
                    'sidebar-link--active': session.id === sessionsStore.activeSessionId,
                  }"
                  type="button"
                  :title="session.name"
                  @click="$emit('open-session', session)"
                >
                <span
                  class="sidebar-session-dot"
                  :class="sessionAccentClass(session.id)"
                  :style="sessionAccentStyle(session)"
                />
                  <span v-if="!iconsOnly">{{ session.name }}</span>
                </button>
                <EntityActionsMenu
                  v-if="!iconsOnly"
                  :label="`Actions pour ${session.name}`"
                  @rename="openRenameSessionDialog(session)"
                  @delete="deleteSession(session)"
                />
              </div>

              <button
                v-if="!sessions.length"
                class="sidebar-link"
                type="button"
                @click="openCreateSessionDialog"
              >
                <span class="sidebar-session-dot" />
                <span>Commencer</span>
              </button>
            </div>
          </div>

          <div
            v-if="!iconsOnly"
            class="menu-section"
          >
            <div class="section-header">
              <h3>Outils</h3>
            </div>
            <RouterLink
              class="sidebar-link"
              :to="{ name: 'manual-import' }"
            >
              <i class="pi pi-link" />
              <span>Import manuel</span>
            </RouterLink>
            <RouterLink
              class="sidebar-link"
              :to="{ name: 'sync' }"
            >
              <i class="pi pi-cloud-upload" />
              <span>Synchronisation</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </aside>

    <main class="desktop-content">
      <slot />
    </main>

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
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import type { ShoppingList, ShoppingSession } from "@/types/domain";
import EntityActionsMenu from "@/ui/temu-shell/components/EntityActionsMenu.vue";
import EntityNameDialog from "@/ui/temu-shell/components/EntityNameDialog.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "open-session": [session: ShoppingSession];
}>();

const router = useRouter();
const sessionsStore = useShoppingSessionsStore();
const shoppingListsStore = useShoppingListsStore();
const notificationsStore = useNotificationsStore();
const iconsOnly = ref(false);
const nameDialogVisible = ref(false);
const nameDialogMode = ref<"create-list" | "rename-list" | "create-session" | "rename-session">("create-list");
const nameDialogTargetId = ref<string | null>(null);
const nameDialogInitialValue = ref("");
const nameDialogError = ref("");
const sessions = computed(() => sessionsStore.sessionsByOrder);
const shoppingLists = computed(() => shoppingListsStore.listEntries);
const sessionAccentClasses = [
  "session-accent-0",
  "session-accent-1",
  "session-accent-2",
  "session-accent-3",
  "session-accent-4",
  "session-accent-5",
] as const;
const sessionAccentCount = sessionAccentClasses.length;

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
  if (message.includes("required")) return "Nom de liste requis.";
  if (message.includes("already exists")) return "Une liste porte déjà ce nom.";
  return "Impossible d'enregistrer cette liste.";
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
  nameDialogInitialValue.value = initialValue;
  nameDialogTargetId.value = targetId;
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
      const id = sessionsStore.createSession(name);
      const session = sessionsStore.getSession(id);
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

function sessionAccentClass(id: string): string {
  const index = Math.abs(id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return sessionAccentClasses[index % sessionAccentCount]!;
}

function sessionAccentStyle(session: ShoppingSession): Record<string, string> {
  if (!session.color) {
    return {};
  }
  return { "--session-accent-color": session.color };
}
</script>
