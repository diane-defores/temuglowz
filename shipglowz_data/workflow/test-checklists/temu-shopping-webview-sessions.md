---
artifact: manual_test_checklist
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-start
scope: "temu-shopping-webview-sessions"
owner: "unknown"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
target_scope: "Android native Temu WebView shopping sessions"
stack_profile: "Vue 3 + Tauri 2 Android + Kotlin WebView plugin + Pinia persisted state"
proof_profile: "automated TypeScript/store/bridge checks, Android debug build proof, and real-device WebView capture smoke"
linked_systems:
  - "shipglowz_data/workflow/specs/temu-shopping-webview-sessions.md"
  - "app/src-tauri/plugins/android-temu-webview"
  - "app/src/stores/shoppingSessions.ts"
  - "app/src/lib/temuWebview.ts"
  - "app/src/app-pages/ShoppingDashboardPage.vue"
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "ready"
supersedes: []
evidence:
  - "Spec requires native Android WebView evidence before claiming the in-app shopping flow is complete."
next_step: "/sf-verify Temu in-app WebView shopping sessions"
---

# Temu Shopping WebView Sessions - Test Checklist

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-WV-AUTO-001 | TypeScript | Typecheck for stores, bridge, routes, and capture flow | yes | `pnpm typecheck` exits 0 | NOT_RUN | Pending implementation validation | command output | Required before sf-verify |  |
| TC-WV-AUTO-002 | Store | Shopping session create, rename, close, switch, and persistence behavior | yes | Unit tests pass; no cloud queue is used for session state | NOT_RUN | Pending implementation validation | `app/src/stores/shoppingSessions.test.ts` | Local-only invariant |  |
| TC-WV-AUTO-003 | Capture validation | Unsafe/non-Temu URLs rejected; valid Temu product URLs route to import | yes | Unit tests pass | NOT_RUN | Pending implementation validation | `app/src/lib/temuWebview.test.ts`; URL tests | Must reject dangerous schemes |  |
| TC-WV-AUTO-004 | Settings | Dark mode and text zoom persist and emit native bridge commands | yes | Unit tests pass | NOT_RUN | Pending implementation validation | `app/src/stores/shoppingSessions.test.ts`; `app/src/lib/temuWebview.test.ts` | Accessibility setting |  |
| TC-WV-AUTO-005 | Duplicate capture | Existing duplicate resolution still works after WebView source is added | yes | Existing import/list tests still pass | NOT_RUN | Pending regression validation | `app/src/stores/localPersistence.test.ts` | No duplicate bypass |  |
| TC-WV-ANDROID-001 | Android build | Debug build succeeds with Temu WebView plugin registered | yes | Android APK builds; plugin module compiles | NOT_RUN | Pending Android build | GitHub Actions or local command output | Local environment may be blocked by NDK host mismatch |  |
| TC-WV-MANUAL-001 | Android device | Create first shopping session and load Temu | yes | Temu opens in native WebView with bottom bar visible | NOT_RUN | Device proof pending | photo/screenshot or test note | Do not enter credentials into logs/screenshots |  |
| TC-WV-MANUAL-002 | Android device | Create two sessions, rename them, switch between them | yes | Names persist; switching keeps or reloads safe current URL without losing saved products | NOT_RUN | Device proof pending | manual QA note | Multi-profile may degrade to single-WebView with proof |  |
| TC-WV-MANUAL-003 | Android device | Bottom bar home, back, forward, refresh, and close controls | yes | Controls respond; close does not delete saved products | NOT_RUN | Device proof pending | manual QA note |  |  |
| TC-WV-MANUAL-004 | Android device | Dark mode changes bottom bar and WebView best-effort rendering | yes | Bottom bar updates and page remains usable | NOT_RUN | Device proof pending | screenshot/test note | Mark degraded if Temu page renders poorly |  |
| TC-WV-MANUAL-005 | Android device | Text zoom changes visible page text without crash | yes | Text size changes and WebView remains navigable | NOT_RUN | Device proof pending | manual QA note |  |  |
| TC-WV-MANUAL-006 | Android device | Capture current product URL into Cuisine | yes | Import review/list save succeeds; product appears in list and product detail | NOT_RUN | Device proof pending | manual QA note | URL-first capture only |  |
| TC-WV-MANUAL-007 | Android device | Capture on non-product Temu page | yes | Recoverable message; browsing session remains active; no product saved | NOT_RUN | Device proof pending | manual QA note |  |  |

## Safety Notes

- Do not record Temu cookies, passwords, account pages, addresses, checkout content, or payment details in evidence.
- If Temu blocks embedded WebView browsing, record the exact degraded state and prove manual/share import still works.
- If `WebViewFeature.MULTI_PROFILE` is unavailable, mark session isolation degraded and verify single-WebView capture still works.
- This app is independent from Temu and must not claim partnership, certification, or authorization.
