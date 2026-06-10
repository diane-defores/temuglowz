## ShipFlow Development Mode

- development_mode: hybrid
- validation_surface: mixed
- ship_before_preview_test: conditional
- post_ship_verification: sf-ci-build
- deployment_provider: github-actions-blacksmith
- preview_source: not applicable
- production_url: unknown
- notes: Local validation is for TypeScript, Vue/browser smoke, Convex typecheck, unit tests, lint, and web build only. Native Android/Tauri/WebView proof is CI-first on GitHub Actions Blacksmith; do not treat local `pnpm tauri:android:*` as authoritative on this aarch64 workspace because the installed Android NDK is linux-x86_64. The product target is Android Tauri with native WebView; a public web app is not guaranteed and should not be assumed beyond local/test surfaces.
- last_reviewed: 2026-06-10

