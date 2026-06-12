import { useProductObservationsStore } from "@/stores/productObservations";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { validateCloudSyncRecordPayload } from "@/lib/validators";
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
      if (!validateCloudSyncRecordPayload(record.domain, record.recordKey, record.payload).valid) {
        return false;
      }
      const payload = record.payload as ShoppingList;
      const existing = lists.lists[record.recordKey];
      if (existing && existing.updatedAt > record.localUpdatedAt) {
        return false;
      }
      lists.lists[record.recordKey] = payload;
      return true;
    }
    case "shopping_list_item": {
      if (!validateCloudSyncRecordPayload(record.domain, record.recordKey, record.payload).valid) {
        return false;
      }
      const payload = record.payload as ShoppingListItem;
      const existing = lists.items[record.recordKey];
      if (existing && existing.addedAt > record.localUpdatedAt) {
        return false;
      }
      lists.items[record.recordKey] = payload;
      return true;
    }
    case "product_snapshot": {
      if (!validateCloudSyncRecordPayload(record.domain, record.recordKey, record.payload).valid) {
        return false;
      }
      const payload = record.payload as ProductSnapshot;
      const existing = snapshots.snapshots[record.recordKey];
      if (existing && existing.updatedAt > record.localUpdatedAt) {
        return false;
      }
      snapshots.snapshots[record.recordKey] = payload;
      return true;
    }
    case "product_observation": {
      if (!validateCloudSyncRecordPayload(record.domain, record.recordKey, record.payload).valid) {
        return false;
      }
      const payload = record.payload as ProductObservation;
      const existing = observations.observations[record.recordKey];
      if (existing && existing.updatedAt > record.localUpdatedAt) {
        return false;
      }
      observations.observations[record.recordKey] = payload;
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
  if (!record.tombstone || record.tombstone.deletedAt <= 0) {
    return false;
  }

  const incomingVersion = record.tombstone.deletedAt;

  switch (record.domain) {
    case "shopping_list":
      if (lists.lists[record.recordKey]?.updatedAt > incomingVersion) {
        return false;
      }
      delete lists.lists[record.recordKey];
      return true;
    case "shopping_list_item":
      if (lists.items[record.recordKey]?.addedAt > incomingVersion) {
        return false;
      }
      delete lists.items[record.recordKey];
      for (const list of Object.values(lists.lists)) {
        list.itemIds = list.itemIds.filter((itemId) => itemId !== record.recordKey);
      }
      return true;
    case "product_snapshot":
      if (snapshots.snapshots[record.recordKey]?.updatedAt > incomingVersion) {
        return false;
      }
      delete snapshots.snapshots[record.recordKey];
      return true;
    case "product_observation":
      if (observations.observations[record.recordKey]?.updatedAt > incomingVersion) {
        return false;
      }
      delete observations.observations[record.recordKey];
      return true;
  }
}
