# TemuGlowz

TemuGlowz is a pnpm monorepo with two independently buildable products:

- [`app/`](app/README.md): Vue 3 application, Tauri Android shell, Convex backend, and browser extension.
- [`site/`](site/README.md): public Astro site, guides, affiliate data, static assets, and editorial tooling.

The repository root is only an orchestration layer. Product source and product-specific configuration belong to the relevant workspace.

## Setup

```bash
pnpm install
```

## Common commands

```bash
pnpm dev:app
pnpm dev:site
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

Tauri and Convex commands are routed to `app/`:

```bash
pnpm tauri:dev
pnpm tauri:android:init
pnpm tauri:android:build
pnpm convex:codegen
```

Native Android proof remains CI-first on GitHub Actions because the local workspace architecture may not match the Android NDK toolchain.

## Repository map

```text
app/                    Vue, Tauri, Convex, extension
site/                   Astro site, public assets, site tools
.github/workflows/      app and site CI
shipglowz_data/         canonical project governance
package.json            workspace orchestration only
pnpm-workspace.yaml     workspace membership
```

Read [`AGENT.md`](AGENT.md) and [`CLAUDE.md`](CLAUDE.md) before making cross-workspace changes.
