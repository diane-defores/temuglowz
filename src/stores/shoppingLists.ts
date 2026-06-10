import { computed } from "vue";
import { defineStore } from "pinia";

import type { ShoppingList, ShoppingListItem } from "@/types/domain";
import { createId } from "@/utils/id";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";

interface ShoppingState {
  lists: Record<string, ShoppingList>;
  items: Record<string, ShoppingListItem>;
}

function now(): number {
  return Date.now();
}

function canonicalName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 64);
}

function ensureSeededLists(lists: Record<string, ShoppingList>): Record<string, ShoppingList> {
  if (Object.keys(lists).length > 0) {
    return lists;
  }

  const nowTime = now();
  const cuisineId = createId("list");
  return {
    [cuisineId]: {
      id: cuisineId,
      name: "Cuisine",
      itemIds: [],
      createdAt: nowTime,
      updatedAt: nowTime,
    },
  };
}

export const useShoppingListsStore = defineStore("shoppingLists", {
  state: (): ShoppingState => ({
    lists: {},
    items: {},
  }),

  getters: {
    listEntries: (state): ShoppingList[] =>
      Object.values(ensureSeededLists(state.lists)).sort(
        (a, b) => b.createdAt - a.createdAt,
      ),

    hasLists: (state): boolean => Object.keys(state.lists).length > 0,

    getList:
      (state) =>
      (listId: string): ShoppingList | undefined => {
        const lists = ensureSeededLists(state.lists);
        return lists[listId];
      },
  },

  actions: {
    initializeDefaults(): void {
      this.lists = ensureSeededLists(this.lists);
    },

    createList(rawName: string): string {
      const name = canonicalName(rawName);
      if (!name) {
        throw new Error("list name is required");
      }

      const existing = Object.values(this.lists).some((list) => list.name === name);
      if (existing) {
        throw new Error("a list with this name already exists");
      }

      const id = createId("list");
      this.lists[id] = {
        id,
        name,
        itemIds: [],
        createdAt: now(),
        updatedAt: now(),
      };

      return id;
    },

    renameList(listId: string, rawName: string): void {
      const name = canonicalName(rawName);
      const list = this.lists[listId];
      if (!list) {
        throw new Error("list not found");
      }

      if (!name) {
        throw new Error("list name is required");
      }

      list.name = name;
      list.updatedAt = now();
    },

    deleteList(listId: string): void {
      if (!this.lists[listId]) {
        throw new Error("list not found");
      }

      const removed = this.lists[listId];
      delete this.lists[listId];

      removed.itemIds.forEach((itemId) => {
        delete this.items[itemId];
      });

      this.initializeDefaults();
    },

    addItem(listId: string, snapshotId: string, quantity = 1, note = ""): string {
      const list = this.lists[listId];
      if (!list) {
        throw new Error("list not found");
      }

      if (!snapshotId) {
        throw new Error("snapshotId required");
      }

      const existingId = this.findItemBySnapshotId(list, snapshotId);
      if (existingId) {
        const existing = this.items[existingId];
        existing.quantity += quantity;
        existing.note = note.trim() || existing.note;
        list.updatedAt = now();
        return existingId;
      }

      const itemId = createId("item");
      const item: ShoppingListItem = {
        id: itemId,
        snapshotId,
        addedAt: now(),
        quantity,
        note: note.trim(),
      };

      this.items[itemId] = item;
      list.itemIds.unshift(itemId);
      list.updatedAt = now();

      return itemId;
    },

    removeItem(listId: string, itemId: string): void {
      const list = this.lists[listId];
      if (!list) {
        throw new Error("list not found");
      }

      list.itemIds = list.itemIds.filter((id) => id !== itemId);
      delete this.items[itemId];
      list.updatedAt = now();
      this.purgeUnusedSnapshots();
    },

    removeAllItems(listId: string): void {
      const list = this.lists[listId];
      if (!list) {
        return;
      }

      list.itemIds.forEach((itemId) => delete this.items[itemId]);
      list.itemIds = [];
      list.updatedAt = now();
      this.purgeUnusedSnapshots();
    },

    findItemBySnapshotId(list: ShoppingList, snapshotId: string): string | null {
      const match = list.itemIds.find((itemId) => this.items[itemId]?.snapshotId === snapshotId);
      return match ?? null;
    },

    getListItems(listId: string): ShoppingListItem[] {
      const list = this.lists[listId];
      if (!list) {
        return [];
      }

      return list.itemIds
        .map((id) => this.items[id])
        .filter((item): item is ShoppingListItem => Boolean(item));
    },

    setItemQuantity(listId: string, itemId: string, quantity: number): void {
      const list = this.lists[listId];
      const item = this.items[itemId];
      if (!list || !item || !list.itemIds.includes(itemId)) {
        return;
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error("quantity must be >= 1");
      }

      item.quantity = quantity;
      list.updatedAt = now();
    },

    findDuplicateByCanonicalOrProductId(listId: string, params: {
      canonicalUrl: string;
      productId?: string;
    }): string | null {
      const list = this.lists[listId];
      if (!list) {
        return null;
      }

      const snapshotsStore = useProductSnapshotsStore();
      const duplicate = snapshotsStore.findDuplicateByUrlOrProductId(
        params.canonicalUrl,
        params.productId,
      );
      if (!duplicate) {
        return null;
      }

      const existing = list.itemIds.find((itemId) => {
        const item = this.items[itemId];
        return item?.snapshotId === duplicate.id;
      });

      return existing ?? null;
    },

    purgeUnusedSnapshots(): void {
      const snapshotsStore = useProductSnapshotsStore();
      const referencedIds = new Set<string>();

      for (const list of Object.values(this.lists)) {
        list.itemIds.forEach((itemId) => {
          const item = this.items[itemId];
          if (item?.snapshotId) {
            referencedIds.add(item.snapshotId);
          }
        });
      }

      snapshotsStore.removeUnreferencedSnapshotIds(Array.from(referencedIds));
    },

    exportIdsByStore(): string[] {
      return Object.values(this.items).map((item) => item.snapshotId);
    },
  },

  persist: {
    key: "temu:shopping-lists",
  },
});

export function useShoppingListCount(): number {
  const store = useShoppingListsStore();
  return computed(() => store.listEntries.length).value;
}

