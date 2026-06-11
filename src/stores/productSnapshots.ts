import { defineStore } from "pinia";

import { createId } from "@/utils/id";
import { normalizeTemuProductUrl } from "@/utils/url";
import {
  queueCloudSyncDelete,
  queueCloudSyncUpsert,
} from "@/lib/cloudSync";
import { validateProductSnapshotInput } from "@/lib/validators";
import { useProductObservationsStore } from "@/stores/productObservations";
import type {
  ProductPriceSnapshot,
  ProductSnapshot,
  ImportSource,
  SnapshotMetadataStatus,
} from "@/types/domain";

interface ProductSnapshotState {
  snapshots: Record<string, ProductSnapshot>;
}

function now(): number {
  return Date.now();
}

export const useProductSnapshotsStore = defineStore("productSnapshots", {
  state: (): ProductSnapshotState => ({
    snapshots: {},
  }),

  getters: {
    snapshotIds: (state): string[] => Object.keys(state.snapshots),

    allSnapshots: (state): ProductSnapshot[] =>
      Object.values(state.snapshots).sort((a, b) => b.capturedAt - a.capturedAt),
  },

  actions: {
    getSnapshot(id: string): ProductSnapshot | undefined {
      return this.snapshots[id];
    },

    listItemsByIds(ids: string[]): ProductSnapshot[] {
      return ids
        .map((id) => this.snapshots[id])
        .filter((snapshot): snapshot is ProductSnapshot => Boolean(snapshot));
    },

    upsertSnapshot(snapshot: ProductSnapshot): void {
      const validation = validateProductSnapshotInput(snapshot);
      if (!validation.valid) {
        throw new Error(`invalid product snapshot: ${validation.errors.join(",")}`);
      }

      this.snapshots[snapshot.id] = {
        ...snapshot,
        updatedAt: now(),
      };
      queueCloudSyncUpsert("product_snapshot", snapshot.id, this.snapshots[snapshot.id]);
    },

    buildSnapshotFromDraft(params: {
      canonicalUrl: string;
      originalUrl: string;
      title: string;
      notes?: string;
      imageUrl?: string;
      galleryImageUrls?: string[];
      selectedOptions?: Record<string, string>;
      quantity?: number;
      price?: ProductPriceSnapshot;
      metadataStatus?: SnapshotMetadataStatus;
      source?: ImportSource;
    }): ProductSnapshot {
      const parsed = normalizeTemuProductUrl(params.canonicalUrl);
      if (!parsed) {
        throw new Error("invalid canonical URL");
      }

      return {
        id: createId("snap"),
        productId: parsed.productId,
        originalUrl: params.originalUrl,
        canonicalUrl: params.canonicalUrl,
        source: params.source ?? "manual",
        title: params.title.trim(),
        notes: (params.notes ?? "").trim(),
        imageUrl: params.imageUrl?.trim(),
        galleryImageUrls: params.galleryImageUrls
          ? [...new Set(params.galleryImageUrls.map((value) => value.trim()))]
          : [],
        selectedOptions: params.selectedOptions ?? {},
        quantity: params.quantity ?? 1,
        price: params.price,
        availability: "unknown",
        metadataStatus: params.metadataStatus ?? "manual_required",
        capturedAt: now(),
        updatedAt: now(),
      };
    },

    removeUnreferencedSnapshotIds(referencedIds: string[]): void {
      const keep = new Set(referencedIds);
      for (const id of Object.keys(this.snapshots)) {
        if (!keep.has(id)) {
          useProductObservationsStore().deleteBySnapshot(id);
          queueCloudSyncDelete("product_snapshot", id);
          delete this.snapshots[id];
        }
      }
    },

    deleteSnapshot(id: string): void {
      useProductObservationsStore().deleteBySnapshot(id);
      queueCloudSyncDelete("product_snapshot", id);
      delete this.snapshots[id];
    },

    hasSnapshotForUrl(canonicalUrl: string): boolean {
      return Object.values(this.snapshots).some(
        (snapshot) => snapshot.canonicalUrl === canonicalUrl,
      );
    },

    findDuplicateByUrlOrProductId(canonicalUrl: string, productId?: string): ProductSnapshot | undefined {
      return Object.values(this.snapshots).find((snapshot) => {
        if (productId && snapshot.productId) {
          return snapshot.productId === productId;
        }

        return snapshot.canonicalUrl === canonicalUrl;
      });
    },
  },

  persist: {
    key: "temu:product-snapshots",
  },
});
