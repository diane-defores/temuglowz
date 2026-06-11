---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-11"
created_at: "2026-06-11 01:30:37 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 02:27:43 UTC"
status: ready
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "Price and availability observations for saved Temu products"
owner: "Diane"
confidence: "medium"
user_story: "En tant qu'utilisatrice de Temu Shopping Lists, je veux enregistrer le dernier prix et le dernier état de disponibilité observés pour mes produits sauvegardés, afin de savoir lesquels vérifier ou acheter avant qu'ils disparaissent ou soient épuisés."
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - "Vue 3"
  - "Pinia persisted state"
  - "Tauri v2 Android"
  - "Android native WebView"
  - "Temu product snapshots"
  - "Shopping lists"
  - "Cloud sync queue"
  - "Temu Terms of Use"
  - "Temu Partner Platform"
depends_on:
  - artifact: "explorations/2026-06-11-temu-api-policy-price-availability.md"
    artifact_version: "1.0.0"
    required_status: "draft"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "implemented"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "User request 2026-06-11: create a system for price tracking or notifications when saved items are becoming sold out."
  - "Exploration 2026-06-11 found official Temu Partner APIs, but no confirmed buyer-facing API for arbitrary consumer product price/stock monitoring."
  - "Exploration 2026-06-11 recommends explicit user-initiated observations before any live monitoring claim."
  - "Temu Terms of Use reviewed 2026-06-11: automated crawling/scraping, storing significant service content without consent, and commercial use without permission are sensitive/restricted."
  - "Existing project task TASK-2026-06-10-013 tracks price and availability history for saved Temu products."
  - "Current domain model already includes ProductSnapshot.price and ProductSnapshot.availability but no observation history or alert preference model."
  - "102-sf-start implementation added product observations, manual update UI, WebView observe action, backup/sync queue integration, docs, checklist, and local proof."
  - "103-sf-verify local checks passed, but Android CI/APK and real-device checklist proof remain pending."
next_step: "/005-sf-ship then sf-ci-build and 107-sf-test Android price/availability observations"
---

# Title

Price And Availability Observations For Saved Temu Products

## Status

Implemented locally by `/102-sf-start`. This spec intentionally scopes the first safe slice as user-initiated observations and in-app reminder due badges, not automatic live monitoring, Android OS notification delivery, or Temu page parsing. Android APK/device proof remains for `/103-sf-verify`.

## User Story

En tant qu'utilisatrice de Temu Shopping Lists, je veux enregistrer le dernier prix et le dernier état de disponibilité observés pour mes produits sauvegardés, afin de savoir lesquels vérifier ou acheter avant qu'ils disparaissent ou soient épuisés.

Primary actor: Android user who has saved Temu products into shopping lists.

Trigger: the user explicitly saves a product, refreshes an observation for the current visible product in the in-app Temu WebView, or edits an observation manually from product detail.

Observable result: the saved product shows a last-observed price, availability, observation timestamp, source, confidence/status, and optional reminder preference without implying live monitoring.

## Minimal Behavior Contract

The app stores bounded personal observations for already saved Temu products, capped at 50 observations per product in the first slice. An observation records the product snapshot ID, canonical Temu URL, observed price when available, observed availability state, source (`webview`, `manual`, or later `partner_api` only if approved), timestamp, and confidence. Observations are created only after explicit user action or manual edit. The product detail and list cards show "Dernière observation" states and in-app reminder affordances. If observation capture fails or data is incomplete, the app keeps the previous archived snapshot and records a recoverable `unknown` or `manual_required` state rather than deleting or overwriting useful data. The easy-to-miss edge case is that "no current observation" must not be treated as "out of stock" and "sold out" must never delete archived title/image/URL data.

## Success Behavior

- Given a saved product, when the user opens product detail, then they can see the current archived availability plus the last observation timestamp if one exists.
- Given the user is on a Temu product page inside the app WebView, when they explicitly tap an observation action, then the app captures the current URL and opens the manual observation flow for that saved product or asks the user to save/link the product first.
- Given a price is observed, when it is stored, then amount, currency, and observed timestamp are persisted and visible as "Dernier prix observé".
- Given availability is observed, when it is stored, then the product shows one of `unknown`, `available`, `low_stock`, `sold_out`, `removed`, or `link_broken` as a last-observed state.
- Given observation data is partial, when the user returns later, then the previous product snapshot remains readable and the UI marks the missing fields as unknown or to review.
- Given the user opts into reminders, when a product has not been checked after the chosen interval, then the app shows an in-app due badge/reminder state the next time the user opens the relevant product or list.
- Given cloud sync is enabled later, when observations sync, then they remain user data tied to saved product snapshots, not a public product database.

## Error Behavior

- If the current WebView URL is not a valid Temu product URL, then do not create an observation and show a recoverable message.
- If the observed product is not in any list, then offer to add it to a list before storing observation history.
- If the first-slice WebView action cannot infer price or availability, then store only the canonical URL, timestamp, source, and `manual_required` status before opening the manual form.
- If the product page is unavailable, broken, or removed, then record `removed` or `link_broken` only when the user explicitly initiated the check and the app can distinguish that state; otherwise use `unknown`.
- If a duplicate observation has the same snapshot ID, observed values, source, and timestamp bucket, then dedupe rather than creating noisy history.
- If reminder due-state calculation fails, then keep the saved preference visible, avoid creating duplicate due badges, and never request Android notification permission in the first slice.
- If official Temu Partner API access is not granted, then do not call partner endpoints and do not claim live price or stock tracking.

## Problem

Temu products can become cheaper, scarce, sold out, or removed after the user has saved them. The app already preserves a durable snapshot, but it does not keep a history of observed price/availability changes or a clear "check this product again" workflow. A naive implementation would poll Temu pages in the background, but that creates policy, technical, privacy, and reliability risk.

## Solution

Add an observation layer around saved product snapshots. The first slice stores user-initiated observations and optional local reminder preferences. Product UI uses "last observed" wording. Automatic background crawling, third-party scraper APIs, and live stock claims remain out of scope until an approved official API path exists.

## Scope In

- Add an observation history model for saved product snapshots.
- Add availability state `low_stock` if the app can only store a user-observed low-stock signal.
- Add explicit observation source and confidence/status fields.
- Add product detail UI for last observed price, availability, timestamp, and history.
- Add list-card badges for last observed status where space allows.
- Add a user-triggered "Mettre à jour l'observation" action from product detail and/or the in-app WebView bottom-bar menu.
- Add manual edit fallback for price/availability observation.
- Add local reminder preferences such as "me rappeler de vérifier ce produit" with an interval/status, without claiming automatic Temu monitoring.
- Ensure backup/export and cloud-sync queue types can carry observations when the sync scope explicitly includes them.
- Add tests for observation validation, history append/dedupe, snapshot update, and sync queue behavior.

## Scope Out

- Background crawling or scheduled fetching of Temu product pages.
- Third-party scraper APIs.
- Mass monitoring of search results, seller inventories, or public product catalogs.
- Cart scraping, checkout scraping, order-history scraping, or account-data extraction.
- Temu Partner Platform integration unless a separate approved spec grants and proves permitted API access.
- Push notification service, cloud notification fanout, or server-side monitoring.
- Android OS local notification delivery in the first slice; first slice stores reminder preferences and in-app due badges only.
- Automated DOM parsing of Temu price/availability in the first slice; first slice stores manual observations and current URL/timestamp capture only.
- Price prediction, deal recommendations, competitor analytics, affiliate automation, or resale of Temu data.
- Claims of Temu partnership, approval, certification, or official data access.

## Constraints

- Observations must be user-initiated or manually entered in the first implementation slice.
- UI copy must say "observé", "dernier état observé", or "rappel de vérification"; it must not say "surveillance live", "stock en temps réel", or "alerte automatique Temu" unless a future approved API spec changes the contract.
- Observation history is capped to 50 records per product in the first slice; after a successful append, prune oldest records beyond the cap.
- Do not store Temu cookies, account sessions, passwords, addresses, payment pages, checkout content, order history, or browser profile data.
- Do not introduce stealth, anti-bot bypass, webdriver masking, proxy rotation, CAPTCHA bypass, or hidden automation.
- Do not alter Temu price display, shipping fees, warnings, seller identity, delivery promises, checkout content, or brand identity.
- Saved snapshots remain local-first and readable even if observations fail.
- Cloud sync must preserve local-first behavior and fail closed behind existing entitlement gates.
- Fresh-docs verdict: `fresh-docs checked` using official Temu Terms, Temu Partner Platform public pages, Temu Partner Platform Terms PDF, and local project docs as of 2026-06-11.

## Test Contract

Surface: Vue 3 + Pinia persisted state + Tauri Android WebView app, with local-first product snapshots, optional premium cloud-sync queue, and Android native WebView bottom-bar controls.

proof_profile: mixed automated + CI Android build + real-device smoke proof.

proof_order: automated TS/Vue checks -> policy scan -> GitHub Actions Blacksmith Android debug APK build -> real-device manual checklist.

checklist_path: `shipflow_data/workflow/test-checklists/temu-price-availability-observations.md`

required_scenario_ids: `TC-OBS-001`, `TC-OBS-002`, `TC-OBS-003`, `TC-OBS-004`, `TC-OBS-005`, `TC-OBS-006`, `TC-OBS-007`.

required_results:

- Observation history persists only after explicit user action or manual edit.
- WebView action captures current product URL and opens/links the manual observation flow; it does not parse Temu DOM price/stock in the first slice.
- Reminder preference produces in-app due badges only; it does not request Android notification permission in the first slice.
- Invalid URLs, parser gaps, and page failures never overwrite archived title/image/URL data.
- Backup/restore and premium sync queue remain backward compatible and entitlement-gated.
- Policy scan finds no scraper, crawler, stealth, proxy rotation, CAPTCHA bypass, cookie export, account export, checkout capture, order capture, background Temu fetch, or live-monitoring claim in active implementation code.

Required automated proof:

- `pnpm typecheck`
- `pnpm lint:check`
- `pnpm test:once`
- `pnpm build`
- focused tests for observation validators and product snapshot store behavior
- focused tests for backup/restore compatibility if observations enter export payloads
- focused tests for cloud sync queue behavior if observation records sync

Required Android proof:

- GitHub Actions Blacksmith debug APK build for the implementation commit.
- Real-device smoke test for explicit observation action from product detail or WebView menu.
- Verify no observation is created by background app start, route navigation, or passive WebView page load.

Manual checklist path:

- `shipflow_data/workflow/test-checklists/temu-price-availability-observations.md`

Manual scenarios:

- `TC-OBS-001`: saved product detail shows no false stock claim when no observation exists.
- `TC-OBS-002`: user manually records availability and price, then reloads app and sees the observation.
- `TC-OBS-003`: user triggers observation from the current visible WebView product page, the current URL is captured, and the manual observation flow updates the last-observed timestamp after explicit save.
- `TC-OBS-004`: failed/invalid URL observation does not mutate saved snapshot.
- `TC-OBS-005`: local reminder preference can be enabled/disabled and shows due badges without requesting Android notification permission.
- `TC-OBS-006`: no background refresh happens after app restart or navigation.
- `TC-OBS-007`: policy scan finds no crawler/scraper/stealth/proxy/CAPTCHA bypass code paths.

Exception with proof:

- If price/availability cannot be extracted from the visible WebView safely, keep manual observations plus reminder UI only and record parser extraction as a future task.
- If Android notification delivery is requested during implementation, stop and split it into a separate spec; first slice allows only in-app reminder due state.

Exception without proof:

- Do not mark ready/implemented if the spec or implementation promises live monitoring without an approved API path.
- Do not mark implemented if any background Temu page fetching exists.
- Do not mark implemented if observation failures can overwrite archived product details.

## Dependencies

- Existing product snapshot model in `src/types/domain.ts` and `src/stores/productSnapshots.ts`.
- Existing list model in `src/stores/shoppingLists.ts`.
- Existing WebView capture bridge in `src/lib/temuWebview.ts`, `src/ui/temu-shell/App.vue`, and `src-tauri/plugins/android-temu-webview/`.
- Existing cloud sync queue in `src/lib/cloudSync.ts` and related tests.
- Existing backup validation in `src/lib/backup.ts` and `src/lib/validators.ts`.
- Project docs in `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` and `shipflow_data/technical/platforms/android.md`.
- Exploration report `explorations/2026-06-11-temu-api-policy-price-availability.md`.
- Official external docs checked 2026-06-11:
  - Temu Terms of Use: `https://www.temu.com/terms-of-use.html`
  - Temu Partner Platform: `https://partner.temu.com/`
  - Temu Partner Platform Terms PDF: `https://partner.temu.com/protocol/temu_partner_platform_terms_20250523.pdf`
  - Temu Affiliate Program: `https://www.temu.com/affiliate_recruit.html`

## Invariants

- Archived product details survive independently of observation history.
- Observation history is personal user data, not a public Temu data corpus.
- A missing observation is not an availability claim.
- `unknown` remains the safe fallback state.
- Refresh actions are explicit, visible, and user-initiated.
- No Temu account/session/cookie/browser-profile data syncs to cloud.
- No implementation path uses scraping/stealth/bypass techniques.

## Links & Consequences

- Product: improves trust by showing last-observed state without overpromising live data.
- UX: user must understand the difference between "saved product snapshot", "last observed availability", and "reminder to check".
- Data: introduces an append-only or bounded observation history that may need backup/sync compatibility.
- Privacy: observations can reveal shopping intent; local-first and entitlement-gated sync must remain clear.
- Policy: the implementation must avoid automated crawling and public-data harvesting.
- Android: WebView observation actions need real-device proof because local web proof cannot prove native menu behavior.
- Docs: README and technical docs must explain observation scope and non-affiliation/non-live-monitoring limits.

## Documentation Coherence

Update after implementation:

- `README.md`: describe last-observed price/availability and clarify no live Temu monitoring.
- `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`: document observation model, local-first storage, sync posture, and policy guardrails.
- `shipflow_data/technical/platforms/android.md`: document any Android notification/reminder behavior and WebView menu action.
- `shipflow_data/workflow/test-checklists/temu-price-availability-observations.md`: create manual checklist.
- Any user-facing UI strings must use French, natural wording, and avoid "live" claims.

## Edge Cases

- Product has multiple variants with different stock/price.
- Temu shows coupons, discounts, shipping fees, or bundles that look like price but are not product price.
- Product page requires login or locale-specific rendering.
- Product page returns an error, redirect, "removed", or anti-bot interstitial.
- User observes the same product from two lists.
- User observes the same product twice with identical data.
- User manually enters a price in the wrong currency.
- Product snapshot is deleted while observation history still references it.
- Cloud sync replays an old observation after a newer local observation.
- Notification permission is denied.
- Device is offline when the user records a manual observation.

## Implementation Tasks

1. Define observation domain types.
   - Target files: `src/types/domain.ts`, `src/lib/validators.ts`.
   - Action: add `ProductObservation`, observation source/status/confidence types, optional `low_stock` availability state, `manual_required` status, and validation rules for price/currency/timestamps/source.
   - Validation: validator tests reject malformed prices, unsafe source values, invalid timestamps, and invalid availability states.

2. Add product observation store.
   - Target files: `src/stores/productObservations.ts`, `src/stores/productObservations.test.ts`.
   - Action: create append/dedupe/getLatest/getHistory/delete-by-snapshot helpers, cap retained observations at 50 per product, persist locally, and queue sync only when existing sync session gates are active.
   - Validation: tests cover append, latest sorting, dedupe, pruning beyond 50 records, deletion, local-only queue absence, and sync queue presence when enabled.

3. Integrate observations with product snapshots.
   - Target files: `src/stores/productSnapshots.ts`, `src/stores/localPersistence.test.ts`, `src/stores/cloudSyncStoreIntegration.test.ts`.
   - Action: update current snapshot fields from latest valid observation only when safe, while preserving archived title/images/URL.
   - Validation: failed observation does not overwrite snapshot; duplicate product observations do not create duplicate list items.

4. Add manual observation UI.
   - Target files: `src/pages/ProductDetailPage.vue`, possibly new `src/components/ProductObservationForm.vue`.
   - Action: show last observed price/availability/timestamp, bounded history, and a manual edit form using French user-facing strings such as "Dernière observation", "Dernier prix observé", and "Mettre à jour l'observation".
   - Validation: component/store tests or focused Vue tests cover saving and rendering observation states.

5. Add explicit WebView observation action.
   - Target files: `src/ui/temu-shell/App.vue`, `src/lib/temuWebview.ts`, `src-tauri/plugins/android-temu-webview/android/src/main/java/com/temushoppinglists/temuwebview/TemuWebViewPlugin.kt`.
   - Action: add a native menu action such as `Observer ce produit` that captures only the current visible product URL, finds or links the saved snapshot by canonical URL/product ID, and opens the manual observation flow. Do not parse Temu DOM price/stock in this slice.
   - Validation: bridge tests cover event payloads; Android compile passes; manual device checklist covers action.

6. Add reminder preference.
   - Target files: `src/types/domain.ts`, `src/stores/productObservations.ts`, product detail UI.
   - Action: store local reminder preference and next-check due date; render in-app due badges on product/list views. Do not implement Android OS notification delivery, cloud push, or background crawling.
   - Validation: tests cover enable/disable and due-state calculation without notification permission request.

7. Update backup/export and optional sync.
   - Target files: `src/lib/backup.ts`, `src/lib/validators.ts`, sync queue/domain types, related tests.
   - Action: include retained observation records only as bounded user data, with backward-compatible parsing for backups that lack observations.
   - Validation: backup parse accepts old payloads and validates new observation payloads.

8. Add policy guardrails and docs.
   - Target files: `README.md`, `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`, `shipflow_data/technical/platforms/android.md`, manual checklist.
   - Action: document "last observed" behavior, no live monitoring, no scraping, no official Temu affiliation.
   - Validation: docs metadata lint and focused grep for forbidden claims.

9. Validate.
   - Target commands: `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, `pnpm build`, Android Kotlin compile or CI Blacksmith APK build.
   - Action: run local checks and route Android proof to CI/device; record any real-device proof gaps for `/103-sf-verify`.
   - Validation: all required checks pass or proof gaps are recorded for `/103-sf-verify`.

## Acceptance Criteria

- [ ] AC1: A saved product can show no observation without implying stock status.
- [ ] AC2: A user can manually record price and availability for a saved product.
- [ ] AC3: Observation history stores timestamp, source, availability, price when available, and confidence/status.
- [ ] AC4: Latest observation is visible on product detail and list cards where practical.
- [ ] AC5: Observation failures never delete or overwrite archived snapshot details.
- [ ] AC6: Duplicate observations are deduped or coalesced predictably.
- [ ] AC7: A WebView action can explicitly capture the current visible product URL and start the manual observation flow without DOM parsing.
- [ ] AC8: Reminder preference exists as in-app due state without claiming live monitoring, Android OS notification delivery, or background Temu refresh.
- [ ] AC9: Backup/restore remains backward compatible with backups that do not contain observations.
- [ ] AC10: Cloud-sync queue behavior remains fail-closed behind existing sync/entitlement gates.
- [ ] AC11: Docs and UI copy avoid live monitoring, official API, or Temu partnership claims.
- [ ] AC12: Policy scan shows no scraper, crawler, stealth, proxy rotation, CAPTCHA bypass, cookie export, account export, checkout capture, or order capture code.

## Test Strategy

Proof path: regression-first plus evidence-first.

1. Add unit tests for validators and observation store before or with implementation.
2. Add integration tests for product snapshots, shopping lists, backup, and cloud sync queue.
3. Run full local web checks: `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, `pnpm build`.
4. Run focused policy grep:
   - no `scrape`, `crawler`, `stealth`, `proxy`, `captcha`, `webdriver`, `cookie export`, `order history`, `checkout capture` in active Temu observation code except docs/tests that assert prohibition.
   - no background Temu fetch, DOM price parser, Android notification permission request, or live monitoring claim in active first-slice code.
5. Build Android debug APK through GitHub Actions Blacksmith.
6. Run real Android manual checklist for WebView observation action and reminder UI.

## Risks

- High policy risk if implementation drifts into background monitoring.
- High UX risk if users believe the data is live when it is only last observed.
- Medium data risk from syncing shopping-intent observations across devices.
- Medium technical risk from parsing visible page data if added too early.
- Medium Android proof risk because native WebView/menu behavior needs real-device validation.
- Low migration risk if observation history is additive and backup parser remains backward compatible.

## Execution Notes

- Read first: `src/types/domain.ts`, `src/stores/productSnapshots.ts`, `src/stores/shoppingLists.ts`, `src/lib/backup.ts`, `src/lib/validators.ts`, `src/lib/cloudSync.ts`, `src/ui/temu-shell/App.vue`, `src/lib/temuWebview.ts`, and `src-tauri/plugins/android-temu-webview/android/src/main/java/com/temushoppinglists/temuwebview/TemuWebViewPlugin.kt`.
- Use "observation" wording throughout implementation.
- Prefer manual observation and URL-based WebView capture first; DOM parsing for price/stock should be a separately gated task if the safe parser path is unclear.
- Retention cap: keep at most 50 observations per product in the first slice, prune oldest after append, and ensure backup/sync only transports retained records.
- Stop conditions: any background Temu fetch, automatic DOM parser for price/stock, scraper API, official API integration, Android OS notification delivery attempt, stealth/bypass tooling, or live monitoring copy requires a separate spec before implementation continues.
- Validation commands: `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, `pnpm build`, focused policy grep, and CI Blacksmith Android debug APK build.
- If a future official Temu API route is pursued, create a separate high-risk spec requiring fresh official Partner Platform docs, permitted-use proof, app/account review, data-protection review, and no hidden assumption that API access exists.
- Do not edit `TASKS.md` in this skill run; `TASK-2026-06-10-013` remains the existing operational pointer.
- Development mode is hybrid: local TS/Vue checks are authoritative; Android native proof is CI-first on GitHub Actions Blacksmith plus real-device smoke.

## Open Questions

None. First-slice decisions are locked: reminders are in-app due badges only, WebView action captures current URL and opens manual observation only, no Temu DOM price/availability extraction is attempted, and observation history is capped at 50 records per product.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-11 01:30:37 UTC | 100-sf-spec | GPT-5 Codex | Created draft spec from Temu API/policy exploration and existing product-history task. | draft | /101-sf-ready Price and availability observations for saved Temu products |
| 2026-06-11 01:42:40 UTC | 101-sf-ready | GPT-5 Codex | Reviewed readiness, resolved first-slice scope decisions, hardened proof, security, language, and test contracts. | ready | /102-sf-start Price and availability observations for saved Temu products |
| 2026-06-11 02:00:51 UTC | 102-sf-start | GPT-5 Codex | Implemented bounded observations, manual product-detail UI, WebView observe handoff, backup/sync queue support, docs, checklist, and local proof. | implemented | /103-sf-verify Price and availability observations for saved Temu products |
| 2026-06-11 02:27:43 UTC | 103-sf-verify | GPT-5 Codex | Verified local checks, metadata, policy scan, docs coherence, and checklist status; Android CI/device proof remains missing. | partial | /005-sf-ship then sf-ci-build and 107-sf-test Android price/availability observations |

## Current Chantier Flow

100-sf-spec ✅ -> 101-sf-ready ✅ -> 102-sf-start ✅ -> 103-sf-verify ⚠️ -> 104-sf-end ⏳ -> 005-sf-ship ⏳
