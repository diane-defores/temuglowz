---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
project: "temu"
created: "2026-06-11"
created_at: "2026-06-11 12:49:18 UTC"
updated: "2026-06-11"
updated_at: "2026-06-11 14:03:03 UTC"
status: ready
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "canonical page design-system alignment"
owner: "Diane"
confidence: high
user_story: "En tant qu'utilisatrice de Temu Shopping Lists, je veux que les pages liste, import manuel et synchronisation gardent le même design que Paramètres, afin que l'app reste cohérente, jolie et agréable quand je consulte mes listes."
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - "src/router/index.ts"
  - "src/App.vue"
  - "src/styles.css"
  - "src/ui/temu-shell/style.css"
  - "src/ui/temu-shell/components/MobileSettingsSheet.vue"
  - "src/pages/ListDetailPage.vue"
  - "src/pages/ManualImportPage.vue"
  - "src/pages/SyncPage.vue"
  - "shipflow_data/technical/design-system-authority.md"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-socialglow-ui-copy-migration.md"
    artifact_version: "1.0.2"
    required_status: ready
  - artifact: "shipflow_data/workflow/specs/temu-home-shopping-lists-redesign.md"
    artifact_version: "1.2.0"
    required_status: implemented
  - artifact: "shipflow_data/technical/apps/temu-shopping-lists-android-app.md"
    artifact_version: "1.0.10"
    required_status: draft
  - artifact: "shipflow_data/technical/code-docs-map.md"
    artifact_version: "1.0.1"
    required_status: draft
  - artifact: "shipflow_data/technical/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: active
supersedes: []
evidence:
  - "503-sf-audit-design-tokens found standalone routes /list/:listId, /import/manual, and /sync bypassing the canonical temu-shell visual system."
  - "503-sf-audit-design-tokens found src/styles.css legacy classes with hardcoded blue/gray scaffold values."
  - "User decision 2026-06-11: the Settings page is the canonical SocialGlow-inspired design."
  - "User feedback 2026-06-11: previous compact home design was more effective but had become less beautiful; visual coherence matters as much as efficiency."
next_step: "/005-sf-ship blocked until unrelated cloud-sync worktree changes are isolated or authorized"
---

# Title

Temu Canonical Page Design-System Alignment

## Status

Implemented locally and verified with automated checks plus browser screenshots. This spec migrated the visible list detail, manual import, and synchronization pages onto the SocialGlow-derived Settings design system. This work was UI/layout only and did not change list data semantics, import parsing, account auth, entitlement behavior, cloud sync backend behavior, or native WebView bridge contracts.

## User Story

En tant qu'utilisatrice de Temu Shopping Lists, je veux que les pages liste, import manuel et synchronisation gardent le même design que Paramètres, afin que l'app reste cohérente, jolie et agréable quand je consulte mes listes.

Primary actor: local-first Temu Shopping Lists user.

Trigger: the user opens a shopping list such as `Cuisine`, opens manual import, or opens synchronization from the home shell or Settings sheet.

Observable result: each route keeps the same SocialGlow-inspired visual language as Settings: compact cards, section labels, tokenized surfaces, rounded actions, warm primary color, coherent dark mode, and no legacy blue scaffold page.

## Minimal Behavior Contract

The app accepts the existing routes and domain state for list details, manual import, and synchronization, then renders those screens through shared `temu-shell` design-system primitives instead of the legacy `.panel` scaffold. Successful user actions keep their current behavior: list quantity changes, product open/remove, manual URL parsing, account sign-in/sign-up, sign-out, and local queue clearing. If data is missing or an action fails, the route shows a recoverable Settings-style error/empty state without silently changing local data. The easy-to-miss edge case is direct navigation to a migrated route before visiting `/`: the page must still get canonical tokens and dark-mode behavior, not render as the old global blue scaffold.

## Success Behavior

- Given a user opens `Cuisine`, when the list exists, then the page uses the canonical page shell, shows a compact header, item cards, observation badges, quantity controls, and product/remove actions with Settings-style cards and token colors.
- Given a saved product snapshot is missing, when the list detail renders, then the page shows a tokenized danger/recoverable card and still allows returning without crashing.
- Given a user opens import manual, when they paste a Temu URL, then the page uses a canonical form card and keeps the existing route to import review.
- Given a user opens synchronization, when auth or entitlement is unavailable, then the page presents the state in canonical cards and status pills without visually switching to the old blue scaffold.
- Given dark mode is enabled from Settings, when the user opens any migrated route, then surfaces and text use the same `html.dark` token set as the shell.
- Given the user opens a migrated route directly, when the app boots, then the base route still has the canonical variables available.

## Error Behavior

- Missing list: show a canonical empty/error state with a return action; do not create or mutate lists.
- Missing product snapshot: show a canonical danger state for that item; do not remove it automatically.
- Invalid manual URL: keep the existing parser error but render it with canonical error styling.
- Sync auth failure: keep the current local data readable and show the existing error text in canonical form styling.
- Empty sync queue: show a tokenized empty state; do not claim cloud sync is active.

## Problem

The app's Settings page already reflects the intended SocialGlow-inspired design system, but list detail, manual import, and sync routes are still standalone legacy pages. They use `src/styles.css` scaffold classes such as `.panel`, `.item-card`, `.notice`, `.sync-onboarding-card`, and global blue buttons. This creates a visible product break exactly when the user opens the core object of the app: a shopping list.

## Solution

Declare `temu-shell` as the design-system authority, extend `src/ui/temu-shell/style.css` with reusable page primitives, and migrate the three routes to those primitives. Keep business logic intact while replacing legacy classes and inline visual styles with shared canonical classes and CSS variables.

## Scope In

- Add `shipflow_data/technical/design-system-authority.md`.
- Extend `src/ui/temu-shell/style.css` with page shell, content cards, form fields, status pills, action groups, empty states, and item/list detail primitives using existing or newly named design-system variables.
- Ensure `src/ui/temu-shell/style.css` is imported globally enough for standalone routes.
- Migrate `src/pages/ListDetailPage.vue` to canonical page primitives.
- Migrate `src/pages/ManualImportPage.vue` to canonical page primitives.
- Migrate `src/pages/SyncPage.vue` to canonical page primitives.
- Remove inline visual styles from the migrated pages.
- Add visual verification screenshots for list detail, manual import, and sync on desktop/mobile where feasible.

## Scope Out

- Changing shopping-list store semantics, item quantity rules, snapshot data, or sync queue behavior.
- Implementing real cloud sync, entitlement bridge changes, Convex schema/function changes, or auth provider changes.
- Reworking `ImportReviewPage.vue`, `ProductDetailPage.vue`, or `ListsPage.vue` unless required for shared CSS import safety.
- Native Android WebView bottom-bar changes or real-device proof.
- Full DTCG token file creation or design-token playground.
- Committing or pushing unrelated dirty cloud-sync work.

## Constraints

- The canonical visual source is `src/ui/temu-shell/style.css`, with Settings as component reference.
- Do not introduce raw visual values in page files; new visual decisions belong in shared style classes or CSS variables.
- Preserve French user-facing copy, with accents where touched.
- Preserve local-first behavior and fail-closed sync wording.
- Keep desktop and mobile layouts compact and readable.
- Do not hide core list content behind a menu or modal.

## Test Contract

Surface: Vue 3 + Vite + Pinia app routes using shared CSS design-system primitives.

Proof profile: evidence-first UI migration with automated checks, design-system drift scan, and browser visual proof.

Proof order:
1. Design-system drift scan on changed UI files.
2. Typecheck and lint.
3. Production build.
4. Browser screenshots for migrated routes at desktop and mobile widths.

Required scenario IDs:
- `TC-DESIGN-001`: list detail route renders with canonical page shell and item cards.
- `TC-DESIGN-002`: manual import route renders with canonical form styling and still routes valid URLs to import review.
- `TC-DESIGN-003`: sync route renders canonical auth/status/queue states without legacy blue scaffold.
- `TC-DESIGN-004`: dark mode class uses shared tokens on migrated routes.
- `TC-DESIGN-005`: direct route navigation has canonical CSS variables available before visiting `/`.

Required results:
- `python3 /home/claude/shipflow/tools/design_system_drift_check.py --changed --format markdown` reports no unapproved drift for changed UI files.
- `pnpm typecheck:full`, `pnpm lint:check`, and `pnpm build` pass or failures are reported with exact scope.
- Browser proof shows no blank page, obvious overlap, hidden primary content, or old blue scaffold for the migrated routes.
- Route screenshots:
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/list-detail-desktop.png`
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/list-detail-mobile.png`
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/manual-import-desktop.png`
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/manual-import-mobile.png`
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/sync-desktop.png`
  - `shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment/sync-mobile.png`

Exception with proof:
- Android device proof is not required because this is Vue route styling only and does not change native WebView behavior.

Exception without proof:
- None.

## Dependencies

- `src/App.vue` root and router outlet.
- `src/router/index.ts` standalone page routes.
- `src/ui/temu-shell/style.css` existing canonical tokens and Settings classes.
- `src/ui/temu-shell/components/MobileSettingsSheet.vue` canonical Settings reference.
- `src/stores/shoppingLists.ts`, `src/stores/productSnapshots.ts`, and `src/stores/productObservations.ts` existing list/detail data.
- `src/lib/cloudSync.ts`, `src/lib/cloudSyncQueue.ts`, and `src/lib/convexAuth.ts` existing sync page behavior.
- Fresh external docs: not needed; this is a local Vue/CSS refactor using existing APIs.

## Invariants

- List creation, deletion, item quantity, item removal, duplicate detection, and product opening behavior remain unchanged.
- Manual import parsing and review route behavior remain unchanged.
- Sync auth, sign-out, local queue, entitlement-blocked copy, and fail-closed behavior remain unchanged.
- Existing notifications remain active through `AppNotifications`.
- Dark mode remains controlled by the shopping sessions store and `html.dark`.
- No Temu account/session/cookie/browser-profile data enters sync or diagnostics.

## Links & Consequences

- `src/main.ts` currently imports `src/styles.css` globally; standalone migrated routes need access to canonical `temu-shell` styles as well.
- `src/styles.css` can remain for notification and compatibility styles, but migrated route templates should no longer rely on `.panel`, `.item-card`, `.notice`, `.sync-onboarding-card`, `.link-btn`, or global blue `button` styles.
- `shipflow_data/technical/code-docs-map.md` already maps `src/**` UI/state changes to the app technical doc.
- The task created by audit 503 should be marked done after verified implementation.

## Documentation Coherence

Update `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` with the design-system authority and migrated route status. README changes are not required because no public setup, product promise, billing, or Android behavior changes.

## Edge Cases

- Direct navigation to `#/list/<id>`, `#/import/manual`, or `#/sync` before visiting the shell.
- Missing list id or deleted list after route load.
- Product item points to a missing snapshot.
- Long list names, long product titles, and long URLs.
- Empty list, empty sync queue, and auth unavailable.
- Mobile viewport action wrapping without overlapping text or buttons.

## Implementation Tasks

- [ ] Task 1: Wire the canonical style layer globally.
  - Files: `src/main.ts`, `src/ui/temu-shell/style.css`
  - Action: import the canonical style layer for standalone routes and ensure base tokens are available outside `.temu-shell`.
  - User story link: prevents direct routes from rendering outside the canonical system.
  - Validate with: direct browser route screenshot.

- [ ] Task 2: Add shared page primitives to the design-system source.
  - File: `src/ui/temu-shell/style.css`
  - Action: add reusable classes for canonical pages, headers, cards, forms, action groups, compact status pills, empty/error states, item cards, and page back/action buttons using CSS variables.
  - User story link: pages can look like Settings without page-local hardcoded styles.
  - Validate with: design-system drift scan.

- [ ] Task 3: Migrate shopping list detail.
  - File: `src/pages/ListDetailPage.vue`
  - Action: replace legacy panel/card/action classes and inline styles with canonical page primitives; keep data/actions unchanged.
  - User story link: opening `Cuisine` stays in the Settings/SocialGlow visual system.
  - Validate with: `TC-DESIGN-001`.

- [ ] Task 4: Migrate manual import.
  - File: `src/pages/ManualImportPage.vue`
  - Action: render the URL textarea, action buttons, success, and error states with canonical form/page classes.
  - User story link: import fallback no longer feels like a different app.
  - Validate with: `TC-DESIGN-002`.

- [ ] Task 5: Migrate synchronization.
  - File: `src/pages/SyncPage.vue`
  - Action: render status, entitlement notice, account form, queue rows, and empty state with canonical cards, forms, pills, and actions while preserving fail-closed copy.
  - User story link: sync becomes coherent with Settings account controls.
  - Validate with: `TC-DESIGN-003`.

- [ ] Task 6: Update docs and tracker.
  - Files: `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`, `shipflow_data/workflow/TASKS.md`, current spec.
  - Action: record design-system authority, mark the audit task done after verification, and update run history.
  - User story link: keeps future agents from reintroducing the second design system.
  - Validate with: metadata/doc lint where applicable.

## Acceptance Criteria

- List detail, manual import, and sync pages no longer render with the old blue `.panel` scaffold.
- Migrated page templates do not contain inline visual `style` attributes.
- Migrated page templates consume shared canonical classes from `src/ui/temu-shell/style.css`.
- Dark mode and direct route entry keep canonical tokens available.
- Existing user actions and data behavior remain unchanged.
- Design-system drift scan, typecheck, lint, build, and browser visual proof complete.
- The 503 audit task is closed or updated with implementation evidence.

## Test Strategy

Use `evidence-first` because the primary risk is visual/product coherence. Run token drift checks first, then local code checks, then browser screenshots. Use seeded default `Cuisine` list for the list-detail route. If no product exists, verify the empty state and missing-data states rather than creating data migrations.

## Risks

- Medium visual regression risk if global `src/styles.css` button rules override canonical buttons. Mitigation: use specific canonical classes and import order.
- Medium direct-route risk if `temu-shell` CSS was previously only imported by the shell component. Mitigation: import canonical CSS in `src/main.ts`.
- Low behavior risk if template refactor accidentally changes click handlers. Mitigation: preserve script logic and run typecheck/browser smoke.
- Low docs drift risk if the new design-system authority is not recorded. Mitigation: create/update `shipflow_data/technical/design-system-authority.md`.

## Execution Notes

Read first:
- `src/main.ts`
- `src/App.vue`
- `src/ui/temu-shell/style.css`
- `src/ui/temu-shell/components/MobileSettingsSheet.vue`
- `src/pages/ListDetailPage.vue`
- `src/pages/ManualImportPage.vue`
- `src/pages/SyncPage.vue`
- `src/styles.css`

Implementation approach:
- Put new visual primitives in `src/ui/temu-shell/style.css`.
- Avoid page-scoped `<style>` blocks for this migration.
- Keep page script logic stable unless TypeScript requires a tiny helper for display copy.
- Use PrimeIcons already present in the app.
- Do not edit unrelated cloud-sync backend files currently dirty in the worktree.

Validation commands:
- `python3 /home/claude/shipflow/tools/design_system_drift_check.py --changed --format markdown`
- `pnpm typecheck:full`
- `pnpm lint:check`
- `pnpm build`

Stop conditions:
- Stop if a page migration requires changing sync/auth/list store behavior.
- Stop if design-system source cannot be imported globally without broad side effects.
- Stop if validation failures come from unrelated dirty cloud-sync work and cannot be isolated safely.

Implementation notes from 2026-06-11:
- `src/main.ts` imports the canonical style layer globally and applies `html.dark` from the persisted sessions setting, so standalone routes do not need to visit `/` first.
- `src/ui/temu-shell/style.css` now owns canonical page primitives used by migrated routes.
- `src/pages/ListDetailPage.vue`, `src/pages/ManualImportPage.vue`, and `src/pages/SyncPage.vue` no longer use `.panel` or inline visual style attributes.
- Design-system drift scan still reports existing and new candidates in `src/ui/temu-shell/style.css` because the current checker flags the declared design-system authority file itself. The migrated page files passed the targeted local-literal scan.
- Ship is blocked in this run because the worktree contains unrelated cloud-sync/backend changes outside this chantier's staging scope.

## Open Questions

None.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-11 12:49:18 UTC | 100-sf-spec | GPT-5 Codex | Created spec from 503 audit and user decision that Settings is canonical. | draft | /101-sf-ready Temu canonical page design-system alignment |
| 2026-06-11 12:51:24 UTC | 101-sf-ready | GPT-5 Codex | Validated user story alignment, design-system authority, bounded UI scope, proof path, and open questions. | ready | /102-sf-start Temu canonical page design-system alignment |
| 2026-06-11 14:03:03 UTC | 001-sf-build | GPT-5 Codex | Orchestrated spec, implementation, local checks, design-system evidence, docs update, and browser screenshots. | partial | /005-sf-ship blocked until unrelated cloud-sync worktree changes are isolated or authorized |
| 2026-06-11 14:03:03 UTC | 102-sf-start | GPT-5 Codex | Implemented global canonical style import, bootstrap dark-mode class, shared page primitives, and migrated list detail/manual import/sync pages. | implemented | /103-sf-verify Temu canonical page design-system alignment |
| 2026-06-11 14:03:03 UTC | 103-sf-verify | GPT-5 Codex | Verified typecheck, lint, build, targeted page literal scan, metadata lint, and desktop/mobile browser screenshots. | verified | /104-sf-end local docs/task closure complete; ship blocked by unrelated dirty files |

## Current Chantier Flow

100-sf-spec ready -> 101-sf-ready ready -> 102-sf-start implemented -> 103-sf-verify verified -> 104-sf-end local docs/task closure complete -> 005-sf-ship blocked by unrelated dirty files
