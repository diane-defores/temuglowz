import { describe, expect, it } from "vitest";

import {
  isTemuProductUrl,
  normalizeTemuProductUrl,
} from "@/utils/url";

describe("Temu URL utilities", () => {
  it("accepts valid Temu product urls and extracts product id", () => {
    const parsed = normalizeTemuProductUrl(
      "https://www.temu.com/fr/product/gaming-chair-123456.html?utm_source=share&foo=bar",
    );

    expect(parsed).toEqual(
      expect.objectContaining({
        canonicalUrl: "https://www.temu.com/fr/product/gaming-chair-123456.html?foo=bar",
        hostname: "www.temu.com",
      }),
    );
  });

  it("rejects private and non-https urls", () => {
    expect(isTemuProductUrl("http://www.temu.com/fr/product/12345.html")).toBe(false);
    expect(isTemuProductUrl("http://127.0.0.1/product/12345.html")).toBe(false);
    expect(isTemuProductUrl("file:///tmp/test.html")).toBe(false);
    expect(isTemuProductUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects localhost and non-temu hosts", () => {
    expect(isTemuProductUrl("https://example.com/product/12345.html")).toBe(false);
    expect(isTemuProductUrl("https://temu.to/search/phone")).toBe(false);
  });

  it("accepts temu.to product links", () => {
    expect(isTemuProductUrl("https://temu.to/fr/product/987654")).toBe(true);
  });

  it("accepts Temu short share links as review-required imports", () => {
    const parsed = normalizeTemuProductUrl("https://share.temu.com/E9mvCNlepCB");

    expect(parsed).toEqual(
      expect.objectContaining({
        canonicalUrl: "https://share.temu.com/E9mvCNlepCB",
        hostname: "share.temu.com",
        sourcePath: "/E9mvCNlepCB",
      }),
    );
    expect(parsed?.productId).toBeUndefined();
  });

  it("rejects non-short paths on the Temu share host", () => {
    expect(isTemuProductUrl("https://share.temu.com/search/phone")).toBe(false);
  });
});
