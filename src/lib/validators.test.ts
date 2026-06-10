import { describe, expect, it } from "vitest";

import type { ProductSnapshot } from "@/types/domain";

import { isDuplicateSnapshot, validateProductSnapshotInput } from "@/lib/validators";

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
      availability: "unknown" as const,
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
});
