---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "0.2.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: app-runtime
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - app/src/
  - app/src-tauri/
  - app/convex/
  - README.md
  - shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md
  - shipglowz_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md
  - shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md
  - shipglowz_data/workflow/specs/temu-price-availability-observations.md
  - shipglowz_data/technical/support/entitlements-runbook.md
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "README.md and package configuration describe the implemented Vue/Vite/Tauri local-first app."
  - "Legacy app governance recorded the suite-ledger entitlement decision, fail-closed sync boundary, SocialGlow-derived shell direction, and user-initiated product-observation contract."
next_review: "2026-08-12"
next_step: "/103-sg-verify app runtime"
---

# Temu Shopping Lists Android App

## Purpose

Document the local-first Android Tauri app that saves Temu product links into durable shopping lists.

## Owned Files

- `app/src/`: Vue pages, routes, import parsing, validation, stores, backup, and UI.
- `app/src/lib/accessModel.ts`: product, plan, source, and status allowlists plus fail-closed protected access.
- `app/src/stores/productObservations.ts`: bounded price/availability observations and in-app reminder state.
- `app/src-tauri/`: Tauri commands, Android project, share-target contract, and WebView integration.
- `app/convex/`: fail-closed cloud-sync/auth backend surface.
- `README.md`: scope, setup, security boundary, and validation limitations.
- `shipglowz_data/workflow/test-checklists/`: manual Android, entitlement, sync, WebView, UI-copy, and observation proof.
- `shipglowz_data/technical/support/entitlements-runbook.md`: support boundary before real grants or activation paths.

## Entrypoints

- App bootstrap: `app/src/main.ts`
- Routes: `app/src/router/index.ts`
- Import flow: `app/src/app-pages/ManualImportPage.vue` and `app/src/app-pages/ImportReviewPage.vue`
- Lists and products: `app/src/App.vue`, `app/src/app-pages/ListDetailPage.vue`, and `app/src/app-pages/ProductDetailPage.vue`
- Parsing and validation: `app/src/utils/url.ts`, `app/src/lib/importParser.ts`, and `app/src/lib/validators.ts`
- Local persistence: `app/src/stores/`
- Native commands and share target: `app/src-tauri/src/lib.rs` and `app/src-tauri/gen/android/app/src/main/AndroidManifest.xml`

## Invariants

- Imports are user-initiated and unsafe/non-Temu URLs are rejected before saving.
- Saved data is local-first; Temu cookies, credentials, browser profiles, and session exports are not stored.
- No scraping, stealth WebView, automated cart import, or live background price monitoring is allowed.
- Cloud sync and entitlements remain blocked until suite identity, entitlement, and deployment proof exist.
- Native Android proof is authoritative from CI/device checks, not this aarch64 local host.
- Product observations are explicit user actions or manual entries; absence of an observation is not evidence that a product is unavailable.
- Visible profile management remains outside the v1 shopping-session UI.

## Access and entitlements

Temu Shopping Lists uses the suite-owned entitlement ledger with stable `product_id=temu_shopping_lists`; it must not create an independent durable entitlement source. Local access state may be a cache or UI mirror only. Authentication, client-supplied identifiers, local storage, and sync scaffolding never grant protected access by themselves.

Local lists, saved snapshots, backup import/export, and local browsing remain usable without premium access. Protected cloud sync, quotas, billing, activation codes, support grants, or other premium capabilities must fail closed until suite identity and the required entitlement are verified.

## Premium cloud sync

The durable contract is local-first and account-scoped. Promotion and hydration require verified suite identity plus active `cloud_sync` entitlement. Sign-in, sign-out, failed sync, account mismatch, expired entitlement, or an empty cloud snapshot must never silently erase local data.

Sync records use stable domain keys, checksums, idempotency keys, typed offline operations, tombstones, and explicit states that distinguish “saved locally” from “synced to cloud”. Hydration must consume bounded pages, verify owner/product/environment on every page, and replay queued writes only after the required pages have been applied. Binary image mirroring, Temu session data, billing-provider behavior, and background price histories remain outside the initial URL-backed sync boundary.

## UI shell decision

The app shell is a copy-first adaptation of the proven SocialGlow/Social News interaction model to Temu shopping sessions. The canonical implementation authority is `shipglowz_data/technical/design-system-authority.md`. Shopping-session labels, dark mode, text-size controls, compact navigation, and no visible v1 profile management are durable decisions; visual compliance still requires current code and screenshot proof.

## Product observations

The first observation slice stores bounded, local-first records for a saved product: observed price, observed availability, timestamp, source/status, and a maximum history of 50 records. Backup export includes retained observations while older backups without them remain valid.

The Android WebView action “Observer ce produit” may capture only the current URL after an explicit user action. It may link to an existing snapshot or route an unsaved product through import review, but it must not parse Temu DOM price/stock or request Android notification permission. Reminder proof is in-app only for this slice.

## Validation

From `app/`, run `pnpm typecheck`, `pnpm typecheck:convex`, `pnpm test:once`, `pnpm lint:check`, and `pnpm build`. Use GitHub Actions Blacksmith plus a real device for native Android proof. A historical CI run built a debug APK successfully, but that history does not replace fresh build or device proof.

## Reader Checklist

- Read URL validation and store tests before changing import, persistence, or observations.
- Read the Android manifest and share bridge together before claiming Sharesheet support.
- Read the entitlement and premium-sync specs before changing protected backend behavior.
- Read the design-system authority before changing app styling or shared shell primitives.
- Run the policy scan for scraping, stealth, cookie, credential, or session handling before verification.

## Maintenance Rule

Update this document when app scope, persistence, security boundaries, sync state, or authoritative proof changes.
