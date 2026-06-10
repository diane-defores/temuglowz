---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-09"
created_at: "2026-06-09 16:55:32 UTC"
updated: "2026-06-09"
updated_at: "2026-06-09 22:01:21 UTC"
status: ready
source_skill: sf-spec
source_model: "GPT-5 Codex"
scope: "Android app for persistent Temu shopping lists"
owner: "unknown"
confidence: high
user_story: "En tant qu'acheteur Temu, je veux enregistrer des produits Temu dans des listes nommees avec un snapshot durable, afin de retrouver le produit, ses photos et ses details meme si la fiche Temu disparait ou devient epuisee."
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - "Android Sharesheet ACTION_SEND"
  - "Tauri Android"
  - "Vue 3"
  - "Vite"
  - "Pinia persisted state"
  - "PrimeVue"
  - "Convex"
  - "Socialglowz codebase at /home/claude/socialglowz"
  - "Temu product links"
depends_on:
  - artifact: "explorations/2026-06-09-temu-shopping-lists-android.md"
    artifact_version: "1.0.0"
    required_status: "draft"
  - artifact: "Android Developers receive/send shared data docs"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
  - artifact: "Tauri v2 mobile plugin docs"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
  - artifact: "Convex schema and validation docs"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
  - artifact: "Temu Terms of Use"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
supersedes: []
evidence:
  - "Current /home/claude/temu workspace has no app source files and no git repository; clean slate confirmed."
  - "Socialglowz provides reusable Vue/Vite/Tauri Android/Pinia/PrimeVue/Convex/i18n/backup patterns."
  - "Android official docs describe share flows through ACTION_SEND and MIME types such as text/plain."
  - "Tauri official docs describe Android plugins as Kotlin classes extending app.tauri.plugin.Plugin with @Command methods callable from Rust or JavaScript."
  - "Convex official docs recommend schema validation for typed tables and argument/return validation for functions."
  - "Temu terms restrict automated crawling/scraping and significant content copying without permission; spec avoids automated cart scraping and anti-detection bypasses."
next_step: "/sf-start Temu shopping lists Android app"
---

# Title

Temu Shopping Lists Android App

## Status

Ready. This spec passed `/sf-ready` on 2026-06-09. The MVP is intentionally share-target-first; cart import remains an investigation spike until real Temu Android share/cart payloads are captured.

## User Story

En tant qu'acheteur Temu, je veux enregistrer des produits Temu dans des listes nommees avec un snapshot durable, afin de retrouver le produit, ses photos et ses details meme si la fiche Temu disparait ou devient epuisee.

Primary actor: Android user shopping on Temu.

Trigger: the user shares a Temu product into the app from Android, or pastes a Temu product URL manually.

Observable result: the app creates or updates a named shopping list containing a durable product snapshot with image, title, source URL, notes, quantity, selected options when known, price snapshot when known, and availability status.

## Minimal Behavior Contract

The app accepts a user-initiated Temu product share or manually pasted Temu URL, extracts and validates the product link and any provided text/image metadata, shows an import review screen where the user chooses or creates a shopping list, and saves a durable product snapshot that remains readable without the original Temu page. If parsing, preview fetching, image capture, or storage fails, the app keeps the user in a recoverable editor with the original URL and clear missing fields instead of losing the import. The easy-to-miss edge case is that a saved product whose Temu page later disappears must still display its archived title, image, notes, selected options, and original URL while marking availability as unknown, unavailable, sold out, removed, or link broken.

## Success Behavior

- Given a valid Temu product share with a URL, when the user selects the app from Android Sharesheet, then the app opens an import review screen populated with the URL and any parsed metadata.
- Given an import review with required data, when the user selects an existing list and taps save, then the list receives a new item with a durable product snapshot and the user can open it later offline.
- Given no existing list, when the user creates "Cuisine" during import, then the app creates that list and saves the product into it in one confirmed flow.
- Given a manually pasted Temu URL, when the URL validates as an accepted Temu host and product-like path, then the app creates the same review flow as Android share.
- Given the original Temu page later fails to load, when the user opens the saved item, then the app still shows the archived snapshot and marks availability as stale, unknown, unavailable, removed, or link broken.
- Given local data exists and cloud sync is configured, when the user authenticates, then the app can sync validated list and product metadata without requiring login for local use.

## Error Behavior

- Invalid URL: reject non-HTTP(S), non-Temu, localhost/private IP, intent, javascript, file, data, and malformed URLs with a recoverable message and no saved product.
- Incomplete share payload: preserve the raw shared text and URL, open manual edit mode, and require at least title or user-entered label before saving.
- Preview fetch fails: allow save with URL-only plus user-entered title/image, and record `metadataStatus: "manual_required"` or equivalent.
- Image download/cache fails: save the product without image, show an image-missing state, and allow the user to retry or add an image later.
- Duplicate import: detect same canonical Temu product URL or product id within the target list and ask whether to update snapshot, add another quantity, or cancel.
- Offline: allow saving locally; queue cloud sync only if cloud sync is enabled and authenticated.
- Cloud sync failure: keep local data authoritative, queue retry, and do not delete or overwrite local snapshots.
- Untrusted content: never execute shared text or remote HTML; sanitize displayed text; do not log cookies, auth tokens, full Temu session state, or raw private account data.
- Cart import failure: do not attempt automated scraping; show that cart import is not available until a user-provided share payload proves a safe path.

## Problem

Temu users can lose context when products become sold out, removed, renamed, or link-broken. A normal wishlist or cart link is insufficient because it points back to Temu instead of preserving the product details the user cared about.

The product value is personal archiving: the app must remember what was saved, not merely where it came from.

## Solution

Build a local-first Android app that receives Temu product shares and manual URLs, turns them into user-reviewed product snapshots, and organizes them in named shopping lists. Reuse Socialglowz as a source for the application scaffold and proven patterns, but replace its product domain with a shopping-list archive model and avoid its anti-detection WebView logic.

The first implementation should prioritize:

- share-target import from Android,
- manual URL paste fallback,
- durable local snapshots,
- named lists,
- export/backup,
- optional Convex-ready data model and sync queue patterns.

## Scope In

- New Android-capable app scaffold in `/home/claude/temu`, inspired by Socialglowz.
- Reuse/adapt Socialglowz stack: Vue 3, Vite, TypeScript, Tauri 2 Android, Pinia, pinia persisted state, PrimeVue, i18n, Convex patterns, Vitest, validation style, backup/export approach.
- Android share target for `text/plain` shared Temu product URLs.
- Manual URL paste/import flow.
- Product import review screen.
- Named shopping lists: create, rename, delete with confirmation, list detail.
- Product snapshot model with durable saved fields.
- Product detail screen showing archived snapshot and original Temu URL.
- Availability state model, initially manual/stale-aware rather than automated crawling.
- Local-first persistence.
- Optional cloud sync foundation using Convex schema/functions if the Socialglowz scaffold is copied with Convex enabled.
- Data export/backup path for saved lists and product snapshots.
- Real-device test checklist for Temu Android share payloads.

## Scope Out

- Automated scraping of Temu cart pages.
- Anti-bot bypassing, stealth WebView behavior, fingerprint spoofing, or evasion logic.
- Mass catalog crawling or background harvesting of Temu product data.
- Promise that full cart import works before a real Temu cart/share payload is captured and reviewed.
- Official Temu partnership, branding affiliation, or public claims that the app is authorized by Temu.
- Payment/subscription enforcement.
- iOS support for the first implementation.
- Browser extension support for the first implementation.
- Seller analytics, price tracking at scale, public product database, affiliate automation, or resale of archived Temu content.

## Constraints

- User-initiated imports only. The user must share, paste, or manually edit the product data.
- The app must not copy Socialglowz's anti-fingerprint or WebView stealth code.
- The app must treat shared text, fetched previews, and remote product metadata as untrusted input.
- Android share handling must follow Android intent/share-target patterns.
- Tauri Android native work must use explicit plugin commands and keep platform-specific code isolated.
- Local snapshots must remain readable without network access.
- Cloud sync, if included, must never be the only source of the user's local saved products.
- Temu URLs must be allowlisted by host and protocol; private network, local, file, data, javascript, and intent URLs must be rejected.
- Image storage must enforce size, count, MIME, and retry limits before cloud sync.
- The UI must avoid implying Temu affiliation; naming should be descriptive and independent.

## Test Contract

Surface: clean-slate Android app using Vue 3, Vite, TypeScript, Tauri Android, Kotlin plugin bridge, Pinia persisted state, optional Convex backend, PrimeVue UI, Vitest tests, and real-device manual QA.

Proof profile: automated type/unit/store/schema checks plus real Android device proof for share-target intake, offline persistence, invalid URL handling, and duplicate handling.

Checklist path: `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md`.

Required scenario IDs:

- `TC-AUTO-001`: TypeScript typecheck.
- `TC-AUTO-002`: Temu URL normalization/validation.
- `TC-AUTO-003`: Shared text parsing.
- `TC-AUTO-004`: Product snapshot validators and duplicate detection.
- `TC-AUTO-005`: Pinia store list CRUD, product import, offline persistence, and export serialization.
- `TC-AUTO-006`: Convex schema/function checks if Convex sync is implemented in the first pass.
- `TC-MANUAL-001`: Android Sharesheet target appears for Temu product text share.
- `TC-MANUAL-002`: Shared payload opens import review with parsed URL preserved.
- `TC-MANUAL-003`: Manual URL paste works on Android.
- `TC-MANUAL-004`: Product saved into "Cuisine" remains visible after app restart and airplane-mode open.
- `TC-MANUAL-005`: Product detail remains readable after network is disabled.
- `TC-MANUAL-006`: Invalid shared URL is rejected without partial save.
- `TC-MANUAL-007`: Duplicate import asks for update, quantity increment, or cancel.

Automated proof required:

- TypeScript typecheck.
- Unit tests for Temu URL normalization/validation.
- Unit tests for shared text parsing.
- Unit tests for product snapshot validators and duplicate detection.
- Pinia store tests for list CRUD, product import, offline persistence, and export serialization.
- Convex schema/function tests if Convex sync is implemented in the first pass.

Manual/device proof required:

- Android app appears as a target when sharing a Temu product link as text.
- Shared payload opens import review with parsed URL preserved.
- Manual URL paste works on Android.
- Product saved into "Cuisine" remains visible after app restart and airplane-mode open.
- Product detail remains readable after network is disabled.
- Invalid shared URL is rejected without partial save.
- Duplicate import asks for a clear decision.

Required results:

- All implemented automated checks pass, or any unavailable Android/Convex check is explicitly marked with evidence and scope impact during `/sf-verify`.
- Manual Android proof confirms share-target intake, manual paste, offline durability, invalid URL rejection, and duplicate handling.
- No Temu anti-detection, stealth WebView, cookie export, automated cart scraping, or private account data capture is present.
- README and manual QA checklist document import modes, non-affiliation, local-first behavior, and cart-import limits.

Proof order:

1. Scaffold checks and install/build commands.
2. Unit and type tests.
3. Tauri Android dev/build smoke.
4. Real Android share-target test with Temu product.
5. Offline persistence test.
6. Optional Convex sync round-trip test.

Exception with proof:

- Android SDK/device-dependent commands may be marked unavailable only with environment evidence and a documented real-device retest requirement before ship.

Exception without proof:

- Automated cart import proof is not required for MVP because cart import is explicitly out of scope until a safe user-provided payload is available.

## Dependencies

- Source inspiration: `/home/claude/socialglowz`.
- Local versions discovered in Socialglowz:
  - Vue `^3.5.35`
  - Vite `^6.4.2`
  - TypeScript `^5.9.3`
  - Tauri packages `^2.11.x`
  - Pinia `^2.3.1`
  - pinia-plugin-persistedstate `4.2.0`
  - PrimeVue `^4.5.5`
  - Convex `^1.39.1`
  - Vitest `^4.1.7`
- Official docs checked:
  - Android Developers, receive/send simple shared data: `https://developer.android.com/training/sharing/receive` and `https://developer.android.com/training/sharing/send`.
  - Tauri v2 plugin/mobile plugin docs: `https://v2.tauri.app/develop/plugins/` and `https://v2.tauri.app/develop/plugins/develop-mobile/`.
  - Convex schema docs: `https://docs.convex.dev/database/schemas`.
  - Convex validation docs: `https://docs.convex.dev/functions/validation`.
  - Temu Terms of Use: `https://www.temu.com/terms-of-use.html`.
- Documentation freshness verdict: `fresh-docs checked`. Official docs support the share-target/plugin/schema-validation approach and the Temu policy risk supports excluding automated scraping from MVP.

## Invariants

- A saved product snapshot is owned by the user and remains readable even if the Temu URL later fails.
- The original URL is preserved separately from editable user fields.
- Imported metadata is never trusted until validated and normalized.
- A list item must always reference exactly one saved product snapshot or embedded snapshot record.
- Deleting a list must not silently destroy snapshots if they are also used by another list.
- Offline local state must not be overwritten by an empty or stale cloud snapshot.
- Cloud sync must be additive/merge-aware and recoverable from failure.
- Availability refresh must never delete archived product details.
- Cart import must remain disabled unless a safe user-initiated share payload is implemented and tested.

## Links & Consequences

- UI: new app screens for lists, list detail, product detail, import review, manual import, settings/backup.
- Native Android: app manifest/share-target handling and possibly a Tauri Android plugin for receiving initial and resumed share intents.
- Data: local persisted stores; optional Convex tables/mutations/queries for cloud sync.
- Storage: product images require local cache and optional cloud storage policy with size limits.
- Security: URL and content validation is core, because shared text and remote previews are untrusted.
- Privacy: the app must not collect Temu session cookies or account data for MVP.
- Performance: image capture/cache must be bounded; list rendering should avoid loading full-size images in list views.
- Accessibility: product cards and import controls must be navigable and labelled; error messages must be visible and not only color-coded.
- App store/review: app description must avoid Temu affiliation claims.
- Documentation: README and manual QA checklist must explain import modes and cart-import limitation.

## Documentation Coherence

Update or create:

- `README.md` with product purpose, non-affiliation statement, local dev commands, Android build commands, and import workflow.
- `shipflow_data/technical/architecture.md` after implementation begins, if project governance is initialized.
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md` for real-device manual QA.
- In-app help/onboarding copy explaining "snapshot saved on date" and why cart import may not be available.
- Privacy/support notes stating user-initiated imports only and no Temu login/session capture in MVP.

## Edge Cases

- Temu short links, tracking links, localized domains, mobile web domains, and redirect URLs.
- Share text includes marketing copy, price, emojis, or multiple URLs.
- Share payload has no URL.
- URL is duplicated in the same list.
- Same product appears in multiple lists.
- Product title is extremely long.
- Product image is huge, unsupported MIME, unavailable, or hotlink-protected.
- User saves while offline.
- App receives a share while already open.
- Android kills and restores the app during import review.
- User deletes a list that contains products also saved elsewhere.
- Cloud account is empty after local data exists.
- Availability check says removed but the local snapshot must remain visible.
- Temu changes link structure.
- User tries to import a non-Temu marketplace link.

## Implementation Tasks

- [ ] Task 1: Initialize the app scaffold from Socialglowz patterns, not by wholesale copying unrelated domain code.
  - File: `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/`, `src-tauri/`
  - Action: Create a Vue 3 + Vite + Tauri Android + TypeScript project with Pinia, PrimeVue, i18n, Vitest, and Android scripts adapted from Socialglowz.
  - User story link: Creates the Android app foundation.
  - Depends on: none.
  - Validate with: install succeeds, `pnpm typecheck`, `pnpm test:once`, and Tauri info/dev command smoke where environment permits.
  - Notes: Remove extension-only and social-network-specific entrypoints.

- [ ] Task 2: Define product/list domain types and validators.
  - File: `src/domain/temu/types.ts`, `src/domain/temu/validators.ts`, `src/domain/temu/url.ts`, `src/domain/temu/importParser.ts`
  - Action: Define `ShoppingList`, `ProductSnapshot`, `ListItem`, `ProductImage`, `AvailabilityState`, import source types, URL normalization, and shared text parser.
  - User story link: Ensures durable product snapshots are structured and safe.
  - Depends on: Task 1.
  - Validate with: unit tests for valid URLs, invalid URLs, shared text with multiple URLs, empty payload, duplicate canonical URL.
  - Notes: Reject non-Temu hosts and unsafe protocols.

- [ ] Task 3: Build local-first Pinia stores.
  - File: `src/stores/shoppingLists.ts`, `src/stores/productSnapshots.ts`, `src/stores/importDrafts.ts`, `src/utils/pinia.ts`
  - Action: Persist lists, snapshots, import drafts, duplicate state, and offline-safe saves using pinia persisted state.
  - User story link: Keeps snapshots readable after restart and offline.
  - Depends on: Task 2.
  - Validate with: store tests for create list, save product, duplicate import, delete list, restart serialization.
  - Notes: Local state is authoritative for MVP.

- [ ] Task 4: Implement Android share-target intake.
  - File: `src-tauri/`, `src-tauri/gen/android/app/src/main/AndroidManifest.xml` or Tauri Android config equivalents, `src-tauri/plugins/share-intent/`, `src/platform/shareIntent.ts`
  - Action: Register text share target for Android and expose received share payloads to the Vue app through Tauri/Kotlin plugin or lifecycle bridge.
  - User story link: Enables saving directly from Temu.
  - Depends on: Task 1 and Task 2.
  - Validate with: Android manual test shares a Temu product and import review opens with raw text and URL.
  - Notes: Must handle cold start and already-running app.

- [ ] Task 5: Build import review and manual URL screens.
  - File: `src/views/ImportReviewView.vue`, `src/views/ManualImportView.vue`, `src/components/import/*`, `src/router/*`
  - Action: Show parsed import draft, missing fields, list selector/create-list control, image preview, save/cancel, and error states.
  - User story link: Lets the user confirm what gets archived and where it goes.
  - Depends on: Tasks 2, 3, and 4.
  - Validate with: component/store tests and manual browser/mobile smoke.
  - Notes: Never auto-save unreviewed imported content.

- [ ] Task 6: Build shopping list and product detail UI.
  - File: `src/views/ListsView.vue`, `src/views/ListDetailView.vue`, `src/views/ProductDetailView.vue`, `src/components/products/*`
  - Action: Provide list CRUD, product cards, archived product detail, availability badge, notes, quantity, tags, and open-original-link action.
  - User story link: Makes saved Temu objects usable after they disappear from Temu.
  - Depends on: Task 3.
  - Validate with: UI smoke, store state checks, offline app reopen.
  - Notes: Use restrained app UI, not landing-page style.

- [ ] Task 7: Add image cache and snapshot storage policy.
  - File: `src/domain/temu/images.ts`, `src/stores/productSnapshots.ts`, `src-tauri/src/` or web/local storage adapter
  - Action: Store a bounded main image and optional gallery images locally with MIME/size/count limits and retry state.
  - User story link: Preserves what the product looked like.
  - Depends on: Tasks 2 and 3.
  - Validate with: image validation tests and manual import with failed image fetch.
  - Notes: Do not block saving a product if image capture fails.

- [ ] Task 8: Add backup/export.
  - File: `src/features/backup/*`, `src-tauri/src/backup.rs`, `src-tauri/plugins/share-intent/android/*` if native file save is needed
  - Action: Adapt Socialglowz encrypted/export backup pattern for lists and snapshots.
  - User story link: Protects the user's archive from app/device loss.
  - Depends on: Task 3 and Task 7.
  - Validate with: export/import round-trip test and Android manual save/load if implemented.
  - Notes: Do not include cookies or Temu session data.

- [ ] Task 9: Add optional Convex schema and sync foundation.
  - File: `convex/schema.ts`, `convex/shoppingLists.ts`, `convex/productSnapshots.ts`, `src/lib/cloudSync.ts`, `src/lib/cloudSyncQueue.ts`
  - Action: Adapt Socialglowz Convex auth/sync patterns for list/snapshot metadata, excluding large images unless storage policy is explicit.
  - User story link: Enables future cross-device archive recovery without blocking local-first use.
  - Depends on: Tasks 2 and 3.
  - Validate with: Convex schema tests, mutation tests, and local-to-cloud queue tests if Convex is enabled.
  - Notes: This task can be deferred if `/sf-ready` narrows MVP to local-only.

- [ ] Task 10: Write real-device QA checklist and README.
  - File: `README.md`, `shipflow_data/workflow/test-checklists/temu-shopping-lists-android.md`
  - Action: Document setup, Android run/build commands, import workflow, non-affiliation statement, known cart-import limitation, and manual test steps.
  - User story link: Makes the implementation verifiable and maintainable.
  - Depends on: Tasks 1 through 8.
  - Validate with: checklist executed during `/sf-verify`.
  - Notes: Keep public wording factual and avoid implying Temu authorization.

- [ ] Task 11: Cart import investigation spike.
  - File: `shipflow_data/workflow/research/temu-cart-share-payloads.md` or `docs/explorations/temu-cart-import.md`
  - Action: Capture user-provided examples of Temu product share and cart/share-list payloads from a real Android device, document what fields are available, and decide whether cart import can be added without scraping.
  - User story link: Evaluates the user's desired "from cart to lists" workflow safely.
  - Depends on: Task 4.
  - Validate with: recorded sanitized payload samples and a go/no-go recommendation.
  - Notes: Must not log private account data, cookies, addresses, order history, or payment data.

## Acceptance Criteria

- [ ] AC1: Given the app is installed on Android, when the user shares a Temu product as text, then the app appears as a share target and opens the import review flow.
- [ ] AC2: Given a valid Temu product URL in shared text, when import review opens, then the canonical URL is preserved and unsafe extra text is displayed only as sanitized text.
- [ ] AC3: Given a user creates a list named "Cuisine" during import, when they save, then the list exists and contains the product snapshot.
- [ ] AC4: Given a saved product, when the device is offline and the app restarts, then the product title, archived image if available, notes, selected options, availability state, and original URL remain visible.
- [ ] AC5: Given the same product is imported again into the same list, when the duplicate is detected, then the user can update, add quantity, or cancel without accidental duplicate creation.
- [ ] AC6: Given an invalid URL such as `javascript:`, `file:`, `intent:`, localhost, private IP, or non-Temu host, when the user tries to import, then no product is saved and a recoverable error is shown.
- [ ] AC7: Given image capture fails, when the user saves with a manually entered title, then the product is saved with an image-missing state rather than blocking the archive.
- [ ] AC8: Given cloud sync is unavailable or unauthenticated, when the user saves locally, then the snapshot remains local and no data loss occurs.
- [ ] AC9: Given cloud sync is implemented, when a mutation fails, then the operation is queued/retried and local data remains authoritative.
- [ ] AC10: Given cart import has not passed the spike, when the user looks for cart import, then the app does not scrape Temu and communicates the limitation or provides a disabled/coming-later state.
- [ ] AC11: Given README/setup docs are read by a fresh developer, when they follow them, then they can run the relevant local checks and understand the Android proof path.
- [ ] AC12: Given `/sf-verify` runs after implementation, when it checks policy-sensitive code, then no anti-detection, stealth WebView, cookie export, or automated cart scraping logic is present for Temu.

## Test Strategy

- Unit tests:
  - URL validation and canonicalization.
  - Shared text parser.
  - Snapshot validation.
  - Duplicate detection.
  - Store reducers/actions for list and product lifecycle.
  - Export/import serialization.
- Integration tests:
  - Import draft to saved list flow.
  - Offline local persistence.
  - Optional Convex queue and mutation round trip.
- Manual Android QA:
  - Temu share to app cold start.
  - Temu share to app while already open.
  - Manual paste import.
  - Airplane-mode open of saved product.
  - Invalid URL rejection.
  - Duplicate import handling.
- Verification commands expected after implementation:
  - `pnpm typecheck`
  - `pnpm test:once`
  - `pnpm lint:check` if lint script is present
  - `pnpm tauri:android:dev` or `pnpm tauri:android:build` where Android SDK/device is available

## Risks

- Temu payload uncertainty: share payloads may include only short links or marketing text. Mitigation: manual editor and product URL preservation.
- Temu policy/ToS risk: automated scraping or content harvesting may be prohibited. Mitigation: user-initiated import only; no cart scraping; no stealth WebView logic.
- Image storage cost and privacy: product images can be large. Mitigation: local-first, bounded image limits, optional cloud image sync only after storage policy is explicit.
- Android share lifecycle complexity: app can be cold-started or resumed. Mitigation: native plugin/lifecycle tests.
- Cloud overwrites local archive: empty cloud state can erase local user data if merged poorly. Mitigation: Socialglowz-style sync decision tests and local authority.
- App store positioning: naming or copy could imply Temu affiliation. Mitigation: non-affiliation statement in docs and app copy.
- Fresh-device proof gap: without real Temu Android payload samples, cart import cannot be promised. Mitigation: dedicated spike.

## Execution Notes

Read first:

- `explorations/2026-06-09-temu-shopping-lists-android.md`
- `/home/claude/socialglowz/package.json`
- `/home/claude/socialglowz/vite.config.ts`
- `/home/claude/socialglowz/src-tauri/plugins/android-webview/`
- `/home/claude/socialglowz/src/lib/cloudSync.ts`
- `/home/claude/socialglowz/convex/schema.ts`

Implementation approach:

1. Copy/adapt the project scaffold and build configuration from Socialglowz, but remove unrelated social network, extension, and stealth WebView code.
2. Implement the domain model and validation before UI.
3. Implement local-first stores before cloud sync.
4. Implement import review and manual fallback before attempting rich preview/image capture.
5. Implement Android share target and verify on a real Android device.
6. Add backup/export.
7. Add Convex sync only after local behavior is stable, or explicitly defer it in `/sf-ready`.
8. Run cart import as research only after share-target MVP works.

Packages to use:

- Use the same core stack as Socialglowz unless `/sf-ready` finds a blocker: Vue, Vite, TypeScript, Tauri Android, Pinia, PrimeVue, Convex, Vitest.

Packages/patterns to avoid:

- Do not copy Socialglowz social-network views, extension-specific UI, or anti-fingerprint code.
- Do not add generic scraping/browser automation libraries for Temu.
- Do not store Temu cookies or session dumps.

Stop conditions:

- Stop and reroute to exploration if real Temu share payloads do not contain a usable URL.
- Stop and ask the operator before enabling cloud image sync because it changes cost/privacy posture.
- Stop before implementing cart import if the only viable path is scraping or bypassing protections.
- Stop before shipping if Android real-device share proof is unavailable.

Fresh external docs:

- `fresh-docs checked` for Android share intents, Tauri mobile plugins, Convex schemas/validation, and Temu policy constraints.

## Open Questions

No blocking open questions for the share-target/manual-URL MVP.

Non-blocking decisions to revisit during implementation:

- Whether Convex sync is included in the first build or scaffolded but disabled.
- Whether product images are local-only in MVP or cloud-synced later.
- Whether availability checks are manual-only or user-triggered refresh.
- Whether the app name should avoid "Temu" in the package/product name to reduce affiliation risk.
- Whether a real cart/share-list payload exists and can support cart import without scraping.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-09 16:55:32 UTC | sf-spec | GPT-5 Codex | Created full spec from exploration report and Socialglowz context | Draft spec saved; ready gate required before implementation | /sf-ready Temu shopping lists Android app |
| 2026-06-09 22:01:21 UTC | sf-ready | GPT-5 Codex | Applied readiness gate, tightened test contract labels, and transitioned spec to ready | ready | /sf-start Temu shopping lists Android app |
| 2026-06-09 22:03:58 UTC | sf-docs | GPT-5 Codex | Bootstrapped `shipflow_data/technical` and mapped planned code coverage for Governance Corpus Gate | Technical docs baseline added for clean-slate scaffold; audit-ready map + temp coverage status | /sf-start Temu shopping lists Android app |
| 2026-06-10 07:40:52 UTC | sf-start | GPT-5 Codex + gpt-5.3-codex-spark worker | Implemented Vue/Vite/Tauri MVP scaffold, validators/parsers/stores, tests, export checks, Android generated project/share-target manifest, and technical docs | partial: web/local-first MVP validated; Android runtime share payload bridge and real-device proof pending; Android build blocked by host/NDK architecture mismatch | /sf-verify Temu shopping lists Android app |
| 2026-06-10 07:44:48 UTC | sf-verify | GPT-5 Codex | Ran automated checks, browser proof, metadata lint, checklist gate, policy scan, Tauri frontend build, and Android build attempt | partial: automated/web proof passed; required Android device/share-payload scenarios remain NOT_RUN; Android build blocked by local NDK host mismatch | finalize Android share bridge on compatible Android toolchain/device |
| 2026-06-10 07:55:25 UTC | sf-ship | GPT-5 Codex | Initialized Git, created private GitHub repo `diane-defores/temu-shopping-lists`, pushed `main`, and confirmed `Dev Builds` workflow is active | shipped for remote collaboration and CI debug APK builds; product validation remains partial per sf-verify | finalize Android share bridge on compatible Android toolchain/device |
| 2026-06-10 08:26:58 UTC | sf-fix | GPT-5 Codex | Switched debug APK CI to Blacksmith runner and added aggressive Android NDK, Rust, pnpm, and Gradle cache policy | CI hardening prepared; YAML and metadata lint passed locally; product validation remains partial per sf-verify | push and confirm CI run |

## Current Chantier Flow

- sf-spec: done
- sf-ready: done
- sf-start: partial
- sf-verify: partial
- sf-end: not launched
- sf-ship: shipped

Next command: `finalize Android share bridge on compatible Android toolchain/device`
