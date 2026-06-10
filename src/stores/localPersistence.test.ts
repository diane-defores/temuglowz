import { beforeEach, describe, expect, it } from "vitest";

import { createPinia, setActivePinia } from "pinia";

import { serializeShoppingBackup, parseShoppingBackup } from "@/lib/backup";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import { useShoppingListsStore } from "@/stores/shoppingLists";

function withStores() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return {
    shoppingLists: useShoppingListsStore(),
    snapshots: useProductSnapshotsStore(),
  };
}

class LocalStorageBag {
  private readonly data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }
}

function buildSnapshot(
  canonicalUrl: string,
) {
  const now = Date.now();
  return {
    id: "snapshot-1",
    productId: "100",
    originalUrl: canonicalUrl,
    canonicalUrl,
    source: "manual" as const,
    title: "Article",
    notes: "",
    galleryImageUrls: [],
    selectedOptions: {},
    quantity: 1,
    availability: "unknown" as const,
    metadataStatus: "ok" as const,
    capturedAt: now,
    updatedAt: now,
  };
}

describe("Shopping list stores and offline backup export", () => {
  beforeEach(() => {
    const storage = new LocalStorageBag();
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
  });

  it("creates list, saves snapshot, and prevents duplicates in same list", () => {
    const { shoppingLists, snapshots } = withStores();
    const [seedId] = shoppingLists.listEntries.map((item) => item.id);
    expect(seedId).toBeTruthy();

    const userListId = shoppingLists.createList("Maison");
    const snapshot = buildSnapshot("https://www.temu.com/fr/product/100.html");
    snapshots.snapshots[snapshot.id] = snapshot;

    const firstItem = shoppingLists.addItem(userListId, snapshot.id, 1);
    expect(firstItem).toBeTruthy();
    expect(shoppingLists.getListItems(userListId)).toHaveLength(1);
    const second = shoppingLists.addItem(userListId, snapshot.id, 2);
    expect(second).toBe(firstItem);
    expect(shoppingLists.getListItems(userListId)).toHaveLength(1);
    expect(shoppingLists.getListItems(userListId)[0]!.quantity).toBe(3);
  });

  it("keeps shared snapshots referenced by multiple lists", () => {
    const { shoppingLists, snapshots } = withStores();

    const listA = shoppingLists.createList("Maison");
    const listB = shoppingLists.createList("Voyage");
    const snapshot = buildSnapshot("https://www.temu.com/fr/product/111.html");
    snapshots.snapshots[snapshot.id] = snapshot;

    shoppingLists.addItem(listA, snapshot.id);
    shoppingLists.addItem(listB, snapshot.id);

    shoppingLists.deleteList(listB);
    expect(snapshots.getSnapshot(snapshot.id)).toBeTruthy();
    expect(shoppingLists.getListItems(listA)).toHaveLength(1);
  });

  it("exports and reimports backup payload", () => {
    const { shoppingLists, snapshots } = withStores();
    const listId = shoppingLists.createList("Maison");
    const snapshot = buildSnapshot("https://www.temu.com/fr/product/222.html");
    snapshots.snapshots[snapshot.id] = snapshot;
    shoppingLists.addItem(listId, snapshot.id);

    const payload = serializeShoppingBackup({
      lists: shoppingLists.listEntries,
      items: Object.values(shoppingLists.items),
      snapshots: Object.values(snapshots.snapshots),
    });
    const json = JSON.stringify(payload);
    const parsed = parseShoppingBackup(json);

    expect(parsed.lists).toEqual(expect.arrayContaining(payload.lists));
    expect(parsed.items).toEqual(expect.arrayContaining(payload.items));
    expect(parsed.snapshots).toEqual(expect.arrayContaining(payload.snapshots));
  });
});
