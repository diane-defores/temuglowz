---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "1.0.7"
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
  - shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md
  - shipflow_data/workflow/test-checklists/temu-shopping-lists-entitlements.md
  - shipflow_data/technical/support/entitlements-runbook.md
  - /home/claude/winflowz/shipflow_data/workflow/docs/technical/suite-authentication.md
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "Vue/Vite local-first MVP scaffold exists with parser, validator, store, backup, and UI tests."
  - "Android Tauri project was initialized, but real-device share payload proof remains pending."
  - "User decision 2026-06-10: Temu Shopping Lists should use the suite-owned entitlement ledger with product_id=temu_shopping_lists."
  - "Entitlement guardrail slice added on 2026-06-10 with access allowlists, fail-closed access contract, checklist, and support runbook skeleton."
  - "Development mode decision 2026-06-10: local checks cover TS/Vue/Convex/unit/web only; native Android/Tauri/WebView proof is CI-first on GitHub Actions Blacksmith."
next_review: "2026-07-10"
next_step: "/sf-verify Temu shopping lists Android app"
---

# Temu Shopping Lists Android App

## Purpose

Document the implemented app surfaces for the local-first Temu shopping-list archive MVP.

## Owned Files

- `src/`: Vue app, routes, pages, Pinia stores, URL/import parsing, validation, backup serialization, and browser-facing share bridge.
- `src/lib/accessModel.ts`: product id, plan/source/status allowlists and fail-closed protected access contract.
- `src-tauri/`: Tauri configuration, Rust commands, Android generated project, manifest share target, and Android share-intent contract files.
- `convex/schema.ts`: optional future cloud-sync schema scaffold.
- `README.md`: developer setup, scope, and non-affiliation notes.
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md`: manual Android proof checklist.
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-entitlements.md`: entitlement proof checklist.
- `shipflow_data/technical/support/entitlements-runbook.md`: support runbook skeleton before real grants/codes.

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
- The product target is Android Tauri with native WebView; a public web app must not be assumed from the browser test surface.
- Android runtime share payload delivery is not verified until a compatible Android toolchain/device test passes.

## Access And Entitlements

Temu Shopping Lists is a suite-ledger product, not a standalone entitlement
system. Its stable `product_id` is `temu_shopping_lists`.

Current MVP behavior remains local-first and free: saved Temu product snapshots,
lists, backup export/import, and local browsing do not require entitlement
checks because they do not access protected backend product data.

Protected cloud sync, premium capabilities, quotas, billing, app-store
purchases, activation codes, support grants, or paid WebView beta access must
not ship until the app can query or mirror the suite-owned entitlement ledger.
The durable source of truth is the WinFlowz suite ledger, not this repository.

Product-local access state is allowed only as a cache, bridge mirror, UI status,
or product-specific gate. It must never become durable entitlement truth. The
app must also never treat authentication, client-supplied `userId`,
client-supplied `productId`, local storage, or Convex sync scaffolding as
authorization.

## Premium Cloud Sync

Premium cloud sync is specified as a local-first, multi-device feature in
`shipflow_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md`.
The first implementation slice is URL-backed sync for lists, list items, and
product snapshots. Existing product media fields such as `imageUrl` and
`galleryImageUrls` may sync as URL strings only; copied binary images, image
mirroring, price-history timelines, billing providers, activation codes, and
Temu browser/session data stay outside the first slice.

Cloud sync must promote local data only after suite identity and active
`cloud_sync` entitlement are verified. A clean install may hydrate from cloud
only after the same checks pass. Existing local data must never be silently
wiped by sign-in, sign-out, failed sync, account mismatch, expired entitlement,
or an empty cloud snapshot.

The sync model requires stable domain keys, checksums, account association
metadata, typed offline operations, idempotency keys, tombstones for deletes,
and visible states for local-only, blocked, pending, syncing, synced, retrying,
conflict, account mismatch, and error. "Saved locally" and "synced to cloud"
must remain distinct in UI and docs.

Current implementation status:

- Local stores can enqueue typed sync operations only after an active sync
  session gate has verified local identity, entitlement, and account marker.
- `convex/` now has a typechecked fail-closed backend surface and sync schema
  scaffolding.
- `/sync` exposes local-only/pending queue status without claiming active cloud
  backup.
- Convex project `diane-defores/temu` exists with dev deployment
  `dev:chatty-canary-255`; `convex/_generated/` is generated and committed.
- Deployment proof currently shows the backend fails closed with
  `missing_identity` when called without app auth.
- Real cloud writes, hydration, promotion, conflict UI, and reinstall recovery
  remain unshipped until the suite entitlement bridge and Convex deployment
  proof exist.

## Validation

Local development mode:

- Authoritative local checks: `pnpm typecheck`, `pnpm typecheck:convex`,
  `pnpm test:once`, `pnpm lint:check`, `pnpm build`, and focused browser smoke
  tests for Vue-only screens.
- Non-authoritative in this workspace: local `pnpm tauri:android:*`, because
  this host is `aarch64` while the installed Android NDK clang is
  `linux-x86_64`.
- Authoritative native Android proof: GitHub Actions `Dev Builds` on
  Blacksmith, plus real-device APK smoke tests.

```bash
pnpm typecheck
pnpm typecheck:convex
pnpm test:once
pnpm lint:check
pnpm build
```

Current known limits:

- `pnpm tauri:android:build` reaches Android linking but fails in this local environment because the installed NDK clang is `linux-x86_64` and cannot execute on the current `aarch64` host.
- Android build proof is available from CI Blacksmith run `27301921202` for commit `cde00d0`, which built and published fallback release `android-debug-8`.
- Linux desktop `cargo check` is blocked by missing Tauri Linux prerequisites (`pkg-config`, `webkit2gtk-4.1`, `rsvg2`).
- Android real-device Sharesheet proof is still required.

## Reader Checklist

- Check URL validation before trusting any import flow.
- Check store tests before changing list or snapshot persistence.
- Check Android manifest and share bridge together before claiming Android Sharesheet support.
- Check README and manual checklist when changing product scope or Android setup.
- Check `CLAUDE.md` development mode before choosing local, CI, or device proof.
- Run the policy scan for forbidden scraping/stealth/cookie/session code before verification.

## Maintenance Rule

Update this document whenever app entrypoints, persistence contracts, Android share handling, Convex sync posture, backup format, validation commands, or security invariants change.
