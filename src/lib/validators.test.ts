import { describe, expect, it } from "vitest";

import type { ProductObservation, ProductSnapshot } from "@/types/domain";

import {
  isDuplicateSnapshot,
  validateProductObservationInput,
  validateProductSnapshotInput,
} from "@/lib/validators";

describe("Snapshot validators", () => {
  it("validates correct product snapshot input", () => {
    const valid = {
      title: "Test Produit",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      originalUrl: "https://www.temu.com/fr/product/100.html",
      quantity: 2,
      notes: "Mon texte",
      selectedOptions: { color: "bleu" },
      imageUrl: "https://cdn.example.com/image.png",
      galleryImageUrls: ["https://cdn.example.com/1.png"],
      availability: "low_stock" as const,
      metadataStatus: "ok" as const,
    };

    const result = validateProductSnapshotInput(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects malformed urls and empty titles", () => {
    const invalid = {
      title: "",
      canonicalUrl: "notaurl",
      originalUrl: "https://www.temu.com/x",
      quantity: 0,
      selectedOptions: {},
      availability: "unknown" as const,
      metadataStatus: "ok" as const,
    };

    const result = validateProductSnapshotInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("title");
    expect(result.errors).toContain("canonicalUrl");
    expect(result.errors).toContain("quantity");
  });

  it("detects duplicate snapshots by product id then canonical URL", () => {
    const existing = {
      id: "a",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      productId: "product-100",
    } as Pick<ProductSnapshot, "canonicalUrl" | "productId" | "id">;
    const sameProduct = {
      id: "b",
      canonicalUrl: "https://www.temu.com/fr/product/other.html",
      productId: "product-100",
    } as Pick<ProductSnapshot, "canonicalUrl" | "productId" | "id">;
    const sameUrl = {
      id: "c",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      productId: undefined,
    } as Pick<ProductSnapshot, "canonicalUrl" | "productId" | "id">;

    expect(isDuplicateSnapshot(existing, sameProduct)).toBe(true);
    expect(isDuplicateSnapshot(existing, sameUrl)).toBe(true);
  });

  it("validates product observation inputs", () => {
    const observation: ProductObservation = {
      id: "obs-1",
      snapshotId: "snap-1",
      productId: "100",
      canonicalUrl: "https://www.temu.com/fr/product/100.html",
      source: "manual",
      status: "ok",
      confidence: "user_observed",
      observedAt: 10,
      createdAt: 10,
      updatedAt: 10,
      availability: "low_stock",
      price: {
        amount: 12.5,
        currency: "EUR",
        capturedAt: 10,
      },
      note: "Vu dans Temu",
    };

    expect(validateProductObservationInput(observation)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects unsafe product observation inputs", () => {
    const result = validateProductObservationInput({
      id: "obs-1",
      snapshotId: "",
      canonicalUrl: "notaurl",
      source: "crawler",
      status: "ok",
      confidence: "certain",
      observedAt: Number.NaN,
      createdAt: 0,
      updatedAt: 0,
      availability: "live_stock",
      price: {
        amount: -1,
        currency: "EUR",
        capturedAt: 10,
      },
      note: "bad",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      "snapshotId",
      "canonicalUrl",
      "source",
      "confidence",
      "observedAt",
      "createdAt",
      "updatedAt",
      "availability",
      "price",
    ]));
  });
});
