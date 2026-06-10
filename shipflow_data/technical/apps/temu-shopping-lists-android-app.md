---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-build
scope: "temu-shopping-lists-android-app"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - src/
  - src-tauri/
  - convex/
  - shipflow_data/workflow/specs/temu-shopping-lists-android-app.md
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "Vue/Vite local-first MVP scaffold exists with parser, validator, store, backup, and UI tests."
  - "Android Tauri project was initialized, but real-device share payload proof remains pending."
next_review: "2026-07-10"
next_step: "/sf-verify Temu shopping lists Android app"
---

# Temu Shopping Lists Android App

## Purpose

Document the implemented app surfaces for the local-first Temu shopping-list archive MVP.

## Owned Files

- `src/`: Vue app, routes, pages, Pinia stores, URL/import parsing, validation, backup serialization, and browser-facing share bridge.
- `src-tauri/`: Tauri configuration, Rust commands, Android generated project, manifest share target, and Android share-intent contract files.
- `convex/schema.ts`: optional future cloud-sync schema scaffold.
- `README.md`: developer setup, scope, and non-affiliation notes.
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md`: manual Android proof checklist.

## Entrypoints

- App bootstrap: `src/main.ts`
- Routes: `src/router/index.ts`
- Manual import: `src/pages/ManualImportPage.vue`
- Import review: `src/pages/ImportReviewPage.vue`
- Lists and details: `src/pages/ListsPage.vue`, `src/pages/ListDetailPage.vue`, `src/pages/ProductDetailPage.vue`
- Domain parsing and validation: `src/utils/url.ts`, `src/lib/importParser.ts`, `src/lib/validators.ts`
- Local persistence: `src/stores/*.ts`, `src/utils/pinia.ts`
- Tauri commands: `src-tauri/src/lib.rs`
- Android share target: `src-tauri/gen/android/app/src/main/AndroidManifest.xml`

## Invariants

- Imports are user initiated through manual URL input or Android share intent.
- Non-Temu and unsafe URLs are rejected before saving.
- Saved snapshots remain local-first and readable after reload without cloud sync.
- The app must not store Temu cookies, session state, account data, or browser profiles.
- The app must not include scraping, stealth WebView, anti-bot bypass, or automated cart import code.
- Convex is optional scaffolding only until sync functions and merge tests are implemented.
- Android runtime share payload delivery is not verified until a compatible Android toolchain/device test passes.

## Validation

```bash
pnpm typecheck
pnpm test:once
pnpm lint:check
pnpm build
pnpm tauri:build
pnpm tauri:android:build
```

Current known limits:

- `pnpm tauri:android:build` reaches Android linking but fails in this environment because the installed NDK clang is `linux-x86_64` and cannot execute on the current `aarch64` host.
- Linux desktop `cargo check` is blocked by missing Tauri Linux prerequisites (`pkg-config`, `webkit2gtk-4.1`, `rsvg2`).
- Android real-device Sharesheet proof is still required.

## Reader Checklist

- Check URL validation before trusting any import flow.
- Check store tests before changing list or snapshot persistence.
- Check Android manifest and share bridge together before claiming Android Sharesheet support.
- Check README and manual checklist when changing product scope or Android setup.
- Run the policy scan for forbidden scraping/stealth/cookie/session code before verification.

## Maintenance Rule

Update this document whenever app entrypoints, persistence contracts, Android share handling, Convex sync posture, backup format, validation commands, or security invariants change.

