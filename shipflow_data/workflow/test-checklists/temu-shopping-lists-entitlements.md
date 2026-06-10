---
artifact: test_checklist
metadata_schema_version: "1.0"
artifact_version: "1.0.2"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-start
scope: "temu-shopping-lists-entitlements"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md
  - src/lib/accessModel.ts
  - src/lib/cloudSync.ts
  - src/lib/cloudSyncQueue.ts
  - convex/schema.ts
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md"
    artifact_version: "1.0.5"
    required_status: "reviewed"
supersedes: []
evidence:
  - "Spec requires entitlement scenarios before protected sync, premium, billing, activation codes, or support grants."
next_review: "2026-07-10"
next_step: "closed for current guardrail scope"
---

# Temu Shopping Lists Entitlements - Test Checklist

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-ENT-AUTO-001 | Static search | Confirm no product-local entitlement ledger or provider billing integration exists | yes | No durable local ledger/provider implementation is present | PASS | Search found docs, tests, access contract terms, and provider allowlist strings only; no provider runtime or durable local ledger | static-search-local-2026-06-10 | Re-run before any entitlement ship |  |
| TC-ENT-AUTO-002 | Access model | Product id, plan ids, source ids, and status mapping are allowlisted | yes | Unknown ids are rejected; active/trialing grant access only | PASS | Covered by unit tests | `src/lib/accessModel.test.ts` |  |  |
| TC-ENT-AUTO-003 | Protected sync | Unauthenticated protected sync is rejected | yes | Missing identity returns deny/fail-closed result | PASS | Covered by unit tests | `evaluateProtectedAccess` in `src/lib/accessModel.test.ts` | Server bridge proof still future |  |
| TC-ENT-AUTO-004 | Protected sync | Authenticated user without entitlement is rejected | yes | Missing entitlement returns deny/fail-closed result | PASS | Covered by unit tests | `evaluateProtectedAccess` in `src/lib/accessModel.test.ts` | Server bridge proof still future |  |
| TC-ENT-AUTO-005 | Protected sync | Client-supplied ids or entitlement-like payloads cannot grant access | yes | Unknown product/source/status normalizes to null or denies access | PASS | Covered by unit tests | `normalizeEntitlementSnapshot` in `src/lib/accessModel.test.ts` | Backend must still recompute server-side |  |
| TC-ENT-AUTO-006 | Provider events | Provider/manual events are idempotent | no | Duplicate `sourceEventId` does not duplicate access | NOT_RUN | Provider integration out of scope | Future provider spec | Required before provider work; requires selected provider docs |  |
| TC-ENT-AUTO-007 | Revocation | Revoked/refunded/expired entitlements deny protected access | yes | Non-granting statuses deny access | PASS | Covered by unit tests | `grantsAccess` in `src/lib/accessModel.test.ts` |  |  |
| TC-ENT-AUTO-008 | Activation codes | Activation code redemption never logs or persists raw codes client-side | no | Raw codes are not stored in browser/mobile persistent storage or logs | NOT_RUN | Activation codes out of scope | Support runbook skeleton | Required before activation-code implementation |  |
| TC-ENT-MANUAL-001 | Operator decision | Confirm suite-ledger decision | yes | Product uses suite ledger under `product_id=temu_shopping_lists` | PASS | Decision documented | `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` |  |  |
| TC-ENT-MANUAL-002 | Support | Runbook can check/grant/revoke/expire/refund/reissue without secrets | no | Support flow is documented and redacted | NOT_RUN | Skeleton exists; real suite tooling not wired | `shipflow_data/technical/support/entitlements-runbook.md` | Required before grants/codes/users |  |

## Notes

- Local-only import/list/snapshot features do not require entitlement checks.
- Provider-specific checks are intentionally `NOT_RUN` until a provider is selected.
- A server bridge must re-check identity and suite-ledger entitlement before any protected cloud sync or premium operation.
