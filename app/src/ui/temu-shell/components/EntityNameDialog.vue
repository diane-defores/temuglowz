<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="entity-dialog-overlay"
      @click.self="cancel"
    >
      <form
        class="entity-dialog-panel"
        @submit.prevent="submit"
      >
        <div class="entity-dialog-header">
          <div>
            <p class="canonical-kicker">{{ eyebrow }}</p>
            <h2 class="entity-dialog-title">{{ title }}</h2>
          </div>
          <button
            class="canonical-button canonical-button--icon"
            type="button"
            aria-label="Fermer"
            @click="cancel"
          >
            <i class="pi pi-times" />
          </button>
        </div>

        <label class="canonical-field">
          {{ fieldLabel }}
          <input
            ref="inputRef"
            v-model="draft"
            class="canonical-input"
            maxlength="64"
            :placeholder="placeholder"
            :aria-label="fieldLabel"
          >
        </label>

        <p
          v-if="error"
          class="canonical-error"
        >
          {{ error }}
        </p>

        <div class="canonical-actions entity-dialog-actions">
          <button
            class="canonical-button canonical-button--ghost"
            type="button"
            @click="cancel"
          >
            <i class="pi pi-times" />
            <span>Annuler</span>
          </button>
          <button
            class="canonical-button canonical-button--primary"
            type="submit"
            :disabled="!draft.trim()"
          >
            <i class="pi pi-check" />
            <span>{{ confirmLabel }}</span>
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  eyebrow?: string;
  fieldLabel?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  error?: string;
}>(), {
  eyebrow: "Nom",
  fieldLabel: "Nom",
  placeholder: "Nom",
  initialValue: "",
  confirmLabel: "Valider",
  error: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [name: string];
  cancel: [];
}>();

const draft = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) {
      return;
    }
    draft.value = props.initialValue;
    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select();
  },
);

watch(
  () => props.initialValue,
  (value) => {
    if (props.modelValue) {
      draft.value = value;
    }
  },
);

function submit(): void {
  const name = draft.value.trim();
  if (!name) {
    return;
  }
  emit("submit", name);
}

function cancel(): void {
  emit("update:modelValue", false);
  emit("cancel");
}
</script>
