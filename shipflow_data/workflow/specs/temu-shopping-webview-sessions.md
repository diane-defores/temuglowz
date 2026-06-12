---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-10"
created_at: "2026-06-10 18:03:26 UTC"
updated: "2026-06-10"
updated_at: "2026-06-10 19:23:47 UTC"
status: implemented
source_skill: sf-spec
source_model: "GPT-5 Codex"
scope: "in-app Temu WebView shopping sessions"
owner: "unknown"
confidence: high
user_story: "En tant qu'acheteur Temu, je veux ouvrir Temu dans plusieurs sessions de shopping WebView nommees et enregistrer la page produit courante dans mes listes, afin de faire mon shopping directement dans l'app tout en gardant des snapshots durables."
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - "Tauri v2 Android"
  - "Android native WebView"
  - "AndroidX WebKit"
  - "Vue 3"
  - "Pinia persisted state"
  - "Temu product pages"
  - "Local product snapshots"
  - "Convex sync queue"
  - "SocialGlowz native WebView code at /home/claude/socialglowz"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-premium-cloud-sync.md"
    artifact_version: "unknown"
    required_status: "draft"
  - artifact: "Tauri Mobile Plugin Development docs"
    artifact_version: "accessed 2026-06-10"
    required_status: "reviewed"
  - artifact: "Android WebSettings API reference"
    artifact_version: "accessed 2026-06-10"
    required_status: "reviewed"
  - artifact: "AndroidX WebViewCompat API reference"
    artifact_version: "accessed 2026-06-10"
    required_status: "reviewed"
supersedes: []
evidence:
  - "User decision 2026-06-10: reuse the SocialGlowz-style dashboard with multiple WebViews, bottom bar, dark mode, text size controls, and shopping sessions."
  - "Current Temu app is Vue 3, Vite, Tauri 2 Android, Pinia, PrimeVue, Convex-ready, local-first product snapshots."
  - "/home/claude/socialglowz/src-tauri/plugins/android-webview contains a reusable Android WebView plugin with Kotlin commands, pooled session hosts, bottom bar, dark mode, grayscale, haptics, tap sound, and text zoom."
  - "SocialGlowz NativeWebViewPlugin.kt exposes DarkModeArgs, TextZoomArgs, SetProfilesArgs, SessionWebViewHost, buildBottomBar, setDarkMode, setTextZoom, and WebViewCompat.setProfile usage."
  - "No /home/claude/*wispr* or /home/claude/*whisper* repository was found during local discovery; SocialGlowz is the available codebase matching the requested WebView capabilities."
  - "sf-start 2026-06-10 implemented the Android plugin scaffold, TS shopping session store/bridge, Shopping dashboard, WebView capture import source, README docs, and manual checklist."
  - "sf-start automated proof passed: pnpm lint:check, pnpm typecheck, pnpm typecheck:convex, pnpm test:once, pnpm build, and forbidden SocialGlowz/cookie script grep."
  - "sf-start Android local build proof is environment-blocked before APK output: Android NDK clang binary is linux-x86_64 on an aarch64 host and exits with Exec format error."
  - "Official Tauri docs confirm Android mobile plugins are Kotlin Plugin classes with @Command methods callable from Rust or JavaScript."
  - "Official Android WebSettings docs confirm WebView settings are tied to the WebView lifecycle and include text zoom and related WebView controls."
  - "Official AndroidX WebViewCompat docs expose setProfile/getProfile APIs used by SocialGlowz for profile-backed WebView isolation when supported."
next_step: "/sf-verify Temu in-app WebView shopping sessions"
---

# Title

Temu In-App WebView Shopping Sessions

## Status

Implemented for the first local slice. This spec records the product decision to make the app behave like the SocialGlowz WebView shell for shopping: a dashboard of named Temu sessions, native bottom bar controls, display settings, and a capture action that saves the current Temu product into the user's local lists.

## User Story

En tant qu'acheteur Temu, je veux ouvrir Temu dans plusieurs sessions de shopping WebView nommees et enregistrer la page produit courante dans mes listes, afin de faire mon shopping directement dans l'app tout en gardant des snapshots durables.

Primary actor: Android user shopping on Temu inside the app.

Trigger: the user creates or opens a shopping session from the dashboard, navigates Temu in the embedded WebView, and taps "save current product" from the bottom bar or overlay.

Observable result: the app records the current Temu URL into an import review or direct list-save flow, creates a product snapshot, and keeps the WebView session available for continued browsing.

## Minimal Behavior Contract

The app provides a native Android WebView dashboard where the user can create, rename, switch, and close multiple Temu shopping sessions. Each session opens Temu in an app-owned WebView host, keeps its own navigation state, and exposes a native bottom bar for returning home, switching sessions, saving the current product URL to a list, toggling dark mode, and changing text size. When capture fails or the current page is not a valid Temu product URL, the app keeps browsing intact and offers manual import with the current URL if available. The easy-to-miss edge case is session privacy: session cookies and WebView state must not be exported to cloud sync or logs, while product URLs saved by the user may sync through the existing premium cloud-sync path.

## Success Behavior

- Given no shopping session exists, when the user opens the shopping dashboard, then the app offers to create a first session named "Shopping 1" or a custom name.
- Given a session exists, when the user opens it, then Temu loads inside a native WebView with the app bottom bar visible.
- Given several sessions exist, when the user switches sessions, then the previous WebView is hidden or paused and the target session resumes without destroying the user's current navigation unless Android memory pressure requires it.
- Given the user renames a session to "Cuisine" or "Voiture", when they return to the dashboard, then the session name persists locally.
- Given the user taps the capture/save action on a valid Temu product page, then the app extracts at least the current URL and opens the existing import review flow with source `webview`.
- Given the user chooses a list during capture, then the saved product appears in that list and remains readable through the existing product snapshot screens.
- Given dark mode is enabled, then the native bottom bar and WebView rendering use dark-mode best effort, and the setting persists.
- Given text zoom changes, then active and future WebViews apply the selected level.
- Given the app is offline, then existing local sessions can still be listed and saved snapshots remain readable; new navigation may fail as normal WebView network behavior.

## Error Behavior

- Non-Temu URL: the capture action rejects it as not saveable and offers manual copy/import only if the URL is safe to display.
- Non-product Temu page: the capture action keeps the user in browsing mode and explains that only product-like URLs can be saved.
- WebView unavailable: the dashboard falls back to manual import/share flows and shows a clear degraded state.
- WebView profile isolation unavailable: the app uses a single WebView fallback, labels session isolation as degraded internally, and does not claim separate Temu accounts are isolated.
- WebView crash or renderer kill: the session is marked recoverable and can reload the last safe URL; saved products are not affected.
- Capture bridge failure: the bottom bar capture action opens the manual import review with the current URL if the native plugin can read it; otherwise it reports no URL captured.
- Invalid URL content: reject `javascript:`, `file:`, `data:`, `intent:`, localhost/private-network, malformed, and non-HTTP(S) URLs.
- Cloud sync unavailable: session metadata and product snapshots remain local; only validated product/list records enter the sync queue.
- User closes a session: the app destroys the active WebView host after confirmation, but does not delete saved product snapshots.

## Problem

The current MVP lets users save Temu products through manual URL entry and Android share payloads. That preserves products but forces the user to leave the shopping flow. The desired product behavior is closer to SocialGlowz: a dedicated app shell where the user can browse the target service in WebViews, keep several contexts open, and use native controls around those WebViews.

## Solution

Reuse the SocialGlowz Android WebView plugin architecture and adapt it for a Temu-only shopping dashboard. Social network concepts become shopping sessions; the network bottom bar becomes a session/navigation/capture bar; profile menu concepts become optional session/account isolation internals rather than a visible "profile" product unless we later need multi-account support.

The first implementation should copy the proven WebView scaffolding but remove SocialGlowz-specific social network lists, stealth/anti-bot scripts, cookie auto-acceptance, social app-banner handling, and any claim that modifies or partners with Temu. The app should own the shell around Temu, not pretend to be Temu or alter checkout-critical content.

## Scope In

- New in-app "Shopping" dashboard route.
- Shopping session model: id, name, startUrl, currentUrl, lastCapturedUrl, createdAt, updatedAt, lastActiveAt, displayOrder, optional color/icon.
- Create, rename, switch, close, and persist shopping sessions locally.
- Android native WebView plugin adapted from SocialGlowz.
- Multiple managed WebView hosts where supported.
- WebView host pooling with fallback to single-host mode when AndroidX WebKit profile support is unavailable.
- Native bottom bar for home/dashboard, back, forward, refresh, session switcher, capture current product, dark mode, and text zoom.
- App-owned overlay or sheet for choosing the target shopping list after capture.
- Capture current URL from WebView and route into the existing import review/product snapshot flow.
- Dark mode setting applied to bottom bar and WebView best-effort rendering.
- Text zoom setting applied to all active and future WebViews.
- Real-device Android smoke checklist for WebView browsing, session switching, and capture.
- Documentation that the app is independent from Temu and uses user-initiated browsing/capture only.

## Scope Out

- Official Temu partnership, certification, affiliation, or public authorization claims.
- Automated cart scraping, background crawling, mass data extraction, or unattended product harvesting.
- Anti-bot evasion, fingerprint spoofing, or stealth script reuse from SocialGlowz.
- Modifying checkout, price display, fees, warnings, seller identity, delivery promises, login flows, or payment flows inside Temu.
- Injecting a fake Temu UI into the page DOM for v1.
- Exporting or syncing Temu cookies, login sessions, localStorage, IndexedDB, passwords, or account state.
- iOS WebView implementation for this chantier.
- Price-history automation; keep it in backlog for a later product-history chantier.

## Constraints

- The UI must state or imply independence from Temu, not partnership.
- Capture is user-triggered only.
- Product/list records may sync; WebView session cookies and auth state must not sync.
- Session metadata may be local-only in v1 unless explicitly added to premium sync later.
- Reuse SocialGlowz code as implementation source, but rename packages, commands, events, and product language for Temu.
- Remove or disable stealth, cookie-auto-accept, and social-network-specific scripts before shipping.
- WebView commands must run on the Android UI thread.
- WebView settings and plugin calls must account for destroyed WebViews throwing lifecycle errors.
- Android version/WebKit feature checks must guard profile pooling and document-start script usage.
- The existing manual import and share-intent flows remain valid fallback paths.
- User-facing French copy must be natural and accented where the app is French; internal spec headings, YAML keys, command names, acceptance criteria IDs, and technical identifiers remain stable English.
- Local versions influencing implementation: Tauri Rust `2.11.0`, `@tauri-apps/api` `^2.3.0`, `@tauri-apps/cli` `^2.8.4`, current Android generated app `androidx.webkit:webkit:1.14.0`, SocialGlowz source plugin `androidx.webkit:webkit:1.12.1`.

## Test Contract

Surface: Android app using Vue 3, Vite, TypeScript, Tauri 2, Kotlin Android plugin, Android native WebView, AndroidX WebKit, Pinia persisted state, product snapshot stores, and optional Convex sync queue.

Proof profile: automated unit/type tests for session stores, URL validation, capture routing, and settings persistence; Android build proof; real Android device proof for WebView browsing and capture.

Checklist path: `shipflow_data/workflow/test-checklists/temu-shopping-webview-sessions.md`.

Required scenario IDs:

- `TC-WV-AUTO-001`: TypeScript typecheck for new stores, bridge, routes, and capture flow.
- `TC-WV-AUTO-002`: shopping session store create, rename, close, switch, and persistence behavior.
- `TC-WV-AUTO-003`: capture URL routing rejects unsafe/non-Temu URLs and accepts valid Temu product URLs.
- `TC-WV-AUTO-004`: text zoom and dark mode settings persist and emit native bridge commands.
- `TC-WV-AUTO-005`: duplicate product capture reuses the existing duplicate resolution behavior.
- `TC-WV-ANDROID-001`: Android debug build succeeds with the adapted plugin.
- `TC-WV-MANUAL-001`: create first shopping session and load Temu.
- `TC-WV-MANUAL-002`: create two sessions, rename them, switch between them, and keep navigation state.
- `TC-WV-MANUAL-003`: bottom bar home, back, forward, refresh, and close controls work.
- `TC-WV-MANUAL-004`: dark mode changes bottom bar and WebView best-effort rendering.
- `TC-WV-MANUAL-005`: text zoom changes visible page text without layout crash.
- `TC-WV-MANUAL-006`: capture current product URL into "Cuisine" and verify product appears in the list.
- `TC-WV-MANUAL-007`: capture on a non-product Temu page is rejected without losing the browsing session.

Required results:

- The app builds and runs on Android with the WebView plugin registered.
- User can browse Temu inside the app through at least one WebView.
- User can maintain multiple named shopping sessions when Android profile pooling is supported.
- Degraded single-WebView mode is explicit in logs and does not corrupt saved products.
- Capture action saves only user-selected product/list data, not cookies/session state.
- Dark mode and text zoom are functional and persistent.
- No SocialGlowz social-network copy, anti-detection script, or partner/affiliation claim remains in user-facing surfaces.

Proof order:

1. Unit tests and typecheck.
2. Android plugin compile/build.
3. Local app smoke for dashboard/session store.
4. Real Android WebView browsing smoke.
5. Capture-to-list real-device smoke.
6. Regression check for existing manual import/share flows.

Exception with proof:

- Real-device Temu browsing may be marked blocked only with device model, Android version, app build artifact, exact WebView error/degraded state, and confirmation that manual/share import still works.
- Multi-session profile isolation may be marked degraded only when `WebViewFeature.MULTI_PROFILE` is unavailable or `WebViewCompat.setProfile` fails; the proof must include log evidence and a successful single-WebView capture path.
- Android CI artifact proof can substitute for local Android build proof only when the GitHub Actions run, APK artifact name, and commit SHA are recorded.

Exception without proof:

- Do not claim ready or shipped if the plugin compiles only on desktop/web, if capture has not been tested on Android, or if SocialGlowz stealth/cookie automation remains in the copied Temu plugin.

## Dependencies

- Existing product snapshot/import flow in `src/stores/productSnapshots.ts`, `src/stores/shoppingLists.ts`, `src/pages/ImportReviewPage.vue`, and `src/lib/importParser.ts`.
- Existing local-first persistence and sync queue integration.
- SocialGlowz native plugin source:
  - `/home/claude/socialglowz/src-tauri/plugins/android-webview`
  - `/home/claude/socialglowz/src-tauri/src/lib.rs`
  - `/home/claude/socialglowz/src/stores/webviewState.ts`
- Official docs consulted 2026-06-10:
  - Tauri mobile plugin development: `https://v2.tauri.app/develop/plugins/develop-mobile/`
  - Android WebSettings: `https://developer.android.com/reference/android/webkit/WebSettings`
  - AndroidX WebViewCompat: `https://developer.android.com/reference/androidx/webkit/WebViewCompat`
- Fresh-docs verdict: `fresh-docs checked`. Tauri docs confirm Android plugins use Kotlin `Plugin` classes and `@Command` methods; Android WebSettings confirms `setTextZoom(int)` sets page text zoom in percent; AndroidX WebViewCompat confirms profile APIs require `WebViewFeature.MULTI_PROFILE` support and throw when unsupported or used after invalid lifecycle states.

## Invariants

- Saved product snapshots remain readable independent of Temu page availability.
- Manual import and Android share import continue to work.
- WebView session data is not uploaded to Convex.
- User-triggered capture is the only path from Temu browsing into app data.
- The app never claims Temu partnership.
- Native WebView controls must not hide or alter checkout-critical Temu information.

## Links & Consequences

- Product: the app becomes a shopping workspace, not only a list archive.
- Privacy: multi-session WebViews introduce cookie/session handling risk; keep session state local and do not log private data.
- Security: all captured URLs remain untrusted input and pass existing Temu URL validation.
- Performance: multiple WebViews can consume memory; host pooling needs a cap and inactive host cleanup.
- Accessibility: text zoom is a user setting and must be preserved.
- Sync: product/list captures may sync through premium cloud sync; WebView sessions remain local in v1.
- Support/docs: README and test checklist must explain that WebView mode is independent from Temu and may be affected by Temu site changes.

## Documentation Coherence

Update or create:

- `README.md`: describe Shopping dashboard, independent-from-Temu wording, manual/share/WebView import options.
- `shipflow_data/workflow/test-checklists/temu-shopping-webview-sessions.md`: real-device manual proof steps.
- Existing Android checklist: add WebView regression entries or cross-link the new checklist.
- Internal architecture/context docs if present: document copied SocialGlowz plugin boundaries and removed scripts.

No marketing copy should imply affiliation, authorization, or partnership with Temu.

## Edge Cases

- AndroidX WebKit profile support missing or failing at runtime.
- Temu blocks WebView access or redirects to an app/deep link.
- User opens many sessions and Android kills a renderer.
- User logs into Temu in one session and expects isolation in another.
- Capture occurs during redirect or before page URL settles.
- Temu product URL contains tracking params, locale paths, short links, or variant params.
- Text zoom breaks page layout on some Temu pages.
- Dark mode produces unreadable content on a Temu page.
- Existing captured product is duplicated in the target list.
- App update changes plugin command names while persisted sessions exist.

## Implementation Tasks

1. Copy and rename the SocialGlowz plugin scaffold into `src-tauri/plugins/android-temu-webview`.
   - Source: `/home/claude/socialglowz/src-tauri/plugins/android-webview`.
   - Rename Rust crate, plugin name, Kotlin package, event prefixes, and class names for Temu.
   - Preserve command architecture, WebView host lifecycle, bottom bar pattern, text zoom, dark mode, and profile-backed pooling.

2. Remove SocialGlowz-only and unsafe-for-Temu logic from the copied plugin.
   - Remove social network registry, social login fallbacks, app-banner handlers, cookie auto-accept scripts, stealth/fingerprint scripts, social-specific blocked pages, and social debug labels.
   - Keep generic WebView navigation, current URL tracking, back/forward/reload, host pooling, dark mode, and text zoom.

3. Register the plugin in `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`, and Android Gradle/Tauri plugin files.
   - Add Rust extension wrapper commands for opening, hiding, switching, closing, setting dark mode, setting text zoom, and capturing current URL.
   - Keep Android-only commands guarded so desktop/web builds do not fail.

4. Add shopping session domain types.
   - Update `src/types/domain.ts` with `ShoppingSession`, `ShoppingSessionSettings`, and `WebviewCaptureResult`.
   - Add `source: "webview"` to import/snapshot source types where required.

5. Add Pinia stores and tests.
   - Create `src/stores/shoppingSessions.ts`.
   - Persist session metadata locally.
   - Persist global settings for dark mode and text zoom.
   - Tests cover create, rename, close, switch, ordering, settings, and degraded mode flags.

6. Add a WebView bridge module.
   - Create `src/lib/temuWebview.ts`.
   - Wrap Tauri invoke/plugin calls and provide web/desktop no-op fallback results.
   - Normalize native events such as session switched, capture requested, dark mode changed, text zoom changed, and degraded mode.

7. Build the Shopping dashboard UI.
   - Create `src/pages/ShoppingDashboardPage.vue`.
   - Add route in `src/router/index.ts` and navigation entry in `src/App.vue`.
   - Use existing visual system, with session rows/cards, rename controls, launch action, and degraded-state message.

8. Connect native bottom bar capture to the import flow.
   - Add capture handler that reads the current WebView URL.
   - Validate via existing Temu URL utilities.
   - Route valid product URLs into `ImportReviewPage.vue` with `source: "webview"`.
   - For invalid/non-product URLs, show a recoverable message without closing the WebView.

9. Implement app-owned overlay/list chooser.
   - Prefer a Vue/Tauri app sheet launched from capture, not injected into Temu DOM.
   - Allow choosing existing list or creating a list before saving.
   - Keep DOM injection out of v1.

10. Wire dark mode and text zoom settings.
    - Reuse SocialGlowz's native command pattern.
    - Persist settings in Pinia.
    - Apply to active and future WebViews.
    - Reflect changes in the dashboard UI and bottom bar popup.

11. Add build and validation coverage.
    - Add unit tests for sessions, bridge fallbacks, capture validation, and settings.
    - Run `pnpm typecheck`, `pnpm test:once`, and Android build checks.
    - Add manual Android checklist for WebView proof.

12. Update documentation.
    - Update README and checklist.
    - Document non-affiliation with Temu.
    - Document local-only WebView session data and premium sync boundary.

Task validation matrix:

- Tasks 1-3 validate with Android plugin compile/build, `pnpm tauri:android:build`, and a source grep proving removed `STEALTH_SCRIPT`, cookie auto-accept, and social-network-specific handlers are not present in the Temu plugin.
- Tasks 4-6 validate with `pnpm typecheck`, `pnpm test:once`, and targeted tests for `shoppingSessions` and `temuWebview`.
- Tasks 7-10 validate with browser/UI smoke where available, Android real-device smoke, and `TC-WV-MANUAL-001` through `TC-WV-MANUAL-007`.
- Tasks 11-12 validate with checklist creation, README diff review, and regression checks for manual import, share import, and sync status.

## Acceptance Criteria

- A user can create and rename at least two shopping sessions.
- A user can open Temu inside the app from a shopping session.
- The native bottom bar appears with home/dashboard, navigation, session/capture, dark mode, and text zoom controls.
- A user can switch between two shopping sessions without losing saved products.
- A user can capture a valid Temu product URL from the WebView into an existing list.
- A user can create a list during capture and save the product there.
- The saved product uses the existing durable product snapshot model and remains visible offline.
- Dark mode persists and applies to the bottom bar plus WebView best-effort rendering.
- Text zoom persists and applies to active and future WebViews.
- WebView session cookies, localStorage, IndexedDB, and auth state are not synced or exported.
- Existing manual import and Android share import still pass their tests.
- Android debug APK CI remains available after plugin integration.

## Test Strategy

Automated:

- `pnpm typecheck`
- `pnpm test:once`
- targeted tests for `shoppingSessions`, `temuWebview`, URL validation, and import review source handling
- Android build check through the existing GitHub CI/debug APK workflow

Manual:

- Install debug APK on Android.
- Open Shopping dashboard.
- Create "Cuisine" and "Voiture" sessions.
- Load Temu in both sessions.
- Toggle dark mode and text zoom.
- Navigate to a product page.
- Capture into "Cuisine".
- Confirm product appears in list and product detail.
- Restart app and confirm session metadata plus saved product remain.
- Disable network and confirm saved product detail remains readable.

Regression:

- Manual URL import still works.
- Android share import still works.
- Premium sync status page still works and remains fail-closed without auth.

## Risks

- Temu may block or degrade embedded WebView browsing.
- Multi-WebView pooling may increase memory use and renderer crashes.
- WebView profile support may vary by Android WebView implementation/version.
- Dark mode or text zoom may produce unreadable Temu pages.
- Copying SocialGlowz code without removing stealth/social logic would create privacy, legal, and product-trust risk.
- Users may assume multiple sessions mean separate Temu accounts; UI must avoid promising hard account isolation unless verified on target Android versions.

## Execution Notes

- Read first:
  - `src/types/domain.ts`
  - `src/stores/productSnapshots.ts`
  - `src/stores/shoppingLists.ts`
  - `src/pages/ImportReviewPage.vue`
  - `src/router/index.ts`
  - `src/App.vue`
  - `src-tauri/Cargo.toml`
  - `src-tauri/src/lib.rs`
  - `src-tauri/gen/android/app/build.gradle.kts`
  - `/home/claude/socialglowz/src-tauri/plugins/android-webview`
  - `/home/claude/socialglowz/src-tauri/src/lib.rs`
- Treat "profiles" from SocialGlowz as implementation-level WebView isolation, not necessarily a user-facing product concept.
- User-facing concept: "shopping sessions".
- Keep WebView overlay app-owned for v1. Do not inject list UI into Temu DOM until a separate safety spec approves it.
- The capture action should initially save URL-first. Image/title extraction from the live page can be added later only if it is user-triggered, read-only, and does not scrape at scale.
- Prefer bounded host pooling: keep the active host plus a small number of warm inactive hosts, destroy least-recently-used hosts under pressure.
- If `WebViewCompat.setProfile` fails, degrade safely to a single WebView host and preserve product capture.
- Call `WebViewCompat.setProfile` only after confirming `WebViewFeature.MULTI_PROFILE` support and before profile access on that WebView; treat destroyed-WebView and unsupported-feature exceptions as degraded mode.
- Use Tauri Android plugin commands for native actions and keep web/desktop no-op fallbacks explicit in the TypeScript bridge.
- Security approach: local actions are initiated by the current device user; premium sync remains governed by existing auth/entitlement work; the app must validate all captured URLs before they enter stores or sync queues; logs must not include cookies, tokens, raw Temu account state, localStorage, IndexedDB, or full private page content.
- Stop conditions:
  - stop if the copied plugin still contains anti-detection, stealth, cookie-auto-accept, or social-network-specific automation after adaptation;
  - stop if capture requires reading cookies, localStorage, IndexedDB, passwords, checkout details, or payment state;
  - stop if Android build cannot register the plugin cleanly;
  - stop if a required WebView API fails without a defined degraded path;
  - stop if user-facing copy implies Temu affiliation.
- Validation commands:
  - `pnpm typecheck`
  - `pnpm test:once`
  - `pnpm tauri:android:build`
  - source grep for forbidden copied SocialGlowz scripts/labels before `/sf-verify`.

## Implementation Result

`sf-start` implemented the first WebView shopping slice on 2026-06-10.

Completed:

- Android Tauri plugin crate `src-tauri/plugins/android-temu-webview` with Temu-only WebView hosts, native bottom bar, safe URL allowlist, dark mode, text zoom, capture event, and degraded-mode fallback.
- Root Tauri command registration for opening, hiding, closing, switching/syncing sessions, capturing the current URL, and applying settings.
- Pinia shopping-session store and Tauri bridge with web/desktop degraded fallbacks.
- `/shopping` dashboard route with session create/rename/open/close, dark mode, text zoom, capture button, and degraded-state messaging.
- WebView capture source integrated into import review and product snapshots as `source: "webview"`.
- README WebView section and `shipflow_data/workflow/test-checklists/temu-shopping-webview-sessions.md`.

Proof passed:

- `pnpm lint:check`
- `pnpm typecheck`
- `pnpm typecheck:convex`
- `pnpm test:once` (12 files, 45 tests)
- `pnpm build`
- Forbidden-copy scan found no SocialGlowz stealth scripts, cookie automation, social-network handlers, cookie export/import, or user-facing SocialGlowz labels in the adapted paths.
- Browser smoke on `/#/shopping` desktop and mobile showed no layout overlap; build preview had only an unrelated missing `favicon.ico` 404.

Proof still required:

- Android debug APK proof in CI or on a compatible local Android toolchain.
- Real-device WebView browsing and capture checklist execution.

Local Android build note: `pnpm tauri:android:build` reached Android Rust compilation and the new plugin crate, then failed because `/home/claude/Android/Sdk/ndk/28.2.13676358/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android24-clang` cannot execute on this aarch64 host (`Exec format error`). This is an environment/toolchain mismatch, not proof of a plugin source failure.

## Open Questions

None.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-10 18:03:26 UTC | sf-spec | GPT-5 Codex | Created WebView shopping sessions spec from user decision and SocialGlowz code inspection. | Draft spec created. | /sf-ready Temu in-app WebView shopping sessions |
| 2026-06-10 18:59:09 UTC | sf-ready | GPT-5 Codex | Validated structure, user-story fit, freshness evidence, test contract, adversarial risks, and security scope; added proof exceptions, stop conditions, validation mapping, and execution notes. | ready | /sf-start Temu in-app WebView shopping sessions |
| 2026-06-10 19:23:47 UTC | sf-start | GPT-5.5 Codex + GPT-5.3 Codex Spark subagent | Implemented the first WebView shopping-session slice, including Android plugin scaffold, TS store/bridge tests, dashboard, capture flow, docs, and checklist. | implemented with Android build proof blocked by local NDK host mismatch | /sf-verify Temu in-app WebView shopping sessions |
| 2026-06-11 19:08:00 UTC | 001-sf-build | GPT-5 Codex | Added the Temu clutter-removal setting requested after the initial WebView slice: ported bounded SocialGlowz cookie/banner cleanup into the Temu Android WebView, wired Vue/Pinia/Tauri/Rust/Kotlin bridge settings, and updated tests. | partial: local web checks passed; Android build proof blocked by missing Android SDK on this machine | Android SDK/CI real-device WebView proof for Temu popup and install-banner suppression |
| 2026-06-11 19:13:00 UTC | 006-sf-design | GPT-5 Codex | Harmonized shopping-list and shopping-session management controls: added shared rename/delete action menu and shared name dialog, required naming before new session creation, and exposed session/list actions on mobile and desktop shell surfaces. | partial: code checks passed; browser visual proof blocked by locked Playwright Chrome profile | Browser/device visual proof for shared action menu and name dialog |

## Current Chantier Flow

sf-spec done -> sf-ready ready -> sf-start implemented -> sf-build partial -> sf-design partial -> sf-verify pending (Android SDK/device and browser proof blocked locally) -> sf-end pending -> sf-ship pending
