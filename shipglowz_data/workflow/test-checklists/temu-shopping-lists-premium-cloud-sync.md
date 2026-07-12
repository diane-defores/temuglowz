---
artifact: test_checklist
metadata_schema_version: "1.0"
artifact_version: "0.1.5"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-start
scope: "temu-shopping-lists-premium-cloud-sync"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md
  - app/convex/_generated/api.d.ts
  - app/src/types/sync.ts
  - app/src/lib/syncMerge.ts
  - app/src/lib/cloudSyncQueue.ts
  - app/src/stores/shoppingLists.ts
  - app/src/stores/productSnapshots.ts
  - app/convex/schema.ts
  - app/convex/sync.ts
  - app/convex/syncAccess.ts
  - app/src/app-pages/SyncPage.vue
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md"
    artifact_version: "1.0.5"
    required_status: "active"
supersedes: []
evidence:
  - "Spec requires proof before premium multi-device sync can claim backup, hydration, merge, conflict, or entitlement-safe cloud behavior."
next_review: "2026-07-10"
next_step: "/sf-start Continue premium cloud sync backend and UI slices"
---

# Temu Shopping Lists Premium Cloud Sync - Test Checklist

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-SYNC-AUTO-001 | Local stores | Local-only data remains readable without auth or entitlement | yes | Lists and snapshots work locally with sync disabled | PASS | Store mutations keep local-only data out of the cloud queue when sync is disabled | `app/src/stores/cloudSyncStoreIntegration.test.ts` | Backend not required for local-only proof |  |
| TC-SYNC-AUTO-002 | Access gate | Enabling sync without identity is denied and local data is preserved | yes | Missing identity returns blocked state; no data wipe | PASS | Local replay gate denies missing identity and does not mutate local stores | `app/src/lib/cloudSync.test.ts` | Backend proof still pending before real cloud writes |  |
| TC-SYNC-AUTO-003 | Access gate | Enabling sync with identity but no active entitlement is denied and local data is preserved | yes | Missing/inactive entitlement blocks cloud actions | PASS | Local replay gate denies missing entitlement and does not mutate local stores | `app/src/lib/cloudSync.test.ts` | Backend proof still pending before real cloud writes |  |
| TC-SYNC-AUTO-004 | Backend access | Client-supplied user/account/entitlement fields cannot grant cloud access | yes | Backend recomputes identity and entitlement | PASS | Convex public functions ignore client entitlement and call fail-closed server access guard before returning or writing; deployed function call without auth returns `missing_identity` | `app/convex/sync.ts`; `app/convex/syncAccess.ts`; `app/convex/syncAccess.test.ts`; `pnpm typecheck:convex`; `pnpm exec convex run sync:getCloudSyncStatus '{"environment":"local"}'` | Suite entitlement bridge still required before real cloud writes |  |
| TC-SYNC-AUTO-005 | Promotion | First promotion after new-account signup writes all local domains remotely and marks synced only after durable success | yes | Promotion is explicit and durable before synced UI | NOT_RUN | Backend/UI slice pending | Integration proof |  |  |
| TC-SYNC-AUTO-006 | Promotion | Existing-account sign-in with local data and empty cloud requires explicit import/seed confirmation | yes | No automatic cross-account replay | NOT_RUN | Backend/UI slice pending | UI/integration proof |  |  |
| TC-SYNC-AUTO-007 | Hydration | Clean install with existing cloud data hydrates local stores after auth and entitlement checks | yes | Reinstall/new device recovers after proof | NOT_RUN | Backend/UI slice pending | Manual/device proof |  |  |
| TC-SYNC-AUTO-008 | Merge core | Same key/same checksum is idempotent and does not duplicate records | yes | Merge returns synced/noop without duplicate writes | PASS | Merge returns noop for same key/checksum | `app/src/lib/syncMerge.test.ts` |  |  |
| TC-SYNC-AUTO-009 | Merge core | Disjoint local/cloud keys merge both ways | yes | Merge includes both local and cloud records | PASS | Merge plans local and remote updates for disjoint keys | `app/src/lib/syncMerge.test.ts` |  |  |
| TC-SYNC-AUTO-010 | Merge core | Same key/different payload without safe metadata creates a conflict | yes | Conflict preserves both versions | PASS | Merge records checksum conflict with local and remote versions | `app/src/lib/syncMerge.test.ts` |  |  |
| TC-SYNC-AUTO-011 | Tombstones | Deletes use tombstones and prevent deleted records from reappearing | yes | Tombstone wins over older live record | PASS | Local and remote tombstone tests prevent resurrection | `app/src/lib/syncMerge.test.ts` |  |  |
| TC-SYNC-AUTO-012 | Offline queue | Offline queue replays with idempotency and re-checks entitlement | yes | Queue stores typed operations and requires access check before replay | PASS | Typed queue dedupes idempotency keys, tracks retry metadata, filters by account, store mutations enqueue only after active session, and local replay gate re-checks identity/entitlement/account marker | `app/src/lib/cloudSyncQueue.test.ts`; `app/src/lib/cloudSync.test.ts`; `app/src/stores/cloudSyncStoreIntegration.test.ts` | Backend recheck remains future |  |
| TC-SYNC-AUTO-013 | Entitlement loss | Revoked/refunded/expired entitlement blocks cloud actions but keeps local data readable | yes | Cloud actions denied; local stores readable | PASS | Local replay gate denies expired entitlement and never replays queued jobs | `app/src/lib/cloudSync.test.ts` | Backend proof still pending before real cloud writes |  |
| TC-SYNC-AUTO-014 | Payload validation | Invalid remote payloads are rejected without poisoning local stores | yes | Invalid payload is rejected/quarantined | NOT_RUN | Backend/adapter slice pending | Backend tests |  |  |
| TC-SYNC-AUTO-015 | Media scope | Image fields sync only as URL strings; no binary image fetch/upload occurs | yes | No binary image storage path used | PASS | No Convex storage/upload path or image fetch was added; sync payload remains metadata-only scaffold | Static scan; `app/convex/sync.ts`; `pnpm typecheck:convex` | Binary image storage remains future spec |  |
| TC-SYNC-MANUAL-001 | Android lifecycle | Android install/reopen/offline lifecycle preserves local queue and sync status | yes | Pending queue survives app reopen | NOT_RUN | Device proof pending | Manual Android QA |  |  |
| TC-SYNC-MANUAL-002 | Recovery claim | Reinstall/new-device recovery is proven before README or UI claims it | yes | Remote write + hydration proof recorded | NOT_RUN | Device/backend proof pending | Manual Android QA |  |  |

## Notes

- Local sync-core scenarios pass for local-only store behavior, merge, tombstones, queue typing, idempotency, store-to-queue integration, and local access-aware replay filtering.
- Convex backend scaffolding typechecks, generated API files exist, and deployed function proof fails closed until app auth and the suite entitlement bridge are implemented.
- `/sync` renders a local-only status surface and avoids claiming real cloud sync while backend proof is pending.
- Real cloud writes, hydration, and reinstall recovery must remain unclaimed until backend deployment and device proof pass.
- Binary image storage, price history, billing, provider events, and activation codes are out of scope for this checklist.
