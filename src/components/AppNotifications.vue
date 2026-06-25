<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";

import { useNotificationsStore } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();
const items = computed(() => notificationsStore.items);
const dismissTimers = new Map<string, ReturnType<typeof window.setTimeout>>();

function dismiss(id: string): void {
  const timer = dismissTimers.get(id);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    dismissTimers.delete(id);
  }

  notificationsStore.dismiss(id);
}

watch(
  items,
  (nextItems) => {
    const liveIds = new Set(nextItems.map((item) => item.id));

    dismissTimers.forEach((timer, id) => {
      if (!liveIds.has(id)) {
        window.clearTimeout(timer);
        dismissTimers.delete(id);
      }
    });

    nextItems.forEach((item) => {
      if (item.persistent || dismissTimers.has(item.id)) {
        return;
      }

      dismissTimers.set(item.id, window.setTimeout(() => {
        dismiss(item.id);
      }, item.durationMs));
    });
  },
  { immediate: true, deep: true },
);

onUnmounted(() => {
  dismissTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  dismissTimers.clear();
});
</script>

<template>
  <div
    v-if="items.length"
    class="app-notifications"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="notification">
      <div
        v-for="item in items"
        :key="item.id"
        class="app-notification"
        :class="`app-notification--${item.kind}`"
        role="status"
      >
        <p class="app-notification__message">
          {{ item.message }}
        </p>
        <button
          class="app-notification__close"
          type="button"
          aria-label="Fermer la notification"
          @click="dismiss(item.id)"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
