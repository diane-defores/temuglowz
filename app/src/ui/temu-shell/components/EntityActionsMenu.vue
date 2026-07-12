<template>
  <div class="entity-actions">
    <button
      class="entity-actions-trigger"
      type="button"
      :aria-label="label"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <i class="pi pi-ellipsis-v" />
    </button>
    <div
      v-if="open"
      class="entity-actions-popover"
      role="menu"
      @click.stop
    >
      <button
        class="entity-action-item"
        type="button"
        role="menuitem"
        @click="chooseRename"
      >
        <i class="pi pi-pencil" />
        <span>Renommer</span>
      </button>
      <button
        class="entity-action-item entity-action-item--danger"
        type="button"
        role="menuitem"
        @click="chooseDelete"
      >
        <i class="pi pi-trash" />
        <span>Supprimer</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(defineProps<{
  label?: string;
}>(), {
  label: "Actions",
});

const emit = defineEmits<{
  rename: [];
  delete: [];
}>();

const open = ref(false);

function chooseRename(): void {
  open.value = false;
  emit("rename");
}

function chooseDelete(): void {
  open.value = false;
  emit("delete");
}
</script>
