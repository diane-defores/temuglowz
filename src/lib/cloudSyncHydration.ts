import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import type {
  ProductObservation,
  ProductSnapshot,
  ShoppingList,
  ShoppingListItem,
} from "@/types/domain";
import type { CloudSyncRemoteRecord } from "@/lib/cloudSyncBackend";

export interface CloudSyncHydrationSummary {
  applied: number;
  skipped: number;
}

export function applyCloudSyncRecords(
  records: CloudSyncRemoteRecord[],
): CloudSyncHydrationSummary {
  let applied = 0;
  let skipped = 0;

  const lists = useShoppingListsStore();
  const snapshots = useProductSnapshotsStore();
  const observations = useProductObservationsStore();

  for (const record of records) {
    try {
      if (record.operationType === "delete") {
        if (applyDelete(record, lists, snapshots, observations)) {
          applied += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      if (applyUpsert(record, lists, snapshots, observations)) {
        applied += 1;
      } else {
        skipped += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  return { applied, skipped };
}

function applyUpsert(
  record: CloudSyncRemoteRecord,
  lists: ReturnType<typeof useShoppingListsStore>,
  snapshots: ReturnType<typeof useProductSnapshotsStore>,
  observations: ReturnType<typeof useProductObservationsStore>,
): boolean {
  switch (record.domain) {
    case "shopping_list": {
      if (!isShoppingList(record.payload)) {
        return false;
      }
      const existing = lists.lists[record.recordKey];
      if (existing && existing.updatedAt > record.payload.updatedAt) {
        return false;
      }
      lists.lists[record.recordKey] = record.payload;
      return true;
    }
    case "shopping_list_item": {
      if (!isShoppingListItem(record.payload)) {
        return false;
      }
      lists.items[record.recordKey] = record.payload;
      return true;
    }
    case "product_snapshot": {
      if (!isProductSnapshot(record.payload)) {
        return false;
      }
      const existing = snapshots.snapshots[record.recordKey];
      if (existing && existing.updatedAt > record.payload.updatedAt) {
        return false;
      }
      snapshots.snapshots[record.recordKey] = record.payload;
      return true;
    }
    case "product_observation": {
      if (!isProductObservation(record.payload)) {
        return false;
      }
      const existing = observations.observations[record.recordKey];
      if (existing && existing.updatedAt > record.payload.updatedAt) {
        return false;
      }
      observations.observations[record.recordKey] = record.payload;
      return true;
    }
  }
}

function applyDelete(
  record: CloudSyncRemoteRecord,
  lists: ReturnType<typeof useShoppingListsStore>,
  snapshots: ReturnType<typeof useProductSnapshotsStore>,
  observations: ReturnType<typeof useProductObservationsStore>,
): boolean {
  switch (record.domain) {
    case "shopping_list":
      delete lists.lists[record.recordKey];
      return true;
    case "shopping_list_item":
      delete lists.items[record.recordKey];
      for (const list of Object.values(lists.lists)) {
        list.itemIds = list.itemIds.filter((itemId) => itemId !== record.recordKey);
      }
      return true;
    case "product_snapshot":
      delete snapshots.snapshots[record.recordKey];
      return true;
    case "product_observation":
      delete observations.observations[record.recordKey];
      return true;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isShoppingList(value: unknown): value is ShoppingList {
  return (
    isObject(value)
    && typeof value.id === "string"
    && Array.isArray(value.itemIds)
    && value.itemIds.every((itemId) => typeof itemId === "string")
    && typeof value.name === "string"
    && typeof value.createdAt === "number"
    && typeof value.updatedAt === "number"
  );
}

function isShoppingListItem(value: unknown): value is ShoppingListItem {
  return (
    isObject(value)
    && typeof value.id === "string"
    && typeof value.snapshotId === "string"
    && typeof value.addedAt === "number"
    && typeof value.quantity === "number"
    && typeof value.note === "string"
  );
}

function isProductSnapshot(value: unknown): value is ProductSnapshot {
  return (
    isObject(value)
    && typeof value.id === "string"
    && typeof value.originalUrl === "string"
    && typeof value.canonicalUrl === "string"
    && typeof value.title === "string"
    && typeof value.notes === "string"
    && Array.isArray(value.galleryImageUrls)
    && typeof value.quantity === "number"
    && typeof value.availability === "string"
    && typeof value.metadataStatus === "string"
    && typeof value.capturedAt === "number"
    && typeof value.updatedAt === "number"
  );
}

function isProductObservation(value: unknown): value is ProductObservation {
  return (
    isObject(value)
    && typeof value.id === "string"
    && typeof value.snapshotId === "string"
    && typeof value.canonicalUrl === "string"
    && typeof value.source === "string"
    && typeof value.status === "string"
    && typeof value.confidence === "string"
    && typeof value.observedAt === "number"
    && typeof value.createdAt === "number"
    && typeof value.updatedAt === "number"
    && typeof value.availability === "string"
    && typeof value.note === "string"
  );
}
