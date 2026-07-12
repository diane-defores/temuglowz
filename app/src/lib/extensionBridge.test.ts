import { describe, it, expect } from "vitest";
import { validateTemuPage } from "./extensionBridge";

describe("validateTemuPage", () => {
  it("rejects empty url", () => {
    const result = validateTemuPage("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("url required");
  });

  it("rejects non-temu url", () => {
    const result = validateTemuPage("https://example.com/product/123");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("not a temu page");
  });

  it("rejects non-product temu pages", () => {
    const result = validateTemuPage("https://www.temu.com/search?q=test");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("not a product page");
  });

  it("accepts valid product url with /product path", () => {
    const result = validateTemuPage("https://www.temu.com/product/12345.html");
    expect(result.valid).toBe(true);
  });

  it("accepts valid product url with category/product path", () => {
    const result = validateTemuPage("https://www.temu.com/cuisine/product/ABC123.html");
    expect(result.valid).toBe(true);
  });

  it("accepts valid product url with country subdomain", () => {
    const result = validateTemuPage("https://fr.temu.com/product/XYZ789.html");
    expect(result.valid).toBe(true);
  });
});
