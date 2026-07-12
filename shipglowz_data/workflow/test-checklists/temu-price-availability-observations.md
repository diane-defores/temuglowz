---
artifact: manual_test_checklist
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-11"
updated: "2026-06-11"
status: draft
source_skill: 102-sf-start
scope: "temu-price-availability-observations"
owner: "Diane"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
target_scope: "Saved product price and availability observations"
stack_profile: "Vue 3 + Pinia persisted state + Tauri 2 Android WebView"
proof_profile: "automated store/validator checks, policy scan, Blacksmith Android debug build, and real-device WebView smoke"
linked_systems:
  - "shipglowz_data/workflow/specs/temu-price-availability-observations.md"
  - "app/src/stores/productObservations.ts"
  - "app/src/app-pages/ProductDetailPage.vue"
  - "app/src/app-pages/ListDetailPage.vue"
  - "app/src-tauri/plugins/android-temu-webview"
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-price-availability-observations.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "Spec requires explicit user-initiated observations, no background monitoring, no DOM price/stock parsing, and no Android notification delivery in the first slice."
next_step: "/103-sf-verify Price and availability observations for saved Temu products"
---

# Temu Price And Availability Observations - Test Checklist

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-OBS-001 | Product detail | Saved product with no observation | yes | UI says no observation/unknown; it does not imply sold out | NOT_RUN | Pending verification | product detail screenshot or manual note | Missing observation is not an availability claim |  |
| TC-OBS-002 | Product detail | User manually records availability and price, then reloads app | yes | Last observed state, price, timestamp, and history remain visible | NOT_RUN | Pending verification | device/manual note plus persisted state proof | Use French UI copy with accents |  |
| TC-OBS-003 | Android WebView | User taps `Observer ce produit` from current saved product URL | yes | Current URL is captured, `manual_required` observation is created, product detail opens, and timestamp updates after explicit save | NOT_RUN | Pending Android proof | Blacksmith APK + real-device note | URL-only; no DOM extraction |  |
| TC-OBS-004 | Android WebView | User triggers observation from invalid/non-product URL | yes | No observation mutates snapshot; user gets recoverable flow or no-op | NOT_RUN | Pending Android proof | manual note | Must not overwrite archived details |  |
| TC-OBS-005 | Reminder UI | User enables/disables reminder preference | yes | In-app due badge appears after due time; no Android notification permission is requested | NOT_RUN | Pending verification | UI/manual note | OS notifications are out of scope |  |
| TC-OBS-006 | App lifecycle | Restart app and navigate WebView sessions without touching observation controls | yes | No background observation or refresh is created | NOT_RUN | Pending verification | queue/store inspection | Passive page load must not create records |  |
| TC-OBS-007 | Policy scan | Check active code for prohibited automation | yes | No crawler/scraper/stealth/proxy/CAPTCHA bypass/background Temu fetch/live-monitoring implementation paths | NOT_RUN | Pending command output | focused `rg` scan | Docs/tests may mention prohibited terms only to assert bans |  |

## Automated Proof

- `pnpm typecheck`
- `pnpm lint:check`
- `pnpm test:once`
- `pnpm build`
- Focused tests:
  - `app/src/lib/validators.test.ts`
  - `app/src/stores/productObservations.test.ts`
  - `app/src/stores/localPersistence.test.ts`
  - `app/src/stores/cloudSyncStoreIntegration.test.ts`
  - `app/src/lib/temuWebview.test.ts`

## Safety Notes

- Do not record Temu cookies, passwords, account pages, addresses, checkout content, order history, or payment details in evidence.
- The observation action is user-triggered and URL-only in the first slice.
- Do not claim live monitoring, real-time stock, automatic Temu alerts, official API access, certification, or partnership.
- If Android device proof is unavailable, keep TC-OBS-003 to TC-OBS-006 as `NOT_RUN` and route to `/103-sf-verify` plus CI/device proof.
