<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="sheet-overlay"
        @click.self="closeSheet"
      >
        <div
          ref="sheetRef"
          class="settings-panel settings-sheet"
          :class="{ 'is-dark': sessionsStore.settings.darkMode }"
          :style="sheetStyle"
        >
          <div
            class="sheet-drag-zone"
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragCancel"
          >
            <div class="sheet-handle" />
            <div class="sheet-header">
              <span class="sheet-title">Paramètres</span>
              <button
                class="sheet-close-btn"
                type="button"
                @click="closeSheet"
              >
                <i class="pi pi-times" />
              </button>
            </div>
          </div>

          <div class="settings-content">
            <p class="settings-section-label">Sessions shopping</p>
            <div class="settings-account-card">
              <p class="settings-account-hint">
                Listes shopping Temu est indépendante de Temu. Les sessions WebView, cookies et liens capturés restent en local.
              </p>
              <div class="settings-account-actions-row">
                <span class="settings-account-status connected">
                  {{ sessionCountLabel }}
                </span>
                <RouterLink
                  class="settings-sync-toggle"
                  :to="{ name: 'lists' }"
                  @click="closeSheet"
                >
                  <span>Ouvrir les listes</span>
                  <i class="pi pi-chevron-right" />
                </RouterLink>
              </div>
            </div>

            <p class="settings-section-label">Préférences</p>

            <div class="settings-toggle-row">
              <span class="settings-toggle-label">
                <i class="pi pi-moon" />
                Mode sombre
              </span>
              <button
                class="settings-toggle-pill"
                :class="{ enabled: sessionsStore.settings.darkMode }"
                type="button"
                @click="toggleDarkMode"
              >
                <span class="toggle-thumb" />
              </button>
            </div>

            <div class="settings-toggle-row">
              <span class="settings-toggle-label">
                <i class="pi pi-search-plus" />
                Taille du texte
              </span>
              <span class="text-zoom-value">{{ textZoomLevel }}%</span>
            </div>
            <input
              v-model.number="textZoomLevel"
              type="range"
              class="text-zoom-slider"
              :min="TEXT_ZOOM_MIN"
              :max="TEXT_ZOOM_MAX"
              :step="TEXT_ZOOM_STEP"
              @change="onTextZoomChange"
            />

            <div class="settings-route-grid">
              <RouterLink
                class="settings-route-link"
                :to="{ name: 'manual-import' }"
                @click="closeSheet"
              >
                <i class="pi pi-link" />
                <span>Import manuel</span>
              </RouterLink>
              <RouterLink
                class="settings-route-link"
                :to="{ name: 'sync' }"
                @click="closeSheet"
              >
                <i class="pi pi-cloud-upload" />
                <span>Synchronisation</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useShoppingSessionsStore } from "@/stores/shoppingSessions";
import { setDarkMode, setTextZoom } from "@/lib/temuWebview";
import {
  TEXT_ZOOM_MAX,
  TEXT_ZOOM_MIN,
  TEXT_ZOOM_STEP,
  normalizeTextZoomLevel,
} from "../utils/textZoom";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const sessionsStore = useShoppingSessionsStore();
const textZoomLevel = ref(normalizeTextZoomLevel(sessionsStore.settings.textZoom));

const sessionCountLabel = computed(() => {
  const count = sessionsStore.sessionsByOrder.length;
  return count === 1 ? "1 session" : `${count} sessions`;
});

function closeSheet(): void {
  emit("update:modelValue", false);
}

function toggleDarkMode(): void {
  const next = !sessionsStore.settings.darkMode;
  sessionsStore.setDarkMode(next);
  void setDarkMode(next);
}

function onTextZoomChange(): void {
  const level = normalizeTextZoomLevel(textZoomLevel.value);
  textZoomLevel.value = level;
  sessionsStore.setTextZoom(level);
  void setTextZoom(level);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      textZoomLevel.value = normalizeTextZoomLevel(sessionsStore.settings.textZoom);
      dragOffset.value = 0;
      isDragging.value = false;
      activePointerId.value = null;
    }
  },
);

const sheetRef = ref<HTMLElement | null>(null);
const dragOffset = ref(0);
const isDragging = ref(false);
const activePointerId = ref<number | null>(null);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const sheetStyle = computed(() => ({
  "--sheet-drag-offset": `${dragOffset.value}px`,
  transition: isDragging.value ? "none" : "transform 250ms ease",
}));

function getDismissThreshold(): number {
  const sheetHeight = sheetRef.value?.offsetHeight ?? window.innerHeight * 0.5;
  return Math.min(140, Math.max(72, sheetHeight * 0.2));
}

function shouldIgnoreDragStart(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest("button, a, input, textarea, select, label, [role='button']"));
}

function onDragStart(event: PointerEvent): void {
  if (!props.modelValue || !event.isPrimary) {
    return;
  }
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  if (shouldIgnoreDragStart(event.target)) {
    return;
  }

  isDragging.value = true;
  activePointerId.value = event.pointerId;
  dragStartY.value = event.clientY;
  dragStartTime.value = event.timeStamp || performance.now();
  dragOffset.value = 0;
  (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
}

function onDragMove(event: PointerEvent): void {
  if (!isDragging.value || event.pointerId !== activePointerId.value) {
    return;
  }

  const nextOffset = Math.max(0, event.clientY - dragStartY.value);
  dragOffset.value = nextOffset;
  if (nextOffset > 0) {
    event.preventDefault();
  }
}

function finishDrag(event?: PointerEvent): void {
  if (!isDragging.value) {
    return;
  }
  if (event && event.pointerId !== activePointerId.value) {
    return;
  }

  const elapsed = Math.max(1, (event?.timeStamp || performance.now()) - dragStartTime.value);
  const velocity = dragOffset.value / elapsed;
  const shouldClose = dragOffset.value >= getDismissThreshold() || velocity >= 0.6;

  isDragging.value = false;
  activePointerId.value = null;

  if (shouldClose) {
    closeSheet();
    window.setTimeout(() => {
      dragOffset.value = 0;
    }, 250);
    return;
  }

  dragOffset.value = 0;
}

function onDragEnd(event: PointerEvent): void {
  finishDrag(event);
}

function onDragCancel(event: PointerEvent): void {
  finishDrag(event);
}
</script>
