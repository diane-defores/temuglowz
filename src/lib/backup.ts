import type {
  ExportPayload,
  ProductObservation,
  ProductSnapshot,
  ShoppingList,
  ShoppingListItem,
} from "@/types/domain";
import { validateProductObservationInput } from "@/lib/validators";

const BACKUP_VERSION = "1.0.0";

export function serializeShoppingBackup(payload: {
  lists: ShoppingList[];
  items: ShoppingListItem[];
  snapshots: ProductSnapshot[];
  observations?: ProductObservation[];
}): ExportPayload {
  return {
    version: BACKUP_VERSION,
    createdAt: Date.now(),
    lists: payload.lists,
    items: payload.items,
    snapshots: payload.snapshots,
    observations: payload.observations ?? [],
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

  if (parsed.observations !== undefined && !Array.isArray(parsed.observations)) {
    throw new Error("invalid backup observations");
  }

  if (
    parsed.observations?.some((observation) =>
      !validateProductObservationInput(observation).valid,
    )
  ) {
    throw new Error("invalid backup observation record");
  }

  return parsed;
}
