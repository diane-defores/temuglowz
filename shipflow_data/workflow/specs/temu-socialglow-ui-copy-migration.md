---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.2"
project: "temu"
created: "2026-06-10"
created_at: "2026-06-10 20:40:29 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 00:06:02 UTC"
status: ready
source_skill: sf-spec
source_model: "GPT-5 Codex"
scope: "SocialGlow UI copy-first migration for Temu Shopping Lists"
owner: "Diane"
confidence: high
user_story: "En tant qu'utilisatrice de Temu Shopping Lists, je veux retrouver la qualite d'interface et de navigation de SocialGlow avec des sessions shopping Temu, afin de pouvoir faire mon shopping dans une app belle, fluide, et deja structuree autour des WebViews."
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - "Vue 3"
  - "Vite"
  - "Tauri v2 Android"
  - "Android native WebView"
  - "Android native bottom bar"
  - "Pinia persisted state"
  - "PrimeVue / PrimeIcons"
  - "SocialGlowz source repo at /home/claude/socialglowz"
  - "Temu shopping sessions"
  - "Temu product import review"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "implemented"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
  - artifact: "CLAUDE.md"
    artifact_version: "unknown"
    required_status: "active"
supersedes: []
evidence:
  - "User feedback 2026-06-10: the current Temu UI is not at SocialGlow quality and should not be improved by incremental additions."
  - "User decision 2026-06-10: reprendre les fichiers de code SocialGlow/Social News pour gagner du temps, puis retirer ce qui ne sert pas."
  - "User decision 2026-06-10: retirer les elements visibles de profils, mais garder le code si cela aide la migration."
  - "User decision 2026-06-10: bottom bar labels should be shopping session names instead of social network names."
  - "User decision 2026-06-10: keep the bottom-bar quick menu for text size, dark mode, and future controls."
  - "User decision 2026-06-10: do not add legacy naming; the app is new enough to replace routes/files directly."
  - "User decision 2026-06-10: do not use Codex Spark for this migration; use GPT-5.5 medium or high for delegated implementation."
  - "Local source available: /home/claude/socialglowz/src/ui/setup/pages/SocialGlowz contains App.vue, MobileLayout.vue, MobileSettingsSheet.vue, NetworkWebviewHost.vue, desktop shell components, styles, and text/tap utilities."
  - "Local source available: /home/claude/socialglowz/src-tauri/plugins/android-webview contains the richer native bottom-bar menu implementation."
next_step: "/sf-verify Temu SocialGlow UI copy migration"
---

# Title

Temu SocialGlow UI Copy Migration

## Status

Implemented locally. This spec exists because the implementation path had to change: the Temu app should not be polished by adding custom UI bricks to the current rough dashboard. The implemented route is copy-first migration from SocialGlow/Social News, then removal and adaptation.

## User Story

En tant qu'utilisatrice de Temu Shopping Lists, je veux retrouver la qualite d'interface et de navigation de SocialGlow avec des sessions shopping Temu, afin de pouvoir faire mon shopping dans une app belle, fluide, et deja structuree autour des WebViews.

Primary actor: Android user opening Temu Shopping Lists.

Trigger: the user launches the app or returns from a WebView session.

Observable result: the first app surface looks and behaves like the SocialGlow shell, but with Temu shopping sessions and shopping lists instead of social networks and visible profiles.

## Minimal Behavior Contract

The implementation must copy the relevant SocialGlow UI/native files into Temu first, wire the app to that copied shell, and then remove or hide non-Temu surfaces. The dashboard must be SocialGlow-derived, not a newly invented Temu dashboard. Visible profile management is removed for v1, but copied profile-related code may remain unused or behind a single default internal profile if that preserves the SocialGlow architecture. The bottom bar must switch between named shopping sessions, not social networks, and its quick menu must expose dark mode and text-size controls. No route, component, or code path should use `legacy` naming for this new app.

## Success Behavior

- Given the app opens, when the user reaches the first screen, then the UI uses the copied SocialGlow shell quality: mobile top bar, polished session grid/dashboard, sticky controls, native WebView handoff, and coherent settings surface.
- Given no session exists, when the user opens the dashboard, then they can create a first Temu shopping session without seeing profile setup.
- Given sessions exist, when the user views the dashboard, then session cards or tiles show names such as `Cuisine`, `Voiture`, or `Shopping 1`.
- Given a session is opened, when the native bottom bar appears, then the switcher labels are the Temu session names.
- Given the user opens the bottom-bar menu, then dark mode and text-size controls are available from that menu.
- Given the user returns home from a WebView, then they return to the SocialGlow-derived shopping dashboard, not the old rough Temu page.
- Given copied SocialGlow profile UI exists, when using v1, then no visible "profiles" entry, profile sheet, onboarding profile step, or profile switcher is shown.
- Given copied SocialGlow code contains social-network concepts, when the migration is complete, then visible labels and primary types are translated to shopping/session language where user-facing.
- Given the existing Temu capture flow works, when the user taps save/capture from the WebView, then it still routes to import review/list saving.

## Error Behavior

- If a copied SocialGlow component depends on unavailable SocialGlow stores, then either copy the store and adapt it to Temu concepts or remove the dependency before wiring the component.
- If a profile feature is needed internally for session isolation, then use one default internal profile and hide all profile UI.
- If native multi-session WebView isolation is unavailable, then show the existing degraded WebView state without adding a profile UI workaround.
- If a copied social-network feature is not relevant to Temu, then remove it rather than leaving dead visible UI.
- If the copy-first path reveals a missing dependency, then add the dependency only if it is part of the copied SocialGlow stack and is necessary for the reused shell.
- If a file cannot be copied cleanly because it imports too much SocialGlow product logic, then keep the copied file as the starting point and delete/adapt sections inside it, documenting the reason in the implementation report.

## Problem

The current Temu UI was built as a functional scaffold: lists, manual import, sync, and a rough shopping dashboard. It proves the stack but does not meet the desired product quality. Continuing to improve it incrementally wastes time and creates a second design system. SocialGlow already has the target interaction model: app shell, session launcher, WebView dashboard, bottom bar, settings, dark mode, text zoom, and mobile-first navigation.

## Solution

Use SocialGlow as the source implementation, not merely visual inspiration. Copy the relevant Vue components, styles, utilities, and Android native bottom-bar menu code from `/home/claude/socialglowz`, then adapt product concepts by subtraction:

- social networks become Temu shopping sessions
- network labels become session names
- profile UI is hidden/removed for v1
- SocialGlow social-only features are removed
- Temu list/import/capture features are preserved and plugged into the copied shell

## Scope In

- Copy-first migration of the SocialGlow app shell into Temu.
- Replace the current rough Temu app shell with the copied SocialGlow-derived shell.
- Copy and adapt these SocialGlow UI files as source material:
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/App.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/MobileLayout.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/MobileSettingsSheet.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/NetworkWebviewHost.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppHeader.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppSidebar.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppRightSidebar.vue`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/assets/main.css`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/style.css`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/utils/textZoom.ts`
  - `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/utils/tapSound.ts` if the native menu keeps tap feedback.
- Copy/adapt the richer native bottom-bar menu from:
  - `/home/claude/socialglowz/src-tauri/plugins/android-webview/android/src/main/java/com/socialglowz/webview/NativeWebViewPlugin.kt`
- Preserve Temu-specific code:
  - `src/stores/shoppingSessions.ts`
  - `src/lib/temuWebview.ts`
  - `src/stores/importDrafts.ts`
  - `src/pages/ImportReviewPage.vue`
  - `src/stores/shoppingLists.ts`
  - `src/stores/productSnapshots.ts`
  - `src-tauri/plugins/android-temu-webview`
- Hide or remove visible profile surfaces:
  - profile switcher
  - mobile profile sheet
  - onboarding profile creation
  - profile menu section in the native quick menu
  - visible profile labels/copy.
- Keep internal profile/session-isolation code only when useful and non-visible.
- Make the app first screen a shopping-session launcher, not the old list-first scaffold.
- Keep settings for dark mode and text zoom in the copied SocialGlow-style settings/menu.
- Keep GitHub Actions/Blacksmith Android proof path.

## Scope Out

- Incremental redesign of the existing rough `ShoppingDashboardPage.vue` as the main route.
- A new custom Temu design system unrelated to SocialGlow.
- Visible multi-profile management in v1.
- `legacy` route names, compatibility wrappers, or user-facing legacy wording.
- Official Temu affiliation claims.
- DOM injection into Temu for v1.
- Cart scraping, price-history automation, and background crawling.
- Rebuilding SocialGlow billing/auth/onboarding unless needed by copied shell wiring.
- Keeping SocialGlow social-network features visible.

## Constraints

- Copy first, adapt second. Do not hand-build the replacement UI from scratch.
- The implementation should preserve reviewability: after copying, each deletion/adaptation must have an obvious Temu reason.
- Do not introduce `legacy` naming. This is a new app and old rough routes can be replaced directly.
- User-facing copy must say Temu Shopping Lists is independent from Temu.
- Native WebView session data, cookies, profile state, and login state must stay local.
- Product URLs and user-created shopping-list data may continue to use the existing local/premium sync contracts.
- The copied native bottom bar must show session names, not network names.
- The copied bottom-bar quick menu must not include profiles in v1.
- Do not copy SocialGlow anti-bot, stealth, social app-banner dismissal, or social-specific DOM manipulation into Temu unless a later explicit policy/spec approves it.
- The old rough UI can be deleted or replaced once the copied shell owns the app flow; no need to preserve it for backward compatibility.

## Test Contract

Surface: Vue 3 + Tauri Android app with copied SocialGlow shell, Temu shopping-session stores, Android native WebView plugin, PrimeVue/PrimeIcons, Pinia persistence, and import-review/list persistence.

Required automated proof:

- `pnpm typecheck`
- `pnpm lint:check`
- `pnpm test:once`
- `pnpm build`
- relevant store/bridge tests updated or added for session labels, settings, and capture routing.

Required Android proof:

- GitHub Actions Blacksmith debug APK build.
- Android real-device smoke after APK install.

Manual checklist path:

- `shipflow_data/workflow/test-checklists/temu-socialglow-ui-copy-migration.md`

Required manual scenarios:

- `TC-UI-COPY-001`: first launch opens the SocialGlow-derived shopping dashboard.
- `TC-UI-COPY-002`: no visible profiles appear on dashboard, settings, onboarding, or bottom-bar menu.
- `TC-UI-COPY-003`: create and rename sessions `Cuisine` and `Voiture`.
- `TC-UI-COPY-004`: open both sessions and switch between them from the native bottom bar.
- `TC-UI-COPY-005`: bottom-bar quick menu toggles dark mode.
- `TC-UI-COPY-006`: bottom-bar quick menu changes text size.
- `TC-UI-COPY-007`: capture current Temu product into import review and save to a list.
- `TC-UI-COPY-008`: existing list, manual import, share import, and sync pages remain reachable from the copied shell.
- `TC-UI-COPY-009`: no user-facing SocialGlow social-network copy remains.
- `TC-UI-COPY-010`: no route/component introduced for this migration contains `legacy`.

Required results:

- The copied SocialGlow-derived shell is mounted by `src/App.vue` or by a direct replacement imported from `src/ui/temu-shell/App.vue`.
- The first screen is a shopping-session launcher, not `src/pages/ShoppingDashboardPage.vue`.
- The session launcher reads from `src/stores/shoppingSessions.ts` and writes real Temu shopping sessions.
- `src-tauri/plugins/android-temu-webview/android/src/main/java/com/temushoppinglists/temuwebview/TemuWebViewPlugin.kt` exposes the SocialGlow-style quick menu without visible profile entries.
- The native bottom-bar switcher receives session summaries from `src/lib/temuWebview.ts` and renders session names.
- Capture still flows through `src/stores/importDrafts.ts` into `src/pages/ImportReviewPage.vue`.
- Existing list/detail/manual-import/sync routes remain reachable.

Exception with proof:

- If a SocialGlow file cannot be copied whole, the implementation report must name the source file, target file, blocked import/dependency, and the exact sections copied before adaptation.
- If Android real-device proof is unavailable, the implementation may stop before ship only with a green Blacksmith APK build, APK release link, and a not-run checklist entry naming the missing device proof.
- If native multi-session isolation degrades on a device, the proof must include the device/WebView limitation and show that one-session browsing plus capture still works.

Exception without proof:

- Do not mark implementation complete if the first screen is still the old rough dashboard.
- Do not mark implementation complete if profile UI is visible.
- Do not mark implementation complete if the bottom-bar quick menu is missing dark mode or text zoom.
- Do not mark implementation complete if SocialGlow anti-bot, stealth, or social DOM scripts were copied into active Temu WebView code.

## Dependencies

- Existing Temu WebView spec: `shipflow_data/workflow/specs/temu-shopping-webview-sessions.md`.
- Existing Android app spec: `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`.
- SocialGlow source repo at `/home/claude/socialglowz`.
- Current Temu package includes Vue, Pinia, PrimeVue, PrimeIcons, Tauri, and Android plugin wiring.
- Fresh external docs not needed for this spec because the decision is local copy/adaptation from an existing working repo. Any implementation change to Tauri/Android APIs beyond copied patterns must use the documentation freshness gate before coding.

## Invariants

- The SocialGlow-derived interface is the base, not inspiration.
- Profiles are not visible in v1.
- Session names are first-class labels in the dashboard and bottom bar.
- Capture/import/list functionality remains intact.
- WebView session cookies and account state never sync to cloud.
- No `legacy` naming is introduced.
- No Temu partnership claim is introduced.

## Links & Consequences

- Product: Temu Shopping Lists becomes a shopping workspace rather than a rough list archive.
- UX: the app should feel like SocialGlow because it is structurally based on SocialGlow.
- Architecture: SocialGlow-derived shell may temporarily include copied but hidden code; later cleanup is allowed after parity is proven.
- Native: the Temu plugin should absorb the SocialGlow bottom-bar menu concepts while keeping Temu URL allowlisting and capture commands.
- QA: real-device Android proof is required because WebView/native UI cannot be trusted from web-only screenshots.
- Docs: README and ShipFlow technical docs must reflect the copy-first migration and the hidden-profile decision.

## Documentation Coherence

Update after implementation:

- `README.md`: describe the SocialGlow-derived shopping-session app shell and APK install path.
- `CLAUDE.md` if the development mode changes.
- `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`: record that UI is copied/adapted from SocialGlow and profiles are hidden.
- `shipflow_data/technical/platforms/android.md`: record native bottom-bar menu behavior and Blacksmith proof.
- `shipflow_data/workflow/test-checklists/temu-socialglow-ui-copy-migration.md`: add manual Android scenarios.

## Edge Cases

- Copied SocialGlow files import `vue-i18n`, auth, billing, or onboarding that Temu does not need.
- Copied profile code is deeply coupled to visible dashboard filters.
- Native bottom-bar menu code depends on PrimeIcons font assets not yet bundled in Temu plugin.
- SocialGlow uses social-network routes while Temu needs session IDs.
- App launch path still opens old lists-first UI after migration.
- Android WebView supports only one session reliably on a device.
- User has existing rough-dashboard persisted sessions before migration.
- Imported SocialGlow styles conflict with current list/import pages.

## Implementation Tasks

1. Baseline copy inventory:
   - Target files: implementation report plus copied target tree under `src/ui/temu-shell/` or direct replacements in `src/App.vue` and `src/components/`.
   - Action: record exact SocialGlow source files copied and their Temu target paths in the implementation report.
   - Validation: report includes a source-to-target map before behavioral claims.
   - Do not begin by manually redesigning existing Temu components.

2. Copy SocialGlow shell:
   - Target files: `src/App.vue`, `src/ui/temu-shell/App.vue`, `src/ui/temu-shell/components/MobileLayout.vue`, `src/ui/temu-shell/components/MobileSettingsSheet.vue`, `src/ui/temu-shell/components/NetworkWebviewHost.vue`, `src/ui/temu-shell/components/AppHeader.vue`, `src/ui/temu-shell/components/AppSidebar.vue`, `src/ui/temu-shell/components/AppRightSidebar.vue`, `src/ui/temu-shell/style.css`, `src/ui/temu-shell/assets/main.css`, `src/ui/temu-shell/utils/textZoom.ts`, and optionally `src/ui/temu-shell/utils/tapSound.ts`.
   - Action: copy SocialGlow shell files into Temu, then wire `src/App.vue` to the copied shell or replace it directly.
   - Validation: app build imports copied shell files and no longer routes first launch through the rough dashboard.

3. Replace social networks with shopping sessions:
   - Target files: `src/ui/temu-shell/components/MobileLayout.vue`, `src/stores/shoppingSessions.ts`, and any copied helper/store introduced from SocialGlow.
   - Action: adapt copied network menu/grid logic to `useShoppingSessionsStore`, create sessions from the copied dashboard UI, and show session names/statuses instead of network names.
   - Validation: unit/store checks cover create, rename, active session, and rendered session labels.

4. Remove visible profiles:
   - Target files: `src/ui/temu-shell/components/MobileLayout.vue`, `src/ui/temu-shell/components/MobileSettingsSheet.vue`, copied onboarding/settings components, and native quick menu code.
   - Action: remove dashboard profile card/profile sheet/profile switcher/onboarding profile step from mounted UI.
   - Keep any internal default-profile code only if required to preserve copied architecture.
   - Validation: grep and manual smoke find no visible `Profile`/`Profils` UI in v1.

5. Adapt WebView host:
   - Target files: `src/ui/temu-shell/components/NetworkWebviewHost.vue`, `src/lib/temuWebview.ts`, `src/stores/shoppingSessions.ts`.
   - Action: replace SocialGlow WebView store/composable calls with `src/lib/temuWebview.ts` and `src/stores/shoppingSessions.ts`.
   - Keep Temu URL allowlisting and existing capture events.
   - Validation: opening a session calls the Temu WebView bridge and capture events still reach import review.

6. Adapt native bottom bar:
   - Target file: `src-tauri/plugins/android-temu-webview/android/src/main/java/com/temushoppinglists/temuwebview/TemuWebViewPlugin.kt`.
   - Action: copy the SocialGlow quick-menu pattern from `NativeWebViewPlugin.kt`.
   - Remove profile menu items.
   - Use session names for switcher labels.
   - Keep dark mode and text zoom controls in the menu.
   - Validation: Android build compiles and manual smoke confirms quick menu behavior.

7. Preserve Temu app features:
   - Target files: `src/router/index.ts`, `src/pages/ListsPage.vue`, `src/pages/ListDetailPage.vue`, `src/pages/ManualImportPage.vue`, `src/pages/ImportReviewPage.vue`, `src/pages/SyncPage.vue`, `src/pages/ProductDetailPage.vue`.
   - Action: keep list views, import review, manual import, sync page, and product detail reachable from the copied shell.
   - Keep capture-to-import-review behavior.
   - Validation: route smoke and tests confirm navigation still works.

8. Delete rough scaffold:
   - Target files: `src/pages/ShoppingDashboardPage.vue`, `src/router/index.ts`, `src/App.vue`.
   - Action: remove or stop routing to the old rough `ShoppingDashboardPage.vue` once the copied shell owns the flow.
   - Do not leave `legacy` names.
   - Validation: no route/component introduced by this migration uses `legacy`; first launch uses copied shell.

9. Add/adjust tests:
   - Target files: `src/stores/shoppingSessions.test.ts`, `src/lib/temuWebview.test.ts`, and new UI-shell tests if practical.
   - Action: update session store and bridge tests for copied-shell behavior.
   - Add regression tests for route names and absence of `legacy` naming if practical.
   - Validation: `pnpm test:once` passes.

10. Update docs and checklist:
    - Target files: `README.md`, `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`, `shipflow_data/technical/platforms/android.md`, `shipflow_data/workflow/test-checklists/temu-socialglow-ui-copy-migration.md`.
    - Action: add the manual checklist and update README/technical docs.
    - Validation: metadata lint passes for touched ShipFlow docs.

11. Validate:
    - Target systems: local TS/Vue checks, GitHub Actions Blacksmith, Android device.
    - Action: run local checks, push and verify Blacksmith APK build, install APK and run real-device manual smoke.
    - Validation: all required proof is recorded before ship.

## Parallel Implementation Batches

Use this batching to avoid a single large agent inventing a new UI. Parallel work is allowed only after Batch 0 creates the copy inventory and branch/workspace state is clean.

### Batch 0 - Orchestration Baseline

Owner: main orchestrator, GPT-5.5 medium or high.

Write scope:

- `shipflow_data/workflow/specs/temu-socialglow-ui-copy-migration.md`
- implementation report notes in the final `sf-start` report

Tasks:

- Confirm repo is clean except expected spec changes.
- Confirm `/home/claude/socialglowz` is the source repo.
- Create the source-to-target copy inventory.
- Assign disjoint write scopes before spawning workers.

Parallelism: must run first. Do not spawn coding workers until this is done.

### Batch A - Copied Vue Shell

Owner: worker, GPT-5.5 high preferred.

Write scope:

- `src/ui/temu-shell/**`
- copied styles/assets/utilities under `src/ui/temu-shell/`

Source files:

- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/App.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/MobileLayout.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/MobileSettingsSheet.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/NetworkWebviewHost.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppHeader.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppSidebar.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/components/AppRightSidebar.vue`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/assets/main.css`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/style.css`
- `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/utils/textZoom.ts`

Tasks:

- Copy the SocialGlow shell into `src/ui/temu-shell/`.
- Adapt visible language from social networks to shopping sessions.
- Remove visible profile UI from the copied shell.
- Do not edit `src/App.vue`, `src/router/index.ts`, or native Kotlin in this batch.

Validation:

- Copied shell files compile in isolation as far as practical.
- No visible profile route/sheet/card remains in copied shell.
- No `legacy` naming is introduced.

### Batch B - Native Bottom-Bar Quick Menu

Owner: worker, GPT-5.5 high preferred.

Write scope:

- `src-tauri/plugins/android-temu-webview/android/src/main/java/com/temushoppinglists/temuwebview/TemuWebViewPlugin.kt`
- native plugin assets only if required for the copied menu, such as PrimeIcons font or tap sound assets
- matching Rust/mobile plugin bindings only if a new command is required

Source file:

- `/home/claude/socialglowz/src-tauri/plugins/android-webview/android/src/main/java/com/socialglowz/webview/NativeWebViewPlugin.kt`

Tasks:

- Port the SocialGlow home-button quick-menu pattern into the Temu plugin.
- Keep dark mode and text zoom controls.
- Remove profile menu entries.
- Keep session-name switcher behavior and Temu URL allowlisting.
- Do not copy SocialGlow stealth, anti-bot, app-banner dismissal, or social DOM scripts.

Validation:

- Kotlin code compiles locally where possible or through Blacksmith.
- Grep confirms forbidden SocialGlow stealth/social script blocks are not active in Temu plugin.

### Batch C - Session Store, Bridge, And Capture Wiring

Owner: worker, GPT-5.5 medium or high.

Write scope:

- `src/stores/shoppingSessions.ts`
- `src/stores/shoppingSessions.test.ts`
- `src/lib/temuWebview.ts`
- `src/lib/temuWebview.test.ts`
- narrowly required capture/import tests

Tasks:

- Ensure session summaries sent to native include session IDs and display names.
- Ensure dark mode and text zoom settings are canonical in the shopping-session store.
- Preserve capture-to-import-review behavior.
- Add tests for session labels and settings bridge behavior.
- Do not edit copied shell files or native Kotlin.

Validation:

- Store/bridge tests pass.
- Unsafe URL and non-product capture behavior remains covered.

### Batch D - App Integration

Owner: main orchestrator, GPT-5.5 high preferred.

Write scope:

- `src/App.vue`
- `src/router/index.ts`
- final integration edits inside `src/ui/temu-shell/**`
- final integration edits needed after Batch A/B/C merge

Tasks:

- Mount the copied shell as the first app surface.
- Ensure list/manual import/import review/sync/product detail routes remain reachable.
- Stop routing first launch through the old rough dashboard.
- Resolve conflicts between copied shell assumptions and Temu stores/routes.

Parallelism: runs after Batch A and Batch C return. It may proceed before Batch B finishes only if native bottom-bar work is not needed for web build/typecheck.

Validation:

- `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, and `pnpm build` pass locally.

### Batch E - Docs, Checklist, And Proof Hooks

Owner: worker or main orchestrator, GPT-5.5 medium.

Write scope:

- `README.md`
- `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`
- `shipflow_data/technical/platforms/android.md`
- `shipflow_data/workflow/test-checklists/temu-socialglow-ui-copy-migration.md`

Tasks:

- Document copy-first SocialGlow-derived UI.
- Document hidden-profile decision.
- Add Android manual smoke checklist.
- Keep GitHub Actions/Blacksmith APK proof instructions aligned with current workflow.

Parallelism: checklist skeleton can start in parallel; final docs should wait for integration details.

Validation:

- ShipFlow metadata lint passes for touched docs.

### Do Not Parallelize

- `src/App.vue` and `src/router/index.ts` should have one owner: Batch D.
- Native plugin Kotlin should have one owner: Batch B.
- `src/ui/temu-shell/**` should have one primary owner until Batch D integration.
- No worker should edit another worker's write scope without explicit orchestration.
- No worker should revert another worker's edits; adapt to existing changes.

### Delegation Policy

- Do not use `gpt-5.3-codex-spark` for this migration.
- Use `gpt-5.5` with medium reasoning for bounded docs/tests/store work.
- Use `gpt-5.5` with high reasoning for copied shell and native WebView/bottom-bar work.
- If only one sub-agent is available, prioritize Batch A first, then Batch B, while the orchestrator owns Batch D integration.

## Acceptance Criteria

- The app launches into a SocialGlow-derived shopping-session shell.
- The implementation uses copied SocialGlow files as the base; it is not a hand-built approximation.
- The old rough shopping dashboard is not the primary user experience.
- Visible profiles are absent from v1.
- Session names appear in the dashboard and native bottom-bar switcher.
- Bottom-bar quick menu includes dark mode and text-size controls.
- Existing Temu capture/import/list behavior still works.
- No `legacy` route/component naming is introduced by this migration.
- No visible SocialGlow social-network labels remain.
- CI builds the Android debug APK on Blacksmith.
- Manual Android smoke confirms dashboard, session switching, bottom menu, and capture.

## Test Strategy

Proof path: evidence-first plus regression-first.

1. Compare copied source file list against SocialGlow source.
2. Run TypeScript, lint, unit tests, and web build.
3. Run targeted grep checks:
   - no `legacy` names introduced for migration
   - no visible `Profile`/`Profils` route or mounted profile sheet in v1 UI
   - no SocialGlow social-network labels in visible Temu shell
4. Build debug APK through GitHub Actions Blacksmith.
5. Run Android real-device manual checklist.

## Risks

- High UI regression risk if copied files are adapted too aggressively before the shell works.
- High dependency risk from SocialGlow auth/billing/i18n/onboarding imports.
- Medium native risk from copying only part of the bottom-bar menu code.
- Medium privacy risk if profile/session/cookie language is exposed incorrectly.
- Medium product risk if visible social-network remnants remain.
- Low data migration risk because the app is early and no legacy compatibility is required.

## Execution Notes

- The next implementer should not start from `ShoppingDashboardPage.vue` redesign.
- The first implementation commit or working state should visibly contain copied SocialGlow files or direct replacements derived from those files.
- Use "remove" and "adapt" as explicit phases after copying.
- Use the `Parallel Implementation Batches` section as the execution contract before spawning sub-agents.
- Keep Batch D integration local to the orchestrator unless explicitly reassigned.
- If the operator says "Social News", treat it as the same local source family unless a separate `/home/claude/socialnews*` repo is discovered.
- This spec intentionally forbids `legacy` naming because the app is not mature enough to need compatibility layers for the rough scaffold.
- Read first: `/home/claude/socialglowz/src/ui/setup/pages/SocialGlowz/App.vue`, `MobileLayout.vue`, `MobileSettingsSheet.vue`, `NetworkWebviewHost.vue`, `/home/claude/socialglowz/src-tauri/plugins/android-webview/android/src/main/java/com/socialglowz/webview/NativeWebViewPlugin.kt`, `src/stores/shoppingSessions.ts`, `src/lib/temuWebview.ts`, `src/router/index.ts`, and `src/App.vue`.
- Validation commands: `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, `pnpm build`, ShipFlow metadata lint for touched docs, and GitHub Actions Blacksmith debug APK build.
- Stop condition: if the first launch still depends on the old rough dashboard, stop and report `partial`.
- Stop condition: if visible profile UI remains, stop and report `partial`.
- Stop condition: if the bottom-bar quick menu cannot be ported without copying SocialGlow stealth/social DOM scripts, stop and ask for a narrower native-menu spec instead of shipping.
- Language doctrine: stable ShipFlow headings, YAML, test IDs, task labels, and internal contracts stay in English; user-facing French copy must be natural and accented; quoted user decisions may remain in their original language.

## Open Questions

None blocking. The profile decision is made for v1: keep useful code internally, remove visible profile UI.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-10 20:40:29 UTC | sf-spec | GPT-5 Codex | Created copy-first SocialGlow UI migration spec after implementation path correction. | draft | /sf-ready Temu SocialGlow UI copy migration |
| 2026-06-10 20:45:42 UTC | sf-ready | GPT-5 Codex | Hardened target files, proof contract, execution notes, and stop conditions; marked ready. | ready | /sf-start Temu SocialGlow UI copy migration |
| 2026-06-10 20:51:50 UTC | sf-spec | GPT-5 Codex | Added parallel implementation batches, disjoint write scopes, and delegation policy excluding Codex Spark. | ready | /sf-start Temu SocialGlow UI copy migration |
| 2026-06-11 00:06:02 UTC | sf-start | GPT-5.5 Codex with batch sub-agents | Implemented copied SocialGlow-derived shell, Temu session bridge, native bottom-bar quick menu, docs, checklist, and local validation. | implemented | /sf-verify Temu SocialGlow UI copy migration |

## Current Chantier Flow

sf-spec ✅ -> sf-ready ✅ -> sf-start ✅ -> sf-verify ⏳ -> sf-end ⏳ -> sf-ship ⏳
