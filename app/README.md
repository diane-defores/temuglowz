# TemuGlowz app

This workspace contains the local-first Temu shopping-list product:

- Vue 3 + Vite frontend in `src/`
- Tauri 2 native shell and Android project in `src-tauri/`
- Convex functions and schema in `convex/`
- browser extension source in `extension/`
- app-only static icons in `public/`

## Commands

Run from the repository root:

```bash
pnpm dev:app
pnpm build:app
pnpm --filter @temuglowz/app typecheck
pnpm --filter @temuglowz/app test:once
pnpm --filter @temuglowz/app lint:check
```

Tauri and Convex:

```bash
pnpm tauri:dev
pnpm tauri:android:init
pnpm tauri:android:build
pnpm convex:codegen
```

`app/.env.local` holds ignored local Convex variables. Cloud sync remains fail-closed unless identity, entitlement, and deployment requirements are satisfied.

The browser build is a development/test surface. Android Tauri is the product target, and native Android/WebView validation is CI-first on this workspace.
