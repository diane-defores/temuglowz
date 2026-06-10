export function createId(prefix: string): string {
  const safePrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${safePrefix}-${crypto.randomUUID()}`;
  }

  return `${safePrefix}-${Math.random().toString(36).slice(2, 12)}`;
}

