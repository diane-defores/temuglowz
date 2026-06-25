# Tasks - temu

> Operational task records follow `$SHIPFLOW_ROOT/skills/references/operational-record-format.md`.

---

## Active

🔴 [temu] task: Finalize real Android share payload bridge | status: todo | area: android-share | id: TASK-2026-06-10-002 | next: implement native intent-to-import payload delivery | notes: required before Android share-target proof can move from partial to passed
🔴 [temu] task: Run real-device Android install and Temu share smoke test | status: todo | area: qa | id: TASK-2026-06-10-003 | next: install debug APK and execute TC-MANUAL-001 through TC-MANUAL-005 | notes: use GitHub Release APK while Actions artifact quota is full

---

## Completed

🟢 [temu] task: Spec the in-app Temu WebView capture mode | status: done | area: webview | id: TASK-2026-06-10-001 | next: /sf-verify Temu in-app WebView shopping sessions | notes: ready spec created and sf-start implementation recorded in shipflow_data/workflow/specs/temu-shopping-webview-sessions.md
🟢 [temu] task: Add WebView beta manual QA checklist | status: done | area: qa | id: TASK-2026-06-10-010 | notes: checklist created at shipflow_data/workflow/test-checklists/temu-shopping-webview-sessions.md; Android real-device scenarios remain NOT_RUN until APK/device proof
🟢 [temu] task: Audit and align product entitlements doctrine before sync or monetization | status: done | area: entitlements | id: TASK-2026-06-10-012 | next: closed | notes: suite-ledger decision, access allowlists, fail-closed contract, sync guardrails, entitlement checklist, README note, support runbook skeleton, and sf-verify are complete; provider-specific work remains blocked until provider spec and fresh docs

---

## Backlog

🟠 [temu] task: Add opt-in Temu browser beta without DOM injection | status: in_progress | area: webview | id: TASK-2026-06-10-004 | depends_on: TASK-2026-06-10-001 | notes: first implementation added Android plugin, Shopping dashboard, app-owned controls, no DOM injection; Android APK/device proof pending because local NDK clang has host-arch mismatch
🟠 [temu] task: Save current Temu WebView URL into manual import review | status: in_progress | area: webview | id: TASK-2026-06-10-005 | depends_on: TASK-2026-06-10-004 | notes: TS bridge/dashboard route valid WebView captures into import review with source=webview; Android native capture proof pending
🟠 [temu] task: Add visible WebView save overlay and quick list selector | status: in_progress | area: webview | id: TASK-2026-06-10-006 | depends_on: TASK-2026-06-10-004 | notes: native bottom bar capture and existing import-review list chooser implemented; direct quick chooser from WebView remains pending Android proof and UX verification
🟠 [temu] task: Prototype user-initiated product metadata extraction from current visible product page | status: blocked | area: webview | id: TASK-2026-06-10-007 | depends_on: TASK-2026-06-10-001 | notes: extract only after explicit user action; no background crawling, cookie capture, password capture, or hidden automation
🟠 [temu] task: Prototype visible cart capture into shopping lists | status: blocked | area: cart-import | id: TASK-2026-06-10-008 | depends_on: TASK-2026-06-10-007 | notes: highest-risk path; require real-device evidence and privacy review before implementation
🟡 [temu] task: Evaluate assistive theme and CSS injection guardrails | status: todo | area: webview | id: TASK-2026-06-10-009 | notes: only consider local readability/highlight helpers; never alter checkout meaning, pricing, shipping fees, warnings, or Temu identity
🟡 [temu] task: Review Temu affiliation, privacy, and platform policy risk before public distribution | status: todo | area: policy | id: TASK-2026-06-10-011 | notes: ensure app copy avoids implying Temu partnership and that WebView capture remains personal and user-initiated
🟡 [temu] task: Spec price and availability history for saved Temu products | status: todo | area: product-history | id: TASK-2026-06-10-013 | next: /sf-spec Price and availability history for Temu product snapshots | notes: deferred follow-up after premium multi-device sync; track observed price, availability, source URL, capture timestamp, and comparison UX without blocking the first cloud sync slice

---

## Audit Findings
<!-- Populated by /sf-audit with traffic-first task records when findings become tasks. -->
🟢 [temu] task: Align list detail, manual import, and sync pages with Settings design system | status: done | area: design-system | id: TASK-2026-06-11-503-001 | next: closed locally; ship blocked by unrelated dirty cloud-sync files | notes: implemented canonical page primitives, migrated ListDetailPage/ManualImportPage/SyncPage, added design-system authority, and captured desktop/mobile proof under shipflow_data/workflow/verification/temu-canonical-page-design-system-alignment
🟠 [temu] task: Enforce version-aware cloud sync conflict and tombstone handling in live paths | status: in_progress | area: cloud-sync | id: TASK-2026-06-12-401-001 | next: rerun authenticated multi-device sync proof to confirm stale push/delete rejection against hosted bridge and Convex | notes: local code now rejects stale server writes, skips stale remote upserts/tombstones during hydration, and covers those cases in sync tests; hosted authenticated proof still pending
🟠 [temu] task: Replace Convex auth token localStorage persistence with a more secure app-owned session path | status: in_progress | area: auth | id: TASK-2026-06-12-401-002 | next: prove Tauri/Android sign-in, refresh, and sign-out behavior with the native token store path | notes: Convex auth now routes Tauri token persistence through native commands backed by keyring storage and falls back to memory instead of localStorage if the bridge is unavailable; local tests/build pass, but host cargo proof is still blocked here by missing pkg-config/GTK tooling
🟠 [temu] task: Paginate cloud sync pulls and return a continuation cursor | status: todo | area: performance | id: TASK-2026-06-25-403-001 | next: spec or implement paginated hydration contract after backend/client sync API decision | notes: perf audit capped Convex sync reads at 500 records to prevent unbounded pulls, but full correctness for large accounts needs cursor pagination and client replay loops
🟡 [temu] task: Reduce static site hydration and asset weight | status: todo | area: performance | id: TASK-2026-06-25-403-002 | next: convert guide ProductCard islands to static Astro markup where no client interactivity is needed and replace oversized PNG portraits with responsive WebP/AVIF assets | notes: perf audit found guide pages hydrate every product card, load Lenis on all non-reduced-motion visits, and ship duplicate 736KB-1.6MB PNG portraits in public and site/public
