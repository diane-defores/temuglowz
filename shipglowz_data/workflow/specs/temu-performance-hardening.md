---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.3"
project: "temu"
created: "2026-06-25"
created_at: "2026-06-25 16:51:25 UTC"
updated: "2026-06-25"
updated_at: "2026-06-25 17:54:07 UTC"
status: reviewed
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "performance hardening for cloud sync pulls and static guide pages"
owner: "Diane"
confidence: high
user_story: "En tant qu'utilisatrice de TemuGlowz, je veux que la synchronisation cloud et les pages guides restent rapides quand mes donnees ou le contenu grandissent, afin d'utiliser le produit sans lenteur, sans donnees manquantes et sans chargement JavaScript inutile."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "app/convex/sync.ts"
  - "app/convex/schema.ts"
  - "app/src/lib/cloudSyncBackend.ts"
  - "app/src/lib/cloudSync.ts"
  - "app/src/lib/cloudSyncHydration.ts"
  - "app/src/lib/cloudSync.test.ts"
  - "site/src/pages/guides/kitchen-gadgets.astro"
  - "site/src/pages/guides/summer-cooling.astro"
  - "site/src/site/components/ProductCard.vue"
  - "site/src/layouts/Layout.astro"
  - "site/src/styles/global.css"
  - "site/public/"
  - "site/public/"
  - "shipglowz_data/technical/apps/temu-shopping-lists-android-app.md"
  - "shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md"
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md"
    artifact_version: "1.0.11"
    required_status: ready
  - artifact: "shipglowz_data/technical/apps/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.10"
    required_status: draft
  - artifact: "shipglowz_data/technical/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: active
  - artifact: "Convex paginated queries documentation"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
  - artifact: "Convex Query interface documentation"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
  - artifact: "Astro directives reference"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
  - artifact: "Astro images guide"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
supersedes: []
evidence:
  - "403-sf-perf on 2026-06-25 found Convex sync pulls used an indexed query but had no cursor contract; a local mitigation capped reads at 500 records."
  - "403-sf-perf on 2026-06-25 found guide pages hydrate each ProductCard with client:only even though current product cards are static markup with links."
  - "403-sf-perf on 2026-06-25 found Layout.astro imports Lenis for every non-reduced-motion visitor."
  - "403-sf-perf on 2026-06-25 found duplicate public and site/public PNG portraits ranging from 736KB to 1.6MB each."
  - "pnpm build on 2026-06-25 showed app CSS around 400KB and PrimeIcons legacy font assets in the build output."
  - "Official Convex docs accessed 2026-06-25 state paginated queries use .paginate(paginationOpts), and unbounded .collect() should be avoided when results can grow."
  - "Official Astro docs accessed 2026-06-25 state client directives hydrate imported UI framework components, and Astro Image/Picture components optimize image output."
next_step: "/104-sf-end Temu performance hardening"
---

# Spec: Temu Performance Hardening

🟢 [temu] spec: Temu performance hardening | status: reviewed | path: shipglowz_data/workflow/specs/temu-performance-hardening.md | next: /104-sf-end Temu performance hardening

## Title

Temu Performance Hardening: Paginated Sync Pulls And Static Site Weight

## Status

Reviewed by `/103-sf-verify` on 2026-06-25. Cursor-based sync hydration, static guide rendering without unnecessary Vue islands, Lenis removal, duplicated headshot asset deletion, docs updates, metadata, design-system drift, builds, static artifact inspection, and local browser smoke all pass. Ready for `/104-sf-end`.

## User Story

En tant qu'utilisatrice de TemuGlowz, je veux que la synchronisation cloud et les pages guides restent rapides quand mes donnees ou le contenu grandissent, afin d'utiliser le produit sans lenteur, sans donnees manquantes et sans chargement JavaScript inutile.

Primary actors:

- Premium Temu Shopping Lists user with cloud sync enabled.
- Static-site visitor reading TemuGlowz guides.
- Operator verifying build, bundle, and sync behavior before ship.

Trigger:

- Cloud sync hydration after sign-in, reinstall, or new-device setup.
- Static guide page load for `/guides/kitchen-gadgets` and `/guides/summer-cooling`.
- Build/verification run after performance changes.

Observable result:

- Cloud sync pulls all eligible changed records through bounded pages with no missing records and no unbounded backend memory read.
- Static guide product cards render as HTML without per-card Vue hydration unless a card becomes genuinely interactive.
- Known local assets are optimized or removed from duplicated public locations.
- Build output and validation evidence show reduced unnecessary client payload while app sync correctness remains intact.

## Minimal Behavior Contract

When a signed-in entitled user hydrates cloud sync data, the app must request bounded pages from Convex until the backend reports completion, apply records in deterministic order, and keep local data recoverable if any page fails. When a visitor opens a static guide, the page must render the same visible product cards, links, FAQ, and layout from static HTML without loading Vue for cards that do not need client state. If optimization fails, the app must preserve current local-first sync safety and current visible guide content rather than dropping records, hiding products, or silently changing product claims. The easy-to-miss edge case is a large account with more records than the first page: the client must not mark hydration ready after only the first bounded batch.

## Success Behavior

- Given a user has more than one page of changed sync records, when backend-verified sync handoff runs, then the client fetches every page until completion and applies all records once.
- Given the backend has no more sync records, when the last page is returned, then the response carries a stable completion signal and the client may continue to queued push replay.
- Given a sync page request fails mid-hydration, when the error is caught, then sync remains blocked or pending with local data unchanged and no false synced/ready state.
- Given a guide product card has only static content and an outbound Temu link, when the Astro site builds, then the card is emitted as HTML and no per-card Vue island is generated.
- Given local public marketing images are known at build time, when the Astro site builds, then optimized WebP/AVIF or responsive outputs are used where practical, and duplicated heavyweight PNG copies are removed or consolidated.
- Given Lenis remains in the site, when implementation finishes, then its loading must be justified by measured user value and gated to pages/states that need it; otherwise native browser scroll is used.
- Given performance work changes static pages, when verification runs, then HTML content, links, sponsored/noopener attributes, alt text, FAQ details, JSON-LD, canonical metadata, and sitemap expectations remain intact.
- Given performance work changes sync contracts, when validation runs, then unit and integration tests prove paginated hydration, partial failure, cursor continuation, and no record loss.

## Error Behavior

- Missing or invalid cursor: return a validation error or restart from a safe initial cursor; never skip records by accepting malformed continuation input.
- Backend timeout or Convex action failure during a later page: keep local data readable, do not replay queued pushes as if hydration completed, and surface a recoverable cloud-sync blocked state.
- Duplicate record across page boundaries: apply idempotently by record identity/version, not by array position.
- Page limit above the backend maximum: clamp to the server maximum and keep the response shape explicit.
- Static asset conversion failure: keep the source image available and fail build or test visibly; do not ship broken image URLs.
- Remote product images in guide data: keep them as remote URLs unless there is an explicit local-copy policy; do not mirror third-party images or imply asset ownership.
- `client:only` removal causes SSR mismatch: stop and convert the component to an Astro/static component rather than adding hidden hydration back.
- Lenis removal changes anchor navigation or reduced-motion behavior: preserve native anchor navigation and reduced-motion semantics.
- Any diagnostic or error log must exclude tokens, cookies, user private data, raw sync payloads, and Temu session data.

## Problem

The 2026-06-25 performance audit found that a local cap now prevents `listSyncRecordsInternal` from collecting an unbounded number of Convex rows, but the sync contract still has no continuation cursor. Large accounts can therefore hydrate only the first capped batch unless implementation adds pagination. The same audit found static guide pages hydrate every product card through `client:only="vue"` even though the card content is currently static markup with outbound links. The static site also copies large PNG headshots into both `site/public/` and `site/public/`, and the shared layout imports Lenis for every non-reduced-motion visitor.

These issues are connected by user trust: cloud sync must not drop data as accounts grow, and public guide pages should not spend JavaScript and image bytes on behavior that static HTML already provides.

## Solution

Replace the capped-only sync read with a cursor-based paginated hydration contract using Convex-supported pagination or an equivalent server-owned cursor contract. The client must loop through pages before marking hydration complete, with tests that cover large record sets, partial failure, and idempotent application.

For the static site, convert non-interactive product cards to Astro/static rendering, consolidate or optimize known local assets, and reevaluate Lenis as an optional enhancement instead of default site-wide runtime. Preserve visible guide content and SEO metadata while reducing avoidable JavaScript and transfer weight.

## Scope In

- Backend sync pagination for `syncRecords` reads in `app/convex/sync.ts`.
- Public action and internal query response shape updates for cursor/continuation metadata.
- Frontend action wrapper updates in `app/src/lib/cloudSyncBackend.ts`.
- Backend-verified sync handoff loop updates in `app/src/lib/cloudSync.ts`.
- Hydration safety tests for multi-page pulls, partial failure, idempotency, and completion semantics.
- Static product-card rendering for guide pages currently using `ProductCard client:only="vue"`.
- Static card parity for rank, title, rating, price, image, pros/cons, outbound link, rel attributes, and visible styling.
- Local asset audit for duplicated public PNGs and safe conversion/consolidation of known local images.
- Lenis loading decision: remove, gate, or document retained usage with proof.
- Build output comparison before and after implementation.
- Documentation updates for the technical app context if sync behavior or validation commands change.

## Scope Out

- New cloud sync domains beyond the existing records model.
- Rewriting the premium cloud sync entitlement model.
- Billing, activation codes, or entitlement-provider changes.
- Copying or mirroring remote Temu product images.
- New product-guide content, affiliate copy, pricing claims, or SEO keyword strategy.
- Full app CSS architecture replacement unrelated to guide hydration and asset weight.
- Sentry implementation for the static marketing site; the static-site exception applies while guide pages have no auth or user-specific workflow.
- Android native proof unless implementation changes the Tauri/native app surface.

## Constraints

- Cloud sync remains local-first and fail-closed under the existing entitlement and account-marker rules.
- Hydration must not mark sync ready until every page needed for the current `since` boundary is applied or a recoverable failure state is set.
- Pagination must be deterministic enough to avoid missing or duplicating records when records share timestamps or are updated during the pull.
- Server-side access checks in `requireCloudSyncAccess` remain the authority; client-provided owner/account ids are not trusted.
- Static guide conversion must preserve current product content, outbound link attributes, accessibility labels, and guide metadata.
- Design-system changes must respect `shipglowz_data/technical/design-system-authority.md`; do not introduce new one-off visual literals for app routes.
- Language doctrine: stable ShipFlow headings, YAML, task labels, acceptance criteria, and internal contracts stay in English; any touched user-facing French copy must remain natural and accented; quoted external docs and source names keep their original language.
- Static-site Sentry is not expected because current guide pages have no auth, protected routes, checkout, server-handled forms, or user-specific runtime workflow.
- Official docs consulted: Convex paginated queries and Query interface docs; Astro directives and images docs. Verdict: `fresh-docs checked`.

## Test Contract

Surface/stack profile: mixed Vue/Vite/Tauri app, Convex backend actions/queries, and Astro static site.

Automated proof required:

- `pnpm typecheck:core`
- `pnpm typecheck:convex`
- focused Vitest coverage for cloud sync pagination/hydration failure behavior
- existing sync/access tests
- `pnpm build`
- `pnpm build:site`
- `python3 /home/claude/shipglowz/tools/design_system_drift_check.py --changed --format markdown` when guide/card/layout styling files change
- bundle/static output inspection showing product cards no longer emit per-card Vue islands when no client interactivity exists

Non-automated proof required:

- Browser smoke for `/guides/kitchen-gadgets` and `/guides/summer-cooling` after build/preview, checking visible product cards, images, outbound links, FAQ details, and console.
- Build artifact comparison for key JS/CSS/image outputs before/after, recorded in the implementation or verification report.

Manual/device proof:

- Android device proof is not required unless implementation changes `app/src-tauri/`, mobile app routes, or native sync behavior. Use `exception-with-proof`: this spec changes web/static and Convex/client sync logic only.

## Dependencies

- Local Convex dependency: `convex` `^1.41.0`.
- Astro dependency: `astro` `^7.0.2`, `@astrojs/vue` `^7.0.0`.
- Vue dependency: `vue` `^3.5.13`.
- Existing sync entitlement contract: `shipglowz_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md`.
- Existing app technical context: `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`.
- Official Convex docs accessed 2026-06-25:
  - `https://docs.convex.dev/database/pagination`
  - `https://docs.convex.dev/api/interfaces/server.Query`
- Official Astro docs accessed 2026-06-25:
  - `https://docs.astro.build/en/reference/directives-reference/`
  - `https://docs.astro.build/en/guides/images/`

Fresh external docs verdict: `fresh-docs checked`. Convex docs support pagination over unbounded collection, and Astro docs support removing hydration where a framework component is not needed plus using Astro image tooling for known assets.

## Invariants

- Saved Temu Shopping Lists data remains readable locally after every sync failure.
- Sync does not trust client-supplied owner ids or entitlement state.
- `local`, `preview`, `staging`, and `production` sync data remain isolated.
- Tombstones and stale-write rejection from the premium cloud sync spec remain intact.
- "Saved locally" and "synced to cloud" remain distinct states.
- Static guide pages remain crawlable and useful without client-side JavaScript for product cards.
- Outbound product links keep `target="_blank"` and `rel="noopener noreferrer sponsored"` where present.
- Remote Temu/product images are not copied into the repo during this work.
- Static-site optimization must not introduce auth, account state, checkout, or server mutation behavior.

## Links & Consequences

- `app/convex/sync.ts`: backend contract changes affect generated API behavior and tests.
- `app/src/lib/cloudSyncBackend.ts`: action response/request types must match Convex response shape.
- `app/src/lib/cloudSync.ts`: post-auth handoff must wait for all pages before queued push replay.
- `app/src/lib/cloudSyncHydration.ts`: record application must remain idempotent under page loops and duplicate/stale records.
- `site/src/pages/guides/*.astro`: product card rendering changes affect static HTML and SEO.
- `site/src/site/components/ProductCard.vue`: may remain for genuinely interactive contexts, but guide pages should not hydrate it unnecessarily.
- `site/src/layouts/Layout.astro`: Lenis changes affect every static page and anchor/reveal behavior.
- `site/public/` and `site/public/`: asset consolidation can affect deployed URLs; public URL compatibility must be checked before deleting files.
- Build output consequence: fewer Astro island scripts for guide pages, lower static JS payload, and lower image transfer for known local assets.
- SEO/content consequence: rendered HTML should retain guide content, metadata, structured data, canonical links, and FAQ text.
- Observability consequence: Sentry remains not expected for the static site; runtime sync errors must be visible through existing app feedback and safe logs, not raw payload dumps.

## Documentation Coherence

- Update `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md` if the cloud sync hydration contract changes materially, especially cursor semantics or validation commands.
- Update README only if developer commands or static-site asset workflow changes.
- Do not update marketing claims unless implementation changes public performance or sync promises that are visible to users.
- Do not edit `shipglowz_data/workflow/TASKS.md` or `shipglowz_data/workflow/AUDIT_LOG.md` from this spec; tracking was already created by `403-sf-perf`.

## Edge Cases

- More records exist than one page limit.
- Multiple records share the same `serverUpdatedAt`.
- A record changes while pagination is in progress.
- The first page succeeds and the second page fails.
- Response contains zero records but reports more pages due to cursor state.
- Client retries the same page after a transient failure.
- A large local queue exists and must not replay until hydration completes.
- Product card conversion drops `rel="sponsored"` or link target attributes.
- Placeholder remote images remain remote and should not be optimized as local assets.
- Local image conversion changes dimensions and causes layout shift.
- Lenis removal or gating breaks anchor navigation or reduced-motion behavior.
- Public image deletion breaks existing metadata references such as `og-image.png` or icons.

## Implementation Tasks

- [x] Task 1: Define the sync pagination response contract.
  - File: `app/convex/sync.ts`
  - Action: Replace records-only hydration response with records plus continuation metadata such as `cursor`/`isDone` or Convex `paginationResult`, and document server max page size.
  - User story link: prevents large accounts from hydrating only the first bounded batch.
  - Depends on: none
  - Validate with: `pnpm typecheck:convex`
  - Notes: Prefer official Convex `.paginate(paginationOpts)` when it fits the indexed query. If an equivalent custom cursor is chosen, it must be server-owned, deterministic, and tested for duplicate timestamps.

- [x] Task 2: Update frontend sync action types for pagination.
  - File: `app/src/lib/cloudSyncBackend.ts`
  - Action: Add request/response typing for pagination options and continuation metadata.
  - User story link: lets the client loop safely without ad hoc untyped fields.
  - Depends on: Task 1
  - Validate with: `pnpm typecheck:core`
  - Notes: Keep environment and owner/product validation in the response checks.

- [x] Task 3: Loop backend-verified hydration through every page before ready state.
  - File: `app/src/lib/cloudSync.ts`
  - Action: Replace single `listCloudSyncRecords({ environment })` hydration with a bounded loop that applies each page, stops only on completion, and blocks queued push replay on partial failure.
  - User story link: ensures users do not lose or miss cloud records on new devices.
  - Depends on: Task 2
  - Validate with: focused Vitest coverage for multi-page hydration and partial failure.
  - Notes: Use a clear maximum safety guard or backend completion signal to avoid infinite loops.

- [x] Task 4: Add sync pagination tests.
  - File: `app/src/lib/cloudSync.test.ts` or a focused new `app/src/lib/cloudSyncPagination.test.ts`
  - Action: Cover more-than-one-page hydration, failed second page, duplicate retry, no queued push replay before hydration completion, and mismatched owner/product/environment response.
  - User story link: proves sync correctness scales beyond the first page.
  - Depends on: Task 3
  - Validate with: `pnpm test:once <focused test files>`
  - Notes: Mock backend action wrappers rather than requiring hosted Convex.

- [x] Task 5: Convert static guide product cards away from Vue hydration.
  - File: `site/src/pages/guides/kitchen-gadgets.astro`, `site/src/pages/guides/summer-cooling.astro`, and a new or existing Astro/static card component
  - Action: Render the product card markup in Astro/static HTML for guide pages; keep the Vue card only for contexts that need Vue.
  - User story link: reduces unnecessary guide JavaScript while preserving visible content.
  - Depends on: none
  - Validate with: `pnpm build:site` and built HTML inspection for absence of per-card `astro-island` entries.
  - Notes: Preserve rank, rating display, pros/cons, image alt text, and outbound link attributes.

- [x] Task 6: Audit and optimize known local static assets.
  - File: `site/public/`, `site/public/`, and any Astro image imports introduced by the implementation
  - Action: Remove duplicated heavyweight local PNGs when unused, or replace known local display assets with responsive WebP/AVIF through Astro-supported image tooling while preserving required public URLs.
  - User story link: reduces transfer weight for static visitors.
  - Depends on: Task 5 when card images are touched
  - Validate with: `find dist-site -type f ... | du -h`, `pnpm build:site`, and visual/browser smoke.
  - Notes: Do not copy or transform remote Temu product images without explicit policy.

- [x] Task 7: Decide and implement Lenis loading scope.
  - File: `site/src/layouts/Layout.astro`
  - Action: Remove Lenis by default, or gate it to a narrow page/state with evidence that native scroll is insufficient.
  - User story link: avoids site-wide runtime work that does not serve static guide reading.
  - Depends on: none
  - Validate with: browser smoke for homepage and guide anchor/reveal behavior, with reduced-motion behavior checked.
  - Notes: IntersectionObserver reveal behavior can remain if it is small and safe; do not break reduced-motion fallback.

- [x] Task 8: Record documentation and proof updates.
  - File: `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md` and optionally `README.md`
  - Action: Document cursor-based hydration semantics and any changed static asset workflow if implementation changes operator/developer behavior.
  - User story link: keeps future sync/static-site work aligned with the performance contract.
  - Depends on: Tasks 1-7
  - Validate with: docs diff review plus relevant build/typecheck commands.
  - Notes: Keep user-facing claims conservative; do not claim performance improvements without build evidence.

## Acceptance Criteria

- [x] AC1: Given the backend has more changed sync records than one page, when sync hydration runs, then every page is fetched and applied before the handoff returns ready.
- [x] AC2: Given a later sync page fails, when hydration runs, then local data remains readable, queued pushes are not replayed, and the handoff returns a recoverable blocked/error state.
- [x] AC3: Given duplicate or retried page records, when hydration applies them, then records are idempotent and no conflict is created solely from retry.
- [x] AC4: Given the response owner/product/environment does not match the status response, when hydration runs, then sync is blocked and no records are applied as trusted data.
- [x] AC5: Given `/guides/kitchen-gadgets` is built, when the generated HTML is inspected, then product cards are present as static content and no per-card Vue `client:only` island is emitted.
- [x] AC6: Given `/guides/summer-cooling` is built, when the generated HTML is inspected, then product cards are present as static content and no per-card Vue `client:only` island is emitted.
- [x] AC7: Given a guide product has an outbound URL, when rendered, then the link keeps `target="_blank"` and `rel="noopener noreferrer sponsored"`.
- [x] AC8: Given local public images are optimized or removed, when `pnpm build:site` runs, then required icons, OG image, and referenced guide images still resolve.
- [x] AC9: Given reduced-motion is enabled, when a static page loads, then reveal content is visible without smooth-scroll animation.
- [x] AC10: Given the implementation finishes, when validation runs, then `pnpm typecheck:core`, `pnpm typecheck:convex`, focused tests, `pnpm build`, and `pnpm build:site` pass.

## Test Strategy

1. Run focused sync tests for pagination and partial failure.
2. Run `pnpm typecheck:core` and `pnpm typecheck:convex`.
3. Run `pnpm build` to ensure app bundle still builds.
4. Run `pnpm build:site` to ensure Astro static output builds.
5. Run the design-system drift check when guide/card/layout styling files change.
6. Inspect `dist-site/guides/kitchen-gadgets/index.html` and `dist-site/guides/summer-cooling/index.html` for static product markup and absence of per-card Vue islands.
7. Compare output sizes for key files before/after: guide HTML, Astro JS chunks, local image assets, and app CSS/JS if touched.
8. Browser-smoke the built static site or `astro preview` for homepage and guide pages: console clean, product cards visible, links intact, FAQ details usable, reduced-motion fallback acceptable.

## Risks

- High data risk: an incorrect cursor can skip or duplicate sync records. Mitigation: use official Convex pagination where possible and test multi-page/duplicate timestamp behavior.
- Medium UX risk: blocking queued pushes until all hydration pages finish may delay visible sync readiness. Mitigation: show existing pending/blocked feedback instead of false ready state.
- Medium static-site regression risk: converting Vue cards to Astro markup can drop visual states or link attributes. Mitigation: parity checklist and browser smoke.
- Medium SEO risk: removing hydration is good, but broken images or missing content would harm guide quality. Mitigation: inspect generated HTML and metadata.
- Low observability risk: no Sentry expected for static site, but sync runtime errors still need visible feedback. Mitigation: preserve existing post-auth/cloud-sync feedback and safe diagnostics posture.
- Low repo hygiene risk: public asset deletion can break stale references. Mitigation: search references before removing and preserve canonical public files.

## Execution Notes

- Read first:
  - `app/convex/sync.ts`
  - `app/src/lib/cloudSyncBackend.ts`
  - `app/src/lib/cloudSync.ts`
  - `site/src/pages/guides/kitchen-gadgets.astro`
  - `site/src/pages/guides/summer-cooling.astro`
  - `site/src/site/components/ProductCard.vue`
  - `site/src/layouts/Layout.astro`
- Prefer official Convex pagination over inventing a cursor unless the indexed query shape cannot support it cleanly.
- Do not increase `MAX_SYNC_RECORDS_PER_PULL` as the durable fix; the durable fix is continuation.
- Keep the prior 500-record cap or equivalent server max as a safety guard.
- If product cards later gain client interactivity, split static and interactive variants instead of hydrating the whole guide list by default.
- Treat local image optimization as a build/deploy concern only for repo-owned images. Remote product images remain remote.
- `101-sf-ready` verdict: Convex `.paginate(paginationOpts)` is the preferred implementation route, but a deterministic server-owned cursor over indexed fields remains acceptable if direct Convex pagination cannot express the needed action/query boundary cleanly. This is an implementation choice, not a product or security open question.
- Sentry: not expected for the static guide site under the current static-site exception. For sync runtime failures, use existing visible feedback and redacted logs; do not add session replay, screenshots, or broad telemetry as part of this chantier.
- Stop and reroute if pagination requires a breaking cloud sync protocol migration beyond additive cursor metadata, or if asset work requires a product decision about replacing public URLs.

## Open Questions

None.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-25 16:51:25 UTC | 100-sf-spec | GPT-5 Codex | Created spec from 403-sf-perf chantier potential for sync pagination and static-site performance hardening. | draft | /101-sf-ready Temu performance hardening |
| 2026-06-25 16:57:00 UTC | 101-sf-ready | GPT-5 Codex | Validated structure, user-story fit, docs freshness, design-system guardrails, security scope, adversarial risks, and proof contract. | ready | /102-sf-start Temu performance hardening |
| 2026-06-25 17:36:15 UTC | 102-sf-start | GPT-5 Codex | Implemented Convex-backed paginated sync hydration, full client handoff looping before queued replay, static Astro product cards for both guides, removed site-wide Lenis loading, updated technical sync docs, and ran local proof (`typecheck:core`, `typecheck:convex`, focused Vitest, `build`, `build:site`, artifact inspection). Asset duplication under `site/public/` and `site/public/` was audited but not deleted because the two static surfaces were not proven interchangeable. | implemented | /103-sf-verify Temu performance hardening |
| 2026-06-25 17:41:11 UTC | 103-sf-verify | GPT-5 Codex | Verified sync pagination, guide static rendering, Lenis removal, docs, metadata, drift, builds, static artifacts, and Playwright smoke on both guide pages. Repaired the preexisting layout skip-link arbitrary z-index drift with the standard `z-50` utility before final drift proof. Remaining gap: duplicated heavyweight `professional-headshot-*.png` files still exist in both `site/public/` and `site/public/`; deletion or conversion needs a scoped asset policy because public URL compatibility was not proven. | partial | /102-sf-start Temu performance hardening asset consolidation |
| 2026-06-25 17:49:48 UTC | 102-sf-start | GPT-5 Codex | Implemented the remaining asset consolidation by deleting unreferenced duplicated `professional-headshot-1..5.png` files from both `site/public/` and `site/public/`. Preserved favicon, touch icon, placeholder, robots, sitemap, llms, and `og-image.png`; verified `pnpm build:site` passes and `dist-site/` no longer contains the deleted headshots. | implemented | /103-sf-verify Temu performance hardening |
| 2026-06-25 17:54:07 UTC | 103-sf-verify | GPT-5 Codex | Reverified the complete scope after asset deletion: app and Convex typechecks, focused sync tests, app build, site build, design-system drift check, metadata lint, static artifact scans for no Vue islands/Lenis/headshots, and Playwright desktop/mobile guide smoke all passed. | verified | /104-sf-end Temu performance hardening |

## Current Chantier Flow

- 100-sf-spec: complete, spec created.
- 101-sf-ready: complete, ready.
- 102-sf-start: complete, asset consolidation implemented after prior partial verification.
- 103-sf-verify: complete, verified after full local and browser proof.
- 104-sf-end: next.
- 005-sf-ship: pending.

Next command: `/104-sf-end Temu performance hardening`
