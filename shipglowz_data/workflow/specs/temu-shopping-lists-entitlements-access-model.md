---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.5"
project: "temu"
created: "2026-06-10"
created_at: "2026-06-10 09:19:07 UTC"
updated: "2026-06-10"
updated_at: "2026-06-10 10:46:58 UTC"
status: reviewed
source_skill: sf-spec
source_model: "GPT-5 Codex"
scope: "Entitlements and access model for Temu Shopping Lists"
owner: "Diane"
confidence: medium
user_story: "En tant qu'operatrice du produit, je veux que Temu Shopping Lists se conforme a la doctrine product-entitlements avant d'activer sync cloud, premium, quotas, billing ou activation codes, afin que l'identite, les evenements provider et l'acces produit restent separes et verifiables."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "shipglowz_data/workflow/TASKS.md"
  - "shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md"
  - "shipglowz_data/technical/apps/temu-shopping-lists-android-app.md"
  - "app/convex/schema.ts"
  - "app/src/lib/cloudSync.ts"
  - "app/src/lib/cloudSyncQueue.ts"
  - "app/src/lib/accessModel.ts"
  - "shipglowz_data/workflow/test-checklists/temu-shopping-lists-entitlements.md"
  - "shipglowz_data/technical/support/entitlements-runbook.md"
  - "README.md"
  - "skills/references/product-entitlements-playbook.md"
  - "/home/claude/winflowz/shipglowz_data/workflow/docs/technical/suite-authentication.md"
  - "/home/claude/winflowz/shipglowz_data/workflow/specs/unified-suite-authentication.md"
depends_on:
  - artifact: "/home/claude/shipglowz/skills/references/product-entitlements-playbook.md"
    artifact_version: "1.0.1"
    required_status: active
  - artifact: "/home/claude/shipglowz/skills/references/decision-quality-contract.md"
    artifact_version: "1.0.0"
    required_status: active
  - artifact: "/home/claude/shipglowz/skills/references/documentation-freshness-gate.md"
    artifact_version: "1.2.0"
    required_status: active
  - artifact: "Convex Auth docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
  - artifact: "Convex schema docs"
    artifact_version: "accessed 2026-06-10"
    required_status: reviewed
supersedes: []
evidence:
  - "TASK-2026-06-10-012 asks to audit and align product-entitlements doctrine before sync or monetization."
  - "Current MVP is local-first and has no billing, premium gate, quota, activation code, provider webhook, or entitlement runtime."
  - "Local preflight found no productEntitlements, product_entitlements, suiteAccess, globalUserId, or global_user_id in this project."
  - "app/convex/schema.ts already has userId-scoped shopping list and product snapshot tables for optional future cloud sync."
  - "app/src/lib/cloudSync.ts and app/src/lib/cloudSyncQueue.ts are placeholders/local queue utilities and do not enforce server-side access."
  - "README states stored data is local-first and not a full browser profile or Temu session store."
  - "User decision 2026-06-10: Diane wants one central suite-owned entitlement ledger for her operated products, with separate product ids."
  - "WinFlowz commit b779876 formalized one suite-owned ledger as the default for Diane-operated products and names Temu Shopping Lists as a future product to join through product_id."
next_step: "closed"
---

# Title

Entitlements And Access Model For Temu Shopping Lists

## Status

Ready for `/sf-start`. The previous blocker is resolved: Temu Shopping Lists should join the existing suite-owned entitlement ledger rather than creating a product-local durable ledger.

Current compliance verdict:

- The local-first MVP is not currently violating the product-entitlements doctrine because it has no protected cloud runtime, premium feature gate, quota, billing provider, activation code, or entitlement-backed data access.
- The project must not add cloud-protected user data, premium gates, quotas, activation codes, billing, app-store purchases, provider webhooks, or support access grants until it can query or mirror the suite-owned ledger for `product_id=temu_shopping_lists`.
- The existing Convex schema is only an optional sync scaffold. It must not become a production authorization model by relying on client-supplied `userId`.
- Product-local entitlement state, if any is added later, may only be a cache, mirror, or bridge adapter. The durable answer to "does this user have access?" belongs to the suite ledger.

## User Story

En tant qu'operatrice du produit, je veux que Temu Shopping Lists se conforme a la doctrine product-entitlements avant d'activer sync cloud, premium, quotas, billing ou activation codes, afin que l'identite, les evenements provider et l'acces produit restent separes et verifiables.

Primary actor: product operator / implementation agent.

Trigger: work begins on cloud sync, login/account, paid plans, premium gates, usage limits, activation codes, billing provider events, or protected product data.

Observable result: the project has a documented access architecture that fails closed, separates identity from product access, and adapts to the canonical suite ledger under `product_id=temu_shopping_lists`.

## Minimal Behavior Contract

The project must remain local-first and ungated until an entitlement bridge is implemented. When protected cloud sync, premium capabilities, quotas, billing, or activation codes are introduced, the backend must verify identity and then read the suite-owned entitlement ledger before granting protected reads, writes, feature use, or quota consumption for `product_id=temu_shopping_lists`. Authentication alone must never grant product access. Provider payments, marketplace purchases, app-store events, manual grants, and activation codes are event inputs only; they must not become the runtime authorization source. If identity, entitlement lookup, provider verification, bridge sync, product namespace, or quota checks are unavailable or malformed, the app must deny protected access and show a recoverable "access not active/unavailable" state.

Easy-to-miss edge case: a user who is signed in but has no active entitlement must still be recognized as a user while being denied protected sync/premium data access.

## Success Behavior

- Given the MVP remains local-only, when a user imports and saves Temu product snapshots, then no entitlement check is required and no paid-access claim is made.
- Given cloud sync is enabled in a future implementation, when a signed-in user reads or writes cloud shopping lists, then the backend validates identity and active entitlement for the stable `product_id`.
- Given a signed-in user has no active entitlement, when they attempt protected sync or premium actions, then the UI shows account recognized but access inactive, and the backend denies the operation.
- Given a provider event, manual grant, app-store event, or activation code is processed, when it references a known product and plan, then it is normalized into the server-owned entitlement/event ledger with idempotency.
- Given a refund, chargeback, expiry, revoke, or failed renewal event arrives, when the entitlement is recomputed, then protected access is removed without deleting identity or local-only data.
- Given a single-use activation code is redeemed by one user, when another user tries to reuse it, then redemption is denied and support diagnostics stay redacted.
- Given the product is part of Diane's suite, when entitlement storage is implemented, then Temu Shopping Lists adapts to the canonical suite ledger instead of creating a second durable entitlement ledger.

## Error Behavior

- Missing identity: deny protected cloud/premium access and show sign-in/create-account state.
- Backend unavailable: deny protected access and show "access cannot be checked right now"; do not assume access from local cache.
- No entitlement: deny protected access while preserving local-only data and user account recognition.
- Unknown `product_id`, `plan_id`, or provider source: store as `pending_review` or reject according to ingestion context; never auto-activate.
- Cross-environment event: reject or quarantine; local, preview, staging, and production entitlements must not mix.
- Duplicate provider event: process idempotently and do not duplicate access.
- Activation code typo or already-used code: show recoverable error; never log raw code.
- Revoked/refunded/expired entitlement: deny protected access and show support or purchase path.
- Client-supplied `userId`, `globalUserId`, `productId`, plan, entitlement, role, or quota: ignore for authorization and recompute server-side.

## Problem

Temu Shopping Lists currently has optional Convex schema scaffolding with `userId` fields, plus local placeholders for cloud sync. That is acceptable for a local-first MVP, but it becomes unsafe if reused as production authorization without a product entitlement model.

The product-entitlements doctrine requires three separate layers:

- identity: who the user is;
- provider events: what payment, marketplace, app store, or operator action reported;
- product entitlements: what this product allows the user to access now.

The project needs an explicit stop gate before monetization or protected cloud sync so future agents do not accidentally treat login, localStorage, client-owned IDs, or provider payment state as product access.

## Solution

Define a product-access architecture and compliance gate before implementing protected sync or monetization. The first implementation should be an audit-and-guardrail pass: document Temu Shopping Lists as suite-ledger-owned, add explicit product identifiers and access states, mark Convex sync as not production-authorized until backend checks exist, and write tests/docs that prevent premium/cloud features from shipping without server-owned entitlement verification.

Approved default after operator decision: keep all current app features local-first/free and treat cloud sync, premium gates, quotas, billing, and activation codes as blocked until Temu can query or mirror the suite-owned ledger for `product_id=temu_shopping_lists`.

## Scope In

- Entitlement compliance audit against `/home/claude/shipglowz/skills/references/product-entitlements-playbook.md`.
- Decision record for product family: suite-ledger product under the shared Diane-operated product ledger.
- Stable internal identifiers:
  - `product_id`: recommended `temu_shopping_lists`.
  - initial `plan_id` candidates: `free_local`, `sync`, `pro`, `lifetime_deal`.
  - allowed `source` candidates: `manual`, `direct_ltd`, `partner`, `stripe`, `paddle`, `lemon_squeezy`, `google_play`, `app_store`, `migration`, only when those channels are explicitly selected.
- Server-owned entitlement read contract for protected sync/premium operations.
- Fail-closed UI state contract for signed out, backend unavailable, no entitlement, active entitlement, refunded/revoked/expired, and pending review.
- Convex schema posture review: current `userId` tables are scaffolding and must be adapted before production sync.
- Documentation updates to README and technical docs warning that auth is not entitlement.
- Tests/checks that assert no protected cloud write or premium feature can rely on client-owned `userId` or local entitlement cache.
- Support/runbook requirements for grants, revokes, refunds, reissues, duplicate emails, and activation-code mistakes.

## Scope Out

- Implementing Stripe, Paddle, Lemon Squeezy, Google Play Billing, App Store, Polar, AppSumo, or any other provider integration.
- Implementing checkout UI.
- Implementing real activation-code redemption.
- Migrating an existing suite ledger.
- Making cloud sync production-ready.
- Enforcing Android app-store purchase validation.
- Designing team/seat billing.
- Public pricing copy or paywall conversion copy.
- Changing the existing local-first import/list/snapshot behavior.

## Constraints

- Authentication proves identity only; it must not grant product access.
- Provider events are inputs; they must not be the runtime source of authorization.
- Entitlement truth must be server-owned, not stored only in custom claims, cookies, localStorage, app settings, or client-writable database paths.
- Protected cloud reads/writes must validate session, mapped server-owned user id, product namespace, active entitlement, and feature/quota permission.
- The product must fail closed if entitlement lookup is missing, stale, malformed, or unavailable.
- Activation codes are bearer credentials and must not be logged or stored raw client-side.
- Any suite ledger that already exists must be adapted to, not duplicated locally, unless a spec explicitly documents standalone status or a temporary migration adapter.
- No future spec may add paid/protected product data without loading the product-entitlements playbook.

## Test Contract

Surface: Vue/Tauri local-first app with optional future Convex sync and no current entitlement runtime.

Proof profile:

- Static/local proof that no billing or entitlement runtime currently exists.
- Schema/doc proof that Convex `userId` scaffolding is not treated as production authorization.
- Future server proof required before cloud sync or premium work ships.
- Manual/operator proof recorded for product-family decision; support runbook still required before real grants/codes.

Proof order:

1. Confirm product-family decision and suite-ledger dependency.
2. Add product-local allowlists and status semantics without provider writes.
3. Mark sync scaffold as non-authorizing.
4. Define backend access-check contract.
5. Add checklist/support artifacts before grants, codes, paid features, or protected sync.
6. Run code checks and entitlement lifecycle smoke only after server bridge/provider surfaces exist.

Checklist path if implementation begins: `shipglowz_data/workflow/test-checklists/temu-shopping-lists-entitlements.md`.

Required scenario IDs:

- `TC-ENT-AUTO-001`: Search confirms no product-local entitlement ledger or provider billing integration exists before implementation.
- `TC-ENT-AUTO-002`: Product id, plan ids, and source ids are allowlisted in code or docs before any entitlement write path exists.
- `TC-ENT-AUTO-003`: Protected cloud sync functions reject unauthenticated requests.
- `TC-ENT-AUTO-004`: Protected cloud sync functions reject authenticated users without active entitlement.
- `TC-ENT-AUTO-005`: Client-supplied `userId`, `productId`, plan, role, entitlement, or quota cannot grant access.
- `TC-ENT-AUTO-006`: Provider/manual events are idempotent by `sourceEventId` or equivalent.
- `TC-ENT-AUTO-007`: Revoked/refunded/expired entitlements deny protected access.
- `TC-ENT-AUTO-008`: Activation code redemption never logs or persists raw codes client-side.
- `TC-ENT-MANUAL-001`: Operator confirms suite-ledger decision.
- `TC-ENT-MANUAL-002`: Support runbook can check, grant, revoke, expire, refund, and reissue access without exposing secrets.

Required results:

- The app has exactly one stable product id, `temu_shopping_lists`.
- Protected sync/premium code paths fail closed unless backend entitlement proof is available.
- No product-local durable entitlement ledger is created.
- Local-only snapshots stay readable without entitlement.
- Provider-specific implementation remains blocked until a provider spec checks current official docs.

Exception with proof:

- Current local-only product import/list/snapshot features do not need entitlement checks because they do not access protected backend product data.

Exception without proof:

- No payment-provider docs are checked yet because no provider has been selected and provider implementation is scope-out. The documentation freshness gate must be rerun with official provider docs before any provider-specific spec or implementation.

## Dependencies

- Product Entitlements Playbook: `/home/claude/shipglowz/skills/references/product-entitlements-playbook.md`, version `1.0.1`, active.
- Decision Quality Contract: `/home/claude/shipglowz/skills/references/decision-quality-contract.md`, version `1.0.0`, active.
- Documentation Freshness Gate: `/home/claude/shipglowz/skills/references/documentation-freshness-gate.md`, version `1.2.0`, active.
- Existing MVP spec: `shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md`, version `1.0.0`, status ready.
- Existing technical doc: `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`, version `1.0.2`, draft.
- WinFlowz suite-authentication decision: `/home/claude/winflowz/shipglowz_data/workflow/docs/technical/suite-authentication.md`, version `1.0.11`, reviewed. Verdict: one suite-owned entitlement ledger is the default for Diane-operated products.
- WinFlowz unified-suite-authentication spec: `/home/claude/winflowz/shipglowz_data/workflow/specs/unified-suite-authentication.md`, version `1.0.26`, active. Verdict: future apps such as Temu Shopping Lists should add a `product_id` and product gates instead of creating a second durable ledger.
- Convex Auth docs: `https://docs.convex.dev/auth`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; current docs state Convex uses OpenID Connect JWTs for authentication and functions can access authenticated identity through backend auth APIs.
- Convex schema docs: `https://docs.convex.dev/database/schemas`, accessed 2026-06-10. Fresh-docs verdict: `fresh-docs checked`; current docs support schema validation/type safety but do not replace authorization checks.

## Invariants

- Local-only data remains usable without entitlement.
- Protected cloud data requires backend-verified identity and entitlement.
- Durable entitlement truth for Temu Shopping Lists belongs to the suite ledger, not to this app repository.
- Entitlement state maps every status to `grantsAccess: true | false`.
- `active` and `trialing` can grant access; `inactive`, `expired`, `revoked`, `refunded`, and `pending_review` do not.
- Environment is part of entitlement truth; local/preview/staging/production access must not cross over.
- Product-local entitlement cache, if ever added, is a cache/mirror only and never durable truth.
- Support diagnostics redact raw codes, tokens, cookies, provider secrets, webhook secrets, and unnecessary personal data.

## Links & Consequences

- `app/convex/schema.ts`: future sync tables need server-owned identity and entitlement checks before production use.
- `app/src/lib/cloudSync.ts`: current opt-in placeholder must not become a silent sync toggle without entitlement authorization if sync is protected or paid.
- `app/src/lib/cloudSyncQueue.ts`: queued jobs must not grant or imply access; backend must re-check entitlement when flushing.
- README: must explain local-first/free status and any future access requirements.
- Android APK release path: no change unless premium distribution or app-store billing is introduced.
- WebView Temu beta: if any feature becomes premium or quota-limited, it must use the entitlement gate before enabling.
- Support: entitlement support requires a runbook before real users can buy, redeem, revoke, refund, or request access repair.

## Documentation Coherence

Update or create:

- `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`: add an "Access and Entitlements" section.
- `shipglowz_data/technical/architecture.md` if/when architecture doc exists: document identity/provider-events/entitlements separation.
- `README.md`: keep MVP local-first wording; add warning if cloud sync is not production entitlement-safe.
- `shipglowz_data/workflow/test-checklists/temu-shopping-lists-entitlements.md`: create when implementation starts.
- Support runbook doc before activation codes, grants, refunds, or paid support flows ship.

Do not update public pricing, checkout, FAQ, or app-store copy until provider and entitlement model are selected.

## Edge Cases

- User signs in successfully but has no product entitlement.
- Backend cannot check access because auth provider, Convex, or entitlement bridge is unavailable.
- User has an entitlement in staging but not production.
- Provider sends unknown product id or plan id.
- Provider sends duplicate webhook/event.
- Provider sends refund after local cache still says active.
- Activation code is pasted into support logs by accident.
- Activation code is redeemed by the wrong account.
- User changes email or has duplicate identity accounts.
- User downgrades from sync/pro to free local.
- User loses entitlement but keeps local device data.
- Offline device tries to perform a protected sync flush later.
- Future app-store billing requires platform-specific validation rules.

## Implementation Tasks

- [x] Task 1: Document product-family decision.
  - File: `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`
  - Action: Add "Access and Entitlements" section naming this product as suite-ledger-owned under `product_id=temu_shopping_lists`.
  - Validate with: metadata lint and review against product-entitlements playbook.
  - Notes: Readiness blocker resolved on 2026-06-10.

- [x] Task 2: Define stable access identifiers.
  - File: `app/src/lib/entitlements.ts` or `app/src/lib/accessModel.ts` plus technical docs.
  - Action: Add allowlisted `product_id`, allowed `plan_id`, allowed source ids, and status-to-access mapping.
  - Validate with: unit tests for unknown ids and status grants.
  - Notes: Implemented in `app/src/lib/accessModel.ts`; no provider writes added.

- [x] Task 3: Mark Convex sync scaffold as not production-authorized.
  - File: `app/convex/schema.ts`, `app/src/lib/cloudSync.ts`, `app/src/lib/cloudSyncQueue.ts`, technical docs.
  - Action: Add explicit comments/docs or guard types so future sync work cannot treat `userId` as authorization.
  - Validate with: typecheck and lint.
  - Notes: `setSyncEnabled` now requires active entitlement proof; server-side recheck is still required before production sync.

- [x] Task 4: Design backend access check contract.
  - File: `app/convex/access.ts` or future server module, `shipglowz_data/technical/architecture.md`.
  - Action: Specify function signature and behavior for checking identity, product namespace, entitlement status, and feature/quota permission.
  - Validate with: unit/integration tests once Convex functions exist.
  - Notes: Implemented as the provider-neutral `evaluateProtectedAccess` contract in `app/src/lib/accessModel.ts`; future Convex/server bridge must recompute the same decision server-side.

- [x] Task 5: Create entitlement test checklist.
  - File: `shipglowz_data/workflow/test-checklists/temu-shopping-lists-entitlements.md`
  - Action: Add TC-ENT scenarios from this spec with PASS/FAIL/NOT_RUN status columns.
  - Validate with: checklist parser or manual table review.

- [x] Task 6: Add support runbook skeleton before any real grants/codes.
  - File: `shipglowz_data/technical/support/entitlements-runbook.md` or nearest canonical technical support path.
  - Action: Document safe lookup, grant, revoke, refund, expire, reissue, duplicate-account, and wrong-code flows.
  - Validate with: metadata lint.

- [x] Task 7: Block provider-specific implementation until provider selected.
  - File: future provider spec.
  - Action: Require fresh official docs for chosen provider webhook signatures, event ids, refunds, cancellations, and environment handling.
  - Validate with: documentation freshness gate.
  - Notes: Enforced as a scope boundary in README, spec, checklist, and support runbook; no provider runtime was added.

## Acceptance Criteria

- [x] AC1: The project has a documented suite-ledger decision before any protected sync or paid feature is implemented.
- [x] AC2: Authentication is explicitly documented as identity only, not product access.
- [x] AC3: The stable `product_id`, plan ids, source ids, and entitlement statuses are allowlisted before runtime entitlement writes exist.
- [x] AC4: Cloud sync code and docs state that client-owned `userId` is not authorization.
- [x] AC5: A protected backend access check contract exists before production cloud sync.
- [x] AC6: No provider event, activation code, or manual grant can activate access without server-side normalization and idempotency.
- [x] AC7: Signed-in/no-entitlement and backend-unavailable states deny protected access but remain recoverable in UI.
- [x] AC8: Refund/revoke/expire behavior removes protected access without deleting identity or local-only data.
- [x] AC9: Support diagnostics redact tokens, cookies, raw codes, provider secrets, and unnecessary personal data.
- [x] AC10: Any provider-specific follow-up spec includes current official docs and webhook/signature validation requirements.

## Test Strategy

1. Static search:
   - `rg -n "productEntitlements|product_entitlements|entitlement ledger|suiteAccess|suite identity|globalUserId|global_user_id" .`
   - `rg -n "stripe|paddle|polar|lemon|billing|subscription|entitlement|paywall|quota|activation|lifetime" app/package.json app/pnpm-lock.yaml app/src app/convex README.md shipglowz_data`
2. Metadata and docs:
   - `python3 /home/claude/shipglowz/tools/shipflow_metadata_lint.py <changed docs>`
3. Code checks when implementation begins:
   - `pnpm typecheck`
   - `pnpm test:once`
   - `pnpm lint:check`
4. Entitlement lifecycle smoke proof before shipping real entitlement work:
   - grant/redeem active access;
   - confirm authorized access;
   - confirm second-user reuse is denied;
   - revoke/refund/expire;
   - confirm protected access is denied;
   - replay provider event and confirm idempotency;
   - inspect support diagnostics for redaction.

## Risks

- Duplicate ledger risk: product-local tables may drift from a suite-owned ledger if the product is actually part of a suite.
  - Mitigation: decide standalone vs suite before adding durable entitlement tables.
- Client-trust risk: future sync may trust `userId` from frontend or local queue.
  - Mitigation: backend recomputes identity and entitlement on every protected access.
- Provider drift risk: payment/webhook APIs change.
  - Mitigation: require documentation freshness gate and official docs for selected provider.
- Support leak risk: activation codes and provider references are easy to log accidentally.
  - Mitigation: hash codes where possible and redact support diagnostics.
- Offline/local-data confusion: losing paid access should not delete local personal archives.
  - Mitigation: separate local-only data from protected cloud/premium services.

## Execution Notes

- Current local preflight found no entitlement ledger in this project.
- Existing `app/convex/schema.ts` is sync scaffolding only; it is not an authorization model.
- Product entitlement work should use the smallest safe path: first document the decision and access contract, then implement server checks, then add provider/event surfaces.
- Temu Shopping Lists must not create `product_entitlements`, activation-code, billing-event, or support-grant truth locally. It should add product-local UI/status/gates and bridge to the suite ledger.
- Fresh-docs checked:
  - Convex Auth: `https://docs.convex.dev/auth`
  - Convex Schemas: `https://docs.convex.dev/database/schemas`
- Fresh-docs not needed yet for payment providers because provider-specific implementation is out of scope until a provider is selected.

## Open Questions

None.

## Deferred Product Decisions

- Will cloud sync be free, paid, lifetime-deal gated, or unavailable in the first public version?
- Which provider, if any, will be used first: direct manual grants, Stripe, Paddle, Lemon Squeezy, Google Play, App Store, partner/LTD codes, or none?
- Does losing paid access remove only cloud/premium capability while preserving local archives on device?
- Should WebView beta capture be free, entitlement-gated, or quota-limited?

## Resolved Decisions

- Product family: Temu Shopping Lists joins the suite-owned ledger for Diane-operated products.
- Stable product id: `temu_shopping_lists`.
- Durable access truth: suite ledger, not this app repository.
- Product-local access state: allowed only as cache, bridge mirror, UI status, or product-specific gates.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-10 09:19:07 UTC | sf-spec | GPT-5 Codex | Created entitlement and access model spec from TASK-2026-06-10-012, product-entitlements playbook, local preflight, and Convex docs freshness check | draft spec created; standalone vs suite-ledger decision remains a readiness blocker | /sf-ready Entitlements and access model for Temu Shopping Lists |
| 2026-06-10 09:43:39 UTC | sf-spec | GPT-5 Codex | Updated spec after operator confirmed one central suite-owned ledger across Diane-operated products | Spec moved to ready: Temu Shopping Lists should use `product_id=temu_shopping_lists` in the suite ledger and must not create a second durable ledger | /sf-start Entitlements and access model for Temu Shopping Lists |
| 2026-06-10 09:45:29 UTC | sf-ready | GPT-5 Codex | Evaluated readiness after the suite-ledger blocker was resolved | Ready: no open blocking questions remain; test contract now names proof order and required results; provider/sync monetization choices are deferred, not blockers | /sf-start Entitlements and access model for Temu Shopping Lists |
| 2026-06-10 10:11:02 UTC | sf-start | GPT-5 Codex | Implemented the bounded entitlement guardrail slice: access allowlists, fail-closed protected access contract, sync scaffold guardrails, checklist, README note, and support runbook skeleton | Implemented locally; provider-specific work remains intentionally blocked until a provider spec and fresh official docs exist | /sf-verify Entitlements and access model for Temu Shopping Lists |
| 2026-06-10 10:19:48 UTC | sf-verify | GPT-5 Codex | Verified the entitlement guardrail slice against code, docs, checklist, metadata, tests, build, CI surface, and static scans | Verified for the current local guardrail scope; provider/server-bridge proof remains deferred and blocked by explicit future specs before protected sync, grants, codes, or billing | /sf-end Entitlements and access model for Temu Shopping Lists |
| 2026-06-10 10:46:58 UTC | sf-ship | GPT-5 Codex | Closed and shipped the verified entitlement guardrail slice with tracker and changelog updates | Shipped; repository pushed after checks; provider/server-bridge work remains blocked by future specs before protected sync, grants, codes, or billing | closed |

## Current Chantier Flow

- sf-spec: done, updated after ledger decision
- sf-ready: ready
- sf-start: implemented
- sf-verify: verified for current guardrail scope
- sf-end: closed via sf-ship full mode
- sf-ship: shipped

Next command: none
