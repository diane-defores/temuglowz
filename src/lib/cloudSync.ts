import { computed, ref } from "vue";

const syncEnabled = ref(false);

export const isSyncEnabled = computed(() => syncEnabled.value);

export function setSyncEnabled(enabled: boolean): void {
  syncEnabled.value = enabled;
}

export function queueExportForSync(): void {
  return;
}

export async function flushCloudSync(): Promise<void> {
  return;
}

