---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.6"
project: "temu"
created: "2026-06-10"
created_at: "2026-06-10 11:35:09 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 10:46:49 UTC"
status: active
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "Premium multi-device cloud sync for Temu Shopping Lists"
owner: "Diane"
confidence: high
user_story: "En tant qu'utilisatrice premium de Temu Shopping Lists, je veux synchroniser mes listes, items et snapshots de produits entre plusieurs appareils, afin de retrouver mes archives Temu personnelles sans perdre mes donnees locales."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "src/stores/shoppingLists.ts"
  - "src/stores/productSnapshots.ts"
  - "src/types/domain.ts"
  - "src/lib/cloudSync.ts"
  - "src/lib/cloudSyncQueue.ts"
  - "src/lib/convex.ts"
  - "src/lib/convexAuth.ts"
  - "src/lib/postAuthSyncFeedback.ts"
  - "src/lib/syncMerge.ts"
  - "src/types/sync.ts"
  - "src/lib/accessModel.ts"
  - "src/components/PostAuthSyncFeedback.vue"
  - "src/ui/temu-shell/components/MobileSettingsSheet.vue"
  - "convex/schema.ts"
  - "convex/auth.ts"
  - "convex/auth.config.ts"
  - "convex/http.ts"
  - "convex/_generated/api.d.ts"
  - "convex/sync.ts"
  - "convex/syncAccess.ts"
  - "src/pages/SyncPage.vue"
  - "README.md"
  - "shipflow_data/technical/apps/temu-shopping-lists-android-app.md"
  - "shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md"
  - "shipflow_data/workflow/test-checklists/temu-shopping-lists-entitlements.md"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md"
    artifact_version: "1.0.5"
    required_status: reviewed
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: ready
  - artifact: "shipflow_data/technical/apps/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.2"
    required_status: draft
  - artifact: "/home/claude/shipflow/skills/600-sf-local-cloud-sync/references/local-cloud-sync-doctrine.md"
    artifact_version: "1.0.0"
    required_status: draft
  - artifact: "/home/claude/shipflow/skills/600-sf-local-cloud-sync/references/ux-security-checklist.md"
    artifact_version: "1.0.0"
    required_status: draft
  - artifact: "Convex Auth docs"
    artifact_version: "accessed 2026-06-11"
    required_status: reviewed
  - artifact: "Convex Auth in Functions docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
  - artifact: "Convex server/functions API docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
  - artifact: "Convex schema docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
  - artifact: "Convex file storage docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
supersedes: []
evidence:
  - "User decision 2026-06-10: cloud sync is a premium feature and should support multi-device sync."
  - "User decision 2026-06-10: first sync slice stores product/list data and URL strings only; binary image storage and copied media are deferred."
  - "User decision 2026-06-10: price and availability history should be a later task, not part of the first cloud sync slice."
  - "Existing app uses Pinia persisted local stores for shopping lists and product snapshots."
  - "Existing Convex schema is explicitly sync scaffolding and not an authorization model."
  - "Entitlement guardrails already define product_id=temu_shopping_lists, protected feature cloud_sync, and fail-closed access decisions."
  - "Official Convex docs checked on 2026-06-10 for auth in functions, public function access control, validators, schemas, mutations/queries, and file storage follow-up."
  - "User decision 2026-06-11: Temu auth and sync onboarding should copy SocialGlowz patterns, including the progressive post-auth sync feedback pop-up."
  - "Implementation slice 2026-06-11 added Convex Auth client/server wiring, SocialGlowz-style account forms, and post-auth sync feedback while preserving entitlement fail-closed behavior."
next_step: "/101-sf-ready Refresh premium cloud sync spec after SocialGlowz auth/onboarding adaptation"
---

# Title

Premium Multi-Device Cloud Sync For Temu Shopping Lists

## Status

Active chantier, updated by `/100-sf-spec` after the SocialGlowz auth/onboarding port. Re-run `/101-sf-ready` before the next implementation slice because the spec now explicitly covers the account onboarding and post-auth sync feedback path. This spec is intentionally high-risk because it touches user data, auth, premium entitlements, multi-device merge behavior, and cloud persistence. The first implementation slice should be complete for URL-backed product/list sync, but must not claim copied image storage, price-history tracking, billing-provider setup, or Temu account/browser-session sync.

## User Story

En tant qu'utilisatrice premium de Temu Shopping Lists, je veux synchroniser mes listes, items et snapshots de produits entre plusieurs appareils, afin de retrouver mes archives Temu personnelles sans perdre mes donnees locales.

Primary actor: signed-in premium Temu Shopping Lists user.

Trigger: the user signs in and enables cloud sync, signs into a new device, reinstalls the app, or edits local data while sync is enabled.

Observable result: local lists, list items, saved product snapshots, canonical Temu URLs, original Temu URLs, and saved media URL strings synchronize across devices after backend identity and entitlement checks, while local-only data remains readable if sync is unavailable or access expires.

## Minimal Behavior Contract

The app remains local-first by default. Account creation/sign-in follows the SocialGlowz Convex Auth pattern for identity and visible post-auth preparation feedback, but identity alone must never enable cloud sync. When a user enables premium cloud sync, the client must require suite authentication and active `temu_shopping_lists` entitlement for `cloud_sync`, then promote or hydrate data through backend functions that recompute identity, account association, product namespace, entitlement, payload validity, and ownership server-side. The client may queue local operations offline, but queued operations are not proof of access and must be replayed only after fresh auth and entitlement checks. The system must merge safe disjoint changes, preserve local data on every auth/sync failure, expose conflicts instead of silently overwriting unsafe records, propagate deletes through tombstones, and never sync Temu cookies, credentials, session data, payment payloads, raw clipboard content, or copied binary images in the first slice.

Easy-to-miss edge case: an empty cloud snapshot after signing into an existing account is not proof that anonymous local data belongs to that account; the user must explicitly confirm first promotion unless local metadata already remembers that same account.

## Success Behavior

- Given the user stays local-only, when they create lists and save product snapshots, then all existing local behavior continues without sign-in or entitlement.
- Given the user signs in or creates an account, when post-auth feedback is shown, then the UI may report identity/preparation states but must not claim cloud data was applied or synced before entitlement and durable remote sync succeed.
- Given a signed-in user has active `temu_shopping_lists` entitlement for `cloud_sync`, when they enable sync for the first time after account creation and the cloud is empty, then local data is promoted after an explicit confirmation and marked synced only after durable remote writes succeed.
- Given a signed-in user has active entitlement on a clean install, when cloud data exists, then the app hydrates local stores without asking the user to manually import a backup.
- Given local and cloud have the same record key and checksum, when sync runs, then the record is marked synced without rewriting both sides.
- Given local and cloud contain disjoint list, item, or snapshot keys, when sync runs, then both sides are merged.
- Given the same key has different payloads and reliable metadata is insufficient to resolve it safely, when sync runs, then the app records a conflict and keeps both versions recoverable.
- Given a user deletes a list, item, or snapshot while sync is enabled, when the operation reaches cloud, then a tombstone prevents the deleted record from reappearing from another device.
- Given the user goes offline, when they edit lists or snapshots, then operations enter a durable local pending queue and replay later with idempotency.
- Given entitlement is revoked, expired, refunded, or unavailable, when the user opens the app, then local data remains readable and cloud actions are blocked with a recoverable premium access state.
- Given a product has `imageUrl` or `galleryImageUrls`, when URL sync runs, then those URL strings may sync as product metadata, but the app does not fetch, copy, mirror, or store binary images in cloud storage.

## Error Behavior

- Missing auth identity: deny cloud reads/writes and show sign-in required; keep local data unchanged.
- Missing or inactive entitlement: deny cloud reads/writes and show premium sync unavailable; keep local data unchanged.
- Backend unavailable: keep local-only/pending state, do not claim synced, and retry only through bounded backoff or explicit user action.
- Local metadata remembers a different account: block automatic promotion and show account mismatch/import-export guidance.
- Existing-account sign-in with local data and empty cloud: ask explicit confirmation before seeding cloud.
- Remote payload fails validation: reject or quarantine the affected record, preserve local data, and log only redacted record ids/checksums.
- Same key/different payload without safe resolution metadata: create a conflict state, never silently drop either version.
- Local tombstone conflicts with cloud record: apply tombstone policy or conflict policy; never treat missing records as delete proof.
- Queue payload is corrupt or too large: block replay of that operation, keep user data readable, and expose repair/export guidance.
- Cross-environment data appears: reject or quarantine; local, preview, staging, and production sync data must not mix.
- Clock skew or missing device metadata: avoid latest-wins and create a conflict or pending review state.

## Problem

Temu Shopping Lists already persists user lists and product snapshots locally through Pinia, and it has Convex schema scaffolding. That scaffolding currently uses `userId` fields and is explicitly not an authorization model. Turning it into cloud sync without a strict contract would risk data loss, cross-account replay, spoofed client ids, false "synced" UI, and premium access bypass.

The product also has a core archive promise: saved Temu product information must remain available even when Temu removes or sells out a product. Sync must preserve that user value while respecting local-first behavior and entitlement boundaries.

## Solution

Implement premium multi-device sync as a local-first, server-authorized sync system. Use the existing suite-owned entitlement model for access, and use Convex as the product data backend only after adding server functions that validate auth through `ctx.auth.getUserIdentity()`, map identity to a suite/global user id, check the suite ledger for `product_id=temu_shopping_lists`, validate payloads, and enforce record ownership. Add a deterministic sync domain model with local metadata, cloud records, tombstones, idempotent operation replay, and visible sync/conflict states.

First slice: sync lists, list items, product snapshots, canonical/original Temu URLs, current text fields, availability, price snapshot if already present, and image URL strings. Do not copy image files to cloud storage yet.

## Scope In

- Premium cloud sync for `product_id=temu_shopping_lists` and protected feature `cloud_sync`.
- SocialGlowz-style Convex Auth identity setup, account forms, and post-auth sync preparation feedback.
- Multi-device sync for:
  - shopping lists;
  - shopping list items;
  - product snapshots;
  - canonical Temu URLs and original Temu URLs;
  - product id parsed from Temu URL when available;
  - current title, notes, quantity, selected options, availability, metadata status, captured/updated timestamps;
  - `imageUrl` and `galleryImageUrls` as URL strings only.
- Local-to-cloud promotion after sign-in and entitlement confirmation.
- Cloud-to-local hydration on clean install, reinstall, or new device after auth and entitlement checks.
- Stable sync metadata: record id, domain, checksum, local updated timestamp, cloud updated timestamp, device/source id, account association, sync status, last error, and conflict marker.
- Typed offline operation queue with idempotency keys, retry count, last error, payload checksum, account marker, and operation type.
- Tombstone support for delete-capable domains.
- Backend Convex schema and functions for authorized queries/mutations.
- Suite entitlement bridge contract for checking active `cloud_sync` access.
- Sync UI states for local-only, premium blocked, pending, syncing, synced, retrying, conflict, account mismatch, and error.
- Post-auth feedback states for identity connection, local preparation, entitlement-blocked cloud sync, and ready/local continuation.
- Documentation and test checklist for backup/sync/reinstall claims.

## Scope Out

- Billing provider implementation, checkout UI, app-store billing, activation codes, manual support grants, or the durable entitlement bridge implementation owned by the entitlement chantier.
- Creating a product-local durable entitlement ledger.
- Binary image storage, image mirroring, image downloads, CDN storage, or Convex file storage upload in the first slice.
- Price and availability history timelines beyond the current snapshot fields.
- Temu account login, Temu cookies, Temu session sync, WebView browser profile sync, cart scraping, or automated cart import.
- Shared/collaborative lists between different users.
- Team/seat billing, organization accounts, or admin panels.
- Public pricing/marketing copy beyond accurate in-app/README sync wording.
- Claiming reinstall recovery until remote write and hydration proof has passed.

## Constraints

- Local data must never be silently wiped by sign-in, sign-out, failed sync, failed entitlement check, empty cloud, or account mismatch.
- Authentication proves identity only; active suite entitlement grants product sync access.
- The SocialGlowz auth port must remain identity-only; it may store session tokens and remembered account email, but it must not write product entitlement truth.
- Client-supplied `userId`, `globalUserId`, `productId`, plan, entitlement, role, quota, or account email must not authorize cloud access.
- Backend functions must validate auth, product namespace, ownership, entitlement, operation shape, and payload size on every cloud read/write.
- Public Convex functions must use validators and access control; sensitive helper mutations/queries should be internal where possible.
- Local sync UI is feedback only; it is never the security boundary.
- Queue replay must re-check auth, entitlement, account association, and domain policy before writing remote data.
- Latest-wins is allowed only for domains where timestamps, device id, operation id, checksum, and stale-clock behavior are tested and accepted.
- Deletes must use tombstones or an explicit server-authoritative delete model; missing records are not delete proof.
- Secrets, tokens, credentials, cookies, private logs, raw clipboard contents, and payment data are excluded from sync.
- Sync data must be environment-scoped so local/preview/staging/production data never mixes.
- Logging and diagnostics must redact user payloads and include only safe operation ids, record counts, checksums, domains, and error classes.

## Test Contract

Surface: Vue 3 + Pinia persisted local stores, Tauri Android app shell, Convex backend functions/schema, suite entitlement bridge, and local/cloud sync controller logic.

Proof profile:

- `scenario-first` for sync contract, account association matrix, UX states, and checklist.
- `test-first` for merge, conflict, checksum, tombstone, queue, account association, and payload validation logic.
- `integration-first` for Convex functions and entitlement bridge behavior once backend is implemented.
- `evidence-first` for UI sync states and Android/native storage lifecycle.
- `exception-with-proof` only for provider/suite-ledger behavior that cannot be tested locally; use mocked bridge tests plus documented follow-up provider evidence.

Checklist path: `shipflow_data/workflow/test-checklists/temu-shopping-lists-premium-cloud-sync.md`.

Required scenario IDs:

- `TC-SYNC-AUTO-001`: Local-only data remains readable without auth or entitlement.
- `TC-SYNC-AUTO-002`: Enabling sync without identity is denied and local data is preserved.
- `TC-SYNC-AUTO-003`: Enabling sync with identity but no active entitlement is denied and local data is preserved.
- `TC-SYNC-AUTO-003A`: Signing in or creating an account without active entitlement shows identity/preparation feedback but leaves `syncEnabled=false`.
- `TC-SYNC-AUTO-004`: Client-supplied user/account/entitlement fields cannot grant cloud access.
- `TC-SYNC-AUTO-005`: First promotion after new-account signup writes all local domains remotely and marks synced only after durable success.
- `TC-SYNC-AUTO-006`: Existing-account sign-in with local data and empty cloud requires explicit import/seed confirmation.
- `TC-SYNC-AUTO-007`: Clean install with existing cloud data hydrates local stores after auth and entitlement checks.
- `TC-SYNC-AUTO-008`: Same key/same checksum is idempotent and does not duplicate records.
- `TC-SYNC-AUTO-009`: Disjoint local/cloud keys merge both ways.
- `TC-SYNC-AUTO-010`: Same key/different payload without safe metadata creates a conflict.
- `TC-SYNC-AUTO-011`: Deletes use tombstones and prevent deleted records from reappearing.
- `TC-SYNC-AUTO-012`: Offline queue replays with idempotency and re-checks entitlement.
- `TC-SYNC-AUTO-013`: Revoked/refunded/expired entitlement blocks cloud actions but keeps local data readable.
- `TC-SYNC-AUTO-014`: Invalid remote payloads are rejected without poisoning local stores.
- `TC-SYNC-AUTO-015`: Image fields sync only as URL strings; no binary image fetch/upload occurs.
- `TC-SYNC-MANUAL-001`: Android install/reopen/offline lifecycle preserves local queue and sync status.
- `TC-SYNC-MANUAL-002`: Reinstall/new-device recovery is proven before README or UI claims it.

Required results:

- Protected cloud sync fails closed unless backend identity and entitlement proof are available.
- No local data is lost during sign-in, sign-out, failed sync, conflict, or entitlement loss.
- Cloud data is scoped to the server-owned user and product id, not a client-supplied id.
- Multi-device edits converge for safe merge cases and expose conflicts for unsafe cases.
- Delete propagation is explicit and tested.
- UI copy differentiates "saved locally" from "synced to cloud".

## Dependencies

- Entitlements spec: `shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md`, version `1.0.5`, reviewed. This cloud sync spec depends on its suite-ledger and fail-closed access model.
- Android app spec: `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`, version `1.0.0`, ready.
- Technical app context: `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`, version `1.0.2`, draft.
- Local-cloud sync doctrine: `/home/claude/shipflow/skills/sf-local-cloud-sync/references/local-cloud-sync-doctrine.md`, version `1.0.0`, draft.
- Sync UX/security checklist: `/home/claude/shipflow/skills/sf-local-cloud-sync/references/ux-security-checklist.md`, version `1.0.0`, draft.
- Convex Auth: official Convex Auth docs searched and reviewed on 2026-06-11 for the current SocialGlowz-style Auth.js/Convex pattern. Fresh-docs verdict: `fresh-docs checked`; the implementation still requires project-level provider/env proof before shipping cloud sync.
- Convex Auth in Functions: `https://docs.convex.dev/auth/functions-auth`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; functions can read authenticated identity with `ctx.auth.getUserIdentity()`, and identity fields include guaranteed issuer/subject/token identifier.
- Convex server/functions API: `https://docs.convex.dev/api/modules/server`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; public queries/mutations are client-accessible, mutations are transactional, and validators are required for secure argument/return validation.
- Convex best practices: `https://docs.convex.dev/understanding/best-practices/`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; public functions need access control and must not use spoofable arguments such as email for authorization.
- Convex schemas: `https://docs.convex.dev/database/schemas`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; schemas provide table/document validation and TypeScript safety but are not authorization.
- Convex file storage: `https://docs.convex.dev/file-storage/upload-files` and `https://docs.convex.dev/file-storage/overview`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; binary file storage is a future follow-up requiring controlled upload URLs or HTTP actions, not part of this URL-only slice.

## Invariants

- Local-first import/list/snapshot behavior remains usable without account or premium entitlement.
- Active cloud sync requires suite identity and active `temu_shopping_lists` entitlement for `cloud_sync`.
- Sync must preserve user-owned archives even when Temu products disappear, sell out, or links break.
- Every cloud record belongs to exactly one server-owned user identity and one product namespace.
- Every syncable domain has a stable record key and checksum.
- Every device has a stable, non-secret device/source id for conflict metadata.
- Every delete-capable domain has tombstones or an explicit server-authoritative delete rule.
- Every queued operation has an idempotency key.
- Conflict states preserve both recoverable versions until resolved.
- Local metadata may remember prior account association but cannot grant access.
- URL strings are user data; binary image copies are not synced in the first slice.

## Links & Consequences

- `src/types/domain.ts`: may need sync metadata types, versioned payload types, and explicit cloud-safe payload boundaries.
- `src/stores/shoppingLists.ts`: list and item mutations must enqueue typed sync operations when sync is enabled.
- `src/stores/productSnapshots.ts`: snapshot writes/deletes must enqueue typed sync operations and keep URL-only media behavior clear.
- `src/lib/cloudSyncQueue.ts`: current unknown-payload local queue must become a typed durable operation queue with idempotency, account marker, retry metadata, and corruption handling.
- `src/lib/cloudSync.ts`: current placeholder must become a sync state machine, not only a boolean flag.
- `src/lib/convexAuth.ts`, `convex/auth.ts`, `convex/http.ts`: SocialGlowz-style identity plumbing exists and must stay separated from product access. Future work must not treat `isAuthenticated` as premium authorization.
- `src/lib/postAuthSyncFeedback.ts`, `src/components/PostAuthSyncFeedback.vue`: post-auth feedback exists and must report only identity/preparation until remote sync writes/hydration are proven.
- `src/lib/accessModel.ts`: existing protected feature `cloud_sync` remains the local/UI contract; backend must recompute access server-side.
- `convex/schema.ts`: current `userId` scaffold must be replaced or adapted to server-owned account/owner ids, sync metadata, tombstones, indexes, and environment scoping.
- New Convex modules likely needed: `convex/sync.ts`, `convex/syncAccess.ts`, `convex/users.ts`, and generated API references after Convex codegen.
- UI routes/components likely needed: sync settings/status surface, conflict/retry affordances, premium blocked state, and account mismatch state.
- README and technical docs must not promise backup/reinstall recovery until proof passes.
- Existing export/import backup must stay available as a local fallback.

## Documentation Coherence

Update or create:

- `README.md`: describe premium cloud sync accurately after implementation; distinguish local save, pending sync, and synced states.
- `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`: document cloud sync architecture, account boundary, sync data domains, and proof limits.
- `shipflow_data/workflow/test-checklists/temu-shopping-lists-premium-cloud-sync.md`: add the required TC-SYNC scenarios.
- `shipflow_data/technical/support/entitlements-runbook.md`: add support triage for premium sync blocked states, account mismatch, and entitlement loss once sync ships.
- In-app copy: avoid claiming "backed up", "restored", or "synced" before durable remote write/hydration evidence exists.
- Changelog/release notes after implementation.

No public pricing, checkout, app-store billing, or marketing copy should be updated until provider/billing work has its own spec.

## Edge Cases

- User creates local data anonymously, then signs up and cloud is empty.
- User creates local data anonymously, then signs into an existing account whose cloud is empty.
- User signs into an account different from the account remembered in local sync metadata.
- User has active entitlement on device A and expired entitlement on device B after stale cache.
- User edits the same list name on two devices while one is offline.
- User deletes a list on one device while another device adds an item to it offline.
- Product snapshot has the same `productId` but different canonical URL after Temu redirect changes.
- Product snapshot has the same canonical URL but changed title/notes/options.
- Gallery image URL list is large, malformed, duplicated, or private/loopback.
- Remote payload contains fields from a newer app version.
- Local clock is wrong or changes while offline.
- Queue replay is retried after partial remote success.
- Cloud mutation succeeds but client crashes before local ack.
- Cloud is empty after backend data loss or wrong environment, not true first-time setup.
- Entitlement is revoked while queue has pending writes.
- User reinstalls and expects recovery before proof exists.

## Implementation Tasks

- [ ] Task 1: Define sync domain and metadata types.
  - Files: `src/types/domain.ts`, new `src/types/sync.ts`.
  - Action: Add versioned cloud-safe payloads for lists, items, snapshots, tombstones, sync metadata, checksums, device id, account association, conflict state, operation type, and sync status.
  - Validate with: typecheck and unit tests for payload validation helpers.

- [ ] Task 2: Build deterministic merge/conflict/tombstone logic.
  - Files: new `src/lib/syncMerge.ts`, new `src/lib/syncMerge.test.ts`.
  - Action: Implement checksum comparison, disjoint merge, same-key conflict, tombstone handling, stale-clock behavior, and idempotent operation merge.
  - Validate with: test-first scenarios `TC-SYNC-AUTO-008` through `TC-SYNC-AUTO-011`.

- [ ] Task 3: Replace unknown local queue with typed durable operations.
  - Files: `src/lib/cloudSyncQueue.ts`, new `src/lib/cloudSyncQueue.test.ts`.
  - Action: Store operation id, domain, record key, type, payload checksum, account marker, created/updated timestamps, retry count, last error, and idempotency key; handle corrupt queue entries safely.
  - Validate with: queue corruption, offline replay, duplicate retry, and account-mismatch tests.

- [ ] Task 4: Add sync state machine and UI-facing status model.
  - Files: `src/lib/cloudSync.ts`, new `src/stores/cloudSync.ts`, route/component files as needed.
  - Action: Track local-only, premium blocked, pending, syncing, synced, retrying, conflict, account mismatch, and error states; ensure "saved locally" and "synced" are distinct.
  - Validate with: unit/component tests for state transitions and copy.

- [ ] Task 5: Adapt local stores to enqueue sync operations without weakening local-first behavior.
  - Files: `src/stores/shoppingLists.ts`, `src/stores/productSnapshots.ts`, related tests.
  - Action: Enqueue typed operations on create/update/delete when sync is enabled; preserve existing local behavior when sync is disabled or blocked.
  - Validate with: store tests covering local-only, pending sync, and entitlement-blocked modes.

- [ ] Task 6: Redesign Convex schema for server-owned sync.
  - File: `convex/schema.ts`.
  - Action: Add owner/global user id mapping, product namespace, environment, record keys, checksums, sync metadata, tombstones, indexes by owner/product/domain/key, and operation/audit fields; remove authorization reliance on client-supplied `userId`.
  - Validate with: Convex type generation, typecheck, metadata review, and static search for unsafe userId authorization.

- [ ] Task 7: Implement Convex access and identity bridge contract.
  - Files: new `convex/syncAccess.ts`, `convex/users.ts`, possible suite bridge module.
  - Action: Use `ctx.auth.getUserIdentity()` to identify the caller, map to server-owned suite/global user id, query or verify active suite entitlement for `cloud_sync`, and fail closed on missing identity/access.
  - Validate with: mocked Convex function tests or integration harness for missing auth, missing entitlement, inactive entitlement, and active entitlement.

- [ ] Task 7A: Replace post-auth preparation placeholder with real entitlement-aware sync handoff.
  - Files: `src/lib/cloudSync.ts`, `src/lib/postAuthSyncFeedback.ts`, `src/components/PostAuthSyncFeedback.vue`, `src/pages/SyncPage.vue`, `src/ui/temu-shell/components/MobileSettingsSheet.vue`.
  - Action: After sign-in, re-check suite entitlement, derive server-owned account association, then either start hydration/promotion or show premium-blocked/account-mismatch state. The pop-up must show `waiting`, `received`, `applied`, `pending`, `blocked`, or `error` based on real sync outcomes, not just auth success.
  - Validate with: tests proving identity-only denial, entitlement-blocked feedback, active-entitlement handoff, backend unavailable fallback, and no local wipe.

- [ ] Task 8: Implement authorized cloud sync functions.
  - Files: new `convex/sync.ts` and generated API updates.
  - Action: Add validated queries/mutations for sync state, hydration, promotion, pushing operations, conflict/tombstone resolution, and acknowledgements. Every public function must validate args/returns and call the access bridge.
  - Validate with: integration tests or Convex local tests for auth checks, ownership filtering, idempotency, and invalid payload rejection.

- [ ] Task 9: Connect client sync service to backend functions.
  - Files: `src/lib/cloudSync.ts`, `src/lib/cloudSyncQueue.ts`, new backend API adapter files.
  - Action: Flush queued operations only after auth/entitlement/account association checks; apply server responses through merge logic; never mark synced before durable success.
  - Validate with: adapter tests for success, backend unavailable, entitlement expired, partial success, and crash-before-ack behavior.

- [ ] Task 10: Add user-facing sync settings and conflict/retry UX.
  - Files: route/component files under `src/pages/`, `src/router/index.ts`, `src/App.vue`, `src/styles.css` as needed.
  - Action: Provide enable/disable sync, premium blocked state, confirmation for first promotion, hydration status, retry/recheck, conflict list, and account mismatch messaging.
  - Validate with: component tests where practical and browser smoke via `sf-browser` once runnable.

- [ ] Task 11: Write sync checklist and docs.
  - Files: `shipflow_data/workflow/test-checklists/temu-shopping-lists-premium-cloud-sync.md`, `README.md`, `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`.
  - Action: Document proof scenarios, sync limits, URL-only media scope, local-first behavior, entitlement requirement, and no-reinstall-recovery claim before proof.
  - Validate with: ShipFlow metadata lint and checklist parser.

- [ ] Task 12: Add CI/check coverage for sync slice.
  - Files: package scripts or workflow files as needed.
  - Action: Ensure unit tests, typecheck, lint, Convex codegen/type validation, and path-proportional CI cover sync code without forcing APK builds for docs-only changes.
  - Validate with: `pnpm test:once`, `pnpm typecheck`, `pnpm lint:check`, and the selected Convex validation command.

## Acceptance Criteria

- [ ] AC1: Local-only lists and snapshots continue to work without account, premium entitlement, or network.
- [ ] AC2: Cloud sync cannot be enabled or used unless backend identity and active `temu_shopping_lists` entitlement for `cloud_sync` are verified.
- [ ] AC2A: SocialGlowz-style account sign-in/create flow never grants product sync access by itself and never stores durable entitlement truth locally.
- [ ] AC3: No cloud function authorizes by client-supplied `userId`, email, product id, entitlement, or local cache.
- [ ] AC4: First promotion requires explicit user confirmation except when local metadata already remembers the same account.
- [ ] AC5: Clean install/new-device hydration restores cloud data after auth and entitlement checks.
- [ ] AC6: Same key/same checksum operations are idempotent.
- [ ] AC7: Disjoint local/cloud records merge without data loss.
- [ ] AC8: Same key/different payload conflicts preserve both recoverable versions unless tested metadata allows a deterministic winner.
- [ ] AC9: Deletes propagate through tombstones or a documented server-authoritative delete model.
- [ ] AC10: Offline edits queue durably and replay with idempotency after fresh access checks.
- [ ] AC11: Entitlement loss blocks cloud reads/writes while local data remains readable.
- [ ] AC12: Sync UI states never confuse local save with cloud sync.
- [ ] AC13: URL strings for current product/media metadata may sync, but binary images are not fetched/uploaded/stored by this slice.
- [ ] AC14: Logs and diagnostics redact payloads, secrets, tokens, cookies, credentials, raw clipboard text, and private snapshots.
- [ ] AC15: README and in-app copy do not claim backup/reinstall recovery until write and hydration proof is complete.
- [ ] AC16: Provider/billing/activation-code/image-storage/price-history work remains blocked behind future specs.

## Test Strategy

1. Static and local checks:
   - `pnpm typecheck`
   - `pnpm test:once`
   - `pnpm lint:check`
   - `git diff --check`
2. Sync domain tests:
   - merge matrix;
   - checksum/idempotency;
   - conflict creation;
   - tombstone propagation;
   - corrupt queue repair;
   - account association matrix;
   - entitlement-blocked replay.
3. Backend contract tests:
   - missing auth denies;
   - missing/inactive entitlement denies;
   - active entitlement allows only owned records;
   - spoofed `userId`/email/product id is ignored;
   - invalid payload rejected;
   - duplicate idempotency key does not duplicate writes.
4. UI/browser proof:
   - sync settings states;
   - first-promotion confirmation;
   - premium blocked state;
   - pending/retrying/error/conflict states;
   - local data remains visible after denied sync.
5. Android/manual proof:
   - install, create local data, close/reopen;
   - offline edit queue persists;
   - reconnect/retry behavior;
   - reinstall/new-device hydration only after remote write proof exists.
6. Documentation proof:
   - metadata lint for new/updated ShipFlow docs;
   - checklist parser for sync scenarios;
   - README wording reviewed for no unsupported backup/recovery claims.

## Risks

- Data loss risk: unsafe promotion, hydration, merge, or delete could erase local archives.
  - Mitigation: no silent local wipe, deterministic tests, tombstones, conflict preservation, export fallback.
- Cross-account replay risk: anonymous local data could be pushed into the wrong account.
  - Mitigation: account association matrix and explicit confirmation for existing-account/empty-cloud cases.
- Authorization bypass risk: client-supplied ids or cached entitlement could grant sync.
  - Mitigation: server-side auth and entitlement checks for every function.
- Conflict complexity risk: multi-device changes may not converge safely.
  - Mitigation: conflict state instead of unsafe latest-wins, tested metadata requirements.
- Cost/quota risk: sync payloads, retries, or future media storage can grow.
  - Mitigation: URL-only first slice, payload size limits, retry backoff, future image storage spec.
- Promise risk: UI/docs may imply backup or reinstall recovery before proof.
  - Mitigation: documentation gate and acceptance criteria requiring proof before claims.
- Provider bridge risk: suite entitlement lookup may not be locally available.
  - Mitigation: define bridge interface, mock locally, require integration proof before ship.

## Execution Notes

- "Backend suite WinFlowz" means the suite-owned identity/entitlement source of truth. It does not mean Temu Shopping Lists must store all product sync records inside WinFlowz. The product data backend can be Convex, but protected access must be decided through the suite ledger or a verified bridge to it.
- Existing `convex/schema.ts` is not safe for production sync because its `userId` fields are client-shape scaffolding. Implementation must make the server derive ownership.
- Current local snapshot model already includes `imageUrl` and `galleryImageUrls`; this first sync slice may sync those URL strings as metadata. It must not fetch or persist image bytes.
- Current snapshot model includes one optional `price` object; historical price/availability timelines are deferred and should not block the first sync slice.
- Fresh-docs checked on 2026-06-10 for Convex auth, functions, schemas, and file storage. Re-run the documentation freshness gate before implementing provider bridge details, Convex API changes, file storage, or auth provider integration.
- Fresh-docs rechecked on 2026-06-11 for Convex Auth direction after the SocialGlowz copy/adapt decision. Re-run the documentation freshness gate before changing provider config, auth callback semantics, suite bridge API, or deployment auth settings.

## Open Questions

None blocking for the first premium URL-sync slice.

Deferred decisions:

- Which billing/provider path will activate premium access.
- Whether binary image storage will use Convex File Storage, another storage provider, or stay URL-only.
- How much price/availability history to keep and how to present comparisons.
- Exact quota limits for synced lists, snapshots, URL strings, and offline operations.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-10 11:35:09 UTC | sf-spec | GPT-5 Codex | Created premium multi-device cloud sync spec from user decisions, local-cloud sync doctrine, entitlement guardrails, local code scan, and current Convex docs | Draft spec created for URL-backed premium sync; image binary storage, price history, billing/provider work, and Temu session sync remain deferred | /sf-ready Premium multi-device cloud sync for Temu Shopping Lists |
| 2026-06-10 11:42:50 UTC | sf-ready | GPT-5 Codex | Reviewed readiness for user story fit, security, data-loss risk, entitlement boundaries, external docs freshness, tasks, and proof contract | Ready for implementation of the premium URL-sync slice; provider billing, binary image storage, and price-history work remain deferred behind future specs | /sf-start Premium multi-device cloud sync for Temu Shopping Lists |
| 2026-06-10 11:49:57 UTC | sf-start | GPT-5 Codex + gpt-5.3-codex-spark worker | Implemented the local sync-core slice: sync domain types, deterministic checksums, conservative merge/conflict/tombstone behavior, typed offline queue, and access-aware replay filtering | Partial: local sync-core scenarios pass; Convex backend functions, suite entitlement bridge integration, store enqueue integration, sync UI, hydration/promotion, and device proof remain | /sf-start Continue premium cloud sync backend, store, and UI slices |
| 2026-06-10 17:07:20 UTC | continue | GPT-5 Codex | Continued implementation by connecting Pinia list/item/snapshot mutations to the typed queue behind an active sync session gate | Partial: local-only behavior, store enqueue integration, local entitlement loss blocking, merge, tombstones, and queue scenarios pass; backend, UI, hydration/promotion, and device proof remain | /sf-start Continue premium cloud sync backend and UI slices |
| 2026-06-10 17:12:21 UTC | continue | GPT-5 Codex | Bootstrapped Convex dependency, backend typecheck, sync schema, and fail-closed public sync functions | Partial: backend scaffolding typechecks and fails closed; generated Convex API, deployment proof, suite entitlement bridge, real writes, hydration/promotion, UI, and device proof remain | /sf-start Continue premium cloud sync entitlement bridge, generated Convex API, and UI slices |
| 2026-06-10 17:24:07 UTC | continue | GPT-5 Codex | Added a local sync status page and direct fail-closed Convex access tests | Partial: `/sync` renders local-only/pending state without cloud-active claims and Convex guard tests pass; generated Convex API, deployment proof, suite entitlement bridge, real writes, hydration/promotion, and device proof remain | /sf-start Continue premium cloud sync entitlement bridge, generated Convex API, and UI slices |
| 2026-06-10 17:29:49 UTC | continue | GPT-5 Codex | Created the Convex cloud project, generated `convex/_generated`, and ran deployed fail-closed proof | Partial: Convex project and dev deployment exist, codegen works, deployed unauthenticated status query returns `missing_identity`; suite entitlement bridge, authenticated client wiring, real writes, hydration/promotion, and device proof remain | /sf-start Continue premium cloud sync entitlement bridge and authenticated client wiring |
| 2026-06-11 10:46:49 UTC | 100-sf-spec | GPT-5 Codex | Updated the premium cloud sync chantier after SocialGlowz auth/onboarding was copied into Temu and after `600`/`601` verification requests | Spec refreshed: SocialGlowz-style identity setup and post-auth feedback are now explicit, identity-only sync denial remains required, and the next implementation slice is entitlement-aware sync handoff | /101-sf-ready Refresh premium cloud sync spec after SocialGlowz auth/onboarding adaptation |

## Current Chantier Flow

- sf-spec: drafted, then refreshed 2026-06-11 for SocialGlowz auth/onboarding and local-cloud sync contract
- sf-ready: ready before 2026-06-11 refresh; needs refresh review
- sf-start: partial local sync-core, store enqueue integration, Convex deployment/codegen, fail-closed Convex scaffold, local sync status UI, SocialGlowz-style Convex Auth identity plumbing, and post-auth preparation feedback implemented
- sf-verify: not launched
- sf-end: not launched
- sf-ship: not launched

Next command: `/101-sf-ready Refresh premium cloud sync spec after SocialGlowz auth/onboarding adaptation`
