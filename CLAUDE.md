# TemuGlowz monorepo execution guide

## Routing

- App work: start with `app/README.md`; code and configuration live under `app/`.
- Public-site work: start with `site/README.md`; code, data, assets, and tools live under `site/`.
- Cross-workspace commands run from the root through the minimal pnpm orchestrator.
- Durable project governance remains in the single root `shipglowz_data/` corpus.

## Validation surfaces

- `app/`: TypeScript, Vue, Convex, Vitest, ESLint, Vite, and Tauri configuration checks.
- `site/`: Astro check, Vitest, and static build.
- Android/Tauri/WebView native proof is CI-first on GitHub Actions Blacksmith; local Android commands are not authoritative when the installed NDK architecture does not match the host.

## ShipGlowz Development Mode

- development_mode: hybrid
- validation_surface: mixed
- ship_before_preview_test: conditional
- post_ship_verification: GitHub Actions for Android; static-host verification for `site/`
- deployment_provider: other
- preview_source: not applicable for local workspace checks
- production_url: https://temuglowz.com
- observability: app diagnostics required; site static exception
- diagnostic_surface: `app/src/ui/temu-shell/components/MobileSettingsSheet.vue`
- logs_copy_action: available
- diagnostic_log_header: commit/build + Paris/UTC build time
- notes: Local checks are authoritative for this structural migration; native Android behavior remains CI-first.
- last_reviewed: 2026-07-12

Do not reintroduce application or Astro source at the repository root. Keep package-specific aliases, build output, environment files, and generated artifacts inside their workspace.
