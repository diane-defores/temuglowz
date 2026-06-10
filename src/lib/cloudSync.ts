import { computed, ref } from "vue";

import type { EntitlementSnapshot } from "@/lib/accessModel";
import { canUseProtectedFeature } from "@/lib/accessModel";

const syncEnabled = ref(false);

export const isSyncEnabled = computed(() => syncEnabled.value);

export function setSyncEnabled(
  enabled: boolean,
  entitlement?: EntitlementSnapshot | null,
): void {
  syncEnabled.value = enabled && canUseProtectedFeature(entitlement);
}

export function queueExportForSync(): void {
  return;
}

// Placeholder only: production sync must re-check suite-ledger access server-side.
export async function flushCloudSync(): Promise<void> {
  return;
}
