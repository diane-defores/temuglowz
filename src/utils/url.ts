const ALLOWED_TEMU_HOSTS = ["temu.com", "temu.to"];
const TRACKING_PARAMS = new Set([
  "_ga",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "ttclid",
  "snr",
  "c",
  "msclkid",
]);

function isPrivateOrLoopbackHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }

  if (/^(10|172\.[1-9][0-9]?|192\.168)\./.test(host)) {
    return true;
  }

  if (/^0\.0\.0\.0$/.test(host)) {
    return true;
  }

  return host.endsWith(".local") || host.endsWith(".localhost");
}

function isAllowedTemuHost(host: string): boolean {
  const cleanHost = host.toLowerCase();
  return (
    ALLOWED_TEMU_HOSTS.includes(cleanHost)
    || cleanHost.endsWith(".temu.com")
    || cleanHost.endsWith(".temu.to")
  );
}

function isLikelyProductPathname(pathname: string): boolean {
  const segments = pathname.split("/").map((segment) => segment.toLowerCase());
  if (
    segments.includes("localhost")
    || segments.includes("127.0.0.1")
    || segments.includes("0.0.0.0")
  ) {
    return false;
  }

  return /\/products\//.test(pathname) || /\/product\//.test(pathname)
    || /\/item\//.test(pathname)
    || /\/p\//.test(pathname)
    || /\/(\d{5,})/.test(pathname);
}

function sanitizeTextInput(value: string): string {
  return value.trim().replace(/[\n\r\t]+/g, " ").trim();
}

function parseUrlMaybe(value: string): URL | null {
  if (!value || /\s/.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (!url.host) {
      return null;
    }

    if (isPrivateOrLoopbackHost(url.hostname.toLowerCase())) {
      return null;
    }

    if (url.username || url.password) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export interface TemuParseResult {
  canonicalUrl: string;
  originalUrl: string;
  hostname: string;
  productId?: string;
  sourcePath: string;
}

export function extractProductIdFromUrl(url: URL): string | undefined {
  const productId = url.searchParams.get("item_id")
    || url.searchParams.get("product_id")
    || url.searchParams.get("pid")
    || url.searchParams.get("id");

  if (productId) {
    return sanitizeTextInput(productId);
  }

  const numericSlugMatch = url.pathname.match(/(?:^|[-_/])(\d{5,})(?:\.html)?(?:$|[/?#])/);
  if (numericSlugMatch?.[1]) {
    return numericSlugMatch[1];
  }

  const pathMatch = url.pathname
    .split("/")
    .map((part) => sanitizeTextInput(part))
    .filter(Boolean)
    .reverse()
    .find((part) => /^(\d{5,})$/.test(part) || /^[a-z0-9-]{12,}$/i.test(part));

  return pathMatch ?? undefined;
}

export function normalizeTemuProductUrl(raw: string): TemuParseResult | null {
  const parsed = parseUrlMaybe(sanitizeTextInput(raw));
  if (!parsed) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!isAllowedTemuHost(hostname)) {
    return null;
  }

  if (!isLikelyProductPathname(parsed.pathname)) {
    return null;
  }

  const safePath = parsed.pathname.split("/").filter(Boolean).join("/");

  const normalizedSearchParams = new URLSearchParams();
  parsed.searchParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (TRACKING_PARAMS.has(normalizedKey)) {
      return;
    }

    normalizedSearchParams.set(normalizedKey, value);
  });
  const canonicalSearch = normalizedSearchParams.toString();

  const canonicalUrl = `${parsed.protocol}//${hostname}/${safePath}${canonicalSearch ? `?${canonicalSearch}` : ""}`;

  return {
    canonicalUrl,
    originalUrl: parsed.toString(),
    hostname,
    productId: extractProductIdFromUrl(parsed),
    sourcePath: parsed.pathname,
  };
}

export function isTemuProductUrl(value: string): boolean {
  return normalizeTemuProductUrl(value) !== null;
}
