import type { ExportPayload, ShoppingList, ShoppingListItem, ProductSnapshot } from "@/types/domain";

const BACKUP_VERSION = "1.0.0";

export function serializeShoppingBackup(payload: {
  lists: ShoppingList[];
  items: ShoppingListItem[];
  snapshots: ProductSnapshot[];
}): ExportPayload {
  return {
    version: BACKUP_VERSION,
    createdAt: Date.now(),
    lists: payload.lists,
    items: payload.items,
    snapshots: payload.snapshots,
  };
}

export function serializeShoppingBackupToJson(payload: ExportPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseShoppingBackup(raw: string): ExportPayload {
  const parsed = JSON.parse(raw) as ExportPayload;

  if (parsed.version !== BACKUP_VERSION) {
    throw new Error("unsupported backup version");
  }

  if (!Array.isArray(parsed.lists) || !Array.isArray(parsed.items) || !Array.isArray(parsed.snapshots)) {
    throw new Error("invalid backup payload");
  }

  return parsed;
}

