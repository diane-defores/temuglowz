export function buildIdentityHeader(): string[] {
  return [
    `commit/build: ${__BUILD_ID__ || __GIT_COMMIT__ || "unknown"}`,
    `build_at_paris: ${__BUILD_AT_PARIS__ || "unknown"}`,
    `build_at_utc: ${__BUILD_AT_UTC__ || "unknown"}`,
  ];
}

export function buildDiagnosticsReport(context: Record<string, string> = {}): string {
  const lines = [
    ...buildIdentityHeader(),
    "Temu Shopping Lists diagnostics",
    `git_commit: ${__GIT_COMMIT__ || "unknown"}`,
    `build_id: ${__BUILD_ID__ || "unknown"}`,
    `url: ${window.location.href}`,
    `user_agent: ${navigator.userAgent}`,
    `tauri: ${"__TAURI_INTERNALS__" in window ? "yes" : "no"}`,
    `locale: ${navigator.language || "unknown"}`,
  ];

  for (const [key, value] of Object.entries(context)) {
    lines.push(`${key}: ${value}`);
  }

  return lines.join("\n");
}
