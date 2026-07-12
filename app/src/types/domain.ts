export type AvailabilityState =
  | "unknown"
  | "available"
  | "low_stock"
  | "sold_out"
  | "removed"
  | "link_broken";

export type SnapshotMetadataStatus = "ok" | "manual_required" | "incomplete";

export type ImportSource = "share" | "manual" | "edit" | "webview";

export interface ShoppingSessionSettings {
  darkMode: boolean;
  textZoom: number;
  hideTemuClutter: boolean;
  onboardingDismissed?: boolean;
  onboardingCompleted?: boolean;
  onboardingSkippedStepIds?: string[];
}

export interface ShoppingSession {
  id: string;
  name: string;
  startUrl: string;
  currentUrl: string;
  lastCapturedUrl: string | null;
  lastCaptureAt: number | null;
  createdAt: number;
  updatedAt: number;
  lastActiveAt: number;
  displayOrder: number;
  color?: string;
  icon?: string;
}

export interface ProductPriceSnapshot {
  amount: number;
  currency: string;
  capturedAt: number;
}

export interface ProductSnapshot {
  id: string;
  productId?: string;
  originalUrl: string;
  canonicalUrl: string;
  source: ImportSource;
  title: string;
  notes: string;
  imageUrl?: string;
  galleryImageUrls: string[];
  selectedOptions: Record<string, string>;
  quantity: number;
  price?: ProductPriceSnapshot;
  availability: AvailabilityState;
  metadataStatus: SnapshotMetadataStatus;
  capturedAt: number;
  updatedAt: number;
}

export type ProductObservationSource = "manual" | "webview" | "partner_api";

export type ProductObservationStatus = "ok" | "manual_required" | "incomplete";

export type ProductObservationConfidence =
  | "user_observed"
  | "needs_review"
  | "unknown";

export interface ProductObservation {
  id: string;
  snapshotId: string;
  productId?: string;
  canonicalUrl: string;
  source: ProductObservationSource;
  status: ProductObservationStatus;
  confidence: ProductObservationConfidence;
  observedAt: number;
  createdAt: number;
  updatedAt: number;
  availability: AvailabilityState;
  price?: ProductPriceSnapshot;
  note: string;
}

export interface ProductObservationReminder {
  snapshotId: string;
  enabled: boolean;
  intervalDays: number;
  nextCheckAt: number | null;
  updatedAt: number;
}

export interface ShoppingListItem {
  id: string;
  snapshotId: string;
  addedAt: number;
  quantity: number;
  note: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type ImportDraftSource = "intent" | "manual" | "clipboard" | "webview";

export type WebviewCaptureResult =
  | {
      ok: true;
      source: "webview";
      rawUrl: string;
      canonicalUrl: string;
      capturedAt: number;
    }
  | {
      ok: false;
      source: "webview";
      reason: "unavailable" | "invalid_url" | "error";
      error?: string;
      rawUrl?: string;
    };

export interface ImportDraft {
  id: string;
  source: ImportDraftSource;
  rawText: string;
  candidateUrl: string;
  canonicalUrl: string;
  parsedTitle: string;
  parsedImageUrl?: string;
  parsedPrice?: ProductPriceSnapshot;
  status: SnapshotMetadataStatus;
  createdAt: number;
  updatedAt: number;
}

export type DuplicateResolution = "add_new" | "update_existing" | "cancel";

export interface ExportPayload {
  version: "1.0.0";
  createdAt: number;
  lists: ShoppingList[];
  items: ShoppingListItem[];
  snapshots: ProductSnapshot[];
  observations?: ProductObservation[];
}
