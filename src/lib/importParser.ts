import { isTemuProductUrl, normalizeTemuProductUrl } from "@/utils/url";

export interface ParsedImportText {
  rawText: string;
  rawUrl: string;
  canonicalUrl: string;
  normalizedTitle: string;
  status: "ok" | "needs_review";
}

const TEXT_URL_RE = /(https?:\/\/[^\s"'<>`]+(?:\([^\s"'<>`]*\))?)/g;

function cleanUrlCandidate(candidate: string): string {
  return candidate.replace(/[\]),.]+$/g, "").trim();
}

function pickTitleFromLines(raw: string, url: string): string {
  const lines = raw
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    const firstNonUrlLine = lines
      .filter((line) => !line.includes(url))
      .find((line) => line.length > 0);

    if (firstNonUrlLine) {
      return firstNonUrlLine.slice(0, 160).trim();
    }
  }

  return "";
}

export function parseSharedImportText(rawText: string): ParsedImportText | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  const urls = [...trimmed.matchAll(TEXT_URL_RE)].map((match) =>
    cleanUrlCandidate(match[1]));

  if (urls.length === 0) {
    return null;
  }

  for (const rawUrl of urls) {
    if (!isTemuProductUrl(rawUrl)) {
      continue;
    }

    const normalized = normalizeTemuProductUrl(rawUrl);
    if (!normalized) {
      continue;
    }

    return {
      rawText: trimmed,
      rawUrl: normalized.originalUrl,
      canonicalUrl: normalized.canonicalUrl,
      normalizedTitle: pickTitleFromLines(trimmed, rawUrl),
      status: normalizedTitleLength(trimmed, normalized.originalUrl),
    };
  }

  return null;
}

function normalizedTitleLength(rawText: string, rawUrl: string): "ok" | "needs_review" {
  const title = pickTitleFromLines(rawText, rawUrl);
  return title.length > 0 ? "ok" : "needs_review";
}
