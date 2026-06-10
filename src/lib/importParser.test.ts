import { describe, expect, it } from "vitest";

import { parseSharedImportText } from "@/lib/importParser";

describe("Shared import parser", () => {
  it("extracts the first Temu product URL and title", () => {
    const parsed = parseSharedImportText(`
      Regardez ce produit:
      https://www.temu.com/fr/product/airfryer-54321.html?utm_source=share
      https://example.com/not-temu
    `);

    expect(parsed).toEqual(
      expect.objectContaining({
        rawUrl: "https://www.temu.com/fr/product/airfryer-54321.html?utm_source=share",
        canonicalUrl:
          "https://www.temu.com/fr/product/airfryer-54321.html",
        normalizedTitle: "Regardez ce produit:",
        status: "ok",
      }),
    );
  });

  it("returns null for non-Temu links", () => {
    expect(
      parseSharedImportText("https://example.com/product/123?x=1"),
    ).toBeNull();
  });

  it("returns null for empty payload", () => {
    expect(parseSharedImportText("   ")).toBeNull();
  });
});
