---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.2.0"
project: "temu"
created: "2026-06-11"
created_at: "2026-06-11 10:53:34 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 11:37:29 UTC"
status: reviewed
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "home screen shopping lists redesign"
owner: "Diane"
confidence: high
user_story: "En tant qu'acheteur Temu, je veux voir mes listes shopping des l'ouverture de l'application, afin de reprendre rapidement mes produits sauvegardes sans chercher l'entree dans un menu."
risk_level: "medium"
security_impact: "none"
docs_impact: "none"
linked_systems:
  - "app/src/ui/temu-shell/components/MobileLayout.vue"
  - "app/src/ui/temu-shell/components/AppSidebar.vue"
  - "app/src/ui/temu-shell/style.css"
  - "app/src/stores/shoppingLists.ts"
  - "app/src/stores/shoppingSessions.ts"
  - "Vue Router"
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.0"
    required_status: "ready"
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "reviewed"
  - artifact: "shipglowz_data/technical/apps/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.10"
    required_status: "draft"
supersedes: []
evidence:
  - "User request 2026-06-11: shopping lists should not remain hidden behind a menu; they should be a section like shopping sessions."
  - "User request 2026-06-11: the create shopping session widget takes too much space; creation should be a plus action near the related section."
  - "Code inspection found the real home surface in app/src/ui/temu-shell/components/MobileLayout.vue and desktop list/session navigation in AppSidebar.vue."
next_step: "/104-sg-end Remasteriser l'accueil autour des listes shopping"
---

# Title

Temu Home Shopping Lists Redesign

## Status

Implemented locally. This is a bounded UI redesign of the app home shell. It does not change import parsing, saved product data, cloud sync, entitlement gates, native WebView bridge behavior, or Temu policy posture.

## User Story

En tant qu'acheteur Temu, je veux voir mes listes shopping des l'ouverture de l'application, afin de reprendre rapidement mes produits sauvegardes sans chercher l'entree dans un menu.

Primary actor: local-first Temu Shopping Lists user.

Trigger: the user opens the app home shell on mobile or desktop.

Observable result: shopping lists are visible as a first-class home section with compact cards and a nearby create action; sessions remain accessible in a compact section with a nearby create action.

## Minimal Behavior Contract

The home shell accepts the existing local shopping-list and shopping-session state and renders shopping lists as the primary content section, with a compact `+` action that creates a new list through a small inline form, while sessions are shown below with their own compact `+` action instead of a large create widget. If list creation fails because the name is empty or duplicated, the error remains visible near the form and no partial list is created. The easy-to-miss edge case is that a first-time user with only seeded/default data still needs a visible list entry and a recoverable way to add the first custom list without opening a hidden menu.

## Success Behavior

- Given existing lists, when the user opens the app home, then `Listes shopping` appears before sessions with list names, item counts, and a link to open each list.
- Given the user taps the `+` next to `Listes shopping`, when they enter a valid list name and submit, then the list is created and the user is routed to that list detail.
- Given the user taps the `+` next to `Sessions shopping`, when no custom name is required, then a new auto-named session opens through the existing WebView/session flow.
- Given desktop sidebar navigation is visible, when the user scans the sidebar, then shopping lists appear as their own section instead of only as a generic tools link.
- Given no sessions exist, when the user opens home, then the empty state remains compact and offers a `+` create action.

## Error Behavior

- Empty list name: the create form stays open, no list is created, and the existing store error text is shown in French near the form.
- Duplicate list name: the create form stays open, no list is created, and the duplicate-name error is shown near the form.
- Missing saved product snapshot in the home summary: the card shows a neutral fallback instead of crashing.
- WebView degraded mode: the existing degraded status remains visible on the sessions section and does not block list access.

## Problem

The app is primarily a shopping-list archive, but the current home layout makes sessions visually dominant and hides lists behind menu/quick-action navigation. The large create-session widget also consumes first-screen space that should help users resume saved lists.

## Solution

Rebalance the home shell so lists are the first viewport signal, with compact create/open affordances. Keep sessions as a secondary home section, remove the oversized create-session card, and update desktop sidebar navigation so lists are a peer section rather than a hidden tools entry.

## Scope In

- `app/src/ui/temu-shell/components/MobileLayout.vue`: home hierarchy, list section, compact list creation, compact session creation, utility links.
- `app/src/ui/temu-shell/components/AppSidebar.vue`: first-class shopping-list sidebar section and list creation shortcut.
- `app/src/ui/temu-shell/style.css`: responsive layout, list cards, icon buttons, compact empty states, sidebar list styling.
- Local proof using typecheck/build and browser screenshots for desktop/mobile home.

## Scope Out

- Changes to list detail CRUD beyond opening existing routes.
- Product import parser, product snapshot model, cloud sync, Convex, entitlements, backup export, WebView native plugin behavior.
- New global design system or token migration.
- Native Android device proof; this refactor is shared Vue shell UI only.
- Public marketing copy or Temu affiliation claims.

## Constraints

- Preserve local-first behavior and existing Pinia stores.
- Do not add new dependencies.
- Use existing PrimeIcons and CSS token variables.
- Keep target actions reachable with accessible button labels.
- Keep the first viewport compact on mobile: no large session-create card.
- Do not display lists as only a generic menu item.

## Test Contract

Surface: Vue 3 + Vite + Pinia shell UI.

Proof profile: evidence-first UI work with local automated checks and browser visual proof.

Checklist path: none; no native-only behavior is changed.

Required scenario IDs:

- `TC-HOME-001`: typecheck passes.
- `TC-HOME-002`: production build passes.
- `TC-HOME-003`: desktop home screenshot shows `Listes shopping` before `Sessions shopping`.
- `TC-HOME-004`: mobile-width home screenshot shows lists as first primary content and session creation as compact `+`, not a large form panel.

Required results:

- All local checks pass or failures are reported with scope impact.
- Browser proof confirms no obvious overlap, blank content, or hidden primary list section.

Exception with proof:

- Android device proof is not required because no native plugin, share target, WebView bridge, or Android-only layout contract changes.

Exception without proof:

- None.

## Dependencies

- Vue Router route names `list-detail`, `manual-import`, and `sync`.
- `useShoppingListsStore` existing create/list item APIs.
- `useShoppingSessionsStore` existing session creation/open flow.
- Fresh external docs: not needed; this is a local Vue component/style refactor using existing APIs.

## Invariants

- Saved lists and items are not mutated except through explicit user list creation.
- Session creation still uses the existing store and `open-session` event.
- Invalid list creation never creates a partial list.
- Existing default list seeding remains available.
- Temu non-affiliation copy remains visible on home.

## Links & Consequences

- Desktop shell uses `MobileLayout.vue` inside `AppRightSidebar`, so the same home hierarchy must work in desktop content and mobile full-screen modes.
- `AppSidebar.vue` must expose lists as a section because desktop users may rely on sidebar navigation instead of the mobile content cards.
- `App.vue` already syncs shopping list summaries to native WebView; list creation through the home store path should continue to update that computed sync.

## Documentation Coherence

No README, support, pricing, or public docs update is required because this is an internal UI hierarchy change with no new product promise or configuration requirement.

## Edge Cases

- Seeded/default list exists only after store initialization.
- Long list names and long last-product titles must truncate without layout shift.
- Empty sessions state must not reintroduce a large creation panel.
- Duplicate or empty list creation must remain recoverable.
- Sidebar icon-only mode must still keep list/session shortcuts usable by title/label.

## Implementation Tasks

- [x] Task 1: Move home list state into the shell home component.
  - File: `app/src/ui/temu-shell/components/MobileLayout.vue`
  - Action: import list/product/notification/router dependencies, initialize default lists, compute list summaries, and add create-list form state.
  - User story link: makes saved lists visible immediately on app open.
  - Depends on: none.
  - Validate with: `pnpm typecheck`.

- [x] Task 2: Redesign the home template hierarchy.
  - File: `app/src/ui/temu-shell/components/MobileLayout.vue`
  - Action: remove the large session creation panel, render `Listes shopping` first with cards and a compact `+`, render sessions second with compact `+`, and keep import/sync as secondary utility actions.
  - User story link: lists become the home center instead of a hidden menu destination.
  - Depends on: Task 1.
  - Validate with: browser screenshot at desktop and mobile widths.

- [x] Task 3: Promote lists in desktop sidebar.
  - File: `app/src/ui/temu-shell/components/AppSidebar.vue`
  - Action: add a `Listes shopping` section above sessions with list links and a compact create-list button, and remove `Listes shopping` from generic tools.
  - User story link: desktop users can reach lists directly without scanning tools.
  - Depends on: Task 1 pattern.
  - Validate with: `pnpm typecheck` and desktop screenshot.

- [x] Task 4: Adjust shell styles.
  - File: `app/src/ui/temu-shell/style.css`
  - Action: add responsive list card, compact create row, icon section actions, and sidebar list styles using existing CSS variables.
  - User story link: keeps the home compact and readable.
  - Depends on: Tasks 2 and 3.
  - Validate with: desktop/mobile browser proof.

## Acceptance Criteria

- Home shows `Listes shopping` before `Sessions shopping`.
- A `+` beside `Listes shopping` opens a compact list create form and successful submit opens the created list.
- A `+` beside `Sessions shopping` creates and opens a session through the existing session flow.
- No large "Créer une session shopping" panel remains on the home first screen.
- Desktop sidebar has a dedicated shopping-list section.
- Import manual and sync remain reachable as secondary actions.
- Typecheck and build pass.

## Test Strategy

Use `evidence-first` because this is UI hierarchy work. Run `pnpm typecheck`, `pnpm build`, then start the local Vite dev server and capture desktop/mobile screenshots with Playwright. Inspect console errors and visible layout around the home first viewport.

## Risks

- Medium UX risk: creating a list from a compact form could hide validation errors if the form collapses too aggressively. Mitigation: keep the form open on failure and place the error locally.
- Medium regression risk: default list seeding previously happened in `ListsPage.vue`; home must initialize defaults before rendering list summaries.
- Low technical risk: CSS changes are scoped to the existing shell classes and use existing variables.

## Implementation Result

Implemented on 2026-06-11:

- `app/src/ui/temu-shell/components/MobileLayout.vue` now renders `Listes shopping` as the first home section with compact list cards, local list creation, and manual import/sync as secondary actions.
- `app/src/ui/temu-shell/components/AppSidebar.vue` now exposes a dedicated `Listes shopping` section with list links and a create-list shortcut above sessions.
- `app/src/ui/temu-shell/components/AppHeader.vue` now describes the app as lists and sessions instead of sessions only.
- `app/src/ui/temu-shell/style.css` now supports compact home sections, list cards, utility actions, and sidebar list counts.
- Follow-up polish on 2026-06-11 restored a softer premium visual treatment while preserving the compact hierarchy: warmer page background, gradient list icons, softer cards, quieter empty-state action, and refined utility buttons.

Validation evidence:

- `pnpm typecheck`
- `pnpm build`
- `pnpm typecheck:full`
- `pnpm lint:check`
- `git diff --check`
- Desktop screenshot: `shipglowz_data/workflow/verification/temu-home-shopping-lists-redesign/desktop.png`
- Mobile screenshot: `shipglowz_data/workflow/verification/temu-home-shopping-lists-redesign/mobile.png`

## Execution Notes

- Read `MobileLayout.vue`, `AppSidebar.vue`, `style.css`, `shoppingLists.ts`, and `shoppingSessions.ts` before editing.
- Do not add a new dependency or a new app route.
- Prefer existing PrimeIcons (`pi-plus`, `pi-list`, `pi-shopping-cart`, `pi-link`, `pi-cloud-upload`).
- Keep visible French copy natural and accented.
- Stop if list creation would require changing store semantics or data migrations.

## Open Questions

None.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-11 10:53:34 UTC | 100-sf-spec | GPT-5 Codex | Created bounded ready spec for home redesign from user request and code inspection. | ready | /102-sf-start Remasteriser l'accueil autour des listes shopping |
| 2026-06-11 10:53:34 UTC | 101-sf-ready | GPT-5 Codex | Validated scope as local Vue shell UI, checked required sections, proof path, security impact, and open questions. | ready | /102-sf-start Remasteriser l'accueil autour des listes shopping |
| 2026-06-11 10:59:46 UTC | 006-sf-design | GPT-5 Codex | Implemented compact home redesign, promoted shopping lists in home/sidebar, and ran local UI proof. | implemented | /104-sf-end Remasteriser l'accueil autour des listes shopping |
| 2026-06-11 10:59:46 UTC | 103-sf-verify | GPT-5 Codex | Verified local checks and browser screenshots for desktop/mobile shell hierarchy. | verified | /104-sf-end Remasteriser l'accueil autour des listes shopping |
| 2026-06-11 11:37:29 UTC | 006-sf-design | GPT-5 Codex | Applied visual polish after user feedback: restored softer depth and more coherent card/action styling while preserving compact list-first IA. | implemented | /103-sf-verify Remasteriser l'accueil autour des listes shopping |
| 2026-06-11 11:37:29 UTC | 103-sf-verify | GPT-5 Codex | Re-ran local checks, build, diff whitespace check, and desktop/mobile browser screenshots for the polished home UI. | verified | /104-sf-end Remasteriser l'accueil autour des listes shopping |

## Current Chantier Flow

100-sf-spec done -> 101-sf-ready ready -> 102-sf-start implemented -> 103-sf-verify verified -> 104-sf-end pending -> 005-sf-ship pending
