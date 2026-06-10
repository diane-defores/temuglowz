# Temu Shopping Lists Android (Local-First MVP)

This project is a Vue 3 + Vite + TypeScript + Tauri 2 scaffold for saving Temu product links into persistent shopping lists.

## Scope

- Share/manual import of Temu product links (URL-only in MVP)
- Durable local snapshot fields: title, archived URL, notes, quantity, options, availability state
- Named lists with CRUD flow
- Duplicate detection for canonical URL / product id
- Export serialization for backup payloads
- Android share bridge placeholders (manifest/config/Kotlin contract), without stealth
- Optional in-app Temu shopping sessions with app-owned WebView controls

## Out of scope

- Temu cart import promises
- Any anti-fingerprint / stealth WebView behavior
- Cookies, session dumps, or credentials storage
- Claims of partnership, certification, or authorization by Temu

## Install & run

```bash
pnpm install
pnpm tauri:dev
```

Build for browser test target:

```bash
pnpm build
```

TypeScript checks:

```bash
pnpm typecheck
pnpm typecheck:convex
pnpm test:once
pnpm lint
```

Convex backend checks:

```bash
pnpm typecheck:convex
pnpm convex:codegen
```

The dev Convex project is `diane-defores/temu`; local deployment variables live
in `.env.local`, which is intentionally ignored by Git. Until the suite
entitlement bridge is implemented, Convex cloud sync functions fail closed and
must not be treated as active user sync.

Android build flows (environment required):

```bash
pnpm tauri:android:init
pnpm tauri:android:dev
```

## Debug APK from GitHub Actions

The GitHub workflow `.github/workflows/dev-builds.yml` builds an installable
Android debug APK for arm64 devices.

1. Open GitHub Actions.
2. Run **Dev Builds** manually, or push to `main`, `master`, `develop`, or `release/**`.
3. Download the artifact named `temu-shopping-lists-android-debug-arm64`.
4. If GitHub Actions artifact storage is full, open **Releases** and download
   the APK from the newest `Android debug APK ...` prerelease instead.
5. Install the APK on an Android device with debug/unknown-app installs enabled.

The workflow runs on a Blacksmith Ubuntu runner with aggressive Android NDK,
Rust, pnpm, and Gradle caching. It runs `typecheck`, unit tests, lint, web
build, regenerates the Tauri Android project, verifies the `ACTION_SEND` text
share target, then builds the debug APK.

## Commands

- `pnpm tauri` - run Tauri CLI
- `pnpm tauri:android:dev` - Android local dev
- `pnpm tauri:android:build` - Android production bundle

## Android share intake

The app includes a typed command path for a native share bridge:

- Frontend reads pending payload with `consume_pending_share`
- `src-tauri/src/lib.rs` exposes command handlers
- `src-tauri/android/AndroidManifest.share-intent.xml` documents the required `ACTION_SEND` intent filter
- `src-tauri/android/ShareIntentBridge.kt` documents parsing of shared text on Android (placeholder)

## In-app Temu shopping sessions

The app can expose a Temu shopping workspace on Android: users create named
shopping sessions, open Temu in native WebViews, use the app bottom bar for
navigation/readability controls, and capture the current product URL into the
existing import/list flow.

This is an independent user tool. It does not imply a partnership with Temu,
does not automate cart scraping, and does not sync or export Temu cookies,
localStorage, IndexedDB, passwords, or account sessions. Saved product/list data
can sync through the premium sync path only after the existing entitlement and
identity gates allow it.

## Data policy

- Shared URLs and draft text are validated and sanitized.
- Data is kept local-first with Pinia persisted storage.
- Stored data is not a full browser profile and does not contain Temu cookies/session data.
- Cloud sync, premium gates, quotas, billing, activation codes, and paid WebView beta access are not production-enabled in this MVP.
- Temu Shopping Lists uses the suite-owned entitlement model with `product_id=temu_shopping_lists`; this repository must not create a durable product-local entitlement ledger.
- Premium cloud sync scaffolding is URL-first and fail-closed: local stores can enqueue typed sync operations, but backend writes remain blocked until suite identity, entitlement bridge, and Convex deployment proof exist.

## Test checklist

See:

- `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md`
- `shipflow_data/workflow/test-checklists/temu-shopping-webview-sessions.md`
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-entitlements.md`
- `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`
