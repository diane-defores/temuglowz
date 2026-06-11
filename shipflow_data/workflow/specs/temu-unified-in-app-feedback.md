---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-11"
created_at: "2026-06-11 07:25:00 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 07:34:30 UTC"
status: implemented
source_skill: 001-sf-build
source_model: "GPT-5 Codex"
scope: "unified in-app feedback and notifications"
owner: "unknown"
confidence: high
user_story: "En tant qu'utilisatrice de Temu Shopping Lists, je veux recevoir des retours d'information clairs, coherents et non bloquants quand une action reussit, echoue ou n'est pas possible, afin de comprendre immediatement ce que l'application a fait ou ce que je dois corriger."
risk_level: "medium"
security_impact: "no"
docs_impact: "yes"
linked_systems:
  - "Vue 3"
  - "Pinia"
  - "Tauri WebView shell"
  - "Shopping dashboard"
  - "Import review flow"
  - "Shopping lists"
  - "Product observations"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
  - artifact: "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "implemented"
supersedes: []
evidence:
  - "User request 2026-06-11: when the bottom-bar product actions are triggered off a product page, the app must show a clear informational popup instead of failing silently."
  - "User request 2026-06-11: do not ship scattered quick fixes; build one durable and coherent user-feedback system across the app."
  - "Current code shows mixed patterns: inline text errors, silent early returns, thrown store errors without page-level handling, and one-off dialog logic in src/ui/temu-shell/App.vue."
next_step: "/sf-start Unified in-app feedback and notifications"
---

# Title

Unified In-App Feedback And Notifications

## Status

Implemented locally for the first coherent slice. This spec defines and now implements one shared in-app notification system for informational, success, warning, and error states, plus migration of the highest-value flows that previously failed silently or exposed raw errors.

## User Story

En tant qu'utilisatrice de Temu Shopping Lists, je veux recevoir des retours d'information clairs, coherents et non bloquants quand une action reussit, echoue ou n'est pas possible, afin de comprendre immediatement ce que l'application a fait ou ce que je dois corriger.

Primary actor: app user interacting with shopping sessions, imports, lists, and product detail flows.

Trigger: the user taps a command such as save current product, rename session, save import review, change quantity, save an observation, or export local data.

Observable result: the app displays a consistent in-app message in the same visual system, with language matched to the actual situation and without losing the current workflow context unless navigation is explicitly required.

## Minimal Behavior Contract

The app exposes one shared feedback surface for transient in-app notifications. Pages and shell flows can publish `info`, `success`, `warning`, and `error` messages through a single local API instead of rendering ad hoc inline strings, swallowing errors, or creating one-off dialogs per feature. Blocking dialogs remain allowed only for truly confirmatory or destructive choices; routine action feedback must use the shared notification system. The easy-to-miss edge case is that the app must not claim success before the underlying state mutation actually completes, and notification copy must stay specific enough to explain the user's next action when recovery is needed.

## Success Behavior

- Given the user triggers a supported action successfully, when the mutation completes, then the app shows a concise success message from the shared notification system.
- Given the user triggers a supported action that is impossible in the current context, when preconditions fail, then the app stays on the current screen and shows a clear informational or warning message.
- Given a store or page action throws a known recoverable error, when the page catches it, then the app surfaces a user-readable message rather than raw internal phrasing.
- Given several app surfaces publish notifications, when the user moves between list, import, product, and shopping shell flows, then the visual style and placement remain coherent.
- Given the app already displays persistent inline guidance that belongs to the form itself, then that guidance may remain inline while transient action feedback uses the shared notification system.

## Error Behavior

- Invalid or unsupported product context: keep the user in place and explain why the action is unavailable.
- Missing selected list, deleted list, or stale item reference: reject the action with a recoverable message and no uncaught exception.
- Duplicate/invalid rename or empty required field: explain the correction expected from the user.
- Invalid numeric input such as malformed price: explain what was ignored or what must be corrected before save.
- Export/download action failure: show that export failed and keep the app usable.
- Notification host unavailable or misconfigured: fail closed to a local inline fallback only where necessary; do not crash the page.

## Problem

The current app mixes several feedback patterns: inline danger text on some pages, silent early returns on others, raw thrown store errors in some flows, and a newly added one-off product-page popup in the WebView shell. That creates inconsistent UX, makes debugging user behavior harder, and invites more one-off patches every time a new edge case appears.

## Solution

Introduce a small but durable in-app feedback system with:

- a shared notification data model and publishing API
- a single host component mounted at the app/shell level
- consistent type semantics (`info`, `success`, `warning`, `error`)
- bounded dismissal and optional action labels only when truly useful
- migration of the first high-value flows that currently fail silently or produce inconsistent messages

The first slice should prefer a lightweight local architecture aligned with the existing Vue + Pinia setup. It should not introduce a heavy external dependency, native OS notifications, or a parallel design system.

## Scope In

- Shared notification model, store or composable-based publisher, and one host component.
- Visual treatment for transient `info`, `success`, `warning`, and `error` notifications.
- Integration into `src/ui/temu-shell/App.vue` so WebView-shell flows use the shared system.
- Integration into the highest-risk pages:
  - `src/pages/ImportReviewPage.vue`
  - `src/pages/ShoppingDashboardPage.vue`
  - `src/pages/ListDetailPage.vue`
  - `src/pages/ProductDetailPage.vue`
  - `src/pages/ListsPage.vue`
- Normalization of user-facing copy for known recoverable errors thrown by stores.
- Local tests for the notification state logic and targeted flow regressions where practical.

## Scope Out

- Android OS push notifications, system toasts, or background reminders.
- Cross-device synced notification history.
- Arbitrary rich modals or a general-purpose dialog framework.
- Global analytics/event instrumentation for every notification in this first slice.
- Full copywriting rewrite of every existing form hint or empty state.

## Constraints

- Reuse the existing app shell and CSS language; do not create a second unrelated overlay/popup system.
- Keep the implementation local-first and framework-native; no new third-party toast library in this slice unless a later spec approves it.
- Messages must be in natural French where the user sees them.
- Notifications must not overlap primary controls incoherently on mobile or desktop.
- Destructive confirmations remain separate from transient notifications when explicit user confirmation is required.
- Store exceptions may stay technical internally, but page/shell surfaces must translate recoverable cases into user-readable feedback.
- The system must support both the shell route (`src/ui/temu-shell`) and the classic routed pages under `src/pages`.

## Test Contract

Surface: Vue 3 app shell, routed pages, Pinia stores, WebView capture shell, list and observation flows.

Proof profile: targeted automated checks for notification state logic plus lint/type-level confidence on migrated surfaces; optional browser smoke if layout or overlay placement changes materially.

Required scenario IDs:

- `TC-FEEDBACK-AUTO-001`: notification publisher can enqueue and dismiss typed messages deterministically.
- `TC-FEEDBACK-AUTO-002`: WebView non-product action publishes a recoverable informational message through the shared system.
- `TC-FEEDBACK-AUTO-003`: import review save with invalid or missing list fails with user-facing feedback instead of uncaught error.
- `TC-FEEDBACK-AUTO-004`: session rename duplicate or empty value shows coherent feedback.
- `TC-FEEDBACK-AUTO-005`: list/detail/product flows no longer silently ignore the migrated recoverable cases.

Required results:

- One shared notification host renders app-wide transient feedback.
- The first migrated flows use the shared system instead of one-off implementations or silent failure.
- No migrated flow throws an uncaught recoverable error into the UI.
- Mobile and desktop layouts remain readable when notifications appear.

## Dependencies

- Existing page and shell routing.
- Existing Pinia stores for lists, sessions, imports, snapshots, and observations.
- Existing shell CSS primitives in `src/ui/temu-shell/style.css` and app styles in `src/styles.css`.

## Invariants

- Product/list/session data mutations remain the source of truth; notifications only report their outcome.
- Existing manual import, share import, and WebView capture flows remain functional.
- The app must not navigate away just to display a recoverable error.
- The app must not show success for a failed mutation.

## Documentation Coherence

Update or create:

- `README.md` only if the user-visible product behavior changes enough to merit mention.
- internal spec and tests only if the first slice changes supported user flows materially.

No public copy should imply live OS notifications or background monitoring in this first slice.

## Edge Cases

- Two notifications are triggered in quick succession from the same screen.
- A page navigates immediately after publishing success feedback.
- A stale route param points to deleted data.
- A store throws a technical message that should not be exposed verbatim.
- A notification is triggered while the shell dialog or settings sheet is already open.

## Implementation Tasks

1. Introduce the shared notification domain and host.
   - Add a small notification publisher/store and a host component mounted high enough for both shell and page flows.
   - Define typed variants, duration policy, dismissal behavior, and optional persistence while visible.

2. Replace the one-off WebView product popup with the shared system.
   - Migrate `src/ui/temu-shell/App.vue` from custom popup state to shared notifications where possible.
   - Preserve the current product-page precondition message semantics.

3. Migrate high-value recoverable flows.
   - `ImportReviewPage.vue`: save/list-selection/create-list failures.
   - `ShoppingDashboardPage.vue`: rename failures and relevant action success/error states.
   - `ListDetailPage.vue`: silent quantity/item/product edge cases.
   - `ProductDetailPage.vue`: observation/reminder save confirmation and invalid price feedback.
   - `ListsPage.vue`: delete/export feedback where appropriate.

4. Normalize user-facing message mapping.
   - Translate raw store errors into consistent French messages close to the triggering surface.
   - Keep destructive confirmation separate if introduced.

5. Add validation coverage.
   - Add targeted tests for notification state and migrated critical cases.
   - Run lint and relevant tests/type checks.

## Acceptance Criteria

- A single shared notification system exists and is used by the migrated flows.
- WebView non-product capture no longer depends on a one-off modal implementation.
- Import review cannot fail silently when the target list is invalid or missing.
- Session rename duplicate/empty errors are shown coherently to the user.
- The migrated list/product/detail actions no longer rely on silent no-op behavior for their chosen recoverable cases.
- Notification placement and styling remain coherent on the app's current mobile and desktop layouts.

## Test Strategy

Automated:

- targeted notification-store tests
- targeted page/store tests where already practical
- `pnpm eslint`
- `pnpm test:once <targeted files>`
- `pnpm typecheck:full` or, if pre-existing unrelated failures remain, the most targeted safe checks plus explicit note of the pre-existing blocker

Manual:

- trigger non-product WebView action
- trigger invalid import-review save path
- rename a session to an empty or duplicate value
- exercise quantity and observation flows on mobile-sized and desktop-sized layouts

## Risks

- Over-notifying can make the UI noisy if message thresholds are poorly chosen.
- Migrating too many flows at once can blur the distinction between inline form validation and transient action feedback.
- App-level overlay positioning can regress on mobile if the host is mounted in the wrong layer.

## Execution Notes

- Prefer a compact local architecture that matches existing Vue/Pinia patterns.
- Keep the first slice bounded to user-triggered feedback on current screens.
- Do not introduce OS-level notifications, background delivery, or new product promises.
- Treat this as a shared UX system, not a collection of patches.

## Open Questions

None.

## Implementation Result

`001-sf-build` implemented the first unified feedback slice on 2026-06-11.

Completed:

- Added a shared Pinia notification store in `src/stores/notifications.ts`.
- Added a global notification host in `src/components/AppNotifications.vue`, mounted from `src/App.vue`.
- Added shared notification styling in `src/styles.css`.
- Replaced the one-off WebView invalid-product popup path with shared notifications in `src/ui/temu-shell/App.vue`.
- Migrated fallback WebView capture feedback in `src/ui/temu-shell/components/NetworkWebviewHost.vue`.
- Migrated critical recoverable flows in:
  - `src/pages/ImportReviewPage.vue`
  - `src/pages/ShoppingDashboardPage.vue`
  - `src/pages/ListDetailPage.vue`
  - `src/pages/ProductDetailPage.vue`
  - `src/pages/ListsPage.vue`
- Added targeted notification-store tests in `src/stores/notifications.test.ts`.

Proof passed:

- `pnpm typecheck:full`
- `pnpm eslint` on the touched files
- `pnpm test:once src/stores/notifications.test.ts src/stores/shoppingSessions.test.ts src/utils/url.test.ts src/lib/importParser.test.ts`

Remaining proof:

- broader UX smoke if this slice is extended to the remaining non-migrated surfaces such as manual import, sync queue actions, and share-draft bootstrap messaging.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-11 07:25:00 UTC | 001-sf-build | GPT-5 Codex | Created ready spec for a unified in-app feedback system after the user escalated from a local WebView popup request to an app-wide durable notification architecture. | ready | /sf-start Unified in-app feedback and notifications |
| 2026-06-11 07:27:30 UTC | 001-sf-build | GPT-5 Codex + explorer subagent | Implemented the first shared notification slice with a global host, migrated critical WebView/import/list/product flows, and added targeted tests. | implemented | /sf-verify Unified in-app feedback and notifications |
| 2026-06-11 07:31:30 UTC | 103-sf-verify | GPT-5 Codex | Verified local correctness, lint, typecheck, and targeted tests for the unified feedback slice; local browser smoke remained unproven because Playwright Chromium is unavailable in this workspace. | partial | Browser/UI proof on the touched routes, then /104-sf-end Unified in-app feedback and notifications |
| 2026-06-11 07:34:30 UTC | 108-sf-browser | GPT-5 Codex | Attempted browser proof for the unified feedback slice, but Playwright MCP runtime preflight failed: configured Chromium executable path is missing, so browser evidence would be invalid. | blocked | /106-sf-fix BUG-2026-05-02-001, then rerun /108-sf-browser Unified in-app feedback and notifications |

## Current Chantier Flow

sf-spec ready -> sf-ready ready -> sf-start implemented -> sf-verify partial -> sf-end pending -> sf-ship pending
