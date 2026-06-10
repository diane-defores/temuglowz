# Tasks - temu

> Operational task records follow `$SHIPFLOW_ROOT/skills/references/operational-record-format.md`.

---

## Active

🔴 [temu] task: Spec the in-app Temu WebView capture mode | status: todo | area: webview | id: TASK-2026-06-10-001 | next: /sf-spec In-app Temu WebView capture mode | notes: define opt-in browser, capture boundaries, privacy guardrails, validation, and scope exclusions before implementation
🔴 [temu] task: Finalize real Android share payload bridge | status: todo | area: android-share | id: TASK-2026-06-10-002 | next: implement native intent-to-import payload delivery | notes: required before Android share-target proof can move from partial to passed
🔴 [temu] task: Run real-device Android install and Temu share smoke test | status: todo | area: qa | id: TASK-2026-06-10-003 | next: install debug APK and execute TC-MANUAL-001 through TC-MANUAL-005 | notes: use GitHub Release APK while Actions artifact quota is full
🔴 [temu] task: Audit and align product entitlements doctrine before sync or monetization | status: todo | area: entitlements | id: TASK-2026-06-10-012 | next: /sf-spec Entitlements and access model for Temu Shopping Lists | notes: load product-entitlements-playbook; decide standalone vs suite ledger; do not add premium gates, quotas, activation codes, billing, or protected cloud data until server-owned entitlement contract exists

---

## Backlog

🟠 [temu] task: Add opt-in Temu browser beta without DOM injection | status: blocked | area: webview | id: TASK-2026-06-10-004 | depends_on: TASK-2026-06-10-001 | notes: first version should load Temu as a browser surface and expose only app-owned controls outside the page
🟠 [temu] task: Save current Temu WebView URL into manual import review | status: blocked | area: webview | id: TASK-2026-06-10-005 | depends_on: TASK-2026-06-10-004 | notes: preserve share/manual fallback and require user confirmation before snapshot save
🟠 [temu] task: Add visible WebView save overlay and quick list selector | status: blocked | area: webview | id: TASK-2026-06-10-006 | depends_on: TASK-2026-06-10-004 | notes: overlay must clearly belong to our app and must not obscure Temu prices, warnings, checkout, fees, or product claims
🟠 [temu] task: Prototype user-initiated product metadata extraction from current visible product page | status: blocked | area: webview | id: TASK-2026-06-10-007 | depends_on: TASK-2026-06-10-001 | notes: extract only after explicit user action; no background crawling, cookie capture, password capture, or hidden automation
🟠 [temu] task: Prototype visible cart capture into shopping lists | status: blocked | area: cart-import | id: TASK-2026-06-10-008 | depends_on: TASK-2026-06-10-007 | notes: highest-risk path; require real-device evidence and privacy review before implementation
🟡 [temu] task: Evaluate assistive theme and CSS injection guardrails | status: todo | area: webview | id: TASK-2026-06-10-009 | notes: only consider local readability/highlight helpers; never alter checkout meaning, pricing, shipping fees, warnings, or Temu identity
🟡 [temu] task: Add WebView beta manual QA checklist | status: todo | area: qa | id: TASK-2026-06-10-010 | notes: include login boundary, no credential capture, URL capture, snapshot persistence, share fallback, and blocked/removed product behavior
🟡 [temu] task: Review Temu affiliation, privacy, and platform policy risk before public distribution | status: todo | area: policy | id: TASK-2026-06-10-011 | notes: ensure app copy avoids implying Temu partnership and that WebView capture remains personal and user-initiated

---

## Audit Findings
<!-- Populated by /sf-audit with traffic-first task records when findings become tasks. -->
