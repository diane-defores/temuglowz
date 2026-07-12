import { defineStore } from "pinia";

import {
  queueCloudSyncDelete,
  queueCloudSyncUpsert,
} from "@/lib/cloudSync";
import { validateProductObservationInput } from "@/lib/validators";
import { useProductSnapshotsStore } from "@/stores/productSnapshots";
import type {
  AvailabilityState,
  ProductObservation,
  ProductObservationConfidence,
  ProductObservationReminder,
  ProductObservationSource,
  ProductObservationStatus,
  ProductPriceSnapshot,
} from "@/types/domain";
import { createId } from "@/utils/id";

export const PRODUCT_OBSERVATION_RETENTION_LIMIT = 50;
const DEDUPE_BUCKET_MS = 60_000;
const DEFAULT_REMINDER_INTERVAL_DAYS = 7;

interface ProductObservationsState {
  observations: Record<string, ProductObservation>;
  reminders: Record<string, ProductObservationReminder>;
}

interface ObservationDraft {
  snapshotId: string;
  canonicalUrl: string;
  productId?: string;
  source: ProductObservationSource;
  status?: ProductObservationStatus;
  confidence?: ProductObservationConfidence;
  observedAt?: number;
  availability?: AvailabilityState;
  price?: ProductPriceSnapshot;
  note?: string;
}

function now(): number {
  return Date.now();
}

function observationBucket(observedAt: number): number {
  return Math.floor(observedAt / DEDUPE_BUCKET_MS);
}

function addDays(timestamp: number, days: number): number {
  return timestamp + (days * 24 * 60 * 60 * 1000);
}

export const useProductObservationsStore = defineStore("productObservations", {
  state: (): ProductObservationsState => ({
    observations: {},
    reminders: {},
  }),

  getters: {
    allObservations: (state): ProductObservation[] =>
      Object.values(state.observations).sort((a, b) => b.observedAt - a.observedAt),

    latestBySnapshot:
      (state) =>
      (snapshotId: string): ProductObservation | undefined =>
        Object.values(state.observations)
          .filter((observation) => observation.snapshotId === snapshotId)
          .sort((a, b) => b.observedAt - a.observedAt)[0],

    historyBySnapshot:
      (state) =>
      (snapshotId: string): ProductObservation[] =>
        Object.values(state.observations)
          .filter((observation) => observation.snapshotId === snapshotId)
          .sort((a, b) => b.observedAt - a.observedAt),

    reminderBySnapshot:
      (state) =>
      (snapshotId: string): ProductObservationReminder | undefined =>
        state.reminders[snapshotId],
  },

  actions: {
    appendObservation(draft: ObservationDraft): ProductObservation {
      const timestamp = draft.observedAt ?? now();
      const observation: ProductObservation = {
        id: createId("obs"),
        snapshotId: draft.snapshotId,
        productId: draft.productId,
        canonicalUrl: draft.canonicalUrl,
        source: draft.source,
        status: draft.status ?? "ok",
        confidence: draft.confidence ?? "user_observed",
        observedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        availability: draft.availability ?? "unknown",
        price: draft.price,
        note: (draft.note ?? "").trim(),
      };

      const validation = validateProductObservationInput(observation);
      if (!validation.valid) {
        throw new Error(`invalid product observation: ${validation.errors.join(",")}`);
      }

      const duplicate = this.findDuplicate(observation);
      if (duplicate) {
        return duplicate;
      }

      this.observations[observation.id] = observation;
      queueCloudSyncUpsert("product_observation", observation.id, observation);
      this.pruneSnapshotHistory(observation.snapshotId);
      this.applyObservationToSnapshot(observation);
      return observation;
    },

    createManualRequiredObservation(params: {
      snapshotId: string;
      canonicalUrl: string;
      productId?: string;
      source?: ProductObservationSource;
      observedAt?: number;
    }): ProductObservation {
      return this.appendObservation({
        snapshotId: params.snapshotId,
        canonicalUrl: params.canonicalUrl,
        productId: params.productId,
        source: params.source ?? "webview",
        status: "manual_required",
        confidence: "needs_review",
        availability: "unknown",
        observedAt: params.observedAt,
        note: "Observation à compléter manuellement.",
      });
    },

    deleteBySnapshot(snapshotId: string): void {
      for (const observation of this.historyBySnapshot(snapshotId)) {
        queueCloudSyncDelete("product_observation", observation.id);
        delete this.observations[observation.id];
      }
      delete this.reminders[snapshotId];
    },

    setReminder(snapshotId: string, enabled: boolean, intervalDays = DEFAULT_REMINDER_INTERVAL_DAYS): void {
      const safeInterval = Number.isFinite(intervalDays)
        ? Math.min(365, Math.max(1, Math.round(intervalDays)))
        : DEFAULT_REMINDER_INTERVAL_DAYS;
      const timestamp = now();
      this.reminders[snapshotId] = {
        snapshotId,
        enabled,
        intervalDays: safeInterval,
        nextCheckAt: enabled ? addDays(timestamp, safeInterval) : null,
        updatedAt: timestamp,
      };
    },

    isReminderDue(snapshotId: string, at = now()): boolean {
      const reminder = this.reminders[snapshotId];
      return Boolean(
        reminder?.enabled
          && reminder.nextCheckAt !== null
          && reminder.nextCheckAt <= at,
      );
    },

    markReminderChecked(snapshotId: string, at = now()): void {
      const reminder = this.reminders[snapshotId];
      if (!reminder?.enabled) {
        return;
      }
      reminder.nextCheckAt = addDays(at, reminder.intervalDays);
      reminder.updatedAt = at;
    },

    findSnapshotIdForUrl(canonicalUrl: string, productId?: string): string | null {
      const snapshots = useProductSnapshotsStore();
      return snapshots.findDuplicateByUrlOrProductId(canonicalUrl, productId)?.id ?? null;
    },

    findDuplicate(candidate: ProductObservation): ProductObservation | null {
      const bucket = observationBucket(candidate.observedAt);
      return this.historyBySnapshot(candidate.snapshotId).find((observation) => {
        return (
          observation.source === candidate.source
          && observation.status === candidate.status
          && observation.availability === candidate.availability
          && observation.price?.amount === candidate.price?.amount
          && observation.price?.currency === candidate.price?.currency
          && observationBucket(observation.observedAt) === bucket
        );
      }) ?? null;
    },

    pruneSnapshotHistory(snapshotId: string): void {
      const history = this.historyBySnapshot(snapshotId);
      const removable = history.slice(PRODUCT_OBSERVATION_RETENTION_LIMIT);
      for (const observation of removable) {
        queueCloudSyncDelete("product_observation", observation.id);
        delete this.observations[observation.id];
      }
    },

    applyObservationToSnapshot(observation: ProductObservation): void {
      if (observation.status === "manual_required") {
        return;
      }

      const snapshots = useProductSnapshotsStore();
      const snapshot = snapshots.getSnapshot(observation.snapshotId);
      if (!snapshot) {
        return;
      }

      snapshots.upsertSnapshot({
        ...snapshot,
        price: observation.price ?? snapshot.price,
        availability: observation.availability === "unknown"
          ? snapshot.availability
          : observation.availability,
      });
    },
  },

  persist: {
    key: "temu:product-observations",
  },
});
