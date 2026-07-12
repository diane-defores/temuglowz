import type {
  AvailabilityState,
  ImportSource,
  ProductObservation,
  ProductPriceSnapshot,
  ProductSnapshot,
  ProductObservationConfidence,
  ProductObservationSource,
  ProductObservationStatus,
  ShoppingList,
  ShoppingListItem,
  SnapshotMetadataStatus,
} from "@/types/domain";

const MAX_TEXT = 120;
const MAX_NOTE = 2000;
const MAX_IMAGES = 6;
const MAX_PRICE_AMOUNT = 100_000_000;
const MAX_OPTION_KEY_LENGTH = 40;
const MAX_OPTION_VALUE_LENGTH = 80;
const MAX_OBSERVATION_NOTE = 500;

const VALID_AVAILABILITY_STATES = [
  "unknown",
  "available",
  "low_stock",
  "sold_out",
  "removed",
  "link_broken",
] as const satisfies readonly AvailabilityState[];

const VALID_OBSERVATION_SOURCES = [
  "manual",
  "webview",
  "partner_api",
] as const satisfies readonly ProductObservationSource[];

const VALID_OBSERVATION_STATUSES = [
  "ok",
  "manual_required",
  "incomplete",
] as const satisfies readonly ProductObservationStatus[];

const VALID_OBSERVATION_CONFIDENCE = [
  "user_observed",
  "needs_review",
  "unknown",
] as const satisfies readonly ProductObservationConfidence[];

const VALID_IMPORT_SOURCES = [
  "share",
  "manual",
  "edit",
  "webview",
] as const satisfies readonly ImportSource[];

type SnapshotInput = {
  title: unknown;
  canonicalUrl: unknown;
  originalUrl: unknown;
  quantity: unknown;
  notes?: unknown;
  imageUrl?: unknown;
  galleryImageUrls?: unknown;
  selectedOptions?: unknown;
  price?: ProductPriceSnapshot | null;
  availability?: AvailabilityState;
  metadataStatus?: SnapshotMetadataStatus;
};

type ProductObservationInput = Omit<
  Partial<ProductObservation>,
  | "id"
  | "snapshotId"
  | "productId"
  | "canonicalUrl"
  | "source"
  | "status"
  | "confidence"
  | "observedAt"
  | "createdAt"
  | "updatedAt"
  | "availability"
  | "price"
  | "note"
> & {
  id?: unknown;
  snapshotId?: unknown;
  productId?: unknown;
  canonicalUrl?: unknown;
  source?: unknown;
  status?: unknown;
  confidence?: unknown;
  observedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  availability?: unknown;
  price?: ProductPriceSnapshot | null;
  note?: unknown;
};

type ShoppingListInput = Partial<ShoppingList> & {
  id?: unknown;
  name?: unknown;
  itemIds?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type ShoppingListItemInput = Partial<ShoppingListItem> & {
  id?: unknown;
  snapshotId?: unknown;
  addedAt?: unknown;
  quantity?: unknown;
  note?: unknown;
};

type ProductSnapshotRecordInput = SnapshotInput & {
  id?: unknown;
  productId?: unknown;
  source?: unknown;
  capturedAt?: unknown;
  updatedAt?: unknown;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSafeText(value: unknown, max: number): value is string {
  const hasControlCharacter = (text: string) => {
    return Array.from(text).some((character) => {
      const code = character.charCodeAt(0);
      return code >= 0 && code <= 31;
    });
  };

  return (
    typeof value === "string"
    && value.trim().length > 0
    && value.trim().length <= max
    && !hasControlCharacter(value)
  );
}

function isOptionalText(value: unknown, max: number): boolean {
  return value === "" || value === undefined || isSafeText(value, max);
}

function isUrlString(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\//.test(value);
}

function isImageUrlList(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length > MAX_IMAGES) {
    return false;
  }

  return value.every((url) => isUrlString(url));
}

function isOptionMap(
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(([key, raw]) => {
    return (
      isSafeText(key, MAX_OPTION_KEY_LENGTH)
      && isSafeText(raw, MAX_OPTION_VALUE_LENGTH)
    );
  });
}

function isPrice(value: unknown): value is ProductPriceSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as {
    amount?: unknown;
    currency?: unknown;
    capturedAt?: unknown;
  };

  return (
    isFiniteNumber(snapshot.amount)
    && snapshot.amount >= 0
    && snapshot.amount <= MAX_PRICE_AMOUNT
    && isSafeText(snapshot.currency, 8)
    && isFiniteNumber(snapshot.capturedAt)
  );
}

export interface SnapshotValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProductSnapshotInput(
  input: SnapshotInput,
): SnapshotValidationResult {
  const errors: string[] = [];

  if (!isSafeText(input.title, MAX_TEXT)) {
    errors.push("title");
  }

  if (!isUrlString(input.originalUrl)) {
    errors.push("originalUrl");
  }

  if (!isUrlString(input.canonicalUrl)) {
    errors.push("canonicalUrl");
  }

  if (!isFiniteNumber(input.quantity) || input.quantity < 1 || input.quantity > 999) {
    errors.push("quantity");
  }

  if (
    input.notes !== undefined
    && input.notes !== ""
    && !isSafeText(input.notes, MAX_NOTE)
  ) {
    errors.push("notes");
  }

  if (input.imageUrl !== undefined && !isUrlString(input.imageUrl)) {
    errors.push("imageUrl");
  }

  if (!isImageUrlList(input.galleryImageUrls)) {
    if (input.galleryImageUrls !== undefined) {
      errors.push("galleryImageUrls");
    }
  }

  if (!isOptionMap(input.selectedOptions)) {
    errors.push("selectedOptions");
  }

  if (input.price !== undefined && input.price !== null && !isPrice(input.price)) {
    errors.push("price");
  }

  if (
    input.availability !== undefined
    && !(VALID_AVAILABILITY_STATES as readonly string[]).includes(input.availability)
  ) {
    errors.push("availability");
  }

  if (
    input.metadataStatus !== undefined
    && ![
      "ok",
      "manual_required",
      "incomplete",
    ].includes(input.metadataStatus)
  ) {
    errors.push("metadataStatus");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateShoppingListRecord(
  input: ShoppingListInput,
): SnapshotValidationResult {
  const errors: string[] = [];

  if (!isSafeText(input.id, 80)) {
    errors.push("id");
  }

  if (!isSafeText(input.name, 64)) {
    errors.push("name");
  }

  if (!Array.isArray(input.itemIds) || !input.itemIds.every((itemId) => isSafeText(itemId, 80))) {
    errors.push("itemIds");
  }

  if (!isFiniteNumber(input.createdAt) || input.createdAt <= 0) {
    errors.push("createdAt");
  }

  if (!isFiniteNumber(input.updatedAt) || input.updatedAt <= 0) {
    errors.push("updatedAt");
  }

  if (
    isFiniteNumber(input.createdAt)
    && isFiniteNumber(input.updatedAt)
    && input.updatedAt < input.createdAt
  ) {
    errors.push("updatedAt");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateShoppingListItemRecord(
  input: ShoppingListItemInput,
): SnapshotValidationResult {
  const errors: string[] = [];

  if (!isSafeText(input.id, 80)) {
    errors.push("id");
  }

  if (!isSafeText(input.snapshotId, 80)) {
    errors.push("snapshotId");
  }

  if (!isFiniteNumber(input.addedAt) || input.addedAt <= 0) {
    errors.push("addedAt");
  }

  if (!isFiniteNumber(input.quantity) || input.quantity < 1 || input.quantity > 999) {
    errors.push("quantity");
  }

  if (!isOptionalText(input.note, MAX_NOTE)) {
    errors.push("note");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateProductSnapshotRecord(
  input: ProductSnapshotRecordInput,
): SnapshotValidationResult {
  const result = validateProductSnapshotInput(input);
  const errors = [...result.errors];

  if (!isSafeText(input.id, 80)) {
    errors.push("id");
  }

  if (input.productId !== undefined && !isSafeText(input.productId, 120)) {
    errors.push("productId");
  }

  if (
    typeof input.source !== "string"
    || !(VALID_IMPORT_SOURCES as readonly string[]).includes(input.source)
  ) {
    errors.push("source");
  }

  if (!isFiniteNumber(input.capturedAt) || input.capturedAt <= 0) {
    errors.push("capturedAt");
  }

  if (!isFiniteNumber(input.updatedAt) || input.updatedAt <= 0) {
    errors.push("updatedAt");
  }

  if (
    isFiniteNumber(input.capturedAt)
    && isFiniteNumber(input.updatedAt)
    && input.updatedAt < input.capturedAt
  ) {
    errors.push("updatedAt");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateProductObservationInput(
  input: ProductObservationInput,
): SnapshotValidationResult {
  const errors: string[] = [];

  if (!isSafeText(input.id, 80)) {
    errors.push("id");
  }

  if (!isSafeText(input.snapshotId, 80)) {
    errors.push("snapshotId");
  }

  if (input.productId !== undefined && !isSafeText(input.productId, 120)) {
    errors.push("productId");
  }

  if (!isUrlString(input.canonicalUrl)) {
    errors.push("canonicalUrl");
  }

  if (
    typeof input.source !== "string"
    || !(VALID_OBSERVATION_SOURCES as readonly string[]).includes(input.source)
  ) {
    errors.push("source");
  }

  if (
    typeof input.status !== "string"
    || !(VALID_OBSERVATION_STATUSES as readonly string[]).includes(input.status)
  ) {
    errors.push("status");
  }

  if (
    typeof input.confidence !== "string"
    || !(VALID_OBSERVATION_CONFIDENCE as readonly string[]).includes(input.confidence)
  ) {
    errors.push("confidence");
  }

  if (!isFiniteNumber(input.observedAt) || input.observedAt <= 0) {
    errors.push("observedAt");
  }

  if (!isFiniteNumber(input.createdAt) || input.createdAt <= 0) {
    errors.push("createdAt");
  }

  if (!isFiniteNumber(input.updatedAt) || input.updatedAt <= 0) {
    errors.push("updatedAt");
  }

  if (
    typeof input.availability !== "string"
    || !(VALID_AVAILABILITY_STATES as readonly string[]).includes(input.availability)
  ) {
    errors.push("availability");
  }

  if (input.price !== undefined && input.price !== null && !isPrice(input.price)) {
    errors.push("price");
  }

  if (
    input.note !== undefined
    && input.note !== ""
    && !isSafeText(input.note, MAX_OBSERVATION_NOTE)
  ) {
    errors.push("note");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateProductObservationRecord(
  input: ProductObservationInput,
): SnapshotValidationResult {
  const result = validateProductObservationInput(input);
  const errors = [...result.errors];

  if (
    isFiniteNumber(input.createdAt)
    && isFiniteNumber(input.updatedAt)
    && input.updatedAt < input.createdAt
  ) {
    errors.push("updatedAt");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCloudSyncRecordPayload(
  domain: "shopping_list" | "shopping_list_item" | "product_snapshot" | "product_observation",
  recordKey: string,
  payload: unknown,
): SnapshotValidationResult {
  let result: SnapshotValidationResult;

  switch (domain) {
    case "shopping_list":
      result = validateShoppingListRecord(payload as ShoppingListInput);
      break;
    case "shopping_list_item":
      result = validateShoppingListItemRecord(payload as ShoppingListItemInput);
      break;
    case "product_snapshot":
      result = validateProductSnapshotRecord(payload as ProductSnapshotRecordInput);
      break;
    case "product_observation":
      result = validateProductObservationRecord(payload as ProductObservationInput);
      break;
  }

  const payloadId = (payload as { id?: unknown } | null)?.id;
  if (result.valid && payloadId !== recordKey) {
    return {
      valid: false,
      errors: ["recordKey"],
    };
  }

  return result;
}

export function isDuplicateSnapshot(
  a: Pick<ProductSnapshot, "canonicalUrl" | "productId">,
  b: Pick<ProductSnapshot, "canonicalUrl" | "productId">,
): boolean {
  if (a.productId && b.productId) {
    return a.productId === b.productId;
  }

  return a.canonicalUrl === b.canonicalUrl;
}
